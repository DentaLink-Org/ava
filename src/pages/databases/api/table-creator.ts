/**
 * Dynamic table creation and management service
 * Handles creating, modifying, and managing PostgreSQL tables dynamically
 */

import { supabaseClient } from './supabase';

export interface ColumnDefinition {
  column_name: string;
  data_type: string;
  is_primary_key: boolean;
  is_nullable?: boolean;
  is_unique?: boolean;
  default_value?: string;
  max_length?: number;
  references_table?: string;
  references_column?: string;
  on_delete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  on_update?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  comment?: string;
}

export interface CreateTableOptions {
  if_not_exists?: boolean;
  enable_realtime?: boolean;
  disable_rls?: boolean;
}

export class TableCreator {
  /**
   * Create a new table with the specified columns
   */
  static async createTable(
    tableName: string, 
    columns: ColumnDefinition[], 
    options: CreateTableOptions = {}
  ): Promise<{ success: boolean; error?: string; physicalName?: string }> {
    try {
      const sanitizedTableName = this.sanitizeTableName(tableName);
      
      // Build column definitions
      const columnDefinitions: string[] = [];
      const constraints: string[] = [];
      
      // Process each column
      for (const col of columns) {
        const columnDef = this.buildColumnDefinition(col);
        columnDefinitions.push(columnDef);
        
        // Handle foreign key constraints separately
        if (col.references_table && col.references_column) {
          const fkConstraint = this.buildForeignKeyConstraint(col, sanitizedTableName);
          constraints.push(fkConstraint);
        }
      }
      
      // Add standard audit columns if not present
      const hasCreatedAt = columns.some(col => col.column_name.toLowerCase() === 'created_at');
      const hasUpdatedAt = columns.some(col => col.column_name.toLowerCase() === 'updated_at');
      
      if (!hasCreatedAt) {
        columnDefinitions.push('created_at TIMESTAMPTZ DEFAULT NOW()');
      }
      if (!hasUpdatedAt) {
        columnDefinitions.push('updated_at TIMESTAMPTZ DEFAULT NOW()');
      }
      
      // Ensure we have a primary key
      const hasPrimaryKey = columns.some(col => col.is_primary_key);
      if (!hasPrimaryKey) {
        columnDefinitions.unshift('id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text');
      }
      
      // Build CREATE TABLE statement
      const ifNotExists = options.if_not_exists ? 'IF NOT EXISTS' : '';
      const createTableSQL = `
        CREATE TABLE ${ifNotExists} "${sanitizedTableName}" (
          ${columnDefinitions.join(',\n  ')}${constraints.length > 0 ? ',\n  ' + constraints.join(',\n  ') : ''}
        );
      `;
      
      // Build additional statements
      const additionalStatements: string[] = [];
      
      // Add update trigger
      if (!hasUpdatedAt) {
        additionalStatements.push(`
          CREATE TRIGGER update_${sanitizedTableName}_updated_at 
          BEFORE UPDATE ON "${sanitizedTableName}" 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
      }
      
      // Enable real-time if requested
      if (options.enable_realtime !== false) {
        additionalStatements.push(`
          ALTER PUBLICATION supabase_realtime ADD TABLE "${sanitizedTableName}";
        `);
      }
      
      // Disable RLS if requested (for development)
      if (options.disable_rls !== false) {
        additionalStatements.push(`
          ALTER TABLE "${sanitizedTableName}" DISABLE ROW LEVEL SECURITY;
        `);
      }
      
      // Combine all SQL statements
      const fullSQL = [createTableSQL, ...additionalStatements].join('\n');
      
      // Execute the SQL
      const { error } = await supabaseClient.rpc('exec_sql', {
        sql: fullSQL
      });
      
      if (error) {
        console.error(`Error creating table ${tableName}:`, error);
        return { success: false, error: error.message };
      }
      
      return { 
        success: true, 
        physicalName: sanitizedTableName 
      };
      
    } catch (err) {
      console.error(`Error creating table ${tableName}:`, err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Add a column to an existing table
   */
  static async addColumn(
    tableName: string, 
    column: ColumnDefinition
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const sanitizedTableName = this.sanitizeTableName(tableName);
      const columnDef = this.buildColumnDefinition(column);
      
      const sql = `
        ALTER TABLE "${sanitizedTableName}" 
        ADD COLUMN ${columnDef};
      `;
      
      const { error } = await supabaseClient.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`Error adding column to ${tableName}:`, error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
      
    } catch (err) {
      console.error(`Error adding column to ${tableName}:`, err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Drop a column from an existing table
   */
  static async dropColumn(
    tableName: string, 
    columnName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const sanitizedTableName = this.sanitizeTableName(tableName);
      const sanitizedColumnName = this.sanitizeColumnName(columnName);
      
      const sql = `
        ALTER TABLE "${sanitizedTableName}" 
        DROP COLUMN IF EXISTS "${sanitizedColumnName}";
      `;
      
      const { error } = await supabaseClient.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`Error dropping column from ${tableName}:`, error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
      
    } catch (err) {
      console.error(`Error dropping column from ${tableName}:`, err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Drop a table completely
   */
  static async dropTable(tableName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sanitizedTableName = this.sanitizeTableName(tableName);
      
      const sql = `
        DROP TABLE IF EXISTS "${sanitizedTableName}" CASCADE;
      `;
      
      const { error } = await supabaseClient.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`Error dropping table ${tableName}:`, error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
      
    } catch (err) {
      console.error(`Error dropping table ${tableName}:`, err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Build column definition SQL
   */
  private static buildColumnDefinition(col: ColumnDefinition): string {
    const sanitizedColumnName = this.sanitizeColumnName(col.column_name);
    const dataType = this.mapDataType(col.data_type, col.max_length);
    
    let def = `"${sanitizedColumnName}" ${dataType}`;
    
    // Handle primary key
    if (col.is_primary_key) {
      def += ' PRIMARY KEY';
      if (col.data_type.toUpperCase() === 'TEXT' || col.data_type.toUpperCase() === 'STRING') {
        def += ' DEFAULT gen_random_uuid()::text';
      }
    }
    
    // Handle nullable
    if (!col.is_nullable && !col.is_primary_key) {
      def += ' NOT NULL';
    }
    
    // Handle unique constraint
    if (col.is_unique && !col.is_primary_key) {
      def += ' UNIQUE';
    }
    
    // Handle default value
    if (col.default_value && !col.is_primary_key) {
      def += ` DEFAULT ${col.default_value}`;
    }
    
    return def;
  }
  
  /**
   * Build foreign key constraint SQL
   */
  private static buildForeignKeyConstraint(col: ColumnDefinition, tableName: string): string {
    const sanitizedColumnName = this.sanitizeColumnName(col.column_name);
    const sanitizedRefTable = this.sanitizeTableName(col.references_table!);
    const sanitizedRefColumn = this.sanitizeColumnName(col.references_column!);
    
    let constraint = `CONSTRAINT fk_${tableName}_${sanitizedColumnName} `;
    constraint += `FOREIGN KEY ("${sanitizedColumnName}") `;
    constraint += `REFERENCES "${sanitizedRefTable}"("${sanitizedRefColumn}")`;
    
    if (col.on_delete) {
      constraint += ` ON DELETE ${col.on_delete}`;
    }
    
    if (col.on_update) {
      constraint += ` ON UPDATE ${col.on_update}`;
    }
    
    return constraint;
  }
  
  /**
   * Map data types to PostgreSQL types
   */
  private static mapDataType(dataType: string, maxLength?: number): string {
    const upperType = dataType.toUpperCase();
    
    switch (upperType) {
      case 'TEXT':
      case 'STRING':
        return maxLength ? `VARCHAR(${maxLength})` : 'TEXT';
      case 'INTEGER':
      case 'INT':
        return 'INTEGER';
      case 'BIGINT':
      case 'LONG':
        return 'BIGINT';
      case 'DECIMAL':
      case 'NUMERIC':
        return 'DECIMAL(10,2)';
      case 'FLOAT':
      case 'REAL':
        return 'REAL';
      case 'DOUBLE':
        return 'DOUBLE PRECISION';
      case 'BOOLEAN':
      case 'BOOL':
        return 'BOOLEAN';
      case 'DATE':
        return 'DATE';
      case 'DATETIME':
      case 'TIMESTAMP':
        return 'TIMESTAMP';
      case 'TIMESTAMPTZ':
        return 'TIMESTAMPTZ';
      case 'TIME':
        return 'TIME';
      case 'UUID':
        return 'UUID';
      case 'JSON':
        return 'JSON';
      case 'JSONB':
        return 'JSONB';
      case 'ARRAY':
        return 'TEXT[]';
      default:
        return 'TEXT';
    }
  }
  
  /**
   * Sanitize table names for PostgreSQL
   */
  private static sanitizeTableName(tableName: string): string {
    return tableName
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^[0-9]/, '_$&')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 63); // PostgreSQL identifier limit
  }
  
  /**
   * Sanitize column names for PostgreSQL
   */
  private static sanitizeColumnName(columnName: string): string {
    return columnName
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^[0-9]/, '_$&')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 63); // PostgreSQL identifier limit
  }
}

export default TableCreator;