import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  Milestone, 
  UseMilestoneDataReturn, 
  MilestoneError,
  CreateMilestoneData,
  UpdateMilestoneData,
  MilestoneFilter
} from '../types';
import { milestoneAPI } from '../api';

interface UseMilestoneDataOptions {
  projectId?: string;
  filter?: MilestoneFilter;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealtime?: boolean;
}

export function useMilestoneData(options: UseMilestoneDataOptions = {}): UseMilestoneDataReturn {
  const { 
    projectId, 
    filter = {}, 
    autoRefresh = true, 
    refreshInterval = 30000,
    enableRealtime = true 
  } = options;
  
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<MilestoneError | null>(null);

  // Merge projectId into filter
  const mergedFilter = useMemo(() => ({
    ...filter,
    projectId: projectId || filter.projectId
  }), [filter, projectId]);

  // Fetch milestones
  const fetchMilestones = useCallback(async () => {
    try {
      setError(null);
      const response = await milestoneAPI.milestones.list(mergedFilter);
      setMilestones(response.milestones);
    } catch (err) {
      const error = err as MilestoneError;
      setError(error);
      console.error('Failed to fetch milestones:', error);
    } finally {
      setLoading(false);
    }
  }, [mergedFilter]);

  // Create milestone
  const createMilestone = useCallback(async (milestoneData: CreateMilestoneData): Promise<Milestone> => {
    try {
      setError(null);
      
      // If we have dependencies, use the combined method
      if (milestoneData.dependencies && milestoneData.dependencies.length > 0) {
        const { milestone } = await milestoneAPI.createMilestoneWithDependencies(
          milestoneData,
          milestoneData.dependencies
        );
        
        // Add to local state
        setMilestones(prev => [milestone, ...prev]);
        return milestone;
      } else {
        // Simple creation without dependencies
        const newMilestone = await milestoneAPI.milestones.create(milestoneData);
        
        // Add to local state
        setMilestones(prev => [newMilestone, ...prev]);
        return newMilestone;
      }
    } catch (err) {
      const error = err as MilestoneError;
      setError(error);
      throw error;
    }
  }, []);

  // Update milestone
  const updateMilestone = useCallback(async (
    milestoneId: string, 
    updates: UpdateMilestoneData
  ): Promise<Milestone> => {
    try {
      setError(null);
      const updatedMilestone = await milestoneAPI.milestones.update(milestoneId, updates);
      
      // Update local state
      setMilestones(prev => prev.map(milestone => 
        milestone.id === milestoneId ? updatedMilestone : milestone
      ));
      
      return updatedMilestone;
    } catch (err) {
      const error = err as MilestoneError;
      setError(error);
      throw error;
    }
  }, []);

  // Delete milestone
  const deleteMilestone = useCallback(async (milestoneId: string): Promise<void> => {
    try {
      setError(null);
      
      // Use cleanup method to handle dependencies
      await milestoneAPI.deleteMilestoneWithCleanup(milestoneId);
      
      // Remove from local state
      setMilestones(prev => prev.filter(milestone => milestone.id !== milestoneId));
    } catch (err) {
      const error = err as MilestoneError;
      setError(error);
      throw error;
    }
  }, []);

  // Calculate milestone progress
  const calculateProgress = useCallback(async (milestoneId: string): Promise<number> => {
    try {
      setError(null);
      const progress = await milestoneAPI.milestones.calculateProgress(milestoneId);
      
      // Update local state with new progress
      setMilestones(prev => prev.map(milestone => 
        milestone.id === milestoneId 
          ? { ...milestone, progress } 
          : milestone
      ));
      
      return progress;
    } catch (err) {
      const error = err as MilestoneError;
      setError(error);
      throw error;
    }
  }, []);

  // Archive milestone
  const archiveMilestone = useCallback(async (milestoneId: string): Promise<void> => {
    try {
      await updateMilestone(milestoneId, { isArchived: true });
    } catch (err) {
      throw err;
    }
  }, [updateMilestone]);

  // Restore milestone
  const restoreMilestone = useCallback(async (milestoneId: string): Promise<void> => {
    try {
      await updateMilestone(milestoneId, { isArchived: false });
    } catch (err) {
      throw err;
    }
  }, [updateMilestone]);

  // Initial fetch
  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchMilestones();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchMilestones]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealtime) return;

    const handleMilestoneEvent = (event: CustomEvent) => {
      const { type, milestoneId, milestone, changes } = event.detail;

      switch (type) {
        case 'milestone-created':
          // Only add if not already in state (avoid duplicates)
          setMilestones(prev => {
            if (prev.some(m => m.id === milestone.id)) return prev;
            return [milestone, ...prev];
          });
          break;

        case 'milestone-updated':
          setMilestones(prev => prev.map(m => 
            m.id === milestoneId ? { ...m, ...changes } : m
          ));
          break;

        case 'milestone-deleted':
          setMilestones(prev => prev.filter(m => m.id !== milestoneId));
          break;

        case 'milestone-completed':
          setMilestones(prev => prev.map(m => 
            m.id === milestoneId 
              ? { ...m, status: 'completed', progress: 100, completedAt: new Date().toISOString() }
              : m
          ));
          break;

        case 'progress-updated':
          const { progress } = event.detail;
          setMilestones(prev => prev.map(m => 
            m.id === milestoneId ? { ...m, progress } : m
          ));
          break;
      }
    };

    // Listen for milestone events
    window.addEventListener('milestone-event', handleMilestoneEvent as EventListener);

    // Listen for cross-tab updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'milestones_updated') {
        fetchMilestones();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('milestone-event', handleMilestoneEvent as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchMilestones, enableRealtime]);

  // Computed values
  const completedMilestones = useMemo(() => 
    milestones.filter(m => m.status === 'completed'),
    [milestones]
  );

  const activeMilestones = useMemo(() => 
    milestones.filter(m => m.status === 'in_progress'),
    [milestones]
  );

  const overdueMilestones = useMemo(() => {
    const now = new Date();
    return milestones.filter(m => 
      m.dueDate && 
      new Date(m.dueDate) < now && 
      m.status !== 'completed' && 
      m.status !== 'cancelled'
    );
  }, [milestones]);

  const upcomingMilestones = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    return milestones.filter(m => 
      m.dueDate && 
      new Date(m.dueDate) >= now && 
      new Date(m.dueDate) <= thirtyDaysFromNow &&
      m.status !== 'completed' && 
      m.status !== 'cancelled'
    );
  }, [milestones]);

  const averageProgress = useMemo(() => {
    if (milestones.length === 0) return 0;
    const totalProgress = milestones.reduce((sum, m) => sum + m.progress, 0);
    return Math.round(totalProgress / milestones.length);
  }, [milestones]);

  return {
    milestones,
    loading,
    error,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    calculateProgress,
    refetch: fetchMilestones,
    
    // Additional convenience methods
    archiveMilestone,
    restoreMilestone,
    
    // Computed values
    completedMilestones,
    activeMilestones,
    overdueMilestones,
    upcomingMilestones,
    averageProgress,
    
    // Stats
    stats: {
      total: milestones.length,
      completed: completedMilestones.length,
      active: activeMilestones.length,
      overdue: overdueMilestones.length,
      upcoming: upcomingMilestones.length,
      averageProgress
    }
  };
}