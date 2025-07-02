#!/usr/bin/env node

/**
 * Theme Database Setup Script
 * Initializes the theme database with schema and default themes
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Execute SQL file
 */
async function executeSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split SQL by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements from ${path.basename(filePath)}`);
    
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      if (error) {
        console.error(`❌ Error executing SQL: ${error.message}`);
        console.error(`Statement: ${statement.substring(0, 100)}...`);
        throw error;
      }
    }
    
    console.log(`✅ Successfully executed ${path.basename(filePath)}`);
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
 * Verify database setup
 */
async function verifySetup() {
  console.log('🔍 Verifying database setup...');
  
  try {
    // Check if themes table exists and has data
    const { data: themes, error: themesError } = await supabase
      .from('themes')
      .select('id, name, display_name, category')
      .limit(5);
    
    if (themesError) {
      throw themesError;
    }
    
    console.log(`✅ Found ${themes.length} themes in database`);
    themes.forEach(theme => {
      console.log(`   - ${theme.display_name} (${theme.category})`);
    });
    
    // Check if page_theme_assignments table exists
    const { data: assignments, error: assignmentsError } = await supabase
      .from('page_theme_assignments')
      .select('page_id, theme_id')
      .limit(5);
    
    if (assignmentsError) {
      throw assignmentsError;
    }
    
    console.log(`✅ Found ${assignments.length} page theme assignments`);
    assignments.forEach(assignment => {
      console.log(`   - Page: ${assignment.page_id}`);
    });
    
    return true;
  } catch (error) {
    console.error(`❌ Verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Main setup function
 */
async function setupThemeDatabase() {
  console.log('🚀 Setting up theme database...');
  console.log(`📡 Connected to: ${supabaseUrl}`);
  
  try {
    // Path to SQL schema file
    const schemaPath = path.join(__dirname, '../database/schema/tailwind_themes.sql');
    
    // Execute SQL schema
    await executeSQLFile(schemaPath);
    
    // Verify setup
    const isVerified = await verifySetup();
    
    if (isVerified) {
      console.log('');
      console.log('🎉 Theme database setup completed successfully!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Start your application: npm run dev');
      console.log('2. Navigate to /themes to access the Theme Gallery');
      console.log('3. Select a page and apply different themes');
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
 * Clean up function (optional)
 */
async function cleanupThemeDatabase() {
  console.log('🧹 Cleaning up theme database...');
  
  try {
    // Drop tables in reverse order (due to foreign keys)
    const { error: assignmentsError } = await supabase.rpc('exec_sql', {
      sql_query: 'DROP TABLE IF EXISTS page_theme_assignments CASCADE'
    });
    
    if (assignmentsError) {
      console.error('Error dropping page_theme_assignments:', assignmentsError.message);
    }
    
    const { error: themesError } = await supabase.rpc('exec_sql', {
      sql_query: 'DROP TABLE IF EXISTS themes CASCADE'
    });
    
    if (themesError) {
      console.error('Error dropping themes:', themesError.message);
    }
    
    console.log('✅ Theme database cleaned up');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'setup':
  case undefined:
    setupThemeDatabase();
    break;
  case 'cleanup':
    cleanupThemeDatabase();
    break;
  case 'verify':
    verifySetup().then(success => {
      process.exit(success ? 0 : 1);
    });
    break;
  default:
    console.log('Usage: node setup-theme-database.js [setup|cleanup|verify]');
    console.log('  setup   - Create theme database schema and insert default data');
    console.log('  cleanup - Remove theme database tables');
    console.log('  verify  - Verify database setup');
    process.exit(1);
}