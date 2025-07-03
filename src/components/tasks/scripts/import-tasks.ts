#!/usr/bin/env node

/**
 * Import Tasks Script
 * Imports tasks from various file formats (CSV, JSON, YAML) with validation and conflict resolution
 * 
 * Usage:
 *   node scripts/import-tasks.ts --file=<file_path> --project=<project_id> [options]
 * 
 * Options:
 *   --file, -f <PATH>           Input file path (required)
 *   --project, -p <ID>          Target project ID (required)
 *   --format <FORMAT>           File format: auto, csv, json, yaml (default: auto)
 *   --mode <MODE>               Import mode: create, update, upsert (default: create)
 *   --mapping <FILE>            Column mapping file for CSV imports
 *   --dry-run                   Preview import without making changes
 *   --batch-size <NUM>          Process tasks in batches (default: 50)
 *   --skip-errors               Continue processing when individual tasks fail
 *   --default-status <STATUS>   Default status for imported tasks (default: todo)
 *   --default-priority <PRIORITY> Default priority for imported tasks (default: medium)
 *   --assignee <USER_ID>        Default assignee for imported tasks
 *   --verbose, -v               Verbose output
 * 
 * File Formats:
 *   CSV: title,description,priority,assignee,due_date,tags
 *   JSON: [{"title": "...", "description": "...", ...}]
 *   YAML: - title: "..." description: "..." ...
 * 
 * Examples:
 *   node scripts/import-tasks.ts -f tasks.csv -p project-1
 *   node scripts/import-tasks.ts -f tasks.json -p project-1 --mode=upsert --dry-run
 *   node scripts/import-tasks.ts -f tasks.yaml -p project-1 --default-assignee=user-1
 */

import * as fs from 'fs';
import * as path from 'path';
import { taskOperations } from '../api/task-operations';
import { projectManagement } from '../api/project-management';
import { teamManagement } from '../api/team-management';
import { statusManagement } from '../api/status-management';
import type { Task, TaskPriority, TaskStatus, TeamMember } from '../types';

interface ImportOptions {
  file: string;
  project: string;
  format: 'auto' | 'csv' | 'json' | 'yaml';
  mode: 'create' | 'update' | 'upsert';
  mapping?: string;
  dryRun?: boolean;
  batchSize: number;
  skipErrors?: boolean;
  defaultStatus: string;
  defaultPriority: TaskPriority;
  assignee?: string;
  verbose?: boolean;
}

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: Array<{ row: number; task: any; error: string }>;
}

interface TaskImportData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  status?: string;
  id?: string; // For update mode
}

class TaskImporter {
  private project: any = null;
  private teamMembers: TeamMember[] = [];
  private statuses: TaskStatus[] = [];
  
  private async initialize(options: ImportOptions): Promise<void> {
    console.log('🔄 Initializing import process...\n');
    
    // Validate and load project
    try {
      this.project = await projectManagement.get(options.project);
      console.log(`📁 Target project: ${this.project.name} (${this.project.id})`);
    } catch (error) {
      throw new Error(`Project '${options.project}' not found`);
    }
    
    // Load team members
    const teamResponse = await teamManagement.list();
    this.teamMembers = teamResponse.members;
    console.log(`👥 Loaded ${this.teamMembers.length} team members`);
    
    // Load statuses
    const statusResponse = await statusManagement.list();
    this.statuses = statusResponse.statuses;
    console.log(`📊 Loaded ${this.statuses.length} task statuses`);
    
    // Validate default assignee if provided
    if (options.assignee) {
      const assignee = this.teamMembers.find(m => m.id === options.assignee);
      if (!assignee) {
        throw new Error(`Default assignee '${options.assignee}' not found`);
      }
      console.log(`👤 Default assignee: ${assignee.name}`);
    }
    
    // Validate default status
    const defaultStatus = this.statuses.find(s => s.id === options.defaultStatus);
    if (!defaultStatus) {
      throw new Error(`Default status '${options.defaultStatus}' not found`);
    }
    console.log(`🏷️  Default status: ${defaultStatus.name}`);
    
    console.log();
  }
  
