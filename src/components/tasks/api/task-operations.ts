import type { 
  Task, 
  TasksResponse, 
  TaskFilter,
  TasksError
} from '../types';
import { 
  TaskEffort,
  TaskComplexity,
  TaskRisk
} from '../types';

// Mock data store for development
const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Implement user authentication',
    description: 'Add login and registration functionality with proper validation',
    status: { id: 'todo', name: 'To Do', color: '#6b7280', position: 0, isDefault: true, isCompleted: false },
    priority: 'high',
    projectId: 'project-1',
    assigneeId: 'user-1',
    createdBy: 'user-1',
    createdAt: '2025-06-29T10:00:00Z',
    updatedAt: '2025-06-29T10:00:00Z',
    dueDate: '2025-07-05T23:59:59Z',
    tags: ['authentication', 'security'],
    estimatedHours: 8,
    position: 0,
    // Enhanced fields
    storyPoints: 5,
    effortLevel: TaskEffort.MODERATE,
    complexity: TaskComplexity.MODERATE,
    riskLevel: TaskRisk.LOW,
    progress: 0,
    customFields: {},
    metadata: {},
    dependencies: [],
    timeEntries: [],
    attachments: [],
    comments: []
  },
  {
    id: 'task-2',
    title: 'Design database schema',
    description: 'Create comprehensive database design for the application',
    status: { id: 'in_progress', name: 'In Progress', color: '#3b82f6', position: 1, isDefault: false, isCompleted: false },
    priority: 'medium',
    projectId: 'project-1',
    assigneeId: 'user-2',
    createdBy: 'user-1',
    createdAt: '2025-06-28T14:30:00Z',
    updatedAt: '2025-06-30T09:15:00Z',
    dueDate: '2025-07-03T17:00:00Z',
    tags: ['database', 'design'],
    estimatedHours: 12,
    actualHours: 6,
    position: 0,
    // Enhanced fields
    storyPoints: 8,
    effortLevel: TaskEffort.HEAVY,
    complexity: TaskComplexity.COMPLEX,
    riskLevel: TaskRisk.MEDIUM,
    progress: 50,
    customFields: {},
    metadata: {},
    dependencies: [],
    timeEntries: [],
    attachments: [],
    comments: []
  },
  {
    id: 'task-3',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment pipeline',
    status: { id: 'review', name: 'Review', color: '#f59e0b', position: 2, isDefault: false, isCompleted: false },
    priority: 'medium',
    projectId: 'project-1',
    assigneeId: 'user-3',
    createdBy: 'user-2',
    createdAt: '2025-06-27T16:45:00Z',
    updatedAt: '2025-06-30T11:30:00Z',
    dueDate: '2025-07-01T12:00:00Z',
    tags: ['devops', 'automation'],
    estimatedHours: 6,
    actualHours: 5,
    position: 0,
    // Enhanced fields
    storyPoints: 3,
    effortLevel: 'moderate' as any,
    complexity: 'moderate' as any,
    riskLevel: TaskRisk.HIGH,
    progress: 85,
    customFields: {},
    metadata: {},
    dependencies: [],
    timeEntries: [],
    attachments: [],
    comments: []
  },
  {
    id: 'task-4',
    title: 'Write API documentation',
    description: 'Complete documentation for all API endpoints',
    status: { id: 'completed', name: 'Completed', color: '#10b981', position: 3, isDefault: false, isCompleted: true },
    priority: 'low',
    projectId: 'project-2',
    assigneeId: 'user-1',
    createdBy: 'user-2',
    createdAt: '2025-06-25T09:00:00Z',
    updatedAt: '2025-06-29T16:20:00Z',
    completedAt: '2025-06-29T16:20:00Z',
    dueDate: '2025-06-30T17:00:00Z',
    tags: ['documentation', 'api'],
    estimatedHours: 4,
    actualHours: 3,
    position: 0,
    // Enhanced fields
    storyPoints: 2,
    effortLevel: TaskEffort.LIGHT,
    complexity: TaskComplexity.SIMPLE,
    riskLevel: 'low' as any,
    progress: 100,
    customFields: {},
    metadata: {},
    dependencies: [],
    timeEntries: [],
    attachments: [],
    comments: []
  }
];

