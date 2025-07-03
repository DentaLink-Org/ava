import { useState, useEffect, useCallback } from 'react';
import type { Task, UseTaskManagerReturn, TasksError } from '../types';
import { taskOperations } from '../api/task-operations';

interface UseTaskManagerOptions {
  projectId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useTaskManager(options: UseTaskManagerOptions = {}): UseTaskManagerReturn {
  const { projectId, autoRefresh = true, refreshInterval = 30000 } = options;
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TasksError | null>(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const response = await taskOperations.list({ projectId });
      setTasks(response.tasks);
    } catch (err) {
      const error = err as TasksError;
      setError(error);
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Create task
  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      setError(null);
      const newTask = await taskOperations.create(taskData);
      
      // Add to local state
      setTasks(prev => [newTask, ...prev]);
      
      return newTask;
    } catch (err) {
      const error = err as TasksError;
      setError(error);
      throw error;
    }
  }, []);

  // Update task
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    try {
      setError(null);
      const updatedTask = await taskOperations.update(taskId, updates);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      return updatedTask;
    } catch (err) {
      const error = err as TasksError;
      setError(error);
      throw error;
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    try {
      setError(null);
      await taskOperations.delete(taskId);
      
      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      const error = err as TasksError;
      setError(error);
      throw error;
    }
  }, []);

  // Move task (drag and drop)
  const moveTask = useCallback(async (taskId: string, newStatus: string, newPosition: number): Promise<void> => {
    try {
      setError(null);
      
      // Optimistic update
      setTasks(prev => {
        const task = prev.find(t => t.id === taskId);
        if (!task) return prev;

        // Create updated task with new status and position
        const updatedTask = {
          ...task,
          status: { ...task.status, id: newStatus },
          position: newPosition
        };

        // Remove task from old position and insert at new position
        const otherTasks = prev.filter(t => t.id !== taskId);
        
        // Insert at correct position based on status
        const samePriorityTasks = otherTasks.filter(t => t.status.id === newStatus);
        samePriorityTasks.splice(newPosition, 0, updatedTask);
        
        // Combine with tasks from other statuses
        const differentStatusTasks = otherTasks.filter(t => t.status.id !== newStatus);
        
        return [...samePriorityTasks, ...differentStatusTasks];
      });

      // Update on server
      await taskOperations.move(taskId, newStatus, newPosition);
    } catch (err) {
      const error = err as TasksError;
      setError(error);
      
      // Revert optimistic update by refetching
      fetchTasks();
      throw error;
    }
  }, [fetchTasks]);

  // Refetch function
  const refetch = useCallback(() => {
    setLoading(true);
    fetchTasks();
  }, [fetchTasks]);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchTasks, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchTasks]);

  // Listen for storage events (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tasks_updated') {
        fetchTasks();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchTasks]);

  // Listen for custom events (real-time updates)
  useEffect(() => {
    const handleTaskEvent = (event: CustomEvent) => {
      const { type, taskId, task } = event.detail;
      
      switch (type) {
        case 'task-created':
          if (task && (!projectId || task.projectId === projectId)) {
            setTasks(prev => {
              // Avoid duplicates
              if (prev.some(t => t.id === task.id)) return prev;
              return [task, ...prev];
            });
          }
          break;
          
        case 'task-updated':
          if (task) {
            setTasks(prev => prev.map(t => t.id === task.id ? task : t));
          }
          break;
          
        case 'task-deleted':
          setTasks(prev => prev.filter(t => t.id !== taskId));
          break;
          
        case 'task-moved':
          // Refetch to get accurate positioning
          fetchTasks();
          break;
      }
    };

    window.addEventListener('task-event', handleTaskEvent as EventListener);
    return () => window.removeEventListener('task-event', handleTaskEvent as EventListener);
  }, [projectId, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    refetch
  };
}

// Utility function to emit task events for cross-component communication
export function emitTaskEvent(type: string, data: any) {
  const event = new CustomEvent('task-event', {
    detail: { type, ...data }
  });
  window.dispatchEvent(event);
  
  // Also update localStorage for cross-tab sync
  localStorage.setItem('tasks_updated', Date.now().toString());
}