/**
 * Debug script to check database data
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDatabases() {
  console.log('🔍 Debugging database connection...\n');
  
  // 1. Check if we can connect
  const { data: testData, error: testError } = await supabase
    .from('user_databases')
    .select('count')
    .single();
    
  if (testError) {
    console.error('❌ Connection error:', testError);
    return;
  }
  
  console.log('✅ Connected to Supabase successfully\n');
  
  // 2. Check all databases without joins
  const { data: allDatabases, error: allError } = await supabase
    .from('user_databases')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (allError) {
    console.error('❌ Error fetching databases:', allError);
  } else {
    console.log(`📊 Found ${allDatabases?.length || 0} databases:`);
    allDatabases?.forEach((db, index) => {
      console.log(`\n${index + 1}. ${db.title}`);
      console.log(`   ID: ${db.id}`);
      console.log(`   Type: ${db.type}`);
      console.log(`   Status: ${db.status}`);
      console.log(`   Tables: ${db.table_count}`);
    });
  }
  
  // 3. Check with the same query as the hook
  console.log('\n\n🔍 Testing the exact query from useRealtimeDatabases hook...\n');
  
  const { data: joinedDatabases, error: joinError } = await supabase
    .from('user_databases')
    .select(`
      *,
      database_schemas!inner(
        id,
        table_name,
        schema_columns(
          id
        )
      )
    `)
    .order('created_at', { ascending: false });
    
  if (joinError) {
    console.error('❌ Error with joined query:', joinError);
  } else {
    console.log(`📊 Found ${joinedDatabases?.length || 0} databases with schemas`);
  }
  
  // 4. Check schemas separately
  console.log('\n\n🔍 Checking database_schemas table...\n');
  
  const { data: schemas, error: schemaError } = await supabase
    .from('database_schemas')
    .select('*');
    
  if (schemaError) {
    console.error('❌ Error fetching schemas:', schemaError);
  } else {
    console.log(`📋 Found ${schemas?.length || 0} schemas`);
    schemas?.forEach((schema) => {
      console.log(`   - ${schema.table_name} (DB: ${schema.database_id})`);
    });
  }
}

// Run the debug script
debugDatabases().catch(console.error);