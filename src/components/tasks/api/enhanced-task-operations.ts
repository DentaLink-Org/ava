import type { 
  Task, 
  TasksResponse, 
  TaskFilter,
  TasksError,
  CreateTaskData,
  UpdateTaskData,
  BulkTaskUpdate,
  TaskBatchResult,
  TaskValidationResult,
  TaskValidationError,
  TaskValidationWarning,
  TaskDependency,
  TaskTimeEntry,
  TaskHistory
} from '../types';

import { 
  TaskEffort,
  TaskComplexity,
  TaskRisk,
  TaskActivityType,
  TASK_CONSTANTS,
  TASK_STATUS_CONSTANTS,
  DependencyType
} from '../types';

/**
 * Enhanced Task Operations API
 * 
 * Provides advanced CRUD operations for tasks with:
 * - Enhanced validation and business logic
 * - Dependency management
 * - Time tracking integration  
 * - History tracking
 * - Real-time updates
 * - Batch operations
 * - Advanced filtering and search
 */

// Enhanced mock data with all new fields
const enhancedMockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Implement advanced authentication system',
    description: 'Develop multi-factor authentication with social login integration and role-based access control',
    status: { id: 'todo', name: 'To Do', color: '#6b7280', position: 0, isDefault: true, isCompleted: false },
    priority: 'high',
    projectId: 'project-1',
    milestoneId: 'milestone-1',
    assigneeId: 'user-1',
    createdBy: 'user-manager',
    createdAt: '2025-07-01T09:00:00Z',
    updatedAt: '2025-07-04T14:30:00Z',
    dueDate: '2025-07-15T17:00:00Z',
    tags: ['authentication', 'security', 'api'],
    estimatedHours: 24,
    actualHours: 0,
    position: 0,
    storyPoints: 13,
    effortLevel: TaskEffort.HEAVY,
    complexity: TaskComplexity.COMPLEX,
    riskLevel: TaskRisk.MEDIUM,
    progress: 0,
    customFields: {
      security_review_required: true,
      external_dependencies: ['oauth2-provider', 'ldap-service'],
      documentation_status: 'pending'
    },
    metadata: {
      created_via: 'api',
      sprint: 'sprint-2025-07',
      epic: 'user-management'
    },
    dependencies: [
      {
        id: 'dep-1',
        taskId: 'task-1',
        dependsOnId: 'task-setup-oauth',
        dependencyType: DependencyType.FINISH_TO_START,
        lagHours: 0,
        isBlocking: true,
        createdAt: '2025-07-01T09:00:00Z',
        createdBy: 'user-manager',
        notes: 'OAuth service must be configured before authentication implementation'
      }
    ],
    timeEntries: [],
    attachments: [],
    comments: []
  },
  {
    id: 'task-2',
    title: 'Database performance optimization',
    description: 'Optimize query performance and implement caching strategies for high-volume operations',
    status: { id: 'in_progress', name: 'In Progress', color: '#3b82f6', position: 1, isDefault: false, isCompleted: false },
    priority: 'medium',
    projectId: 'project-1',
    milestoneId: 'milestone-2',
    assigneeId: 'user-2',
    createdBy: 'user-tech-lead',
    createdAt: '2025-06-28T14:30:00Z',
    updatedAt: '2025-07-04T11:15:00Z',
    dueDate: '2025-07-10T23:59:59Z',
    tags: ['database', 'performance', 'optimization'],
    estimatedHours: 16,
    actualHours: 8,
    position: 0,
    storyPoints: 8,
    effortLevel: TaskEffort.MODERATE,
    complexity: TaskComplexity.COMPLEX,
    riskLevel: TaskRisk.LOW,
    progress: 45,
    customFields: {
      performance_target: '< 100ms response time',
      cache_strategy: 'redis',
      monitoring_setup: true
    },
    metadata: {
      benchmark_baseline: '500ms',
      optimization_approach: 'indexing + caching'
    },
    dependencies: [],
    timeEntries: [
      {
        id: 'time-1',
        taskId: 'task-2',
        userId: 'user-2',
        startTime: '2025-07-04T09:00:00Z',
        endTime: '2025-07-04T13:00:00Z',
        durationMinutes: 240,
        description: 'Database query analysis and index optimization',
        isBillable: true,
        hourlyRate: 75,
        activityType: TaskActivityType.WORK,
        createdAt: '2025-07-04T09:00:00Z',
        updatedAt: '2025-07-04T13:00:00Z',
        metadata: {}
      }
    ],
    attachments: [],
    comments: []
  },
  {
    id: 'task-3',
    title: 'API documentation update',
    description: 'Update OpenAPI specifications and create comprehensive developer guides',
    status: { id: 'completed', name: 'Completed', color: '#10b981', position: 3, isDefault: false, isCompleted: true },
    priority: 'low',
    projectId: 'project-2',
    assigneeId: 'user-3',
    createdBy: 'user-product-manager',
    createdAt: '2025-06-20T10:00:00Z',
    updatedAt: '2025-07-02T16:30:00Z',
    completedAt: '2025-07-02T16:30:00Z',
    dueDate: '2025-07-05T17:00:00Z',
    tags: ['documentation', 'api', 'developer-experience'],
    estimatedHours: 6,
    actualHours: 5,
    position: 0,
    storyPoints: 3,
    effortLevel: TaskEffort.LIGHT,
    complexity: TaskComplexity.SIMPLE,
    riskLevel: TaskRisk.LOW,
    progress: 100,
    customFields: {
      docs_platform: 'gitbook',
      review_required: false,
      stakeholder_approval: true
    },
    metadata: {
      completion_quality: 'high',
      user_feedback_score: 4.8
    },
    dependencies: [],
    timeEntries: [
      {
        id: 'time-2',
        taskId: 'task-3',
        userId: 'user-3',
        startTime: '2025-07-01T14:00:00Z',
        endTime: '2025-07-01T19:00:00Z',
        durationMinutes: 300,
        description: 'OpenAPI specification updates and example creation',
        isBillable: true,
        hourlyRate: 60,
        activityType: TaskActivityType.DOCUMENTATION,
        createdAt: '2025-07-01T14:00:00Z',
        updatedAt: '2025-07-01T19:00:00Z',
        metadata: {}
      }
    ],
    attachments: [],
    comments: []
  }
];

