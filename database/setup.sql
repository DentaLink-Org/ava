-- =================================================
-- AVA Dashboard Database Schema Setup
-- =================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================
-- THEMES TABLES
-- =================================================

-- Themes table for storing theme configurations
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

-- Theme variations table for storing theme variations
CREATE TABLE IF NOT EXISTS theme_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  description TEXT,
  colors JSONB NOT NULL,
  typography JSONB,
  spacing JSONB,
  shadows JSONB,
  borders JSONB,
  page_id VARCHAR(100),
  variation_depth INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page theme assignments table
CREATE TABLE IF NOT EXISTS page_theme_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id VARCHAR(100) NOT NULL UNIQUE,
  theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  theme_variation_id UUID REFERENCES theme_variations(id) ON DELETE SET NULL,
  is_variation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================
-- COMPONENTS TABLES
-- =================================================

-- Components table for storing reusable components
CREATE TABLE IF NOT EXISTS components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'custom',
  type VARCHAR(50) NOT NULL,
  props JSONB DEFAULT '{}',
  styles JSONB DEFAULT '{}',
  code TEXT,
  framework VARCHAR(50) DEFAULT 'react',
  version VARCHAR(20) DEFAULT '1.0.0',
  author VARCHAR(100),
  is_system BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Component variants table
CREATE TABLE IF NOT EXISTS component_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID REFERENCES components(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  props JSONB DEFAULT '{}',
  styles JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================
-- PAGES TABLES
-- =================================================

-- Pages table for storing page configurations
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  layout JSONB DEFAULT '{}',
  meta JSONB DEFAULT '{}',
  navigation JSONB DEFAULT '{}',
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page components table for storing component assignments
CREATE TABLE IF NOT EXISTS page_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  component_id UUID REFERENCES components(id) ON DELETE CASCADE,
  component_type VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  functionality TEXT,
  status VARCHAR(50) DEFAULT 'active',
  priority VARCHAR(20) DEFAULT 'medium',
  category VARCHAR(100) DEFAULT 'general',
  group_name VARCHAR(100) DEFAULT 'general',
  implementation_status VARCHAR(50) DEFAULT 'not_started',
  position JSONB DEFAULT '{}',
  props JSONB DEFAULT '{}',
  styles JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(100) DEFAULT 'system',
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2),
  dependencies TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  file_path VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================
-- TASKS TABLES
-- =================================================

-- Tasks table for task management
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

-- Task comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  author VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================
-- DATABASES TABLES
-- =================================================

-- Database connections table
CREATE TABLE IF NOT EXISTS database_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL,
  connection_string TEXT,
  host VARCHAR(255),
  port INTEGER,
  database_name VARCHAR(100),
  username VARCHAR(100),
  ssl_enabled BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Database schemas table
CREATE TABLE IF NOT EXISTS database_schemas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES database_connections(id) ON DELETE CASCADE,
  schema_name VARCHAR(100) NOT NULL,
  tables JSONB DEFAULT '[]',
  views JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User databases table for database management UI
CREATE TABLE IF NOT EXISTS user_databases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  connection_config JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  record_count INTEGER DEFAULT 0,
  table_count INTEGER DEFAULT 0,
  size VARCHAR(50) DEFAULT '0 MB',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================
-- PAGE FEATURES TABLES
-- =================================================

