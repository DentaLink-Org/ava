import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

// API endpoint for running migrations
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.AVA_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.AVA_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { 
          error: 'Missing Supabase configuration',
          details: {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!supabaseServiceKey,
            message: 'Please check environment variables: AVA_NEXT_PUBLIC_SUPABASE_URL and AVA_SUPABASE_SERVICE_ROLE_KEY'
          }
        },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Get executed migrations
    const { data: executedMigrations, error: queryError } = await supabase
      .from('migrations')
      .select('filename')
      .eq('success', true);
    
    if (queryError && !queryError.message.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Failed to query migrations table' },
        { status: 500 }
      );
    }
    
    const executed = executedMigrations?.map(m => m.filename) || [];
    
    // Read migration files
    const migrationsPath = join(process.cwd(), 'database', 'migrations');
    const files = await readdir(migrationsPath);
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    const pendingMigrations = migrationFiles.filter(f => !executed.includes(f));
    
    if (pendingMigrations.length === 0) {
      return NextResponse.json({
        message: 'No pending migrations',
        pendingCount: 0,
        successCount: 0
      });
    }
    
    const results = [];
    let successCount = 0;
    
    for (const file of pendingMigrations) {
      try {
        const content = await readFile(join(migrationsPath, file), 'utf-8');
        
        // Split content into statements
        const statements = content
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));
        
        // Execute SQL statements using Supabase's SQL execution
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              // Use Supabase's built-in SQL execution via REST API
              const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                  'apikey': supabaseServiceKey
                },
                body: JSON.stringify({ sql: statement })
              });

              if (!response.ok) {
                // If exec_sql RPC doesn't exist, try direct SQL execution
                const response2 = await fetch(`${supabaseUrl}/sql`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'apikey': supabaseServiceKey
                  },
                  body: JSON.stringify({ query: statement })
                });

                if (!response2.ok) {
                  throw new Error(`Failed to execute SQL: ${statement.substring(0, 50)}...`);
                }
              }
            } catch (sqlError) {
              throw new Error(`SQL execution failed: ${sqlError instanceof Error ? sqlError.message : 'Unknown error'}`);
            }
          }
        }
        
        // Record successful migration
        await supabase.from('migrations').insert({
          filename: file,
          success: true
        });
        
        results.push({ file, success: true });
        successCount++;
      } catch (error) {
        // Record failed migration
        await supabase.from('migrations').insert({
          filename: file,
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
        
        results.push({ 
          file, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    return NextResponse.json({
      message: `Migrations complete: ${successCount}/${pendingMigrations.length} successful`,
      pendingCount: pendingMigrations.length,
      successCount,
      results
    });
    
  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check migration status
export async function GET() {
  try {
    const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.AVA_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.AVA_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { 
          error: 'Missing Supabase configuration',
          details: {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!supabaseServiceKey,
            message: 'Please check environment variables: AVA_NEXT_PUBLIC_SUPABASE_URL and AVA_SUPABASE_SERVICE_ROLE_KEY'
          }
        },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Get executed migrations
    const { data: executedMigrations, error } = await supabase
      .from('migrations')
      .select('filename, executed_at, success')
      .order('executed_at', { ascending: false });
    
    if (error && !error.message.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Failed to query migrations' },
        { status: 500 }
      );
    }
    
    // Read available migrations
    const migrationsPath = join(process.cwd(), 'database', 'migrations');
    const files = await readdir(migrationsPath);
    const availableMigrations = files
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    const executed = executedMigrations?.map(m => m.filename) || [];
    const pendingMigrations = availableMigrations.filter(f => !executed.includes(f));
    
    return NextResponse.json({
      totalMigrations: availableMigrations.length,
      executedMigrations: executedMigrations || [],
      pendingMigrations,
      pendingCount: pendingMigrations.length
    });
    
  } catch (error) {
    console.error('Migration status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}