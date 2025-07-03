#!/usr/bin/env node

/**
 * AVA Dashboard Database Setup Script
 * Sets up all required database tables and inserts sample data
 * Compatible with Vercel's Supabase integration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration - Support both Vercel and standard environment variables
const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL || 
                   process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.AVA_NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 AVA Dashboard Database Setup');
console.log('================================');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please ensure one of the following environment variable sets is configured:');
  console.error('  Vercel: AVA_NEXT_PUBLIC_SUPABASE_URL, AVA_NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('  Standard: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Execute SQL file with better error handling
 */
async function executeSQLFile(filePath) {
  try {
    console.log(`📝 Reading SQL file: ${path.basename(filePath)}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split SQL by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`🔄 Executing ${statements.length} SQL statements...`);
    
    let successCount = 0;
    let skipCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        const { error } = await supabase.rpc('exec', { sql: statement });
        if (error) {
          // Check if it's a "already exists" error - these are safe to ignore
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('relation') && error.message.includes('already exists')) {
            console.log(`⚠️  Skipping (already exists): ${statement.split(' ').slice(0, 4).join(' ')}...`);
            skipCount++;
            continue;
          }
          throw error;
        }
        successCount++;
        if (i % 10 === 0 || i === statements.length - 1) {
          console.log(`   Progress: ${i + 1}/${statements.length} statements processed`);
        }
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`);
        console.error(`   SQL: ${statement.substring(0, 100)}...`);
        console.error(`   Error: ${error.message}`);
        throw error;
      }
    }
    
    console.log(`✅ Successfully executed ${successCount} statements, skipped ${skipCount} existing items`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ SQL file not found: ${filePath}`);
    } else {
      console.error(`❌ Error executing SQL file: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Alternative approach using direct SQL execution
 */
async function executeSQL(sql, description = '') {
  try {
    if (description) {
      console.log(`🔄 ${description}`);
    }
    
    const { data, error } = await supabase.rpc('exec', { sql });
    if (error) {
      // Check if it's a benign error we can ignore
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate key')) {
        console.log(`⚠️  Already exists: ${description}`);
        return { data, error: null };
      }
      throw error;
    }
    
    console.log(`✅ ${description || 'SQL executed successfully'}`);
    return { data, error: null };
  } catch (error) {
    console.error(`❌ Error ${description ? 'with ' + description : 'executing SQL'}: ${error.message}`);
    return { data: null, error };
  }
}

/**
 * Create tables with individual SQL statements
 */
async function createTables() {
  console.log('🏗️  Creating database tables...');
  
  // Enable extensions
  await executeSQL('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', 'Enabling UUID extension');
  
  // Create themes table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS themes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  `, 'Creating themes table');
  
  // Create page_theme_assignments table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS page_theme_assignments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      page_id VARCHAR(100) NOT NULL UNIQUE,
      theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
      theme_variation_id UUID,
      is_variation BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `, 'Creating page_theme_assignments table');
  
  // Create tasks table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  `, 'Creating tasks table');
  
  // Create pages table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS pages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      route_id VARCHAR(100) NOT NULL UNIQUE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      layout JSONB DEFAULT '{}',
      meta JSONB DEFAULT '{}',
      navigation JSONB DEFAULT '{}',
      is_system BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `, 'Creating pages table');
  
  console.log('✅ Tables created successfully');
}

/**
 * Enable Row Level Security
 */
async function enableRLS() {
  console.log('🔒 Enabling Row Level Security...');
  
  const tables = ['themes', 'page_theme_assignments', 'tasks', 'pages'];
  
  for (const table of tables) {
    await executeSQL(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`, `Enabling RLS on ${table}`);
    
    // Create policies for public access (demo purposes)
    await executeSQL(`
      DROP POLICY IF EXISTS "public_read_${table}" ON ${table};
      CREATE POLICY "public_read_${table}" ON ${table} FOR SELECT TO anon USING (true);
    `, `Creating read policy for ${table}`);
    
    await executeSQL(`
      DROP POLICY IF EXISTS "public_write_${table}" ON ${table};
      CREATE POLICY "public_write_${table}" ON ${table} FOR ALL TO anon USING (true);
    `, `Creating write policy for ${table}`);
  }
  
  console.log('✅ Row Level Security configured');
}

/**
 * Insert sample data
 */
