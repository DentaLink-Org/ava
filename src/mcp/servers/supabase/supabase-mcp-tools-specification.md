# Supabase MCP Server - Tools Specification

## Overview
This document outlines all the tools needed for a comprehensive Supabase MCP server that provides full database management capabilities.

---

## 1. Schema Management Tools

### `create_table`
Create a new table with specified columns and constraints.
```json
{
  "table_name": "string",
  "columns": [
    {
      "name": "string",
      "type": "string",
      "nullable": "boolean",
      "default": "any",
      "primary_key": "boolean",
      "unique": "boolean"
    }
  ],
  "constraints": ["string[]"],
  "if_not_exists": "boolean"
}
```

### `drop_table`
Drop an existing table.
```json
{
  "table_name": "string",
  "if_exists": "boolean",
  "cascade": "boolean"
}
```

### `alter_table`
Modify table structure (add/drop/modify columns).
```json
{
  "table_name": "string",
  "operation": "add_column|drop_column|modify_column|rename_column|rename_table",
  "column_name": "string",
  "new_column_name": "string",
  "column_type": "string",
  "nullable": "boolean",
  "default": "any"
}
```

### `create_enum_type`
Create custom enum types.
```json
{
  "type_name": "string",
  "values": ["string[]"],
  "if_not_exists": "boolean"
}
```

### `drop_enum_type`
Drop custom enum types.
```json
{
  "type_name": "string",
  "if_exists": "boolean",
  "cascade": "boolean"
}
```

### `create_index`
Create database indexes for performance.
```json
{
  "index_name": "string",
  "table_name": "string",
  "columns": ["string[]"],
  "unique": "boolean",
  "type": "btree|gin|gist|hash",
  "if_not_exists": "boolean"
}
```

### `drop_index`
Drop database indexes.
```json
{
  "index_name": "string",
  "if_exists": "boolean",
  "cascade": "boolean"
}
```

### `create_function`
Create PostgreSQL functions.
```json
{
  "function_name": "string",
  "parameters": [
    {
      "name": "string",
      "type": "string",
      "default": "any"
    }
  ],
  "return_type": "string",
  "language": "plpgsql|sql|javascript",
  "body": "string",
  "replace": "boolean"
}
```

### `drop_function`
Drop PostgreSQL functions.
```json
{
  "function_name": "string",
  "parameters": ["string[]"],
  "if_exists": "boolean",
  "cascade": "boolean"
}
```

### `create_trigger`
Create database triggers.
```json
{
  "trigger_name": "string",
  "table_name": "string",
  "timing": "before|after|instead_of",
  "events": ["insert|update|delete|truncate"],
  "function_name": "string",
  "for_each": "row|statement"
}
```

### `drop_trigger`
Drop database triggers.
```json
{
  "trigger_name": "string",
  "table_name": "string",
  "if_exists": "boolean",
  "cascade": "boolean"
}
```

---

## 2. Data Operations (CRUD)

### `insert_data`
Insert single or multiple records.
```json
{
  "table_name": "string",
  "data": "object|object[]",
  "on_conflict": "ignore|replace|error",
  "returning": ["string[]"]
}
```

### `select_data`
Query data with filtering, sorting, and pagination.
```json
{
  "table_name": "string",
  "columns": ["string[]"],
  "where": "object",
  "order_by": [
    {
      "column": "string",
      "direction": "asc|desc"
    }
  ],
  "limit": "number",
  "offset": "number",
  "joins": [
    {
      "type": "inner|left|right|full",
      "table": "string",
      "on": "string"
    }
  ]
}
```

### `update_data`
Update existing records.
```json
{
  "table_name": "string",
  "data": "object",
  "where": "object",
  "returning": ["string[]"]
}
```

### `delete_data`
Delete records.
```json
{
  "table_name": "string",
  "where": "object",
  "returning": ["string[]"]
}
```

### `upsert_data`
Insert or update records (upsert operation).
```json
{
  "table_name": "string",
  "data": "object|object[]",
  "conflict_columns": ["string[]"],
  "update_columns": ["string[]"],
  "returning": ["string[]"]
}
```

