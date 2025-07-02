-- Enable pgcrypto extension (provides gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Real-time Database Management System Setup
-- This script creates all the necessary tables for the dynamic database system

-- First, handle existing table modifications
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_databases') THEN

        -- Ensure id column has the UUID default
        ALTER TABLE user_databases
          ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

        -- Add status column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
             WHERE table_name = 'user_databases' AND column_name = 'status'
        ) THEN
            ALTER TABLE user_databases
              ADD COLUMN status TEXT DEFAULT 'active'
                CHECK (status IN ('active','inactive','error','maintenance'));
        END IF;

        -- Add size column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
             WHERE table_name = 'user_databases' AND column_name = 'size'
        ) THEN
            ALTER TABLE user_databases
              ADD COLUMN size TEXT DEFAULT '0 KB';
        END IF;

        -- Add type column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
             WHERE table_name = 'user_databases' AND column_name = 'type'
        ) THEN
            ALTER TABLE user_databases
              ADD COLUMN type TEXT DEFAULT 'postgresql'
                CHECK (type IN ('postgresql','mysql','sqlite','mongodb'));
        END IF;

        -- Add table_count column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
             WHERE table_name = 'user_databases' AND column_name = 'table_count'
        ) THEN
            ALTER TABLE user_databases
              ADD COLUMN table_count INTEGER DEFAULT 0;
        END IF;

        -- Add record_count column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
             WHERE table_name = 'user_databases' AND column_name = 'record_count'
        ) THEN
            ALTER TABLE user_databases
              ADD COLUMN record_count INTEGER DEFAULT 0;
        END IF;

        -- Update type constraint in case it has changed
        ALTER TABLE user_databases
          DROP CONSTRAINT IF EXISTS user_databases_type_check;
        ALTER TABLE user_databases
          ADD CONSTRAINT user_databases_type_check
            CHECK (type IN ('postgresql','mysql','sqlite','mongodb'));
    END IF;
END
$$;

-- Handle existing database_schemas table modifications
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'database_schemas') THEN

        -- Ensure id column has the UUID default
        ALTER TABLE database_schemas
          ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

        -- Add display_name column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
             WHERE table_name = 'database_schemas' AND column_name = 'display_name'
        ) THEN
            ALTER TABLE database_schemas
              ADD COLUMN display_name TEXT;
        END IF;

        -- Add description column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
             WHERE table_name = 'database_schemas' AND column_name = 'description'
        ) THEN
            ALTER TABLE database_schemas
              ADD COLUMN description TEXT;
        END IF;
    END IF;
END
$$;

-- Handle existing schema_columns table modifications
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'schema_columns') THEN
        -- Ensure id column has the UUID default
        ALTER TABLE schema_columns
          ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
    END IF;
END
$$;