async function insertSampleData() {
  console.log('📋 Inserting sample data...');
  
  // Check if we already have data
  const { data: existingThemes } = await supabase.from('themes').select('id').limit(1);
  if (existingThemes && existingThemes.length > 0) {
    console.log('⚠️  Sample data already exists, skipping insertion');
    return;
  }
  
  // Insert themes
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
  
  const { error: themesError } = await supabase.from('themes').insert(themes);
  if (themesError) {
    console.error('❌ Error inserting themes:', themesError.message);
  } else {
    console.log('✅ Inserted sample themes');
  }
  
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
  if (tasksError) {
    console.error('❌ Error inserting tasks:', tasksError.message);
  } else {
    console.log('✅ Inserted sample tasks');
  }
  
  // Insert sample pages
  const pages = [
    {
      route_id: 'dashboard',
      title: 'Dashboard',
      description: 'Main dashboard overview',
      layout: { type: 'flex', direction: 'column', gap: 6, padding: 6 },
      meta: { author: 'AVA Team', version: '1.0.0', tags: ['dashboard', 'overview'] },
      navigation: { showSidebar: true, customHeader: false, breadcrumbs: true },
      is_system: true,
      is_active: true
    },
    {
      route_id: 'databases',
      title: 'Databases',
      description: 'Database management interface',
      layout: { type: 'flex', direction: 'column', gap: 4, padding: 4 },
      meta: { author: 'AVA Team', version: '1.0.0', tags: ['databases', 'management'] },
      navigation: { showSidebar: true, customHeader: false, breadcrumbs: true },
      is_system: true,
      is_active: true
    },
    {
      route_id: 'tasks',
      title: 'Tasks',
      description: 'Task management system',
      layout: { type: 'flex', direction: 'column', gap: 4, padding: 4 },
      meta: { author: 'AVA Team', version: '1.0.0', tags: ['tasks', 'management'] },
      navigation: { showSidebar: true, customHeader: false, breadcrumbs: true },
      is_system: true,
      is_active: true
    },
    {
      route_id: 'themes',
      title: 'Themes',
      description: 'Theme gallery and customization',
      layout: { type: 'flex', direction: 'column', gap: 6, padding: 6 },
      meta: { author: 'AVA Team', version: '1.0.0', tags: ['themes', 'customization'] },
      navigation: { showSidebar: true, customHeader: false, breadcrumbs: true },
      is_system: true,
      is_active: true
    }
  ];
  
  const { error: pagesError } = await supabase.from('pages').insert(pages);
  if (pagesError) {
    console.error('❌ Error inserting pages:', pagesError.message);
  } else {
    console.log('✅ Inserted sample pages');
  }
}

/**
 * Verify database setup
 */
async function verifySetup() {
  console.log('🔍 Verifying database setup...');
  
  try {
    // Check themes
    const { data: themes, error: themesError } = await supabase
      .from('themes')
      .select('id, name, display_name, category')
      .limit(5);
    
    if (themesError) throw themesError;
    console.log(`✅ Found ${themes.length} themes`);
    
    // Check tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, status')
      .limit(5);
    
    if (tasksError) throw tasksError;
    console.log(`✅ Found ${tasks.length} tasks`);
    
    // Check pages
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('id, route_id, title')
      .limit(5);
    
    if (pagesError) throw pagesError;
    console.log(`✅ Found ${pages.length} pages`);
    
    return true;
  } catch (error) {
    console.error(`❌ Verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Main setup function
 */
async function setupDatabase() {
  console.log(`📡 Connecting to: ${supabaseUrl.substring(0, 30)}...`);
  
  try {
    await createTables();
    await enableRLS();
    await insertSampleData();
    
    const isVerified = await verifySetup();
    
    if (isVerified) {
      console.log('');
      console.log('🎉 Database setup completed successfully!');
      console.log('');
      console.log('📊 Summary:');
      console.log('  • Database schema created');
      console.log('  • Row Level Security enabled');
      console.log('  • Sample data inserted');
      console.log('  • Setup verified');
      console.log('');
      console.log('🚀 Next steps:');
      console.log('  1. Start your application: npm run dev');
      console.log('  2. Navigate to /themes to test theme switching');
      console.log('  3. Check /tasks to see sample tasks');
      console.log('  4. Visit /databases to manage data');
      console.log('');
    } else {
      console.log('❌ Setup completed but verification failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

/**
 * Test connection function
 */
async function testConnection() {
  console.log('🔗 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase.from('pg_tables').select('tablename').limit(1);
    if (error) throw error;
    
    console.log('✅ Connection successful!');
    console.log(`📡 Connected to: ${supabaseUrl}`);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'setup':
  case undefined:
    setupDatabase();
    break;
  case 'test':
    testConnection().then(success => {
      process.exit(success ? 0 : 1);
    });
    break;
  case 'verify':
    verifySetup().then(success => {
      process.exit(success ? 0 : 1);
    });
    break;
  default:
    console.log('Usage: node setup-database.js [setup|test|verify]');
    console.log('  setup  - Create database schema and insert sample data (default)');
    console.log('  test   - Test connection to Supabase');
    console.log('  verify - Verify database setup');
    process.exit(1);
}