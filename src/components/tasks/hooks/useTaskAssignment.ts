import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  TaskAssignment,
  TaskAssignmentOptions,
  TaskAssignmentSuggestion,
  WorkloadBalance,
  TaskAssignmentOptimization,
  TaskBatchResult,
  TasksError,
  Task,
  TaskFilter
} from '../types';
import { enhancedTaskOperations } from '../api/enhanced-task-operations';

/**
 * Task Assignment Hook Configuration
 */
interface UseTaskAssignmentOptions {
  projectId?: string;
  teamMemberIds?: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealtime?: boolean;
  enableOptimization?: boolean;
  enableSkillsMatching?: boolean;
  enableWorkloadBalancing?: boolean;
  maxSuggestionsPerTask?: number;
  autoAssignmentThreshold?: number;
}

/**
 * Skill Definition
 */
interface Skill {
  id: string;
  name: string;
  category: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  weight?: number;
}

/**
 * Team Member Profile with Skills and Availability
 */
interface TeamMemberProfile {
  id: string;
  name: string;
  email: string;
  skills: Skill[];
  availability: {
    hoursPerWeek: number;
    currentUtilization: number;
    timeZone: string;
    workingHours: {
      start: string;
      end: string;
    };
    unavailableDates: string[];
  };
  preferences: {
    preferredTaskTypes: string[];
    maximumConcurrentTasks: number;
    complexityPreference: 'simple' | 'moderate' | 'complex' | 'any';
  };
  performance: {
    averageCompletionTime: number;
    qualityScore: number;
    reliabilityScore: number;
    velocityScore: number;
  };
  workload: {
    currentTasks: number;
    pendingTasks: number;
    estimatedHours: number;
    actualHours: number;
  };
}

/**
 * Assignment Rule Configuration
 */
interface AssignmentRule {
  id: string;
  name: string;
  priority: number;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }>;
  actions: Array<{
    type: 'assign_to_user' | 'assign_to_skill' | 'assign_to_least_busy' | 'require_approval';
    parameters: Record<string, any>;
  }>;
  isActive: boolean;
}

/**
 * Assignment Event for Real-time Updates
 */
interface AssignmentEvent {
  type: 'task-assigned' | 'task-unassigned' | 'workload-updated' | 'assignment-optimized';
  taskId?: string;
  assigneeId?: string;
  data: any;
  timestamp: string;
}

/**
 * Task Assignment Hook Return Type
 */
interface UseTaskAssignmentReturn {
  // Core assignment data
  assignments: TaskAssignment[];
  loading: boolean;
  error: TasksError | null;
  
  // Team member profiles and workload
  teamProfiles: TeamMemberProfile[];
  workloadBalances: WorkloadBalance[];
  
  // Assignment operations
  assignTask: (taskId: string, assigneeId: string, options?: TaskAssignmentOptions) => Promise<TaskAssignment>;
  unassignTask: (taskId: string) => Promise<void>;
  reassignTask: (taskId: string, newAssigneeId: string, options?: TaskAssignmentOptions) => Promise<TaskAssignment>;
  
  // Bulk operations
  bulkAssign: (taskIds: string[], assigneeId: string) => Promise<TaskBatchResult>;
  bulkUnassign: (taskIds: string[]) => Promise<TaskBatchResult>;
  bulkReassign: (assignments: Array<{ taskId: string; assigneeId: string }>) => Promise<TaskBatchResult>;
  
  // Assignment suggestions and optimization
  suggestAssignee: (taskId: string) => Promise<TaskAssignmentSuggestion[]>;
  getOptimalAssignments: (taskIds: string[]) => Promise<TaskAssignmentOptimization>;
  autoAssignTasks: (taskIds: string[]) => Promise<TaskBatchResult>;
  
  // Workload management
  getWorkloadBalance: (teamMemberIds?: string[]) => Promise<WorkloadBalance[]>;
  balanceWorkload: (teamMemberIds: string[]) => Promise<TaskAssignmentOptimization>;
  checkCapacity: (assigneeId: string, estimatedHours: number) => Promise<{
    canAccept: boolean;
    utilizationAfter: number;
    recommendedAction: string;
  }>;
  
  // Skills and matching
  matchTaskToSkills: (taskId: string) => Promise<Array<{
    memberId: string;
    matchScore: number;
    matchingSkills: Skill[];
    missingSkills: Skill[];
  }>>;
  updateMemberSkills: (memberId: string, skills: Skill[]) => Promise<void>;
  
