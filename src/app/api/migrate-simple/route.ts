import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simple migration that fixes the page_components schema using native Supabase operations
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
    
    // Step 1: Test if we can add the missing columns by inserting a record with all fields
    const testRecord = {
      component_type: 'schema_test',
      position: {},
      props: {},
      styles: {},
      is_active: true,
      // Add all the missing columns that should exist
      category: 'test',
      name: 'schema_test_component',
      display_name: 'Schema Test Component',
      description: 'Test component for schema validation',
      author: 'System',
      version: '1.0.0',
      tags: ['test'],
      is_system: true,
      metadata: { test: true }
    };
    
    // Try to insert the test record
    const { data: insertResult, error: insertError } = await supabase
      .from('page_components')
      .insert(testRecord)
      .select();
    
    if (!insertError) {
      // Success! The schema already has all required columns
      // Clean up the test record
      await supabase
        .from('page_components')
        .delete()
        .eq('name', 'schema_test_component');
      
      return NextResponse.json({
        success: true,
        message: 'Schema is already correct - all required columns exist',
        action: 'no_migration_needed'
      });
    }
    
    // If we get here, the schema needs to be fixed
    // We'll create a stored procedure to handle the migration automatically
    
    // Since Supabase doesn't allow direct DDL execution via API, 
    // we'll create a stored procedure to handle the migration
    const migrationFunction = `
      CREATE OR REPLACE FUNCTION fix_page_components_schema()
      RETURNS text AS $$
      DECLARE
        result text := 'Migration completed: ';
      BEGIN
        -- Add missing columns one by one
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_components' AND column_name = 'category') THEN
          ALTER TABLE page_components ADD COLUMN category VARCHAR(100) DEFAULT 'custom';
          result := result || 'category ';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_components' AND column_name = 'name') THEN
          ALTER TABLE page_components ADD COLUMN name VARCHAR(200);
          result := result || 'name ';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_components' AND column_name = 'display_name') THEN
          ALTER TABLE page_components ADD COLUMN display_name VARCHAR(250);
          result := result || 'display_name ';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_components' AND column_name = 'description') THEN
          ALTER TABLE page_components ADD COLUMN description TEXT;
          result := result || 'description ';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_components' AND column_name = 'author') THEN
          ALTER TABLE page_components ADD COLUMN author VARCHAR(100);
          result := result || 'author ';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_components' AND column_name = 'version') THEN
          ALTER TABLE page_components ADD COLUMN version VARCHAR(20) DEFAULT '1.0.0';
          result := result || 'version ';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_components' AND column_name = 'tags') THEN
          ALTER TABLE page_components ADD COLUMN tags TEXT[] DEFAULT '{}';
          result := result || 'tags ';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_components' AND column_name = 'is_system') THEN
          ALTER TABLE page_components ADD COLUMN is_system BOOLEAN DEFAULT FALSE;
          result := result || 'is_system ';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_components' AND column_name = 'metadata') THEN
          ALTER TABLE page_components ADD COLUMN metadata JSONB DEFAULT '{}';
          result := result || 'metadata ';
        END IF;
        
        RETURN result;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    // Try to create and execute the migration function
    try {
      // Create the function using Supabase's RPC mechanism
      const { data: functionResult, error: functionError } = await supabase.rpc('exec_sql', { 
        sql: migrationFunction 
      });
      
      if (functionError) {
        throw new Error(`Failed to create migration function: ${functionError.message}`);
      }
      
      // Execute the migration function
      const { data: migrationResult, error: migrationError } = await supabase.rpc('fix_page_components_schema');
      
      if (migrationError) {
        throw new Error(`Failed to execute migration: ${migrationError.message}`);
      }
      
      // Clean up the migration function
      await supabase.rpc('exec_sql', { sql: 'DROP FUNCTION IF EXISTS fix_page_components_schema()' });
      
      return NextResponse.json({
        success: true,
        message: 'Schema migration completed successfully',
        result: migrationResult,
        action: 'migration_executed'
      });
      
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Automated migration failed - manual intervention required',
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestedAction: 'Use Supabase SQL Editor to run the migration manually'
      }, { status: 500 });
    }
    
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