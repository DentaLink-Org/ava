-- Enhanced Task Management System - SAFE MIGRATION
-- This script safely handles existing tables and data
-- Run this in your Supabase SQL editor

-- =================================================
-- SAFE MIGRATION WITH EXISTING TABLE HANDLING
-- =================================================

-- Create update_updated_at function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =================================================
-- CREATE PREREQUISITE TABLES SAFELY
-- =================================================

-- Create users table (if it doesn't exist)
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

-- Create projects table (if it doesn't exist)
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

-- Create milestones table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
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

-- =================================================
-- SAFELY ENHANCE EXISTING TASKS TABLE
-- =================================================

-- Backup existing tasks if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
        -- Create backup table
        DROP TABLE IF EXISTS tasks_backup_migration;
        CREATE TABLE tasks_backup_migration AS SELECT * FROM tasks;
        
        -- Add new columns to existing tasks table if they don't exist
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours INTEGER CHECK (estimated_hours >= 0);
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_hours INTEGER CHECK (actual_hours >= 0);
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS story_points INTEGER CHECK (story_points >= 0 AND story_points <= 100);
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS effort_level VARCHAR(20) DEFAULT 'moderate';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS complexity VARCHAR(20) DEFAULT 'moderate';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) DEFAULT 'low';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id UUID;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone_id UUID;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_id UUID;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by UUID;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress DECIMAL(5,2) DEFAULT 0.00;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        BEGIN
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
    ELSE
        -- Create new tasks table if it doesn't exist
        CREATE TABLE tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(200) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'todo',
            priority VARCHAR(20) DEFAULT 'medium',
            estimated_hours INTEGER CHECK (estimated_hours >= 0),
            actual_hours INTEGER CHECK (actual_hours >= 0),
            story_points INTEGER CHECK (story_points >= 0 AND story_points <= 100),
            effort_level VARCHAR(20) DEFAULT 'moderate',
            complexity VARCHAR(20) DEFAULT 'moderate',
            risk_level VARCHAR(20) DEFAULT 'low',
            blocked_reason TEXT,
            project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
            milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
            assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
            created_by UUID REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            due_date TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE,
            position INTEGER DEFAULT 0,
            tags TEXT[] DEFAULT ARRAY[]::TEXT[],
            progress DECIMAL(5,2) DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
            custom_fields JSONB DEFAULT '{}',
            metadata JSONB DEFAULT '{}'
        );
    END IF;
END $$;

-- Add constraints safely
DO $$
BEGIN
    -- Add effort_level constraint if it doesn't exist
    BEGIN
        ALTER TABLE tasks ADD CONSTRAINT tasks_effort_level_check 
        CHECK (effort_level IN ('minimal', 'light', 'moderate', 'heavy', 'intensive'));
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
        WHEN check_violation THEN 
            -- Update invalid values first
            UPDATE tasks SET effort_level = 'moderate' WHERE effort_level NOT IN ('minimal', 'light', 'moderate', 'heavy', 'intensive') OR effort_level IS NULL;
            ALTER TABLE tasks ADD CONSTRAINT tasks_effort_level_check 
            CHECK (effort_level IN ('minimal', 'light', 'moderate', 'heavy', 'intensive'));
    END;
    
    -- Add complexity constraint if it doesn't exist
    BEGIN
        ALTER TABLE tasks ADD CONSTRAINT tasks_complexity_check 
        CHECK (complexity IN ('simple', 'moderate', 'complex', 'very_complex'));
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
        WHEN check_violation THEN 
            -- Update invalid values first
            UPDATE tasks SET complexity = 'moderate' WHERE complexity NOT IN ('simple', 'moderate', 'complex', 'very_complex') OR complexity IS NULL;
            ALTER TABLE tasks ADD CONSTRAINT tasks_complexity_check 
            CHECK (complexity IN ('simple', 'moderate', 'complex', 'very_complex'));
    END;
    
    -- Add risk_level constraint if it doesn't exist
    BEGIN
        ALTER TABLE tasks ADD CONSTRAINT tasks_risk_level_check 
        CHECK (risk_level IN ('low', 'medium', 'high', 'critical'));
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
        WHEN check_violation THEN 
            -- Update invalid values first
            UPDATE tasks SET risk_level = 'low' WHERE risk_level NOT IN ('low', 'medium', 'high', 'critical') OR risk_level IS NULL;
            ALTER TABLE tasks ADD CONSTRAINT tasks_risk_level_check 
            CHECK (risk_level IN ('low', 'medium', 'high', 'critical'));
    END;
    
    -- Add foreign key constraints if they don't exist
    BEGIN
        ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE tasks ADD CONSTRAINT tasks_milestone_id_fkey 
        FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE tasks ADD CONSTRAINT tasks_assignee_id_fkey 
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE tasks ADD CONSTRAINT tasks_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- =================================================
-- CREATE RELATIONSHIP TABLES SAFELY
-- =================================================

