#!/usr/bin/env node

/**
 * Dashboard Theme Modification Script
 * Updates theme colors, typography, and spacing in dashboard configuration
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface ThemeColors {
  primary?: string;
  secondary?: string;
  background?: string;
  surface?: string;
  text?: string;
  textSecondary?: string;
}

interface ThemeSpacing {
  base?: number;
  small?: number;
  large?: number;
}

interface ThemeTypography {
  fontFamily?: string;
  fontSize?: string;
  lineHeight?: number;
}

interface ThemeUpdate {
  colors?: ThemeColors;
  spacing?: ThemeSpacing;
  typography?: ThemeTypography;
}

const CONFIG_PATH = path.join(__dirname, '../config.yaml');
const BACKUP_DIR = path.join(__dirname, '../.backups');

/**
 * Validate hex color
 */
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validate CSS color (hex, rgb, named colors, etc.)
 */
function isValidCSSColor(color: string): boolean {
  // Hex colors
  if (isValidHexColor(color)) return true;
  
  // RGB/RGBA
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/i.test(color)) return true;
  
  // HSL/HSLA
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/i.test(color)) return true;
  
  // Named colors (basic validation)
  const namedColors = ['red', 'blue', 'green', 'white', 'black', 'gray', 'orange', 'yellow', 'purple'];
  if (namedColors.includes(color.toLowerCase())) return true;
  
  return false;
}

/**
 * Ensure backup directory exists
 */
async function ensureBackupDir(): Promise<void> {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

/**
 * Create backup of current configuration
 */
async function backupConfig(): Promise<string> {
  await ensureBackupDir();
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `config_theme_backup_${timestamp}.yaml`);
  
  const configContent = await fs.readFile(CONFIG_PATH, 'utf-8');
  await fs.writeFile(backupPath, configContent);
  
  console.log(`✅ Config backed up to: config_theme_backup_${timestamp}.yaml`);
  return backupPath;
}

/**
 * Load and parse dashboard configuration
 */
async function loadConfig(): Promise<any> {
  try {
    const configContent = await fs.readFile(CONFIG_PATH, 'utf-8');
    return yaml.load(configContent);
  } catch (error) {
    console.error('❌ Error loading config:', error);
    throw error;
  }
}

/**
 * Save configuration to file
 */
async function saveConfig(config: any): Promise<void> {
  try {
    const yamlContent = yaml.dump(config, {
      indent: 2,
      lineWidth: 100,
      noRefs: true
    });
    await fs.writeFile(CONFIG_PATH, yamlContent);
    console.log('✅ Configuration saved successfully');
  } catch (error) {
    console.error('❌ Error saving config:', error);
    throw error;
  }
}

/**
 * Validate theme update
 */
function validateThemeUpdate(themeUpdate: ThemeUpdate): string[] {
  const errors: string[] = [];
  
  // Validate colors
  if (themeUpdate.colors) {
    for (const [colorName, colorValue] of Object.entries(themeUpdate.colors)) {
      if (colorValue && !isValidCSSColor(colorValue)) {
        errors.push(`Invalid color value for ${colorName}: ${colorValue}`);
      }
    }
  }
  
  // Validate spacing
  if (themeUpdate.spacing) {
    for (const [spacingName, spacingValue] of Object.entries(themeUpdate.spacing)) {
      if (typeof spacingValue === 'number' && (spacingValue < 0 || spacingValue > 100)) {
        errors.push(`Invalid spacing value for ${spacingName}: ${spacingValue} (must be 0-100)`);
      }
    }
  }
  
  // Validate typography
  if (themeUpdate.typography) {
    if (themeUpdate.typography.lineHeight && 
        (themeUpdate.typography.lineHeight < 0.5 || themeUpdate.typography.lineHeight > 3)) {
      errors.push(`Invalid line height: ${themeUpdate.typography.lineHeight} (must be 0.5-3)`);
    }
  }
  
  return errors;
}

/**
 * Update dashboard theme
 */
