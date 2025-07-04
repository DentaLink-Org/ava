import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Native Supabase migration using only available operations
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.AVA_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.AVA_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Test the current schema by trying to insert a record with all required fields
    const testRecord = {
      // Required existing fields
      component_type: 'schema_migration_test',
      position: {},
      props: {},
      styles: {},
      is_active: true,
      
      // Fields that should exist but might be missing
      category: 'test',
      name: 'schema_test_' + Date.now(),
      display_name: 'Schema Test Component',
      description: 'Test component for schema validation',
      author: 'System',
      version: '1.0.0',
      tags: ['test'],
      is_system: true,
      metadata: { test: true, timestamp: Date.now() }
    };

    // Also test user_databases table schema
    const testDatabaseRecord = {
      name: 'schema_test_db_' + Date.now(),
      type: 'postgresql',
      connection_config: { host: 'test', port: 5432, database: 'test' },
      status: 'active',
      size: '0 KB',
      table_count: 0,
      record_count: 0
    };
    
    // Try to insert the test record
    const { data: insertResult, error: insertError } = await supabase
      .from('page_components')
      .insert(testRecord)
      .select('id, name');
    
    if (!insertError && insertResult && insertResult.length > 0) {
      // Success! The schema has all required columns for page_components
      const insertedId = insertResult[0].id;
      
      // Clean up the test record
      await supabase
        .from('page_components')
        .delete()
        .eq('id', insertedId);
      
      // Now test user_databases table schema
      const { data: dbInsertResult, error: dbInsertError } = await supabase
        .from('user_databases')
        .insert(testDatabaseRecord)
        .select('id, name');
      
      if (!dbInsertError && dbInsertResult && dbInsertResult.length > 0) {
        // Success! Clean up the test database record
        const dbInsertedId = dbInsertResult[0].id;
        await supabase
          .from('user_databases')
          .delete()
          .eq('id', dbInsertedId);
        
        return NextResponse.json({
          success: true,
          message: 'Schema validation passed - all required columns exist',
          action: 'no_migration_needed',
          details: 'Test records inserted and deleted successfully for both tables'
        });
      } else {
        // user_databases table has schema issues
        const dbErrorMessage = dbInsertError?.message || 'Unknown insertion error';
        
        // Check if it's specifically a missing column error
        if (dbErrorMessage.includes('column') && (dbErrorMessage.includes('does not exist') || dbErrorMessage.includes('schema cache'))) {
          // Extract the missing column name from different error message formats
          let columnMatch = dbErrorMessage.match(/column "([^"]+)" of relation "user_databases" does not exist/);
          if (!columnMatch) {
            columnMatch = dbErrorMessage.match(/Could not find the '([^']+)' column of 'user_databases'/);
          }
          const missingColumn = columnMatch ? columnMatch[1] : 'unknown';
          
          return NextResponse.json({
            success: false,
            message: `Schema migration needed - missing column in user_databases: ${missingColumn}`,
            error: dbErrorMessage,
            missingColumn,
            table: 'user_databases',
            action: 'manual_migration_required',
            instruction: 'The automated migration cannot proceed without RPC access. Please run the manual schema fix.',
            sqlCommand: getUserDatabasesSchemaFix(),
            singleColumnFix: `ALTER TABLE user_databases ADD COLUMN IF NOT EXISTS ${missingColumn} ${getUserDatabasesColumnDefinition(missingColumn)};`
          });
        }
        
        return NextResponse.json({
          success: false,
          message: 'Schema validation failed for user_databases table',
          error: dbErrorMessage,
          table: 'user_databases',
          action: 'unknown_error'
        });
      }
    }
    
    // If we get here, there's a schema issue
    const errorMessage = insertError?.message || 'Unknown insertion error';
    
    // Check if it's specifically a missing column error
    if (errorMessage.includes('column') && (errorMessage.includes('does not exist') || errorMessage.includes('schema cache'))) {
      // Extract the missing column name from different error message formats
      let columnMatch = errorMessage.match(/column "([^"]+)" of relation "page_components" does not exist/);
      if (!columnMatch) {
        columnMatch = errorMessage.match(/Could not find the '([^']+)' column of 'page_components'/);
      }
      const missingColumn = columnMatch ? columnMatch[1] : 'unknown';
      
      return NextResponse.json({
        success: false,
        message: `Schema migration needed - missing column: ${missingColumn}`,
        error: errorMessage,
        missingColumn,
        action: 'manual_migration_required',
        instruction: 'The automated migration cannot proceed without RPC access. Please run the manual schema fix.',
        sqlCommand: getCompleteSchemaFix(),
        singleColumnFix: `ALTER TABLE page_components ADD COLUMN IF NOT EXISTS ${missingColumn} ${getColumnDefinition(missingColumn)};`
      });
    }
    
    // Some other error occurred
    return NextResponse.json({
      success: false,
      message: 'Schema validation failed',
      error: errorMessage,
      action: 'unknown_error'
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

function getColumnDefinition(columnName: string): string {
  const definitions: Record<string, string> = {
    'category': 'VARCHAR(100) DEFAULT \'custom\'',
    'name': 'VARCHAR(200)',
    'display_name': 'VARCHAR(250)',
    'description': 'TEXT',
    'author': 'VARCHAR(100)',
    'version': 'VARCHAR(20) DEFAULT \'1.0.0\'',
    'tags': 'TEXT[] DEFAULT \'{}\'',
    'is_system': 'BOOLEAN DEFAULT FALSE',
    'metadata': 'JSONB DEFAULT \'{}\'',
    'created_by': 'VARCHAR(100)',
    'updated_by': 'VARCHAR(100)',
    'status': 'VARCHAR(50) DEFAULT \'active\'',
    'priority': 'VARCHAR(20) DEFAULT \'medium\'',
    'implementation_status': 'VARCHAR(50) DEFAULT \'not_started\'',
    'estimated_hours': 'DECIMAL(8,2)',
    'actual_hours': 'DECIMAL(8,2)',
    'dependencies': 'TEXT[] DEFAULT \'{}\'',
    'features': 'TEXT[] DEFAULT \'{}\'',
    'file_path': 'TEXT',
    'framework': 'VARCHAR(50) DEFAULT \'react\'',
    'title': 'VARCHAR(200)',
    'functionality': 'TEXT',
    'group_type': 'VARCHAR(50) DEFAULT \'utility\''
  };
  
  return definitions[columnName] || 'TEXT';
}

function getCompleteSchemaFix(): string {
  return `-- COMPLETE SCHEMA FIX - Run this in Supabase SQL Editor
-- This adds ALL possible missing columns that the application might need

ALTER TABLE page_components ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'custom';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS name VARCHAR(200);
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS display_name VARCHAR(250);
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS author VARCHAR(100);
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS version VARCHAR(20) DEFAULT '1.0.0';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Additional columns that might be needed
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS created_by VARCHAR(100);
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS implementation_status VARCHAR(50) DEFAULT 'not_started';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(8,2);
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(8,2);
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS dependencies TEXT[] DEFAULT '{}';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS framework VARCHAR(50) DEFAULT 'react';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS title VARCHAR(200);
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS functionality TEXT;
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS group_type VARCHAR(50) DEFAULT 'utility';

-- Add all necessary indexes
CREATE INDEX IF NOT EXISTS idx_page_components_category ON page_components(category);
CREATE INDEX IF NOT EXISTS idx_page_components_name ON page_components(name);
CREATE INDEX IF NOT EXISTS idx_page_components_is_system ON page_components(is_system);
CREATE INDEX IF NOT EXISTS idx_page_components_status ON page_components(status);
CREATE INDEX IF NOT EXISTS idx_page_components_priority ON page_components(priority);
CREATE INDEX IF NOT EXISTS idx_page_components_created_by ON page_components(created_by);
CREATE INDEX IF NOT EXISTS idx_page_components_framework ON page_components(framework);

-- Verify the schema is complete
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'page_components' 
AND table_schema = 'public'
ORDER BY ordinal_position;`;
}

function getUserDatabasesColumnDefinition(columnName: string): string {
  const definitions: Record<string, string> = {
    'status': 'VARCHAR(50) DEFAULT \'active\'',
    'size': 'VARCHAR(50) DEFAULT \'0 KB\'',
    'table_count': 'INTEGER DEFAULT 0',
    'record_count': 'INTEGER DEFAULT 0',
    'type': 'VARCHAR(50) DEFAULT \'postgresql\'',
    'description': 'TEXT',
    'last_connected': 'TIMESTAMP WITH TIME ZONE',
    'is_active': 'BOOLEAN DEFAULT TRUE'
  };
  
  return definitions[columnName] || 'TEXT';
}

function getUserDatabasesSchemaFix(): string {
  return `-- USER DATABASES SCHEMA FIX - Run this in Supabase SQL Editor
-- This adds ALL possible missing columns that the user_databases table might need

ALTER TABLE user_databases ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE user_databases ADD COLUMN IF NOT EXISTS size VARCHAR(50) DEFAULT '0 KB';
ALTER TABLE user_databases ADD COLUMN IF NOT EXISTS table_count INTEGER DEFAULT 0;
ALTER TABLE user_databases ADD COLUMN IF NOT EXISTS record_count INTEGER DEFAULT 0;
ALTER TABLE user_databases ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'postgresql';
ALTER TABLE user_databases ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE user_databases ADD COLUMN IF NOT EXISTS last_connected TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_databases ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add useful indexes
CREATE INDEX IF NOT EXISTS idx_user_databases_status ON user_databases(status);
CREATE INDEX IF NOT EXISTS idx_user_databases_type ON user_databases(type);
CREATE INDEX IF NOT EXISTS idx_user_databases_is_active ON user_databases(is_active);

-- Verify the schema is complete
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_databases' 
AND table_schema = 'public'
ORDER BY ordinal_position;`;
}

// GET endpoint to check schema status
export async function GET() {
  try {
    const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.AVA_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.AVA_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Test schema by attempting to insert a record with all fields
    const testRecord = {
      component_type: 'schema_check_test',
      position: {},
      props: {},
      styles: {},
      is_active: true,
      category: 'test',
      name: 'schema_check_' + Date.now(),
      display_name: 'Schema Check',
      description: 'Test',
      author: 'System',
      version: '1.0.0',
      tags: ['test'],
      is_system: true,
      metadata: { test: true }
    };
    
    // Test the insert
    const { error } = await supabase
      .from('page_components')
      .insert(testRecord)
      .select('id');
    
    if (!error) {
      // Schema is good, clean up test record
      await supabase
        .from('page_components')
        .delete()
        .eq('name', testRecord.name);
      
      return NextResponse.json({
        schemaStatus: 'complete',
        message: 'All required columns exist',
        needsMigration: false
      });
    }
    
    // Schema needs fixing
    const errorMessage = error.message || 'Unknown error';
    let columnMatch = errorMessage.match(/column "([^"]+)" of relation "page_components" does not exist/);
    if (!columnMatch) {
      columnMatch = errorMessage.match(/Could not find the '([^']+)' column of 'page_components'/);
    }
    const missingColumn = columnMatch ? columnMatch[1] : null;
    
    return NextResponse.json({
      schemaStatus: 'incomplete',
      message: missingColumn ? `Missing column: ${missingColumn}` : 'Schema validation failed',
      needsMigration: true,
      missingColumn,
      error: errorMessage
    });
    
  } catch (error) {
    console.error('Schema check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}