### `bulk_insert`
Efficient bulk data insertion.
```json
{
  "table_name": "string",
  "data": ["object[]"],
  "batch_size": "number",
  "on_conflict": "ignore|replace|error"
}
```

### `bulk_update`
Efficient bulk data updates.
```json
{
  "table_name": "string",
  "updates": [
    {
      "where": "object",
      "data": "object"
    }
  ]
}
```

### `bulk_delete`
Efficient bulk data deletion.
```json
{
  "table_name": "string",
  "where_conditions": ["object[]"]
}
```

---

## 3. Database Metadata & Inspection

### `list_tables`
Get all tables in the database.
```json
{
  "schema": "string",
  "include_system_tables": "boolean"
}
```

### `get_table_schema`
Get detailed table structure.
```json
{
  "table_name": "string",
  "schema": "string"
}
```

### `table_exists`
Check if a table exists.
```json
{
  "table_name": "string",
  "schema": "string"
}
```

### `column_exists`
Check if a column exists in a table.
```json
{
  "table_name": "string",
  "column_name": "string",
  "schema": "string"
}
```

### `get_table_info`
Get table statistics and information.
```json
{
  "table_name": "string",
  "include_stats": "boolean",
  "include_indexes": "boolean",
  "include_constraints": "boolean"
}
```

### `list_columns`
Get all columns for a table.
```json
{
  "table_name": "string",
  "schema": "string"
}
```

### `list_indexes`
Get all indexes for a table or database.
```json
{
  "table_name": "string",
  "schema": "string"
}
```

### `list_functions`
Get all custom functions.
```json
{
  "schema": "string",
  "function_name_pattern": "string"
}
```

### `list_enum_types`
Get all custom enum types.
```json
{
  "schema": "string"
}
```

---

## 4. Raw SQL Execution

### `execute_sql`
Execute raw SQL queries.
```json
{
  "sql": "string",
  "parameters": ["any[]"],
  "transaction": "boolean"
}
```

### `execute_rpc`
Call PostgreSQL functions via RPC.
```json
{
  "function_name": "string",
  "parameters": "object"
}
```

### `execute_batch`
Execute multiple SQL statements in a transaction.
```json
{
  "statements": [
    {
      "sql": "string",
      "parameters": ["any[]"]
    }
  ],
  "rollback_on_error": "boolean"
}
```

---

## 5. Row Level Security (RLS)

### `enable_rls`
Enable Row Level Security on a table.
```json
{
  "table_name": "string"
}
```

### `disable_rls`
Disable Row Level Security on a table.
```json
{
  "table_name": "string"
}
```

### `create_policy`
Create RLS policies.
```json
{
  "policy_name": "string",
  "table_name": "string",
  "command": "all|select|insert|update|delete",
  "role": "string",
  "using": "string",
  "with_check": "string"
}
```

### `drop_policy`
Drop RLS policies.
```json
{
  "policy_name": "string",
  "table_name": "string",
  "if_exists": "boolean"
}
```

### `list_policies`
List all RLS policies for a table.
```json
{
  "table_name": "string"
}
```

---

## 6. Real-time Features

### `subscribe_to_table`
Subscribe to real-time changes on a table.
```json
{
  "table_name": "string",
  "event": "insert|update|delete|*",
  "filter": "object",
  "callback_url": "string"
}
```

### `unsubscribe_from_table`
Unsubscribe from real-time changes.
```json
{
  "subscription_id": "string"
}
```

### `list_subscriptions`
List active real-time subscriptions.
```json
{
  "table_name": "string"
}
```

---

## 7. Views Management

### `create_view`
Create database views.
```json
{
  "view_name": "string",
  "sql_query": "string",
  "materialized": "boolean",
  "replace": "boolean"
}
```

### `drop_view`
Drop database views.
```json
{
  "view_name": "string",
  "if_exists": "boolean",
  "cascade": "boolean"
}
```

### `refresh_materialized_view`
Refresh materialized views.
```json
{
  "view_name": "string",
  "concurrently": "boolean"
}
```

### `list_views`
List all views in the database.
```json
{
  "schema": "string",
  "include_materialized": "boolean"
}
```

