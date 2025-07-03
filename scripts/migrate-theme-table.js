#!/usr/bin/env node

/**
 * Migration script to add missing columns to the themes table
 * Run this in your Supabase SQL editor to add the missing columns
 */

console.log(`
=== Theme Table Migration Script ===

Your themes table is missing some columns that are required for theme variations and customizations.
Please run the following SQL commands in your Supabase SQL editor:

-- Add missing columns to themes table
ALTER TABLE themes 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS typography JSONB,
ADD COLUMN IF NOT EXISTS spacing JSONB,
ADD COLUMN IF NOT EXISTS shadows JSONB,
ADD COLUMN IF NOT EXISTS borders JSONB;

-- Update existing themes with default typography, spacing, shadows, and borders
UPDATE themes 
SET 
    typography = CASE 
        WHEN typography IS NULL THEN '{
            "fontFamily": "Inter, system-ui, sans-serif",
            "fontSize": {
                "xs": "0.75rem",
                "sm": "0.875rem",
                "base": "1rem",
                "lg": "1.125rem",
                "xl": "1.25rem",
                "2xl": "1.5rem",
                "3xl": "1.875rem"
            },
            "fontWeight": {
                "normal": "400",
                "medium": "500",
                "semibold": "600",
                "bold": "700"
            },
            "lineHeight": {
                "tight": "1.25",
                "normal": "1.5",
                "relaxed": "1.75"
            }
        }'::jsonb
        ELSE typography
    END,
    spacing = CASE 
        WHEN spacing IS NULL THEN '{
            "xs": "0.25rem",
            "sm": "0.5rem",
            "base": "1rem",
            "lg": "1.5rem",
            "xl": "2rem",
            "2xl": "3rem",
            "3xl": "4rem"
        }'::jsonb
        ELSE spacing
    END,
    shadows = CASE 
        WHEN shadows IS NULL THEN '{
            "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            "base": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            "hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        }'::jsonb
        ELSE shadows
    END,
    borders = CASE 
        WHEN borders IS NULL THEN '{
            "radius": {
                "sm": "0.25rem",
                "base": "0.5rem",
                "lg": "0.75rem",
                "xl": "1rem",
                "full": "9999px"
            },
            "width": {
                "thin": "1px",
                "base": "2px",
                "thick": "3px"
            }
        }'::jsonb
        ELSE borders
    END
WHERE typography IS NULL OR spacing IS NULL OR shadows IS NULL OR borders IS NULL;

-- Verify the migration
SELECT 
    name,
    display_name,
    CASE WHEN description IS NOT NULL THEN 'YES' ELSE 'NO' END as has_description,
    CASE WHEN typography IS NOT NULL THEN 'YES' ELSE 'NO' END as has_typography,
    CASE WHEN spacing IS NOT NULL THEN 'YES' ELSE 'NO' END as has_spacing,
    CASE WHEN shadows IS NOT NULL THEN 'YES' ELSE 'NO' END as has_shadows,
    CASE WHEN borders IS NOT NULL THEN 'YES' ELSE 'NO' END as has_borders
FROM themes 
ORDER BY name;

=== End Migration Script ===

After running this migration, you can then run the theme_variations.sql file successfully.
`);