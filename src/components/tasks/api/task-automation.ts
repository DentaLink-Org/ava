import type { 
  TaskAutomation,
  TaskAutomationTrigger,
  TaskAutomationCondition,
  TaskAutomationAction,
  TaskAutomationExecution,
  TaskTemplate,
  CreateTaskData,
  Task,
  TasksError
} from '../types';

import { TASK_CONSTANTS } from '../types';

/**
 * Task Automation API
 * 
 * Provides comprehensive automation and workflow features including:
 * - Workflow automation rules and triggers
 * - Task templates and reusable workflows
 * - Scheduled and recurring tasks
 * - Escalation procedures
 * - Smart notifications
 * - Bulk operations automation
 * - Business rule enforcement
 */

// Simulate API delay
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate unique ID
const generateId = () => `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock data stores
const mockAutomations: TaskAutomation[] = [
  {
    id: 'automation-1',
    projectId: 'project-1',
    name: 'Auto-assign critical tasks',
    description: 'Automatically assign critical priority tasks to senior developers',
    isActive: true,
    trigger: {
      event: 'task_created',
      conditions: { priority: 'critical' }
    },
    conditions: [
      {
        field: 'priority',
        operator: 'equals',
        value: 'critical',
        logicalOperator: 'and'
      },
      {
        field: 'assigneeId',
        operator: 'equals',
        value: null,
        logicalOperator: 'and'
      }
    ],
    actions: [
      {
        type: 'assign_task',
        parameters: {
          assigneePool: ['senior-dev-1', 'senior-dev-2'],
          assignmentStrategy: 'least_loaded'
        }
      },
      {
        type: 'send_notification',
        parameters: {
          recipients: ['team-lead', 'project-manager'],
          template: 'critical_task_assigned'
        }
      }
    ],
    createdBy: 'user-manager',
    createdAt: '2025-07-01T09:00:00Z',
    updatedAt: '2025-07-01T09:00:00Z',
    runCount: 15,
    metadata: {
      success_rate: 95,
      last_execution_status: 'success'
    }
  },
  {
    id: 'automation-2',
    name: 'Overdue task escalation',
    description: 'Escalate tasks that are overdue by more than 24 hours',
    isActive: true,
    trigger: {
      event: 'due_date_approaching',
      conditions: { hours_overdue: 24 }
    },
    conditions: [
      {
        field: 'dueDate',
        operator: 'less_than',
        value: 'NOW() - INTERVAL 24 HOUR',
        logicalOperator: 'and'
      },
      {
        field: 'status.isCompleted',
        operator: 'equals',
        value: false
      }
    ],
    actions: [
      {
        type: 'send_notification',
        parameters: {
          recipients: ['assignee', 'manager'],
          template: 'overdue_escalation',
          priority: 'high'
        }
      },
      {
        type: 'create_comment',
        parameters: {
          content: 'This task is overdue. Please provide status update.',
          commentType: 'system'
        }
      }
    ],
    createdBy: 'user-admin',
    createdAt: '2025-06-28T10:00:00Z',
    updatedAt: '2025-07-03T14:30:00Z',
    lastRunAt: '2025-07-04T08:00:00Z',
    runCount: 42,
    metadata: {
      success_rate: 98,
      escalated_tasks_count: 8
    }
  }
];

const mockTemplates: TaskTemplate[] = [
  {
    id: 'template-1',
    name: 'Security Review Template',
    description: 'Standard security review process for new features',
    category: 'security',
    templateData: {
      title: 'Security Review: [FEATURE_NAME]',
      description: `Security review checklist for [FEATURE_NAME]:

1. Authentication & Authorization Review
2. Input Validation Assessment  
3. Data Protection Analysis
4. Infrastructure Security Check
5. Compliance Verification

