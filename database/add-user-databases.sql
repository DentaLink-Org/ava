-- Create user_databases table for storing database connections
CREATE TABLE IF NOT EXISTS user_databases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  connection_config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_databases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (demo purposes)
CREATE POLICY "public_read_user_databases" ON user_databases FOR SELECT TO anon USING (true);
CREATE POLICY "public_write_user_databases" ON user_databases FOR ALL TO anon USING (true);

-- Insert sample database if none exist
INSERT INTO user_databases (name, type, connection_config) 
SELECT 
  'Sample PostgreSQL Database',
  'postgresql',
  '{"host": "localhost", "port": 5432, "database": "sampledb", "ssl": false}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM user_databases LIMIT 1);