-- Task dependencies table
CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
    lag_hours INTEGER DEFAULT 0,
    is_blocking BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    UNIQUE(task_id, depends_on_id),
    CHECK (task_id != depends_on_id)
);

-- Handle existing task_comments table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_comments') THEN
        -- Add new columns to existing task_comments table
        ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS user_id UUID;
        ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS content TEXT;
        ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS comment_type VARCHAR(50) DEFAULT 'comment';
        ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS parent_id UUID;
        ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
        ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS mentions UUID[] DEFAULT ARRAY[]::UUID[];
        ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}';
        ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
        
        -- Migrate existing data
        UPDATE task_comments SET 
            content = comment,
            comment_type = 'comment'
        WHERE content IS NULL AND comment IS NOT NULL;
        
    ELSE
        -- Create new task_comments table
        CREATE TABLE task_comments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            comment_type VARCHAR(50) DEFAULT 'comment' CHECK (comment_type IN ('comment', 'update', 'mention', 'system', 'approval')),
            parent_id UUID REFERENCES task_comments(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_edited BOOLEAN DEFAULT FALSE,
            edited_at TIMESTAMP WITH TIME ZONE,
            mentions UUID[] DEFAULT ARRAY[]::UUID[],
            reactions JSONB DEFAULT '{}',
            metadata JSONB DEFAULT '{}'
        );
    END IF;
END $$;

-- Task attachments table
CREATE TABLE IF NOT EXISTS task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER CHECK (file_size >= 0),
    mime_type VARCHAR(100),
    file_extension VARCHAR(10),
    file_hash VARCHAR(64),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT FALSE,
    description TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Task time entries table
CREATE TABLE IF NOT EXISTS task_time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER CHECK (duration_minutes >= 0),
    description TEXT,
    is_billable BOOLEAN DEFAULT FALSE,
    hourly_rate DECIMAL(10,2) CHECK (hourly_rate >= 0),
    activity_type VARCHAR(50) DEFAULT 'work' CHECK (activity_type IN ('work', 'meeting', 'research', 'testing', 'documentation', 'review')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Task templates table
CREATE TABLE IF NOT EXISTS task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    template_data JSONB NOT NULL,
    default_assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    default_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    default_estimated_hours INTEGER,
    default_priority VARCHAR(20) DEFAULT 'medium',
    default_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usage_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'
);

-- Task status configurations table
CREATE TABLE IF NOT EXISTS task_status_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    status_name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#64748b',
    description TEXT,
    position INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    workflow_rules JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, status_name)
);

-- Task automations table
CREATE TABLE IF NOT EXISTS task_automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    trigger_conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Task history table
CREATE TABLE IF NOT EXISTS task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    change_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'
);

-- =================================================
-- CREATE INDEXES SAFELY
-- =================================================

-- Create indexes only if they don't exist
DO $$
DECLARE
    index_name TEXT;
    index_names TEXT[] := ARRAY[
        'idx_tasks_status', 'idx_tasks_priority', 'idx_tasks_project_id', 'idx_tasks_milestone_id',
        'idx_tasks_assignee_id', 'idx_tasks_created_by', 'idx_tasks_created_at', 'idx_tasks_updated_at',
        'idx_tasks_due_date', 'idx_tasks_completed_at', 'idx_tasks_tags', 'idx_tasks_custom_fields',
        'idx_tasks_effort_level', 'idx_tasks_complexity', 'idx_tasks_risk_level',
        'idx_task_dependencies_task_id', 'idx_task_dependencies_depends_on_id', 'idx_task_dependencies_type',
        'idx_task_comments_task_id', 'idx_task_comments_user_id', 'idx_task_comments_parent_id',
        'idx_task_attachments_task_id', 'idx_task_time_entries_task_id', 'idx_task_time_entries_user_id'
    ];
