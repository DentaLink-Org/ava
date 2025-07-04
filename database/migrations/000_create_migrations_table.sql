-- Migration: Create migrations tracking table
-- This table tracks which migrations have been executed

CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checksum VARCHAR(64),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_migrations_filename ON migrations(filename);
CREATE INDEX IF NOT EXISTS idx_migrations_executed_at ON migrations(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_migrations_success ON migrations(success);

-- Enable RLS for consistency with other tables
ALTER TABLE migrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust in production)
CREATE POLICY "Allow all operations on migrations" ON migrations
    FOR ALL USING (true) WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE migrations IS 'Tracks database migrations that have been executed';
COMMENT ON COLUMN migrations.filename IS 'Name of the migration file';
COMMENT ON COLUMN migrations.executed_at IS 'When the migration was executed';
COMMENT ON COLUMN migrations.checksum IS 'File checksum for integrity checking';
COMMENT ON COLUMN migrations.success IS 'Whether the migration completed successfully';
COMMENT ON COLUMN migrations.error_message IS 'Error message if migration failed';