  // Assignment rules
  createAssignmentRule: (rule: Omit<AssignmentRule, 'id'>) => Promise<AssignmentRule>;
  updateAssignmentRule: (ruleId: string, updates: Partial<AssignmentRule>) => Promise<AssignmentRule>;
  deleteAssignmentRule: (ruleId: string) => Promise<void>;
  getAssignmentRules: () => Promise<AssignmentRule[]>;
  testAssignmentRule: (ruleId: string, taskId: string) => Promise<{
    matches: boolean;
    suggestedAssignee?: string;
    reason: string;
  }>;
  
  // Data management
  refetch: () => Promise<void>;
  refreshWorkloadData: () => Promise<void>;
  
  // Real-time subscriptions
  subscribe: (callback: (event: AssignmentEvent) => void) => () => void;
  
  // Utility functions
  calculateWorkloadScore: (memberId: string) => number;
  getAssignmentHistory: (taskId?: string, memberId?: string) => Promise<TaskAssignment[]>;
  exportAssignmentData: (format: 'csv' | 'xlsx') => Promise<{ data: any; filename: string }>;
}

/**
 * Mock Data for Team Profiles
 */
const mockTeamProfiles: TeamMemberProfile[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@company.com',
    skills: [
      { id: 'react', name: 'React', category: 'frontend', level: 'expert', weight: 0.9 },
      { id: 'typescript', name: 'TypeScript', category: 'frontend', level: 'advanced', weight: 0.8 },
      { id: 'nodejs', name: 'Node.js', category: 'backend', level: 'intermediate', weight: 0.6 }
    ],
    availability: {
      hoursPerWeek: 40,
      currentUtilization: 75,
      timeZone: 'America/New_York',
      workingHours: { start: '09:00', end: '17:00' },
      unavailableDates: ['2025-07-15', '2025-07-16']
    },
    preferences: {
      preferredTaskTypes: ['frontend', 'ui-development'],
      maximumConcurrentTasks: 5,
      complexityPreference: 'complex'
    },
    performance: {
      averageCompletionTime: 4.2,
      qualityScore: 9.1,
      reliabilityScore: 9.5,
      velocityScore: 8.7
    },
    workload: {
      currentTasks: 3,
      pendingTasks: 2,
      estimatedHours: 32,
      actualHours: 28
    }
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    email: 'bob@company.com',
    skills: [
      { id: 'python', name: 'Python', category: 'backend', level: 'expert', weight: 0.9 },
      { id: 'postgresql', name: 'PostgreSQL', category: 'database', level: 'advanced', weight: 0.8 },
      { id: 'docker', name: 'Docker', category: 'devops', level: 'intermediate', weight: 0.7 }
    ],
    availability: {
      hoursPerWeek: 40,
      currentUtilization: 60,
      timeZone: 'America/Los_Angeles',
      workingHours: { start: '08:00', end: '16:00' },
      unavailableDates: []
    },
    preferences: {
      preferredTaskTypes: ['backend', 'database', 'api-development'],
      maximumConcurrentTasks: 4,
      complexityPreference: 'any'
    },
    performance: {
      averageCompletionTime: 5.8,
      qualityScore: 8.9,
      reliabilityScore: 9.2,
      velocityScore: 7.8
    },
    workload: {
      currentTasks: 2,
      pendingTasks: 1,
      estimatedHours: 24,
      actualHours: 20
    }
  },
  {
    id: 'user-3',
    name: 'Carol Davis',
    email: 'carol@company.com',
    skills: [
      { id: 'documentation', name: 'Technical Writing', category: 'documentation', level: 'expert', weight: 0.95 },
      { id: 'ui-design', name: 'UI Design', category: 'design', level: 'advanced', weight: 0.8 },
      { id: 'testing', name: 'Testing', category: 'qa', level: 'intermediate', weight: 0.6 }
    ],
    availability: {
      hoursPerWeek: 32,
      currentUtilization: 50,
      timeZone: 'Europe/London',
      workingHours: { start: '09:00', end: '17:00' },
      unavailableDates: ['2025-07-20', '2025-07-21', '2025-07-22']
    },
    preferences: {
      preferredTaskTypes: ['documentation', 'design', 'testing'],
      maximumConcurrentTasks: 3,
      complexityPreference: 'moderate'
    },
    performance: {
      averageCompletionTime: 3.5,
      qualityScore: 9.8,
      reliabilityScore: 9.7,
      velocityScore: 8.2
    },
    workload: {
      currentTasks: 1,
      pendingTasks: 1,
      estimatedHours: 16,
      actualHours: 14
    }
  }
];

/**
 * Mock Assignment Rules
 */
