# Database Schema Errors: Missing columns in schema cache

## Problem Description

Multiple database operations are failing due to missing columns in the schema cache. Users encounter these errors when performing common database management tasks.

## Specific Error Cases

### 1. Creating a Database
**Error**: `Could not find the 'size_bytes' column of 'user_databases' in the schema cache`
**When**: User clicks on creating a database and enters all the information

### 2. Adding Column to Schema  
**Error**: `Could not find the 'is_unique' column of 'schema_columns' in the schema cache`
**When**: User clicks on a database and tries to add a new column to its schema

### 3. Creating New Table
**Error**: `Could not find the 'column_count' column of 'database_schemas' in the schema cache`
**When**: User tries to create a new table in a database

### 4. Loading Features Database
**Error**: `Database Error` and `Features table not found. Please run the database setup script to create the page_features table.`
**When**: User loads the Features Database

### 5. Adding New Feature
**Error**: `Features table not found. Please run the database setup script to create the page_features table.`
**When**: User tries to add a new feature

## Technical Context

### Current Database Schema
Based on codebase analysis, the following tables should exist with these columns:

**user_databases table** (setup in `/src/pages/databases/scripts/setup-database-tables.sql`):
- id, title, description, type, status, created_at, updated_at, table_count, record_count, **size** (not size_bytes)

**schema_columns table**:
- id, schema_id, column_name, data_type, is_nullable, is_primary_key, **is_unique**, default_value, column_order, etc.

**database_schemas table**:
- id, database_id, table_name, display_name, description, created_at, updated_at, **column_count**, record_count

**page_features table** (setup in `/src/pages/page-manager/scripts/setup-features-table.sql`):
- Complete schema defined but table may not be created in Supabase instance

### Database Architecture
- **Database**: Supabase
- **Client Setup**: `/src/pages/databases/api/supabase.ts`
- **Schema Management**: `/src/pages/databases/hooks/useRealtimeSchemas.ts`
- **Real-time Subscriptions**: Enabled for all tables

## Root Cause Analysis

The errors suggest one of these issues:

1. **Schema Mismatch**: Application expects different column names than what exists in database
   - App expects `size_bytes` but schema defines `size` 
   - Column names may have been changed without updating application code

2. **Missing Tables**: Database setup scripts haven't been run
   - `page_features` table doesn't exist
   - Core database tables may be missing columns

3. **Schema Cache Issues**: No explicit schema cache implementation found in codebase
   - System relies on direct Supabase queries
   - Real-time subscriptions may be accessing non-existent columns

## Files to Investigate

### Setup Scripts
- `/src/pages/databases/scripts/setup-database-tables.sql`
- `/src/pages/page-manager/scripts/setup-features-table.sql`  
- `/src/pages/databases/scripts/setup-database.ts`

### API Layer
- `/src/pages/databases/api/supabase.ts`
- `/src/pages/databases/api/database-crud.ts`
- `/src/pages/databases/api/schema-operations.ts`

### Real-time Hooks  
- `/src/pages/databases/hooks/useRealtimeDatabases.ts`
- `/src/pages/databases/hooks/useRealtimeSchemas.ts`
- `/src/pages/databases/hooks/useSchemaManager.ts`

## Suggested Resolution Steps

1. **Audit Database Schema**: Compare actual Supabase tables with expected schema in SQL files
2. **Run Setup Scripts**: Ensure all database setup scripts have been executed
3. **Check Column Names**: Verify application code uses correct column names (size vs size_bytes)
4. **Review Real-time Queries**: Check if subscriptions reference non-existent columns  
5. **Add Error Handling**: Improve error messages to show which specific query is failing
6. **Create Setup Validation**: Add script to verify all required tables and columns exist

## Environment
- **Frontend**: Next.js 14, React 18, TypeScript
- **Database**: Supabase with real-time subscriptions  
- **Local Development**: http://127.0.0.1:54321

## Priority
**High** - Blocks core database management functionality

## Labels
database, bug, schema, supabase, high-priority