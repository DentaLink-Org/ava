-- COMPLETE SCHEMA FIX FOR PAGE_COMPONENTS TABLE
-- Run this in your Supabase SQL Editor to add ALL missing columns at once

-- Add all missing columns to page_components table
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'custom';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS name VARCHAR(200);
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS display_name VARCHAR(250);
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS author VARCHAR(100);
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS version VARCHAR(20) DEFAULT '1.0.0';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_components_category ON page_components(category);
CREATE INDEX IF NOT EXISTS idx_page_components_name ON page_components(name);
CREATE INDEX IF NOT EXISTS idx_page_components_is_system ON page_components(is_system);

-- Verify the schema is complete
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'page_components' 
AND table_schema = 'public'
ORDER BY ordinal_position;