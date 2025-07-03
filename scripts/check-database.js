#!/usr/bin/env node

/**
 * Post-build Database Check Script
 * Verifies database connection and triggers setup if needed
 * Compatible with Vercel's build process
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - Support both Vercel and standard environment variables
const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL || 
                   process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.AVA_NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Post-build Database Check');
console.log('============================');

if (!supabaseUrl || !supabaseKey) {
  console.log('⚠️  Supabase credentials not found - skipping database check');
  console.log('   This is normal for builds without database access');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Check if database is properly set up
 */
async function checkDatabase() {
  try {
    console.log('🔗 Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('themes')
      .select('id, name')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation "themes" does not exist')) {
        console.log('⚠️  Database schema not found');
        console.log('   📝 Setup will be triggered on first application visit');
        console.log('   🔗 Visit /api/database/setup to manually setup');
        return true; // This is expected for fresh deployments
      }
      throw error;
    }
    
    console.log('✅ Database connection verified');
    console.log(`   📊 Found ${data?.length || 0} themes`);
    
    // Check if we have basic data
    if (!data || data.length === 0) {
      console.log('⚠️  No themes found in database');
      console.log('   📝 Sample data will be inserted on first visit');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.log('   🔗 Database setup will be attempted on application start');
    return false;
  }
}

/**
 * Main check function
 */
async function main() {
  try {
    const isHealthy = await checkDatabase();
    
    console.log('');
    console.log('📋 Post-build Summary:');
    console.log(`   Database Status: ${isHealthy ? '✅ Ready' : '⚠️  Needs Setup'}`);
    console.log(`   Setup URL: ${supabaseUrl.substring(0, 30)}...`);
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('   1. Deploy to Vercel will handle database setup automatically');
    console.log('   2. Visit /api/database/setup to manually trigger setup');
    console.log('   3. Check database page in your app for status');
    console.log('');
    
    // Exit with 0 even if database needs setup - this is normal
    process.exit(0);
  } catch (error) {
    console.error('❌ Post-build check failed:', error.message);
    // Don't fail the build for database issues
    process.exit(0);
  }
}

main();