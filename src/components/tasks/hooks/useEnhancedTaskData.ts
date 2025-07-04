import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  Task, 
  TaskFilter, 
  CreateTaskData, 
  UpdateTaskData, 
  BulkTaskUpdate,
  TaskBatchResult,
  TaskValidationResult,
  TasksError,
  TaskHistory,
  TasksResponse
} from '../types';
import { enhancedTaskOperations } from '../api/enhanced-task-operations';

/**
 * Enhanced Task Data Hook Configuration
 */
interface UseEnhancedTaskDataOptions {
  projectId?: string;
  milestoneId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealtime?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;
  enableOptimisticUpdates?: boolean;
  enableBulkOperations?: boolean;
  pageSize?: number;
  enablePagination?: boolean;
}

/**
 * Enhanced Task Data Hook Return Type
 */
interface UseEnhancedTaskDataReturn {
  // Core data
  tasks: Task[];
  loading: boolean;
  error: TasksError | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Cache status
  isStale: boolean;
  lastFetch: Date | null;
  lastUpdated: Date | null;
  
  // Connection status
  isConnected: boolean;
  isRealtimeEnabled: boolean;
  
  // CRUD operations
  createTask: (taskData: CreateTaskData) => Promise<Task>;
  updateTask: (taskId: string, updates: UpdateTaskData) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: string, newPosition: number) => Promise<void>;
  
  // Bulk operations
  bulkUpdateTasks: (operation: BulkTaskUpdate) => Promise<TaskBatchResult>;
  bulkDeleteTasks: (taskIds: string[]) => Promise<TaskBatchResult>;
  bulkMoveTasks: (taskIds: string[], newStatus: string) => Promise<TaskBatchResult>;
  
  // Data management
  refetch: () => Promise<void>;
  invalidateCache: () => void;
  preloadNextPage: () => Promise<void>;
  
  // Filtering and search
  filter: TaskFilter;
  setFilter: (filter: Partial<TaskFilter>) => void;
  clearFilter: () => void;
  applyFiltersLocally: (customFilter: TaskFilter) => Task[];
  
  // Pagination controls
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  
  // Task operations
  getTask: (taskId: string) => Task | undefined;
  getTaskHistory: (taskId: string) => Promise<TaskHistory[]>;
  validateTask: (taskData: CreateTaskData | UpdateTaskData) => Promise<TaskValidationResult>;
  
  // Cache and performance
  getCacheSize: () => number;
  clearCache: () => void;
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
  
  // Real-time subscriptions
  subscribe: (callback: (event: TaskEvent) => void) => () => void;
  subscribeToTask: (taskId: string, callback: (task: Task) => void) => () => void;
}

/**
 * Task Event Type for Real-time Updates
 */
interface TaskEvent {
  type: 'task-created' | 'task-updated' | 'task-deleted' | 'task-moved' | 'tasks-bulk-updated';
  taskId?: string;
  task?: Task;
  tasks?: Task[];
  changes?: Partial<Task>;
  timestamp: string;
  userId?: string;
}

/**
 * Cache Entry Interface
 */
interface CacheEntry {
  data: TasksResponse;
  timestamp: number;
  filter: TaskFilter;
  expiry: number;
}

/**
 * Enhanced Task Data Hook Implementation
 * 
 * Provides comprehensive task data management with:
 * - Advanced caching with TTL
 * - Real-time subscriptions and updates
 * - Optimistic updates with rollback
 * - Bulk operations support
 * - Offline mode capabilities
 * - Intelligent pagination
 * - Cross-tab synchronization
 */
