-- Migration: Add Document Table Management Functions
-- Description: Creates functions for dynamic document table creation and management

-- Function to create a new document table
CREATE OR REPLACE FUNCTION create_document_table(
    p_database_id UUID,
    p_document_id UUID,
    p_table_name VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_table_name VARCHAR(255);
    v_sql TEXT;
BEGIN
    -- Sanitize table name (remove special characters, prefix with doc_)
    v_table_name := 'doc_' || regexp_replace(lower(p_table_name), '[^a-z0-9_]', '_', 'g');
    
    -- Ensure table name is unique
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = v_table_name
    ) THEN
        v_table_name := v_table_name || '_' || substring(p_document_id::text, 1, 8);
    END IF;
    
    -- Create the document table
    v_sql := format('
        CREATE TABLE public.%I (
            block_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            block_type VARCHAR(50) NOT NULL,
            content JSONB NOT NULL,
            order_index INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()),
            created_by UUID,
            metadata JSONB DEFAULT ''{}''::jsonb,
            CONSTRAINT check_block_type CHECK (block_type IN (''text'', ''code'', ''reference'', ''heading'', ''list'', ''table'', ''image''))
        )', v_table_name);
    
    EXECUTE v_sql;
    
    -- Create indexes
    EXECUTE format('CREATE INDEX idx_%I_order ON public.%I(order_index)', v_table_name, v_table_name);
    EXECUTE format('CREATE INDEX idx_%I_type ON public.%I(block_type)', v_table_name, v_table_name);
    EXECUTE format('CREATE INDEX idx_%I_updated ON public.%I(updated_at)', v_table_name, v_table_name);
    
    -- Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table_name);
    
    -- Create RLS policies based on document permissions
    EXECUTE format('
        CREATE POLICY "View blocks based on document permissions" ON public.%I
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.document_metadata dm
                WHERE dm.doc_id = %L
                AND (
                    dm.is_public = true
                    OR dm.created_by = auth.uid()
                    OR auth.uid() = ANY((dm.permissions->>''editors'')::uuid[])
                    OR auth.uid() = ANY((dm.permissions->>''viewers'')::uuid[])
                )
            )
        )', v_table_name, p_document_id);
    
    EXECUTE format('
        CREATE POLICY "Edit blocks based on document permissions" ON public.%I
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.document_metadata dm
                WHERE dm.doc_id = %L
                AND (
                    dm.created_by = auth.uid()
                    OR auth.uid() = ANY((dm.permissions->>''editors'')::uuid[])
                )
            )
        )', v_table_name, p_document_id);
    
    -- Add trigger for updated_at
    EXECUTE format('
        CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    ', v_table_name, v_table_name);
    
    -- Update document metadata with actual table name
    UPDATE public.document_metadata 
    SET table_name = v_table_name,
        updated_at = timezone('utc'::text, now())
    WHERE doc_id = p_document_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating document table: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to drop a document table
CREATE OR REPLACE FUNCTION drop_document_table(
    p_document_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_table_name VARCHAR(255);
BEGIN
    -- Get table name from metadata
    SELECT table_name INTO v_table_name
    FROM public.document_metadata
    WHERE doc_id = p_document_id;
    
    IF v_table_name IS NULL THEN
        RAISE NOTICE 'Document not found: %', p_document_id;
        RETURN FALSE;
    END IF;
    
    -- Drop the table
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', v_table_name);
    
    -- Delete metadata
    DELETE FROM public.document_metadata WHERE doc_id = p_document_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping document table: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to copy a document (duplicate)
CREATE OR REPLACE FUNCTION copy_document(
    p_source_doc_id UUID,
    p_new_name VARCHAR(255),
    p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
    v_new_doc_id UUID;
    v_source_table VARCHAR(255);
    v_new_table VARCHAR(255);
    v_database_id UUID;
BEGIN
    -- Generate new document ID
    v_new_doc_id := gen_random_uuid();
    
    -- Get source document info
    SELECT table_name, database_id 
    INTO v_source_table, v_database_id
    FROM public.document_metadata
    WHERE doc_id = p_source_doc_id;
    
    IF v_source_table IS NULL THEN
        RAISE EXCEPTION 'Source document not found';
    END IF;
    
    -- Insert new document metadata
    INSERT INTO public.document_metadata (
        doc_id, doc_name, database_id, table_name, created_by, tags, description, is_public, permissions, metadata
    )
    SELECT 
        v_new_doc_id, p_new_name, database_id, '', p_created_by, tags, description, false, 
        jsonb_build_object('editors', ARRAY[]::uuid[], 'viewers', ARRAY[]::uuid[], 'public_access', 'none'),
        metadata
    FROM public.document_metadata
    WHERE doc_id = p_source_doc_id;
    
    -- Create new table
    PERFORM create_document_table(v_database_id, v_new_doc_id, p_new_name);
    
    -- Get new table name
    SELECT table_name INTO v_new_table
    FROM public.document_metadata
    WHERE doc_id = v_new_doc_id;
    
    -- Copy blocks
    EXECUTE format('
        INSERT INTO public.%I (block_type, content, order_index, created_by, metadata)
        SELECT block_type, content, order_index, %L::uuid, metadata
        FROM public.%I
        ORDER BY order_index
    ', v_new_table, p_created_by, v_source_table);
    
    RETURN v_new_doc_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error copying document: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reorder blocks
CREATE OR REPLACE FUNCTION reorder_blocks(
    p_document_id UUID,
    p_block_ids UUID[],
    p_new_positions INTEGER[]
)
RETURNS BOOLEAN AS $$
DECLARE
    v_table_name VARCHAR(255);
    i INTEGER;
BEGIN
    -- Validate input arrays have same length
    IF array_length(p_block_ids, 1) != array_length(p_new_positions, 1) THEN
        RAISE EXCEPTION 'Block IDs and positions arrays must have same length';
    END IF;
    
    -- Get table name
    SELECT table_name INTO v_table_name
    FROM public.document_metadata
    WHERE doc_id = p_document_id;
    
    IF v_table_name IS NULL THEN
        RAISE EXCEPTION 'Document not found';
    END IF;
    
    -- Update positions
    FOR i IN 1..array_length(p_block_ids, 1) LOOP
        EXECUTE format('
            UPDATE public.%I 
            SET order_index = %s, updated_at = timezone(''utc''::text, now())
            WHERE block_id = %L
        ', v_table_name, p_new_positions[i], p_block_ids[i]);
    END LOOP;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error reordering blocks: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and fix references
CREATE OR REPLACE FUNCTION validate_references(
    p_document_id UUID DEFAULT NULL
)
RETURNS TABLE(
    reference_id UUID,
    status VARCHAR(50),
    message TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH reference_checks AS (
        SELECT 
            rt.id,
            rt.source_doc_id,
            rt.source_block_id,
            rt.target_doc_id,
            rt.target_block_id,
            CASE
                WHEN NOT EXISTS (
                    SELECT 1 FROM public.document_metadata 
                    WHERE doc_id = rt.source_doc_id
                ) THEN 'invalid_source_doc'
                WHEN NOT EXISTS (
                    SELECT 1 FROM public.document_metadata 
                    WHERE doc_id = rt.target_doc_id
                ) THEN 'invalid_target_doc'
                WHEN rt.source_doc_id = rt.target_doc_id 
                    AND rt.source_block_id = rt.target_block_id THEN 'self_reference'
                ELSE 'valid'
            END as check_status
        FROM public.reference_tracking rt
        WHERE p_document_id IS NULL 
            OR rt.source_doc_id = p_document_id 
            OR rt.target_doc_id = p_document_id
    )
    SELECT 
        id,
        check_status,
        CASE check_status
            WHEN 'invalid_source_doc' THEN 'Source document no longer exists'
            WHEN 'invalid_target_doc' THEN 'Target document no longer exists'
            WHEN 'self_reference' THEN 'Block references itself'
            ELSE 'Reference is valid'
        END as message
    FROM reference_checks
    WHERE check_status != 'valid';
END;
$$ LANGUAGE plpgsql;

-- Function to get document statistics
CREATE OR REPLACE FUNCTION get_document_stats(
    p_document_id UUID
)
RETURNS TABLE(
    total_blocks INTEGER,
    blocks_by_type JSONB,
    total_words INTEGER,
    incoming_references INTEGER,
    outgoing_references INTEGER,
    last_modified TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_table_name VARCHAR(255);
    v_stats RECORD;
BEGIN
    -- Get table name
    SELECT table_name INTO v_table_name
    FROM public.document_metadata
    WHERE doc_id = p_document_id;
    
    IF v_table_name IS NULL THEN
        RAISE EXCEPTION 'Document not found';
    END IF;
    
    -- Get block statistics
    EXECUTE format('
        SELECT 
            COUNT(*) as total_blocks,
            jsonb_object_agg(
                block_type, 
                block_count
            ) as blocks_by_type,
            SUM(
                CASE 
                    WHEN block_type = ''text'' THEN 
                        array_length(
                            string_to_array(content->>''text'', '' ''), 
                            1
                        )
                    ELSE 0 
                END
            )::INTEGER as total_words,
            MAX(updated_at) as last_modified
        FROM (
            SELECT block_type, COUNT(*) as block_count
            FROM public.%I
            GROUP BY block_type
        ) t
        CROSS JOIN public.%I
    ', v_table_name, v_table_name) INTO v_stats;
    
    RETURN QUERY
    SELECT 
        v_stats.total_blocks,
        v_stats.blocks_by_type,
        COALESCE(v_stats.total_words, 0),
        (SELECT COUNT(*) FROM public.reference_tracking WHERE target_doc_id = p_document_id)::INTEGER,
        (SELECT COUNT(*) FROM public.reference_tracking WHERE source_doc_id = p_document_id)::INTEGER,
        v_stats.last_modified;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_document_table(UUID, UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION drop_document_table(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION copy_document(UUID, VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reorder_blocks(UUID, UUID[], INTEGER[]) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_references(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_document_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION clean_expired_cache() TO authenticated;