Risk Level: [RISK_LEVEL]
Expected Duration: [ESTIMATED_HOURS] hours`,
      estimatedHours: 8,
      complexity: 'moderate',
      riskLevel: 'medium',
      tags: ['security', 'review', 'compliance'],
      customFields: {
        security_review_type: 'standard',
        compliance_frameworks: ['SOC2', 'GDPR'],
        requires_external_audit: false
      }
    },
    defaultAssigneeId: 'security-team-lead',
    defaultEstimatedHours: 8,
    defaultPriority: 'high',
    defaultTags: ['security', 'review'],
    isPublic: true,
    createdBy: 'security-manager',
    createdAt: '2025-06-15T11:00:00Z',
    updatedAt: '2025-07-02T09:30:00Z',
    usageCount: 23,
    metadata: {
      template_version: '2.1',
      approval_status: 'approved',
      last_review_date: '2025-07-01'
    }
  },
  {
    id: 'template-2',
    name: 'Bug Fix Workflow',
    description: 'Standard workflow for bug fixing and testing',
    category: 'development',
    templateData: {
      title: 'Bug Fix: [BUG_DESCRIPTION]',
      description: `Bug fix workflow for: [BUG_DESCRIPTION]

Steps:
1. Reproduce the issue
2. Identify root cause
3. Implement fix
4. Write/update tests
5. Code review
6. QA testing
7. Deploy to staging
8. Production deployment

