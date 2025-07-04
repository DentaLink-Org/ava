import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Direct fix for the missing category column
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
    
    // Direct SQL execution to fix the schema
    const fixes = [
      {
        name: 'Add category column',
        sql: 'ALTER TABLE page_components ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT \'custom\';'
      },
      {
        name: 'Add name column', 
        sql: 'ALTER TABLE page_components ADD COLUMN IF NOT EXISTS name VARCHAR(200);'
      },
      {
        name: 'Add display_name column',
        sql: 'ALTER TABLE page_components ADD COLUMN IF NOT EXISTS display_name VARCHAR(250);'
      },
      {
        name: 'Add description column',
        sql: 'ALTER TABLE page_components ADD COLUMN IF NOT EXISTS description TEXT;'
      },
      {
        name: 'Add author column',
        sql: 'ALTER TABLE page_components ADD COLUMN IF NOT EXISTS author VARCHAR(100);'
      },
      {
        name: 'Add version column',
        sql: 'ALTER TABLE page_components ADD COLUMN IF NOT EXISTS version VARCHAR(20) DEFAULT \'1.0.0\';'
      },
      {
        name: 'Add tags column',
        sql: 'ALTER TABLE page_components ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT \'{}\';'
      },
      {
        name: 'Add is_system column',
        sql: 'ALTER TABLE page_components ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;'
      },
      {
        name: 'Add metadata column',
        sql: 'ALTER TABLE page_components ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\';'
      }
    ];
    
    const results = [];
    
    for (const fix of fixes) {
      try {
        // Use the REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            query: fix.sql
          })
        });
        
        if (response.ok) {
          results.push({ name: fix.name, success: true });
        } else {
          const error = await response.text();
          results.push({ name: fix.name, success: false, error });
        }
      } catch (error) {
        results.push({ 
          name: fix.name, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    return NextResponse.json({
      message: 'Schema fix completed',
      results,
      successCount: results.filter(r => r.success).length,
      totalCount: results.length
    });
    
  } catch (error) {
    console.error('Schema fix error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}