// Simulate API delay
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate unique ID
const generateId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

class TaskOperations {
  private tasks: Task[] = [...mockTasks];

  // List tasks with optional filtering
  async list(filter: TaskFilter = {}): Promise<TasksResponse> {
    await simulateDelay();

    try {
      let filteredTasks = [...this.tasks];

      // Apply filters
      if (filter.projectId) {
        filteredTasks = filteredTasks.filter(task => task.projectId === filter.projectId);
      }
      
      if (filter.assigneeId) {
        filteredTasks = filteredTasks.filter(task => task.assigneeId === filter.assigneeId);
      }
      
      if (filter.status) {
        filteredTasks = filteredTasks.filter(task => task.status.id === filter.status!.id);
      }
      
      if (filter.priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === filter.priority);
      }
      
      if (filter.tags && filter.tags.length > 0) {
        filteredTasks = filteredTasks.filter(task => 
          filter.tags!.some(tag => task.tags?.includes(tag))
        );
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredTasks = filteredTasks.filter(task =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      if (filter.dateRange) {
        const start = new Date(filter.dateRange.start);
        const end = new Date(filter.dateRange.end);
        filteredTasks = filteredTasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= start && dueDate <= end;
        });
      }

      // Sort by creation date (newest first) and then by position
      filteredTasks.sort((a, b) => {
        if (a.status.id !== b.status.id) {
          return a.status.position - b.status.position;
        }
        return (a.position || 0) - (b.position || 0);
      });

      return {
        tasks: filteredTasks,
        total: filteredTasks.length,
        page: 1,
        limit: filteredTasks.length
      };
    } catch (error) {
      throw this.createError('FETCH_FAILED', 'Failed to fetch tasks', error);
    }
  }

  // Get single task by ID
  async get(taskId: string): Promise<Task> {
    await simulateDelay(300);

    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      throw this.createError('TASK_NOT_FOUND', `Task with ID ${taskId} not found`);
    }

    return { ...task };
  }

  // Create new task
  async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    await simulateDelay();

    try {
      // Validate required fields
      if (!taskData.title?.trim()) {
        throw this.createError('VALIDATION_ERROR', 'Task title is required');
      }
      
      if (!taskData.projectId) {
        throw this.createError('VALIDATION_ERROR', 'Project ID is required');
      }

      if (!taskData.status) {
        throw this.createError('VALIDATION_ERROR', 'Task status is required');
      }

      const now = new Date().toISOString();
      const newTask: Task = {
        ...taskData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        position: taskData.position ?? this.getNextPosition(taskData.status.id)
      };

      this.tasks.unshift(newTask);
      
      // Emit event for real-time updates
      this.emitTaskEvent('task-created', { task: newTask });

      return { ...newTask };
    } catch (error) {
      if (error instanceof Error && error.message.includes('VALIDATION_ERROR')) {
        throw error;
      }
      throw this.createError('CREATE_FAILED', 'Failed to create task', error);
    }
  }

  // Update existing task
  async update(taskId: string, updates: Partial<Task>): Promise<Task> {
    await simulateDelay();

    try {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw this.createError('TASK_NOT_FOUND', `Task with ID ${taskId} not found`);
      }

      // Validate updates
      if (updates.title !== undefined && !updates.title.trim()) {
        throw this.createError('VALIDATION_ERROR', 'Task title cannot be empty');
      }

      const currentTask = this.tasks[taskIndex];
      const now = new Date().toISOString();
      
      // Handle status completion
      if (updates.status && updates.status.isCompleted && !currentTask.status.isCompleted) {
        updates.completedAt = now;
      } else if (updates.status && !updates.status.isCompleted && currentTask.status.isCompleted) {
        updates.completedAt = undefined;
      }

      const updatedTask: Task = {
        ...currentTask,
        ...updates,
        id: taskId, // Ensure ID doesn't change
        updatedAt: now
      };

      this.tasks[taskIndex] = updatedTask;
      
      // Emit event for real-time updates
      this.emitTaskEvent('task-updated', { task: updatedTask, changes: updates });

      return { ...updatedTask };
    } catch (error) {
      if (error instanceof Error && (error.message.includes('VALIDATION_ERROR') || error.message.includes('TASK_NOT_FOUND'))) {
        throw error;
      }
      throw this.createError('UPDATE_FAILED', 'Failed to update task', error);
    }
  }

  // Delete task
  async delete(taskId: string): Promise<void> {
    await simulateDelay();

    try {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw this.createError('TASK_NOT_FOUND', `Task with ID ${taskId} not found`);
      }

      this.tasks.splice(taskIndex, 1);
      
      // Emit event for real-time updates
      this.emitTaskEvent('task-deleted', { taskId });
    } catch (error) {
      if (error instanceof Error && error.message.includes('TASK_NOT_FOUND')) {
        throw error;
      }
      throw this.createError('DELETE_FAILED', 'Failed to delete task', error);
    }
  }

  // Move task (for drag and drop)
  async move(taskId: string, newStatusId: string, newPosition: number): Promise<void> {
    await simulateDelay(200);

    try {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw this.createError('TASK_NOT_FOUND', `Task with ID ${taskId} not found`);
      }

      const task = this.tasks[taskIndex];
      const oldStatusId = task.status.id;

      // Update task status and position
      const updatedTask: Task = {
        ...task,
        status: { ...task.status, id: newStatusId },
        position: newPosition,
        updatedAt: new Date().toISOString()
      };

      this.tasks[taskIndex] = updatedTask;

      // Reorder other tasks in the same status
      this.reorderTasksInStatus(newStatusId, taskId, newPosition);

      // Emit event for real-time updates
      this.emitTaskEvent('task-moved', { 
        taskId, 
        oldStatus: oldStatusId, 
        newStatus: newStatusId, 
        newPosition,
        task: updatedTask 
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('TASK_NOT_FOUND')) {
        throw error;
      }
      throw this.createError('MOVE_FAILED', 'Failed to move task', error);
    }
  }

  // Bulk update tasks
  async bulkUpdate(taskIds: string[], updates: Partial<Task>): Promise<Task[]> {
    await simulateDelay();

    try {
      const updatedTasks: Task[] = [];
      const now = new Date().toISOString();

      for (const taskId of taskIds) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          const updatedTask: Task = {
            ...this.tasks[taskIndex],
            ...updates,
            id: taskId,
            updatedAt: now
          };
          
          this.tasks[taskIndex] = updatedTask;
          updatedTasks.push(updatedTask);
        }
      }

      // Emit event for real-time updates
      this.emitTaskEvent('tasks-bulk-updated', { tasks: updatedTasks, changes: updates });

      return updatedTasks;
    } catch (error) {
      throw this.createError('BULK_UPDATE_FAILED', 'Failed to bulk update tasks', error);
    }
  }

  // Private helper methods
  private getNextPosition(statusId: string): number {
    const tasksInStatus = this.tasks.filter(t => t.status.id === statusId);
    if (tasksInStatus.length === 0) return 0;
    
    const maxPosition = Math.max(...tasksInStatus.map(t => t.position || 0));
    return maxPosition + 1;
  }

  private reorderTasksInStatus(statusId: string, movedTaskId: string, newPosition: number): void {
    const tasksInStatus = this.tasks
      .filter(t => t.status.id === statusId && t.id !== movedTaskId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    // Update positions for other tasks
    tasksInStatus.forEach((task, index) => {
      const adjustedIndex = index >= newPosition ? index + 1 : index;
      const taskIndex = this.tasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = {
          ...this.tasks[taskIndex],
          position: adjustedIndex,
          updatedAt: new Date().toISOString()
        };
      }
    });
  }

  private createError(code: string, message: string, originalError?: any): TasksError {
    const error = new Error(message) as TasksError;
    error.code = code;
    error.details = originalError;
    return error;
  }

  private emitTaskEvent(type: string, data: any): void {
    const event = new CustomEvent('task-event', {
      detail: { type, ...data }
    });
    window.dispatchEvent(event);
    
    // Update localStorage for cross-tab synchronization
    localStorage.setItem('tasks_updated', Date.now().toString());
  }
}

// Export singleton instance
export const taskOperations = new TaskOperations();