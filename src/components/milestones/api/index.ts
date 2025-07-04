// Milestone API exports
// Central export file for all milestone-related API operations

import { milestoneOperations } from './milestone-operations';
import { milestoneProgressOperations } from './milestone-progress';
import { milestoneDependencyOperations } from './milestone-dependencies';

// Export individual operations
export { milestoneOperations } from './milestone-operations';
export { milestoneProgressOperations } from './milestone-progress';
export { milestoneDependencyOperations } from './milestone-dependencies';

// Create unified API service class
export class MilestoneAPIService {
  // Core milestone operations
  milestones = milestoneOperations;
  
  // Progress tracking operations
  progress = milestoneProgressOperations;
  
  // Dependency management operations
  dependencies = milestoneDependencyOperations;

  // Convenience methods that combine multiple operations
  async createMilestoneWithDependencies(
    milestoneData: Parameters<typeof milestoneOperations.create>[0],
    dependencies: Parameters<typeof milestoneDependencyOperations.create>[0][]
  ) {
    // Create milestone first
    const milestone = await this.milestones.create(milestoneData);
    
    // Then create dependencies
    const createdDependencies = [];
    for (const dep of dependencies) {
      try {
        const createdDep = await this.dependencies.create({
          ...dep,
          milestoneId: milestone.id
        });
        createdDependencies.push(createdDep);
      } catch (error) {
        console.error('Failed to create dependency:', error);
        // Continue with other dependencies
      }
    }
    
    return {
      milestone,
      dependencies: createdDependencies
    };
  }

  async getMilestoneWithFullDetails(milestoneId: string) {
    // Get milestone details
    const { milestone } = await this.milestones.get(milestoneId);
    
    // Get progress history
    const { progress } = await this.progress.getProgressHistory(milestoneId);
    
    // Get dependencies
    const { dependencies } = await this.dependencies.list(milestoneId);
    
    // Get progress trend
    const trend = await this.progress.getProgressTrend(milestoneId);
    
    return {
      ...milestone,
      progressHistory: progress,
      dependencies,
      trend
    };
  }

  async updateMilestoneProgress(milestoneId: string) {
    // Calculate progress from tasks
    const progress = await this.milestones.calculateProgress(milestoneId);
    
    // Get task counts (mock for now)
    const completedTasks = Math.floor(progress / 5); // Simplified calculation
    const totalTasks = 20; // Mock total
    
    // Record the calculated progress
    const progressRecord = await this.progress.calculateFromTasks(
      milestoneId,
      completedTasks,
      totalTasks
    );
    
    return progressRecord;
  }

  async validateProjectMilestones(projectId: string) {
    // Get all project milestones
    const { milestones } = await this.milestones.list({ projectId });
    
    // Validate dependencies
    const milestoneIds = milestones.map(m => m.id);
    const validationResult = await this.dependencies.validateDependencies(milestoneIds);
    
    // Check for overdue milestones
    const overdueMilestones = await this.milestones.getOverdue(projectId);
    
    // Get upcoming milestones
    const upcomingMilestones = await this.milestones.getUpcoming(30, projectId);
    
    return {
      milestones,
      validationResult,
      overdueMilestones,
      upcomingMilestones,
      stats: {
        total: milestones.length,
        completed: milestones.filter(m => m.status === 'completed').length,
        inProgress: milestones.filter(m => m.status === 'in_progress').length,
        pending: milestones.filter(m => m.status === 'pending').length,
        overdue: overdueMilestones.length,
        upcoming: upcomingMilestones.length
      }
    };
  }

  async deleteMilestoneWithCleanup(milestoneId: string) {
    // Get dependencies to clean up
    const { dependencies } = await this.dependencies.list(milestoneId);
    
    // Delete all dependencies first
    for (const dep of dependencies) {
      if (dep.milestoneId === milestoneId || dep.dependsOnId === milestoneId) {
        await this.dependencies.delete(dep.id);
      }
    }
    
    // Then delete the milestone
    await this.milestones.delete(milestoneId);
  }
}

// Export singleton instance
export const milestoneAPI = new MilestoneAPIService();

// Export error types for external use
export type { MilestoneError, DependencyError } from '../types';