export function useEnhancedTaskData(options: UseEnhancedTaskDataOptions = {}): UseEnhancedTaskDataReturn {
  const {
    projectId,
    milestoneId,
    autoRefresh = true,
    refreshInterval = 30000,
    enableRealtime = true,
    enableCaching = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
    enableOptimisticUpdates = true,
    enableBulkOperations = true,
    pageSize = 50,
    enablePagination = true
  } = options;

  // Core state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TasksError | null>(null);
  const [filter, setFilterState] = useState<TaskFilter>({
    projectId,
    milestoneId,
    limit: enablePagination ? pageSize : undefined,
    offset: 0
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  // Cache and status state
  const [isStale, setIsStale] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(enableRealtime);

  // Refs for managing subscriptions and cache
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const subscriptionsRef = useRef<Map<string, (() => void)[]>>(new Map());
  const optimisticUpdatesRef = useRef<Map<string, Task>>(new Map());
  const realtimeListenerRef = useRef<((event: CustomEvent) => void) | null>(null);
  const isOfflineModeRef = useRef(false);

  // Helper function to generate cache key
  const getCacheKey = useCallback((filter: TaskFilter): string => {
    return JSON.stringify({
      ...filter,
      projectId: filter.projectId || projectId,
      milestoneId: filter.milestoneId || milestoneId
    });
  }, [projectId, milestoneId]);

  // Helper function to check if cache entry is valid
  const isCacheValid = useCallback((entry: CacheEntry): boolean => {
    return enableCaching && Date.now() < entry.expiry;
  }, [enableCaching]);

  // Enhanced fetch function with caching
  const fetchTasks = useCallback(async (filterOverride?: TaskFilter, fromCache = true): Promise<void> => {
    const currentFilter = filterOverride || filter;
    const cacheKey = getCacheKey(currentFilter);
    
    try {
      setError(null);
      
      // Check cache first
      if (fromCache && enableCaching) {
        const cachedEntry = cacheRef.current.get(cacheKey);
        if (cachedEntry && isCacheValid(cachedEntry)) {
          setTasks(cachedEntry.data.tasks);
          setTotalTasks(cachedEntry.data.total);
          setTotalPages(Math.ceil(cachedEntry.data.total / (cachedEntry.data.limit || cachedEntry.data.total)));
          setLastFetch(new Date(cachedEntry.timestamp));
          setIsStale(false);
          setLoading(false);
          return;
        }
      }
      
      // Fetch from API
      const response = await enhancedTaskOperations.list(currentFilter);
      
      // Update cache
      if (enableCaching) {
        cacheRef.current.set(cacheKey, {
          data: response,
          timestamp: Date.now(),
          filter: currentFilter,
          expiry: Date.now() + cacheTimeout
        });
      }
      
      // Update state
      setTasks(response.tasks);
      setTotalTasks(response.total);
      setTotalPages(Math.ceil(response.total / (response.limit || response.total)));
      setCurrentPage(response.page);
      setLastFetch(new Date());
      setLastUpdated(new Date());
      setIsStale(false);
      
    } catch (err) {
      const taskError = err as TasksError;
      setError(taskError);
      console.error('Failed to fetch tasks:', taskError);
      
      // If offline, try to use stale cache
      if (enableCaching && isOfflineModeRef.current) {
        const cachedEntry = cacheRef.current.get(cacheKey);
        if (cachedEntry) {
          setTasks(cachedEntry.data.tasks);
          setTotalTasks(cachedEntry.data.total);
          setTotalPages(Math.ceil(cachedEntry.data.total / (cachedEntry.data.limit || cachedEntry.data.total)));
          setIsStale(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [filter, getCacheKey, isCacheValid, enableCaching, cacheTimeout]);

  // CRUD Operations with optimistic updates
  const createTask = useCallback(async (taskData: CreateTaskData): Promise<Task> => {
    try {
      setError(null);
      
      const newTask = await enhancedTaskOperations.create(taskData);
      
      // Add to local state (optimistic update already handled by API)
      setTasks(prev => [newTask, ...prev]);
      setTotalTasks(prev => prev + 1);
      setLastUpdated(new Date());
      
      // Invalidate cache
      if (enableCaching) {
        cacheRef.current.clear();
      }
      
      return newTask;
    } catch (err) {
      const taskError = err as TasksError;
      setError(taskError);
      throw taskError;
    }
  }, [enableCaching]);

  const updateTask = useCallback(async (taskId: string, updates: UpdateTaskData): Promise<Task> => {
    try {
      setError(null);
      
      // Optimistic update
      if (enableOptimisticUpdates) {
        const currentTask = tasks.find(t => t.id === taskId);
        if (currentTask) {
          const optimisticTask = { ...currentTask, ...updates, updatedAt: new Date().toISOString() };
          optimisticUpdatesRef.current.set(taskId, currentTask);
          setTasks(prev => prev.map(task => task.id === taskId ? optimisticTask : task));
        }
      }
      
      const updatedTask = await enhancedTaskOperations.update(taskId, updates);
      
      // Update local state with actual result
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      setLastUpdated(new Date());
      
      // Clear optimistic update
      optimisticUpdatesRef.current.delete(taskId);
      
      // Invalidate cache
      if (enableCaching) {
        cacheRef.current.clear();
      }
      
      return updatedTask;
    } catch (err) {
      // Rollback optimistic update
      if (enableOptimisticUpdates) {
        const originalTask = optimisticUpdatesRef.current.get(taskId);
        if (originalTask) {
          setTasks(prev => prev.map(task => task.id === taskId ? originalTask : task));
          optimisticUpdatesRef.current.delete(taskId);
        }
      }
      
      const taskError = err as TasksError;
      setError(taskError);
      throw taskError;
    }
  }, [tasks, enableOptimisticUpdates, enableCaching]);

  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    try {
      setError(null);
      
      // Optimistic update
      let removedTask: Task | undefined;
      if (enableOptimisticUpdates) {
        removedTask = tasks.find(t => t.id === taskId);
        if (removedTask) {
          optimisticUpdatesRef.current.set(taskId, removedTask);
          setTasks(prev => prev.filter(task => task.id !== taskId));
          setTotalTasks(prev => prev - 1);
        }
      }
      
      await enhancedTaskOperations.delete(taskId);
      
      // Confirm removal
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setTotalTasks(prev => prev - 1);
      setLastUpdated(new Date());
      
      // Clear optimistic update
      optimisticUpdatesRef.current.delete(taskId);
      
      // Invalidate cache
      if (enableCaching) {
        cacheRef.current.clear();
      }
    } catch (err) {
      // Rollback optimistic update
      if (enableOptimisticUpdates && optimisticUpdatesRef.current.has(taskId)) {
        const originalTask = optimisticUpdatesRef.current.get(taskId)!;
        setTasks(prev => [originalTask, ...prev]);
        setTotalTasks(prev => prev + 1);
        optimisticUpdatesRef.current.delete(taskId);
      }
      
      const taskError = err as TasksError;
      setError(taskError);
      throw taskError;
    }
  }, [tasks, enableOptimisticUpdates, enableCaching]);

  const moveTask = useCallback(async (taskId: string, newStatus: string, newPosition: number): Promise<void> => {
    try {
      setError(null);
      
      // Optimistic update for move operation
      if (enableOptimisticUpdates) {
        const taskToMove = tasks.find(t => t.id === taskId);
        if (taskToMove) {
          optimisticUpdatesRef.current.set(taskId, taskToMove);
          
          // Update task with new status and position
          const updatedTask = {
            ...taskToMove,
            status: { ...taskToMove.status, id: newStatus },
            position: newPosition,
            updatedAt: new Date().toISOString()
          };
          
          setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
        }
      }
      
      await enhancedTaskOperations.move(taskId, newStatus, newPosition);
      
      // Clear optimistic update
      optimisticUpdatesRef.current.delete(taskId);
      setLastUpdated(new Date());
      
      // Invalidate cache
      if (enableCaching) {
        cacheRef.current.clear();
      }
    } catch (err) {
      // Rollback optimistic update
      if (enableOptimisticUpdates && optimisticUpdatesRef.current.has(taskId)) {
        const originalTask = optimisticUpdatesRef.current.get(taskId)!;
        setTasks(prev => prev.map(task => task.id === taskId ? originalTask : task));
        optimisticUpdatesRef.current.delete(taskId);
      }
      
      const taskError = err as TasksError;
      setError(taskError);
      throw taskError;
    }
  }, [tasks, enableOptimisticUpdates, enableCaching]);

  // Bulk operations
  const bulkUpdateTasks = useCallback(async (operation: BulkTaskUpdate): Promise<TaskBatchResult> => {
    if (!enableBulkOperations) {
      throw new Error('Bulk operations are disabled');
    }
    
    try {
      setError(null);
      const result = await enhancedTaskOperations.bulkUpdate(operation);
      
      // Update local state with successful updates
      if (result.success && result.results.length > 0) {
        const successfulTasks = result.results
          .filter(r => r.success && r.data)
          .map(r => r.data!);
        
        setTasks(prev => prev.map(task => {
          const updatedTask = successfulTasks.find(ut => ut.id === task.id);
          return updatedTask || task;
        }));
        
        setLastUpdated(new Date());
        
        // Invalidate cache
        if (enableCaching) {
          cacheRef.current.clear();
        }
      }
      
      return result;
    } catch (err) {
      const taskError = err as TasksError;
      setError(taskError);
      throw taskError;
    }
  }, [enableBulkOperations, enableCaching]);

  const bulkDeleteTasks = useCallback(async (taskIds: string[]): Promise<TaskBatchResult> => {
    if (!enableBulkOperations) {
      throw new Error('Bulk operations are disabled');
    }
    
    // This would need to be implemented in the API
    // For now, we'll simulate it by calling delete for each task
    const results: TaskBatchResult = {
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
        await deleteTask(taskId);
        results.results.push({ taskId, success: true });
        results.summary.successful++;
      } catch (error) {
        results.results.push({ 
          taskId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        results.summary.failed++;
        results.errorCount++;
      }
      results.processedCount++;
    }
    
    results.success = results.errorCount === 0;
    return results;
  }, [enableBulkOperations, deleteTask]);

  const bulkMoveTasks = useCallback(async (taskIds: string[], newStatus: string): Promise<TaskBatchResult> => {
    if (!enableBulkOperations) {
      throw new Error('Bulk operations are disabled');
    }
    
    // This would need to be implemented in the API
    // For now, we'll simulate it by calling move for each task
    const results: TaskBatchResult = {
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
    
    for (let i = 0; i < taskIds.length; i++) {
      const taskId = taskIds[i];
      try {
        await moveTask(taskId, newStatus, i);
        results.results.push({ taskId, success: true });
        results.summary.successful++;
      } catch (error) {
        results.results.push({ 
          taskId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        results.summary.failed++;
        results.errorCount++;
      }
      results.processedCount++;
    }
    
    results.success = results.errorCount === 0;
    return results;
  }, [enableBulkOperations, moveTask]);

  // Filter management
  const setFilter = useCallback((newFilter: Partial<TaskFilter>) => {
    setFilterState(prev => ({ 
      ...prev, 
      ...newFilter, 
      projectId: newFilter.projectId || projectId,
      milestoneId: newFilter.milestoneId || milestoneId,
      offset: 0 // Reset to first page when filter changes
    }));
    setCurrentPage(1);
  }, [projectId, milestoneId]);

  const clearFilter = useCallback(() => {
    setFilterState({
      projectId,
      milestoneId,
      limit: enablePagination ? pageSize : undefined,
      offset: 0
    });
    setCurrentPage(1);
  }, [projectId, milestoneId, enablePagination, pageSize]);

  const applyFiltersLocally = useCallback((customFilter: TaskFilter): Task[] => {
    // This would implement local filtering logic
    // For now, return all tasks (server-side filtering is preferred)
    return tasks;
  }, [tasks]);

  // Pagination controls
  const nextPage = useCallback(async () => {
    if (currentPage < totalPages) {
      const newOffset = currentPage * (pageSize || 50);
      await fetchTasks({ ...filter, offset: newOffset });
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages, pageSize, filter, fetchTasks]);

  const previousPage = useCallback(async () => {
    if (currentPage > 1) {
      const newOffset = (currentPage - 2) * (pageSize || 50);
      await fetchTasks({ ...filter, offset: newOffset });
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage, pageSize, filter, fetchTasks]);

  const goToPage = useCallback(async (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const newOffset = (page - 1) * (pageSize || 50);
      await fetchTasks({ ...filter, offset: newOffset });
      setCurrentPage(page);
    }
  }, [totalPages, pageSize, filter, fetchTasks]);

  // Data management
  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchTasks(filter, false); // Force fetch, skip cache
  }, [fetchTasks, filter]);

  const invalidateCache = useCallback(() => {
    cacheRef.current.clear();
    setIsStale(true);
  }, []);

  const preloadNextPage = useCallback(async () => {
    if (enablePagination && currentPage < totalPages) {
      const nextOffset = currentPage * (pageSize || 50);
      const nextPageFilter = { ...filter, offset: nextOffset };
      await fetchTasks(nextPageFilter);
    }
  }, [enablePagination, currentPage, totalPages, pageSize, filter, fetchTasks]);

  // Utility functions
  const getTask = useCallback((taskId: string): Task | undefined => {
    return tasks.find(t => t.id === taskId);
  }, [tasks]);

  const getTaskHistory = useCallback(async (taskId: string): Promise<TaskHistory[]> => {
    return enhancedTaskOperations.getTaskHistory(taskId);
  }, []);

  const validateTask = useCallback(async (taskData: CreateTaskData | UpdateTaskData): Promise<TaskValidationResult> => {
    return enhancedTaskOperations.validateTask(taskData);
  }, []);

  // Cache management
  const getCacheSize = useCallback((): number => {
    return cacheRef.current.size;
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    setIsStale(true);
  }, []);

  const enableOfflineMode = useCallback(() => {
    isOfflineModeRef.current = true;
    setIsConnected(false);
  }, []);

  const disableOfflineMode = useCallback(() => {
    isOfflineModeRef.current = false;
    setIsConnected(true);
  }, []);

  // Real-time subscriptions
  const subscribe = useCallback((callback: (event: TaskEvent) => void): (() => void) => {
    const subscriptionId = Math.random().toString(36).substr(2, 9);
    const currentSubscriptions = subscriptionsRef.current.get('global') || [];
    
    const unsubscribe = () => {
      subscriptionsRef.current.set('global', 
        currentSubscriptions.filter(sub => sub !== unsubscribe)
      );
    };
    
    currentSubscriptions.push(unsubscribe);
    subscriptionsRef.current.set('global', currentSubscriptions);
    
    // Add event listener for task events
    const handleTaskEvent = (event: CustomEvent) => {
      callback(event.detail as TaskEvent);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('enhanced-task-event', handleTaskEvent as EventListener);
      
      // Return cleanup function
      return () => {
        window.removeEventListener('enhanced-task-event', handleTaskEvent as EventListener);
        unsubscribe();
      };
    }
    
    return unsubscribe;
  }, []);

  const subscribeToTask = useCallback((taskId: string, callback: (task: Task) => void): (() => void) => {
    return subscribe((event) => {
      if (event.taskId === taskId && event.task) {
        callback(event.task);
      }
    });
  }, [subscribe]);

  // Effect for initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Effect for filter changes
  useEffect(() => {
    if (lastFetch) { // Don't refetch on initial load
      setLoading(true);
      fetchTasks();
    }
  }, [filter]);

  // Effect for auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!loading && !isOfflineModeRef.current) {
        fetchTasks(filter, false); // Force refresh
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading, filter, fetchTasks]);

  // Effect for real-time updates
  useEffect(() => {
    if (!enableRealtime) return;

    const handleTaskEvent = (event: CustomEvent) => {
      const taskEvent = event.detail as TaskEvent;
      setLastUpdated(new Date());
      
      switch (taskEvent.type) {
        case 'task-created':
          if (taskEvent.task) {
            setTasks(prev => {
              // Avoid duplicates
              if (prev.some(t => t.id === taskEvent.task!.id)) return prev;
              return [taskEvent.task!, ...prev];
            });
            setTotalTasks(prev => prev + 1);
          }
          break;
          
        case 'task-updated':
          if (taskEvent.task) {
            setTasks(prev => prev.map(t => t.id === taskEvent.task!.id ? taskEvent.task! : t));
          }
          break;
          
        case 'task-deleted':
          if (taskEvent.taskId) {
            setTasks(prev => prev.filter(t => t.id !== taskEvent.taskId));
            setTotalTasks(prev => prev - 1);
          }
          break;
          
        case 'task-moved':
          if (taskEvent.task) {
            setTasks(prev => prev.map(t => t.id === taskEvent.task!.id ? taskEvent.task! : t));
          }
          break;
          
        case 'tasks-bulk-updated':
          if (taskEvent.tasks) {
            setTasks(prev => {
              const updatedTaskIds = new Set(taskEvent.tasks!.map(t => t.id));
              return prev.map(t => {
                const updatedTask = taskEvent.tasks!.find(ut => ut.id === t.id);
                return updatedTask || t;
              });
            });
          }
          break;
      }
      
      // Invalidate cache on any change
      if (enableCaching) {
        cacheRef.current.clear();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('enhanced-task-event', handleTaskEvent as EventListener);
      realtimeListenerRef.current = handleTaskEvent;
      
      return () => {
        window.removeEventListener('enhanced-task-event', handleTaskEvent as EventListener);
        realtimeListenerRef.current = null;
      };
    }
  }, [enableRealtime, enableCaching]);

  // Effect for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'enhanced_tasks_updated') {
        setIsStale(true);
        if (autoRefresh) {
          fetchTasks(filter, false);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [autoRefresh, filter, fetchTasks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all subscriptions
      subscriptionsRef.current.clear();
      
      // Clear optimistic updates
      optimisticUpdatesRef.current.clear();
      
      // Clear cache if needed
      if (!enableCaching) {
        cacheRef.current.clear();
      }
    };
  }, [enableCaching]);

  // Computed values
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    // Core data
    tasks,
    loading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    totalTasks,
    hasNextPage,
    hasPreviousPage,
    
    // Cache status
    isStale,
    lastFetch,
    lastUpdated,
    
    // Connection status
    isConnected,
    isRealtimeEnabled,
    
    // CRUD operations
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    
    // Bulk operations
    bulkUpdateTasks,
    bulkDeleteTasks,
    bulkMoveTasks,
    
    // Data management
    refetch,
    invalidateCache,
    preloadNextPage,
    
    // Filtering and search
    filter,
    setFilter,
    clearFilter,
    applyFiltersLocally,
    
    // Pagination controls
    nextPage,
    previousPage,
    goToPage,
    
    // Task operations
    getTask,
    getTaskHistory,
    validateTask,
    
    // Cache and performance
    getCacheSize,
    clearCache,
    enableOfflineMode,
    disableOfflineMode,
    
    // Real-time subscriptions
    subscribe,
    subscribeToTask
  };
}