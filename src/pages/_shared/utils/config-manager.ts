/**
 * Configuration management utilities for page configurations
 * Handles file operations, backup, and restoration
 */

import { promises as fs } from 'fs';
import path from 'path';
import { PageConfig, ConfigManager, ConfigurationError } from '../runtime/types';
import { configParser } from '../runtime/ConfigParser';

/**
 * File-based configuration manager implementation
 */
export class FileConfigManager implements ConfigManager {
  private basePath: string;
  private backupPath: string;

  constructor(basePath: string = 'src/pages', backupPath: string = '.backups') {
    this.basePath = basePath;
    this.backupPath = backupPath;
  }

  /**
   * Load page configuration from file
   * @param pageId - Unique page identifier
   * @returns Promise resolving to page configuration
   */
  async load(pageId: string): Promise<PageConfig> {
    const configPath = this.getConfigPath(pageId);
    
    try {
      return await configParser.parsePageConfig(configPath);
    } catch (error) {
      throw new ConfigurationError(
        `Failed to load configuration for page '${pageId}': ${(error as Error).message}`
      );
    }
  }

  /**
   * Save page configuration to file
   * @param pageId - Unique page identifier
   * @param config - Page configuration to save
   */
  async save(pageId: string, config: PageConfig): Promise<void> {
    const configPath = this.getConfigPath(pageId);
    
    try {
      // Ensure directory exists
      await this.ensureDirectoryExists(path.dirname(configPath));
      
      // Validate configuration before saving
      const validation = configParser.validate(config);
      if (!validation.valid) {
        throw new ConfigurationError(`Invalid configuration: ${validation.errors.join(', ')}`);
      }
      
      // Save configuration
      await configParser.writeConfig(configPath, config);
      
      console.log(`✅ Saved configuration for page '${pageId}'`);
    } catch (error) {
      throw new ConfigurationError(
        `Failed to save configuration for page '${pageId}': ${(error as Error).message}`
      );
    }
  }

  /**
   * Update page configuration with partial changes
   * @param pageId - Unique page identifier
   * @param updates - Partial configuration updates
   */
  async update(pageId: string, updates: Partial<PageConfig>): Promise<void> {
    try {
      // Load existing configuration
      const existingConfig = await this.load(pageId);
      
      // Merge configurations
      const updatedConfig = configParser.mergeConfigs(existingConfig, updates);
      
      // Save merged configuration
      await this.save(pageId, updatedConfig);
      
      console.log(`✅ Updated configuration for page '${pageId}'`);
    } catch (error) {
      throw new ConfigurationError(
        `Failed to update configuration for page '${pageId}': ${(error as Error).message}`
      );
    }
  }

  /**
   * Create backup of page configuration
   * @param pageId - Unique page identifier
   * @returns Promise resolving to backup ID
   */
  async backup(pageId: string): Promise<string> {
    try {
      const config = await this.load(pageId);
      const backupId = `${pageId}-${Date.now()}`;
      const backupFilePath = path.join(this.backupPath, `${backupId}.yaml`);
      
      // Ensure backup directory exists
      await this.ensureDirectoryExists(this.backupPath);
      
      // Save backup
      await configParser.writeConfig(backupFilePath, config);
      
      console.log(`✅ Created backup '${backupId}' for page '${pageId}'`);
      return backupId;
    } catch (error) {
      throw new ConfigurationError(
        `Failed to create backup for page '${pageId}': ${(error as Error).message}`
      );
    }
  }

  /**
   * Restore page configuration from backup
   * @param pageId - Unique page identifier
   * @param backupId - Backup identifier
   */
  async restore(pageId: string, backupId: string): Promise<void> {
    try {
      const backupFilePath = path.join(this.backupPath, `${backupId}.yaml`);
      const config = await configParser.parsePageConfig(backupFilePath);
      
      // Create backup of current state before restoring
      await this.backup(pageId);
      
      // Restore configuration
      await this.save(pageId, config);
      
      console.log(`✅ Restored configuration for page '${pageId}' from backup '${backupId}'`);
    } catch (error) {
      throw new ConfigurationError(
        `Failed to restore configuration for page '${pageId}' from backup '${backupId}': ${(error as Error).message}`
      );
    }
  }

