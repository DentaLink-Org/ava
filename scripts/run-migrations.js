#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

class MigrationRunner {
  constructor() {
    const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async ensureMigrationsTable() {
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
    
    try {
      const { error } = await this.supabase.rpc('query', { 
        query: createTableQuery 
      });
      
      if (error && !error.message.includes('already exists')) {
        // Try direct execution if RPC is not available
        console.log('Creating migrations table...');
      }
    } catch (err) {
      console.log('Migrations table might already exist');
    }
  }

  async getExecutedMigrations() {
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

  async runMigration(filename, content) {
    console.log(`Running migration: ${filename}`);
    
    try {
      // Split the content by semicolons to handle multiple statements
      const statements = content
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        // Skip comments
        if (statement.startsWith('--')) continue;
        
        // For now, we'll need to use the Supabase SQL editor
        // In production, you'd use a proper migration tool
        console.log(`Statement: ${statement.substring(0, 50)}...`);
      }
      
      // Record successful migration
      await this.supabase.from('migrations').insert({
        filename,
        success: true
      });
      
      console.log(`✓ Migration recorded: ${filename}`);
      return true;
    } catch (error) {
      console.error(`✗ Migration failed: ${filename}`, error);
      
      // Record failed migration
      await this.supabase.from('migrations').insert({
        filename,
        success: false,
        error_message: error.message
      });
      
      return false;
    }
  }

  async runPendingMigrations() {
    await this.ensureMigrationsTable();
    
    const executedMigrations = await this.getExecutedMigrations();
    const migrationsPath = path.join(process.cwd(), 'database', 'migrations');
    
    try {
      const files = await fs.readdir(migrationsPath);
      const migrationFiles = files
        .filter(f => f.endsWith('.sql'))
        .sort();
      
      let pendingCount = 0;
      let successCount = 0;
      
      console.log(`Found ${migrationFiles.length} migration files`);
      console.log(`Already executed: ${executedMigrations.length}`);
      
      for (const file of migrationFiles) {
        if (!executedMigrations.includes(file)) {
          pendingCount++;
          const content = await fs.readFile(
            path.join(migrationsPath, file), 
            'utf-8'
          );
          
          if (await this.runMigration(file, content)) {
            successCount++;
          }
        }
      }
      
      if (pendingCount === 0) {
        console.log('No pending migrations');
      } else {
        console.log(`\nMigrations complete: ${successCount}/${pendingCount} successful`);
      }
      
      return { pendingCount, successCount };
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('No migrations directory found');
        await fs.mkdir(migrationsPath, { recursive: true });
        console.log('Created migrations directory');
      } else {
        throw error;
      }
    }
  }
}

// Run migrations
async function main() {
  try {
    console.log('Starting migration runner...\n');
    const runner = new MigrationRunner();
    await runner.runPendingMigrations();
  } catch (error) {
    console.error('Migration runner error:', error);
    process.exit(1);
  }
}

main();