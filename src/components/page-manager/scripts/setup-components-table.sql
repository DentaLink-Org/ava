-- Page Components Table Setup
-- Creates the page_components table and related functions for the Claude Dashboard

-- Create custom types for components
DO $$ BEGIN
    CREATE TYPE component_status AS ENUM ('active', 'inactive', 'deprecated', 'planned', 'draft');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE component_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE component_category AS ENUM (
        'core_task', 
        'creation_editing', 
        'planning_organization', 
        'collaboration', 
        'analytics_reporting',
        'time_tracking',
        'automation_workflow',
        'mobile_accessibility',
        'integration',
        'specialized_views',
        'ui_basic',
        'data_display',
        'navigation',
        'form',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE component_group AS ENUM (
        'interactive',
        'data',
        'navigation',
        'layout',
        'feedback',
        'utility'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE component_implementation_status AS ENUM (
        'not_started', 
        'in_progress', 
        'completed', 
        'testing', 
        'reviewed',
        'deployed', 
        'needs_review'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the page_components table
CREATE TABLE IF NOT EXISTS page_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    functionality TEXT NOT NULL,
    status component_status DEFAULT 'planned',
    priority component_priority DEFAULT 'medium',
    category component_category DEFAULT 'other',
    group_type component_group DEFAULT 'utility',
    implementation_status component_implementation_status DEFAULT 'not_started',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    dependencies TEXT[] DEFAULT '{}',
    props TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    file_path TEXT,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_components_name ON page_components(name);
CREATE INDEX IF NOT EXISTS idx_page_components_status ON page_components(status);
CREATE INDEX IF NOT EXISTS idx_page_components_priority ON page_components(priority);
CREATE INDEX IF NOT EXISTS idx_page_components_category ON page_components(category);
CREATE INDEX IF NOT EXISTS idx_page_components_group ON page_components(group_type);
CREATE INDEX IF NOT EXISTS idx_page_components_implementation ON page_components(implementation_status);
CREATE INDEX IF NOT EXISTS idx_page_components_created_at ON page_components(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_components_updated_at ON page_components(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_components_name_search ON page_components USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_page_components_title_search ON page_components USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_page_components_description_search ON page_components USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_page_components_functionality_search ON page_components USING gin(to_tsvector('english', functionality));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_components_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_page_components_updated_at ON page_components;
CREATE TRIGGER update_page_components_updated_at
    BEFORE UPDATE ON page_components
    FOR EACH ROW
    EXECUTE FUNCTION update_components_updated_at_column();

-- Create function to get component statistics
CREATE OR REPLACE FUNCTION get_component_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    WITH stats AS (
        SELECT 
            COUNT(*) as total_components,
            COUNT(*) FILTER (WHERE status = 'active') as active_components,
            COUNT(*) FILTER (WHERE status = 'inactive') as inactive_components,
            COUNT(*) FILTER (WHERE status = 'deprecated') as deprecated_components,
            COUNT(*) FILTER (WHERE status = 'planned') as planned_components,
            COUNT(*) FILTER (WHERE status = 'draft') as draft_components,
            COUNT(*) FILTER (WHERE priority = 'low') as low_priority,
            COUNT(*) FILTER (WHERE priority = 'medium') as medium_priority,
            COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
            COUNT(*) FILTER (WHERE priority = 'critical') as critical_priority,
            COUNT(*) FILTER (WHERE group_type = 'interactive') as interactive_group,
            COUNT(*) FILTER (WHERE group_type = 'data') as data_group,
            COUNT(*) FILTER (WHERE group_type = 'navigation') as navigation_group,
            COUNT(*) FILTER (WHERE group_type = 'layout') as layout_group,
            COUNT(*) FILTER (WHERE group_type = 'feedback') as feedback_group,
            COUNT(*) FILTER (WHERE group_type = 'utility') as utility_group,
            COUNT(*) FILTER (WHERE implementation_status IN ('completed', 'deployed')) as completed_components,
            COUNT(*) FILTER (WHERE implementation_status = 'in_progress') as in_progress_components,
            COUNT(*) FILTER (WHERE implementation_status = 'not_started') as not_started_components,
            COALESCE(SUM(estimated_hours), 0) as total_estimated_hours,
            COALESCE(SUM(actual_hours), 0) as total_actual_hours
        FROM page_components
    )
    SELECT json_build_object(
        'total_components', total_components,
        'by_status', json_build_object(
            'active', active_components,
            'inactive', inactive_components,
            'deprecated', deprecated_components,
            'planned', planned_components,
            'draft', draft_components
        ),
        'by_priority', json_build_object(
            'low', low_priority,
            'medium', medium_priority,
            'high', high_priority,
            'critical', critical_priority
        ),
        'by_group', json_build_object(
            'interactive', interactive_group,
            'data', data_group,
            'navigation', navigation_group,
            'layout', layout_group,
            'feedback', feedback_group,
            'utility', utility_group
        ),
        'completion_percentage', 
            CASE 
                WHEN total_components > 0 THEN ROUND((completed_components::DECIMAL / total_components) * 100, 2)
                ELSE 0 
            END,
        'in_progress_components', in_progress_components,
        'not_started_components', not_started_components,
        'total_estimated_hours', total_estimated_hours,
        'total_actual_hours', total_actual_hours
    ) INTO result
    FROM stats;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to get component summary
CREATE OR REPLACE FUNCTION get_component_summary()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    WITH summary_stats AS (
        SELECT 
            COUNT(*) as total_components,
            COUNT(*) FILTER (WHERE implementation_status IN ('completed', 'deployed')) as completed_components,
            COUNT(*) FILTER (WHERE implementation_status = 'in_progress') as in_progress_components,
            COUNT(*) FILTER (WHERE implementation_status = 'not_started') as planned_components,
            COUNT(*) FILTER (WHERE priority IN ('high', 'critical')) as high_priority_components,
            MAX(updated_at) as last_updated
        FROM page_components
    )
    SELECT json_build_object(
        'total_components', total_components,
        'completed_components', completed_components,
        'in_progress_components', in_progress_components,
        'planned_components', planned_components,
        'high_priority_components', high_priority_components,
        'last_updated', last_updated
    ) INTO result
    FROM summary_stats;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to search components by text
CREATE OR REPLACE FUNCTION search_components(
    search_query TEXT,
    result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    title TEXT,
    description TEXT,
    functionality TEXT,
    status component_status,
    priority component_priority,
    category component_category,
    group_type component_group,
    implementation_status component_implementation_status,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pc.id,
        pc.name,
        pc.title,
        pc.description,
        pc.functionality,
        pc.status,
        pc.priority,
        pc.category,
        pc.group_type,
        pc.implementation_status,
        pc.created_at,
        pc.updated_at,
        ts_rank(
            to_tsvector('english', pc.name || ' ' || pc.title || ' ' || pc.description || ' ' || pc.functionality),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM page_components pc
    WHERE 
        to_tsvector('english', pc.name || ' ' || pc.title || ' ' || pc.description || ' ' || pc.functionality) 
        @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, pc.updated_at DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to get components by category
CREATE OR REPLACE FUNCTION get_components_by_category(target_category component_category)
RETURNS TABLE (
    id UUID,
    name TEXT,
    title TEXT,
    description TEXT,
    functionality TEXT,
    status component_status,
    priority component_priority,
    group_type component_group,
    implementation_status component_implementation_status,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pc.id,
        pc.name,
        pc.title,
        pc.description,
        pc.functionality,
        pc.status,
        pc.priority,
        pc.group_type,
        pc.implementation_status,
        pc.created_at,
        pc.updated_at
    FROM page_components pc
    WHERE pc.category = target_category
    ORDER BY pc.priority DESC, pc.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get components by group
CREATE OR REPLACE FUNCTION get_components_by_group(target_group component_group)
RETURNS TABLE (
    id UUID,
    name TEXT,
    title TEXT,
    description TEXT,
    functionality TEXT,
    status component_status,
    priority component_priority,
    category component_category,
    implementation_status component_implementation_status,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pc.id,
        pc.name,
        pc.title,
        pc.description,
        pc.functionality,
        pc.status,
        pc.priority,
        pc.category,
        pc.implementation_status,
        pc.created_at,
        pc.updated_at
    FROM page_components pc
    WHERE pc.group_type = target_group
    ORDER BY pc.priority DESC, pc.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function for table initialization (called from the API)
CREATE OR REPLACE FUNCTION create_page_components_table_if_not_exists()
RETURNS BOOLEAN AS $$
BEGIN
    -- This function exists to be called from the API
    -- The actual table creation is handled above
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) for the table
ALTER TABLE page_components ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (adjust based on your authentication needs)
-- For now, allow all operations for demonstration
CREATE POLICY "Allow all operations on page_components" ON page_components
    FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data from PLAN.md
INSERT INTO page_components (name, title, description, functionality, status, priority, category, group_type, implementation_status, estimated_hours, file_path, props, features, dependencies) VALUES
-- Core Task Components
('TaskCardEnhanced', 'Enhanced Task Card', 'Compact and expanded view modes with advanced task display features', 'Enhanced task display with priority indicators, assignee avatars, due date countdown, tag management, progress tracking, comments count, attachment previews, and time tracking', 'planned', 'high', 'core_task', 'interactive', 'not_started', 8.0, 'src/pages/playground/components/task-management/core/TaskCardEnhanced.tsx', '["task", "viewMode", "onEdit", "onDelete", "theme"]', '["Priority indicators with color coding", "Assignee avatars with hover details", "Due date countdown with status", "Tag management with autocomplete", "Progress tracking for subtasks", "Comments count indicator", "Attachment preview icons", "Time tracking display"]', '["TaskCard", "Button", "Avatar"]'),

('TaskBoardPro', 'Advanced Task Board', 'Advanced Kanban board with multiple view modes and enhanced features', 'Advanced Kanban board with multiple view modes (Kanban, List, Timeline, Calendar), swimlanes, WIP limits, quick filters, bulk operations, custom column configuration, and auto-refresh with real-time updates', 'planned', 'high', 'core_task', 'interactive', 'not_started', 16.0, 'src/pages/playground/components/task-management/core/TaskBoardPro.tsx', '["tasks", "viewMode", "swimlanes", "wipLimits", "onTaskMove", "onBulkAction"]', '["Multiple view modes", "Swimlanes by project/assignee/priority", "WIP limits per column", "Quick filters", "Bulk operations", "Custom column configuration", "Auto-refresh with real-time updates"]', '["TaskBoard", "DragDropContext", "react-beautiful-dnd"]'),

('TaskListAdvanced', 'Advanced Task List', 'Enhanced list view with advanced filtering and sorting capabilities', 'Enhanced list view with sortable columns, advanced filtering panel, grouping capabilities, virtual scrolling, row selection for bulk actions, export functionality, and save/load filter presets', 'planned', 'medium', 'core_task', 'data', 'not_started', 12.0, 'src/pages/playground/components/task-management/core/TaskListAdvanced.tsx', '["tasks", "filters", "groupBy", "onExport", "onBulkSelect"]', '["Sortable columns with multi-sort", "Advanced filtering panel", "Grouping by project/status/assignee", "Virtual scrolling for performance", "Row selection for bulk actions", "Export to CSV/PDF", "Save/load filter presets"]', '["TaskList", "VirtualizedList", "FilterPanel"]'),

-- Creation & Editing Components
('TaskQuickCreate', 'Quick Task Creator', 'Streamlined task creation interface with smart defaults and templates', 'Streamlined task creation with inline form, smart defaults based on context, template selection, voice-to-text input, and keyboard shortcuts support', 'planned', 'medium', 'creation_editing', 'interactive', 'not_started', 6.0, 'src/pages/playground/components/task-management/creation/TaskQuickCreate.tsx', '["onTaskCreate", "templates", "defaultValues", "context"]', '["Inline creation form", "Smart defaults based on context", "Template selection", "Voice-to-text input", "Keyboard shortcuts support"]', '["TaskForm", "TemplateSelector", "SpeechRecognition"]'),

('TaskBulkEdit', 'Bulk Task Editor', 'Batch editing interface for multiple tasks with field selection', 'Batch editing for multiple tasks with task selection, bulk update fields, mass assignment/reassignment, status bulk changes, and tag management for multiple items', 'planned', 'medium', 'creation_editing', 'interactive', 'not_started', 8.0, 'src/pages/playground/components/task-management/creation/TaskBulkEdit.tsx', '["selectedTasks", "onBulkUpdate", "editableFields"]', '["Select multiple tasks", "Batch update fields", "Mass assignment/reassignment", "Status bulk changes", "Tag management for multiple items"]', '["TaskSelector", "BulkEditForm", "FieldSelector"]'),

('TaskTemplateSelector', 'Task Template Selector', 'Template-based task creation with custom template management', 'Template-based task creation with pre-defined task templates, custom template creation, template categories, and quick apply functionality', 'planned', 'low', 'creation_editing', 'navigation', 'not_started', 4.0, 'src/pages/playground/components/task-management/creation/TaskTemplateSelector.tsx', '["templates", "onTemplateSelect", "onTemplateCreate"]', '["Pre-defined task templates", "Custom template creation", "Template categories", "Quick apply functionality"]', '["TemplateList", "TemplateEditor", "CategoryFilter"]'),

-- Planning & Organization Components
('ProjectOverview', 'Project Overview Dashboard', 'High-level project insights with comprehensive metrics and tracking', 'High-level project insights with statistics dashboard, progress visualization, team workload distribution, milestone tracking, budget/time tracking, and risk indicators', 'planned', 'high', 'planning_organization', 'data', 'not_started', 14.0, 'src/pages/playground/components/task-management/planning/ProjectOverview.tsx', '["project", "metrics", "timeframe"]', '["Project statistics dashboard", "Progress visualization", "Team workload distribution", "Milestone tracking", "Budget/time tracking", "Risk indicators"]', '["Chart", "ProgressBar", "MetricsCard"]'),

('SprintPlanner', 'Sprint Planning Tool', 'Agile sprint management with capacity planning and velocity tracking', 'Agile sprint management with sprint creation and management, capacity planning, velocity tracking, burndown charts, and sprint retrospective tools', 'planned', 'high', 'planning_organization', 'data', 'not_started', 16.0, 'src/pages/playground/components/task-management/planning/SprintPlanner.tsx', '["sprints", "team", "velocityData"]', '["Sprint creation and management", "Capacity planning", "Velocity tracking", "Burndown charts", "Sprint retrospective tools"]', '["SprintBoard", "VelocityChart", "CapacityPlanner"]'),

('BacklogManager', 'Product Backlog Manager', 'Product backlog organization with prioritization and estimation tools', 'Product backlog organization with prioritization, story point estimation, epic breakdown, release planning, and dependency mapping', 'planned', 'medium', 'planning_organization', 'interactive', 'not_started', 12.0, 'src/pages/playground/components/task-management/planning/BacklogManager.tsx', '["backlogItems", "epics", "releases"]', '["Product backlog prioritization", "Story point estimation", "Epic breakdown", "Release planning", "Dependency mapping"]', '["BacklogList", "EstimationTool", "DependencyMap"]'),

-- Collaboration Components
('TeamWorkload', 'Team Workload Visualization', 'Team capacity and workload visualization with assignment suggestions', 'Team capacity and workload visualization with individual capacity tracking, workload balance visualization, skill-based assignment suggestions, availability calendar integration, and performance metrics', 'planned', 'medium', 'collaboration', 'data', 'not_started', 10.0, 'src/pages/playground/components/task-management/collaboration/TeamWorkload.tsx', '["teamMembers", "workloadData", "timeframe"]', '["Individual capacity tracking", "Workload balance visualization", "Skill-based assignment suggestions", "Availability calendar integration", "Performance metrics"]', '["WorkloadChart", "TeamMemberCard", "CapacityGauge"]'),

('ActivityFeed', 'Real-time Activity Feed', 'Real-time activity tracking with filtering and interaction features', 'Real-time activity tracking with activity stream, filtered by project/user/type, comment threads, @mentions and notifications, and activity search and filters', 'planned', 'high', 'collaboration', 'interactive', 'not_started', 8.0, 'src/pages/playground/components/task-management/collaboration/ActivityFeed.tsx', '["activities", "filters", "realtime"]', '["Real-time activity stream", "Filtered by project/user/type", "Comment threads", "@mentions and notifications", "Activity search and filters"]', '["ActivityItem", "CommentThread", "NotificationSystem"]'),

('TaskComments', 'Task Comments System', 'Task discussion and collaboration with rich text and attachments', 'Task discussion and collaboration with threaded comment system, rich text editor with markdown, file attachments, @mentions with notifications, and comment resolution tracking', 'planned', 'medium', 'collaboration', 'interactive', 'not_started', 10.0, 'src/pages/playground/components/task-management/collaboration/TaskComments.tsx', '["taskId", "comments", "onComment", "mentions"]', '["Threaded comment system", "Rich text editor with markdown", "File attachments", "@mentions with notifications", "Comment resolution tracking"]', '["CommentEditor", "CommentThread", "FileUpload"]),

-- Analytics & Reporting Components
('TaskAnalytics', 'Task Analytics Dashboard', 'Task performance insights with comprehensive metrics and trends', 'Task performance insights with completion rate trends, time tracking analysis, productivity metrics, team performance comparison, and custom date range selection', 'planned', 'medium', 'analytics_reporting', 'data', 'not_started', 12.0, 'src/pages/playground/components/task-management/analytics/TaskAnalytics.tsx', '["analyticsData", "dateRange", "metrics"]', '["Completion rate trends", "Time tracking analysis", "Productivity metrics", "Team performance comparison", "Custom date range selection"]', '["AnalyticsChart", "MetricsCard", "DateRangePicker"]'),

('BurndownChart', 'Sprint Burndown Chart', 'Sprint/project progress tracking with predictive analysis', 'Sprint/project progress tracking with sprint/project burndown, ideal vs actual progress, scope change indicators, and predictive completion dates', 'planned', 'medium', 'analytics_reporting', 'data', 'not_started', 6.0, 'src/pages/playground/components/task-management/analytics/BurndownChart.tsx', '["sprintData", "tasks", "idealBurndown"]', '["Sprint/project burndown", "Ideal vs actual progress", "Scope change indicators", "Predictive completion dates"]', '["LineChart", "ProgressIndicator", "TrendAnalysis"]'),

('VelocityChart', 'Team Velocity Chart', 'Team velocity analysis with forecasting capabilities', 'Team velocity analysis with velocity tracking, sprint-over-sprint comparison, capacity vs velocity analysis, and forecast modeling', 'planned', 'low', 'analytics_reporting', 'data', 'not_started', 8.0, 'src/pages/playground/components/task-management/analytics/VelocityChart.tsx', '["velocityData", "sprints", "forecasting"]', '["Team velocity tracking", "Sprint-over-sprint comparison", "Capacity vs velocity analysis", "Forecast modeling"]', '["VelocityChart", "ComparisonView", "ForecastModel"]),

-- Time & Tracking Components
('TimeTracker', 'Time Tracking Interface', 'Time tracking interface with timer and manual entry capabilities', 'Time tracking with start/stop timer functionality, manual time entry, time categorization, break tracking, and daily/weekly summaries', 'planned', 'high', 'time_tracking', 'interactive', 'not_started', 8.0, 'src/pages/playground/components/task-management/time-tracking/TimeTracker.tsx', '["currentTask", "timeEntries", "onTimeUpdate"]', '["Start/stop timer functionality", "Manual time entry", "Time categorization", "Break tracking", "Daily/weekly summaries"]', '["Timer", "TimeEntry", "TimeCategory"]'),

('TimesheetView', 'Timesheet Management', 'Time reporting and approval with project allocation tracking', 'Time reporting and approval with weekly time grid, project time allocation, approval workflow, export functionality, and overtime tracking', 'planned', 'medium', 'time_tracking', 'data', 'not_started', 10.0, 'src/pages/playground/components/task-management/time-tracking/TimesheetView.tsx', '["timeEntries", "approvalStatus", "projects"]', '["Weekly time grid", "Project time allocation", "Approval workflow", "Export functionality", "Overtime tracking"]', '["TimeGrid", "ApprovalFlow", "ExportTool"]),

-- Mobile & Accessibility Components
('TaskMobile', 'Mobile Task Interface', 'Mobile-optimized task interface with touch interactions and offline capabilities', 'Mobile-optimized task interface with touch-optimized interface, swipe actions, voice commands, offline sync capability, and mobile-first navigation', 'planned', 'medium', 'mobile_accessibility', 'interactive', 'not_started', 12.0, 'src/pages/playground/components/task-management/mobile/TaskMobile.tsx', '["tasks", "touchActions", "offlineMode"]', '["Touch-optimized interface", "Swipe actions", "Voice commands", "Offline sync capability", "Mobile-first navigation"]', '["TouchHandler", "SwipeGesture", "OfflineSync"]'),

('AccessibilityPanel', 'Accessibility Control Panel', 'Accessibility configuration with comprehensive customization options', 'Accessibility configuration with high contrast mode, font size adjustment, keyboard navigation aids, screen reader optimization, and voice control interface', 'planned', 'low', 'mobile_accessibility', 'navigation', 'not_started', 6.0, 'src/pages/playground/components/task-management/mobile/AccessibilityPanel.tsx', '["accessibilitySettings", "onSettingsChange"]', '["High contrast mode", "Font size adjustment", "Keyboard navigation aids", "Screen reader optimization", "Voice control interface"]', '["AccessibilityControls", "ContrastToggle", "FontSizeSlider"])

ON CONFLICT (name) DO NOTHING;

-- Grant necessary permissions (adjust based on your security requirements)
-- For Supabase, these permissions are typically handled through the dashboard
-- GRANT ALL ON page_components TO authenticated;
-- GRANT ALL ON page_components TO anon;

COMMENT ON TABLE page_components IS 'Stores component specifications for the dashboard with implementation tracking';
COMMENT ON COLUMN page_components.name IS 'Unique component name/identifier';
COMMENT ON COLUMN page_components.title IS 'Human-readable component title';
COMMENT ON COLUMN page_components.description IS 'Detailed description of the component';
COMMENT ON COLUMN page_components.functionality IS 'Detailed explanation of what the component does';
COMMENT ON COLUMN page_components.status IS 'Current status of the component (active, inactive, deprecated, planned, draft)';
COMMENT ON COLUMN page_components.priority IS 'Priority level for implementation (low, medium, high, critical)';
COMMENT ON COLUMN page_components.category IS 'Category type of the component';
COMMENT ON COLUMN page_components.group_type IS 'Component group classification';
COMMENT ON COLUMN page_components.implementation_status IS 'Current implementation progress';
COMMENT ON COLUMN page_components.dependencies IS 'Array of component dependencies';
COMMENT ON COLUMN page_components.props IS 'Array of component props';
COMMENT ON COLUMN page_components.features IS 'Array of key component features';
COMMENT ON COLUMN page_components.file_path IS 'Expected file path for the component';
COMMENT ON COLUMN page_components.tags IS 'Array of tags for categorization and search';
COMMENT ON COLUMN page_components.metadata IS 'Additional structured data for the component';