-- Milestone Management Database Schema
-- This schema extends the existing task management system with milestone functionality
-- Run this in your Supabase SQL editor to add milestone support

-- Create update_updated_at function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create projects table (converting from mock data to database)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6',
    icon VARCHAR(50),
    owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    team_members UUID[] DEFAULT ARRAY[]::UUID[],
    settings JSONB DEFAULT '{}',
    stats JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- Create users table (basic user management)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'
);

-- Create team_members table (project team management)
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(project_id, user_id)
);

-- Create main milestones table
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    color VARCHAR(7) DEFAULT '#3b82f6',
    progress DECIMAL(5,2) DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    assigned_to UUID[] DEFAULT ARRAY[]::UUID[],
    metadata JSONB DEFAULT '{}',
    is_archived BOOLEAN DEFAULT FALSE
);

-- Create milestone_dependencies table (for milestone relationships)
CREATE TABLE IF NOT EXISTS milestone_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    depends_on_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
    lag_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(milestone_id, depends_on_id),
    CHECK (milestone_id != depends_on_id)
);

-- Create milestone_progress table (detailed progress tracking)
CREATE TABLE IF NOT EXISTS milestone_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    progress_percentage DECIMAL(5,2) NOT NULL CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_tasks INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recorded_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}'
);

-- Create milestone_comments table (discussion and updates)
CREATE TABLE IF NOT EXISTS milestone_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'comment' CHECK (comment_type IN ('comment', 'update', 'approval', 'question')),
    parent_id UUID REFERENCES milestone_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'
);

-- Update existing tasks table to add milestone relationship
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_is_archived ON projects(is_archived);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_team_members_project_id ON team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);

CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_priority ON milestones(priority);
CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_milestones_created_by ON milestones(created_by);
CREATE INDEX IF NOT EXISTS idx_milestones_created_at ON milestones(created_at);
CREATE INDEX IF NOT EXISTS idx_milestones_is_archived ON milestones(is_archived);

CREATE INDEX IF NOT EXISTS idx_milestone_dependencies_milestone_id ON milestone_dependencies(milestone_id);
CREATE INDEX IF NOT EXISTS idx_milestone_dependencies_depends_on_id ON milestone_dependencies(depends_on_id);
CREATE INDEX IF NOT EXISTS idx_milestone_dependencies_type ON milestone_dependencies(dependency_type);

CREATE INDEX IF NOT EXISTS idx_milestone_progress_milestone_id ON milestone_progress(milestone_id);
CREATE INDEX IF NOT EXISTS idx_milestone_progress_recorded_at ON milestone_progress(recorded_at);

CREATE INDEX IF NOT EXISTS idx_milestone_comments_milestone_id ON milestone_comments(milestone_id);
CREATE INDEX IF NOT EXISTS idx_milestone_comments_user_id ON milestone_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_milestone_comments_parent_id ON milestone_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_milestone_comments_created_at ON milestone_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);