const mockAssignmentRules: AssignmentRule[] = [
  {
    id: 'rule-1',
    name: 'Critical Tasks to Senior Members',
    priority: 1,
    conditions: [
      { field: 'priority', operator: 'equals', value: 'urgent' }
    ],
    actions: [
      { type: 'assign_to_skill', parameters: { skill: 'expert', category: 'any' } }
    ],
    isActive: true
  },
  {
    id: 'rule-2',
    name: 'Frontend Tasks to Frontend Specialists',
    priority: 2,
    conditions: [
      { field: 'tags', operator: 'contains', value: 'frontend' }
    ],
    actions: [
      { type: 'assign_to_skill', parameters: { skill: 'react', minLevel: 'intermediate' } }
    ],
    isActive: true
  }
];

/**
 * Simulate API delay
 */
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Task Assignment Hook Implementation
 * 
 * Provides comprehensive task assignment capabilities including:
 * - Skills-based assignment with matching algorithms
 * - Workload balancing across team members
 * - Automatic assignment based on rules
 * - Real-time workload monitoring
 * - Assignment optimization suggestions
 * - Bulk assignment operations
 */
export function useTaskAssignment(options: UseTaskAssignmentOptions = {}): UseTaskAssignmentReturn {
  const {
    projectId,
    teamMemberIds,
    autoRefresh = true,
    refreshInterval = 60000,
    enableRealtime = true,
    enableOptimization = true,
    enableSkillsMatching = true,
    enableWorkloadBalancing = true,
    maxSuggestionsPerTask = 5,
    autoAssignmentThreshold = 0.8
  } = options;

  // Core state
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TasksError | null>(null);
  const [teamProfiles, setTeamProfiles] = useState<TeamMemberProfile[]>(mockTeamProfiles);
  const [workloadBalances, setWorkloadBalances] = useState<WorkloadBalance[]>([]);
  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule[]>(mockAssignmentRules);

  // Refs for managing subscriptions
  const subscriptionsRef = useRef<Map<string, (() => void)[]>>(new Map());
  const realtimeListenerRef = useRef<((event: CustomEvent) => void) | null>(null);

  // Helper function to create error
  const createError = useCallback((code: string, message: string, originalError?: any): TasksError => {
    const error = new Error(message) as TasksError;
    error.code = code;
    error.details = originalError;
    return error;
  }, []);

  // Helper function to emit assignment events
  const emitAssignmentEvent = useCallback((type: string, data: any): void => {
    const event = new CustomEvent('task-assignment-event', {
      detail: { type, timestamp: new Date().toISOString(), ...data }
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
      localStorage.setItem('task_assignments_updated', Date.now().toString());
    }
  }, []);

  // Core assignment operations
  const assignTask = useCallback(async (
    taskId: string, 
    assigneeId: string, 
    options: TaskAssignmentOptions = {}
  ): Promise<TaskAssignment> => {
    await simulateDelay(400);

    try {
      setError(null);

      // Validate assignee exists
      const assignee = teamProfiles.find(p => p.id === assigneeId);
      if (!assignee) {
        throw createError('ASSIGNEE_NOT_FOUND', `Team member ${assigneeId} not found`);
      }

      // Check capacity if requested
      if (options.autoReassignDependencies) {
        const task = await enhancedTaskOperations.get(taskId);
        const capacityCheck = await checkCapacity(assigneeId, task.estimatedHours || 0);
        if (!capacityCheck.canAccept) {
          throw createError('CAPACITY_EXCEEDED', 
            `Assignee has insufficient capacity. ${capacityCheck.recommendedAction}`);
        }
      }

      const now = new Date().toISOString();
      const assignment: TaskAssignment = {
        taskId,
        assigneeId,
        assignedBy: 'current-user', // In production, would get from auth context
        assignedAt: now,
        reason: options.reason,
        skills: options.skills,
        workloadScore: calculateWorkloadScore(assigneeId),
        availabilityScore: 100 - assignee.availability.currentUtilization,
        matchScore: enableSkillsMatching ? await calculateSkillsMatchScore(taskId, assigneeId) : 100,
        autoAssigned: false,
        notificationSent: options.notifyAssignee || false
      };

      // Update task with assignment
      await enhancedTaskOperations.update(taskId, { assigneeId });

      // Update local state
      setAssignments(prev => prev.filter(a => a.taskId !== taskId).concat(assignment));

      // Update workload
      await refreshWorkloadData();

      // Send notification if requested
      if (options.notifyAssignee) {
        // In production, would send actual notification
        console.log(`Notification sent to ${assigneeId} for task ${taskId}`);
      }

      // Emit event
      emitAssignmentEvent('task-assigned', { assignment });

      return assignment;
    } catch (error) {
      const assignmentError = error as TasksError;
      setError(assignmentError);
      throw assignmentError;
    }
  }, [teamProfiles, enableSkillsMatching, createError, emitAssignmentEvent]);

  const unassignTask = useCallback(async (taskId: string): Promise<void> => {
    await simulateDelay(300);

    try {
      setError(null);

      // Update task to remove assignment
      await enhancedTaskOperations.update(taskId, { assigneeId: undefined });

      // Remove from local state
      setAssignments(prev => prev.filter(a => a.taskId !== taskId));

      // Update workload
      await refreshWorkloadData();

      // Emit event
      emitAssignmentEvent('task-unassigned', { taskId });
    } catch (error) {
      const assignmentError = error as TasksError;
      setError(assignmentError);
      throw assignmentError;
    }
  }, [createError, emitAssignmentEvent]);

  const reassignTask = useCallback(async (
    taskId: string, 
    newAssigneeId: string, 
    options: TaskAssignmentOptions = {}
  ): Promise<TaskAssignment> => {
    await simulateDelay(400);

    try {
      // First unassign, then assign to new person
      await unassignTask(taskId);
      return await assignTask(taskId, newAssigneeId, { ...options, transferWorkload: true });
    } catch (error) {
      const assignmentError = error as TasksError;
      setError(assignmentError);
      throw assignmentError;
    }
  }, [assignTask, unassignTask]);

  // Bulk operations
  const bulkAssign = useCallback(async (taskIds: string[], assigneeId: string): Promise<TaskBatchResult> => {
    const result: TaskBatchResult = {
      success: true,
      processedCount: 0,
      errorCount: 0,
      results: [],
      summary: {
        totalRequested: taskIds.length,
        successful: 0,
        failed: 0,
        skipped: 0
      }
    };

    for (const taskId of taskIds) {
      try {
        const assignment = await assignTask(taskId, assigneeId, { notifyAssignee: false });
        // Get the updated task after assignment
        const updatedTask = await enhancedTaskOperations.get(taskId);
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
      }
      result.processedCount++;
    }

    result.success = result.errorCount === 0;
    return result;
  }, [assignTask]);

  const bulkUnassign = useCallback(async (taskIds: string[]): Promise<TaskBatchResult> => {
    const result: TaskBatchResult = {
      success: true,
      processedCount: 0,
      errorCount: 0,
      results: [],
      summary: {
        totalRequested: taskIds.length,
        successful: 0,
        failed: 0,
        skipped: 0
      }
    };

    for (const taskId of taskIds) {
      try {
        await unassignTask(taskId);
        result.results.push({
          taskId,
          success: true
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
      }
      result.processedCount++;
    }

    result.success = result.errorCount === 0;
    return result;
  }, [unassignTask]);

  const bulkReassign = useCallback(async (
    assignments: Array<{ taskId: string; assigneeId: string }>
  ): Promise<TaskBatchResult> => {
    const result: TaskBatchResult = {
      success: true,
      processedCount: 0,
      errorCount: 0,
      results: [],
      summary: {
        totalRequested: assignments.length,
        successful: 0,
        failed: 0,
        skipped: 0
      }
    };

    for (const { taskId, assigneeId } of assignments) {
      try {
        const assignment = await reassignTask(taskId, assigneeId);
        // Get the updated task after reassignment
        const updatedTask = await enhancedTaskOperations.get(taskId);
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
      }
      result.processedCount++;
    }

    result.success = result.errorCount === 0;
    return result;
  }, [reassignTask]);

  // Assignment suggestions and optimization
  const suggestAssignee = useCallback(async (taskId: string): Promise<TaskAssignmentSuggestion[]> => {
    await simulateDelay(600);

    try {
      if (!enableSkillsMatching) {
        throw createError('FEATURE_DISABLED', 'Skills matching is disabled');
      }

      const task = await enhancedTaskOperations.get(taskId);
      const suggestions: TaskAssignmentSuggestion[] = [];

      for (const member of teamProfiles) {
        // Skip if member is filtered out
        if (teamMemberIds && !teamMemberIds.includes(member.id)) continue;

        const skillsMatchScore = await calculateSkillsMatchScore(taskId, member.id);
        const workloadScore = calculateWorkloadScore(member.id);
        const availabilityScore = 100 - member.availability.currentUtilization;
        
        // Calculate overall match score
        const matchScore = (skillsMatchScore * 0.4) + (workloadScore * 0.3) + (availabilityScore * 0.3);

        const reasons = [];
        if (skillsMatchScore > 80) reasons.push('Strong skills match');
        if (workloadScore > 70) reasons.push('Good workload balance');
        if (availabilityScore > 60) reasons.push('Available capacity');
        if (member.preferences.preferredTaskTypes.some(type => task.tags?.includes(type))) {
          reasons.push('Matches preferences');
        }

        suggestions.push({
          userId: member.id,
          matchScore,
          reasons,
          workloadScore,
          availabilityScore,
          skillsMatchScore,
          currentTasks: member.workload.currentTasks,
          estimatedCapacity: member.availability.hoursPerWeek - member.workload.estimatedHours
        });
      }

      // Sort by match score and return top suggestions
      return suggestions
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, maxSuggestionsPerTask);
    } catch (error) {
      const suggestionError = error as TasksError;
      setError(suggestionError);
      throw suggestionError;
    }
  }, [teamProfiles, teamMemberIds, enableSkillsMatching, maxSuggestionsPerTask, createError]);

  const getOptimalAssignments = useCallback(async (taskIds: string[]): Promise<TaskAssignmentOptimization> => {
    await simulateDelay(800);

    try {
      if (!enableOptimization) {
        throw createError('FEATURE_DISABLED', 'Assignment optimization is disabled');
      }

      const recommendations = [];
      let totalImpactScore = 0;

      for (const taskId of taskIds) {
        const suggestions = await suggestAssignee(taskId);
        if (suggestions.length > 0) {
          const bestSuggestion = suggestions[0];
          const currentAssignment = assignments.find(a => a.taskId === taskId);
          
          recommendations.push({
            taskId,
            currentAssignee: currentAssignment?.assigneeId,
            suggestedAssignee: bestSuggestion.userId,
            reason: `Optimal match with ${bestSuggestion.matchScore.toFixed(1)}% compatibility`,
            impact: bestSuggestion.matchScore
          });

          totalImpactScore += bestSuggestion.matchScore;
        }
      }

      const balanceScore = await calculateTeamBalanceScore();
      const estimatedImprovement = (totalImpactScore / recommendations.length) - balanceScore;

      return {
        recommendations,
        balanceScore,
        estimatedImprovement
      };
    } catch (error) {
      const optimizationError = error as TasksError;
      setError(optimizationError);
      throw optimizationError;
    }
  }, [assignments, enableOptimization, suggestAssignee, createError]);

  const autoAssignTasks = useCallback(async (taskIds: string[]): Promise<TaskBatchResult> => {
    const result: TaskBatchResult = {
      success: true,
      processedCount: 0,
      errorCount: 0,
      results: [],
      summary: {
        totalRequested: taskIds.length,
        successful: 0,
        failed: 0,
        skipped: 0
      }
    };

    for (const taskId of taskIds) {
      try {
        const suggestions = await suggestAssignee(taskId);
        if (suggestions.length > 0 && suggestions[0].matchScore >= autoAssignmentThreshold * 100) {
          const assignment = await assignTask(taskId, suggestions[0].userId, { 
            reason: 'Auto-assigned based on skills and workload',
            notifyAssignee: true
          });
          
          // Get the updated task after auto-assignment
          const updatedTask = await enhancedTaskOperations.get(taskId);
          result.results.push({
            taskId,
            success: true,
            data: updatedTask
          });
          result.summary.successful++;
        } else {
          result.results.push({
            taskId,
            success: false,
            error: 'No suitable assignee found or confidence below threshold'
          });
          result.summary.skipped++;
        }
      } catch (error) {
        result.results.push({
          taskId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        result.summary.failed++;
        result.errorCount++;
      }
      result.processedCount++;
    }

    result.success = result.errorCount === 0;
    return result;
  }, [suggestAssignee, assignTask, autoAssignmentThreshold]);

  // Workload management functions
  const getWorkloadBalance = useCallback(async (teamMemberIds?: string[]): Promise<WorkloadBalance[]> => {
    await simulateDelay(400);

    const balances: WorkloadBalance[] = [];
    const membersToCheck = teamMemberIds ? 
      teamProfiles.filter(p => teamMemberIds.includes(p.id)) : 
      teamProfiles;

    for (const member of membersToCheck) {
      const upcomingTasks = await getUpcomingTasksForMember(member.id);
      
      balances.push({
        userId: member.id,
        currentTasks: member.workload.currentTasks,
        totalEstimatedHours: member.workload.estimatedHours,
        capacity: member.availability.hoursPerWeek,
        utilization: member.availability.currentUtilization,
        availability: 100 - member.availability.currentUtilization,
        skills: member.skills.map(s => s.name),
        upcomingTasks
      });
    }

    setWorkloadBalances(balances);
    return balances;
  }, [teamProfiles]);

  const balanceWorkload = useCallback(async (teamMemberIds: string[]): Promise<TaskAssignmentOptimization> => {
    await simulateDelay(600);

    try {
      if (!enableWorkloadBalancing) {
        throw createError('FEATURE_DISABLED', 'Workload balancing is disabled');
      }

      // Get current workload for specified members
      const workloads = await getWorkloadBalance(teamMemberIds);
      
      // Find overloaded and underloaded members
      const overloaded = workloads.filter(w => w.utilization > 80);
      const underloaded = workloads.filter(w => w.utilization < 60);

      const recommendations = [];
      
      for (const overloadedMember of overloaded) {
        // Find tasks that can be reassigned
        const memberTasks = assignments.filter(a => a.assigneeId === overloadedMember.userId);
        
        for (const assignment of memberTasks.slice(0, 2)) { // Only suggest reassigning a few tasks
          const bestAlternative = underloaded.find(u => 
            u.availability > 20 && 
            u.skills.some(skill => 
              overloadedMember.skills.includes(skill)
            )
          );
          
          if (bestAlternative) {
            recommendations.push({
              taskId: assignment.taskId,
              currentAssignee: overloadedMember.userId,
              suggestedAssignee: bestAlternative.userId,
              reason: `Balance workload: ${overloadedMember.userId} (${overloadedMember.utilization}%) -> ${bestAlternative.userId} (${bestAlternative.utilization}%)`,
              impact: Math.abs(overloadedMember.utilization - bestAlternative.utilization)
            });
          }
        }
      }

      const currentBalance = workloads.reduce((sum, w) => sum + Math.abs(w.utilization - 70), 0) / workloads.length;
      const estimatedImprovement = recommendations.length > 0 ? currentBalance * 0.3 : 0;

      return {
        recommendations,
        balanceScore: 100 - currentBalance,
        estimatedImprovement
      };
    } catch (error) {
      const balanceError = error as TasksError;
      setError(balanceError);
      throw balanceError;
    }
  }, [assignments, enableWorkloadBalancing, getWorkloadBalance, createError]);

  const checkCapacity = useCallback(async (assigneeId: string, estimatedHours: number): Promise<{
    canAccept: boolean;
    utilizationAfter: number;
    recommendedAction: string;
  }> => {
    await simulateDelay(200);

    const member = teamProfiles.find(p => p.id === assigneeId);
    if (!member) {
      throw createError('MEMBER_NOT_FOUND', `Team member ${assigneeId} not found`);
    }

    const currentHours = member.workload.estimatedHours;
    const totalHoursAfter = currentHours + estimatedHours;
    const utilizationAfter = (totalHoursAfter / member.availability.hoursPerWeek) * 100;

    const canAccept = utilizationAfter <= 90; // Allow up to 90% utilization
    
    let recommendedAction = '';
    if (utilizationAfter > 100) {
      recommendedAction = 'Reduce current workload before assigning';
    } else if (utilizationAfter > 90) {
      recommendedAction = 'Consider reducing task scope or extending deadline';
    } else if (utilizationAfter > 80) {
      recommendedAction = 'Monitor workload closely';
    } else {
      recommendedAction = 'Can accept task comfortably';
    }

    return {
      canAccept,
      utilizationAfter,
      recommendedAction
    };
  }, [teamProfiles, createError]);

  // Skills and matching functions
  const matchTaskToSkills = useCallback(async (taskId: string): Promise<Array<{
    memberId: string;
    matchScore: number;
    matchingSkills: Skill[];
    missingSkills: Skill[];
  }>> => {
    await simulateDelay(400);

    try {
      const task = await enhancedTaskOperations.get(taskId);
      const requiredSkills = await extractRequiredSkills(task);
      const matches = [];

      for (const member of teamProfiles) {
        const matchingSkills: Skill[] = [];
        const missingSkills: Skill[] = [];

        for (const requiredSkill of requiredSkills) {
          const memberSkill = member.skills.find(s => 
            s.name.toLowerCase() === requiredSkill.name.toLowerCase() ||
            s.category === requiredSkill.category
          );

          if (memberSkill) {
            matchingSkills.push(memberSkill);
          } else {
            missingSkills.push(requiredSkill);
          }
        }

        const matchScore = requiredSkills.length > 0 ? 
          (matchingSkills.length / requiredSkills.length) * 100 : 
          100;

        matches.push({
          memberId: member.id,
          matchScore,
          matchingSkills,
          missingSkills
        });
      }

      return matches.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      const matchError = error as TasksError;
      setError(matchError);
      throw matchError;
    }
  }, [teamProfiles]);

  const updateMemberSkills = useCallback(async (memberId: string, skills: Skill[]): Promise<void> => {
    await simulateDelay(300);

    setTeamProfiles(prev => prev.map(member => 
      member.id === memberId ? { ...member, skills } : member
    ));

    emitAssignmentEvent('member-skills-updated', { memberId, skills });
  }, [emitAssignmentEvent]);

  // Assignment rules management
  const createAssignmentRule = useCallback(async (rule: Omit<AssignmentRule, 'id'>): Promise<AssignmentRule> => {
    await simulateDelay(300);

    const newRule: AssignmentRule = {
      ...rule,
      id: `rule-${Date.now()}`
    };

    setAssignmentRules(prev => [...prev, newRule]);
    return newRule;
  }, []);

  const updateAssignmentRule = useCallback(async (ruleId: string, updates: Partial<AssignmentRule>): Promise<AssignmentRule> => {
    await simulateDelay(300);

    setAssignmentRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));

    const updatedRule = assignmentRules.find(r => r.id === ruleId);
    if (!updatedRule) {
      throw createError('RULE_NOT_FOUND', `Assignment rule ${ruleId} not found`);
    }

    return { ...updatedRule, ...updates };
  }, [assignmentRules, createError]);

  const deleteAssignmentRule = useCallback(async (ruleId: string): Promise<void> => {
    await simulateDelay(200);

    setAssignmentRules(prev => prev.filter(rule => rule.id !== ruleId));
  }, []);

  const getAssignmentRules = useCallback(async (): Promise<AssignmentRule[]> => {
    await simulateDelay(200);
    return assignmentRules.filter(rule => rule.isActive);
  }, [assignmentRules]);

  const testAssignmentRule = useCallback(async (ruleId: string, taskId: string): Promise<{
    matches: boolean;
    suggestedAssignee?: string;
    reason: string;
  }> => {
    await simulateDelay(300);

    const rule = assignmentRules.find(r => r.id === ruleId);
    if (!rule) {
      throw createError('RULE_NOT_FOUND', `Assignment rule ${ruleId} not found`);
    }

    const task = await enhancedTaskOperations.get(taskId);
    
    // Simple rule matching logic (would be more sophisticated in production)
    let matches = true;
    for (const condition of rule.conditions) {
      const taskValue = (task as any)[condition.field];
      switch (condition.operator) {
        case 'equals':
          if (taskValue !== condition.value) matches = false;
          break;
        case 'contains':
          if (Array.isArray(taskValue)) {
            if (!taskValue.includes(condition.value)) matches = false;
          } else if (typeof taskValue === 'string') {
            if (!taskValue.includes(condition.value)) matches = false;
          }
          break;
        default:
          matches = false;
      }
    }

    let suggestedAssignee: string | undefined;
    let reason = matches ? `Task matches rule "${rule.name}"` : `Task does not match rule "${rule.name}"`;

    if (matches && rule.actions.length > 0) {
      const action = rule.actions[0];
      if (action.type === 'assign_to_skill') {
        // Find member with required skill
        const member = teamProfiles.find(m => 
          m.skills.some(s => s.name === action.parameters.skill)
        );
        if (member) {
          suggestedAssignee = member.id;
          reason += ` - suggested assignee based on skill matching`;
        }
      }
    }

    return { matches, suggestedAssignee, reason };
  }, [assignmentRules, teamProfiles, createError]);

  // Data management
  const refetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // In production, would fetch actual assignment data
      await refreshWorkloadData();
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshWorkloadData = useCallback(async (): Promise<void> => {
    try {
      await getWorkloadBalance();
    } catch (error) {
      console.error('Failed to refresh workload data:', error);
    }
  }, [getWorkloadBalance]);

  // Real-time subscriptions
  const subscribe = useCallback((callback: (event: AssignmentEvent) => void): (() => void) => {
    const subscriptionId = Math.random().toString(36).substr(2, 9);
    const currentSubscriptions = subscriptionsRef.current.get('assignments') || [];
    
    const unsubscribe = () => {
      subscriptionsRef.current.set('assignments', 
        currentSubscriptions.filter(sub => sub !== unsubscribe)
      );
    };
    
    currentSubscriptions.push(unsubscribe);
    subscriptionsRef.current.set('assignments', currentSubscriptions);
    
    return unsubscribe;
  }, []);

  // Utility functions
  const calculateWorkloadScore = useCallback((memberId: string): number => {
    const member = teamProfiles.find(p => p.id === memberId);
    if (!member) return 0;

    // Score based on inverse of utilization (lower utilization = higher score)
    const utilizationScore = Math.max(0, 100 - member.availability.currentUtilization);
    
    // Adjust based on performance metrics
    const performanceMultiplier = (member.performance.reliabilityScore + member.performance.velocityScore) / 200;
    
    return Math.min(100, utilizationScore * performanceMultiplier);
  }, [teamProfiles]);

  const getAssignmentHistory = useCallback(async (taskId?: string, memberId?: string): Promise<TaskAssignment[]> => {
    await simulateDelay(300);

    let history = [...assignments];
    
    if (taskId) {
      history = history.filter(a => a.taskId === taskId);
    }
    
    if (memberId) {
      history = history.filter(a => a.assigneeId === memberId);
    }

    return history.sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
  }, [assignments]);

  const exportAssignmentData = useCallback(async (format: 'csv' | 'xlsx'): Promise<{ data: any; filename: string }> => {
    await simulateDelay(500);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `task-assignments-${timestamp}`;

    if (format === 'csv') {
      const headers = ['Task ID', 'Assignee ID', 'Assigned By', 'Assigned At', 'Match Score', 'Workload Score'];
      const rows = assignments.map(a => [
        a.taskId,
        a.assigneeId,
        a.assignedBy,
        a.assignedAt,
        a.matchScore || '',
        a.workloadScore || ''
      ]);

      const csvData = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      return {
        data: csvData,
        filename: `${filename}.csv`
      };
    } else {
      return {
        data: 'Excel export would be implemented with SheetJS',
        filename: `${filename}.xlsx`
      };
    }
  }, [assignments]);

  // Helper functions for complex calculations
  const calculateSkillsMatchScore = useCallback(async (taskId: string, memberId: string): Promise<number> => {
    const matches = await matchTaskToSkills(taskId);
    const memberMatch = matches.find(m => m.memberId === memberId);
    return memberMatch?.matchScore || 0;
  }, [matchTaskToSkills]);

  const calculateTeamBalanceScore = useCallback(async (): Promise<number> => {
    const balances = await getWorkloadBalance();
    const utilizationVariance = balances.reduce((sum, b) => sum + Math.abs(b.utilization - 70), 0) / balances.length;
    return Math.max(0, 100 - utilizationVariance);
  }, [getWorkloadBalance]);

  const extractRequiredSkills = useCallback(async (task: Task): Promise<Skill[]> => {
    // Simple skill extraction based on tags and complexity
    const skills: Skill[] = [];
    
    if (task.tags?.includes('frontend')) {
      skills.push({ id: 'react', name: 'React', category: 'frontend' });
    }
    if (task.tags?.includes('backend')) {
      skills.push({ id: 'nodejs', name: 'Node.js', category: 'backend' });
    }
    if (task.tags?.includes('database')) {
      skills.push({ id: 'sql', name: 'SQL', category: 'database' });
    }
    
    return skills;
  }, []);

  const getUpcomingTasksForMember = useCallback(async (memberId: string): Promise<Task[]> => {
    // Mock implementation - would fetch actual upcoming tasks
    return [];
  }, []);

  // Effects
  
  // Initial data fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!loading) {
        refreshWorkloadData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading, refreshWorkloadData]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealtime) return;

    const handleAssignmentEvent = (event: CustomEvent) => {
      // Refresh data when assignments change
      refreshWorkloadData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('task-assignment-event', handleAssignmentEvent as EventListener);
      window.addEventListener('enhanced-task-event', handleAssignmentEvent as EventListener);
      realtimeListenerRef.current = handleAssignmentEvent;
      
      return () => {
        window.removeEventListener('task-assignment-event', handleAssignmentEvent as EventListener);
        window.removeEventListener('enhanced-task-event', handleAssignmentEvent as EventListener);
        realtimeListenerRef.current = null;
      };
    }
  }, [enableRealtime, refreshWorkloadData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.clear();
    };
  }, []);

  return {
    // Core assignment data
    assignments,
    loading,
    error,
    
    // Team member profiles and workload
    teamProfiles,
    workloadBalances,
    
    // Assignment operations
    assignTask,
    unassignTask,
    reassignTask,
    
    // Bulk operations
    bulkAssign,
    bulkUnassign,
    bulkReassign,
    
    // Assignment suggestions and optimization
    suggestAssignee,
    getOptimalAssignments,
    autoAssignTasks,
    
    // Workload management
    getWorkloadBalance,
    balanceWorkload,
    checkCapacity,
    
    // Skills and matching
    matchTaskToSkills,
    updateMemberSkills,
    
    // Assignment rules
    createAssignmentRule,
    updateAssignmentRule,
    deleteAssignmentRule,
    getAssignmentRules,
    testAssignmentRule,
    
    // Data management
    refetch,
    refreshWorkloadData,
    
    // Real-time subscriptions
    subscribe,
    
    // Utility functions
    calculateWorkloadScore,
    getAssignmentHistory,
    exportAssignmentData
  };
}