-- Create custom types for features
DO $$ BEGIN
    CREATE TYPE feature_status AS ENUM ('active', 'inactive', 'deprecated', 'planned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE feature_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE feature_category AS ENUM (
        'ui_component', 
        'functionality', 
        'integration', 
        'performance', 
        'security', 
        'accessibility', 
        'analytics', 
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE implementation_status AS ENUM (
        'not_started', 
        'in_progress', 
        'completed', 
        'testing', 
        'deployed', 
        'needs_review'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Page features table for storing page feature tracking
CREATE TABLE IF NOT EXISTS page_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status feature_status DEFAULT 'planned',
    priority feature_priority DEFAULT 'medium',
    category feature_category DEFAULT 'functionality',
    implementation_status implementation_status DEFAULT 'not_started',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT DEFAULT 'system',
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    dependencies TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- =================================================
-- ENABLE ROW LEVEL SECURITY
-- =================================================

ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_theme_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_features ENABLE ROW LEVEL SECURITY;

-- =================================================
-- CREATE RLS POLICIES
-- =================================================

-- Allow public read access to all tables
CREATE POLICY "public_read_themes" ON themes FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_theme_variations" ON theme_variations FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_page_theme_assignments" ON page_theme_assignments FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_components" ON components FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_component_variants" ON component_variants FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_pages" ON pages FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_page_components" ON page_components FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_tasks" ON tasks FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_task_comments" ON task_comments FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_database_connections" ON database_connections FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_database_schemas" ON database_schemas FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_user_databases" ON user_databases FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_page_features" ON page_features FOR SELECT TO anon USING (true);

-- Allow public write access (for demo purposes - restrict in production)
CREATE POLICY "public_write_themes" ON themes FOR ALL TO anon USING (true);
CREATE POLICY "public_write_theme_variations" ON theme_variations FOR ALL TO anon USING (true);
CREATE POLICY "public_write_page_theme_assignments" ON page_theme_assignments FOR ALL TO anon USING (true);
CREATE POLICY "public_write_components" ON components FOR ALL TO anon USING (true);
CREATE POLICY "public_write_component_variants" ON component_variants FOR ALL TO anon USING (true);
CREATE POLICY "public_write_pages" ON pages FOR ALL TO anon USING (true);
CREATE POLICY "public_write_page_components" ON page_components FOR ALL TO anon USING (true);
CREATE POLICY "public_write_tasks" ON tasks FOR ALL TO anon USING (true);
CREATE POLICY "public_write_task_comments" ON task_comments FOR ALL TO anon USING (true);
CREATE POLICY "public_write_database_connections" ON database_connections FOR ALL TO anon USING (true);
CREATE POLICY "public_write_database_schemas" ON database_schemas FOR ALL TO anon USING (true);
CREATE POLICY "public_write_user_databases" ON user_databases FOR ALL TO anon USING (true);
CREATE POLICY "public_write_page_features" ON page_features FOR ALL TO anon USING (true);

-- =================================================
-- INSERT SAMPLE DATA
-- =================================================

-- Insert default themes
INSERT INTO themes (name, display_name, description, category, colors, typography, spacing, shadows, borders, is_system, is_default, author) VALUES
('default-light', 'Default Light', 'Clean and modern light theme', 'light', 
 '{"primary": "#3b82f6", "secondary": "#64748b", "background": "#ffffff", "surface": "#f8fafc", "text": "#1e293b", "textSecondary": "#64748b", "border": "#e2e8f0", "success": "#10b981", "warning": "#f59e0b", "error": "#ef4444"}',
 '{"fontFamily": "Inter, system-ui, sans-serif", "fontSize": {"small": "14px", "base": "16px", "large": "18px", "xl": "20px"}, "fontWeight": {"normal": "400", "medium": "500", "semibold": "600", "bold": "700"}}',
 '{"xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px", "2xl": "48px"}',
 '{"sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)", "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)", "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)", "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)"}',
 '{"radius": {"sm": "4px", "md": "8px", "lg": "12px", "xl": "16px", "full": "9999px"}, "width": {"thin": "1px", "medium": "2px", "thick": "4px"}}',
 true, true, 'AVA Team'),

('modern-dark', 'Modern Dark', 'Sleek dark theme with blue accents', 'dark',
 '{"primary": "#3b82f6", "secondary": "#6366f1", "background": "#0f172a", "surface": "#1e293b", "text": "#f1f5f9", "textSecondary": "#94a3b8", "border": "#334155", "success": "#10b981", "warning": "#f59e0b", "error": "#ef4444"}',
 '{"fontFamily": "Inter, system-ui, sans-serif", "fontSize": {"small": "14px", "base": "16px", "large": "18px", "xl": "20px"}, "fontWeight": {"normal": "400", "medium": "500", "semibold": "600", "bold": "700"}}',
 '{"xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px", "2xl": "48px"}',
 '{"sm": "0 1px 2px 0 rgba(0, 0, 0, 0.3)", "md": "0 4px 6px -1px rgba(0, 0, 0, 0.4)", "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.4)", "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.4)"}',
 '{"radius": {"sm": "4px", "md": "8px", "lg": "12px", "xl": "16px", "full": "9999px"}, "width": {"thin": "1px", "medium": "2px", "thick": "4px"}}',
 true, false, 'AVA Team'),

('professional-blue', 'Professional Blue', 'Corporate-friendly blue theme', 'corporate',
 '{"primary": "#1e40af", "secondary": "#3730a3", "background": "#f8fafc", "surface": "#ffffff", "text": "#1e293b", "textSecondary": "#475569", "border": "#e2e8f0", "success": "#059669", "warning": "#d97706", "error": "#dc2626"}',
 '{"fontFamily": "Inter, system-ui, sans-serif", "fontSize": {"small": "14px", "base": "16px", "large": "18px", "xl": "20px"}, "fontWeight": {"normal": "400", "medium": "500", "semibold": "600", "bold": "700"}}',
 '{"xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px", "2xl": "48px"}',
 '{"sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)", "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)", "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)", "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)"}',
 '{"radius": {"sm": "6px", "md": "10px", "lg": "14px", "xl": "18px", "full": "9999px"}, "width": {"thin": "1px", "medium": "2px", "thick": "4px"}}',
 true, false, 'AVA Team');

-- Insert sample pages
INSERT INTO pages (route_id, title, description, layout, meta, navigation, is_system, is_active) VALUES
('dashboard', 'Dashboard', 'Main dashboard overview', 
 '{"type": "flex", "direction": "column", "gap": 6, "padding": 6}',
 '{"author": "AVA Team", "version": "1.0.0", "tags": ["dashboard", "overview"]}',
 '{"showSidebar": true, "customHeader": false, "breadcrumbs": true}',
 true, true),

('databases', 'Databases', 'Database management interface',
 '{"type": "flex", "direction": "column", "gap": 4, "padding": 4}',
 '{"author": "AVA Team", "version": "1.0.0", "tags": ["databases", "management"]}',
 '{"showSidebar": true, "customHeader": false, "breadcrumbs": true}',
 true, true),

('tasks', 'Tasks', 'Task management system',
 '{"type": "flex", "direction": "column", "gap": 4, "padding": 4}',
 '{"author": "AVA Team", "version": "1.0.0", "tags": ["tasks", "management"]}',
 '{"showSidebar": true, "customHeader": false, "breadcrumbs": true}',
 true, true),

('themes', 'Themes', 'Theme gallery and customization',
 '{"type": "flex", "direction": "column", "gap": 6, "padding": 6}',
 '{"author": "AVA Team", "version": "1.0.0", "tags": ["themes", "customization"]}',
 '{"showSidebar": true, "customHeader": false, "breadcrumbs": true}',
 true, true);

-- Insert sample tasks
INSERT INTO tasks (title, description, status, priority, category, assigned_to, metadata) VALUES
('Setup Database Connection', 'Configure the initial database connection for the application', 'completed', 'high', 'setup', 'system', '{"estimatedHours": 2, "tags": ["database", "setup"]}'),
('Create Theme System', 'Implement dynamic theme switching functionality', 'in_progress', 'high', 'development', 'system', '{"estimatedHours": 8, "tags": ["themes", "ui"]}'),
('Add Component Library', 'Build reusable component library for the dashboard', 'pending', 'medium', 'development', 'system', '{"estimatedHours": 12, "tags": ["components", "library"]}'),
('Write Documentation', 'Create comprehensive documentation for the system', 'pending', 'low', 'documentation', 'system', '{"estimatedHours": 6, "tags": ["docs", "help"]}');

-- Insert sample components
INSERT INTO components (name, display_name, description, category, type, props, styles, framework, author, is_system, tags) VALUES
('WelcomeHeader', 'Welcome Header', 'Main welcome header component', 'layout', 'header',
 '{"title": "Welcome to AVA Dashboard", "subtitle": "Your intelligent admin interface"}',
 '{"padding": "2rem", "textAlign": "center"}',
 'react', 'AVA Team', true, ARRAY['header', 'welcome']),

('KPICards', 'KPI Cards', 'Key performance indicator cards', 'data', 'cards',
 '{"metrics": [{"label": "Active Users", "value": "1,234", "change": "+12%"}, {"label": "Revenue", "value": "$45,678", "change": "+8%"}]}',
 '{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(250px, 1fr))", "gap": "1rem"}',
 'react', 'AVA Team', true, ARRAY['kpi', 'metrics', 'cards']);

-- Insert sample database connection
INSERT INTO database_connections (name, display_name, type, host, port, database_name, username, ssl_enabled, is_active) VALUES
('main_supabase', 'Main Supabase Database', 'postgresql', 'db.supabase.co', 5432, 'postgres', 'postgres', true, true);