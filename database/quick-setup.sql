-- Quick Database Setup for AVA Dashboard
-- Run this in your Supabase SQL Editor to set up the basic tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'custom',
  colors JSONB NOT NULL,
  typography JSONB,
  spacing JSONB,
  shadows JSONB,
  borders JSONB,
  author VARCHAR(100),
  is_system BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_theme_assignments table
CREATE TABLE IF NOT EXISTS page_theme_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id VARCHAR(100) NOT NULL UNIQUE,
  theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  theme_variation_id UUID,
  is_variation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  category VARCHAR(50),
  assigned_to VARCHAR(100),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_theme_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (demo purposes)
CREATE POLICY "public_read_themes" ON themes FOR SELECT TO anon USING (true);
CREATE POLICY "public_write_themes" ON themes FOR ALL TO anon USING (true);

CREATE POLICY "public_read_page_theme_assignments" ON page_theme_assignments FOR SELECT TO anon USING (true);
CREATE POLICY "public_write_page_theme_assignments" ON page_theme_assignments FOR ALL TO anon USING (true);

CREATE POLICY "public_read_tasks" ON tasks FOR SELECT TO anon USING (true);
CREATE POLICY "public_write_tasks" ON tasks FOR ALL TO anon USING (true);

-- Insert sample themes
INSERT INTO themes (name, display_name, description, category, colors, typography, spacing, shadows, borders, is_system, is_default, author) VALUES
('default-light', 'Default Light', 'Clean and modern light theme', 'light', 
 '{"primary": "#3b82f6", "secondary": "#64748b", "background": "#ffffff", "surface": "#f8fafc", "text": "#1e293b", "textSecondary": "#64748b", "border": "#e2e8f0", "success": "#10b981", "warning": "#f59e0b", "error": "#ef4444"}',
 '{"fontFamily": "Inter, system-ui, sans-serif", "fontSize": {"small": "14px", "base": "16px", "large": "18px", "xl": "20px"}, "fontWeight": {"normal": "400", "medium": "500", "semibold": "600", "bold": "700"}}',
 '{"xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px", "2xl": "48px"}',
 '{"sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)", "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)", "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)", "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)"}',
 '{"radius": {"sm": "4px", "md": "8px", "lg": "12px", "xl": "16px", "full": "9999px"}, "width": {"thin": "1px", "medium": "2px", "thick": "4px"}}',
 true, true, 'AVA Team')
ON CONFLICT (name) DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (title, description, status, priority, category, assigned_to, metadata) VALUES
('Setup Database Connection', 'Configure the initial database connection for the application', 'completed', 'high', 'setup', 'system', '{"estimatedHours": 2, "tags": ["database", "setup"]}'),
('Create Theme System', 'Implement dynamic theme switching functionality', 'in_progress', 'high', 'development', 'system', '{"estimatedHours": 8, "tags": ["themes", "ui"]}'),
('Add Component Library', 'Build reusable component library for the dashboard', 'pending', 'medium', 'development', 'system', '{"estimatedHours": 12, "tags": ["components", "library"]}');