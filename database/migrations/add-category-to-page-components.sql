-- Migration: Add category column to page_components table
-- This fixes the "Could not find the 'category' column" error

-- Add the category column to the existing page_components table
ALTER TABLE page_components 
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'custom';

-- Add an index for better performance on category queries
CREATE INDEX IF NOT EXISTS idx_page_components_category ON page_components(category);

-- Add comment for documentation
COMMENT ON COLUMN page_components.category IS 'Category classification for the component';