---

## 8. Storage Operations

### `upload_file`
Upload files to Supabase Storage.
```json
{
  "bucket": "string",
  "path": "string",
  "file": "binary",
  "content_type": "string",
  "cache_control": "string",
  "upsert": "boolean"
}
```

### `download_file`
Download files from Supabase Storage.
```json
{
  "bucket": "string",
  "path": "string"
}
```

### `delete_file`
Delete files from Supabase Storage.
```json
{
  "bucket": "string",
  "paths": ["string[]"]
}
```

### `list_files`
List files in a storage bucket.
```json
{
  "bucket": "string",
  "path": "string",
  "limit": "number",
  "offset": "number"
}
```

### `get_file_url`
Get public URL for a file.
```json
{
  "bucket": "string",
  "path": "string",
  "expires_in": "number"
}
```

### `create_bucket`
Create a new storage bucket.
```json
{
  "bucket_name": "string",
  "public": "boolean",
  "file_size_limit": "number",
  "allowed_mime_types": ["string[]"]
}
```

### `delete_bucket`
Delete a storage bucket.
```json
{
  "bucket_name": "string"
}
```

---

## 9. Authentication & User Management

### `create_user`
Create a new user.
```json
{
  "email": "string",
  "password": "string",
  "user_metadata": "object",
  "email_confirm": "boolean"
}
```

### `get_user`
Get user information.
```json
{
  "user_id": "string"
}
```

### `update_user`
Update user information.
```json
{
  "user_id": "string",
  "email": "string",
  "password": "string",
  "user_metadata": "object"
}
```

### `delete_user`
Delete a user.
```json
{
  "user_id": "string"
}
```

### `list_users`
List all users.
```json
{
  "page": "number",
  "per_page": "number"
}
```

---

## 10. Database Administration

### `get_database_stats`
Get database statistics.
```json
{
  "include_tables": "boolean",
  "include_indexes": "boolean",
  "include_size": "boolean"
}
```

### `vacuum_table`
Vacuum a table for performance.
```json
{
  "table_name": "string",
  "full": "boolean",
  "analyze": "boolean"
}
```

### `analyze_table`
Update table statistics.
```json
{
  "table_name": "string"
}
```

### `backup_table`
Create a backup of table data.
```json
{
  "table_name": "string",
  "format": "json|csv|sql",
  "include_schema": "boolean"
}
```

### `restore_table`
Restore table data from backup.
```json
{
  "table_name": "string",
  "backup_data": "string",
  "format": "json|csv|sql",
  "truncate_first": "boolean"
}
```

---

## 11. Edge Functions

### `create_edge_function`
Create or deploy an edge function.
```json
{
  "function_name": "string",
  "source_code": "string",
  "import_map": "object"
}
```

### `invoke_edge_function`
Invoke an edge function.
```json
{
  "function_name": "string",
  "payload": "any",
  "headers": "object"
}
```

### `delete_edge_function`
Delete an edge function.
```json
{
  "function_name": "string"
}
```

### `list_edge_functions`
List all edge functions.
```json
{}
```

---

## 12. Utility Functions

### `test_connection`
Test database connection.
```json
{}
```

### `get_version`
Get Supabase/PostgreSQL version information.
```json
{}
```

### `explain_query`
Get query execution plan.
```json
{
  "sql": "string",
  "analyze": "boolean",
  "format": "text|json|xml"
}
```

### `validate_sql`
Validate SQL syntax without executing.
```json
{
  "sql": "string"
}
```

---

## Implementation Notes

### Authentication
All tools should support:
- API key authentication
- JWT token authentication
- Service role authentication

### Error Handling
All tools should return:
```json
{
  "success": "boolean",
  "data": "any",
  "error": "string",
  "code": "string"
}
```

### Connection Management
- Support for multiple projects/databases
- Connection pooling
- Automatic reconnection
- Timeout handling

### Security Considerations
- Validate all inputs
- Sanitize SQL to prevent injection
- Respect RLS policies
- Audit logging for sensitive operations

This comprehensive set of tools would provide complete control over Supabase databases, enabling automated schema management, data operations, and administration tasks through the MCP server.