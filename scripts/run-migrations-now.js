#!/usr/bin/env node

// Quick script to run migrations on your deployed app
const https = require('https');

const VERCEL_URL = process.argv[2];

if (!VERCEL_URL) {
  console.log('Usage: node scripts/run-migrations-now.js <your-vercel-url>');
  console.log('Example: node scripts/run-migrations-now.js https://your-app.vercel.app');
  process.exit(1);
}

async function runMigrations() {
  console.log('🚀 Running migrations on deployed app...');
  
  try {
    // First check migration status
    console.log('📋 Checking migration status...');
    const statusResponse = await fetch(`${VERCEL_URL}/api/migrate`);
    const status = await statusResponse.json();
    
    console.log(`Found ${status.pendingCount} pending migrations`);
    
    if (status.pendingCount === 0) {
      console.log('✅ No pending migrations');
      return;
    }
    
    // Run migrations
    console.log('⚡ Running migrations...');
    const runResponse = await fetch(`${VERCEL_URL}/api/migrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await runResponse.json();
    
    if (runResponse.ok) {
      console.log('✅ Migrations completed successfully!');
      console.log(`Result: ${result.message}`);
      console.log(`Success: ${result.successCount}/${result.pendingCount}`);
    } else {
      console.error('❌ Migration failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error running migrations:', error.message);
  }
}

// Add fetch polyfill for Node.js
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

runMigrations();