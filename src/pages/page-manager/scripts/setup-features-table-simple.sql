-- Simple Page Features Table Setup
-- Creates the page_features table without complex DO blocks

-- Create the page_features table with all required fields
CREATE TABLE IF NOT EXISTS page_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'planned' CHECK (status IN ('active', 'inactive', 'deprecated', 'planned')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    category TEXT DEFAULT 'functionality' CHECK (category IN ('ui_component', 'functionality', 'integration', 'performance', 'security', 'accessibility', 'analytics', 'other')),
    implementation_status TEXT DEFAULT 'not_started' CHECK (implementation_status IN ('not_started', 'in_progress', 'completed', 'testing', 'deployed', 'needs_review')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    dependencies TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_features_page_id ON page_features(page_id);
CREATE INDEX IF NOT EXISTS idx_page_features_status ON page_features(status);
CREATE INDEX IF NOT EXISTS idx_page_features_priority ON page_features(priority);
CREATE INDEX IF NOT EXISTS idx_page_features_category ON page_features(category);
CREATE INDEX IF NOT EXISTS idx_page_features_implementation ON page_features(implementation_status);
CREATE INDEX IF NOT EXISTS idx_page_features_created_at ON page_features(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_features_updated_at ON page_features(updated_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_page_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_page_features_updated_at ON page_features;
CREATE TRIGGER update_page_features_updated_at
    BEFORE UPDATE ON page_features
    FOR EACH ROW
    EXECUTE FUNCTION update_page_features_updated_at();

-- Insert sample data for demonstration
INSERT INTO page_features (page_id, name, description, status, priority, category, implementation_status, estimated_hours) VALUES
('dashboard', 'Real-time Activity Feed', 'Display live activity updates from all dashboard components', 'active', 'high', 'functionality', 'completed', 8.0),
('dashboard', 'Dark Mode Toggle', 'Add dark/light theme switching capability', 'active', 'medium', 'ui_component', 'in_progress', 4.0),
('dashboard', 'Export Dashboard Data', 'Allow users to export dashboard data as CSV/JSON', 'planned', 'low', 'functionality', 'not_started', 6.0),
('databases', 'Query Performance Analytics', 'Track and display query execution times and optimization suggestions', 'active', 'high', 'analytics', 'testing', 12.0),
('databases', 'Schema Version Control', 'Implement database schema versioning and migration tracking', 'active', 'critical', 'functionality', 'in_progress', 20.0),
('databases', 'Automated Backup Scheduling', 'Schedule automatic database backups with retention policies', 'planned', 'high', 'functionality', 'not_started', 16.0),
('tasks', 'Kanban Board Customization', 'Allow users to customize kanban columns and workflow states', 'active', 'medium', 'ui_component', 'completed', 10.0),
('tasks', 'Task Time Tracking', 'Track time spent on individual tasks and generate reports', 'active', 'high', 'functionality', 'in_progress', 14.0),
('tasks', 'Team Collaboration Features', 'Add comments, mentions, and real-time collaboration', 'planned', 'medium', 'functionality', 'not_started', 18.0),
('page-manager', 'Visual Page Builder', 'Drag-and-drop interface for building page layouts', 'planned', 'critical', 'ui_component', 'not_started', 40.0),
('page-manager', 'Component Library Browser', 'Browse and preview available components before adding', 'active', 'medium', 'ui_component', 'in_progress', 8.0),
('page-manager', 'Page Template System', 'Create and manage reusable page templates', 'planned', 'high', 'functionality', 'not_started', 12.0)
ON CONFLICT DO NOTHING;