#!/usr/bin/env node

/**
 * Schema Migration Script
 * Manages database schema migrations and version control
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface Migration {
  id: string;
  version: string;
  name: string;
  description?: string;
  upScript: string;
  downScript: string;
  checksum: string;
  appliedAt?: string;
  rolledBackAt?: string;
}

interface MigrationConfig {
  database_id: string;
  current_version: string;
  migrations: Migration[];
  migration_table: string;
}

class SchemaMigrator {
  private config: MigrationConfig;
  private configPath: string;
  private databaseId: string;

  constructor(databaseId: string) {
    this.databaseId = databaseId;
    this.configPath = join(__dirname, `../migrations/${databaseId}.json`);
    this.loadConfig();
  }

  private loadConfig(): void {
    if (existsSync(this.configPath)) {
      const content = readFileSync(this.configPath, 'utf-8');
      this.config = JSON.parse(content);
    } else {
      this.config = {
        database_id: this.databaseId,
        current_version: '0.0.0',
        migrations: [],
        migration_table: '_schema_migrations'
      };
      this.saveConfig();
    }
  }

  private saveConfig(): void {
    writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  private generateChecksum(content: string): string {
    // Simple checksum generation (in production, use crypto)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private parseVersion(version: string): number[] {
    return version.split('.').map(v => parseInt(v, 10));
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = this.parseVersion(v1);
    const parts2 = this.parseVersion(v2);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    
    return 0;
  }

  async createMigration(
    version: string,
    name: string,
    upScript: string,
    downScript: string,
    description?: string
  ): Promise<Migration> {
    const migration: Migration = {
      id: `migration_${Date.now()}`,
      version,
      name,
      description,
      upScript,
      downScript,
      checksum: this.generateChecksum(upScript + downScript)
    };

    // Validate version is greater than current
    if (this.compareVersions(version, this.config.current_version) <= 0) {
      throw new Error(`Migration version ${version} must be greater than current version ${this.config.current_version}`);
    }

    // Check for duplicate versions
    const existingMigration = this.config.migrations.find(m => m.version === version);
    if (existingMigration) {
      throw new Error(`Migration with version ${version} already exists`);
    }

    this.config.migrations.push(migration);
    this.config.migrations.sort((a, b) => this.compareVersions(a.version, b.version));
    this.saveConfig();

    console.log(`✅ Created migration ${version}: ${name}`);
    return migration;
  }

  async applyMigrations(targetVersion?: string): Promise<void> {
    const pendingMigrations = this.config.migrations.filter(m => !m.appliedAt);
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations to apply');
      return;
    }

    let migrationsToApply = pendingMigrations;
    
    if (targetVersion) {
      migrationsToApply = pendingMigrations.filter(m => 
        this.compareVersions(m.version, targetVersion) <= 0
      );
    }

    console.log(`📦 Applying ${migrationsToApply.length} migration(s)...`);

    for (const migration of migrationsToApply) {
      try {
        console.log(`🔄 Applying migration ${migration.version}: ${migration.name}`);
        
        // In a real implementation, execute the SQL against the database
        await this.executeMigration(migration.upScript);
        
        migration.appliedAt = new Date().toISOString();
        this.config.current_version = migration.version;
        
        console.log(`✅ Applied migration ${migration.version} successfully`);
      } catch (error) {
        console.error(`❌ Failed to apply migration ${migration.version}:`, error);
        throw error;
      }
    }

    this.saveConfig();
    console.log(`🎉 Successfully applied ${migrationsToApply.length} migration(s)`);
    console.log(`📊 Current schema version: ${this.config.current_version}`);
  }

  async rollbackMigration(targetVersion?: string): Promise<void> {
    const appliedMigrations = this.config.migrations
      .filter(m => m.appliedAt && !m.rolledBackAt)
      .sort((a, b) => this.compareVersions(b.version, a.version)); // Reverse order for rollback

    if (appliedMigrations.length === 0) {
      console.log('✅ No migrations to rollback');
      return;
    }

    let migrationsToRollback = appliedMigrations;
    
    if (targetVersion) {
      migrationsToRollback = appliedMigrations.filter(m => 
        this.compareVersions(m.version, targetVersion) > 0
      );
    } else {
      // Default: rollback only the latest migration
      migrationsToRollback = [appliedMigrations[0]];
    }

    console.log(`🔄 Rolling back ${migrationsToRollback.length} migration(s)...`);

    for (const migration of migrationsToRollback) {
      try {
        console.log(`🔄 Rolling back migration ${migration.version}: ${migration.name}`);
        
        // Execute the down script
        await this.executeMigration(migration.downScript);
        
        migration.rolledBackAt = new Date().toISOString();
        
        console.log(`✅ Rolled back migration ${migration.version} successfully`);
      } catch (error) {
        console.error(`❌ Failed to rollback migration ${migration.version}:`, error);
        throw error;
      }
    }

    // Update current version to the highest applied migration
    const remainingApplied = this.config.migrations
      .filter(m => m.appliedAt && !m.rolledBackAt)
      .sort((a, b) => this.compareVersions(b.version, a.version));
    
    this.config.current_version = remainingApplied.length > 0 
      ? remainingApplied[0].version 
      : '0.0.0';

    this.saveConfig();
    console.log(`🎉 Successfully rolled back ${migrationsToRollback.length} migration(s)`);
    console.log(`📊 Current schema version: ${this.config.current_version}`);
  }

  private async executeMigration(script: string): Promise<void> {
    // Mock execution - in a real implementation, this would:
    // 1. Connect to the database
    // 2. Execute the SQL script
    // 3. Handle any errors
    
    console.log(`🔧 Executing SQL script...`);
    console.log(`   Script length: ${script.length} characters`);
    
    // Simulate execution time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, this would be something like:
    // await this.databaseConnection.query(script);
  }

  getStatus(): void {
    const totalMigrations = this.config.migrations.length;
    const appliedMigrations = this.config.migrations.filter(m => m.appliedAt && !m.rolledBackAt).length;
    const pendingMigrations = this.config.migrations.filter(m => !m.appliedAt).length;

    console.log('\n📊 Migration Status');
    console.log('==================');
    console.log(`Database ID: ${this.config.database_id}`);
    console.log(`Current Version: ${this.config.current_version}`);
    console.log(`Total Migrations: ${totalMigrations}`);
    console.log(`Applied: ${appliedMigrations}`);
    console.log(`Pending: ${pendingMigrations}`);
    
    if (pendingMigrations > 0) {
      console.log('\n📋 Pending Migrations:');
      this.config.migrations
        .filter(m => !m.appliedAt)
        .forEach(m => {
          console.log(`  • ${m.version}: ${m.name}`);
        });
    }
    
    if (appliedMigrations > 0) {
      console.log('\n✅ Applied Migrations:');
      this.config.migrations
        .filter(m => m.appliedAt && !m.rolledBackAt)
        .forEach(m => {
          console.log(`  • ${m.version}: ${m.name} (${m.appliedAt})`);
        });
    }
  }

  listMigrations(): void {
    console.log('\n📋 All Migrations');
    console.log('=================');
    
    if (this.config.migrations.length === 0) {
      console.log('No migrations found');
      return;
    }

    this.config.migrations.forEach(migration => {
      const status = migration.rolledBackAt 
        ? '🔄 Rolled Back' 
        : migration.appliedAt 
          ? '✅ Applied' 
          : '⏳ Pending';
      
      console.log(`${status} ${migration.version}: ${migration.name}`);
      if (migration.description) {
        console.log(`    ${migration.description}`);
      }
      if (migration.appliedAt) {
        console.log(`    Applied: ${migration.appliedAt}`);
      }
      if (migration.rolledBackAt) {
        console.log(`    Rolled back: ${migration.rolledBackAt}`);
      }
      console.log();
    });
  }
}

// CLI Interface
function showUsage(): void {
  console.log(`
Schema Migration Tool

Usage: node migrate-schema.ts <database-id> <command> [options]

Commands:
  create <version> <name> <up-file> <down-file>  Create a new migration
  apply [version]                                Apply pending migrations (up to version)
  rollback [version]                             Rollback migrations (down to version)
  status                                         Show migration status
  list                                           List all migrations

Examples:
  # Create a new migration
  node migrate-schema.ts my_db create 1.0.1 "add_users_table" create_users.sql drop_users.sql

  # Apply all pending migrations
  node migrate-schema.ts my_db apply

  # Apply migrations up to version 1.0.5
  node migrate-schema.ts my_db apply 1.0.5

  # Rollback the last migration
  node migrate-schema.ts my_db rollback

  # Rollback to version 1.0.3
  node migrate-schema.ts my_db rollback 1.0.3

  # Show status
  node migrate-schema.ts my_db status

  # List all migrations
  node migrate-schema.ts my_db list
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    showUsage();
    process.exit(1);
  }

  const [databaseId, command, ...options] = args;
  const migrator = new SchemaMigrator(databaseId);

  try {
    switch (command) {
      case 'create': {
        const [version, name, upFile, downFile] = options;
        if (!version || !name || !upFile || !downFile) {
          console.error('❌ Missing required parameters for create command');
          showUsage();
          process.exit(1);
        }

        const upScript = readFileSync(upFile, 'utf-8');
        const downScript = readFileSync(downFile, 'utf-8');
        
        await migrator.createMigration(version, name, upScript, downScript);
        break;
      }

      case 'apply': {
        const [targetVersion] = options;
        await migrator.applyMigrations(targetVersion);
        break;
      }

      case 'rollback': {
        const [targetVersion] = options;
        await migrator.rollbackMigration(targetVersion);
        break;
      }

      case 'status': {
        migrator.getStatus();
        break;
      }

      case 'list': {
        migrator.listMigrations();
        break;
      }

      default: {
        console.error(`❌ Unknown command: ${command}`);
        showUsage();
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { SchemaMigrator, Migration, MigrationConfig };