// Simulate API delay
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate unique ID
const generateId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Enhanced Task Operations Class
 * Provides comprehensive task management functionality
 */
class EnhancedTaskOperations {
  private tasks: Task[] = [...enhancedMockTasks];
  private taskHistory: TaskHistory[] = [];

  /**
   * Enhanced task listing with advanced filtering, search, and pagination
   */
  async list(filter: TaskFilter = {}): Promise<TasksResponse> {
    await simulateDelay();

    try {
      let filteredTasks = [...this.tasks];

      // Apply all filter criteria
      filteredTasks = this.applyFilters(filteredTasks, filter);
      
      // Apply search if specified
      if (filter.search) {
        filteredTasks = this.applySearch(filteredTasks, filter.search);
      }

      // Apply sorting
      if (filter.sortBy && filter.sortOrder) {
        filteredTasks = this.applySorting(filteredTasks, filter.sortBy, filter.sortOrder);
      } else {
        // Default sorting by status position and then by task position
        filteredTasks.sort((a, b) => {
          if (a.status.position !== b.status.position) {
            return a.status.position - b.status.position;
          }
          return (a.position || 0) - (b.position || 0);
        });
      }

      // Apply pagination
      const { paginatedTasks, total } = this.applyPagination(filteredTasks, filter);

      return {
        tasks: paginatedTasks,
        total,
        page: Math.floor((filter.offset || 0) / (filter.limit || total)) + 1,
        limit: filter.limit || total
      };
    } catch (error) {
      throw this.createError('FETCH_FAILED', 'Failed to fetch tasks', error);
    }
  }

  /**
   * Get single task by ID with complete data
   */
  async get(taskId: string): Promise<Task> {
    await simulateDelay(300);

    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      throw this.createError('TASK_NOT_FOUND', `Task with ID ${taskId} not found`);
    }