Severity: [SEVERITY]
Affected Systems: [SYSTEMS]`,
      complexity: 'moderate',
      effortLevel: 'moderate',
      tags: ['bug', 'fix', 'testing'],
      dependencies: [],
      customFields: {
        bug_severity: 'medium',
        affected_version: '',
        target_version: ''
      }
    },
    defaultPriority: 'medium',
    defaultTags: ['bug', 'development'],
    isPublic: true,
    createdBy: 'dev-lead',
    createdAt: '2025-06-20T14:00:00Z',
    updatedAt: '2025-06-20T14:00:00Z',
    usageCount: 67,
    metadata: {
      template_version: '1.0',
      effectiveness_score: 87
    }
  }
];

const mockExecutions: TaskAutomationExecution[] = [
  {
    id: 'exec-1',
    automationId: 'automation-1',
    taskId: 'task-critical-1',
    triggeredAt: '2025-07-04T10:30:00Z',
    completedAt: '2025-07-04T10:31:15Z',
    status: 'completed',
    result: {
      assigned_to: 'senior-dev-1',
      notifications_sent: 2,
      assignment_reason: 'least_loaded_strategy'
    },
    actionsExecuted: 2,
    metadata: {
      execution_time_ms: 1150,
      actions_successful: 2,
      actions_failed: 0
    }
  }
];

/**
 * Task Automation Operations Class
 * Provides comprehensive automation and workflow functionality
 */
class TaskAutomationOperations {

  /**
   * Create a new automation rule
   */
  async createAutomation(automation: Partial<TaskAutomation>): Promise<TaskAutomation> {
    await simulateDelay(600);

    try {
      // Validate automation rule
      const validation = this.validateAutomation(automation);
      if (!validation.isValid) {
        throw this.createError('VALIDATION_ERROR', `Automation validation failed: ${validation.errors.join(', ')}`);
      }

      // Check automation limits
      if (automation.projectId) {
        const projectAutomations = mockAutomations.filter(a => a.projectId === automation.projectId);
        if (projectAutomations.length >= TASK_CONSTANTS.MAX_AUTOMATION_RULES_PER_PROJECT) {
          throw this.createError('LIMIT_EXCEEDED', 
            `Maximum ${TASK_CONSTANTS.MAX_AUTOMATION_RULES_PER_PROJECT} automation rules per project`);
        }
      }

      const now = new Date().toISOString();
      const automationId = generateId();

      const newAutomation: TaskAutomation = {
        id: automationId,
        projectId: automation.projectId,
        name: automation.name!,
        description: automation.description,
        isActive: automation.isActive ?? true,
        trigger: automation.trigger!,
        conditions: automation.conditions || [],
        actions: automation.actions || [],
        createdBy: automation.createdBy,
        createdAt: now,
        updatedAt: now,
        runCount: 0,
        metadata: automation.metadata || {}
      };

      mockAutomations.push(newAutomation);

      // Emit event
      this.emitAutomationEvent('automation-created', { automation: newAutomation });

      return this.serializeAutomation(newAutomation);
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('VALIDATION_ERROR') || 
        error.message.includes('LIMIT_EXCEEDED')
      )) {
        throw error;
      }
      throw this.createError('AUTOMATION_CREATE_FAILED', 'Failed to create automation', error);
    }
  }

  /**
   * Update an existing automation rule
   */
  async updateAutomation(automationId: string, updates: Partial<TaskAutomation>): Promise<TaskAutomation> {
    await simulateDelay(400);

    try {
      const automationIndex = mockAutomations.findIndex(a => a.id === automationId);
      if (automationIndex === -1) {
        throw this.createError('AUTOMATION_NOT_FOUND', `Automation ${automationId} not found`);
      }

      const currentAutomation = mockAutomations[automationIndex];
      const mergedAutomation = { ...currentAutomation, ...updates };

      // Validate updated automation
      const validation = this.validateAutomation(mergedAutomation);
      if (!validation.isValid) {
        throw this.createError('VALIDATION_ERROR', `Automation validation failed: ${validation.errors.join(', ')}`);
      }

      const updatedAutomation: TaskAutomation = {
        ...mergedAutomation,
        id: automationId, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };

      mockAutomations[automationIndex] = updatedAutomation;

      // Emit event
      this.emitAutomationEvent('automation-updated', { automation: updatedAutomation });

      return this.serializeAutomation(updatedAutomation);
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('AUTOMATION_NOT_FOUND') || 
        error.message.includes('VALIDATION_ERROR')
      )) {
        throw error;
      }
      throw this.createError('AUTOMATION_UPDATE_FAILED', 'Failed to update automation', error);
    }
  }

  /**
   * Delete an automation rule
   */
  async deleteAutomation(automationId: string): Promise<void> {
    await simulateDelay(200);

    try {
      const automationIndex = mockAutomations.findIndex(a => a.id === automationId);
      if (automationIndex === -1) {
        throw this.createError('AUTOMATION_NOT_FOUND', `Automation ${automationId} not found`);
      }

      const automation = mockAutomations[automationIndex];
      mockAutomations.splice(automationIndex, 1);

      // Emit event
      this.emitAutomationEvent('automation-deleted', { automationId });
    } catch (error) {
      if (error instanceof Error && error.message.includes('AUTOMATION_NOT_FOUND')) {
        throw error;
      }
      throw this.createError('AUTOMATION_DELETE_FAILED', 'Failed to delete automation', error);
    }
  }

  /**
   * Toggle automation active status
   */
  async toggleAutomation(automationId: string, isActive: boolean): Promise<TaskAutomation> {
    await simulateDelay(200);

    try {
      const automationIndex = mockAutomations.findIndex(a => a.id === automationId);
      if (automationIndex === -1) {
        throw this.createError('AUTOMATION_NOT_FOUND', `Automation ${automationId} not found`);
      }

      const updatedAutomation: TaskAutomation = {
        ...mockAutomations[automationIndex],
        isActive,
        updatedAt: new Date().toISOString()
      };

      mockAutomations[automationIndex] = updatedAutomation;

      // Emit event
      this.emitAutomationEvent('automation-toggled', { 
        automationId, 
        isActive,
        automation: updatedAutomation 
      });

      return this.serializeAutomation(updatedAutomation);
    } catch (error) {
      if (error instanceof Error && error.message.includes('AUTOMATION_NOT_FOUND')) {
        throw error;
      }
      throw this.createError('AUTOMATION_TOGGLE_FAILED', 'Failed to toggle automation', error);
    }
  }

  /**
   * Execute automation rule for a specific task
   */
  async executeAutomation(automationId: string, taskId: string): Promise<TaskAutomationExecution> {
    await simulateDelay(800);

    try {
      const automation = mockAutomations.find(a => a.id === automationId);
      if (!automation) {
        throw this.createError('AUTOMATION_NOT_FOUND', `Automation ${automationId} not found`);
      }

      if (!automation.isActive) {
        throw this.createError('AUTOMATION_INACTIVE', 'Cannot execute inactive automation');
      }

      const executionId = generateId();
      const startTime = new Date().toISOString();

      const execution: TaskAutomationExecution = {
        id: executionId,
        automationId,
        taskId,
        triggeredAt: startTime,
        status: 'running',
        actionsExecuted: 0,
        metadata: {
          execution_start: startTime,
          actions_total: automation.actions.length
        }
      };

      mockExecutions.push(execution);

      try {
        // Execute each action
        const results = [];
        for (const action of automation.actions) {
          const actionResult = await this.executeAction(action, taskId);
          results.push(actionResult);
          execution.actionsExecuted++;
        }

        // Update execution status
        const completedExecution: TaskAutomationExecution = {
          ...execution,
          completedAt: new Date().toISOString(),
          status: 'completed',
          result: {
            actions: results,
            success: true
          },
          metadata: {
            ...execution.metadata,
            execution_time_ms: Date.now() - new Date(startTime).getTime(),
            actions_successful: results.filter(r => r.success).length,
            actions_failed: results.filter(r => !r.success).length
          }
        };

        // Update automation run count
        const automationIndex = mockAutomations.findIndex(a => a.id === automationId);
        if (automationIndex !== -1) {
          mockAutomations[automationIndex] = {
            ...mockAutomations[automationIndex],
            runCount: mockAutomations[automationIndex].runCount + 1,
            lastRunAt: new Date().toISOString()
          };
        }

        const executionIndex = mockExecutions.findIndex(e => e.id === executionId);
        mockExecutions[executionIndex] = completedExecution;

        // Emit event
        this.emitAutomationEvent('automation-executed', { 
          automationId, 
          taskId, 
          execution: completedExecution 
        });

        return this.serializeExecution(completedExecution);
      } catch (actionError) {
        // Update execution with error
        const failedExecution: TaskAutomationExecution = {
          ...execution,
          completedAt: new Date().toISOString(),
          status: 'failed',
          error: actionError instanceof Error ? actionError.message : 'Unknown error',
          metadata: {
            ...execution.metadata,
            execution_time_ms: Date.now() - new Date(startTime).getTime()
          }
        };

        const executionIndex = mockExecutions.findIndex(e => e.id === executionId);
        mockExecutions[executionIndex] = failedExecution;

        return this.serializeExecution(failedExecution);
      }
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('AUTOMATION_NOT_FOUND') || 
        error.message.includes('AUTOMATION_INACTIVE')
      )) {
        throw error;
      }
      throw this.createError('AUTOMATION_EXECUTION_FAILED', 'Failed to execute automation', error);
    }
  }

  /**
   * Test automation rule without actually executing actions
   */
  async testAutomation(automationId: string, taskId: string): Promise<{
    conditionsMet: boolean;
    conditions: Array<{ condition: TaskAutomationCondition; result: boolean; reason: string; }>;
    actionsToExecute: TaskAutomationAction[];
    estimatedImpact: string;
  }> {
    await simulateDelay(500);

    try {
      const automation = mockAutomations.find(a => a.id === automationId);
      if (!automation) {
        throw this.createError('AUTOMATION_NOT_FOUND', `Automation ${automationId} not found`);
      }

      // Mock task data for testing
      const mockTask = { 
        id: taskId, 
        priority: 'high', 
        assigneeId: null, 
        status: { isCompleted: false } 
      };

      // Evaluate conditions
      const conditionResults = automation.conditions.map(condition => {
        const result = this.evaluateCondition(condition, mockTask);
        return {
          condition,
          result: result.met,
          reason: result.reason
        };
      });

      const conditionsMet = conditionResults.every(cr => cr.result);

      const testResult = {
        conditionsMet,
        conditions: conditionResults,
        actionsToExecute: conditionsMet ? automation.actions : [],
        estimatedImpact: conditionsMet 
          ? `Would execute ${automation.actions.length} actions`
          : 'No actions would be executed - conditions not met'
      };

      return testResult;
    } catch (error) {
      if (error instanceof Error && error.message.includes('AUTOMATION_NOT_FOUND')) {
        throw error;
      }
      throw this.createError('AUTOMATION_TEST_FAILED', 'Failed to test automation', error);
    }
  }

  /**
   * Get automation execution history
   */
  async getExecutionHistory(automationId: string, limit: number = 50): Promise<TaskAutomationExecution[]> {
    await simulateDelay(300);

    try {
      const executions = mockExecutions
        .filter(e => e.automationId === automationId)
        .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
        .slice(0, limit);

      return executions.map(e => this.serializeExecution(e));
    } catch (error) {
      throw this.createError('EXECUTION_HISTORY_FAILED', 'Failed to fetch execution history', error);
    }
  }

  /**
   * Create a new task template
   */
  async createTemplate(template: Partial<TaskTemplate>): Promise<TaskTemplate> {
    await simulateDelay(400);

    try {
      // Validate template
      if (!template.name || !template.name.trim()) {
        throw this.createError('VALIDATION_ERROR', 'Template name is required');
      }

      if (!template.templateData) {
        throw this.createError('VALIDATION_ERROR', 'Template data is required');
      }

      const templateDataSize = JSON.stringify(template.templateData).length;
      if (templateDataSize > TASK_CONSTANTS.MAX_TEMPLATE_DATA_SIZE) {
        throw this.createError('VALIDATION_ERROR', 
          `Template data exceeds maximum size of ${TASK_CONSTANTS.MAX_TEMPLATE_DATA_SIZE} characters`);
      }

      // Check user template limit
      if (template.createdBy) {
        const userTemplates = mockTemplates.filter(t => t.createdBy === template.createdBy);
        if (userTemplates.length >= TASK_CONSTANTS.MAX_TEMPLATES_PER_USER) {
          throw this.createError('LIMIT_EXCEEDED', 
            `Maximum ${TASK_CONSTANTS.MAX_TEMPLATES_PER_USER} templates per user`);
        }
      }

      const now = new Date().toISOString();
      const templateId = generateId();

      const newTemplate: TaskTemplate = {
        id: templateId,
        name: template.name,
        description: template.description,
        category: template.category || 'general',
        templateData: template.templateData,
        defaultAssigneeId: template.defaultAssigneeId,
        defaultProjectId: template.defaultProjectId,
        defaultEstimatedHours: template.defaultEstimatedHours,
        defaultPriority: template.defaultPriority || 'medium',
        defaultTags: template.defaultTags || [],
        isPublic: template.isPublic || false,
        createdBy: template.createdBy,
        createdAt: now,
        updatedAt: now,
        usageCount: 0,
        metadata: template.metadata || {}
      };

      mockTemplates.push(newTemplate);

      // Emit event
      this.emitAutomationEvent('template-created', { template: newTemplate });

      return this.serializeTemplate(newTemplate);
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('VALIDATION_ERROR') || 
        error.message.includes('LIMIT_EXCEEDED')
      )) {
        throw error;
      }
      throw this.createError('TEMPLATE_CREATE_FAILED', 'Failed to create template', error);
    }
  }

  /**
   * Apply template to create a new task
   */
  async applyTemplate(
    templateId: string, 
    projectId: string, 
    overrides: Partial<CreateTaskData> = {}
  ): Promise<CreateTaskData> {
    await simulateDelay(300);

    try {
      const template = mockTemplates.find(t => t.id === templateId);
      if (!template) {
        throw this.createError('TEMPLATE_NOT_FOUND', `Template ${templateId} not found`);
      }

      // Apply template with variable substitution
      const appliedData = this.applyTemplateVariables(template.templateData, overrides);

      const taskData: CreateTaskData = {
        title: appliedData.title || template.templateData.title || 'Untitled Task',
        description: appliedData.description || template.templateData.description,
        projectId,
        assigneeId: overrides.assigneeId || template.defaultAssigneeId,
        estimatedHours: overrides.estimatedHours || template.defaultEstimatedHours,
        priority: overrides.priority || template.defaultPriority,
        tags: [...(template.defaultTags || []), ...(overrides.tags || [])],
        // Apply template defaults with overrides
        storyPoints: overrides.storyPoints || appliedData.storyPoints,
        effortLevel: overrides.effortLevel || appliedData.effortLevel || 'moderate' as any,
        complexity: overrides.complexity || appliedData.complexity || 'moderate' as any,
        riskLevel: overrides.riskLevel || appliedData.riskLevel || 'low' as any,
        customFields: {
          ...appliedData.customFields,
          ...overrides.customFields,
          template_id: templateId,
          template_name: template.name
        },
        metadata: {
          created_from_template: true,
          template_id: templateId,
          template_version: template.metadata.template_version || '1.0'
        },
        createdBy: overrides.createdBy || '',
        status: overrides.status || { id: 'todo', name: 'To Do', color: '#6b7280', position: 0, isDefault: true, isCompleted: false },
        position: overrides.position || 0,
        progress: overrides.progress || 0,
        dependencies: overrides.dependencies || [],
        timeEntries: []
      };

      // Increment template usage count
      const templateIndex = mockTemplates.findIndex(t => t.id === templateId);
      if (templateIndex !== -1) {
        mockTemplates[templateIndex] = {
          ...mockTemplates[templateIndex],
          usageCount: mockTemplates[templateIndex].usageCount + 1,
          updatedAt: new Date().toISOString()
        };
      }

      // Emit event
      this.emitAutomationEvent('template-applied', { 
        templateId, 
        projectId, 
        taskData 
      });

      return taskData;
    } catch (error) {
      if (error instanceof Error && error.message.includes('TEMPLATE_NOT_FOUND')) {
        throw error;
      }
      throw this.createError('TEMPLATE_APPLY_FAILED', 'Failed to apply template', error);
    }
  }

  /**
   * Get available templates
   */
  async getTemplates(
    category?: string, 
    isPublic?: boolean, 
    createdBy?: string
  ): Promise<TaskTemplate[]> {
    await simulateDelay(200);

    try {
      let templates = [...mockTemplates];

      if (category) {
        templates = templates.filter(t => t.category === category);
      }

      if (isPublic !== undefined) {
        templates = templates.filter(t => t.isPublic === isPublic);
      }

      if (createdBy) {
        templates = templates.filter(t => t.createdBy === createdBy);
      }

      // Sort by usage count and creation date
      templates.sort((a, b) => {
        if (a.usageCount !== b.usageCount) {
          return b.usageCount - a.usageCount;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return templates.map(t => this.serializeTemplate(t));
    } catch (error) {
      throw this.createError('TEMPLATES_FETCH_FAILED', 'Failed to fetch templates', error);
    }
  }

  /**
   * Schedule recurring task creation
   */
  async scheduleRecurringTask(
    templateId: string,
    projectId: string,
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      startDate: string;
      endDate?: string;
      daysOfWeek?: number[]; // For weekly (0=Sunday, 1=Monday, etc.)
      dayOfMonth?: number; // For monthly
    },
    overrides: Partial<CreateTaskData> = {}
  ): Promise<{ scheduleId: string; nextExecution: string; }> {
    await simulateDelay(400);

    try {
      const template = mockTemplates.find(t => t.id === templateId);
      if (!template) {
        throw this.createError('TEMPLATE_NOT_FOUND', `Template ${templateId} not found`);
      }

      const scheduleId = generateId();
      const nextExecution = this.calculateNextExecution(schedule);

      // In production, would store schedule in database and set up cron job
      const scheduleData = {
        id: scheduleId,
        templateId,
        projectId,
        schedule,
        overrides,
        createdAt: new Date().toISOString(),
        nextExecution,
        isActive: true
      };

      // Emit event
      this.emitAutomationEvent('recurring-task-scheduled', { 
        scheduleId, 
        templateId, 
        projectId, 
        schedule 
      });

      return { scheduleId, nextExecution };
    } catch (error) {
      if (error instanceof Error && error.message.includes('TEMPLATE_NOT_FOUND')) {
        throw error;
      }
      throw this.createError('SCHEDULE_FAILED', 'Failed to schedule recurring task', error);
    }
  }

  // Private helper methods

  private validateAutomation(automation: Partial<TaskAutomation>): { isValid: boolean; errors: string[]; } {
    const errors = [];

    if (!automation.name || !automation.name.trim()) {
      errors.push('Automation name is required');
    }

    if (!automation.trigger) {
      errors.push('Automation trigger is required');
    }

    if (automation.conditions && automation.conditions.length > TASK_CONSTANTS.MAX_AUTOMATION_CONDITIONS) {
      errors.push(`Maximum ${TASK_CONSTANTS.MAX_AUTOMATION_CONDITIONS} conditions allowed`);
    }

    if (automation.actions && automation.actions.length > TASK_CONSTANTS.MAX_AUTOMATION_ACTIONS) {
      errors.push(`Maximum ${TASK_CONSTANTS.MAX_AUTOMATION_ACTIONS} actions allowed`);
    }

    if (automation.actions && automation.actions.length === 0) {
      errors.push('At least one action is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private evaluateCondition(condition: TaskAutomationCondition, task: any): { met: boolean; reason: string; } {
    const fieldValue = this.getFieldValue(condition.field, task);
    let met = false;
    let reason = '';

    switch (condition.operator) {
      case 'equals':
        met = fieldValue === condition.value;
        reason = `${condition.field} (${fieldValue}) ${met ? 'equals' : 'does not equal'} ${condition.value}`;
        break;
      case 'not_equals':
        met = fieldValue !== condition.value;
        reason = `${condition.field} (${fieldValue}) ${met ? 'does not equal' : 'equals'} ${condition.value}`;
        break;
      case 'contains':
        met = String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        reason = `${condition.field} (${fieldValue}) ${met ? 'contains' : 'does not contain'} ${condition.value}`;
        break;
      case 'in':
        met = Array.isArray(condition.value) && condition.value.includes(fieldValue);
        reason = `${condition.field} (${fieldValue}) ${met ? 'is in' : 'is not in'} [${condition.value}]`;
        break;
      case 'greater_than':
        met = Number(fieldValue) > Number(condition.value);
        reason = `${condition.field} (${fieldValue}) ${met ? 'is greater than' : 'is not greater than'} ${condition.value}`;
        break;
      case 'less_than':
        met = Number(fieldValue) < Number(condition.value);
        reason = `${condition.field} (${fieldValue}) ${met ? 'is less than' : 'is not less than'} ${condition.value}`;
        break;
      default:
        reason = `Unknown operator: ${condition.operator}`;
    }

    return { met, reason };
  }

  private getFieldValue(fieldPath: string, object: any): any {
    const parts = fieldPath.split('.');
    let value = object;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }

  private async executeAction(action: TaskAutomationAction, taskId: string): Promise<{ success: boolean; result?: any; error?: string; }> {
    try {
      switch (action.type) {
        case 'assign_task':
          return await this.executeAssignTaskAction(action, taskId);
        case 'send_notification':
          return await this.executeSendNotificationAction(action, taskId);
        case 'create_comment':
          return await this.executeCreateCommentAction(action, taskId);
        case 'update_field':
          return await this.executeUpdateFieldAction(action, taskId);
        case 'create_subtask':
          return await this.executeCreateSubtaskAction(action, taskId);
        default:
          return { success: false, error: `Unknown action type: ${action.type}` };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async executeAssignTaskAction(action: TaskAutomationAction, taskId: string): Promise<any> {
    // Mock assignment logic
    const assigneePool = action.parameters.assigneePool || [];
    const strategy = action.parameters.assignmentStrategy || 'random';
    
    let selectedAssignee;
    if (strategy === 'least_loaded') {
      // In production, would check actual workload
      selectedAssignee = assigneePool[0];
    } else {
      selectedAssignee = assigneePool[Math.floor(Math.random() * assigneePool.length)];
    }

    return {
      success: true,
      result: {
        assigned_to: selectedAssignee,
        strategy_used: strategy,
        assignee_pool_size: assigneePool.length
      }
    };
  }

  private async executeSendNotificationAction(action: TaskAutomationAction, taskId: string): Promise<any> {
    // Mock notification sending
    const recipients = action.parameters.recipients || [];
    const template = action.parameters.template || 'default';

    return {
      success: true,
      result: {
        notifications_sent: recipients.length,
        template_used: template,
        recipients
      }
    };
  }

  private async executeCreateCommentAction(action: TaskAutomationAction, taskId: string): Promise<any> {
    // Mock comment creation
    return {
      success: true,
      result: {
        comment_created: true,
        content_length: action.parameters.content?.length || 0,
        comment_type: action.parameters.commentType || 'system'
      }
    };
  }

  private async executeUpdateFieldAction(action: TaskAutomationAction, taskId: string): Promise<any> {
    // Mock field update
    return {
      success: true,
      result: {
        field_updated: action.parameters.field,
        new_value: action.parameters.value,
        old_value: 'previous_value'
      }
    };
  }

  private async executeCreateSubtaskAction(action: TaskAutomationAction, taskId: string): Promise<any> {
    // Mock subtask creation
    return {
      success: true,
      result: {
        subtask_created: true,
        parent_task: taskId,
        subtask_title: action.parameters.title || 'Generated Subtask'
      }
    };
  }

  private applyTemplateVariables(templateData: any, overrides: any): any {
    // Simple variable substitution - in production would be more sophisticated
    let processedData = JSON.parse(JSON.stringify(templateData));
    
    // Replace common placeholders
    const replacements = {
      '[FEATURE_NAME]': overrides.featureName || 'New Feature',
      '[BUG_DESCRIPTION]': overrides.bugDescription || 'Bug Description',
      '[ESTIMATED_HOURS]': overrides.estimatedHours || '8',
      '[RISK_LEVEL]': overrides.riskLevel || 'medium',
      '[SEVERITY]': overrides.severity || 'medium',
      '[SYSTEMS]': overrides.systems || 'System',
      '[DATE]': new Date().toISOString().split('T')[0]
    };

    const processString = (str: string): string => {
      let result = str;
      for (const [placeholder, value] of Object.entries(replacements)) {
        result = result.replace(new RegExp(placeholder, 'g'), String(value));
      }
      return result;
    };

    if (typeof processedData === 'string') {
      return processString(processedData);
    }

    for (const key in processedData) {
      if (typeof processedData[key] === 'string') {
        processedData[key] = processString(processedData[key]);
      }
    }

    return processedData;
  }

  private calculateNextExecution(schedule: any): string {
    const now = new Date();
    const startDate = new Date(schedule.startDate);
    let nextDate = new Date(Math.max(now.getTime(), startDate.getTime()));

    switch (schedule.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }

    return nextDate.toISOString();
  }

  private serializeAutomation(automation: TaskAutomation): TaskAutomation {
    return JSON.parse(JSON.stringify(automation));
  }

  private serializeTemplate(template: TaskTemplate): TaskTemplate {
    return JSON.parse(JSON.stringify(template));
  }

  private serializeExecution(execution: TaskAutomationExecution): TaskAutomationExecution {
    return JSON.parse(JSON.stringify(execution));
  }

  private createError(code: string, message: string, originalError?: any): TasksError {
    const error = new Error(message) as TasksError;
    error.code = code;
    error.details = originalError;
    return error;
  }

  private emitAutomationEvent(type: string, data: any): void {
    const event = new CustomEvent('task-automation-event', {
      detail: { type, timestamp: new Date().toISOString(), ...data }
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
      
      // Update localStorage for cross-tab synchronization
      localStorage.setItem('task_automation_updated', Date.now().toString());
    }
  }
}

// Export singleton instance
export const taskAutomation = new TaskAutomationOperations();