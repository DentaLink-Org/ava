import type { 
  MilestoneProgress,
  MilestoneProgressResponse,
  ProgressTrend,
  MilestoneError
} from '../types';

// Mock progress history data
const mockProgressHistory: MilestoneProgress[] = [
  {
    id: 'progress-1',
    milestoneId: 'milestone-1',
    progressPercentage: 10,
    completedTasks: 2,
    totalTasks: 20,
    notes: 'Initial setup completed',
    recordedAt: '2025-06-05T10:00:00Z',
    recordedBy: 'user-1',
    metadata: {}
  },
  {
    id: 'progress-2',
    milestoneId: 'milestone-1',
    progressPercentage: 25,
    completedTasks: 5,
    totalTasks: 20,
    notes: 'Core features implemented',
    recordedAt: '2025-06-15T14:30:00Z',
    recordedBy: 'user-1',
    metadata: {}
  },
  {
    id: 'progress-3',
    milestoneId: 'milestone-1',
    progressPercentage: 45,
    completedTasks: 9,
    totalTasks: 20,
    notes: 'Testing phase started',
    recordedAt: '2025-06-25T09:15:00Z',
    recordedBy: 'user-2',
    metadata: {}
  }
];

// Simulate API delay
const simulateDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate unique ID
const generateId = () => `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

class MilestoneProgressOperations {
  private progressHistory: MilestoneProgress[] = [...mockProgressHistory];

  // Get progress history for a milestone
  async getProgressHistory(milestoneId: string): Promise<MilestoneProgressResponse> {
    await simulateDelay();

    try {
      const progress = this.progressHistory
        .filter(p => p.milestoneId === milestoneId)
        .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

      return {
        progress,
        total: progress.length
      };
    } catch (error) {
      throw this.createError('FETCH_PROGRESS_FAILED', 'Failed to fetch progress history', error);
    }
  }

  // Record new progress
  async recordProgress(
    milestoneId: string,
    progressPercentage: number,
    completedTasks: number,
    totalTasks: number,
    notes?: string
  ): Promise<MilestoneProgress> {
    await simulateDelay();

    try {
      // Validate progress percentage
      if (progressPercentage < 0 || progressPercentage > 100) {
        throw this.createError('VALIDATION_ERROR', 'Progress percentage must be between 0 and 100');
      }

      const now = new Date().toISOString();
      const newProgress: MilestoneProgress = {
        id: generateId(),
        milestoneId,
        progressPercentage,
        completedTasks,
        totalTasks,
        notes,
        recordedAt: now,
        recordedBy: 'user-1', // In real implementation, get from auth context
        metadata: {
          automatic: false,
          source: 'manual'
        }
      };

      this.progressHistory.unshift(newProgress);

      // Emit event for real-time updates
      this.emitProgressEvent('progress-recorded', {
        milestoneId,
        progress: newProgress
      });

      return { ...newProgress };
    } catch (error) {
      if (error instanceof Error && error.message.includes('VALIDATION_ERROR')) {
        throw error;
      }
      throw this.createError('RECORD_PROGRESS_FAILED', 'Failed to record progress', error);
    }
  }

  // Calculate progress from tasks
  async calculateFromTasks(milestoneId: string, completedTasks: number, totalTasks: number): Promise<MilestoneProgress> {
    await simulateDelay(200);

    try {
      const progressPercentage = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

      const now = new Date().toISOString();
      const calculatedProgress: MilestoneProgress = {
        id: generateId(),
        milestoneId,
        progressPercentage,
        completedTasks,
        totalTasks,
        notes: 'Automatically calculated from task completion',
        recordedAt: now,
        recordedBy: 'system',
        metadata: {
          automatic: true,
          source: 'task-calculation'
        }
      };

      this.progressHistory.unshift(calculatedProgress);

      // Emit event for real-time updates
      this.emitProgressEvent('progress-calculated', {
        milestoneId,
        progress: calculatedProgress
      });

      return { ...calculatedProgress };
    } catch (error) {
      throw this.createError('CALCULATE_PROGRESS_FAILED', 'Failed to calculate progress', error);
    }
  }

  // Get progress trend analysis
  async getProgressTrend(milestoneId: string): Promise<ProgressTrend> {
    await simulateDelay();

    try {
      const history = this.progressHistory
        .filter(p => p.milestoneId === milestoneId)
        .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

      if (history.length < 2) {
        return {
          trend: 'stable',
          velocity: 0,
          estimatedCompletion: 'insufficient-data',
          confidence: 0
        };
      }

      // Calculate velocity (progress per day)
      const recentHistory = history.slice(-5); // Last 5 data points
      const oldestRecord = recentHistory[0];
      const newestRecord = recentHistory[recentHistory.length - 1];
      
      const daysDiff = Math.max(1, 
        (new Date(newestRecord.recordedAt).getTime() - new Date(oldestRecord.recordedAt).getTime()) 
        / (1000 * 60 * 60 * 24)
      );
      
      const progressDiff = newestRecord.progressPercentage - oldestRecord.progressPercentage;
      const velocity = progressDiff / daysDiff;

      // Determine trend
      let trend: ProgressTrend['trend'] = 'stable';
      if (velocity > 1) trend = 'increasing';
      else if (velocity < -0.5) trend = 'decreasing';

      // Estimate completion
      const remainingProgress = 100 - newestRecord.progressPercentage;
      let estimatedCompletion = 'unknown';
      
      if (velocity > 0) {
        const daysToComplete = remainingProgress / velocity;
        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + Math.ceil(daysToComplete));
        estimatedCompletion = completionDate.toISOString();
      }

      // Calculate confidence based on consistency
      const velocityVariance = this.calculateVelocityVariance(recentHistory);
      const confidence = Math.max(0, Math.min(100, 100 - (velocityVariance * 10)));

      return {
        trend,
        velocity: Math.round(velocity * 100) / 100,
        estimatedCompletion,
        confidence: Math.round(confidence)
      };
    } catch (error) {
      throw this.createError('TREND_ANALYSIS_FAILED', 'Failed to analyze progress trend', error);
    }
  }

  // Get latest progress for a milestone
  async getLatestProgress(milestoneId: string): Promise<MilestoneProgress | null> {
    await simulateDelay(200);

    const latestProgress = this.progressHistory
      .filter(p => p.milestoneId === milestoneId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];

    return latestProgress || null;
  }

  // Delete progress record
  async deleteProgress(progressId: string): Promise<void> {
    await simulateDelay();

    try {
      const index = this.progressHistory.findIndex(p => p.id === progressId);
      if (index === -1) {
        throw this.createError('PROGRESS_NOT_FOUND', `Progress record ${progressId} not found`);
      }

      const deletedProgress = this.progressHistory.splice(index, 1)[0];

      // Emit event for real-time updates
      this.emitProgressEvent('progress-deleted', {
        progressId,
        milestoneId: deletedProgress.milestoneId
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('PROGRESS_NOT_FOUND')) {
        throw error;
      }
      throw this.createError('DELETE_PROGRESS_FAILED', 'Failed to delete progress record', error);
    }
  }

  // Bulk record progress for multiple milestones
  async bulkRecordProgress(progressRecords: Omit<MilestoneProgress, 'id' | 'recordedAt' | 'recordedBy'>[]): Promise<MilestoneProgress[]> {
    await simulateDelay();

    try {
      const now = new Date().toISOString();
      const newProgressRecords: MilestoneProgress[] = [];

      for (const record of progressRecords) {
        const newProgress: MilestoneProgress = {
          ...record,
          id: generateId(),
          recordedAt: now,
          recordedBy: 'user-1', // In real implementation, get from auth context
          metadata: {
            ...record.metadata,
            bulk: true
          }
        };

        this.progressHistory.unshift(newProgress);
        newProgressRecords.push(newProgress);
      }

      // Emit event for real-time updates
      this.emitProgressEvent('bulk-progress-recorded', {
        records: newProgressRecords
      });

      return newProgressRecords;
    } catch (error) {
      throw this.createError('BULK_RECORD_FAILED', 'Failed to bulk record progress', error);
    }
  }

  // Private helper methods
  private calculateVelocityVariance(history: MilestoneProgress[]): number {
    if (history.length < 3) return 50; // High variance for insufficient data

    const velocities: number[] = [];
    
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];
      
      const daysDiff = Math.max(1,
        (new Date(curr.recordedAt).getTime() - new Date(prev.recordedAt).getTime()) 
        / (1000 * 60 * 60 * 24)
      );
      
      const progressDiff = curr.progressPercentage - prev.progressPercentage;
      velocities.push(progressDiff / daysDiff);
    }

    // Calculate variance
    const mean = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
    const variance = velocities.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / velocities.length;
    
    return Math.sqrt(variance);
  }

  private createError(code: string, message: string, originalError?: any): MilestoneError {
    const error = new Error(message) as MilestoneError;
    error.code = code;
    error.details = originalError;
    return error;
  }

  private emitProgressEvent(type: string, data: any): void {
    const event = new CustomEvent('milestone-progress-event', {
      detail: { 
        type, 
        ...data,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);
  }
}

// Export singleton instance
export const milestoneProgressOperations = new MilestoneProgressOperations();