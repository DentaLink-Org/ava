#!/usr/bin/env node

/**
 * Bulk Update Tasks Script
 * Allows batch updates to multiple tasks with various operations
 * 
 * Usage:
 *   node scripts/bulk-update-tasks.ts --operation=<operation> [options]
 * 
 * Operations:
 *   - status: Update status for multiple tasks
 *   - priority: Update priority for multiple tasks
 *   - assignee: Assign tasks to a team member
 *   - project: Move tasks to a different project
 *   - tags: Add or remove tags from tasks
 *   - due-date: Set due dates for tasks
 *   - complete: Mark tasks as completed
 * 
 * Examples:
 *   node scripts/bulk-update-tasks.ts --operation=status --status=done --filter=project:project-1
 *   node scripts/bulk-update-tasks.ts --operation=priority --priority=high --tasks=task-1,task-2,task-3
 *   node scripts/bulk-update-tasks.ts --operation=assignee --assignee=user-1 --filter=status:todo
 */

import { taskOperations } from '../api/task-operations';
import { projectManagement } from '../api/project-management';
import { teamManagement } from '../api/team-management';
import { statusManagement } from '../api/status-management';
import type { Task, TaskPriority, TaskFilter } from '../types';

interface BulkUpdateOptions {
  operation: 'status' | 'priority' | 'assignee' | 'project' | 'tags' | 'due-date' | 'complete';
  tasks?: string; // Comma-separated task IDs
  filter?: string; // Filter expression (e.g., "project:project-1", "status:todo")
  status?: string;
  priority?: TaskPriority;
  assignee?: string;
  project?: string;
  tags?: string; // Comma-separated tags
  addTags?: boolean; // Whether to add tags (true) or replace (false)
  dueDate?: string; // ISO date string
  dryRun?: boolean; // Preview changes without applying
}

class BulkTaskUpdater {
  private async parseFilter(filterExpression: string): Promise<TaskFilter> {
    const filter: TaskFilter = {};
    
    if (!filterExpression) return filter;
    
    const parts = filterExpression.split(',');
    
    for (const part of parts) {
      const [key, value] = part.split(':');
      
      switch (key.trim()) {
        case 'project':
          filter.projectId = value.trim();
          break;
        case 'status':
          filter.status = value.trim();
          break;
        case 'priority':
          filter.priority = value.trim() as TaskPriority;
          break;
        case 'assignee':
          filter.assigneeId = value.trim();
          break;
        case 'tag':
          filter.tags = filter.tags || [];
          filter.tags.push(value.trim());
          break;
        case 'overdue':
          if (value.trim() === 'true') {
            filter.dateRange = {
              start: '2000-01-01',
              end: new Date().toISOString().split('T')[0]
            };
          }
          break;
      }
    }
    
    return filter;
  }
  
  private async getTasksToUpdate(options: BulkUpdateOptions): Promise<Task[]> {
    if (options.tasks) {
      // Get specific tasks by ID
      const taskIds = options.tasks.split(',').map(id => id.trim());
      const tasks: Task[] = [];
      
      for (const taskId of taskIds) {
        try {
          const task = await taskOperations.get(taskId);
          tasks.push(task);
        } catch (error) {
          console.warn(`⚠️  Task ${taskId} not found, skipping...`);
        }
      }
      
      return tasks;
    } else if (options.filter) {
      // Get tasks by filter
      const filter = await this.parseFilter(options.filter);
      const response = await taskOperations.list(filter);
      return response.tasks;
    } else {
      throw new Error('Either --tasks or --filter must be specified');
    }
  }
  