BEGIN
    FOREACH index_name IN ARRAY index_names
    LOOP
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = index_name) THEN
            CASE index_name
                WHEN 'idx_tasks_status' THEN CREATE INDEX idx_tasks_status ON tasks(status);
                WHEN 'idx_tasks_priority' THEN CREATE INDEX idx_tasks_priority ON tasks(priority);
                WHEN 'idx_tasks_project_id' THEN CREATE INDEX idx_tasks_project_id ON tasks(project_id);
                WHEN 'idx_tasks_milestone_id' THEN CREATE INDEX idx_tasks_milestone_id ON tasks(milestone_id);
                WHEN 'idx_tasks_assignee_id' THEN CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
                WHEN 'idx_tasks_created_by' THEN CREATE INDEX idx_tasks_created_by ON tasks(created_by);
                WHEN 'idx_tasks_created_at' THEN CREATE INDEX idx_tasks_created_at ON tasks(created_at);
                WHEN 'idx_tasks_updated_at' THEN CREATE INDEX idx_tasks_updated_at ON tasks(updated_at);
                WHEN 'idx_tasks_due_date' THEN CREATE INDEX idx_tasks_due_date ON tasks(due_date);
                WHEN 'idx_tasks_completed_at' THEN CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
                WHEN 'idx_tasks_tags' THEN CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);
                WHEN 'idx_tasks_custom_fields' THEN CREATE INDEX idx_tasks_custom_fields ON tasks USING GIN(custom_fields);
                WHEN 'idx_tasks_effort_level' THEN CREATE INDEX idx_tasks_effort_level ON tasks(effort_level);
                WHEN 'idx_tasks_complexity' THEN CREATE INDEX idx_tasks_complexity ON tasks(complexity);
                WHEN 'idx_tasks_risk_level' THEN CREATE INDEX idx_tasks_risk_level ON tasks(risk_level);
                WHEN 'idx_task_dependencies_task_id' THEN CREATE INDEX idx_task_dependencies_task_id ON task_dependencies(task_id);
                WHEN 'idx_task_dependencies_depends_on_id' THEN CREATE INDEX idx_task_dependencies_depends_on_id ON task_dependencies(depends_on_id);
                WHEN 'idx_task_dependencies_type' THEN CREATE INDEX idx_task_dependencies_type ON task_dependencies(dependency_type);
                WHEN 'idx_task_comments_task_id' THEN CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
                WHEN 'idx_task_comments_user_id' THEN CREATE INDEX idx_task_comments_user_id ON task_comments(user_id);
                WHEN 'idx_task_comments_parent_id' THEN CREATE INDEX idx_task_comments_parent_id ON task_comments(parent_id);
                WHEN 'idx_task_attachments_task_id' THEN CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
                WHEN 'idx_task_time_entries_task_id' THEN CREATE INDEX idx_task_time_entries_task_id ON task_time_entries(task_id);
                WHEN 'idx_task_time_entries_user_id' THEN CREATE INDEX idx_task_time_entries_user_id ON task_time_entries(user_id);
            END CASE;
        END IF;
    END LOOP;
END $$;

-- =================================================
-- CREATE FUNCTIONS AND TRIGGERS SAFELY
-- =================================================

-- Function to prevent circular task dependencies
CREATE OR REPLACE FUNCTION prevent_circular_task_dependencies()
RETURNS TRIGGER AS $$
DECLARE
    has_cycle BOOLEAN;
BEGIN
    WITH RECURSIVE dependency_path AS (
        SELECT NEW.task_id as current_task, NEW.depends_on_id as depends_on, 1 as depth
        UNION ALL
        SELECT dp.current_task, td.depends_on_id, dp.depth + 1
        FROM dependency_path dp
        JOIN task_dependencies td ON dp.depends_on = td.task_id
        WHERE dp.depth < 50
    )
    SELECT EXISTS(SELECT 1 FROM dependency_path WHERE current_task = depends_on) INTO has_cycle;
    
    IF has_cycle THEN
        RAISE EXCEPTION 'Circular dependency detected: task % cannot depend on task %', NEW.task_id, NEW.depends_on_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers safely
DROP TRIGGER IF EXISTS prevent_circular_task_dependencies_trigger ON task_dependencies;
CREATE TRIGGER prevent_circular_task_dependencies_trigger
    BEFORE INSERT ON task_dependencies
    FOR EACH ROW
    EXECUTE FUNCTION prevent_circular_task_dependencies();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_comments_updated_at ON task_comments;
CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================
-- ENABLE ROW LEVEL SECURITY SAFELY
-- =================================================