export async function changeTheme(themeUpdate: ThemeUpdate): Promise<void> {
  try {
    // Validate theme update
    const validationErrors = validateThemeUpdate(themeUpdate);
    if (validationErrors.length > 0) {
      throw new Error(`Theme validation failed:\n${validationErrors.join('\n')}`);
    }
    
    // Backup current config
    await backupConfig();
    
    // Load current configuration
    const config = await loadConfig();
    
    // Ensure theme object exists
    if (!config.theme) {
      config.theme = {};
    }
    
    // Update colors
    if (themeUpdate.colors) {
      if (!config.theme.colors) config.theme.colors = {};
      Object.assign(config.theme.colors, themeUpdate.colors);
      console.log('✅ Updated theme colors:', themeUpdate.colors);
    }
    
    // Update spacing
    if (themeUpdate.spacing) {
      if (!config.theme.spacing) config.theme.spacing = {};
      Object.assign(config.theme.spacing, themeUpdate.spacing);
      console.log('✅ Updated theme spacing:', themeUpdate.spacing);
    }
    
    // Update typography
    if (themeUpdate.typography) {
      if (!config.theme.typography) config.theme.typography = {};
      Object.assign(config.theme.typography, themeUpdate.typography);
      console.log('✅ Updated theme typography:', themeUpdate.typography);
    }
    
    // Save configuration
    await saveConfig(config);
    
    console.log('🎨 Theme update complete!');
  } catch (error) {
    console.error('❌ Failed to update theme:', error);
    throw error;
  }
}

/**
 * Get current theme
 */
export async function getCurrentTheme(): Promise<any> {
  try {
    const config = await loadConfig();
    return config.theme || {};
  } catch (error) {
    console.error('❌ Error getting current theme:', error);
    throw error;
  }
}

/**
 * Reset theme to defaults
 */
export async function resetTheme(): Promise<void> {
  const defaultTheme = {
    colors: {
      primary: "#f97316",
      secondary: "#ea580c",
      background: "#f3f4f6",
      surface: "#ffffff",
      text: "#111827",
      textSecondary: "#6b7280"
    },
    spacing: {
      base: 4,
      small: 2,
      large: 8
    },
    typography: {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "16px",
      lineHeight: 1.5
    }
  };
  
  await changeTheme(defaultTheme);
  console.log('🔄 Theme reset to defaults');
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Dashboard Theme Modification Script');
    console.log('');
    console.log('Usage: node change-theme.ts <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  color <name> <value>     Update a color');
    console.log('  spacing <name> <value>   Update spacing');
    console.log('  font <property> <value>  Update typography');
    console.log('  current                  Show current theme');
    console.log('  reset                    Reset to default theme');
    console.log('');
    console.log('Examples:');
    console.log('  node change-theme.ts color primary "#3b82f6"');
    console.log('  node change-theme.ts spacing base 6');
    console.log('  node change-theme.ts font fontFamily "Roboto, sans-serif"');
    console.log('  node change-theme.ts current');
    console.log('  node change-theme.ts reset');
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'color':
      if (args.length < 3) {
        console.error('❌ Usage: color <name> <value>');
        process.exit(1);
      }
      
      const [, colorName, colorValue] = args;
      await changeTheme({
        colors: { [colorName]: colorValue }
      });
      break;
      
    case 'spacing':
      if (args.length < 3) {
        console.error('❌ Usage: spacing <name> <value>');
        process.exit(1);
      }
      
      const [, spacingName, spacingValueStr] = args;
      const spacingValue = parseInt(spacingValueStr);
      
      if (isNaN(spacingValue)) {
        console.error('❌ Spacing value must be a number');
        process.exit(1);
      }
      
      await changeTheme({
        spacing: { [spacingName]: spacingValue }
      });
      break;
      
    case 'font':
      if (args.length < 3) {
        console.error('❌ Usage: font <property> <value>');
        process.exit(1);
      }
      
      const [, fontProperty, fontValue] = args;
      
      // Handle lineHeight as number
      const value = fontProperty === 'lineHeight' ? parseFloat(fontValue) : fontValue;
      
      await changeTheme({
        typography: { [fontProperty]: value }
      });
      break;
      
    case 'current':
      const currentTheme = await getCurrentTheme();
      console.log('🎨 Current theme:');
      console.log(yaml.dump(currentTheme, { indent: 2 }));
      break;
      
    case 'reset':
      await resetTheme();
      break;
      
    default:
      console.error('❌ Unknown command:', command);
      process.exit(1);
  }
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}