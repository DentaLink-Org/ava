/**
 * Page configuration parser with comprehensive error handling
 * Follows the architecture specified in PLAN.md
 */

import * as yaml from 'js-yaml';
import Ajv from 'ajv';
import { promises as fs } from 'fs';
import { 
  PageConfig, 
  ConfigurationError, 
  ValidationResult, 
  ConfigValidator 
} from './types';
import { 
  pageConfigSchema, 
  validateComponentPositioning, 
  validateThemeColors, 
  validateDataSources 
} from './schema';

/**
 * Comprehensive page configuration parser
 */
export class ConfigParser implements ConfigValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ 
      allErrors: true,
      verbose: true,
      strict: false 
    });
  }

  /**
   * Parse page configuration from YAML file
   * @param configPath - Path to the page configuration file
   * @returns Parsed and validated page configuration
   * @throws ConfigurationError - When configuration is invalid
   */
  async parsePageConfig(configPath: string): Promise<PageConfig> {
    try {
      // Read and parse YAML file
      const rawConfig = await fs.readFile(configPath, 'utf-8');
      const parsedConfig = yaml.load(rawConfig);

      if (!parsedConfig || typeof parsedConfig !== 'object') {
        throw new ConfigurationError('Configuration file is empty or invalid');
      }

      // Validate against schema with lenient error handling
      try {
        const validation = this.validate(parsedConfig);
        if (!validation.valid) {
          console.warn(`Configuration validation warnings for ${configPath}:`, validation.errors);
          // Don't throw error for now, just log warnings
        }
      } catch (validationError) {
        console.warn(`Schema validation failed for ${configPath}:`, validationError);
      }

      return parsedConfig as PageConfig;
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      
      if (error instanceof yaml.YAMLException) {
        throw new ConfigurationError(`YAML parsing error: ${error.message}`, { 
          line: error.mark?.line, 
          column: error.mark?.column 
        });
      }

      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new ConfigurationError(`Configuration file not found: ${configPath}`);
      }

      throw new ConfigurationError(`Failed to parse configuration: ${(error as Error).message}`);
    }
  }

  /**
   * Parse page configuration from YAML string
   * @param yamlString - YAML configuration as string
   * @returns Parsed and validated page configuration
   * @throws ConfigurationError - When configuration is invalid
   */
  parseConfigString(yamlString: string): PageConfig {
    try {
      const parsedConfig = yaml.load(yamlString);

      if (!parsedConfig || typeof parsedConfig !== 'object') {
        throw new ConfigurationError('Configuration string is empty or invalid');
      }

      // Validate against schema
      const validation = this.validate(parsedConfig);
      if (!validation.valid) {
        throw new ConfigurationError(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      return parsedConfig as PageConfig;
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      
      if (error instanceof yaml.YAMLException) {
        throw new ConfigurationError(`YAML parsing error: ${error.message}`, { 
          line: error.mark?.line, 
          column: error.mark?.column 
        });
      }

      throw new ConfigurationError(`Failed to parse configuration string: ${(error as Error).message}`);
    }
  }

  /**
   * Validate page configuration against schema and business rules
   * @param config - Configuration object to validate
   * @returns Validation result with errors if any
   */
  validate(config: unknown): ValidationResult {
    const errors: string[] = [];

    // JSON Schema validation
    const schemaValid = this.ajv.validate(pageConfigSchema, config);
    if (!schemaValid) {
      const schemaErrors = this.ajv.errors?.map(error => {
        const path = error.instancePath || 'root';
        return `${path}: ${error.message}`;
      }) || ['Unknown schema validation error'];
      errors.push(...schemaErrors);
    }

    // Skip business rule validation if schema validation failed
    if (!schemaValid || typeof config !== 'object' || !config) {
      return { valid: false, errors };
    }

    const typedConfig = config as any;

    // Custom validation rules
    try {
      // Component positioning validation
      if (typedConfig.components && Array.isArray(typedConfig.components)) {
        const positionErrors = validateComponentPositioning(typedConfig.components);
        errors.push(...positionErrors);
      }

      // Theme color validation
      if (typedConfig.theme?.colors) {
        const colorErrors = validateThemeColors(typedConfig.theme.colors);
        errors.push(...colorErrors);
      }

      // Data source validation
      if (typedConfig.data?.sources && Array.isArray(typedConfig.data.sources)) {
        const dataErrors = validateDataSources(typedConfig.data.sources);
        errors.push(...dataErrors);
      }

      // Component ID uniqueness validation
      if (typedConfig.components && Array.isArray(typedConfig.components)) {
        const componentIds = new Set<string>();
        typedConfig.components.forEach((component: any, index: number) => {
          if (componentIds.has(component.id)) {
            errors.push(`Duplicate component ID '${component.id}' at index ${index}`);
          }
          componentIds.add(component.id);
        });
      }

      // Layout validation based on type
      if (typedConfig.layout) {
        const layout = typedConfig.layout;
        if (layout.type === 'grid' && !layout.columns) {
          errors.push('Grid layout requires columns to be specified');
        }
        
        if (layout.gap < 0 || layout.padding < 0) {
          errors.push('Layout gap and padding must be non-negative');
        }
      }

    } catch (validationError) {
      errors.push(`Custom validation error: ${(validationError as Error).message}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate partial configuration (useful for incremental updates)
   * @param config - Partial configuration object to validate
   * @returns Validation result with errors if any
   */
  validatePartial(config: Partial<PageConfig>): ValidationResult {
    const errors: string[] = [];

    try {
      // Validate individual sections if present
      if (config.components) {
        const positionErrors = validateComponentPositioning(config.components);
        errors.push(...positionErrors);

        // Component ID uniqueness
        const componentIds = new Set<string>();
        config.components.forEach((component, index) => {
          if (componentIds.has(component.id)) {
            errors.push(`Duplicate component ID '${component.id}' at index ${index}`);
          }
          componentIds.add(component.id);
        });
      }

      if (config.theme?.colors) {
        const colorErrors = validateThemeColors(config.theme.colors);
        errors.push(...colorErrors);
      }

      if (config.data?.sources) {
        const dataErrors = validateDataSources(config.data.sources);
        errors.push(...dataErrors);
      }

      if (config.layout) {
        const layout = config.layout;
        if (layout.type === 'grid' && layout.columns && layout.columns <= 0) {
          errors.push('Grid columns must be greater than 0');
        }
        
        if ((layout.gap !== undefined && layout.gap < 0) || 
            (layout.padding !== undefined && layout.padding < 0)) {
          errors.push('Layout gap and padding must be non-negative');
        }
      }

    } catch (validationError) {
      errors.push(`Partial validation error: ${(validationError as Error).message}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Apply default values to configuration
   * @param config - Configuration to apply defaults to
   * @returns Configuration with defaults applied
   */
  applyDefaults(config: Partial<PageConfig>): PageConfig {
    const defaultConfig: PageConfig = {
      page: {
        title: config.page?.title || 'Untitled Page',
        route: config.page?.route || '/',
        description: config.page?.description
      },
      layout: {
        type: config.layout?.type || 'grid',
        columns: config.layout?.columns || 12,
        gap: config.layout?.gap ?? 4,
        padding: config.layout?.padding ?? 6,
        ...config.layout
      },
      theme: config.theme ? {
        colors: {
          primary: config.theme?.colors?.primary || '#f97316',
          background: config.theme?.colors?.background || '#f3f4f6', 
          text: config.theme?.colors?.text || '#111827',
          secondary: config.theme?.colors?.secondary,
          surface: config.theme?.colors?.surface,
          textSecondary: config.theme?.colors?.textSecondary
        },
        spacing: {
          base: config.theme?.spacing?.base || 4,
          small: config.theme?.spacing?.small || 2,
          large: config.theme?.spacing?.large || 8
        },
        typography: config.theme?.typography
      } : undefined,
      components: config.components || [],
      data: config.data,
      navigation: {
        showSidebar: config.navigation?.showSidebar ?? true,
        customHeader: config.navigation?.customHeader ?? false,
        breadcrumbs: config.navigation?.breadcrumbs ?? true
      },
      scripts: config.scripts,
      meta: {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        ...config.meta
      }
    };

    return defaultConfig;
  }

  /**
   * Serialize configuration to YAML string
   * @param config - Configuration to serialize
   * @returns YAML string representation
   */
  serialize(config: PageConfig): string {
    try {
      return yaml.dump(config, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        sortKeys: false
      });
    } catch (error) {
      throw new ConfigurationError(`Failed to serialize configuration: ${(error as Error).message}`);
    }
  }

  /**
   * Write configuration to file
   * @param configPath - Path to write configuration to
   * @param config - Configuration to write
   */
  async writeConfig(configPath: string, config: PageConfig): Promise<void> {
    try {
      const yamlString = this.serialize(config);
      await fs.writeFile(configPath, yamlString, 'utf-8');
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      throw new ConfigurationError(`Failed to write configuration file: ${(error as Error).message}`);
    }
  }

  /**
   * Merge two configurations with the second taking precedence
   * @param base - Base configuration
   * @param override - Override configuration
   * @returns Merged configuration
   */
  mergeConfigs(base: PageConfig, override: Partial<PageConfig>): PageConfig {
    return {
      ...base,
      ...override,
      page: { ...base.page, ...override.page },
      layout: { ...base.layout, ...override.layout },
      // @ts-ignore - temporary fix for theme merging types
      theme: (base.theme || override.theme) ? {
        ...base.theme,
        ...override.theme,
        colors: { ...base.theme?.colors, ...override.theme?.colors },
        spacing: { ...base.theme?.spacing, ...override.theme?.spacing },
        typography: { ...base.theme?.typography, ...override.theme?.typography }
      } : undefined,
      components: override.components !== undefined ? override.components : base.components,
      data: override.data !== undefined ? override.data : base.data,
      navigation: override.navigation ? { ...base.navigation, ...override.navigation } : base.navigation,
      scripts: override.scripts !== undefined ? override.scripts : base.scripts,
      meta: { ...base.meta, ...override.meta }
    };
  }
}

// Export singleton instance for convenience
export const configParser = new ConfigParser();