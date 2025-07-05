import type { 
  Task,
  TaskAnalytics,
  TaskFilter,
  TaskPriority,
  TasksError
} from '../types';

import { TASK_STATUS_CONSTANTS, TaskEffort, TaskComplexity, TaskRisk, TaskActivityType } from '../types';

/**
 * Task Analytics API
 * 
 * Provides comprehensive analytics and reporting for tasks including:
 * - Performance metrics and KPIs
 * - Team productivity analytics 
 * - Burndown and velocity tracking
 * - Trend analysis and forecasting
 * - Custom analytics queries
 * - Real-time dashboard data
 */

// Simulate API delay
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Task Analytics Operations Class
 * Provides comprehensive analytics and reporting functionality
 */
class TaskAnalyticsOperations {
  
  /**
   * Get comprehensive task metrics for dashboard KPIs
   */
  async getTaskMetrics(filter: TaskFilter = {}): Promise<TaskAnalytics> {
    await simulateDelay(800);

    try {
      // In production, this would query the actual database
      // For now, we'll generate realistic analytics data
      const tasks = await this.getFilteredTasks(filter);
      
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calculate basic metrics
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status.isCompleted).length;
      const inProgressTasks = tasks.filter(t => 
        TASK_STATUS_CONSTANTS.IN_PROGRESS_STATUSES.includes(t.status.id as any)
      ).length;
      const blockedTasks = tasks.filter(t => 
        TASK_STATUS_CONSTANTS.BLOCKED_STATUSES.includes(t.status.id as any) || !!t.blockedReason
      ).length;
      const overdueTasks = tasks.filter(t => this.isTaskOverdue(t)).length;

      // Calculate time-based metrics
      const completedTasksWithTime = tasks.filter(t => 
        t.status.isCompleted && t.completedAt && t.createdAt
      );
      
      const averageCompletionTime = completedTasksWithTime.length > 0
        ? completedTasksWithTime.reduce((sum, task) => {
            const created = new Date(task.createdAt).getTime();
            const completed = new Date(task.completedAt!).getTime();
            return sum + (completed - created);
          }, 0) / completedTasksWithTime.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      const averageEstimatedHours = tasks.filter(t => t.estimatedHours).length > 0
        ? tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0) / tasks.filter(t => t.estimatedHours).length
        : 0;

