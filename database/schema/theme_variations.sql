-- Theme Variations Schema
-- Extends the theme system to support variations of existing themes

-- Theme variations table
CREATE TABLE IF NOT EXISTS theme_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    page_id VARCHAR(100), -- Optional: specific page this variation was created for
    colors JSONB NOT NULL,
    typography JSONB,
    spacing JSONB,
    shadows JSONB,
    borders JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    author VARCHAR(200),
    version VARCHAR(20) DEFAULT '1.0.0',
    -- Track the lineage depth (1 = direct variation, 2 = variation of variation, etc.)
    variation_depth INTEGER DEFAULT 1,
    -- Store the full lineage path for easy querying
    lineage_path UUID[] DEFAULT ARRAY[]::UUID[]
);

-- Update page_theme_assignments to support both themes and variations
ALTER TABLE page_theme_assignments ADD COLUMN IF NOT EXISTS theme_variation_id UUID REFERENCES theme_variations(id) ON DELETE CASCADE;
ALTER TABLE page_theme_assignments ADD COLUMN IF NOT EXISTS is_variation BOOLEAN DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_theme_variations_parent_theme_id ON theme_variations(parent_theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_variations_page_id ON theme_variations(page_id);
CREATE INDEX IF NOT EXISTS idx_theme_variations_created_at ON theme_variations(created_at);
CREATE INDEX IF NOT EXISTS idx_theme_variations_lineage_path ON theme_variations USING GIN(lineage_path);
CREATE INDEX IF NOT EXISTS idx_page_theme_assignments_theme_variation_id ON page_theme_assignments(theme_variation_id);

-- Update trigger for theme_variations
CREATE TRIGGER update_theme_variations_updated_at BEFORE UPDATE ON theme_variations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate lineage path
CREATE OR REPLACE FUNCTION calculate_theme_lineage_path()
RETURNS TRIGGER AS $$
DECLARE
    parent_lineage UUID[];
    parent_depth INTEGER;
BEGIN
    -- If this is a variation of a variation, get the parent's lineage
    SELECT lineage_path, variation_depth INTO parent_lineage, parent_depth
    FROM theme_variations
    WHERE id = NEW.parent_theme_id;
    
    IF parent_lineage IS NOT NULL THEN
        -- This is a variation of a variation
        NEW.lineage_path := parent_lineage || NEW.parent_theme_id;
        NEW.variation_depth := parent_depth + 1;
    ELSE
        -- This is a direct variation of a main theme
        NEW.lineage_path := ARRAY[NEW.parent_theme_id];
        NEW.variation_depth := 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate lineage path
CREATE TRIGGER calculate_theme_lineage_before_insert
    BEFORE INSERT ON theme_variations
    FOR EACH ROW
    EXECUTE FUNCTION calculate_theme_lineage_path();

-- View to get all themes with their variations
CREATE OR REPLACE VIEW themes_with_variations AS
SELECT 
    t.id,
    t.name,
    t.display_name,
    t.description,
    t.category,
    t.colors,
    t.typography,
    t.spacing,
    t.shadows,
    t.borders,
    t.created_at,
    t.updated_at,
    t.is_default,
    t.is_system,
    t.preview_image,
    t.author,
    t.version,
    'theme' as type,
    NULL::UUID as parent_theme_id,
    NULL::UUID[] as lineage_path,
    0 as variation_depth,
    COALESCE(
        ARRAY_AGG(
            DISTINCT jsonb_build_object(
                'id', tv.id,
                'name', tv.name,
                'display_name', tv.display_name,
                'page_id', tv.page_id,
                'created_at', tv.created_at,
                'variation_depth', tv.variation_depth
            ) ORDER BY tv.created_at DESC
        ) FILTER (WHERE tv.id IS NOT NULL),
        ARRAY[]::jsonb[]
    ) as variations
FROM themes t
LEFT JOIN theme_variations tv ON t.id = tv.parent_theme_id
GROUP BY t.id, t.name, t.display_name, t.description, t.category, t.colors, 
         t.typography, t.spacing, t.shadows, t.borders, t.created_at, t.updated_at,
         t.is_default, t.is_system, t.preview_image, t.author, t.version

UNION ALL

SELECT 
    tv.id,
    tv.name,
    tv.display_name,
    tv.description,
    t.category, -- inherit category from parent theme
    tv.colors,
    tv.typography,
    tv.spacing,
    tv.shadows,
    tv.borders,
    tv.created_at,
    tv.updated_at,
    false as is_default,
    false as is_system,
    t.preview_image, -- inherit preview from parent for now
    tv.author,
    tv.version,
    'variation' as type,
    tv.parent_theme_id,
    tv.lineage_path,
    tv.variation_depth,
    ARRAY[]::jsonb[] as variations -- variations don't have their own variations in this view
FROM theme_variations tv
JOIN themes t ON tv.parent_theme_id = t.id OR t.id = ANY(tv.lineage_path);

-- Function to get the effective theme for a page (theme or variation)
CREATE OR REPLACE FUNCTION get_effective_page_theme(p_page_id VARCHAR(100))
RETURNS TABLE (
    theme_id UUID,
    theme_type VARCHAR(20),
    colors JSONB,
    typography JSONB,
    spacing JSONB,
    shadows JSONB,
    borders JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(tv.id, t.id) as theme_id,
        CASE WHEN tv.id IS NOT NULL THEN 'variation' ELSE 'theme' END as theme_type,
        COALESCE(tv.colors, t.colors) as colors,
        COALESCE(tv.typography, t.typography) as typography,
        COALESCE(tv.spacing, t.spacing) as spacing,
        COALESCE(tv.shadows, t.shadows) as shadows,
        COALESCE(tv.borders, t.borders) as borders
    FROM page_theme_assignments pta
    LEFT JOIN themes t ON pta.theme_id = t.id
    LEFT JOIN theme_variations tv ON pta.theme_variation_id = tv.id
    WHERE pta.page_id = p_page_id;
END;
$$ LANGUAGE plpgsql;