DO $$
DECLARE
    table_names TEXT[] := ARRAY['users', 'projects', 'milestones', 'tasks', 'task_dependencies', 
                               'task_comments', 'task_attachments', 'task_time_entries', 
                               'task_templates', 'task_status_configs', 'task_automations', 'task_history'];
    table_name TEXT;
    policy_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
        
        -- Create public access policy if it doesn't exist
        policy_name := 'Allow public access to ' || table_name;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = table_name AND policyname = policy_name
        ) THEN
            EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (true)', policy_name, table_name);
        END IF;
    END LOOP;
END $$;

-- =================================================
-- INSERT SAMPLE DATA SAFELY
-- =================================================

-- Insert sample users
INSERT INTO users (id, name, email, avatar_url, role) VALUES
('00000000-0000-0000-0000-000000000001', 'John Doe', 'john@example.com', 'https://via.placeholder.com/150', 'admin'),
('00000000-0000-0000-0000-000000000002', 'Jane Smith', 'jane@example.com', 'https://via.placeholder.com/150', 'member'),
('00000000-0000-0000-0000-000000000003', 'Mike Johnson', 'mike@example.com', 'https://via.placeholder.com/150', 'member')
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (id, name, description, color, owner_id) VALUES
('00000000-0000-0000-0000-000000000001', 'Enhanced Task System', 'Implementation of advanced task management features', '#8b5cf6', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000002', 'Website Redesign', 'Complete overhaul of company website', '#3b82f6', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Insert sample milestones
INSERT INTO milestones (id, project_id, title, description, due_date, status, priority, color, created_by) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Phase 1: Database Schema', 'Complete enhanced database schema implementation', NOW() + INTERVAL '7 days', 'in_progress', 'high', '#8b5cf6', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Phase 2: Type System', 'Implement enhanced TypeScript types', NOW() + INTERVAL '14 days', 'pending', 'high', '#8b5cf6', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Insert default status configurations
INSERT INTO task_status_configs (project_id, status_name, display_name, color, description, position, is_default, is_completed, is_system) VALUES
(NULL, 'backlog', 'Backlog', '#64748b', 'Tasks that are planned but not yet started', 0, FALSE, FALSE, TRUE),
(NULL, 'todo', 'To Do', '#3b82f6', 'Tasks ready to be worked on', 1, TRUE, FALSE, TRUE),
(NULL, 'in_progress', 'In Progress', '#f59e0b', 'Tasks currently being worked on', 2, FALSE, FALSE, TRUE),
(NULL, 'in_review', 'In Review', '#8b5cf6', 'Tasks under review or testing', 3, FALSE, FALSE, TRUE),
(NULL, 'blocked', 'Blocked', '#ef4444', 'Tasks that are blocked by dependencies', 4, FALSE, FALSE, TRUE),
(NULL, 'completed', 'Completed', '#10b981', 'Tasks that have been finished', 5, FALSE, TRUE, TRUE),
(NULL, 'cancelled', 'Cancelled', '#6b7280', 'Tasks that have been cancelled', 6, FALSE, FALSE, TRUE)
ON CONFLICT ON CONSTRAINT task_status_configs_project_id_status_name_key DO NOTHING;

-- Clean up any existing invalid data
UPDATE tasks SET 
    effort_level = 'moderate' WHERE effort_level IS NULL,
    complexity = 'moderate' WHERE complexity IS NULL,
    risk_level = 'low' WHERE risk_level IS NULL,
    progress = 0.00 WHERE progress IS NULL,
    position = 0 WHERE position IS NULL,
    tags = ARRAY[]::TEXT[] WHERE tags IS NULL,
    custom_fields = '{}' WHERE custom_fields IS NULL;

-- =================================================
-- VERIFICATION
-- =================================================

SELECT 
    'Safe migration completed successfully!' as status,
    (SELECT COUNT(*) FROM users) as user_count,
    (SELECT COUNT(*) FROM projects) as project_count,
    (SELECT COUNT(*) FROM milestones) as milestone_count,
    (SELECT COUNT(*) FROM tasks) as task_count,
    (SELECT COUNT(*) FROM task_status_configs) as status_config_count,
    (SELECT COUNT(*) FROM task_dependencies) as dependency_count,
    (SELECT COUNT(*) FROM task_comments) as comment_count,
    (SELECT COUNT(*) FROM task_attachments) as attachment_count;

-- Show enhanced task structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;