  /**
   * List available backups for a page
   * @param pageId - Unique page identifier
   * @returns Array of backup IDs
   */
  async listBackups(pageId: string): Promise<string[]> {
    try {
      const files = await fs.readdir(this.backupPath);
      return files
        .filter(file => file.startsWith(`${pageId}-`) && file.endsWith('.yaml'))
        .map(file => file.replace('.yaml', ''))
        .sort((a, b) => {
          const aTime = parseInt(a.split('-').pop() || '0');
          const bTime = parseInt(b.split('-').pop() || '0');
          return bTime - aTime; // Most recent first
        });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return []; // Backup directory doesn't exist yet
      }
      throw new ConfigurationError(
        `Failed to list backups for page '${pageId}': ${(error as Error).message}`
      );
    }
  }

  /**
   * Check if configuration file exists for a page
   * @param pageId - Unique page identifier
   * @returns Promise resolving to boolean
   */
  async exists(pageId: string): Promise<boolean> {
    const configPath = this.getConfigPath(pageId);
    try {
      await fs.access(configPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a new page with default configuration
   * @param pageId - Unique page identifier
   * @param config - Initial configuration (optional)
   */
  async createPage(pageId: string, config?: Partial<PageConfig>): Promise<void> {
    try {
      // Check if page already exists
      if (await this.exists(pageId)) {
        throw new ConfigurationError(`Page '${pageId}' already exists`);
      }

      // Create page directory structure
      const pageDir = path.join(this.basePath, pageId);
      await this.ensureDirectoryExists(pageDir);
      await this.ensureDirectoryExists(path.join(pageDir, 'components'));
      await this.ensureDirectoryExists(path.join(pageDir, 'hooks'));
      await this.ensureDirectoryExists(path.join(pageDir, 'api'));
      await this.ensureDirectoryExists(path.join(pageDir, 'scripts'));
      await this.ensureDirectoryExists(path.join(pageDir, 'utils'));

      // Create default configuration
      const defaultConfig = configParser.applyDefaults(config || {
        page: {
          title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
          route: `/${pageId}`
        }
      });

      // Save configuration
      await this.save(pageId, defaultConfig);

      // Create basic page files
      await this.createPageFiles(pageId);

      console.log(`✅ Created new page '${pageId}' with default structure`);
    } catch (error) {
      throw new ConfigurationError(
        `Failed to create page '${pageId}': ${(error as Error).message}`
      );
    }
  }

  /**
   * Delete a page and all its files
   * @param pageId - Unique page identifier
   * @param createBackup - Whether to create backup before deletion
   */
  async deletePage(pageId: string, createBackup: boolean = true): Promise<void> {
    try {
      if (createBackup && await this.exists(pageId)) {
        await this.backup(pageId);
      }

      const pageDir = path.join(this.basePath, pageId);
      await fs.rm(pageDir, { recursive: true, force: true });

      console.log(`✅ Deleted page '${pageId}'`);
    } catch (error) {
      throw new ConfigurationError(
        `Failed to delete page '${pageId}': ${(error as Error).message}`
      );
    }
  }

  // Private helper methods
  private getConfigPath(pageId: string): string {
    return path.join(this.basePath, pageId, 'config.yaml');
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  private async createPageFiles(pageId: string): Promise<void> {
    const pageDir = path.join(this.basePath, pageId);

    // Create component index
    await fs.writeFile(
      path.join(pageDir, 'components', 'index.ts'),
      '// Export page-specific components here\n'
    );

    // Create hooks index
    await fs.writeFile(
      path.join(pageDir, 'hooks', 'index.ts'),
      '// Export page-specific hooks here\n'
    );

    // Create API index
    await fs.writeFile(
      path.join(pageDir, 'api', 'index.ts'),
      '// Export page-specific API handlers here\n'
    );

    // Create types file
    await fs.writeFile(
      path.join(pageDir, 'types.ts'),
      '// Page-specific type definitions\n'
    );

    // Create styles file
    await fs.writeFile(
      path.join(pageDir, 'styles.css'),
      `/* Page-specific styles for ${pageId} */\n`
    );
  }
}

// Export singleton instance
export const configManager = new FileConfigManager();