  private detectFormat(filePath: string): 'csv' | 'json' | 'yaml' {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.csv': return 'csv';
      case '.json': return 'json';
      case '.yaml':
      case '.yml': return 'yaml';
      default: 
        // Try to detect from content
        const content = fs.readFileSync(filePath, 'utf-8').trim();
        if (content.startsWith('[') || content.startsWith('{')) {
          return 'json';
        } else if (content.includes(',') && content.includes('\n')) {
          return 'csv';
        } else {
          return 'yaml';
        }
    }
  }
  
  private parseCSV(content: string, mapping?: any): TaskImportData[] {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const tasks: TaskImportData[] = [];
    
    // Default column mapping
    const defaultMapping = {
      title: ['title', 'name', 'task', 'task_name'],
      description: ['description', 'desc', 'details', 'notes'],
      priority: ['priority', 'pri', 'importance'],
      assignee: ['assignee', 'assigned_to', 'owner', 'user'],
      dueDate: ['due_date', 'due', 'deadline', 'date'],
      tags: ['tags', 'labels', 'categories'],
      status: ['status', 'state', 'stage'],
      id: ['id', 'task_id', 'identifier']
    };
    
    const columnMapping = mapping || this.createColumnMapping(headers, defaultMapping);
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length !== headers.length) {
        console.warn(`⚠️  Row ${i + 1}: Column count mismatch, skipping...`);
        continue;
      }
      
      const task: TaskImportData = {
        title: ''
      };
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim();
        if (!value) return;
        
        const field = this.findMappedField(header, columnMapping);
        if (field) {
          switch (field) {
            case 'title':
            case 'description':
            case 'assignee':
            case 'status':
            case 'id':
              task[field] = value;
              break;
            case 'priority':
              if (['low', 'medium', 'high', 'urgent'].includes(value.toLowerCase())) {
                task.priority = value.toLowerCase() as TaskPriority;
              }
              break;
            case 'dueDate':
              if (this.isValidDate(value)) {
                task.dueDate = new Date(value).toISOString();
              }
              break;
            case 'tags':
              task.tags = value.split(';').map(t => t.trim()).filter(t => t);
              break;
          }
        }
      });
      
      if (task.title) {
        tasks.push(task);
      } else {
        console.warn(`⚠️  Row ${i + 1}: Missing title, skipping...`);
      }
    }
    
    return tasks;
  }
  
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current);
    return values.map(v => v.replace(/^"|"$/g, ''));
  }
  
  private parseJSON(content: string): TaskImportData[] {
    try {
      const data = JSON.parse(content);
      
      if (!Array.isArray(data)) {
        throw new Error('JSON file must contain an array of tasks');
      }
      
      return data.map((item, index) => {
        if (typeof item !== 'object' || !item.title) {
          throw new Error(`Item ${index + 1}: Missing required 'title' field`);
        }
        
        const task: TaskImportData = {
          title: item.title,
          description: item.description,
          priority: item.priority,
          assignee: item.assignee || item.assigneeId,
          dueDate: item.dueDate ? new Date(item.dueDate).toISOString() : undefined,
          tags: Array.isArray(item.tags) ? item.tags : item.tags?.split(','),
          status: item.status,
          id: item.id
        };
        
        return task;
      });
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private parseYAML(content: string): TaskImportData[] {
    // Simple YAML parser for task arrays
    // In production, you'd use a proper YAML library like 'js-yaml'
    try {
      const lines = content.split('\n');
      const tasks: TaskImportData[] = [];
      let currentTask: any = {};
      let isInTask = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('- ') || (trimmed.startsWith('-') && trimmed.includes(':'))) {
          // Start of new task
          if (isInTask && currentTask.title) {
            tasks.push(currentTask);
          }
          currentTask = {};
          isInTask = true;
          
          // Parse inline properties
          const content = trimmed.substring(1).trim();
          if (content.includes(':')) {
            const [key, value] = content.split(':').map(s => s.trim());
            currentTask[key] = this.parseYAMLValue(value);
          }
        } else if (trimmed.includes(':') && isInTask) {
          // Property of current task
          const [key, value] = trimmed.split(':').map(s => s.trim());
          currentTask[key] = this.parseYAMLValue(value);
        }
      }
      
      // Add last task
      if (isInTask && currentTask.title) {
        tasks.push(currentTask);
      }
      
      return tasks.map(task => ({
        title: task.title || '',
        description: task.description,
        priority: task.priority,
        assignee: task.assignee,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
        tags: Array.isArray(task.tags) ? task.tags : task.tags?.split(','),
        status: task.status,
        id: task.id
      }));
    } catch (error) {
      throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private parseYAMLValue(value: string): any {
    if (!value || value === '""' || value === "''") return undefined;
    
    // Remove quotes
    const cleaned = value.replace(/^["']|["']$/g, '');
    
    // Try to parse as different types
    if (cleaned === 'true') return true;
    if (cleaned === 'false') return false;
    if (/^\d+$/.test(cleaned)) return parseInt(cleaned);
    if (/^\d+\.\d+$/.test(cleaned)) return parseFloat(cleaned);
    
    return cleaned;
  }
  
  private createColumnMapping(headers: string[], defaultMapping: any): any {
    const mapping: any = {};
    
    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      for (const [field, variants] of Object.entries(defaultMapping)) {
        const variantArray = variants as string[];
        if (variantArray.some(variant => 
          normalizedHeader.includes(variant) || variant.includes(normalizedHeader)
        )) {
          mapping[header] = field;
          break;
        }
      }
    });
    
    return mapping;
  }
  
  private findMappedField(header: string, mapping: any): string | null {
    return mapping[header] || null;
  }
  
  private isValidDate(dateString: string): boolean {
    return !isNaN(Date.parse(dateString));
  }
  
  private async validateTask(taskData: TaskImportData, options: ImportOptions): Promise<string[]> {
    const errors: string[] = [];
    
    // Validate title
    if (!taskData.title?.trim()) {
      errors.push('Title is required');
    }
    
    // Validate priority
    if (taskData.priority) {
      const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(taskData.priority)) {
        errors.push(`Invalid priority: ${taskData.priority}`);
      }
    }
    
    // Validate assignee
    if (taskData.assignee) {
      const assignee = this.teamMembers.find(m => 
        m.id === taskData.assignee || 
        m.email === taskData.assignee ||
        m.name === taskData.assignee
      );
      if (!assignee) {
        errors.push(`Assignee not found: ${taskData.assignee}`);
      }
    }
    
    // Validate status
    if (taskData.status) {
      const status = this.statuses.find(s => s.id === taskData.status || s.name === taskData.status);
      if (!status) {
        errors.push(`Status not found: ${taskData.status}`);
      }
    }
    
    // Validate due date
    if (taskData.dueDate && !this.isValidDate(taskData.dueDate)) {
      errors.push(`Invalid due date: ${taskData.dueDate}`);
    }
    
    return errors;
  }
  
  private createTaskFromImportData(taskData: TaskImportData, options: ImportOptions): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
    // Find assignee
    let assigneeId = options.assignee;
    if (taskData.assignee) {
      const assignee = this.teamMembers.find(m => 
        m.id === taskData.assignee || 
        m.email === taskData.assignee ||
        m.name === taskData.assignee
      );
      if (assignee) assigneeId = assignee.id;
    }
    
    // Find status
    let status = this.statuses.find(s => s.id === options.defaultStatus)!;
    if (taskData.status) {
      const foundStatus = this.statuses.find(s => s.id === taskData.status || s.name === taskData.status);
      if (foundStatus) status = foundStatus;
    }
    
    return {
      title: taskData.title.trim(),
      description: taskData.description?.trim(),
      status,
      priority: taskData.priority || options.defaultPriority,
      projectId: options.project,
      assigneeId,
      createdBy: 'import-script',
      dueDate: taskData.dueDate,
      tags: taskData.tags,
      position: 0
    };
  }
  
  async execute(options: ImportOptions): Promise<ImportResult> {
    const result: ImportResult = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
    
    try {
      // Initialize
      await this.initialize(options);
      
      // Read and parse file
      console.log(`📂 Reading file: ${options.file}`);
      
      if (!fs.existsSync(options.file)) {
        throw new Error(`File not found: ${options.file}`);
      }
      
      const content = fs.readFileSync(options.file, 'utf-8');
      const format = options.format === 'auto' ? this.detectFormat(options.file) : options.format;
      
      console.log(`📄 Detected format: ${format.toUpperCase()}`);
      
      let tasks: TaskImportData[] = [];
      
      switch (format) {
        case 'csv':
          tasks = this.parseCSV(content);
          break;
        case 'json':
          tasks = this.parseJSON(content);
          break;
        case 'yaml':
          tasks = this.parseYAML(content);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      result.total = tasks.length;
      console.log(`📋 Found ${tasks.length} tasks to import\n`);
      
      if (options.dryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be made\n');
      }
      
      // Process tasks in batches
      for (let i = 0; i < tasks.length; i += options.batchSize) {
        const batch = tasks.slice(i, i + options.batchSize);
        console.log(`📦 Processing batch ${Math.floor(i / options.batchSize) + 1}/${Math.ceil(tasks.length / options.batchSize)} (${batch.length} tasks)`);
        
        for (let j = 0; j < batch.length; j++) {
          const taskData = batch[j];
          const rowNumber = i + j + 1;
          
          try {
            // Validate task
            const validationErrors = await this.validateTask(taskData, options);
            if (validationErrors.length > 0) {
              result.errors.push({
                row: rowNumber,
                task: taskData,
                error: validationErrors.join(', ')
              });
              result.failed++;
              
              if (options.verbose) {
                console.log(`   ❌ Row ${rowNumber}: ${validationErrors.join(', ')}`);
              }
              
              if (!options.skipErrors) {
                throw new Error(`Validation failed for row ${rowNumber}: ${validationErrors.join(', ')}`);
              }
              continue;
            }
            
            if (!options.dryRun) {
              // Create or update task
              const taskToCreate = this.createTaskFromImportData(taskData, options);
              
              if (options.mode === 'update' && taskData.id) {
                await taskOperations.update(taskData.id, taskToCreate);
              } else if (options.mode === 'upsert' && taskData.id) {
                try {
                  await taskOperations.get(taskData.id);
                  await taskOperations.update(taskData.id, taskToCreate);
                } catch {
                  await taskOperations.create(taskToCreate);
                }
              } else {
                await taskOperations.create(taskToCreate);
              }
            }
            
            result.successful++;
            
            if (options.verbose) {
              console.log(`   ✅ Row ${rowNumber}: ${taskData.title}`);
            }
            
          } catch (error) {
            result.errors.push({
              row: rowNumber,
              task: taskData,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            result.failed++;
            
            if (options.verbose) {
              console.log(`   ❌ Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            
            if (!options.skipErrors) {
              throw error;
            }
          }
        }
      }
      
      // Print summary
      console.log('\n📊 Import Summary:');
      console.log(`   Total tasks: ${result.total}`);
      console.log(`   Successful: ${result.successful}`);
      console.log(`   Failed: ${result.failed}`);
      console.log(`   Skipped: ${result.skipped}`);
      
      if (result.errors.length > 0) {
        console.log('\n❌ Errors:');
        result.errors.forEach(error => {
          console.log(`   Row ${error.row}: ${error.error}`);
        });
      }
      
      if (options.dryRun) {
        console.log('\n🔍 This was a dry run - no actual changes were made');
      } else {
        console.log(`\n🎉 Import completed! ${result.successful} tasks imported to project: ${this.project.name}`);
      }
      
      return result;
      
    } catch (error) {
      console.error('\n❌ Import failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
}

// Parse command line arguments
function parseArgs(): ImportOptions {
  const args = process.argv.slice(2);
  const options: Partial<ImportOptions> = {
    format: 'auto',
    mode: 'create',
    batchSize: 50,
    defaultStatus: 'todo',
    defaultPriority: 'medium'
  };
  
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      
      switch (key) {
        case 'file':
        case 'f':
          options.file = value;
          break;
        case 'project':
        case 'p':
          options.project = value;
          break;
        case 'format':
          options.format = value as any;
          break;
        case 'mode':
          options.mode = value as any;
          break;
        case 'mapping':
          options.mapping = value;
          break;
        case 'dry-run':
          options.dryRun = value !== 'false';
          break;
        case 'batch-size':
          options.batchSize = parseInt(value);
          break;
        case 'skip-errors':
          options.skipErrors = value !== 'false';
          break;
        case 'default-status':
          options.defaultStatus = value;
          break;
        case 'default-priority':
          options.defaultPriority = value as TaskPriority;
          break;
        case 'assignee':
          options.assignee = value;
          break;
        case 'verbose':
        case 'v':
          options.verbose = value !== 'false';
          break;
      }
    }
  }
  
  if (!options.file) {
    throw new Error('--file is required');
  }
  
  if (!options.project) {
    throw new Error('--project is required');
  }
  
  return options as ImportOptions;
}

// Main execution
if (require.main === module) {
  const importer = new TaskImporter();
  const options = parseArgs();
  
  importer.execute(options).catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { TaskImporter };