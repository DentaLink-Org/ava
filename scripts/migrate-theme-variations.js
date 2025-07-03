#!/usr/bin/env node

/**
 * Migration script to add theme variations support
 * This script outputs the SQL migration that you can run in Supabase
 */

const fs = require('fs');
const path = require('path');

async function generateMigration() {
  console.log('Theme Variations Migration Helper\n');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../database/schema/theme_variations.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Migration SQL Generated!\n');
    console.log('Please follow these steps to add theme variations support:\n');
    console.log('1. Go to your Supabase dashboard (https://app.supabase.com)');
    console.log('2. Select your project');
    console.log('3. Navigate to the SQL Editor (in the left sidebar)');
    console.log('4. Create a new query');
    console.log('5. Copy and paste the SQL below');
    console.log('6. Click "Run" to execute the migration\n');
    console.log('='.repeat(80));
    console.log('-- COPY EVERYTHING BELOW THIS LINE --\n');
    console.log(migrationSQL);
    console.log('\n-- COPY EVERYTHING ABOVE THIS LINE --');
    console.log('='.repeat(80));
    
    console.log('\n✅ After running the migration:');
    console.log('- The theme_variations table will be created');
    console.log('- Page theme assignments will support variations');
    console.log('- You can start creating and using theme variations');
    
    console.log('\n💡 Tips:');
    console.log('- If you get "already exists" errors, the migration may have already been applied');
    console.log('- Check the "Table Editor" to verify the theme_variations table exists');
    console.log('- Test by creating a theme variation through the UI');

  } catch (error) {
    console.error('❌ Error reading migration file:', error.message);
    console.error('\nPlease ensure the file exists at:');
    console.error(path.join(__dirname, '../database/schema/theme_variations.sql'));
    process.exit(1);
  }
}

// Run the migration helper
generateMigration();