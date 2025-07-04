#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Create new migration file
async function createMigration() {
  const migrationName = process.argv[2];
  
  if (!migrationName) {
    console.error('Usage: npm run db:migrate:create <migration-name>');
    process.exit(1);
  }
  
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  const filename = `${timestamp}_${migrationName}.sql`;
  const migrationsPath = path.join(process.cwd(), 'database', 'migrations');
  
  // Ensure migrations directory exists
  await fs.mkdir(migrationsPath, { recursive: true });
  
  const template = `-- Migration: ${migrationName}
-- Created: ${new Date().toISOString()}

-- Add your SQL statements here
-- Example:
-- ALTER TABLE your_table ADD COLUMN new_column VARCHAR(255);

-- Remember to:
-- 1. Use IF NOT EXISTS for CREATE statements
-- 2. Use IF EXISTS for DROP statements  
-- 3. Test your migration thoroughly
`;
  
  const filePath = path.join(migrationsPath, filename);
  await fs.writeFile(filePath, template);
  
  console.log(`Created migration: ${filename}`);
  console.log(`Path: ${filePath}`);
}

createMigration().catch(console.error);