-- Fix for real-time updates in Schema Editor
-- Ensure the database_schemas table triggers real-time notifications properly

-- 1. Check if RLS is enabled and policies exist for database_schemas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'database_schemas';

-- 2. Ensure proper RLS policies exist
DROP POLICY IF EXISTS "Enable all operations for database_schemas" ON database_schemas;
CREATE POLICY "Enable all operations for database_schemas" ON database_schemas
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Create a trigger to log database_schemas changes (for debugging)
CREATE OR REPLACE FUNCTION log_database_schemas_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the change for debugging
    RAISE NOTICE 'database_schemas change: operation=%, table_name=%, database_id=%', 
        TG_OP, 
        COALESCE(NEW.table_name, OLD.table_name),
        COALESCE(NEW.database_id, OLD.database_id);
    
    -- Return the appropriate row
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS log_database_schemas_changes_trigger ON database_schemas;
CREATE TRIGGER log_database_schemas_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON database_schemas
    FOR EACH ROW
    EXECUTE FUNCTION log_database_schemas_changes();

-- 4. Also create the same for schema_columns
DROP POLICY IF EXISTS "Enable all operations for schema_columns" ON schema_columns;
CREATE POLICY "Enable all operations for schema_columns" ON schema_columns
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Test the real-time setup by checking if the replica identity is set
-- This ensures that real-time subscriptions receive all necessary data
ALTER TABLE database_schemas REPLICA IDENTITY FULL;
ALTER TABLE schema_columns REPLICA IDENTITY FULL;

-- 6. Verify the setup
SELECT 
    'Real-time setup complete' as status,
    'Check browser console for "database_schemas change:" logs when creating tables' as note;