#!/usr/bin/env node

/**
 * Features Database Setup Script
 * Initializes the page_features table with schema and sample data
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
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
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
    // Check if page_features table exists and has data
    const { data: features, error: featuresError } = await supabase
      .from('page_features')
      .select('id, name, page_id, status, priority')
      .limit(5);
    
    if (featuresError) {
      throw featuresError;
    }
    
    console.log(`✅ Found ${features.length} features in database`);
    features.forEach(feature => {
      console.log(`   - ${feature.name} (${feature.page_id}) - ${feature.status}`);
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
async function setupFeaturesDatabase() {
  console.log('🚀 Setting up features database...');
  console.log(`📡 Connected to: ${supabaseUrl}`);
  
  try {
    // Path to SQL schema file
    const schemaPath = path.join(__dirname, '../src/pages/page-manager/scripts/setup-features-table-simple.sql');
    
    // Execute SQL schema
    await executeSQLFile(schemaPath);
    
    // Verify setup
    const isVerified = await verifySetup();
    
    if (isVerified) {
      console.log('');
      console.log('🎉 Features database setup completed successfully!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Start your application: npm run dev');
      console.log('2. Navigate to any page to manage features');
      console.log('3. Try adding new features through the interface');
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
async function cleanupFeaturesDatabase() {
  console.log('🧹 Cleaning up features database...');
  
  try {
    // Drop the table
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS page_features CASCADE'
    });
    
    if (error) {
      console.error('Error dropping page_features:', error.message);
    } else {
      console.log('✅ Features database cleaned up');
    }
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'setup':
  case undefined:
    setupFeaturesDatabase();
    break;
  case 'cleanup':
    cleanupFeaturesDatabase();
    break;
  case 'verify':
    verifySetup().then(success => {
      process.exit(success ? 0 : 1);
    });
    break;
  default:
    console.log('Usage: node setup-features-database.js [setup|cleanup|verify]');
    console.log('  setup   - Create features database schema and insert default data');
    console.log('  cleanup - Remove features database tables');
    console.log('  verify  - Verify database setup');
    process.exit(1);
}