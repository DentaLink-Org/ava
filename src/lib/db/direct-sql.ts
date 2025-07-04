import { createClient } from '@supabase/supabase-js';

// Direct SQL execution using Supabase admin client
export class DirectSQLExecutor {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.AVA_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.AVA_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async executeSQL(sql: string): Promise<{ success: boolean; error?: string }> {
    try {
      // For ALTER TABLE statements, we'll use a different approach
      if (sql.trim().toUpperCase().startsWith('ALTER TABLE')) {
        return await this.executeAlterTable(sql);
      }
      
      // For CREATE statements
      if (sql.trim().toUpperCase().startsWith('CREATE')) {
        return await this.executeCreateStatement(sql);
      }
      
      // For other statements, try direct execution
      const { error } = await this.supabase.rpc('exec_sql', { sql });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async executeAlterTable(sql: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Parse ALTER TABLE statement to extract table name and operation
      const match = sql.match(/ALTER TABLE\s+(\w+)\s+ADD COLUMN\s+IF NOT EXISTS\s+(\w+)\s+(.+)/i);
      
      if (!match) {
        return { success: false, error: 'Unsupported ALTER TABLE syntax' };
      }
      
      const [, tableName, columnName, columnDef] = match;
      
      // Check if column already exists
      const { data: columns } = await this.supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', tableName)
        .eq('column_name', columnName);
      
      if (columns && columns.length > 0) {
        return { success: true }; // Column already exists
      }
      
      // Column doesn't exist, we need to add it
      // Since we can't execute DDL directly, we'll create a temporary function
      const functionName = `add_column_${columnName}_${Date.now()}`;
      
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION ${functionName}()
        RETURNS void AS $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = '${tableName}' AND column_name = '${columnName}'
          ) THEN
            EXECUTE 'ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}';
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      // Execute the function creation
      const { error: createError } = await this.supabase.rpc('exec_sql', { sql: createFunctionSQL });
      
      if (createError) {
        return { success: false, error: `Failed to create function: ${createError.message}` };
      }
      
      // Execute the function
      const { error: execError } = await this.supabase.rpc(functionName);
      
      if (execError) {
        return { success: false, error: `Failed to execute function: ${execError.message}` };
      }
      
      // Clean up the function
      await this.supabase.rpc('exec_sql', { sql: `DROP FUNCTION IF EXISTS ${functionName}()` });
      
      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'ALTER TABLE execution failed' 
      };
    }
  }

  private async executeCreateStatement(sql: string): Promise<{ success: boolean; error?: string }> {
    try {
      // For CREATE statements, try direct execution
      const { error } = await this.supabase.rpc('exec_sql', { sql });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'CREATE statement execution failed' 
      };
    }
  }
}

export async function executeDirectSQL(sql: string) {
  const executor = new DirectSQLExecutor();
  return await executor.executeSQL(sql);
}