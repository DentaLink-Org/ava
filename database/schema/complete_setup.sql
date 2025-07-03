-- Complete Database Setup for Theme System
-- Run this in your Supabase SQL editor to set up everything from scratch

-- Drop existing tables if they exist (in correct order due to foreign key constraints)
DROP VIEW IF EXISTS themes_with_variations;
DROP TABLE IF EXISTS theme_variations;
DROP TABLE IF EXISTS page_theme_assignments;
DROP TABLE IF EXISTS themes;

-- Drop theme-specific functions and triggers if they exist
DROP FUNCTION IF EXISTS calculate_theme_lineage_path();
DROP FUNCTION IF EXISTS get_effective_page_theme(VARCHAR);

-- Create update_updated_at function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Main themes table with all required columns
CREATE TABLE themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('light', 'dark', 'high-contrast', 'colorful', 'minimal', 'custom')),
    colors JSONB NOT NULL,
    typography JSONB,
    spacing JSONB,
    shadows JSONB,
    borders JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_default BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    preview_image TEXT,
    author VARCHAR(200),
    version VARCHAR(20) DEFAULT '1.0.0'
);

-- Page theme assignments table
CREATE TABLE page_theme_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id VARCHAR(100) NOT NULL,
    theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
    theme_variation_id UUID,
    is_variation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_id)
);

-- Theme variations table
CREATE TABLE theme_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    page_id VARCHAR(100),
    colors JSONB NOT NULL,
    typography JSONB,
    spacing JSONB,
    shadows JSONB,
    borders JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    author VARCHAR(200),
    version VARCHAR(20) DEFAULT '1.0.0',
    variation_depth INTEGER DEFAULT 1,
    lineage_path UUID[] DEFAULT ARRAY[]::UUID[]
);

-- Add foreign key constraint for theme_variation_id
ALTER TABLE page_theme_assignments ADD CONSTRAINT fk_theme_variation
    FOREIGN KEY (theme_variation_id) REFERENCES theme_variations(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_themes_category ON themes(category);
CREATE INDEX idx_themes_is_default ON themes(is_default);
CREATE INDEX idx_themes_is_system ON themes(is_system);
CREATE INDEX idx_themes_created_at ON themes(created_at);
CREATE INDEX idx_page_theme_assignments_page_id ON page_theme_assignments(page_id);
CREATE INDEX idx_page_theme_assignments_theme_id ON page_theme_assignments(theme_id);
CREATE INDEX idx_page_theme_assignments_theme_variation_id ON page_theme_assignments(theme_variation_id);
CREATE INDEX idx_theme_variations_parent_theme_id ON theme_variations(parent_theme_id);
CREATE INDEX idx_theme_variations_page_id ON theme_variations(page_id);
CREATE INDEX idx_theme_variations_created_at ON theme_variations(created_at);
CREATE INDEX idx_theme_variations_lineage_path ON theme_variations USING GIN(lineage_path);

-- Create triggers for updated_at
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_theme_assignments_updated_at BEFORE UPDATE ON page_theme_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
            )
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
    t.category,
    tv.colors,
    tv.typography,
    tv.spacing,
    tv.shadows,
    tv.borders,
    tv.created_at,
    tv.updated_at,
    false as is_default,
    false as is_system,
    t.preview_image,
    tv.author,
    tv.version,
    'variation' as type,
    tv.parent_theme_id,
    tv.lineage_path,
    tv.variation_depth,
    ARRAY[]::jsonb[] as variations
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

-- Insert default system themes
INSERT INTO themes (name, display_name, description, category, colors, typography, spacing, shadows, borders, is_default, is_system, author, version) VALUES
('default-light', 'Default Light', 'Clean light theme with blue accents', 'light', '{
    "primary": "#3b82f6",
    "secondary": "#1d4ed8", 
    "background": "#ffffff",
    "surface": "#f9fafb",
    "text": "#111827",
    "textSecondary": "#6b7280",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "info": "#3b82f6",
    "border": "#e5e7eb",
    "hover": "#f3f4f6",
    "active": "#e5e7eb"
}', '{
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
}', '{
    "xs": "0.25rem",
    "sm": "0.5rem",
    "base": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
}', '{
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "base": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
}', '{
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
}', true, true, 'Claude Dashboard Team', '1.0.0'),