  private async validateOperation(options: BulkUpdateOptions): Promise<void> {
    switch (options.operation) {
      case 'status':
        if (!options.status) {
          throw new Error('--status is required for status operation');
        }
        // Validate status exists
        try {
          await statusManagement.get(options.status);
        } catch {
          throw new Error(`Status '${options.status}' not found`);
        }
        break;
        
      case 'priority':
        if (!options.priority) {
          throw new Error('--priority is required for priority operation');
        }
        const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(options.priority)) {
          throw new Error(`Priority must be one of: ${validPriorities.join(', ')}`);
        }
        break;
        
      case 'assignee':
        if (options.assignee) {
          // Validate assignee exists
          try {
            await teamManagement.get(options.assignee);
          } catch {
            throw new Error(`Team member '${options.assignee}' not found`);
          }
        }
        break;
        
      case 'project':
        if (!options.project) {
          throw new Error('--project is required for project operation');
        }
        // Validate project exists
        try {
          await projectManagement.get(options.project);
        } catch {
          throw new Error(`Project '${options.project}' not found`);
        }
        break;
        
      case 'tags':
        if (!options.tags) {
          throw new Error('--tags is required for tags operation');
        }
        break;
        
      case 'due-date':
        if (!options.dueDate) {
          throw new Error('--due-date is required for due-date operation');
        }
        // Validate date format
        if (isNaN(Date.parse(options.dueDate))) {
          throw new Error('--due-date must be a valid ISO date string (YYYY-MM-DD)');
        }
        break;
        
      case 'complete':
        // No additional validation needed
        break;
        
      default:
        throw new Error(`Unknown operation: ${options.operation}`);
    }
  }
  
  private generateUpdates(options: BulkUpdateOptions): Partial<Task> {
    const updates: Partial<Task> = {};
    
    switch (options.operation) {
      case 'status':
        // Status would need to be resolved to full status object
        // For now, we'll pass the ID and let the API handle it
        break;
        
      case 'priority':
        updates.priority = options.priority!;
        break;
        
      case 'assignee':
        updates.assigneeId = options.assignee || undefined;
        break;
        
      case 'project':
        updates.projectId = options.project!;
        break;
        
      case 'tags':
        const newTags = options.tags!.split(',').map(t => t.trim());
        updates.tags = newTags;
        break;
        
      case 'due-date':
        updates.dueDate = options.dueDate!;
        break;
        
      case 'complete':
        // This would need to be handled specially
        break;
    }
    
    return updates;
  }
  
  async execute(options: BulkUpdateOptions): Promise<void> {
    try {
      console.log('🔄 Starting bulk task update...\n');
      
      // Validate operation
      await this.validateOperation(options);
      
      // Get tasks to update
      const tasks = await this.getTasksToUpdate(options);
      
      if (tasks.length === 0) {
        console.log('ℹ️  No tasks found matching the criteria.');
        return;
      }
      
      console.log(`📋 Found ${tasks.length} task(s) to update:`);
      tasks.forEach(task => {
        console.log(`   • ${task.title} (${task.id})`);
      });
      console.log();
      
      // Generate updates
      const updates = this.generateUpdates(options);
      
      // Show what changes will be made
      console.log('🔧 Changes to apply:');
      Object.entries(updates).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      console.log();
      
      if (options.dryRun) {
        console.log('🔍 Dry run mode - no changes will be applied.');
        return;
      }
      
      // Apply updates
      console.log('⚡ Applying updates...');
      
      const taskIds = tasks.map(t => t.id);
      let updatedTasks: Task[] = [];
      
      if (options.operation === 'status') {
        // Handle status updates individually due to API design
        for (const task of tasks) {
          try {
            const updatedTask = await taskOperations.update(task.id, { 
              status: { ...task.status, id: options.status! }
            });
            updatedTasks.push(updatedTask);
            console.log(`   ✅ Updated ${task.title}`);
          } catch (error) {
            console.log(`   ❌ Failed to update ${task.title}: ${error}`);
          }
        }
      } else if (options.operation === 'complete') {
        // Handle completion individually
        for (const task of tasks) {
          try {
            const completedStatus = { ...task.status, isCompleted: true };
            const updatedTask = await taskOperations.update(task.id, { 
              status: completedStatus,
              completedAt: new Date().toISOString()
            });
            updatedTasks.push(updatedTask);
            console.log(`   ✅ Completed ${task.title}`);
          } catch (error) {
            console.log(`   ❌ Failed to complete ${task.title}: ${error}`);
          }
        }
      } else {
        // Use bulk update for other operations
        try {
          updatedTasks = await taskOperations.bulkUpdate(taskIds, updates);
          updatedTasks.forEach(task => {
            console.log(`   ✅ Updated ${task.title}`);
          });
        } catch (error) {
          console.log(`   ❌ Bulk update failed: ${error}`);
          return;
        }
      }
      
      console.log(`\n🎉 Successfully updated ${updatedTasks.length} task(s)!`);
      
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }
}

// Parse command line arguments
function parseArgs(): BulkUpdateOptions {
  const args = process.argv.slice(2);
  const options: Partial<BulkUpdateOptions> = {};
  
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      
      switch (key) {
        case 'operation':
          options.operation = value as any;
          break;
        case 'tasks':
          options.tasks = value;
          break;
        case 'filter':
          options.filter = value;
          break;
        case 'status':
          options.status = value;
          break;
        case 'priority':
          options.priority = value as TaskPriority;
          break;
        case 'assignee':
          options.assignee = value;
          break;
        case 'project':
          options.project = value;
          break;
        case 'tags':
          options.tags = value;
          break;
        case 'add-tags':
          options.addTags = value === 'true';
          break;
        case 'due-date':
          options.dueDate = value;
          break;
        case 'dry-run':
          options.dryRun = value !== 'false';
          break;
      }
    }
  }
  
  if (!options.operation) {
    throw new Error('--operation is required');
  }
  
  return options as BulkUpdateOptions;
}

// Main execution
if (require.main === module) {
  const updater = new BulkTaskUpdater();
  const options = parseArgs();
  
  updater.execute(options).catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { BulkTaskUpdater };