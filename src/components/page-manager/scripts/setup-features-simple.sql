-- Simple Features Table Setup for Claude Dashboard
-- Run this in your Supabase SQL Editor

-- Create the page_features table
CREATE TABLE IF NOT EXISTS page_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'planned',
    priority TEXT DEFAULT 'medium',
    category TEXT DEFAULT 'functionality',
    implementation_status TEXT DEFAULT 'not_started',
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
CREATE INDEX IF NOT EXISTS idx_page_features_updated_at ON page_features(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE page_features ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust based on your auth needs)
CREATE POLICY "Enable all operations for page_features" ON page_features
    FOR ALL USING (true) WITH CHECK (true);

-- Insert sample features data
INSERT INTO page_features (page_id, name, description, status, priority, category, implementation_status, estimated_hours) VALUES
('dashboard', 'Real-time Activity Feed', 'Display live activity updates from all dashboard components', 'active', 'high', 'functionality', 'completed', 8.0),
('dashboard', 'Dark Mode Toggle', 'Add dark/light theme switching capability', 'active', 'medium', 'ui_component', 'in_progress', 4.0),
('dashboard', 'Export Dashboard Data', 'Allow users to export dashboard data as CSV/JSON', 'planned', 'low', 'functionality', 'not_started', 6.0),
('dashboard', 'Widget Customization', 'Enable users to customize and reorder dashboard widgets', 'planned', 'high', 'ui_component', 'not_started', 12.0),
('databases', 'Query Performance Analytics', 'Track and display query execution times and optimization suggestions', 'active', 'high', 'analytics', 'testing', 12.0),
('databases', 'Schema Version Control', 'Implement database schema versioning and migration tracking', 'active', 'critical', 'functionality', 'in_progress', 20.0),
('databases', 'Automated Backup Scheduling', 'Schedule automatic database backups with retention policies', 'planned', 'high', 'functionality', 'not_started', 16.0),
('databases', 'Visual Query Builder', 'Drag-and-drop interface for building SQL queries', 'planned', 'medium', 'ui_component', 'not_started', 20.0),
('tasks', 'Kanban Board Customization', 'Allow users to customize kanban columns and workflow states', 'active', 'medium', 'ui_component', 'completed', 10.0),
('tasks', 'Task Time Tracking', 'Track time spent on individual tasks and generate reports', 'active', 'high', 'functionality', 'in_progress', 14.0),
('tasks', 'Team Collaboration Features', 'Add comments, mentions, and real-time collaboration', 'planned', 'medium', 'functionality', 'not_started', 18.0),
('tasks', 'Task Dependencies', 'Create and manage task dependencies with visual graphs', 'planned', 'low', 'functionality', 'not_started', 12.0),
('page-manager', 'Visual Page Builder', 'Drag-and-drop interface for building page layouts', 'planned', 'critical', 'ui_component', 'not_started', 40.0),
('page-manager', 'Component Library Browser', 'Browse and preview available components before adding', 'active', 'medium', 'ui_component', 'in_progress', 8.0),
('page-manager', 'Page Template System', 'Create and manage reusable page templates', 'planned', 'high', 'functionality', 'not_started', 12.0),
('page-manager', 'Page Performance Monitor', 'Monitor page load times and component performance', 'planned', 'medium', 'performance', 'not_started', 10.0)
ON CONFLICT DO NOTHING;

-- Create a view for feature statistics (optional but useful)
CREATE OR REPLACE VIEW feature_stats AS
SELECT 
    page_id,
    COUNT(*) as total_features,
    COUNT(*) FILTER (WHERE implementation_status IN ('completed', 'deployed')) as completed_features,
    COUNT(*) FILTER (WHERE implementation_status = 'in_progress') as in_progress_features,
    COUNT(*) FILTER (WHERE implementation_status = 'not_started') as planned_features,
    COUNT(*) FILTER (WHERE priority IN ('high', 'critical')) as high_priority_features,
    ROUND(
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE implementation_status IN ('completed', 'deployed'))::DECIMAL / COUNT(*)) * 100
            ELSE 0 
        END, 2
    ) as completion_percentage
FROM page_features
GROUP BY page_id;

-- Grant permissions (Supabase handles this automatically for authenticated users)
-- But we'll add it for completeness
GRANT ALL ON page_features TO authenticated;
GRANT ALL ON page_features TO anon;
GRANT ALL ON feature_stats TO authenticated;
GRANT ALL ON feature_stats TO anon;