/**
 * Components Database Setup Script
 * Initializes the components table and populates it with sample data from PLAN.md
 */

import { supabaseClient } from '../../databases/api/supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function setupComponentsDatabase() {
  try {
    console.log('🧩 Setting up Components Database...');
    
    // Read and execute the SQL setup script
    const sqlPath = join(__dirname, 'setup-components-table.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    
    // Execute the SQL script
    const { error } = await supabaseClient.rpc('exec_sql', { sql_script: sql });
    
    if (error) {
      console.error('❌ Error setting up components database:', error);
      return false;
    }
    
    console.log('✅ Components Database setup completed!');
    console.log('📊 Sample components from PLAN.md have been loaded');
    
    return true;
  } catch (err) {
    console.error('❌ Failed to setup components database:', err);
    return false;
  }
}

// Run setup if called directly
if (require.main === module) {
  setupComponentsDatabase()
    .then(success => {
      if (success) {
        console.log('🎉 Components Database is ready to use!');
        process.exit(0);
      } else {
        console.log('💥 Setup failed. Please check the errors above.');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('💥 Setup script error:', err);
      process.exit(1);
    });
}