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
    
    // Try to insert the test record
    const { data: insertResult, error: insertError } = await supabase
      .from('page_components')
      .insert(testRecord)
      .select('id, name');
    
    if (!insertError && insertResult && insertResult.length > 0) {
      // Success! The schema has all required columns
      const insertedId = insertResult[0].id;
      
      // Clean up the test record
      await supabase
        .from('page_components')
        .delete()
        .eq('id', insertedId);
      
      return NextResponse.json({
        success: true,
        message: 'Schema validation passed - all required columns exist',
        action: 'no_migration_needed',
        details: 'Test record inserted and deleted successfully'
      });
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
    'metadata': 'JSONB DEFAULT \'{}\''
  };
  
  return definitions[columnName] || 'TEXT';
}

function getCompleteSchemaFix(): string {
  return `-- COMPLETE SCHEMA FIX - Run this in Supabase SQL Editor
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'custom';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS name VARCHAR(200);
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS display_name VARCHAR(250);
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS author VARCHAR(100);
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS version VARCHAR(20) DEFAULT '1.0.0';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_page_components_category ON page_components(category);
CREATE INDEX IF NOT EXISTS idx_page_components_name ON page_components(name);
CREATE INDEX IF NOT EXISTS idx_page_components_is_system ON page_components(is_system);`;
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