-- Create the user_databases table
CREATE TABLE IF NOT EXISTS user_databases (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'postgresql'
      CHECK (type IN ('postgresql','mysql','sqlite','mongodb')),
    status TEXT DEFAULT 'active'
      CHECK (status IN ('active','inactive','error','maintenance')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    table_count INTEGER DEFAULT 0,
    record_count INTEGER DEFAULT 0,
    size TEXT DEFAULT '0 KB'
);

-- Create the database_schemas table
CREATE TABLE IF NOT EXISTS database_schemas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    database_id TEXT REFERENCES user_databases(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    column_count INTEGER DEFAULT 0,
    record_count INTEGER DEFAULT 0,
    UNIQUE(database_id, table_name)
);

-- Create the schema_columns table
CREATE TABLE IF NOT EXISTS schema_columns (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    schema_id TEXT REFERENCES database_schemas(id) ON DELETE CASCADE,
    column_name TEXT NOT NULL,
    data_type TEXT NOT NULL,
    is_nullable BOOLEAN DEFAULT TRUE,
    is_primary_key BOOLEAN DEFAULT FALSE,
    is_unique BOOLEAN DEFAULT FALSE,
    default_value TEXT,
    column_order INTEGER DEFAULT 0,
    max_length INTEGER,
    precision_value INTEGER,
    scale_value INTEGER,
    references_table TEXT,
    references_column TEXT,
    on_delete TEXT,
    on_update TEXT,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(schema_id, column_name)
);

-- Create the database_snapshots table for version control
CREATE TABLE IF NOT EXISTS database_snapshots (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    database_id TEXT REFERENCES user_databases(id) ON DELETE CASCADE,
    snapshot_data JSONB NOT NULL,
    snapshot_type TEXT
      CHECK (snapshot_type IN ('manual','auto','checkpoint'))
      DEFAULT 'manual',
    description TEXT,
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    size_bytes BIGINT DEFAULT 0
);

-- Create the database_changes table for tracking modifications
CREATE TABLE IF NOT EXISTS database_changes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    database_id TEXT REFERENCES user_databases(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL
      CHECK (change_type IN (
        'schema_add','schema_delete','schema_update',
        'data_insert','data_update','data_delete',
        'table_create','table_drop',
        'column_add','column_drop','column_modify'
      )),
    table_name TEXT,
    record_id TEXT,
    changes JSONB,
    previous_values JSONB,
    batch_id TEXT,
    created_by TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the dynamic_tables table for storing user-defined tables
CREATE TABLE IF NOT EXISTS dynamic_tables (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    database_id TEXT REFERENCES user_databases(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    physical_table_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(database_id, table_name),
    UNIQUE(physical_table_name)
);

-- Function to execute dynamic SQL
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_databases_updated_at') THEN
        CREATE TRIGGER update_user_databases_updated_at
          BEFORE UPDATE ON user_databases
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_database_schemas_updated_at') THEN
        CREATE TRIGGER update_database_schemas_updated_at
          BEFORE UPDATE ON database_schemas
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_schema_columns_updated_at') THEN
        CREATE TRIGGER update_schema_columns_updated_at
          BEFORE UPDATE ON schema_columns
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_dynamic_tables_updated_at') THEN
        CREATE TRIGGER update_dynamic_tables_updated_at
          BEFORE UPDATE ON dynamic_tables
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Function to update user_databases.table_count on schema change
CREATE OR REPLACE FUNCTION update_database_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP IN ('INSERT','DELETE') THEN
        UPDATE user_databases
        SET
            table_count = (
                SELECT COUNT(*) FROM database_schemas
                WHERE database_id = COALESCE(NEW.database_id, OLD.database_id)
            ),
            updated_at = NOW()
        WHERE id = COALESCE(NEW.database_id, OLD.database_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for table_count maintenance
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_stats_on_schema_change') THEN
        CREATE TRIGGER update_stats_on_schema_change
          AFTER INSERT OR DELETE ON database_schemas
          FOR EACH ROW EXECUTE FUNCTION update_database_stats();
    END IF;
END
$$;

-- Enable realtime for all tables (ignores duplicates)
DO $$
DECLARE
  tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'user_databases','database_schemas',
            'schema_columns','database_snapshots',
            'database_changes','dynamic_tables'
        ])
    LOOP
        BEGIN
            EXECUTE format(
                'ALTER PUBLICATION supabase_realtime ADD TABLE %I;',
                tbl
            );
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END LOOP;
END
$$;

-- Create indexes to speed queries
CREATE INDEX IF NOT EXISTS idx_database_schemas_database_id
  ON database_schemas(database_id);
CREATE INDEX IF NOT EXISTS idx_schema_columns_schema_id
  ON schema_columns(schema_id);
CREATE INDEX IF NOT EXISTS idx_database_changes_database_id
  ON database_changes(database_id);
CREATE INDEX IF NOT EXISTS idx_database_changes_created_at
  ON database_changes(created_at);
CREATE INDEX IF NOT EXISTS idx_dynamic_tables_database_id
  ON dynamic_tables(database_id);
CREATE INDEX IF NOT EXISTS idx_user_databases_status
  ON user_databases(status);

-- Disable RLS for development (apply RLS policies in production)
ALTER TABLE user_databases DISABLE ROW LEVEL SECURITY;
ALTER TABLE database_schemas DISABLE ROW LEVEL SECURITY;
ALTER TABLE schema_columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE database_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE database_changes DISABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_tables DISABLE ROW LEVEL SECURITY;

-- Grant execute on helper functions to anon/authenticated roles
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO anon, authenticated;

-- Backfill existing rows with defaults
UPDATE user_databases
SET
  status = COALESCE(status,'active'),
  size   = COALESCE(size,'0 KB'),
  type   = CASE
             WHEN type NOT IN ('postgresql','mysql','sqlite','mongodb')
             THEN 'postgresql'
             ELSE type
           END
WHERE TRUE;

-- Insert sample data if not already present
INSERT INTO user_databases (title, description, type, size)
SELECT 'Customer Database','Main customer management system','postgresql','2.4 MB'
WHERE NOT EXISTS (
  SELECT 1 FROM user_databases WHERE title = 'Customer Database'
);

INSERT INTO user_databases (title, description, type, size)
SELECT 'Product Catalog','Product information and inventory','postgresql','1.8 MB'
WHERE NOT EXISTS (
  SELECT 1 FROM user_databases WHERE title = 'Product Catalog'
);

INSERT INTO user_databases (title, description, type, size)
SELECT 'Analytics Data','Business analytics and reporting data','postgresql','15.2 MB'
WHERE NOT EXISTS (
  SELECT 1 FROM user_databases WHERE title = 'Analytics Data'
);

-- Create a sample schema for Customer Database
WITH cust_db AS (
  SELECT id FROM user_databases WHERE title = 'Customer Database' LIMIT 1
)
INSERT INTO database_schemas (database_id, table_name, display_name, description)
SELECT cust_db.id,'customers','Customers','Customer information table'
FROM cust_db
WHERE NOT EXISTS (
  SELECT 1 FROM database_schemas ds
  WHERE ds.database_id = cust_db.id AND ds.table_name = 'customers'
);

-- Add sample columns for customers table
WITH schema_row AS (
  SELECT id FROM database_schemas WHERE table_name = 'customers'
)
INSERT INTO schema_columns (schema_id, column_name, data_type, is_primary_key, is_nullable, column_order)
SELECT schema_row.id,'id','TEXT',TRUE,FALSE,1 FROM schema_row
WHERE NOT EXISTS (
  SELECT 1 FROM schema_columns sc
  WHERE sc.schema_id = schema_row.id AND sc.column_name = 'id'
);

INSERT INTO schema_columns (schema_id, column_name, data_type, is_nullable, column_order)
SELECT id,'name','TEXT',FALSE,2 FROM database_schemas
WHERE table_name = 'customers'
  AND NOT EXISTS (
    SELECT 1 FROM schema_columns sc
    WHERE sc.schema_id = database_schemas.id AND sc.column_name = 'name'
);

INSERT INTO schema_columns (schema_id, column_name, data_type, is_nullable, column_order)
SELECT id,'email','TEXT',FALSE,3 FROM database_schemas
WHERE table_name = 'customers'
  AND NOT EXISTS (
    SELECT 1 FROM schema_columns sc
    WHERE sc.schema_id = database_schemas.id AND sc.column_name = 'email'
);

INSERT INTO schema_columns (schema_id, column_name, data_type, is_nullable, column_order)
SELECT id,'created_at','TIMESTAMPTZ',FALSE,4 FROM database_schemas
WHERE table_name = 'customers'
  AND NOT EXISTS (
    SELECT 1 FROM schema_columns sc
    WHERE sc.schema_id = database_schemas.id AND sc.column_name = 'created_at'
);

-- Create a sample schema for Product Catalog
WITH prod_db AS (
  SELECT id FROM user_databases WHERE title = 'Product Catalog' LIMIT 1
)
INSERT INTO database_schemas (database_id, table_name, display_name, description)
SELECT prod_db.id,'products','Products','Product information table'
FROM prod_db
WHERE NOT EXISTS (
  SELECT 1 FROM database_schemas ds
  WHERE ds.database_id = prod_db.id AND ds.table_name = 'products'
);

-- Add sample columns for products table
WITH prod_schema AS (
  SELECT id FROM database_schemas WHERE table_name = 'products'
)
INSERT INTO schema_columns (schema_id, column_name, data_type, is_primary_key, is_nullable, column_order)
SELECT prod_schema.id,'id','TEXT',TRUE,FALSE,1 FROM prod_schema
WHERE NOT EXISTS (
  SELECT 1 FROM schema_columns sc
  WHERE sc.schema_id = prod_schema.id AND sc.column_name = 'id'
);

INSERT INTO schema_columns (schema_id, column_name, data_type, is_nullable, column_order)
SELECT id,'name','TEXT',FALSE,2 FROM database_schemas
WHERE table_name = 'products'
  AND NOT EXISTS (
    SELECT 1 FROM schema_columns sc
    WHERE sc.schema_id = database_schemas.id AND sc.column_name = 'name'
);

INSERT INTO schema_columns (schema_id, column_name, data_type, is_nullable, column_order)
SELECT id,'price','DECIMAL',FALSE,3 FROM database_schemas
WHERE table_name = 'products'
  AND NOT EXISTS (
    SELECT 1 FROM schema_columns sc
    WHERE sc.schema_id = database_schemas.id AND sc.column_name = 'price'
);

INSERT INTO schema_columns (schema_id, column_name, data_type, is_nullable, column_order)
SELECT id,'category','TEXT',TRUE,4 FROM database_schemas
WHERE table_name = 'products'
  AND NOT EXISTS (
    SELECT 1 FROM schema_columns sc
    WHERE sc.schema_id = database_schemas.id AND sc.column_name = 'category'
);

-- Update table_count for the seeded databases
UPDATE user_databases
SET table_count = (
  SELECT COUNT(*) FROM database_schemas WHERE database_id = user_databases.id
)
WHERE title IN ('Customer Database','Product Catalog','Analytics Data');
