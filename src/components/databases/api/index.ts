/**
 * Database page API exports
 * This file provides clean exports for all database-specific API handlers
 */

// Export all database API handlers with specific named exports
export {
  type DatabaseOperations,
  type CreateDatabaseDto,
  type UpdateDatabaseDto,
  type DatabaseFilters,
  type DatabaseResponse,
  type DatabaseListResponse,
  databaseOperations,
  validateDatabaseConnection,
  getDatabaseStats
} from './database-crud';

export {
  type SchemaOperations,
  type CreateTableDto,
  type AlterTableDto,
  type ColumnDefinition,
  type ColumnModification,
  type IndexDefinition,
  type ConstraintDefinition,
  type TableResponse,
  type ColumnInfo,
  type TableListResponse,
  type TableSchemaResponse,
  type IndexInfo,
  type ConstraintInfo,
  type TriggerInfo,
  type QueryResult,
  schemaOperations,
  generateCreateTableSQL
} from './schema-operations';

export {
  supabaseClient,
  isSupabaseConfigured,
  getDatabaseConfig
} from './supabase';

export {
  type ColumnDefinition as TableColumnDefinition,
  type CreateTableOptions,
  TableCreator
} from './table-creator';

export {
  type DatabaseSnapshot,
  type DatabaseChange,
  type CreateSnapshotOptions,
  type RecordChangeOptions,
  HistoryManager
} from './history-manager';

// Re-export the default supabase client for convenience
export { default as supabase } from './supabase';