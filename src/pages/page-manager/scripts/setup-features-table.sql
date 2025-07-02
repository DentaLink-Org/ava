-- Page Features Table Setup
-- Creates the page_features table and related functions for the Claude Dashboard

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

-- Create the page_features table
CREATE TABLE IF NOT EXISTS page_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status feature_status DEFAULT 'planned',
    priority feature_priority DEFAULT 'medium',
    category feature_category DEFAULT 'functionality',
    implementation_status implementation_status DEFAULT 'not_started',
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
CREATE INDEX IF NOT EXISTS idx_page_features_name_search ON page_features USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_page_features_description_search ON page_features USING gin(to_tsvector('english', description));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
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
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to get feature statistics
CREATE OR REPLACE FUNCTION get_feature_stats(target_page_id TEXT DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    WITH stats AS (
        SELECT 
            COUNT(*) as total_features,
            COUNT(*) FILTER (WHERE status = 'active') as active_features,
            COUNT(*) FILTER (WHERE status = 'inactive') as inactive_features,
            COUNT(*) FILTER (WHERE status = 'deprecated') as deprecated_features,
            COUNT(*) FILTER (WHERE status = 'planned') as planned_features,
            COUNT(*) FILTER (WHERE priority = 'low') as low_priority,
            COUNT(*) FILTER (WHERE priority = 'medium') as medium_priority,
            COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
            COUNT(*) FILTER (WHERE priority = 'critical') as critical_priority,
            COUNT(*) FILTER (WHERE implementation_status IN ('completed', 'deployed')) as completed_features,
            COUNT(*) FILTER (WHERE implementation_status = 'in_progress') as in_progress_features,
            COALESCE(SUM(estimated_hours), 0) as total_estimated_hours,
            COALESCE(SUM(actual_hours), 0) as total_actual_hours
        FROM page_features 
        WHERE (target_page_id IS NULL OR page_id = target_page_id)
    )
    SELECT json_build_object(
        'total_features', total_features,
        'by_status', json_build_object(
            'active', active_features,
            'inactive', inactive_features,
            'deprecated', deprecated_features,
            'planned', planned_features
        ),
        'by_priority', json_build_object(
            'low', low_priority,
            'medium', medium_priority,
            'high', high_priority,
            'critical', critical_priority
        ),
        'completion_percentage', 
            CASE 
                WHEN total_features > 0 THEN ROUND((completed_features::DECIMAL / total_features) * 100, 2)
                ELSE 0 
            END,
        'in_progress_features', in_progress_features,
        'total_estimated_hours', total_estimated_hours,
        'total_actual_hours', total_actual_hours
    ) INTO result
    FROM stats;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to get page feature summaries
CREATE OR REPLACE FUNCTION get_page_feature_summaries()
RETURNS TABLE (
    page_id TEXT,
    feature_count BIGINT,
    completed_features BIGINT,
    in_progress_features BIGINT,
    planned_features BIGINT,
    high_priority_features BIGINT,
    last_updated TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pf.page_id,
        COUNT(*) as feature_count,
        COUNT(*) FILTER (WHERE pf.implementation_status IN ('completed', 'deployed')) as completed_features,
        COUNT(*) FILTER (WHERE pf.implementation_status = 'in_progress') as in_progress_features,
        COUNT(*) FILTER (WHERE pf.implementation_status = 'not_started') as planned_features,
        COUNT(*) FILTER (WHERE pf.priority IN ('high', 'critical')) as high_priority_features,
        MAX(pf.updated_at) as last_updated
    FROM page_features pf
    GROUP BY pf.page_id
    ORDER BY last_updated DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to search features by text
CREATE OR REPLACE FUNCTION search_features(
    search_query TEXT,
    target_page_id TEXT DEFAULT NULL,
    result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    page_id TEXT,
    name TEXT,
    description TEXT,
    status feature_status,
    priority feature_priority,
    category feature_category,
    implementation_status implementation_status,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pf.id,
        pf.page_id,
        pf.name,
        pf.description,
        pf.status,
        pf.priority,
        pf.category,
        pf.implementation_status,
        pf.created_at,
        pf.updated_at,
        ts_rank(
            to_tsvector('english', pf.name || ' ' || pf.description),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM page_features pf
    WHERE 
        to_tsvector('english', pf.name || ' ' || pf.description) @@ plainto_tsquery('english', search_query)
        AND (target_page_id IS NULL OR pf.page_id = target_page_id)
    ORDER BY rank DESC, pf.updated_at DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function for table initialization (called from the API)
CREATE OR REPLACE FUNCTION create_page_features_table_if_not_exists()
RETURNS BOOLEAN AS $$
BEGIN
    -- This function exists to be called from the API
    -- The actual table creation is handled above
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) for the table
ALTER TABLE page_features ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (adjust based on your authentication needs)
-- For now, allow all operations for demonstration
CREATE POLICY "Allow all operations on page_features" ON page_features
    FOR ALL USING (true) WITH CHECK (true);

-- Insert some sample data for demonstration
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

-- Grant necessary permissions (adjust based on your security requirements)
-- For Supabase, these permissions are typically handled through the dashboard
-- GRANT ALL ON page_features TO authenticated;
-- GRANT ALL ON page_features TO anon;

COMMENT ON TABLE page_features IS 'Stores features for each dashboard page with implementation tracking';
COMMENT ON COLUMN page_features.page_id IS 'Identifier of the page this feature belongs to';
COMMENT ON COLUMN page_features.name IS 'Display name of the feature';
COMMENT ON COLUMN page_features.description IS 'Detailed description of what the feature does';
COMMENT ON COLUMN page_features.status IS 'Current status of the feature (active, inactive, deprecated, planned)';
COMMENT ON COLUMN page_features.priority IS 'Priority level for implementation (low, medium, high, critical)';
COMMENT ON COLUMN page_features.category IS 'Category type of the feature';
COMMENT ON COLUMN page_features.implementation_status IS 'Current implementation progress';
COMMENT ON COLUMN page_features.dependencies IS 'Array of feature IDs that this feature depends on';
COMMENT ON COLUMN page_features.tags IS 'Array of tags for categorization and search';
COMMENT ON COLUMN page_features.metadata IS 'Additional structured data for the feature';