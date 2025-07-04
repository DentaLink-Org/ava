# Supabase Database Guide for AVA Platform

This comprehensive guide covers all aspects of database interactions in the AVA platform, from basic operations to advanced migrations and troubleshooting.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Database Client Configuration](#database-client-configuration)
3. [Migration System](#migration-system)
4. [Basic Database Operations](#basic-database-operations)
5. [Advanced Database Operations](#advanced-database-operations)
6. [Schema Management](#schema-management)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Environment Setup

### Required Environment Variables

The platform uses prefixed environment variables to avoid conflicts with Vercel's automatic Supabase integration:

```env
# In .env.local (development) or Vercel environment variables (production)
AVA_NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
AVA_NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Environment Variable Access

```typescript
// Client-side access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side access (includes service role)
const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
```

---

## Database Client Configuration

### Client-Side Database Access

```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Server-Side Database Access

```typescript
// src/lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

### Database Configuration Helper

```typescript
// src/lib/db/config.ts
export function getSupabaseConfig() {
  const url = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.AVA_NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  return {
    url,
    anonKey,
    serviceKey,
    isConfigured: !!(url && anonKey),
    hasServiceRole: !!serviceKey
  };
}
```

---

## Migration System

### Overview

The AVA platform includes a complete automated migration system that eliminates the need for manual database schema management through the Supabase dashboard.

### Available Commands

```bash
# Check migration status
npm run db:migrate

# Create new migration
npm run db:migrate:create <migration-name>

# Run specific database commands
npm run db:setup    # Initial database setup
npm run db:test     # Test database connection
npm run db:verify   # Verify database configuration
```

### Migration Workflow

#### 1. Creating a Migration

```bash
npm run db:migrate:create add_user_profiles
```

This creates a timestamped file: `database/migrations/20250704120000_add_user_profiles.sql`

#### 2. Writing Migration SQL

```sql
-- Migration: Add user profiles table
-- Created: 2025-07-04T12:00:00.000Z

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);
```

#### 3. Deploying Migrations

1. **Push to repository**
2. **Deploy to Vercel** - migrations run automatically
3. **Check migration status** via API or app banner

### Migration API Endpoints

#### GET /api/migrate
Check migration status:

```typescript
const response = await fetch('/api/migrate');
const data = await response.json();
// Returns: { totalMigrations, executedMigrations, pendingMigrations, pendingCount }
```

#### POST /api/migrate
Run pending migrations:

```typescript
const response = await fetch('/api/migrate', { method: 'POST' });
const data = await response.json();
// Returns: { message, pendingCount, successCount, results }
```

### Auto-Migration on Deploy

The platform automatically checks for pending migrations on deployment:

- **Development**: Auto-runs migrations
- **Production**: Shows migration banner for manual approval

---

## Basic Database Operations

### Reading Data

```typescript
// Select all records
const { data, error } = await supabase
  .from('tasks')
  .select('*');

// Select specific columns
const { data, error } = await supabase
  .from('tasks')
  .select('id, title, status, created_at');

// Select with filters
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('status', 'completed')
  .order('created_at', { ascending: false });

// Select with joins
const { data, error } = await supabase
  .from('tasks')
  .select(`
    *,
    assigned_user:users(name, email)
  `);
```

### Writing Data

```typescript
// Insert single record
const { data, error } = await supabase
  .from('tasks')
  .insert({
    title: 'New Task',
    description: 'Task description',
    status: 'pending',
    priority: 'medium'
  })
  .select();

// Insert multiple records
const { data, error } = await supabase
  .from('tasks')
  .insert([
    { title: 'Task 1', status: 'pending' },
    { title: 'Task 2', status: 'pending' }
  ])
  .select();

// Update records
const { data, error } = await supabase
  .from('tasks')
  .update({ status: 'completed' })
  .eq('id', taskId)
  .select();

// Delete records
const { data, error } = await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId);
```

### Error Handling

```typescript
async function fetchTasks() {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*');
    
    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
```

---

## Advanced Database Operations

### Real-time Subscriptions

```typescript
// Subscribe to table changes
const channel = supabase
  .channel('tasks-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'tasks' },
    (payload) => {
      console.log('Change received:', payload);
      // Handle real-time updates
    }
  )
  .subscribe();

// Unsubscribe
channel.unsubscribe();
```

### Stored Procedures (RPC)

```typescript
// Call stored procedure
const { data, error } = await supabase
  .rpc('get_task_statistics', {
    user_id: userId,
    date_range: '30 days'
  });
```

### Transactions

```typescript
// Using Supabase transactions
const { data, error } = await supabase.rpc('execute_transaction', {
  operations: [
    { table: 'tasks', action: 'insert', data: { title: 'New Task' } },
    { table: 'task_history', action: 'insert', data: { task_id: 'new-id', action: 'created' } }
  ]
});
```

### File Storage

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('attachments')
  .upload(`tasks/${taskId}/${fileName}`, file);

// Download file
const { data, error } = await supabase.storage
  .from('attachments')
  .download(`tasks/${taskId}/${fileName}`);

// Get public URL
const { data } = supabase.storage
  .from('attachments')
  .getPublicUrl(`tasks/${taskId}/${fileName}`);
```

---

## Schema Management

### Current Database Schema

The platform maintains several core tables:

#### Core Tables
- `themes` - Theme configurations
- `theme_variations` - Theme variations
- `page_theme_assignments` - Page-theme mappings
- `components` - Reusable components
- `page_components` - Page-component assignments
- `pages` - Page configurations
- `tasks` - Task management
- `database_connections` - Database connections
- `migrations` - Migration tracking

#### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING (condition);
```

### Schema Validation

```typescript
// Validate table structure
async function validateTableSchema(tableName: string) {
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', tableName);
  
  return { data, error };
}
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Could not find column" Error

**Problem**: Database schema is out of sync with application code.

**Solution**:
1. Check pending migrations: `GET /api/migrate`
2. Run migrations: `POST /api/migrate`
3. Or create new migration to add missing columns

#### 2. Environment Variables Not Found

**Problem**: Missing or incorrect environment variables.

**Solution**:
```typescript
// Check configuration
import { getSupabaseConfig } from '@/lib/db/config';

const config = getSupabaseConfig();
if (!config.isConfigured) {
  throw new Error('Supabase configuration missing');
}
```

#### 3. RLS Policy Blocking Access

**Problem**: Row Level Security policies preventing data access.

**Solution**:
1. Check existing policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

2. Create appropriate policies:
```sql
CREATE POLICY "public_read_policy" ON your_table
  FOR SELECT TO anon USING (true);
```

#### 4. Migration Failures

**Problem**: Migration fails to execute.

**Solution**:
1. Check migration logs in `/api/migrate`
2. Verify SQL syntax
3. Check for dependency issues
4. Use `IF NOT EXISTS` for safe operations

### Debugging Tools

#### Database Connection Test

```typescript
// Test database connectivity
async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('migrations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection failed:', error);
      return false;
    }
    
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database test error:', error);
    return false;
  }
}
```

#### Schema Inspection

```typescript
// Get table information
async function getTableInfo(tableName: string) {
  const { data, error } = await supabase
    .rpc('get_table_schema', { table_name: tableName });
  
  return { data, error };
}
```

---

## Best Practices

### 1. Migration Best Practices

- **Use descriptive names**: `add_user_authentication` not `update_db`
- **Keep migrations small**: One logical change per migration
- **Use safe operations**: Always use `IF NOT EXISTS` / `IF EXISTS`
- **Test locally**: Verify migrations work before deploying
- **Never edit old migrations**: Create new ones for changes

### 2. Query Best Practices

```typescript
// ✅ Good: Select only needed columns
const { data } = await supabase
  .from('tasks')
  .select('id, title, status');

// ❌ Bad: Select all columns unnecessarily
const { data } = await supabase
  .from('tasks')
  .select('*');

// ✅ Good: Use proper error handling
const { data, error } = await supabase
  .from('tasks')
  .select('*');

if (error) {
  throw new Error(`Database error: ${error.message}`);
}

// ✅ Good: Use indexes for filtering
const { data } = await supabase
  .from('tasks')
  .select('*')
  .eq('status', 'active')  // Indexed column
  .order('created_at', { ascending: false });
```

### 3. Security Best Practices

```typescript
// ✅ Good: Use RLS policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

// ✅ Good: Use service role for admin operations
const supabaseAdmin = createClient(url, serviceRoleKey);

// ✅ Good: Validate input data
function validateTaskData(data: any) {
  if (!data.title || data.title.length < 1) {
    throw new Error('Task title is required');
  }
  // Additional validations...
}
```

### 4. Performance Best Practices

```typescript
// ✅ Good: Use pagination for large datasets
const { data } = await supabase
  .from('tasks')
  .select('*')
  .range(0, 49)  // First 50 records
  .order('created_at', { ascending: false });

// ✅ Good: Use proper indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

// ✅ Good: Use connection pooling for high traffic
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

---

## Quick Reference

### Essential Commands
```bash
# Migration commands
npm run db:migrate                    # Run pending migrations
npm run db:migrate:create <name>      # Create new migration

# Database commands  
npm run db:setup                      # Initial setup
npm run db:test                       # Test connection
npm run db:verify                     # Verify configuration
```

### Essential API Endpoints
```
GET  /api/migrate                     # Check migration status
POST /api/migrate                     # Run pending migrations
```

### Essential File Locations
```
src/lib/supabase/client.ts           # Client-side database access
src/lib/supabase/server.ts           # Server-side database access
src/lib/db/config.ts                 # Database configuration
src/lib/db/migrations.ts             # Migration runner
database/migrations/                 # Migration files
database/setup.sql                   # Initial schema
```

---

## Summary

This guide provides everything needed for successful database interactions in the AVA platform. The automated migration system eliminates manual schema management, while the comprehensive API examples cover all common use cases. Following these practices ensures reliable, secure, and performant database operations.

For additional help or advanced scenarios not covered here, refer to the [Supabase documentation](https://supabase.com/docs) or create an issue in the project repository.