    // Return deep copy with all related data
    return this.serializeTask(task);
  }

  /**
   * Create new task with enhanced validation and business logic
   */
  async create(taskData: CreateTaskData): Promise<Task> {
    await simulateDelay();

    try {
      // Comprehensive validation
      const validation = await this.validateTask(taskData);
      if (!validation.isValid) {
        const errorMessages = validation.errors.map(e => e.message).join(', ');
        throw this.createError('VALIDATION_ERROR', `Validation failed: ${errorMessages}`);
      }

      // Check for dependency cycles
      if (taskData.dependencies && taskData.dependencies.length > 0) {
        await this.validateDependencies(taskData.dependencies);
      }

      const now = new Date().toISOString();
      const taskId = generateId();

      const newTask: Task = {
        ...taskData,
        id: taskId,
        createdAt: now,
        updatedAt: now,
        position: taskData.position ?? this.getNextPosition(taskData.status.id),
        progress: taskData.progress ?? TASK_CONSTANTS.DEFAULT_PROGRESS,
        effortLevel: taskData.effortLevel ?? TASK_CONSTANTS.DEFAULT_EFFORT_LEVEL,
        complexity: taskData.complexity ?? TASK_CONSTANTS.DEFAULT_COMPLEXITY,
        riskLevel: taskData.riskLevel ?? TASK_CONSTANTS.DEFAULT_RISK_LEVEL,
        customFields: taskData.customFields ?? {},
        metadata: taskData.metadata ?? {},
        dependencies: taskData.dependencies ?? [],
        timeEntries: [],
        attachments: [],
        comments: []
      };

      this.tasks.unshift(newTask);
      
      // Create history entry
      await this.createHistoryEntry(taskId, 'task_created', {}, newTask, taskData.createdBy);
      
      // Emit event for real-time updates
      this.emitTaskEvent('task-created', { task: newTask });

      return this.serializeTask(newTask);
    } catch (error) {
      if (error instanceof Error && error.message.includes('VALIDATION_ERROR')) {
        throw error;
      }
      throw this.createError('CREATE_FAILED', 'Failed to create task', error);
    }
  }

  /**
   * Update existing task with conflict resolution and validation
   */
  async update(taskId: string, updates: UpdateTaskData, userId?: string): Promise<Task> {
    await simulateDelay();

    try {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw this.createError('TASK_NOT_FOUND', `Task with ID ${taskId} not found`);
      }

      const currentTask = this.tasks[taskIndex];
      
      // Validate updates
      const validation = await this.validateTaskUpdate(currentTask, updates);
      if (!validation.isValid) {
        const errorMessages = validation.errors.map(e => e.message).join(', ');
        throw this.createError('VALIDATION_ERROR', `Validation failed: ${errorMessages}`);
      }

      const now = new Date().toISOString();
      const oldValues = { ...currentTask };
      
      // Handle status completion logic
      if (updates.status && updates.status.isCompleted && !currentTask.status.isCompleted) {
        updates.completedAt = now;
        updates.progress = 100;
      } else if (updates.status && !updates.status.isCompleted && currentTask.status.isCompleted) {
        updates.completedAt = undefined;
      }

      // Handle progress updates
      if (updates.progress !== undefined) {
        updates.progress = Math.max(0, Math.min(100, updates.progress));
      }

      const updatedTask: Task = {
        ...currentTask,
        ...updates,
        id: taskId, // Ensure ID doesn't change
        updatedAt: now
      };

      this.tasks[taskIndex] = updatedTask;
      
      // Create history entry
      await this.createHistoryEntry(taskId, 'task_updated', oldValues, updatedTask, userId);
      
      // Emit event for real-time updates
      this.emitTaskEvent('task-updated', { task: updatedTask, changes: updates });

      return this.serializeTask(updatedTask);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('VALIDATION_ERROR') || error.message.includes('TASK_NOT_FOUND'))) {
        throw error;
      }
      throw this.createError('UPDATE_FAILED', 'Failed to update task', error);
    }
  }

  /**
   * Delete task with dependency checking
   */
  async delete(taskId: string, userId?: string): Promise<void> {
    await simulateDelay();

    try {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw this.createError('TASK_NOT_FOUND', `Task with ID ${taskId} not found`);
      }

      const task = this.tasks[taskIndex];

      // Check for dependent tasks
      const dependentTasks = this.tasks.filter(t => 
        t.dependencies.some(dep => dep.dependsOnId === taskId)
      );

      if (dependentTasks.length > 0) {
        throw this.createError('DEPENDENCY_ERROR', 
          `Cannot delete task: ${dependentTasks.length} tasks depend on this task`);
      }

      // Remove the task
      this.tasks.splice(taskIndex, 1);
      
      // Create history entry
      await this.createHistoryEntry(taskId, 'task_deleted', task, {}, userId);
      
      // Emit event for real-time updates
      this.emitTaskEvent('task-deleted', { taskId });
    } catch (error) {
      if (error instanceof Error && (error.message.includes('TASK_NOT_FOUND') || error.message.includes('DEPENDENCY_ERROR'))) {
        throw error;
      }
      throw this.createError('DELETE_FAILED', 'Failed to delete task', error);
    }
  }

  /**
   * Move task with position recalculation
   */
  async move(taskId: string, newStatusId: string, newPosition: number, userId?: string): Promise<void> {
    await simulateDelay(200);

    try {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw this.createError('TASK_NOT_FOUND', `Task with ID ${taskId} not found`);
      }

      const task = this.tasks[taskIndex];
      const oldStatusId = task.status.id;
      const oldPosition = task.position;
      const oldValues = { status: task.status, position: task.position };

      // Update task status and position
      const updatedTask: Task = {
        ...task,
        status: { ...task.status, id: newStatusId },
        position: newPosition,
        updatedAt: new Date().toISOString()
      };

      this.tasks[taskIndex] = updatedTask;

      // Reorder other tasks in both old and new status columns
      this.reorderTasksInStatus(oldStatusId, taskId, -1); // Remove from old position
      this.reorderTasksInStatus(newStatusId, taskId, newPosition); // Insert at new position

      // Create history entry
      await this.createHistoryEntry(taskId, 'task_moved', oldValues, 
        { status: updatedTask.status, position: updatedTask.position }, userId);

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

  /**
   * Bulk update tasks with transaction-like behavior
   */
  async bulkUpdate(operation: BulkTaskUpdate): Promise<TaskBatchResult> {
    await simulateDelay();

    const result: TaskBatchResult = {
      success: true,
      processedCount: 0,
      errorCount: 0,
      results: [],
      summary: {
        totalRequested: operation.taskIds.length,
        successful: 0,
        failed: 0,
        skipped: 0
      }
    };

    try {
      for (const taskId of operation.taskIds) {
        try {
          const updatedTask = await this.update(taskId, operation.updates);
          result.results.push({
            taskId,
            success: true,
            data: updatedTask
          });
          result.summary.successful++;
        } catch (error) {
          result.results.push({
            taskId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          result.summary.failed++;
          result.errorCount++;
          
          if (!operation.options?.continueOnError) {
            result.success = false;
            break;
          }
        }
      }

      result.processedCount = result.summary.successful + result.summary.failed;

      // Emit bulk update event
      this.emitTaskEvent('tasks-bulk-updated', { 
        operation, 
        result,
        tasks: result.results.filter(r => r.success).map(r => r.data).filter(Boolean)
      });

      return result;
    } catch (error) {
      throw this.createError('BULK_UPDATE_FAILED', 'Failed to bulk update tasks', error);
    }
  }

  /**
   * Validate task data with comprehensive business rules
   */
  async validateTask(taskData: CreateTaskData | UpdateTaskData): Promise<TaskValidationResult> {
    const errors: TaskValidationError[] = [];
    const warnings: TaskValidationWarning[] = [];

    // Required field validation
    if ('title' in taskData && (!taskData.title || !taskData.title.trim())) {
      errors.push({
        field: 'title',
        code: 'REQUIRED',
        message: 'Task title is required',
        value: taskData.title
      });
    }

    if ('title' in taskData && taskData.title && taskData.title.length > TASK_CONSTANTS.MAX_TITLE_LENGTH) {
      errors.push({
        field: 'title',
        code: 'MAX_LENGTH',
        message: `Title exceeds maximum length of ${TASK_CONSTANTS.MAX_TITLE_LENGTH} characters`,
        value: taskData.title
      });
    }

    if ('description' in taskData && taskData.description && taskData.description.length > TASK_CONSTANTS.MAX_DESCRIPTION_LENGTH) {
      errors.push({
        field: 'description',
        code: 'MAX_LENGTH',
        message: `Description exceeds maximum length of ${TASK_CONSTANTS.MAX_DESCRIPTION_LENGTH} characters`,
        value: taskData.description
      });
    }

    // Project ID validation (for create operations)
    if ('projectId' in taskData && !taskData.projectId) {
      errors.push({
        field: 'projectId',
        code: 'REQUIRED',
        message: 'Project ID is required',
        value: taskData.projectId
      });
    }

    // Story points validation
    if ('storyPoints' in taskData && taskData.storyPoints !== undefined) {
      if (taskData.storyPoints < 0 || taskData.storyPoints > TASK_CONSTANTS.MAX_STORY_POINTS) {
        errors.push({
          field: 'storyPoints',
          code: 'INVALID_RANGE',
          message: `Story points must be between 0 and ${TASK_CONSTANTS.MAX_STORY_POINTS}`,
          value: taskData.storyPoints
        });
      }
    }

    // Hours validation
    if ('estimatedHours' in taskData && taskData.estimatedHours !== undefined) {
      if (taskData.estimatedHours < TASK_CONSTANTS.MIN_HOURS || taskData.estimatedHours > TASK_CONSTANTS.MAX_HOURS) {
        errors.push({
          field: 'estimatedHours',
          code: 'INVALID_RANGE',
          message: `Estimated hours must be between ${TASK_CONSTANTS.MIN_HOURS} and ${TASK_CONSTANTS.MAX_HOURS}`,
          value: taskData.estimatedHours
        });
      }
    }

    if ('actualHours' in taskData && taskData.actualHours !== undefined) {
      if (taskData.actualHours < TASK_CONSTANTS.MIN_HOURS || taskData.actualHours > TASK_CONSTANTS.MAX_HOURS) {
        errors.push({
          field: 'actualHours',
          code: 'INVALID_RANGE',
          message: `Actual hours must be between ${TASK_CONSTANTS.MIN_HOURS} and ${TASK_CONSTANTS.MAX_HOURS}`,
          value: taskData.actualHours
        });
      }
    }

    // Progress validation
    if ('progress' in taskData && taskData.progress !== undefined) {
      if (taskData.progress < TASK_CONSTANTS.MIN_PROGRESS || taskData.progress > TASK_CONSTANTS.MAX_PROGRESS) {
        errors.push({
          field: 'progress',
          code: 'INVALID_RANGE',
          message: `Progress must be between ${TASK_CONSTANTS.MIN_PROGRESS} and ${TASK_CONSTANTS.MAX_PROGRESS}`,
          value: taskData.progress
        });
      }
    }

    // Tags validation
    if ('tags' in taskData && taskData.tags) {
      if (taskData.tags.length > TASK_CONSTANTS.MAX_TAGS) {
        errors.push({
          field: 'tags',
          code: 'MAX_COUNT',
          message: `Maximum ${TASK_CONSTANTS.MAX_TAGS} tags allowed`,
          value: taskData.tags
        });
      }

      taskData.tags.forEach((tag, index) => {
        if (tag.length > TASK_CONSTANTS.MAX_TAG_LENGTH) {
          errors.push({
            field: `tags[${index}]`,
            code: 'MAX_LENGTH',
            message: `Tag exceeds maximum length of ${TASK_CONSTANTS.MAX_TAG_LENGTH} characters`,
            value: tag
          });
        }
      });
    }

    // Due date validation
    if ('dueDate' in taskData && taskData.dueDate) {
      const dueDate = new Date(taskData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        warnings.push({
          field: 'dueDate',
          code: 'PAST_DATE',
          message: 'Due date is in the past',
          value: taskData.dueDate
        });
      }
    }

    // Business rule warnings
    if ('estimatedHours' in taskData && 'actualHours' in taskData && 
        taskData.estimatedHours && taskData.actualHours && 
        taskData.actualHours > taskData.estimatedHours * 1.5) {
      warnings.push({
        field: 'actualHours',
        code: 'OVER_ESTIMATE',
        message: 'Actual hours significantly exceed estimate',
        value: taskData.actualHours
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Private helper methods

  private applyFilters(tasks: Task[], filter: TaskFilter): Task[] {
    let filtered = tasks;

    if (filter.projectId) {
      filtered = filtered.filter(task => task.projectId === filter.projectId);
    }
    
    if (filter.assigneeId) {
      filtered = filtered.filter(task => task.assigneeId === filter.assigneeId);
    }
    
    if (filter.status) {
      filtered = filtered.filter(task => task.status.id === filter.status!.id);
    }
    
    if (filter.priority) {
      filtered = filtered.filter(task => task.priority === filter.priority);
    }

    if (filter.milestoneId) {
      filtered = filtered.filter(task => task.milestoneId === filter.milestoneId);
    }

    if (filter.createdBy) {
      filtered = filtered.filter(task => task.createdBy === filter.createdBy);
    }

    if (filter.effortLevel) {
      filtered = filtered.filter(task => task.effortLevel === filter.effortLevel);
    }

    if (filter.complexity) {
      filtered = filtered.filter(task => task.complexity === filter.complexity);
    }

    if (filter.riskLevel) {
      filtered = filtered.filter(task => task.riskLevel === filter.riskLevel);
    }

    if (filter.isBlocked !== undefined) {
      filtered = filtered.filter(task => 
        filter.isBlocked ? !!task.blockedReason : !task.blockedReason
      );
    }

    if (filter.hasDependencies !== undefined) {
      filtered = filtered.filter(task => 
        filter.hasDependencies ? task.dependencies.length > 0 : task.dependencies.length === 0
      );
    }

    if (filter.hasAttachments !== undefined) {
      filtered = filtered.filter(task => 
        filter.hasAttachments ? task.attachments!.length > 0 : task.attachments!.length === 0
      );
    }

    if (filter.hasComments !== undefined) {
      filtered = filtered.filter(task => 
        filter.hasComments ? task.comments!.length > 0 : task.comments!.length === 0
      );
    }

    if (filter.hasTimeEntries !== undefined) {
      filtered = filtered.filter(task => 
        filter.hasTimeEntries ? task.timeEntries.length > 0 : task.timeEntries.length === 0
      );
    }
    
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(task => 
        filter.tags!.some(tag => task.tags?.includes(tag))
      );
    }
    
    if (filter.dateRange) {
      const start = new Date(filter.dateRange.start);
      const end = new Date(filter.dateRange.end);
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= start && dueDate <= end;
      });
    }

    // Numeric range filters
    if (filter.storyPoints) {
      filtered = filtered.filter(task => {
        if (!task.storyPoints) return false;
        const min = filter.storyPoints!.min ?? 0;
        const max = filter.storyPoints!.max ?? Infinity;
        return task.storyPoints >= min && task.storyPoints <= max;
      });
    }

    if (filter.estimatedHours) {
      filtered = filtered.filter(task => {
        if (!task.estimatedHours) return false;
        const min = filter.estimatedHours!.min ?? 0;
        const max = filter.estimatedHours!.max ?? Infinity;
        return task.estimatedHours >= min && task.estimatedHours <= max;
      });
    }

    if (filter.actualHours) {
      filtered = filtered.filter(task => {
        if (!task.actualHours) return false;
        const min = filter.actualHours!.min ?? 0;
        const max = filter.actualHours!.max ?? Infinity;
        return task.actualHours >= min && task.actualHours <= max;
      });
    }

    if (filter.progress) {
      filtered = filtered.filter(task => {
        const min = filter.progress!.min ?? 0;
        const max = filter.progress!.max ?? 100;
        return task.progress >= min && task.progress <= max;
      });
    }

    return filtered;
  }

  private applySearch(tasks: Task[], search: string): Task[] {
    const searchLower = search.toLowerCase();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower) ||
      task.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
      task.id.toLowerCase().includes(searchLower) ||
      task.blockedReason?.toLowerCase().includes(searchLower)
    );
  }

  private applySorting(tasks: Task[], sortBy: keyof Task, sortOrder: 'asc' | 'desc'): Task[] {
    return tasks.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortOrder === 'asc' ? 1 : -1;
      if (bValue === undefined) return sortOrder === 'asc' ? -1 : 1;
      
      let result = 0;
      if (aValue < bValue) result = -1;
      else if (aValue > bValue) result = 1;
      
      return sortOrder === 'desc' ? -result : result;
    });
  }

  private applyPagination(tasks: Task[], filter: TaskFilter): { paginatedTasks: Task[], total: number } {
    const total = tasks.length;
    const offset = filter.offset || 0;
    const limit = filter.limit || total;
    
    const paginatedTasks = tasks.slice(offset, offset + limit);
    
    return { paginatedTasks, total };
  }

  private async validateTaskUpdate(currentTask: Task, updates: UpdateTaskData): Promise<TaskValidationResult> {
    // Create a merged object for validation
    const mergedTask = { ...currentTask, ...updates };
    return this.validateTask(mergedTask);
  }

  private async validateDependencies(dependencies: TaskDependency[]): Promise<void> {
    // Check for circular dependencies
    for (const dep of dependencies) {
      if (await this.hasCyclicalDependency(dep.taskId, dep.dependsOnId)) {
        throw this.createError('DEPENDENCY_ERROR', 
          `Circular dependency detected: task ${dep.taskId} cannot depend on ${dep.dependsOnId}`);
      }
    }
  }

  private async hasCyclicalDependency(taskId: string, dependsOnId: string): Promise<boolean> {
    // Simple cycle detection - in production this would be more sophisticated
    const visited = new Set<string>();
    const stack = [dependsOnId];

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      
      if (currentId === taskId) {
        return true; // Cycle found
      }
      
      if (visited.has(currentId)) {
        continue;
      }
      
      visited.add(currentId);
      
      // Find all tasks that depend on currentId
      const dependentTasks = this.tasks.filter(task =>
        task.dependencies.some(dep => dep.dependsOnId === currentId)
      );
      
      for (const task of dependentTasks) {
        stack.push(task.id);
      }
    }
    
    return false;
  }

  private getNextPosition(statusId: string): number {
    const tasksInStatus = this.tasks.filter(t => t.status.id === statusId);
    if (tasksInStatus.length === 0) return 0;
    
    const maxPosition = Math.max(...tasksInStatus.map(t => t.position || 0));
    return maxPosition + 1;
  }

  private reorderTasksInStatus(statusId: string, excludeTaskId: string, insertPosition: number): void {
    const tasksInStatus = this.tasks
      .filter(t => t.status.id === statusId && t.id !== excludeTaskId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    // Update positions for other tasks
    tasksInStatus.forEach((task, index) => {
      let newPosition = index;
      if (insertPosition >= 0 && index >= insertPosition) {
        newPosition = index + 1;
      }
      
      const taskIndex = this.tasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = {
          ...this.tasks[taskIndex],
          position: newPosition,
          updatedAt: new Date().toISOString()
        };
      }
    });
  }

  private async createHistoryEntry(
    taskId: string, 
    action: string, 
    oldValues: any, 
    newValues: any, 
    userId?: string
  ): Promise<void> {
    const historyEntry: TaskHistory = {
      id: generateId(),
      taskId,
      userId,
      action,
      changes: this.calculateChanges(oldValues, newValues),
      oldValues,
      newValues,
      timestamp: new Date().toISOString(),
      metadata: {}
    };

    this.taskHistory.push(historyEntry);
  }

  private calculateChanges(oldValues: any, newValues: any): Record<string, any> {
    const changes: Record<string, any> = {};
    
    for (const key in newValues) {
      if (oldValues[key] !== newValues[key]) {
        changes[key] = {
          from: oldValues[key],
          to: newValues[key]
        };
      }
    }
    
    return changes;
  }

  private serializeTask(task: Task): Task {
    // Return a deep copy to prevent mutations
    return JSON.parse(JSON.stringify(task));
  }

  private createError(code: string, message: string, originalError?: any): TasksError {
    const error = new Error(message) as TasksError;
    error.code = code;
    error.details = originalError;
    return error;
  }

  private emitTaskEvent(type: string, data: any): void {
    const event = new CustomEvent('enhanced-task-event', {
      detail: { type, timestamp: new Date().toISOString(), ...data }
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
      
      // Update localStorage for cross-tab synchronization
      localStorage.setItem('enhanced_tasks_updated', Date.now().toString());
    }
  }

  /**
   * Get task history for auditing
   */
  async getTaskHistory(taskId: string): Promise<TaskHistory[]> {
    await simulateDelay(200);
    return this.taskHistory
      .filter(entry => entry.taskId === taskId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get all task analytics data
   */
  async getAnalyticsSummary(filter: TaskFilter = {}): Promise<any> {
    await simulateDelay(300);
    
    const tasks = this.applyFilters(this.tasks, filter);
    
    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status.isCompleted).length,
      inProgressTasks: tasks.filter(t => TASK_STATUS_CONSTANTS.IN_PROGRESS_STATUSES.includes(t.status.id as any)).length,
      blockedTasks: tasks.filter(t => !!t.blockedReason).length,
      averageProgress: tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length || 0,
      totalEstimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
      totalActualHours: tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)
    };
  }
}

// Export singleton instance
export const enhancedTaskOperations = new EnhancedTaskOperations();