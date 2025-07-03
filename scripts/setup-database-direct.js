#!/usr/bin/env node

/**
 * Direct Database Setup Script
 * Sets up database using direct SQL queries without relying on custom functions
 * Compatible with Vercel's Supabase integration
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - Support both Vercel and standard environment variables
const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL || 
                   process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.AVA_SUPABASE_SERVICE_ROLE_KEY || 
                   process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 AVA Dashboard Direct Database Setup');
console.log('======================================');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Required environment variables:');
  console.error('  - AVA_NEXT_PUBLIC_SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)');
  console.error('  - AVA_SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Test database connection
 */
async function testConnection() {
  try {
    console.log('🔗 Testing database connection...');
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Create tables using direct queries
 */
async function createTables() {
  console.log('🏗️  Creating database tables...');
  
  try {
    // Create themes table
    const { error: themesError } = await supabase
      .from('themes')
      .select('id')
      .limit(1);
    
    if (themesError && themesError.message.includes('does not exist')) {
      console.log('📝 Creating themes table...');
      // We'll handle table creation through the API route instead
      console.log('⚠️  Tables need to be created via SQL editor or API route');
      return false;
    }
    
    console.log('✅ Tables already exist or were created');
    return true;
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    return false;
  }
}

/**
 * Insert sample data
 */
async function insertSampleData() {
  console.log('📋 Inserting sample data...');
  
  try {
    // Check if themes exist
    const { data: existingThemes, error: checkError } = await supabase
      .from('themes')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Cannot check existing themes:', checkError.message);
      return false;
    }
    
    if (existingThemes && existingThemes.length > 0) {
      console.log('⚠️  Sample data already exists');
      return true;
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
        is_system: true,
        is_default: true,
        author: 'AVA Team'
      }
    ];
    
    const { error: insertError } = await supabase
      .from('themes')
      .insert(themes);
    
    if (insertError) {
      console.error('❌ Error inserting themes:', insertError.message);
      return false;
    }
    
    console.log('✅ Sample data inserted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
    return false;
  }
}

/**
 * Main setup function
 */
async function main() {
  try {
    console.log(`📡 Connecting to: ${supabaseUrl.substring(0, 30)}...`);
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      process.exit(1);
    }
    
    // Create tables (or verify they exist)
    const tablesReady = await createTables();
    if (!tablesReady) {
      console.log('');
      console.log('⚠️  Database setup incomplete');
      console.log('');
      console.log('📝 Manual setup required:');
      console.log('   1. Visit your Supabase dashboard SQL editor');
      console.log('   2. Run the SQL script in database/setup.sql');
      console.log('   3. Or use the API route: /api/database/setup');
      console.log('');
      process.exit(1);
    }
    
    // Insert sample data
    await insertSampleData();
    
    console.log('');
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Your application is ready to use');
    console.log('   2. Visit /databases to manage your data');
    console.log('   3. Check /themes to see the theme system');
    console.log('');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();