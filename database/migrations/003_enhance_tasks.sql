-- Migration 003: Enhanced Task Management System
-- This migration enhances the existing task system with advanced features
-- Created: 2025-07-04
-- Version: 1.0.0

-- =================================================
-- MIGRATION METADATA
-- =================================================

INSERT INTO migrations (migration_id, name, description, created_at) VALUES 
('003', 'enhance_tasks', 'Enhance task management system with advanced features', NOW())
ON CONFLICT (migration_id) DO NOTHING;

-- =================================================
-- BACKUP EXISTING DATA
-- =================================================

-- Create backup of existing tasks table
CREATE TABLE IF NOT EXISTS tasks_migration_backup AS 
SELECT * FROM tasks WHERE 1=1;

-- Create backup of existing task_comments table
CREATE TABLE IF NOT EXISTS task_comments_migration_backup AS 
SELECT * FROM task_comments WHERE 1=1;

-- =================================================
-- ENHANCED TASKS TABLE MIGRATION
-- =================================================

-- Add new columns to existing tasks table if they don't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours INTEGER CHECK (estimated_hours >= 0);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_hours INTEGER CHECK (actual_hours >= 0);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS story_points INTEGER CHECK (story_points >= 0 AND story_points <= 100);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS effort_level VARCHAR(20) DEFAULT 'moderate' CHECK (effort_level IN ('minimal', 'light', 'moderate', 'heavy', 'intensive'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS complexity VARCHAR(20) DEFAULT 'moderate' CHECK (complexity IN ('simple', 'moderate', 'complex', 'very_complex'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress DECIMAL(5,2) DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Update status column constraints if needed
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'tasks_status_check' AND table_name = 'tasks') THEN
        ALTER TABLE tasks DROP CONSTRAINT tasks_status_check;
    END IF;
    
    -- Add new constraint with enhanced status options
    ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
    CHECK (status IN ('backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'completed', 'cancelled'));
    
    -- Update priority constraint
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'tasks_priority_check' AND table_name = 'tasks') THEN
        ALTER TABLE tasks DROP CONSTRAINT tasks_priority_check;
    END IF;
    
    ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check 
    CHECK (priority IN ('low', 'medium', 'high', 'critical'));
EXCEPTION
    WHEN OTHERS THEN
        -- If constraints don't exist, that's fine
        NULL;
END $$;

-- =================================================
-- CREATE NEW RELATIONSHIP TABLES
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

-- Task history table (audit trail)
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
-- ENHANCE EXISTING TASK_COMMENTS TABLE
-- =================================================

-- Add new columns to task_comments if they don't exist
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS comment_type VARCHAR(50) DEFAULT 'comment' CHECK (comment_type IN ('comment', 'update', 'mention', 'system', 'approval'));
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES task_comments(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS mentions UUID[] DEFAULT ARRAY[]::UUID[];
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}';
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Migrate existing comment data if needed
UPDATE task_comments SET 
    content = comment,
    user_id = (SELECT id FROM users WHERE name = author LIMIT 1)
WHERE content IS NULL AND comment IS NOT NULL;

-- =================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =================================================

-- Enhanced indexes for tasks table
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_tasks_custom_fields ON tasks USING GIN(custom_fields);
CREATE INDEX IF NOT EXISTS idx_tasks_effort_level ON tasks(effort_level);
CREATE INDEX IF NOT EXISTS idx_tasks_complexity ON tasks(complexity);
CREATE INDEX IF NOT EXISTS idx_tasks_risk_level ON tasks(risk_level);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on_id ON task_dependencies(depends_on_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_type ON task_dependencies(dependency_type);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_blocking ON task_dependencies(is_blocking);

CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_uploaded_by ON task_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_task_attachments_mime_type ON task_attachments(mime_type);

CREATE INDEX IF NOT EXISTS idx_task_time_entries_task_id ON task_time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_task_time_entries_user_id ON task_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_task_time_entries_start_time ON task_time_entries(start_time);

CREATE INDEX IF NOT EXISTS idx_task_templates_category ON task_templates(category);
CREATE INDEX IF NOT EXISTS idx_task_templates_public ON task_templates(is_public);

CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_history_action ON task_history(action);
CREATE INDEX IF NOT EXISTS idx_task_history_created_at ON task_history(created_at);

-- Enhanced indexes for task_comments
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_parent_id ON task_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_type ON task_comments(comment_type);
CREATE INDEX IF NOT EXISTS idx_task_comments_mentions ON task_comments USING GIN(mentions);

-- =================================================
-- CREATE ENHANCED FUNCTIONS
-- =================================================

-- Function to prevent circular task dependencies
CREATE OR REPLACE FUNCTION prevent_circular_task_dependencies()
RETURNS TRIGGER AS $$
DECLARE
    has_cycle BOOLEAN;
BEGIN
    -- Check if adding this dependency would create a cycle
    WITH RECURSIVE dependency_path AS (
        -- Start with the new dependency
        SELECT NEW.task_id as current_task, NEW.depends_on_id as depends_on, 1 as depth
        
        UNION ALL
        
        -- Follow the dependency chain
        SELECT dp.current_task, td.depends_on_id, dp.depth + 1
        FROM dependency_path dp
        JOIN task_dependencies td ON dp.depends_on = td.task_id
        WHERE dp.depth < 50 -- Prevent infinite loops
    )
    SELECT EXISTS(
        SELECT 1 FROM dependency_path 
        WHERE current_task = depends_on
    ) INTO has_cycle;
    
    IF has_cycle THEN
        RAISE EXCEPTION 'Circular dependency detected: task % cannot depend on task %', 
            NEW.task_id, NEW.depends_on_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically calculate task duration
CREATE OR REPLACE FUNCTION calculate_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to track task changes in history
CREATE OR REPLACE FUNCTION track_task_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Track status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO task_history (task_id, user_id, action, field_name, old_value, new_value, change_description)
        VALUES (NEW.id, NEW.assignee_id, 'field_change', 'status', OLD.status, NEW.status, 
                'Status changed from ' || OLD.status || ' to ' || NEW.status);
    END IF;
    
    -- Track assignee changes
    IF OLD.assignee_id IS DISTINCT FROM NEW.assignee_id THEN
        INSERT INTO task_history (task_id, user_id, action, field_name, old_value, new_value, change_description)
        VALUES (NEW.id, NEW.assignee_id, 'field_change', 'assignee_id', OLD.assignee_id::TEXT, NEW.assignee_id::TEXT,
                'Assignee changed');
    END IF;
    
    -- Track priority changes
    IF OLD.priority IS DISTINCT FROM NEW.priority THEN
        INSERT INTO task_history (task_id, user_id, action, field_name, old_value, new_value, change_description)
        VALUES (NEW.id, NEW.assignee_id, 'field_change', 'priority', OLD.priority, NEW.priority,
                'Priority changed from ' || OLD.priority || ' to ' || NEW.priority);
    END IF;
    
    -- Set completed_at when status becomes completed
    IF OLD.status != 'completed' AND NEW.status = 'completed' AND NEW.completed_at IS NULL THEN
        NEW.completed_at := NOW();
    END IF;
    
    -- Clear completed_at when status changes from completed
    IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
        NEW.completed_at := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =================================================
-- CREATE TRIGGERS
-- =================================================

-- Trigger to prevent circular dependencies
DROP TRIGGER IF EXISTS prevent_circular_task_dependencies_trigger ON task_dependencies;
CREATE TRIGGER prevent_circular_task_dependencies_trigger
    BEFORE INSERT ON task_dependencies
    FOR EACH ROW
    EXECUTE FUNCTION prevent_circular_task_dependencies();

-- Trigger to calculate duration
DROP TRIGGER IF EXISTS calculate_time_entry_duration_trigger ON task_time_entries;
CREATE TRIGGER calculate_time_entry_duration_trigger
    BEFORE INSERT OR UPDATE ON task_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_time_entry_duration();

-- Trigger to track task changes
DROP TRIGGER IF EXISTS track_task_changes_trigger ON tasks;
CREATE TRIGGER track_task_changes_trigger
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION track_task_changes();

-- Updated_at triggers for new tables
DROP TRIGGER IF EXISTS update_task_time_entries_updated_at ON task_time_entries;
CREATE TRIGGER update_task_time_entries_updated_at BEFORE UPDATE ON task_time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_templates_updated_at ON task_templates;
CREATE TRIGGER update_task_templates_updated_at BEFORE UPDATE ON task_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_automations_updated_at ON task_automations;
CREATE TRIGGER update_task_automations_updated_at BEFORE UPDATE ON task_automations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_comments_updated_at ON task_comments;
CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================
-- ENABLE ROW LEVEL SECURITY FOR NEW TABLES
-- =================================================

ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_status_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;

-- =================================================
-- CREATE RLS POLICIES (Public access for development)
-- =================================================

CREATE POLICY "Allow public access to task_dependencies" ON task_dependencies FOR ALL USING (true);
CREATE POLICY "Allow public access to task_attachments" ON task_attachments FOR ALL USING (true);
CREATE POLICY "Allow public access to task_time_entries" ON task_time_entries FOR ALL USING (true);
CREATE POLICY "Allow public access to task_templates" ON task_templates FOR ALL USING (true);
CREATE POLICY "Allow public access to task_status_configs" ON task_status_configs FOR ALL USING (true);
CREATE POLICY "Allow public access to task_automations" ON task_automations FOR ALL USING (true);
CREATE POLICY "Allow public access to task_history" ON task_history FOR ALL USING (true);

-- =================================================
-- INSERT DEFAULT DATA
-- =================================================

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

-- Insert sample task templates
INSERT INTO task_templates (name, description, category, template_data, default_priority, default_estimated_hours, default_tags, is_public, created_by) VALUES
('Bug Fix', 'Template for bug fixing tasks', 'development', '{
    "title": "Fix: [Bug Description]",
    "description": "## Bug Description\n\n## Steps to Reproduce\n\n## Expected Behavior\n\n## Actual Behavior\n\n## Fix Implementation\n\n## Testing Notes",
    "priority": "high",
    "effort_level": "light",
    "complexity": "moderate"
}', 'high', 4, ARRAY['bug', 'fix'], TRUE, NULL),

('Feature Development', 'Template for new feature development', 'development', '{
    "title": "Feature: [Feature Name]",
    "description": "## Feature Requirements\n\n## Acceptance Criteria\n\n## Technical Specification\n\n## Implementation Plan\n\n## Testing Strategy",
    "priority": "medium",
    "effort_level": "moderate",
    "complexity": "complex"
}', 'medium', 16, ARRAY['feature', 'development'], TRUE, NULL),

('Code Review', 'Template for code review tasks', 'review', '{
    "title": "Review: [Component/Feature Name]",
    "description": "## Review Scope\n\n## Review Checklist\n- [ ] Code quality\n- [ ] Performance\n- [ ] Security\n- [ ] Tests\n\n## Feedback",
    "priority": "medium",
    "effort_level": "light",
    "complexity": "simple"
}', 'medium', 2, ARRAY['review', 'quality'], TRUE, NULL)
ON CONFLICT DO NOTHING;

-- =================================================
-- CLEANUP AND VERIFICATION
-- =================================================

-- Update any existing task data to have default values for new fields
UPDATE tasks SET 
    effort_level = 'moderate' WHERE effort_level IS NULL,
    complexity = 'moderate' WHERE complexity IS NULL,
    risk_level = 'low' WHERE risk_level IS NULL,
    progress = 0.00 WHERE progress IS NULL,
    position = 0 WHERE position IS NULL,
    tags = ARRAY[]::TEXT[] WHERE tags IS NULL,
    custom_fields = '{}' WHERE custom_fields IS NULL;

-- Verification queries
SELECT 
    'Migration 003 completed successfully!' as status,
    (SELECT COUNT(*) FROM tasks) as task_count,
    (SELECT COUNT(*) FROM task_dependencies) as dependency_count,
    (SELECT COUNT(*) FROM task_status_configs) as status_config_count,
    (SELECT COUNT(*) FROM task_templates) as template_count,
    (SELECT COUNT(*) FROM task_attachments) as attachment_count,
    (SELECT COUNT(*) FROM task_time_entries) as time_entry_count;

-- Show enhanced task table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;