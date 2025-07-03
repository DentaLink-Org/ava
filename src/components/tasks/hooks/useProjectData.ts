import { useState, useEffect, useCallback } from 'react';
import type { Project, UseProjectDataReturn, TasksError } from '../types';
import { projectManagement } from '../api/project-management';

interface UseProjectDataOptions {
  includeArchived?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useProjectData(options: UseProjectDataOptions = {}): UseProjectDataReturn {
  const { includeArchived = false, autoRefresh = true, refreshInterval = 60000 } = options;
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TasksError | null>(null);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      const response = await projectManagement.list({ includeArchived });
      setProjects(response.projects);
    } catch (err) {
      const error = err as TasksError;
      setError(error);
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, [includeArchived]);

  // Create project
  const createProject = useCallback(async (
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'stats'>
  ): Promise<Project> => {
    try {
      setError(null);
      const newProject = await projectManagement.create(projectData);
      
      // Add to local state
      setProjects(prev => [newProject, ...prev]);
      
      return newProject;
    } catch (err) {
      const error = err as TasksError;
      setError(error);
      throw error;
    }
  }, []);

  // Update project
  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>): Promise<Project> => {
    try {
      setError(null);
      const updatedProject = await projectManagement.update(projectId, updates);
      
      // Update local state
      setProjects(prev => prev.map(project => 
        project.id === projectId ? updatedProject : project
      ));
      
      // Update selected project if it matches
      if (selectedProject?.id === projectId) {
        setSelectedProject(updatedProject);
      }
      
      return updatedProject;
    } catch (err) {
      const error = err as TasksError;
      setError(error);
      throw error;
    }
  }, [selectedProject]);

  // Delete project
  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    try {
      setError(null);
      await projectManagement.delete(projectId);
      
      // Remove from local state
      setProjects(prev => prev.filter(project => project.id !== projectId));
      
      // Clear selected project if it matches
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    } catch (err) {
      const error = err as TasksError;
      setError(error);
      throw error;
    }
  }, [selectedProject]);

  // Select project
  const selectProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project || null);
    
    // Store in localStorage for persistence
    if (project) {
      localStorage.setItem('tasks_selected_project', projectId);
    } else {
      localStorage.removeItem('tasks_selected_project');
    }
  }, [projects]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (projectId: string): Promise<void> => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    try {
      setError(null);
      
      // Optimistic update
      const updatedProject = { ...project, isFavorite: !project.isFavorite };
      setProjects(prev => prev.map(p => 
        p.id === projectId ? updatedProject : p
      ));
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(updatedProject);
      }
      
      // Update on server
      await projectManagement.toggleFavorite(projectId);
    } catch (err) {
      const error = err as TasksError;
      setError(error);
      
      // Revert optimistic update
      fetchProjects();
      throw error;
    }
  }, [projects, selectedProject, fetchProjects]);

  // Refetch function
  const refetch = useCallback(() => {
    setLoading(true);
    fetchProjects();
  }, [fetchProjects]);

  // Initial fetch
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Restore selected project from localStorage
  useEffect(() => {
    const savedProjectId = localStorage.getItem('tasks_selected_project');
    if (savedProjectId && projects.length > 0) {
      const project = projects.find(p => p.id === savedProjectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [projects]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchProjects, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchProjects]);

  // Listen for storage events (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'projects_updated') {
        fetchProjects();
      } else if (e.key === 'tasks_selected_project') {
        const projectId = e.newValue;
        if (projectId) {
          const project = projects.find(p => p.id === projectId);
          setSelectedProject(project || null);
        } else {
          setSelectedProject(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchProjects, projects]);

  // Listen for custom events (real-time updates)
  useEffect(() => {
    const handleProjectEvent = (event: CustomEvent) => {
      const { type, projectId, project } = event.detail;
      
      switch (type) {
        case 'project-created':
          if (project) {
            setProjects(prev => {
              // Avoid duplicates
              if (prev.some(p => p.id === project.id)) return prev;
              return [project, ...prev];
            });
          }
          break;
          
        case 'project-updated':
          if (project) {
            setProjects(prev => prev.map(p => p.id === project.id ? project : p));
            if (selectedProject?.id === project.id) {
              setSelectedProject(project);
            }
          }
          break;
          
        case 'project-deleted':
          setProjects(prev => prev.filter(p => p.id !== projectId));
          if (selectedProject?.id === projectId) {
            setSelectedProject(null);
          }
          break;
      }
    };

    window.addEventListener('project-event', handleProjectEvent as EventListener);
    return () => window.removeEventListener('project-event', handleProjectEvent as EventListener);
  }, [selectedProject]);

  return {
    projects,
    selectedProject,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    toggleFavorite,
    refetch
  };
}

// Utility function to emit project events for cross-component communication
export function emitProjectEvent(type: string, data: any) {
  const event = new CustomEvent('project-event', {
    detail: { type, ...data }
  });
  window.dispatchEvent(event);
  
  // Also update localStorage for cross-tab sync
  localStorage.setItem('projects_updated', Date.now().toString());
}