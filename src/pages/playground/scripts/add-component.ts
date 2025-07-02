#!/usr/bin/env node

/**
 * Dashboard Component Addition Script
 * Adds new components to the dashboard configuration
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface ComponentPosition {
  col: number;
  row: number;
  span: number;
  rowSpan?: number;
}

interface AddComponentOptions {
  type: string;
  position: ComponentPosition;
  props: Record<string, any>;
  id?: string;
  className?: string;
  style?: Record<string, any>;
}

const CONFIG_PATH = path.join(__dirname, '../config.yaml');
const BACKUP_DIR = path.join(__dirname, '../.backups');

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
  const backupPath = path.join(BACKUP_DIR, `config_backup_${timestamp}.yaml`);
  
  const configContent = await fs.readFile(CONFIG_PATH, 'utf-8');
  await fs.writeFile(backupPath, configContent);
  
  console.log(`✅ Config backed up to: config_backup_${timestamp}.yaml`);
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
 * Generate unique component ID
 */
function generateComponentId(type: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${type.toLowerCase()}-${timestamp}-${random}`;
}

/**
 * Validate component position
 */
function validatePosition(position: ComponentPosition, maxColumns: number = 12): boolean {
  if (position.col < 1 || position.col > maxColumns) {
    console.error(`❌ Column must be between 1 and ${maxColumns}`);
    return false;
  }
  
  if (position.row < 1) {
    console.error('❌ Row must be >= 1');
    return false;
  }
  
  if (position.span < 1 || position.span > maxColumns) {
    console.error(`❌ Span must be between 1 and ${maxColumns}`);
    return false;
  }
  
  if (position.col + position.span - 1 > maxColumns) {
    console.error(`❌ Component extends beyond grid (col ${position.col} + span ${position.span} > ${maxColumns})`);
    return false;
  }
  
  return true;
}

/**
 * Check for position conflicts with existing components
 */
function checkPositionConflicts(newPosition: ComponentPosition, existingComponents: any[]): boolean {
  const newStartCol = newPosition.col;
  const newEndCol = newPosition.col + newPosition.span - 1;
  const newRow = newPosition.row;
  const newRowSpan = newPosition.rowSpan || 1;
  const newEndRow = newRow + newRowSpan - 1;
  
  for (const component of existingComponents) {
    const pos = component.position;
    const existingStartCol = pos.col;
    const existingEndCol = pos.col + pos.span - 1;
    const existingRow = pos.row;
    const existingRowSpan = pos.rowSpan || 1;
    const existingEndRow = existingRow + existingRowSpan - 1;
    
    // Check for overlap
    const colOverlap = !(newEndCol < existingStartCol || newStartCol > existingEndCol);
    const rowOverlap = !(newEndRow < existingRow || newRow > existingEndRow);
    
    if (colOverlap && rowOverlap) {
      console.error(`❌ Position conflict with component "${component.id}" at row ${existingRow}, col ${existingStartCol}`);
      return true;
    }
  }
  
  return false;
}

/**
 * Add component to dashboard
 */
export async function addComponent(options: AddComponentOptions): Promise<string> {
  try {
    // Backup current config
    await backupConfig();
    
    // Load current configuration
    const config = await loadConfig();
    
    // Validate position
    const maxColumns = config.layout?.columns || 12;
    if (!validatePosition(options.position, maxColumns)) {
      throw new Error('Invalid position specified');
    }
    
    // Check for conflicts
    if (checkPositionConflicts(options.position, config.components || [])) {
      throw new Error('Position conflicts with existing component');
    }
    
    // Generate component
    const componentId = options.id || generateComponentId(options.type);
    const newComponent = {
      id: componentId,
      type: options.type,
      position: options.position,
      props: options.props,
      ...(options.className && { className: options.className }),
      ...(options.style && { style: options.style })
    };
    
    // Add to configuration
    if (!config.components) {
      config.components = [];
    }
    
    config.components.push(newComponent);
    
    // Save configuration
    await saveConfig(config);
    
    console.log(`✅ Added component "${componentId}" of type "${options.type}"`);
    console.log(`   Position: Row ${options.position.row}, Col ${options.position.col}, Span ${options.position.span}`);
    
    return componentId;
  } catch (error) {
    console.error('❌ Failed to add component:', error);
    throw error;
  }
}

/**
 * List available component positions
 */
export async function listAvailablePositions(): Promise<void> {
  try {
    const config = await loadConfig();
    const maxColumns = config.layout?.columns || 12;
    const components = config.components || [];
    
    console.log('📍 Current component positions:');
    console.log('================================');
    
    for (const component of components) {
      const pos = component.position;
      console.log(`${component.id} (${component.type}): Row ${pos.row}, Col ${pos.col}-${pos.col + pos.span - 1}`);
    }
    
    console.log('\n💡 Tips:');
    console.log(`- Grid has ${maxColumns} columns`);
    console.log('- Use row numbers that don\'t conflict with existing components');
    console.log('- Make sure col + span <= ' + maxColumns);
  } catch (error) {
    console.error('❌ Error listing positions:', error);
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Dashboard Component Addition Script');
    console.log('');
    console.log('Usage: node add-component.ts <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  add <type> <row> <col> <span> [props-json]  Add a component');
    console.log('  list                                         List current positions');
    console.log('');
    console.log('Examples:');
    console.log('  node add-component.ts add WelcomeHeader 1 1 12 \'{"title":"Hello","subtitle":"World"}\'');
    console.log('  node add-component.ts add KPICards 2 1 6 \'{"metrics":[]}\'');
    console.log('  node add-component.ts list');
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'add':
      if (args.length < 5) {
        console.error('❌ Usage: add <type> <row> <col> <span> [props-json]');
        process.exit(1);
      }
      
      const [, type, rowStr, colStr, spanStr, propsJson] = args;
      const row = parseInt(rowStr);
      const col = parseInt(colStr);
      const span = parseInt(spanStr);
      
      if (isNaN(row) || isNaN(col) || isNaN(span)) {
        console.error('❌ Row, col, and span must be numbers');
        process.exit(1);
      }
      
      let props = {};
      if (propsJson) {
        try {
          props = JSON.parse(propsJson);
        } catch (error) {
          console.error('❌ Invalid props JSON:', error);
          process.exit(1);
        }
      }
      
      await addComponent({
        type,
        position: { row, col, span },
        props
      });
      break;
      
    case 'list':
      await listAvailablePositions();
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