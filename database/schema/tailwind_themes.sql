-- Tailwind Themes Database Schema
-- Creates tables for storing theme definitions and page theme assignments

-- Main themes table
CREATE TABLE IF NOT EXISTS themes (
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
CREATE TABLE IF NOT EXISTS page_theme_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id VARCHAR(100) NOT NULL,
    theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_themes_category ON themes(category);
CREATE INDEX IF NOT EXISTS idx_themes_is_default ON themes(is_default);
CREATE INDEX IF NOT EXISTS idx_themes_is_system ON themes(is_system);
CREATE INDEX IF NOT EXISTS idx_themes_created_at ON themes(created_at);
CREATE INDEX IF NOT EXISTS idx_page_theme_assignments_page_id ON page_theme_assignments(page_id);
CREATE INDEX IF NOT EXISTS idx_page_theme_assignments_theme_id ON page_theme_assignments(theme_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_theme_assignments_updated_at BEFORE UPDATE ON page_theme_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
}', NULL, NULL, NULL, NULL, false, true, 'Claude Dashboard Team', '1.0.0'),

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
}', NULL, NULL, NULL, NULL, false, true, 'Claude Dashboard Team', '1.0.0'),

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
}', NULL, NULL, NULL, NULL, false, true, 'Claude Dashboard Team', '1.0.0'),

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
}', NULL, NULL, NULL, NULL, false, true, 'Claude Dashboard Team', '1.0.0'),

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
}', NULL, NULL, NULL, NULL, false, true, 'Claude Dashboard Team', '1.0.0');

-- Set default page theme assignments
INSERT INTO page_theme_assignments (page_id, theme_id) VALUES
('dashboard', (SELECT id FROM themes WHERE name = 'dashboard-orange')),
('databases', (SELECT id FROM themes WHERE name = 'default-light')),
('tasks', (SELECT id FROM themes WHERE name = 'tasks-purple'))
ON CONFLICT (page_id) DO NOTHING;