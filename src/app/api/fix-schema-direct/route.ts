import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Direct database schema fix by checking and adding missing columns
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
    
    // First, check current table structure
    const { data: currentColumns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'page_components')
      .eq('table_schema', 'public');
    
    if (checkError) {
      return NextResponse.json(
        { error: 'Failed to check current schema', details: checkError.message },
        { status: 500 }
      );
    }
    
    const existingColumns = currentColumns?.map(col => col.column_name) || [];
    
    // Required columns that should exist
    const requiredColumns = ['category', 'name', 'display_name', 'description', 'author', 'version', 'tags', 'is_system', 'metadata'];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      return NextResponse.json({
        message: 'All required columns already exist',
        existingColumns,
        missingColumns: []
      });
    }
    
    // Since direct SQL execution might not work, let's try a different approach
    // We'll attempt to add the columns by inserting a test record with all fields
    try {
      // Try to insert a test record with all the required fields
      const testRecord = {
        component_type: 'test',
        position: {},
        props: {},
        styles: {},
        is_active: true,
        category: 'test',
        name: 'test_component',
        display_name: 'Test Component',
        description: 'Test component for schema validation',
        author: 'System',
        version: '1.0.0',
        tags: ['test'],
        is_system: true,
        metadata: { test: true }
      };
      
      const { error: insertError } = await supabase
        .from('page_components')
        .insert(testRecord);
      
      if (!insertError) {
        // If insert succeeded, delete the test record
        await supabase
          .from('page_components')
          .delete()
          .eq('name', 'test_component');
        
        return NextResponse.json({
          message: 'Schema is already correct - all columns exist',
          status: 'success'
        });
      }
      
      // If insert failed due to missing columns, that confirms our diagnosis
      return NextResponse.json({
        message: 'Schema fix needed - missing columns detected',
        missingColumns,
        existingColumns,
        error: insertError.message,
        instruction: 'Please run the SQL commands manually in Supabase SQL editor'
      });
      
    } catch (error) {
      return NextResponse.json({
        message: 'Schema validation completed',
        missingColumns,
        existingColumns,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
  } catch (error) {
    console.error('Schema fix error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
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
    
    // Check current table structure
    const { data: currentColumns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'page_components')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to check schema', details: error.message },
        { status: 500 }
      );
    }
    
    const existingColumns = currentColumns?.map(col => col.column_name) || [];
    const requiredColumns = ['category', 'name', 'display_name', 'description', 'author', 'version', 'tags', 'is_system', 'metadata'];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    return NextResponse.json({
      tableName: 'page_components',
      existingColumns,
      requiredColumns,
      missingColumns,
      needsFix: missingColumns.length > 0,
      schema: currentColumns
    });
    
  } catch (error) {
    console.error('Schema check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}