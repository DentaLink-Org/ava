-- Migration: Add Documentation System Tables
-- Description: Creates the core tables for the documentation system that treats documents as database tables

-- Create document_metadata table
CREATE TABLE IF NOT EXISTS public.document_metadata (
    doc_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doc_name VARCHAR(255) NOT NULL,
    database_id UUID NOT NULL,
    table_name VARCHAR(255) NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    permissions JSONB DEFAULT '{"editors": [], "viewers": [], "public_access": "none"}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT unique_table_name UNIQUE (database_id, table_name)
);

-- Create reference_tracking table
CREATE TABLE IF NOT EXISTS public.reference_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_doc_id UUID NOT NULL,
    source_block_id UUID NOT NULL,
    target_doc_id UUID NOT NULL,
    target_block_id UUID,
    reference_type VARCHAR(50) NOT NULL CHECK (reference_type IN ('embed', 'link', 'mirror')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT fk_source_doc FOREIGN KEY (source_doc_id) REFERENCES document_metadata(doc_id) ON DELETE CASCADE,
    CONSTRAINT fk_target_doc FOREIGN KEY (target_doc_id) REFERENCES document_metadata(doc_id) ON DELETE CASCADE
);

-- Create reference_cache table for performance optimization
CREATE TABLE IF NOT EXISTS public.reference_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    cached_content JSONB NOT NULL,
    source_doc_id UUID NOT NULL,
    target_doc_id UUID NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT fk_cache_source_doc FOREIGN KEY (source_doc_id) REFERENCES document_metadata(doc_id) ON DELETE CASCADE,
    CONSTRAINT fk_cache_target_doc FOREIGN KEY (target_doc_id) REFERENCES document_metadata(doc_id) ON DELETE CASCADE
);

-- Create document_versions table for version control
CREATE TABLE IF NOT EXISTS public.document_versions (
    version_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    changes JSONB NOT NULL DEFAULT '[]'::jsonb,
    comment TEXT,
    CONSTRAINT fk_version_document FOREIGN KEY (document_id) REFERENCES document_metadata(doc_id) ON DELETE CASCADE,
    CONSTRAINT unique_version_number UNIQUE (document_id, version_number)
);

-- Create document_operations table for real-time collaboration
CREATE TABLE IF NOT EXISTS public.document_operations (
    operation_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL,
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('create', 'update', 'delete', 'reorder')),
    block_operations JSONB NOT NULL DEFAULT '[]'::jsonb,
    user_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    session_id UUID,
    CONSTRAINT fk_operation_document FOREIGN KEY (document_id) REFERENCES document_metadata(doc_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_document_metadata_database_id ON public.document_metadata(database_id);
CREATE INDEX idx_document_metadata_created_by ON public.document_metadata(created_by);
CREATE INDEX idx_document_metadata_updated_at ON public.document_metadata(updated_at);
CREATE INDEX idx_document_metadata_tags ON public.document_metadata USING GIN(tags);
CREATE INDEX idx_document_metadata_is_public ON public.document_metadata(is_public);

CREATE INDEX idx_reference_tracking_source ON public.reference_tracking(source_doc_id, source_block_id);
CREATE INDEX idx_reference_tracking_target ON public.reference_tracking(target_doc_id, target_block_id);
CREATE INDEX idx_reference_tracking_type ON public.reference_tracking(reference_type);

CREATE INDEX idx_reference_cache_expires ON public.reference_cache(expires_at);
CREATE INDEX idx_reference_cache_docs ON public.reference_cache(source_doc_id, target_doc_id);

CREATE INDEX idx_document_versions_document ON public.document_versions(document_id);
CREATE INDEX idx_document_operations_document ON public.document_operations(document_id);
CREATE INDEX idx_document_operations_timestamp ON public.document_operations(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_document_metadata_updated_at BEFORE UPDATE ON public.document_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reference_cache_updated_at BEFORE UPDATE ON public.reference_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM public.reference_cache WHERE expires_at < timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE public.document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_operations ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (to be refined based on auth system)
CREATE POLICY "Users can view public documents" ON public.document_metadata
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own documents" ON public.document_metadata
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create documents" ON public.document_metadata
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own documents" ON public.document_metadata
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own documents" ON public.document_metadata
    FOR DELETE USING (auth.uid() = created_by);

-- Add comments for documentation
COMMENT ON TABLE public.document_metadata IS 'Stores metadata for all documents in the system';
COMMENT ON TABLE public.reference_tracking IS 'Tracks all references between documents and blocks';
COMMENT ON TABLE public.reference_cache IS 'Caches resolved references for performance';
COMMENT ON TABLE public.document_versions IS 'Stores version history for documents';
COMMENT ON TABLE public.document_operations IS 'Tracks real-time operations for collaboration';

COMMENT ON COLUMN public.document_metadata.permissions IS 'JSON object with editors[], viewers[], and public_access level';
COMMENT ON COLUMN public.reference_tracking.reference_type IS 'Type of reference: embed (show content), link (clickable), mirror (sync updates)';
COMMENT ON COLUMN public.reference_cache.cache_key IS 'Unique key format: source_doc_id:source_block_id:target_doc_id:target_block_id';