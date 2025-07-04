-- Milestone Management Setup Script
-- This script sets up the complete milestone management system
-- Run this after the main database setup to add milestone functionality

-- Import the milestone schema
\i 'schema/milestones.sql'

-- Run the milestone migration
\i 'migrations/002_add_milestone_tables.sql'

-- Create additional helper functions for milestone management

-- Function to get milestone completion rate for a project
CREATE OR REPLACE FUNCTION get_project_milestone_completion_rate(project_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_milestones INTEGER;
    completed_milestones INTEGER;
    completion_rate DECIMAL(5,2);
BEGIN
    -- Count total milestones for the project
    SELECT COUNT(*) INTO total_milestones
    FROM milestones 
    WHERE project_id = project_uuid AND is_archived = FALSE;
    
    -- Count completed milestones
    SELECT COUNT(*) INTO completed_milestones
    FROM milestones 
    WHERE project_id = project_uuid 
    AND status = 'completed' 
    AND is_archived = FALSE;
    
    -- Calculate completion rate
    IF total_milestones = 0 THEN
        completion_rate := 0.00;
    ELSE
        completion_rate := (completed_milestones::DECIMAL / total_milestones::DECIMAL) * 100;
    END IF;
    
    RETURN completion_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to get overdue milestones for a project
CREATE OR REPLACE FUNCTION get_overdue_milestones(project_uuid UUID DEFAULT NULL)
RETURNS TABLE (
    milestone_id UUID,
    title VARCHAR(200),
    due_date TIMESTAMP WITH TIME ZONE,
    days_overdue INTEGER,
    progress DECIMAL(5,2),
    project_name VARCHAR(200)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.title,
        m.due_date,
        EXTRACT(DAY FROM NOW() - m.due_date)::INTEGER,
        m.progress,
        p.name
    FROM milestones m
    JOIN projects p ON m.project_id = p.id
    WHERE m.due_date < NOW()
    AND m.status NOT IN ('completed', 'cancelled')
    AND m.is_archived = FALSE
    AND (project_uuid IS NULL OR m.project_id = project_uuid)
    ORDER BY m.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get upcoming milestones (next 30 days)
CREATE OR REPLACE FUNCTION get_upcoming_milestones(project_uuid UUID DEFAULT NULL, days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
    milestone_id UUID,
    title VARCHAR(200),
    due_date TIMESTAMP WITH TIME ZONE,
    days_until_due INTEGER,
    progress DECIMAL(5,2),
    project_name VARCHAR(200),
    status VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.title,
        m.due_date,
        EXTRACT(DAY FROM m.due_date - NOW())::INTEGER,
        m.progress,
        p.name,
        m.status
    FROM milestones m
    JOIN projects p ON m.project_id = p.id
    WHERE m.due_date BETWEEN NOW() AND NOW() + INTERVAL '1 day' * days_ahead
    AND m.status NOT IN ('completed', 'cancelled')
    AND m.is_archived = FALSE
    AND (project_uuid IS NULL OR m.project_id = project_uuid)
    ORDER BY m.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get milestone dependencies graph
CREATE OR REPLACE FUNCTION get_milestone_dependencies_graph(project_uuid UUID)
RETURNS TABLE (
    milestone_id UUID,
    milestone_title VARCHAR(200),
    depends_on_id UUID,
    depends_on_title VARCHAR(200),
    dependency_type VARCHAR(50),
    lag_days INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.title,
        md.depends_on_id,
        m2.title,
        md.dependency_type,
        md.lag_days
    FROM milestones m
    JOIN milestone_dependencies md ON m.id = md.milestone_id
    JOIN milestones m2 ON md.depends_on_id = m2.id
    WHERE m.project_id = project_uuid
    AND m.is_archived = FALSE
    AND m2.is_archived = FALSE
    ORDER BY m.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate critical path for a project
CREATE OR REPLACE FUNCTION calculate_critical_path(project_uuid UUID)
RETURNS TABLE (
    milestone_id UUID,
    title VARCHAR(200),
    due_date TIMESTAMP WITH TIME ZONE,
    earliest_start TIMESTAMP WITH TIME ZONE,
    latest_start TIMESTAMP WITH TIME ZONE,
    is_critical BOOLEAN
) AS $$
BEGIN
    -- This is a simplified critical path calculation
    -- In a full implementation, this would use proper CPM algorithms
    
    RETURN QUERY
    WITH milestone_levels AS (
        -- Recursive CTE to calculate dependency levels
        SELECT 
            m.id,
            m.title,
            m.due_date,
            m.created_at as earliest_start,
            0 as level
        FROM milestones m
        WHERE m.project_id = project_uuid
        AND NOT EXISTS (
            SELECT 1 FROM milestone_dependencies md 
            WHERE md.milestone_id = m.id
        )
        
        UNION ALL
        
        SELECT 
            m.id,
            m.title,
            m.due_date,
            GREATEST(ml.earliest_start + INTERVAL '1 day' * COALESCE(md.lag_days, 0), m.created_at),
            ml.level + 1
        FROM milestones m
        JOIN milestone_dependencies md ON m.id = md.milestone_id
        JOIN milestone_levels ml ON md.depends_on_id = ml.id
        WHERE m.project_id = project_uuid
    )
    SELECT 
        ml.id,
        ml.title,
        ml.due_date,
        ml.earliest_start,
        ml.due_date - INTERVAL '1 day' * 7 as latest_start, -- Simplified calculation
        (ml.level = (SELECT MAX(level) FROM milestone_levels)) as is_critical
    FROM milestone_levels ml
    ORDER BY ml.level, ml.earliest_start;
END;
$$ LANGUAGE plpgsql;

-- Create views for common milestone queries

-- View for milestone dashboard
CREATE OR REPLACE VIEW milestone_dashboard AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.color as project_color,
    COUNT(m.id) as total_milestones,
    COUNT(CASE WHEN m.status = 'completed' THEN 1 END) as completed_milestones,
    COUNT(CASE WHEN m.status = 'in_progress' THEN 1 END) as in_progress_milestones,
    COUNT(CASE WHEN m.status = 'pending' THEN 1 END) as pending_milestones,
    COUNT(CASE WHEN m.due_date < NOW() AND m.status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_milestones,
    AVG(m.progress) as average_progress,
    MIN(CASE WHEN m.status NOT IN ('completed', 'cancelled') THEN m.due_date END) as next_milestone_due,
    MAX(m.updated_at) as last_activity
FROM projects p
LEFT JOIN milestones m ON p.id = m.project_id AND m.is_archived = FALSE
WHERE p.is_archived = FALSE
GROUP BY p.id, p.name, p.color;

-- View for team milestone assignments
CREATE OR REPLACE VIEW team_milestone_assignments AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    u.avatar_url,
    p.id as project_id,
    p.name as project_name,
    m.id as milestone_id,
    m.title as milestone_title,
    m.due_date,
    m.status,
    m.priority,
    m.progress,
    tm.role as team_role
FROM users u
JOIN team_members tm ON u.id = tm.user_id
JOIN projects p ON tm.project_id = p.id
JOIN milestones m ON p.id = m.project_id
WHERE u.is_active = TRUE
AND tm.is_active = TRUE
AND p.is_archived = FALSE
AND m.is_archived = FALSE
AND u.id = ANY(m.assigned_to);

-- Create indexes for the new functions
CREATE INDEX IF NOT EXISTS idx_milestones_due_date_status ON milestones(due_date, status) WHERE is_archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_milestones_project_status ON milestones(project_id, status) WHERE is_archived = FALSE;

-- Add comments for documentation
COMMENT ON FUNCTION get_project_milestone_completion_rate(UUID) IS 'Calculates completion rate for milestones in a project';
COMMENT ON FUNCTION get_overdue_milestones(UUID) IS 'Returns overdue milestones for a project or all projects';
COMMENT ON FUNCTION get_upcoming_milestones(UUID, INTEGER) IS 'Returns upcoming milestones within specified days';
COMMENT ON FUNCTION get_milestone_dependencies_graph(UUID) IS 'Returns dependency graph for project milestones';
COMMENT ON FUNCTION calculate_critical_path(UUID) IS 'Calculates critical path for project milestones';

COMMENT ON VIEW milestone_dashboard IS 'Dashboard view with milestone statistics per project';
COMMENT ON VIEW team_milestone_assignments IS 'View of user assignments to milestones';

-- Final verification
SELECT 
    'Milestone setup completed successfully!' as status,
    (SELECT COUNT(*) FROM milestones) as milestone_count,
    (SELECT COUNT(*) FROM projects) as project_count,
    (SELECT COUNT(*) FROM users) as user_count,
    (SELECT COUNT(*) FROM milestone_dependencies) as dependency_count;

-- Show sample data
SELECT 'Sample milestones:' as info;
SELECT 
    m.title,
    p.name as project,
    m.status,
    m.progress,
    m.due_date
FROM milestones m
JOIN projects p ON m.project_id = p.id
ORDER BY m.due_date;

-- Show milestone completion rates by project
SELECT 'Project completion rates:' as info;
SELECT 
    project_name,
    total_milestones,
    completed_milestones,
    ROUND(average_progress, 2) as avg_progress
FROM milestone_dashboard
ORDER BY project_name;