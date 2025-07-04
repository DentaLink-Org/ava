# Database Setup Guide

## Quick Setup Instructions

### Option 1: Use the Fixed Schema (Recommended)

Run this single file in your Supabase SQL editor:

```sql
-- Copy and paste the contents of:
/database/schema/enhanced_tasks_fixed.sql
```

This file includes all prerequisite tables (users, projects, milestones) and will work independently.

### Option 2: Run in Sequence (If you want to use existing milestone setup)

If you want to run the original milestone schema first:

1. **First, run the milestone schema:**
   ```sql
   -- Copy and paste contents of:
   /database/schema/milestones.sql
   ```

2. **Then run the enhanced tasks schema:**
   ```sql
   -- Copy and paste contents of:
   /database/schema/enhanced_tasks.sql
   ```

## What Gets Created

### Core Tables
- `users` - User management
- `projects` - Project organization
- `milestones` - Milestone tracking
- `tasks` - Enhanced task management (25+ fields)

### Task Enhancement Tables
- `task_dependencies` - Task relationships and dependencies
- `task_comments` - Threaded discussions with mentions
- `task_attachments` - File management
- `task_time_entries` - Time tracking
- `task_templates` - Reusable task templates
- `task_status_configs` - Custom status workflows
- `task_automations` - Workflow automation rules
- `task_history` - Complete audit trail

### Sample Data Included
- 3 sample users
- 3 sample projects  
- 3 sample milestones
- 3 sample tasks
- 7 default status configurations
- 3 task templates (Bug Fix, Feature Development, Code Review)

## Advanced Features

### Business Logic Functions
- ✅ Circular dependency prevention
- ✅ Automatic time duration calculation
- ✅ Task change tracking and audit trail
- ✅ Status-based workflow automation
- ✅ Progress tracking

### Performance Optimizations
- ✅ Comprehensive indexing on all searchable fields
- ✅ GIN indexes for JSONB and array fields
- ✅ Foreign key relationships with proper cascading
- ✅ Optimized queries for large datasets

### Security
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Public policies for development (should be restricted in production)
- ✅ Proper foreign key constraints
- ✅ Data validation with check constraints

## Verification

After running the SQL, you should see output like:

```
Enhanced task schema setup complete!
user_count: 3
project_count: 3  
milestone_count: 3
task_count: 3
status_config_count: 7
template_count: 3
```

## Troubleshooting

### Common Issues

1. **"relation does not exist" errors**
   - Use `enhanced_tasks_fixed.sql` which includes all prerequisites
   - Make sure you're running in the correct Supabase project

2. **Permission errors**
   - Ensure you're using the SQL editor in Supabase dashboard
   - Make sure you have admin privileges on the project

3. **Constraint violations**
   - The script handles existing data migration automatically
   - If you have existing tasks, they'll be preserved and enhanced

### Manual Verification Queries

```sql
-- Check table structure
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'task%' 
ORDER BY table_name;

-- Check sample data
SELECT title, status, priority, complexity, effort_level 
FROM tasks 
LIMIT 5;

-- Check dependencies work
SELECT COUNT(*) as dependency_count 
FROM task_dependencies;
```

## Next Steps

Once the database is set up:

1. ✅ Database schema is complete
2. 🎯 **Next**: Enhanced TypeScript types (Phase 1.2)
3. 🎯 **Then**: API service layer (Phase 1.3)
4. 🎯 **Then**: Data hooks (Phase 1.4)
5. 🎯 **Finally**: Component development (Phase 1.5)

The enhanced task management system foundation is now ready for application development!