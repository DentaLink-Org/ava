-- Migration: Add category column to page_components table
-- This fixes the "Could not find the 'category' column" error

-- Add missing columns to page_components table
ALTER TABLE page_components 
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'custom';

ALTER TABLE page_components 
ADD COLUMN IF NOT EXISTS name VARCHAR(200);

ALTER TABLE page_components 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(250);

ALTER TABLE page_components 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE page_components 
ADD COLUMN IF NOT EXISTS author VARCHAR(100);

ALTER TABLE page_components 
ADD COLUMN IF NOT EXISTS version VARCHAR(20) DEFAULT '1.0.0';

ALTER TABLE page_components 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

ALTER TABLE page_components 
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;

ALTER TABLE page_components 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_components_category ON page_components(category);
CREATE INDEX IF NOT EXISTS idx_page_components_name ON page_components(name);
CREATE INDEX IF NOT EXISTS idx_page_components_is_system ON page_components(is_system);

-- Add comments for documentation
COMMENT ON COLUMN page_components.category IS 'Category classification for the component';
COMMENT ON COLUMN page_components.name IS 'Unique component name/identifier';
COMMENT ON COLUMN page_components.display_name IS 'Human-readable component display name';
COMMENT ON COLUMN page_components.description IS 'Detailed description of the component';
COMMENT ON COLUMN page_components.author IS 'Component author or creator';
COMMENT ON COLUMN page_components.version IS 'Component version number';
COMMENT ON COLUMN page_components.tags IS 'Array of tags for categorization and search';
COMMENT ON COLUMN page_components.is_system IS 'Whether this is a system-provided component';
COMMENT ON COLUMN page_components.metadata IS 'Additional structured data for the component';