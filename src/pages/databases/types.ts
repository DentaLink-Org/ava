/**
 * Database page type definitions
 * Contains all TypeScript interfaces and types for the databases page
 */

// Database-related types
export interface Database {
  id: string;
  title: string;
  description?: string;
  type: DatabaseType;
  status: DatabaseStatus;
  created_at: string;
  updated_at: string;
  table_count: number;
  record_count: number;
  size: string;
  connection?: DatabaseConnection;
}

export type DatabaseType = 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
export type DatabaseStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface DatabaseConnection {
  host: string;
  port: number;
  database: string;
  username?: string;
  ssl?: boolean;
  connectionString?: string;
}

// Schema and table types
export interface DatabaseSchema {
  id: string;
  database_id: string;
  table_name: string;
  columns: TableColumn[];
  indexes?: TableIndex[];
  constraints?: TableConstraint[];
  created_at: string;
  updated_at: string;
}

export interface TableColumn {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  primary_key: boolean;
  unique: boolean;
  default_value?: any;
  references?: ColumnReference;
  comment?: string;
}

export interface ColumnReference {
  table: string;
  column: string;
  on_delete?: ReferentialAction;
  on_update?: ReferentialAction;
}

export type ReferentialAction = 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT';

export interface TableIndex {
  id: string;
  name: string;
  columns: string[];
  unique: boolean;
  type: IndexType;
  condition?: string;
}

export type IndexType = 'btree' | 'hash' | 'gin' | 'gist' | 'spgist' | 'brin';

export interface TableConstraint {
  id: string;
  name: string;
  type: ConstraintType;
  definition: string;
  columns?: string[];
}

export type ConstraintType = 'check' | 'unique' | 'foreign_key' | 'exclude';

// Query-related types
export interface QueryExecution {
  id: string;
  database_id: string;
  query: string;
  status: QueryStatus;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  rows_affected?: number;
  error?: string;
}

export type QueryStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface QueryResult {
  rows: Record<string, any>[];
  row_count: number;
  fields: QueryField[];
  execution_time: number;
  query: string;
}

export interface QueryField {
  name: string;
  type: string;
  table?: string;
  nullable?: boolean;
}

// Database operations
export interface DatabaseOperation {
  id: string;
  type: OperationType;
  target: string;
  target_type: 'database' | 'table' | 'column' | 'index';
  status: OperationStatus;
  started_at: string;
  completed_at?: string;
  user: string;
  details?: Record<string, any>;
  error?: string;
}

export type OperationType = 
  | 'create' 
  | 'alter' 
  | 'drop' 
  | 'rename' 
  | 'backup' 
  | 'restore' 
  | 'migrate' 
  | 'analyze' 
  | 'vacuum';

export type OperationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';

// Backup and migration types
export interface DatabaseBackup {
  id: string;
  database_id: string;
  name: string;
  size: string;
  type: BackupType;
  status: BackupStatus;
  created_at: string;
  location: string;
  retention_days?: number;
}

export type BackupType = 'full' | 'incremental' | 'differential';
export type BackupStatus = 'completed' | 'in_progress' | 'failed' | 'expired';

export interface SchemaMigration {
  id: string;
  database_id: string;
  version: string;
  name: string;
  up_script: string;
  down_script: string;
  applied_at?: string;
  rolled_back_at?: string;
  checksum: string;
}

// Page-specific types
export interface DatabasePageConfig {
  show_connection_status: boolean;
  show_statistics: boolean;
  show_recent_activity: boolean;
  grid_columns: number;
  refresh_interval: number;
  enable_auto_refresh: boolean;
}

export interface DatabaseFilter {
  search?: string;
  type?: DatabaseType[];
  status?: DatabaseStatus[];
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'size';
  sort_order?: 'asc' | 'desc';
}

export interface DatabaseAction {
  type: 'create' | 'edit' | 'delete' | 'backup' | 'restore' | 'connect';
  database_id?: string;
  payload?: any;
}

// Component prop types
export interface DatabaseComponentBaseProps {
  theme: any; // PageTheme from runtime
  className?: string;
  style?: React.CSSProperties;
}

export interface DatabaseGridState {
  selected_databases: string[];
  expanded_cards: string[];
  sort_config: {
    field: string;
    order: 'asc' | 'desc';
  };
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  metadata?: {
    total: number;
    page: number;
    per_page: number;
  };
}

export interface BatchOperationResult {
  successful: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
  total: number;
}