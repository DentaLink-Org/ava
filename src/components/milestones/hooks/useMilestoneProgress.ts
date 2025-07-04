import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  MilestoneProgress,
  UseMilestoneProgressReturn,
  ProgressTrend,
  MilestoneError
} from '../types';
import { milestoneAPI } from '../api';

interface UseMilestoneProgressOptions {
  milestoneId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealtime?: boolean;
}

export function useMilestoneProgress(options: UseMilestoneProgressOptions = {}): UseMilestoneProgressReturn {
  const { 
    milestoneId,
    autoRefresh = true, 
    refreshInterval = 60000, // Update every minute
    enableRealtime = true 
  } = options;
  
  const [progress, setProgress] = useState<MilestoneProgress[]>([]);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<MilestoneError | null>(null);
  const [trend, setTrend] = useState<ProgressTrend | null>(null);

  // Fetch progress history
  const fetchProgress = useCallback(async () => {
    if (!milestoneId) {
      setProgress([]);
      setCurrentProgress(0);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Fetch progress history
      const { progress: progressHistory } = await milestoneAPI.progress.getProgressHistory(milestoneId);
      setProgress(progressHistory);
      
      // Get latest progress
      const latestProgress = await milestoneAPI.progress.getLatestProgress(milestoneId);
      if (latestProgress) {
        setCurrentProgress(latestProgress.progressPercentage);
      } else {
        setCurrentProgress(0);
      }
      
      // Get trend analysis
      const progressTrend = await milestoneAPI.progress.getProgressTrend(milestoneId);
      setTrend(progressTrend);
      
    } catch (err) {
      const error = err as MilestoneError;
      setError(error);
      console.error('Failed to fetch milestone progress:', error);
    } finally {
      setLoading(false);
    }
  }, [milestoneId]);

  // Update progress
  const updateProgress = useCallback(async (
    targetMilestoneId: string, 
    progressValue: number, 
    notes?: string
  ): Promise<void> => {
    try {
      setError(null);
      
      // Calculate task counts (mock for now)
      const totalTasks = 20; // In real implementation, get from milestone
      const completedTasks = Math.round((progressValue / 100) * totalTasks);
      
      // Record new progress
      const newProgress = await milestoneAPI.progress.recordProgress(
        targetMilestoneId,
        progressValue,
        completedTasks,
        totalTasks,
        notes
      );
      
      // Update local state if it's for the current milestone
      if (targetMilestoneId === milestoneId) {
        setProgress(prev => [newProgress, ...prev]);
        setCurrentProgress(progressValue);
        
        // Update milestone progress
        await milestoneAPI.milestones.update(targetMilestoneId, { 
          progress: progressValue 
        });
        
        // Refresh trend
        const newTrend = await milestoneAPI.progress.getProgressTrend(targetMilestoneId);
        setTrend(newTrend);
      }
    } catch (err) {
      const error = err as MilestoneError;
      setError(error);
      throw error;
    }
  }, [milestoneId]);

  // Get progress history for a specific milestone
  const getProgressHistory = useCallback((targetMilestoneId: string): MilestoneProgress[] => {
    if (targetMilestoneId === milestoneId) {
      return progress;
    }
    // For other milestones, would need to fetch separately
    return [];
  }, [milestoneId, progress]);

  // Get progress trend for a specific milestone
  const getProgressTrend = useCallback((targetMilestoneId: string): ProgressTrend => {
    if (targetMilestoneId === milestoneId && trend) {
      return trend;
    }
    // Default trend
    return {
      trend: 'stable',
      velocity: 0,
      estimatedCompletion: 'unknown',
      confidence: 0
    };
  }, [milestoneId, trend]);

  // Calculate progress from tasks
  const calculateFromTasks = useCallback(async (
    targetMilestoneId: string,
    completedTasks: number,
    totalTasks: number
  ): Promise<void> => {
    try {
      setError(null);
      
      const newProgress = await milestoneAPI.progress.calculateFromTasks(
        targetMilestoneId,
        completedTasks,
        totalTasks
      );
      
      // Update local state if it's for the current milestone
      if (targetMilestoneId === milestoneId) {
        setProgress(prev => [newProgress, ...prev]);
        setCurrentProgress(newProgress.progressPercentage);
        
        // Update milestone
        await milestoneAPI.milestones.update(targetMilestoneId, { 
          progress: newProgress.progressPercentage 
        });
      }
    } catch (err) {
      const error = err as MilestoneError;
      setError(error);
      throw error;
    }
  }, [milestoneId]);

  // Initial fetch
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0 || !milestoneId) return;

    const interval = setInterval(() => {
      fetchProgress();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, milestoneId, fetchProgress]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealtime || !milestoneId) return;

    const handleProgressEvent = (event: CustomEvent) => {
      const { type, milestoneId: eventMilestoneId, progress: progressData } = event.detail;
      
      // Only handle events for the current milestone
      if (eventMilestoneId !== milestoneId) return;

      switch (type) {
        case 'progress-recorded':
        case 'progress-calculated':
          setProgress(prev => {
            // Avoid duplicates
            if (prev.some(p => p.id === progressData.id)) return prev;
            return [progressData, ...prev];
          });
          setCurrentProgress(progressData.progressPercentage);
          break;

        case 'progress-deleted':
          const { progressId } = event.detail;
          setProgress(prev => prev.filter(p => p.id !== progressId));
          break;
      }
    };

    // Listen for progress events
    window.addEventListener('milestone-progress-event', handleProgressEvent as EventListener);

    return () => {
      window.removeEventListener('milestone-progress-event', handleProgressEvent as EventListener);
    };
  }, [milestoneId, enableRealtime]);

  // Computed values
  const progressHistory = useMemo(() => 
    progress.sort((a, b) => 
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    ),
    [progress]
  );

  const recentProgress = useMemo(() => 
    progressHistory.slice(0, 10),
    [progressHistory]
  );

  const progressStats = useMemo(() => {
    if (progress.length === 0) return null;

    const values = progress.map(p => p.progressPercentage);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate velocity over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentProgress = progress.filter(p => 
      new Date(p.recordedAt) >= sevenDaysAgo
    );
    
    let weeklyVelocity = 0;
    if (recentProgress.length >= 2) {
      const oldest = recentProgress[recentProgress.length - 1];
      const newest = recentProgress[0];
      weeklyVelocity = newest.progressPercentage - oldest.progressPercentage;
    }

    return {
      min,
      max,
      average: Math.round(avg),
      weeklyVelocity,
      totalRecords: progress.length
    };
  }, [progress]);

  return {
    progress: progressHistory,
    currentProgress,
    loading,
    error,
    updateProgress,
    getProgressHistory,
    getProgressTrend,
    refetch: fetchProgress,
    
    // Additional methods
    calculateFromTasks,
    
    // Computed values
    trend,
    recentProgress,
    progressStats,
    
    // Convenience getters
    isComplete: currentProgress === 100,
    isOverdue: trend?.trend === 'decreasing' && currentProgress < 100,
    estimatedCompletion: trend?.estimatedCompletion || 'unknown'
  };
}