      const averageActualHours = tasks.filter(t => t.actualHours).length > 0
        ? tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0) / tasks.filter(t => t.actualHours).length
        : 0;

      const estimationAccuracy = averageEstimatedHours > 0 
        ? Math.max(0, 100 - Math.abs(averageActualHours - averageEstimatedHours) / averageEstimatedHours * 100)
        : 0;

      // Time-based counts
      const tasksCreatedThisWeek = tasks.filter(t => 
        new Date(t.createdAt) >= oneWeekAgo
      ).length;

      const tasksCompletedThisWeek = tasks.filter(t => 
        t.completedAt && new Date(t.completedAt) >= oneWeekAgo
      ).length;

      const tasksCreatedThisMonth = tasks.filter(t => 
        new Date(t.createdAt) >= oneMonthAgo
      ).length;

      const tasksCompletedThisMonth = tasks.filter(t => 
        t.completedAt && new Date(t.completedAt) >= oneMonthAgo
      ).length;

      // Distribution analytics
      const priorityDistribution = this.calculatePriorityDistribution(tasks);
      const statusDistribution = this.calculateStatusDistribution(tasks);
      const effortDistribution = this.calculateEffortDistribution(tasks);
      const complexityDistribution = this.calculateComplexityDistribution(tasks);
      const riskDistribution = this.calculateRiskDistribution(tasks);

      // Team performance
      const teamPerformance = await this.calculateTeamPerformance(tasks);

      // Time tracking
      const { totalTimeTracked, billableTimeTracked, timeByActivity } = 
        this.calculateTimeTrackingMetrics(tasks);

      // Burndown and velocity data
      const burndownData = await this.calculateBurndownData(tasks, filter);
      const velocityData = await this.calculateVelocityData(tasks, filter);

      const analytics: TaskAnalytics = {
        totalTasks,
        completedTasks,
        inProgressTasks,
        blockedTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        averageCompletionTime,
        averageEstimatedHours,
        averageActualHours,
        estimationAccuracy,
        tasksCreatedThisWeek,
        tasksCompletedThisWeek,
        tasksCreatedThisMonth,
        tasksCompletedThisMonth,
        priorityDistribution,
        statusDistribution,
        effortDistribution,
        complexityDistribution,
        riskDistribution,
        teamPerformance,
        totalTimeTracked,
        billableTimeTracked,
        timeByActivity,
        burndownData,
        velocityData
      };

      return analytics;
    } catch (error) {
      throw this.createError('ANALYTICS_FAILED', 'Failed to calculate task metrics', error);
    }
  }

  /**
   * Get team performance analytics
   */
  async getTeamPerformance(teamMemberIds?: string[], dateRange?: { start: string; end: string }): Promise<TaskAnalytics['teamPerformance']> {
    await simulateDelay(600);

    try {
      const filter: TaskFilter = {};
      if (dateRange) {
        filter.dateRange = dateRange;
      }

      const tasks = await this.getFilteredTasks(filter);
      return this.calculateTeamPerformance(tasks, teamMemberIds);
    } catch (error) {
      throw this.createError('TEAM_ANALYTICS_FAILED', 'Failed to calculate team performance', error);
    }
  }

  /**
   * Get burndown chart data
   */
  async getBurndownData(
    projectId?: string, 
    milestoneId?: string, 
    dateRange?: { start: string; end: string }
  ): Promise<TaskAnalytics['burndownData']> {
    await simulateDelay(400);

    try {
      const filter: TaskFilter = {};
      if (projectId) filter.projectId = projectId;
      if (milestoneId) filter.milestoneId = milestoneId;
      if (dateRange) filter.dateRange = dateRange;

      const tasks = await this.getFilteredTasks(filter);
      return this.calculateBurndownData(tasks, filter);
    } catch (error) {
      throw this.createError('BURNDOWN_FAILED', 'Failed to calculate burndown data', error);
    }
  }

  /**
   * Get velocity tracking data
   */
  async getVelocityTrend(
    projectId?: string,
    teamMemberIds?: string[],
    periodType: 'week' | 'sprint' | 'month' = 'week'
  ): Promise<TaskAnalytics['velocityData']> {
    await simulateDelay(500);

    try {
      const filter: TaskFilter = {};
      if (projectId) filter.projectId = projectId;

      const tasks = await this.getFilteredTasks(filter);
      return this.calculateVelocityData(tasks, filter, periodType, teamMemberIds);
    } catch (error) {
      throw this.createError('VELOCITY_FAILED', 'Failed to calculate velocity trend', error);
    }
  }

  /**
   * Predict task completion dates using historical data
   */
  async predictTaskCompletion(taskId: string): Promise<{
    estimatedCompletionDate: string;
    confidence: number;
    factors: string[];
  }> {
    await simulateDelay(700);

    try {
      // Mock prediction logic - in production this would use ML models
      const task = await this.getTaskById(taskId);
      if (!task) {
        throw this.createError('TASK_NOT_FOUND', `Task ${taskId} not found`);
      }

      // Calculate prediction based on historical data and current progress
      const historicalTasks = await this.getFilteredTasks({
        assigneeId: task.assigneeId,
        complexity: task.complexity,
        effortLevel: task.effortLevel
      });

      const completedSimilarTasks = historicalTasks.filter(t => t.status.isCompleted);
      const averageCompletionDays = completedSimilarTasks.length > 0
        ? completedSimilarTasks.reduce((sum, t) => {
            const created = new Date(t.createdAt).getTime();
            const completed = new Date(t.completedAt!).getTime();
            return sum + (completed - created) / (1000 * 60 * 60 * 24);
          }, 0) / completedSimilarTasks.length
        : 14; // Default 2 weeks

      // Adjust based on current progress
      const remainingProgress = (100 - task.progress) / 100;
      const estimatedRemainingDays = averageCompletionDays * remainingProgress;
      
      const estimatedCompletionDate = new Date(
        Date.now() + estimatedRemainingDays * 24 * 60 * 60 * 1000
      ).toISOString();

      const confidence = Math.min(95, Math.max(30, 
        50 + (completedSimilarTasks.length * 10) + (task.progress * 0.3)
      ));

      const factors = [
        `Based on ${completedSimilarTasks.length} similar completed tasks`,
        `Current progress: ${task.progress}%`,
        `Assignee historical performance`,
        `Task complexity: ${task.complexity}`,
        `Effort level: ${task.effortLevel}`
      ];

      return {
        estimatedCompletionDate,
        confidence,
        factors
      };
    } catch (error) {
      throw this.createError('PREDICTION_FAILED', 'Failed to predict task completion', error);
    }
  }

  /**
   * Get productivity insights and recommendations
   */
  async getProductivityInsights(filter: TaskFilter = {}): Promise<{
    insights: Array<{
      type: 'bottleneck' | 'opportunity' | 'risk' | 'achievement';
      title: string;
      description: string;
      impact: 'low' | 'medium' | 'high';
      actionItems: string[];
    }>;
    recommendations: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      expectedImpact: string;
    }>;
  }> {
    await simulateDelay(900);

    try {
      const tasks = await this.getFilteredTasks(filter);
      const analytics = await this.getTaskMetrics(filter);

      const insights = [];
      const recommendations = [];

      // Identify bottlenecks
      if (analytics.blockedTasks > analytics.totalTasks * 0.15) {
        insights.push({
          type: 'bottleneck' as const,
          title: 'High Number of Blocked Tasks',
          description: `${analytics.blockedTasks} tasks (${Math.round(analytics.blockedTasks / analytics.totalTasks * 100)}%) are currently blocked`,
          impact: 'high' as const,
          actionItems: [
            'Review blocked tasks and identify common blockers',
            'Escalate long-standing blockers to management',
            'Implement process improvements to prevent future blocks'
          ]
        });

        recommendations.push({
          title: 'Implement Blocker Review Process',
          description: 'Set up daily/weekly reviews for blocked tasks to ensure quick resolution',
          priority: 'high' as const,
          expectedImpact: 'Reduce blocked tasks by 30-50%'
        });
      }

      // Check estimation accuracy
      if (analytics.estimationAccuracy < 70) {
        insights.push({
          type: 'opportunity' as const,
          title: 'Poor Estimation Accuracy',
          description: `Estimation accuracy is ${Math.round(analytics.estimationAccuracy)}%, indicating room for improvement`,
          impact: 'medium' as const,
          actionItems: [
            'Provide estimation training for team members',
            'Implement story point poker sessions',
            'Track and review estimation vs actual data regularly'
          ]
        });

        recommendations.push({
          title: 'Improve Estimation Process',
          description: 'Implement structured estimation techniques and historical data analysis',
          priority: 'medium' as const,
          expectedImpact: 'Improve estimation accuracy by 20-30%'
        });
      }

      // Check completion rate
      if (analytics.completionRate > 85) {
        insights.push({
          type: 'achievement' as const,
          title: 'High Task Completion Rate',
          description: `Excellent completion rate of ${Math.round(analytics.completionRate)}%`,
          impact: 'high' as const,
          actionItems: [
            'Document and share best practices',
            'Consider increasing team capacity or taking on more challenging work',
            'Celebrate team success'
          ]
        });
      }

      // Check overdue tasks
      if (analytics.overdueTasks > analytics.totalTasks * 0.1) {
        insights.push({
          type: 'risk' as const,
          title: 'High Number of Overdue Tasks',
          description: `${analytics.overdueTasks} tasks are overdue, indicating potential planning issues`,
          impact: 'high' as const,
          actionItems: [
            'Review and reschedule overdue tasks',
            'Analyze root causes of delays',
            'Implement better deadline management'
          ]
        });

        recommendations.push({
          title: 'Implement Proactive Deadline Management',
          description: 'Set up alerts and regular check-ins before tasks become overdue',
          priority: 'high' as const,
          expectedImpact: 'Reduce overdue tasks by 40-60%'
        });
      }

      return { insights, recommendations };
    } catch (error) {
      throw this.createError('INSIGHTS_FAILED', 'Failed to generate productivity insights', error);
    }
  }

  /**
   * Export analytics data in various formats
   */
  async exportAnalytics(
    filter: TaskFilter = {},
    format: 'csv' | 'xlsx' | 'pdf' | 'json' = 'json',
    includeCharts: boolean = false
  ): Promise<{
    data: any;
    filename: string;
    mimeType: string;
  }> {
    await simulateDelay(1000);

    try {
      const analytics = await this.getTaskMetrics(filter);
      const tasks = await this.getFilteredTasks(filter);

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `task-analytics-${timestamp}`;

      switch (format) {
        case 'json':
          return {
            data: { analytics, tasks: includeCharts ? tasks : undefined },
            filename: `${filename}.json`,
            mimeType: 'application/json'
          };

        case 'csv':
          const csvData = this.convertToCsv(tasks, analytics);
          return {
            data: csvData,
            filename: `${filename}.csv`,
            mimeType: 'text/csv'
          };

        case 'xlsx':
          // In production, would use a library like SheetJS
          return {
            data: 'Excel export would be implemented with SheetJS',
            filename: `${filename}.xlsx`,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          };

        case 'pdf':
          // In production, would use a library like jsPDF
          return {
            data: 'PDF export would be implemented with jsPDF',
            filename: `${filename}.pdf`,
            mimeType: 'application/pdf'
          };

        default:
          throw this.createError('INVALID_FORMAT', `Unsupported export format: ${format}`);
      }
    } catch (error) {
      throw this.createError('EXPORT_FAILED', 'Failed to export analytics data', error);
    }
  }

  // Private helper methods

  private async getFilteredTasks(filter: TaskFilter): Promise<Task[]> {
    // In production, this would be an actual API call to the enhanced task operations
    // For now, we'll simulate with mock data
    return [
      // This would call enhancedTaskOperations.list(filter) in production
      // For now, return mock data
    ];
  }

  private async getTaskById(taskId: string): Promise<Task | null> {
    // Mock implementation
    return null;
  }

  private isTaskOverdue(task: Task): boolean {
    if (!task.dueDate || task.status.isCompleted) return false;
    return new Date(task.dueDate) < new Date();
  }

  private calculatePriorityDistribution(tasks: Task[]): Record<TaskPriority, number> {
    const distribution: Record<TaskPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };

    tasks.forEach(task => {
      distribution[task.priority]++;
    });

    return distribution;
  }

  private calculateStatusDistribution(tasks: Task[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    tasks.forEach(task => {
      const statusId = task.status.id;
      distribution[statusId] = (distribution[statusId] || 0) + 1;
    });

    return distribution;
  }

  private calculateEffortDistribution(tasks: Task[]): Record<TaskEffort, number> {
    const distribution: Record<TaskEffort, number> = {
      [TaskEffort.MINIMAL]: 0,
      [TaskEffort.LIGHT]: 0,
      [TaskEffort.MODERATE]: 0,
      [TaskEffort.HEAVY]: 0,
      [TaskEffort.INTENSIVE]: 0
    };

    tasks.forEach(task => {
      distribution[task.effortLevel]++;
    });

    return distribution;
  }

  private calculateComplexityDistribution(tasks: Task[]): Record<TaskComplexity, number> {
    const distribution: Record<TaskComplexity, number> = {
      [TaskComplexity.SIMPLE]: 0,
      [TaskComplexity.MODERATE]: 0,
      [TaskComplexity.COMPLEX]: 0,
      [TaskComplexity.VERY_COMPLEX]: 0
    };

    tasks.forEach(task => {
      distribution[task.complexity]++;
    });

    return distribution;
  }

  private calculateRiskDistribution(tasks: Task[]): Record<TaskRisk, number> {
    const distribution: Record<TaskRisk, number> = {
      [TaskRisk.LOW]: 0,
      [TaskRisk.MEDIUM]: 0,
      [TaskRisk.HIGH]: 0,
      [TaskRisk.CRITICAL]: 0
    };

    tasks.forEach(task => {
      distribution[task.riskLevel]++;
    });

    return distribution;
  }

  private calculateTeamPerformance(tasks: Task[], teamMemberIds?: string[]): TaskAnalytics['teamPerformance'] {
    const performanceMap = new Map<string, {
      totalTasks: number;
      completedTasks: number;
      totalCompletionTime: number;
      completedTasksWithTime: number;
    }>();

    tasks.forEach(task => {
      if (!task.assigneeId) return;
      if (teamMemberIds && !teamMemberIds.includes(task.assigneeId)) return;

      const current = performanceMap.get(task.assigneeId) || {
        totalTasks: 0,
        completedTasks: 0,
        totalCompletionTime: 0,
        completedTasksWithTime: 0
      };

      current.totalTasks++;

      if (task.status.isCompleted) {
        current.completedTasks++;

        if (task.completedAt && task.createdAt) {
          const completionTime = new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime();
          current.totalCompletionTime += completionTime;
          current.completedTasksWithTime++;
        }
      }

      performanceMap.set(task.assigneeId, current);
    });

    return Array.from(performanceMap.entries()).map(([assigneeId, data]) => ({
      assigneeId,
      totalTasks: data.totalTasks,
      completedTasks: data.completedTasks,
      averageCompletionTime: data.completedTasksWithTime > 0 
        ? data.totalCompletionTime / data.completedTasksWithTime / (1000 * 60 * 60 * 24) // Days
        : 0,
      completionRate: data.totalTasks > 0 ? (data.completedTasks / data.totalTasks) * 100 : 0
    }));
  }

  private calculateTimeTrackingMetrics(tasks: Task[]): {
    totalTimeTracked: number;
    billableTimeTracked: number;
    timeByActivity: Record<TaskActivityType, number>;
  } {
    let totalTimeTracked = 0;
    let billableTimeTracked = 0;
    const timeByActivity: Record<TaskActivityType, number> = {
      [TaskActivityType.WORK]: 0,
      [TaskActivityType.MEETING]: 0,
      [TaskActivityType.RESEARCH]: 0,
      [TaskActivityType.TESTING]: 0,
      [TaskActivityType.DOCUMENTATION]: 0,
      [TaskActivityType.REVIEW]: 0
    };

    tasks.forEach(task => {
      task.timeEntries.forEach(entry => {
        const duration = entry.durationMinutes || 0;
        totalTimeTracked += duration;

        if (entry.isBillable) {
          billableTimeTracked += duration;
        }

        timeByActivity[entry.activityType] += duration;
      });
    });

    return {
      totalTimeTracked,
      billableTimeTracked,
      timeByActivity
    };
  }

  private async calculateBurndownData(tasks: Task[], filter: TaskFilter): Promise<TaskAnalytics['burndownData']> {
    // Generate burndown data for the last 30 days
    const burndownData = [];
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      
      // Calculate tasks at this point in time
      const tasksAtDate = tasks.filter(task => new Date(task.createdAt) <= date);
      const completedAtDate = tasksAtDate.filter(task => 
        task.status.isCompleted && task.completedAt && new Date(task.completedAt) <= date
      );

      burndownData.push({
        date: dateStr,
        totalTasks: tasksAtDate.length,
        completedTasks: completedAtDate.length,
        remainingTasks: tasksAtDate.length - completedAtDate.length
      });
    }

    return burndownData;
  }

  private async calculateVelocityData(
    tasks: Task[], 
    filter: TaskFilter, 
    periodType: 'week' | 'sprint' | 'month' = 'week',
    teamMemberIds?: string[]
  ): Promise<TaskAnalytics['velocityData']> {
    const velocityData = [];
    const endDate = new Date();
    const periods = 12; // Last 12 periods

    for (let i = periods - 1; i >= 0; i--) {
      let periodStart: Date;
      let periodEnd: Date;
      let periodLabel: string;

      switch (periodType) {
        case 'week':
          periodEnd = new Date(endDate.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          periodStart = new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
          periodLabel = `Week ${periodEnd.toISOString().split('T')[0]}`;
          break;
        case 'month':
          periodEnd = new Date(endDate.getFullYear(), endDate.getMonth() - i, 0);
          periodStart = new Date(endDate.getFullYear(), endDate.getMonth() - i - 1, 1);
          periodLabel = periodStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          break;
        default: // sprint (2 weeks)
          periodEnd = new Date(endDate.getTime() - i * 14 * 24 * 60 * 60 * 1000);
          periodStart = new Date(periodEnd.getTime() - 14 * 24 * 60 * 60 * 1000);
          periodLabel = `Sprint ${Math.floor((Date.now() - periodStart.getTime()) / (14 * 24 * 60 * 60 * 1000))}`;
      }

      const periodTasks = tasks.filter(task => {
        if (teamMemberIds && task.assigneeId && !teamMemberIds.includes(task.assigneeId)) {
          return false;
        }
        return task.status.isCompleted && 
               task.completedAt && 
               new Date(task.completedAt) >= periodStart && 
               new Date(task.completedAt) <= periodEnd;
      });

      const storyPointsCompleted = periodTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);

      velocityData.push({
        period: periodLabel,
        storyPointsCompleted,
        tasksCompleted: periodTasks.length
      });
    }

    return velocityData;
  }

  private convertToCsv(tasks: Task[], analytics: TaskAnalytics): string {
    const headers = [
      'Task ID', 'Title', 'Status', 'Priority', 'Assignee', 'Created', 'Due Date',
      'Estimated Hours', 'Actual Hours', 'Story Points', 'Progress', 'Effort', 'Complexity', 'Risk'
    ];

    const rows = tasks.map(task => [
      task.id,
      task.title,
      task.status.name,
      task.priority,
      task.assigneeId || '',
      task.createdAt,
      task.dueDate || '',
      task.estimatedHours || '',
      task.actualHours || '',
      task.storyPoints || '',
      task.progress,
      task.effortLevel,
      task.complexity,
      task.riskLevel
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Add summary section
    const summary = [
      '',
      'ANALYTICS SUMMARY',
      `Total Tasks,${analytics.totalTasks}`,
      `Completed Tasks,${analytics.completedTasks}`,
      `Completion Rate,${analytics.completionRate.toFixed(2)}%`,
      `Average Completion Time,${analytics.averageCompletionTime.toFixed(2)} days`,
      `Blocked Tasks,${analytics.blockedTasks}`,
      `Overdue Tasks,${analytics.overdueTasks}`
    ].join('\n');

    return csvContent + '\n' + summary;
  }

  private createError(code: string, message: string, originalError?: any): TasksError {
    const error = new Error(message) as TasksError;
    error.code = code;
    error.details = originalError;
    return error;
  }
}

// Export singleton instance
export const taskAnalytics = new TaskAnalyticsOperations();