('dashboard-orange', 'Dashboard Orange', 'Warm orange theme for dashboard pages', 'colorful', '{
    "primary": "#f97316",
    "secondary": "#ea580c",
    "background": "#fafafa",
    "surface": "#ffffff",
    "text": "#111827",
    "textSecondary": "#6b7280",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "info": "#3b82f6",
    "border": "#e5e7eb",
    "hover": "#f3f4f6",
    "active": "#e5e7eb"
}', '{
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
}', '{
    "xs": "0.25rem",
    "sm": "0.5rem",
    "base": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
}', '{
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "base": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
}', '{
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
}', false, true, 'Claude Dashboard Team', '1.0.0'),

('tasks-purple', 'Tasks Purple', 'Professional purple theme for task management', 'colorful', '{
    "primary": "#8b5cf6",
    "secondary": "#7c3aed",
    "background": "#fafafa",
    "surface": "#ffffff",
    "text": "#1f2937",
    "textSecondary": "#6b7280",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "info": "#3b82f6",
    "border": "#e5e7eb",
    "hover": "#f3f4f6",
    "active": "#e5e7eb"
}', '{
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
}', '{
    "xs": "0.25rem",
    "sm": "0.5rem",
    "base": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
}', '{
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "base": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
}', '{
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
}', false, true, 'Claude Dashboard Team', '1.0.0'),

('dark-slate', 'Dark Slate', 'Modern dark theme with slate colors', 'dark', '{
    "primary": "#6366f1",
    "secondary": "#4f46e5",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f1f5f9",
    "textSecondary": "#94a3b8",
    "success": "#22c55e",
    "warning": "#eab308",
    "error": "#ef4444",
    "info": "#3b82f6",
    "border": "#334155",
    "hover": "#475569",
    "active": "#64748b"
}', '{
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
}', '{
    "xs": "0.25rem",
    "sm": "0.5rem",
    "base": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
}', '{
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "base": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
}', '{
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
}', false, true, 'Claude Dashboard Team', '1.0.0'),

('emerald-fresh', 'Emerald Fresh', 'Fresh green theme with emerald accents', 'colorful', '{
    "primary": "#10b981",
    "secondary": "#059669",
    "background": "#f0fdf4",
    "surface": "#ffffff",
    "text": "#064e3b",
    "textSecondary": "#047857",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "info": "#3b82f6",
    "border": "#d1fae5",
    "hover": "#ecfdf5",
    "active": "#d1fae5"
}', '{
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
}', '{
    "xs": "0.25rem",
    "sm": "0.5rem",
    "base": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
}', '{
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "base": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
}', '{
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
}', false, true, 'Claude Dashboard Team', '1.0.0'),

('rose-elegant', 'Rose Elegant', 'Elegant rose theme with warm tones', 'colorful', '{
    "primary": "#f43f5e",
    "secondary": "#e11d48",
    "background": "#fff1f2",
    "surface": "#ffffff",
    "text": "#881337",
    "textSecondary": "#be185d",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "info": "#3b82f6",
    "border": "#fecdd3",
    "hover": "#fef2f2",
    "active": "#fecdd3"
}', '{
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
}', '{
    "xs": "0.25rem",
    "sm": "0.5rem",
    "base": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
}', '{
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "base": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
}', '{
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
}', false, true, 'Claude Dashboard Team', '1.0.0');

-- Set default page theme assignments
INSERT INTO page_theme_assignments (page_id, theme_id) VALUES
('dashboard', (SELECT id FROM themes WHERE name = 'dashboard-orange')),
('databases', (SELECT id FROM themes WHERE name = 'default-light')),
('tasks', (SELECT id FROM themes WHERE name = 'tasks-purple'))
ON CONFLICT (page_id) DO NOTHING;

-- Verify the setup
SELECT 
    'Setup complete!' as status,
    COUNT(*) as theme_count
FROM themes;

SELECT 
    name,
    display_name,
    category,
    CASE WHEN description IS NOT NULL THEN 'YES' ELSE 'NO' END as has_description,
    CASE WHEN typography IS NOT NULL THEN 'YES' ELSE 'NO' END as has_typography,
    CASE WHEN spacing IS NOT NULL THEN 'YES' ELSE 'NO' END as has_spacing,
    CASE WHEN shadows IS NOT NULL THEN 'YES' ELSE 'NO' END as has_shadows,
    CASE WHEN borders IS NOT NULL THEN 'YES' ELSE 'NO' END as has_borders,
    is_default,
    is_system
FROM themes 
ORDER BY name;