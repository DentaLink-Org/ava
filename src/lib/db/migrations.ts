import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

// Migration runner for automated database migrations
export class MigrationRunner {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async ensureMigrationsTable() {
    const { error } = await this.supabase.rpc('create_migrations_table_if_not_exists');
    
    if (error && !error.message.includes('already exists')) {
      // Create the table directly if the RPC doesn't exist
      await this.supabase.from('migrations').select('*').limit(1);
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) UNIQUE NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          checksum VARCHAR(64),
          success BOOLEAN DEFAULT TRUE,
          error_message TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_migrations_filename ON migrations(filename);
        CREATE INDEX IF NOT EXISTS idx_migrations_executed_at ON migrations(executed_at DESC);
      `;
      
      const { error: createError } = await this.supabase.rpc('exec_sql', { 
        sql: createTableQuery 
      });
      
      if (createError) {
        console.error('Failed to create migrations table:', createError);
      }
    }
  }

  async getExecutedMigrations(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('migrations')
      .select('filename')
      .eq('success', true);
    
    if (error) {
      console.error('Failed to get executed migrations:', error);
      return [];
    }
    
    return data?.map(m => m.filename) || [];
  }

  async runMigration(filename: string, content: string) {
    try {
      // Execute the migration SQL
      const { error } = await this.supabase.rpc('exec_sql', { sql: content });
      
      if (error) {
        // Record failed migration
        await this.supabase.from('migrations').insert({
          filename,
          success: false,
          error_message: error.message
        });
        
        throw error;
      }
      
      // Record successful migration
      await this.supabase.from('migrations').insert({
        filename,
        success: true
      });
      
      console.log(`✓ Migration executed: ${filename}`);
      return true;
    } catch (error) {
      console.error(`✗ Migration failed: ${filename}`, error);
      return false;
    }
  }

  async runPendingMigrations(migrationsPath: string) {
    await this.ensureMigrationsTable();
    
    // Get list of executed migrations
    const executedMigrations = await this.getExecutedMigrations();
    
    // Read all migration files
    const files = await readdir(migrationsPath);
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort(); // Ensure migrations run in order
    
    let pendingCount = 0;
    let successCount = 0;
    
    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        pendingCount++;
        const content = await readFile(join(migrationsPath, file), 'utf-8');
        
        if (await this.runMigration(file, content)) {
          successCount++;
        }
      }
    }
    
    console.log(`Migrations complete: ${successCount}/${pendingCount} successful`);
    return { pendingCount, successCount };
  }
}

// Utility function to run migrations
export async function runMigrations() {
  const runner = new MigrationRunner();
  const migrationsPath = join(process.cwd(), 'database', 'migrations');
  
  try {
    const result = await runner.runPendingMigrations(migrationsPath);
    return result;
  } catch (error) {
    console.error('Migration runner error:', error);
    throw error;
  }
}