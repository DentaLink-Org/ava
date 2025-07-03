/**
 * Database page hooks exports
 * This file provides clean exports for all database-specific hooks
 */

// Export all database hooks
export { useDatabaseList } from './useDatabaseList';
export { useSchemaManager } from './useSchemaManager';
export { useRealtimeDatabases } from './useRealtimeDatabases';
export { useRealtimeSchemas } from './useRealtimeSchemas';
export { useRealtimeTableData } from './useRealtimeTableData';

// Export hook types
export type { DatabaseListHook, Database } from './useDatabaseList';
export type { SchemaManagerHook, Schema } from './useSchemaManager';
export type { UseRealtimeDatabasesResult } from './useRealtimeDatabases';
export type { UseRealtimeSchemasResult, SchemaWithColumns } from './useRealtimeSchemas';
export type { UseRealtimeTableDataResult, TableRecord } from './useRealtimeTableData';

// Default exports (avoid duplicate exports)
// Main hooks are already exported above, so we can import the defaults for convenience
import useRealtimeDatabasesDefault from './useRealtimeDatabases';
import useRealtimeSchemasDefault from './useRealtimeSchemas';
import useRealtimeTableDataDefault from './useRealtimeTableData';

// Re-export with different names to avoid conflicts
export { 
  useRealtimeDatabasesDefault,
  useRealtimeSchemasDefault,
  useRealtimeTableDataDefault
};