-- Create triggers for updated_at columns
CREATE TRIGGER IF NOT EXISTS update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_milestones_updated_at BEFORE UPDATE ON milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_milestone_comments_updated_at BEFORE UPDATE ON milestone_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate milestone progress from linked tasks
CREATE OR REPLACE FUNCTION calculate_milestone_progress(milestone_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    progress_percentage DECIMAL(5,2);
BEGIN
    -- Count total tasks linked to this milestone
    SELECT COUNT(*) INTO total_tasks
    FROM tasks 
    WHERE milestone_id = milestone_uuid;
    
    -- Count completed tasks
    SELECT COUNT(*) INTO completed_tasks
    FROM tasks 
    WHERE milestone_id = milestone_uuid 
    AND status = 'completed';
    
    -- Calculate progress percentage
    IF total_tasks = 0 THEN
        progress_percentage := 0.00;
    ELSE
        progress_percentage := (completed_tasks::DECIMAL / total_tasks::DECIMAL) * 100;
    END IF;
    
    -- Update milestone progress
    UPDATE milestones 
    SET progress = progress_percentage,
        updated_at = NOW()
    WHERE id = milestone_uuid;
    
    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to update milestone progress when tasks change
CREATE OR REPLACE FUNCTION update_milestone_progress_on_task_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Update progress for old milestone (if exists)
    IF OLD.milestone_id IS NOT NULL THEN
        PERFORM calculate_milestone_progress(OLD.milestone_id);
    END IF;
    
    -- Update progress for new milestone (if exists)
    IF NEW.milestone_id IS NOT NULL THEN
        PERFORM calculate_milestone_progress(NEW.milestone_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle milestone progress on task deletion
CREATE OR REPLACE FUNCTION update_milestone_progress_on_task_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Update progress for the milestone (if exists)
    IF OLD.milestone_id IS NOT NULL THEN
        PERFORM calculate_milestone_progress(OLD.milestone_id);
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update milestone progress
CREATE TRIGGER IF NOT EXISTS milestone_progress_on_task_update
    AFTER UPDATE ON tasks
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.milestone_id IS DISTINCT FROM NEW.milestone_id)
    EXECUTE FUNCTION update_milestone_progress_on_task_change();

CREATE TRIGGER IF NOT EXISTS milestone_progress_on_task_insert
    AFTER INSERT ON tasks
    FOR EACH ROW
    WHEN (NEW.milestone_id IS NOT NULL)
    EXECUTE FUNCTION update_milestone_progress_on_task_change();

CREATE TRIGGER IF NOT EXISTS milestone_progress_on_task_delete
    AFTER DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_milestone_progress_on_task_delete();

-- Function to prevent circular dependencies
CREATE OR REPLACE FUNCTION prevent_circular_dependencies()
RETURNS TRIGGER AS $$
DECLARE
    has_cycle BOOLEAN;
BEGIN
    -- Check if adding this dependency would create a cycle
    WITH RECURSIVE dependency_path AS (
        -- Start with the new dependency
        SELECT NEW.milestone_id as current_milestone, NEW.depends_on_id as depends_on, 1 as depth
        
        UNION ALL
        
        -- Follow the dependency chain
        SELECT dp.current_milestone, md.depends_on_id, dp.depth + 1
        FROM dependency_path dp
        JOIN milestone_dependencies md ON dp.depends_on = md.milestone_id
        WHERE dp.depth < 50 -- Prevent infinite loops
    )
    SELECT EXISTS(
        SELECT 1 FROM dependency_path 
        WHERE current_milestone = depends_on
    ) INTO has_cycle;
    
    IF has_cycle THEN
        RAISE EXCEPTION 'Circular dependency detected: milestone % cannot depend on milestone %', 
            NEW.milestone_id, NEW.depends_on_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent circular dependencies
CREATE TRIGGER IF NOT EXISTS prevent_circular_milestone_dependencies
    BEFORE INSERT ON milestone_dependencies
    FOR EACH ROW
    EXECUTE FUNCTION prevent_circular_dependencies();

-- Create view for milestone overview with progress and task counts
CREATE OR REPLACE VIEW milestone_overview AS
SELECT 
    m.id,
    m.project_id,
    m.title,
    m.description,
    m.due_date,
    m.status,
    m.priority,
    m.color,
    m.progress,
    m.completed_at,
    m.created_at,
    m.updated_at,
    m.created_by,
    m.assigned_to,
    m.is_archived,
    p.name as project_name,
    p.color as project_color,
    u.name as created_by_name,
    COALESCE(task_counts.total_tasks, 0) as total_tasks,
    COALESCE(task_counts.completed_tasks, 0) as completed_tasks,
    COALESCE(task_counts.pending_tasks, 0) as pending_tasks,
    COALESCE(task_counts.in_progress_tasks, 0) as in_progress_tasks,
    COALESCE(dep_counts.dependency_count, 0) as dependency_count,
    COALESCE(dep_counts.dependent_count, 0) as dependent_count
FROM milestones m
LEFT JOIN projects p ON m.project_id = p.id
LEFT JOIN users u ON m.created_by = u.id
LEFT JOIN (
    SELECT 
        milestone_id,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks
    FROM tasks 
    WHERE milestone_id IS NOT NULL
    GROUP BY milestone_id
) task_counts ON m.id = task_counts.milestone_id
LEFT JOIN (
    SELECT 
        milestone_id,
        COUNT(*) as dependency_count
    FROM milestone_dependencies
    GROUP BY milestone_id
) dep_counts ON m.id = dep_counts.milestone_id;

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing public access for now, can be restricted later)
CREATE POLICY "Allow public access to projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow public access to users" ON users FOR ALL USING (true);
CREATE POLICY "Allow public access to team_members" ON team_members FOR ALL USING (true);
CREATE POLICY "Allow public access to milestones" ON milestones FOR ALL USING (true);
CREATE POLICY "Allow public access to milestone_dependencies" ON milestone_dependencies FOR ALL USING (true);
CREATE POLICY "Allow public access to milestone_progress" ON milestone_progress FOR ALL USING (true);
CREATE POLICY "Allow public access to milestone_comments" ON milestone_comments FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO users (id, name, email, avatar_url, role) VALUES
('00000000-0000-0000-0000-000000000001', 'John Doe', 'john@example.com', 'https://via.placeholder.com/150', 'admin'),
('00000000-0000-0000-0000-000000000002', 'Jane Smith', 'jane@example.com', 'https://via.placeholder.com/150', 'member'),
('00000000-0000-0000-0000-000000000003', 'Mike Johnson', 'mike@example.com', 'https://via.placeholder.com/150', 'member')
ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (id, name, description, color, owner_id) VALUES
('00000000-0000-0000-0000-000000000001', 'Website Redesign', 'Complete overhaul of company website', '#3b82f6', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000002', 'Mobile App Development', 'Native mobile app for iOS and Android', '#10b981', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000003', 'Data Migration', 'Migrate legacy data to new system', '#f59e0b', '00000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO milestones (id, project_id, title, description, due_date, status, priority, color, created_by) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Design Phase Complete', 'Complete all design mockups and prototypes', NOW() + INTERVAL '30 days', 'in_progress', 'high', '#3b82f6', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Development Phase', 'Implement all frontend and backend features', NOW() + INTERVAL '60 days', 'pending', 'high', '#3b82f6', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'MVP Release', 'Launch minimum viable product', NOW() + INTERVAL '90 days', 'pending', 'critical', '#10b981', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'Data Backup', 'Backup all legacy data', NOW() + INTERVAL '14 days', 'completed', 'high', '#f59e0b', '00000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- Verification query
SELECT 
    'Milestone schema setup complete!' as status,
    (SELECT COUNT(*) FROM milestones) as milestone_count,
    (SELECT COUNT(*) FROM projects) as project_count,
    (SELECT COUNT(*) FROM users) as user_count;