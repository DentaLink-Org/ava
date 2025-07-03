/**
 * Database Setup API - Sets up database schema and sample data
 * GET /api/database/setup - Run database setup
 * POST /api/database/setup - Force setup (even if data exists)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Vercel's environment variables first, then fallback to standard ones
const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL || 
                   process.env.NEXT_PUBLIC_SUPABASE_URL || 
                   'https://placeholder.supabase.co';
const supabaseKey = process.env.AVA_NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                   'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey);

interface SetupResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

/**
 * Test database connection
 */
async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) throw error;
    
    return { success: true, message: 'Connection successful' };
  } catch (error: any) {
    return { success: false, message: `Connection failed: ${error.message}` };
  }
}

/**
 * Create database tables
 */
async function createTables(): Promise<SetupResult> {
  try {
    // Create themes table
    const { error: themesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS themes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL UNIQUE,
          display_name VARCHAR(150) NOT NULL,
          description TEXT,
          category VARCHAR(50) NOT NULL DEFAULT 'custom',
          colors JSONB NOT NULL,
          typography JSONB,
          spacing JSONB,
          shadows JSONB,
          borders JSONB,
          author VARCHAR(100),
          is_system BOOLEAN DEFAULT FALSE,
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (themesError && !themesError.message.includes('already exists')) {
      throw themesError;
    }

    // Create page_theme_assignments table
    const { error: assignmentsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS page_theme_assignments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          page_id VARCHAR(100) NOT NULL UNIQUE,
          theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
          theme_variation_id UUID,
          is_variation BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (assignmentsError && !assignmentsError.message.includes('already exists')) {
      throw assignmentsError;
    }

    // Create tasks table
    const { error: tasksError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(200) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          priority VARCHAR(20) DEFAULT 'medium',
          category VARCHAR(50),
          assigned_to VARCHAR(100),
          due_date TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (tasksError && !tasksError.message.includes('already exists')) {
      throw tasksError;
    }

    return { success: true, message: 'Tables created successfully' };
  } catch (error: any) {
    return { success: false, message: 'Failed to create tables', error: error.message };
  }
}

/**
 * Enable Row Level Security
 */
async function enableRLS(): Promise<SetupResult> {
  try {
    const tables = ['themes', 'page_theme_assignments', 'tasks'];
    
    for (const table of tables) {
      // Enable RLS
      await supabase.rpc('exec', {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      });
      
      // Create policies
      await supabase.rpc('exec', {
        sql: `
          DROP POLICY IF EXISTS "public_read_${table}" ON ${table};
          CREATE POLICY "public_read_${table}" ON ${table} FOR SELECT TO anon USING (true);
        `
      });
      
      await supabase.rpc('exec', {
        sql: `
          DROP POLICY IF EXISTS "public_write_${table}" ON ${table};
          CREATE POLICY "public_write_${table}" ON ${table} FOR ALL TO anon USING (true);
        `
      });
    }
    
    return { success: true, message: 'RLS enabled successfully' };
  } catch (error: any) {
    return { success: false, message: 'Failed to enable RLS', error: error.message };
  }
}

/**
 * Insert sample data
 */
async function insertSampleData(force: boolean = false): Promise<SetupResult> {
  try {
    // Check if data already exists
    if (!force) {
      const { data: existingThemes } = await supabase.from('themes').select('id').limit(1);
      if (existingThemes && existingThemes.length > 0) {
        return { success: true, message: 'Sample data already exists (use POST to force)' };
      }
    }

    // Insert sample themes
    const themes = [
      {
        name: 'default-light',
        display_name: 'Default Light',
        description: 'Clean and modern light theme',
        category: 'light',
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1e293b',
          textSecondary: '#64748b',
          border: '#e2e8f0',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: { small: '14px', base: '16px', large: '18px', xl: '20px' },
          fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' }
        },
        spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '48px' },
        shadows: {
          sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        },
        borders: {
          radius: { sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' },
          width: { thin: '1px', medium: '2px', thick: '4px' }
        },
        is_system: true,
        is_default: true,
        author: 'AVA Team'
      },
      {
        name: 'modern-dark',
        display_name: 'Modern Dark',
        description: 'Sleek dark theme with blue accents',
        category: 'dark',
        colors: {
          primary: '#3b82f6',
          secondary: '#6366f1',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f1f5f9',
          textSecondary: '#94a3b8',
          border: '#334155',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: { small: '14px', base: '16px', large: '18px', xl: '20px' },
          fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' }
        },
        spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '48px' },
        shadows: {
          sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
          xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
        },
        borders: {
          radius: { sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' },
          width: { thin: '1px', medium: '2px', thick: '4px' }
        },
        is_system: true,
        is_default: false,
        author: 'AVA Team'
      }
    ];

    if (force) {
      // Clear existing data first
      await supabase.from('page_theme_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('themes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { error: themesError } = await supabase.from('themes').upsert(themes, { onConflict: 'name' });
    if (themesError) throw themesError;

    // Insert sample tasks
    const tasks = [
      {
        title: 'Setup Database Connection',
        description: 'Configure the initial database connection for the application',
        status: 'completed',
        priority: 'high',
        category: 'setup',
        assigned_to: 'system',
        metadata: { estimatedHours: 2, tags: ['database', 'setup'] }
      },
      {
        title: 'Create Theme System',
        description: 'Implement dynamic theme switching functionality',
        status: 'in_progress',
        priority: 'high',
        category: 'development',
        assigned_to: 'system',
        metadata: { estimatedHours: 8, tags: ['themes', 'ui'] }
      },
      {
        title: 'Add Component Library',
        description: 'Build reusable component library for the dashboard',
        status: 'pending',
        priority: 'medium',
        category: 'development',
        assigned_to: 'system',
        metadata: { estimatedHours: 12, tags: ['components', 'library'] }
      }
    ];

    const { error: tasksError } = await supabase.from('tasks').insert(tasks);
    if (tasksError && !tasksError.message.includes('duplicate key')) {
      throw tasksError;
    }

    return { success: true, message: 'Sample data inserted successfully' };
  } catch (error: any) {
    return { success: false, message: 'Failed to insert sample data', error: error.message };
  }
}

/**
 * Run complete database setup
 */
async function runSetup(force: boolean = false): Promise<SetupResult> {
  try {
    const steps = [];
    
    // Test connection
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      return { success: false, message: connectionTest.message };
    }
    steps.push('✅ Connection verified');

    // Create tables
    const tablesResult = await createTables();
    if (!tablesResult.success) {
      return tablesResult;
    }
    steps.push('✅ Tables created');

    // Enable RLS
    const rlsResult = await enableRLS();
    if (!rlsResult.success) {
      return rlsResult;
    }
    steps.push('✅ Row Level Security enabled');

    // Insert sample data
    const dataResult = await insertSampleData(force);
    if (!dataResult.success) {
      return dataResult;
    }
    steps.push('✅ Sample data inserted');

    // Verify setup
    const { data: themes } = await supabase.from('themes').select('id, name').limit(5);
    const { data: tasks } = await supabase.from('tasks').select('id, title').limit(5);
    
    return {
      success: true,
      message: 'Database setup completed successfully',
      details: {
        steps,
        summary: {
          themes: themes?.length || 0,
          tasks: tasks?.length || 0,
          url: supabaseUrl.substring(0, 30) + '...'
        }
      }
    };
  } catch (error: any) {
    return { success: false, message: 'Setup failed', error: error.message };
  }
}

/**
 * GET /api/database/setup
 * Run database setup (won't overwrite existing data)
 */
export async function GET(request: NextRequest) {
  try {
    const result = await runSetup(false);
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Setup failed',
      error: error.message
    }, { status: 500 });
  }
}

/**
 * POST /api/database/setup
 * Force database setup (will overwrite existing data)
 */
export async function POST(request: NextRequest) {
  try {
    const result = await runSetup(true);
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Setup failed',
      error: error.message
    }, { status: 500 });
  }
}