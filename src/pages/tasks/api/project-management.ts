import type { 
  Project, 
  ProjectsResponse,
  TasksError
} from '../types';

// Mock data store for development
const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Claude Dashboard',
    description: 'Next-generation admin dashboard with AI integration',
    color: '#8b5cf6',
    icon: 'folder',
    ownerId: 'user-1',
    createdAt: '2025-06-20T10:00:00Z',
    updatedAt: '2025-06-30T09:15:00Z',
    isArchived: false,
    isFavorite: true,
    teamMembers: ['user-1', 'user-2', 'user-3'],
    settings: {
      allowComments: true,
      allowAttachments: true,
      requireDueDates: false,
      defaultAssignee: 'user-1',
      customStatuses: []
    },
    stats: {
      totalTasks: 15,
      completedTasks: 8,
      overdueTasks: 2,
      activeTasks: 7,
      completionRate: 0.53
    }
  },
  {
    id: 'project-2',
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application for task management',
    color: '#3b82f6',
    icon: 'smartphone',
    ownerId: 'user-2',
    createdAt: '2025-06-15T14:30:00Z',
    updatedAt: '2025-06-29T16:45:00Z',
    isArchived: false,
    isFavorite: false,
    teamMembers: ['user-2', 'user-3'],
    settings: {
      allowComments: true,
      allowAttachments: false,
      requireDueDates: true,
      defaultAssignee: undefined,
      customStatuses: []
    },
    stats: {
      totalTasks: 8,
      completedTasks: 3,
      overdueTasks: 1,
      activeTasks: 5,
      completionRate: 0.375
    }
  },
  {
    id: 'project-3',
    name: 'API Documentation',
    description: 'Comprehensive API documentation and developer resources',
    color: '#10b981',
    icon: 'book',
    ownerId: 'user-1',
    createdAt: '2025-06-25T11:20:00Z',
    updatedAt: '2025-06-30T12:00:00Z',
    isArchived: false,
    isFavorite: true,
    teamMembers: ['user-1'],
    settings: {
      allowComments: false,
      allowAttachments: true,
      requireDueDates: false,
      defaultAssignee: 'user-1',
      customStatuses: []
    },
    stats: {
      totalTasks: 6,
      completedTasks: 4,
      overdueTasks: 0,
      activeTasks: 2,
      completionRate: 0.67
    }
  }
];

// Simulate API delay
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate unique ID
const generateId = () => `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

class ProjectManagement {
  private projects: Project[] = [...mockProjects];

  // List projects with optional filtering
  async list(options: { includeArchived?: boolean } = {}): Promise<ProjectsResponse> {
    await simulateDelay();

    try {
      let filteredProjects = [...this.projects];

      // Filter archived projects
      if (!options.includeArchived) {
        filteredProjects = filteredProjects.filter(project => !project.isArchived);
      }

      // Sort by favorites first, then by name
      filteredProjects.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });

      return {
        projects: filteredProjects,
        total: filteredProjects.length
      };
    } catch (error) {
      throw this.createError('FETCH_FAILED', 'Failed to fetch projects', error);
    }
  }

  // Get single project by ID
  async get(projectId: string): Promise<Project> {
    await simulateDelay(300);

    const project = this.projects.find(p => p.id === projectId);
    if (!project) {
      throw this.createError('PROJECT_NOT_FOUND', `Project with ID ${projectId} not found`);
    }

    return { ...project };
  }

  // Create new project
  async create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<Project> {
    await simulateDelay();

    try {
      // Validate required fields
      if (!projectData.name?.trim()) {
        throw this.createError('VALIDATION_ERROR', 'Project name is required');
      }
      
      if (projectData.name.length > 50) {
        throw this.createError('VALIDATION_ERROR', 'Project name must be 50 characters or less');
      }

      if (!projectData.color) {
        throw this.createError('VALIDATION_ERROR', 'Project color is required');
      }

      if (!projectData.ownerId) {
        throw this.createError('VALIDATION_ERROR', 'Project owner is required');
      }

      // Check for duplicate names
      const existingProject = this.projects.find(p => 
        p.name.toLowerCase() === projectData.name.trim().toLowerCase() && !p.isArchived
      );
      if (existingProject) {
        throw this.createError('VALIDATION_ERROR', 'A project with this name already exists');
      }

      const now = new Date().toISOString();
      const newProject: Project = {
        ...projectData,
        id: generateId(),
        name: projectData.name.trim(),
        createdAt: now,
        updatedAt: now,
        stats: {
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          activeTasks: 0,
          completionRate: 0
        }
      };

      this.projects.unshift(newProject);
      
      // Emit event for real-time updates
      this.emitProjectEvent('project-created', { project: newProject });

      return { ...newProject };
    } catch (error) {
      if (error instanceof Error && error.message.includes('VALIDATION_ERROR')) {
        throw error;
      }
      throw this.createError('CREATE_FAILED', 'Failed to create project', error);
    }
  }

  // Update existing project
  async update(projectId: string, updates: Partial<Project>): Promise<Project> {
    await simulateDelay();

    try {
      const projectIndex = this.projects.findIndex(p => p.id === projectId);
      if (projectIndex === -1) {
        throw this.createError('PROJECT_NOT_FOUND', `Project with ID ${projectId} not found`);
      }

      // Validate updates
      if (updates.name !== undefined) {
        if (!updates.name.trim()) {
          throw this.createError('VALIDATION_ERROR', 'Project name cannot be empty');
        }
        
        if (updates.name.length > 50) {
          throw this.createError('VALIDATION_ERROR', 'Project name must be 50 characters or less');
        }

        // Check for duplicate names (excluding current project)
        const existingProject = this.projects.find(p => 
          p.name.toLowerCase() === updates.name!.trim().toLowerCase() && 
          p.id !== projectId && 
          !p.isArchived
        );
        if (existingProject) {
          throw this.createError('VALIDATION_ERROR', 'A project with this name already exists');
        }
        
        updates.name = updates.name.trim();
      }

      const currentProject = this.projects[projectIndex];
      const now = new Date().toISOString();

      const updatedProject: Project = {
        ...currentProject,
        ...updates,
        id: projectId, // Ensure ID doesn't change
        updatedAt: now,
        // Don't allow stats to be updated directly
        stats: currentProject.stats
      };

      this.projects[projectIndex] = updatedProject;
      
      // Emit event for real-time updates
      this.emitProjectEvent('project-updated', { project: updatedProject, changes: updates });

      return { ...updatedProject };
    } catch (error) {
      if (error instanceof Error && (error.message.includes('VALIDATION_ERROR') || error.message.includes('PROJECT_NOT_FOUND'))) {
        throw error;
      }
      throw this.createError('UPDATE_FAILED', 'Failed to update project', error);
    }
  }

  // Delete project
  async delete(projectId: string): Promise<void> {
    await simulateDelay();

    try {
      const projectIndex = this.projects.findIndex(p => p.id === projectId);
      if (projectIndex === -1) {
        throw this.createError('PROJECT_NOT_FOUND', `Project with ID ${projectId} not found`);
      }

      const project = this.projects[projectIndex];
      
      // Check if project has active tasks
      if (project.stats.activeTasks > 0) {
        throw this.createError('VALIDATION_ERROR', 
          `Cannot delete project with ${project.stats.activeTasks} active tasks. Complete or move tasks first.`);
      }

      this.projects.splice(projectIndex, 1);
      
      // Emit event for real-time updates
      this.emitProjectEvent('project-deleted', { projectId });
    } catch (error) {
      if (error instanceof Error && (error.message.includes('PROJECT_NOT_FOUND') || error.message.includes('VALIDATION_ERROR'))) {
        throw error;
      }
      throw this.createError('DELETE_FAILED', 'Failed to delete project', error);
    }
  }

  // Toggle favorite status
  async toggleFavorite(projectId: string): Promise<Project> {
    await simulateDelay(200);

    try {
      const projectIndex = this.projects.findIndex(p => p.id === projectId);
      if (projectIndex === -1) {
        throw this.createError('PROJECT_NOT_FOUND', `Project with ID ${projectId} not found`);
      }

      const currentProject = this.projects[projectIndex];
      const updatedProject: Project = {
        ...currentProject,
        isFavorite: !currentProject.isFavorite,
        updatedAt: new Date().toISOString()
      };

      this.projects[projectIndex] = updatedProject;
      
      // Emit event for real-time updates
      this.emitProjectEvent('project-updated', { 
        project: updatedProject, 
        changes: { isFavorite: updatedProject.isFavorite } 
      });

      return { ...updatedProject };
    } catch (error) {
      if (error instanceof Error && error.message.includes('PROJECT_NOT_FOUND')) {
        throw error;
      }
      throw this.createError('TOGGLE_FAVORITE_FAILED', 'Failed to toggle favorite status', error);
    }
  }

  // Archive/unarchive project
  async archive(projectId: string, archived: boolean = true): Promise<Project> {
    await simulateDelay();

    try {
      const projectIndex = this.projects.findIndex(p => p.id === projectId);
      if (projectIndex === -1) {
        throw this.createError('PROJECT_NOT_FOUND', `Project with ID ${projectId} not found`);
      }

      const currentProject = this.projects[projectIndex];
      
      // Check if project has active tasks when archiving
      if (archived && currentProject.stats.activeTasks > 0) {
        throw this.createError('VALIDATION_ERROR', 
          `Cannot archive project with ${currentProject.stats.activeTasks} active tasks. Complete or move tasks first.`);
      }

      const updatedProject: Project = {
        ...currentProject,
        isArchived: archived,
        updatedAt: new Date().toISOString()
      };

      this.projects[projectIndex] = updatedProject;
      
      // Emit event for real-time updates
      this.emitProjectEvent('project-updated', { 
        project: updatedProject, 
        changes: { isArchived: archived } 
      });

      return { ...updatedProject };
    } catch (error) {
      if (error instanceof Error && (error.message.includes('PROJECT_NOT_FOUND') || error.message.includes('VALIDATION_ERROR'))) {
        throw error;
      }
      throw this.createError('ARCHIVE_FAILED', 'Failed to archive project', error);
    }
  }

  // Update project statistics (called when tasks change)
  async updateStats(projectId: string): Promise<Project> {
    await simulateDelay(100);

    try {
      const projectIndex = this.projects.findIndex(p => p.id === projectId);
      if (projectIndex === -1) {
        throw this.createError('PROJECT_NOT_FOUND', `Project with ID ${projectId} not found`);
      }

      // This would typically fetch task statistics from the database
      // For now, we'll simulate the calculation
      const stats = this.calculateProjectStats(projectId);
      
      const currentProject = this.projects[projectIndex];
      const updatedProject: Project = {
        ...currentProject,
        stats,
        updatedAt: new Date().toISOString()
      };

      this.projects[projectIndex] = updatedProject;
      
      // Emit event for real-time updates
      this.emitProjectEvent('project-updated', { 
        project: updatedProject, 
        changes: { stats } 
      });

      return { ...updatedProject };
    } catch (error) {
      if (error instanceof Error && error.message.includes('PROJECT_NOT_FOUND')) {
        throw error;
      }
      throw this.createError('STATS_UPDATE_FAILED', 'Failed to update project statistics', error);
    }
  }

  // Private helper methods
  private calculateProjectStats(projectId: string) {
    // This would typically query the tasks database
    // For now, return mock stats with some variation
    const baseStats = {
      totalTasks: Math.floor(Math.random() * 20) + 5,
      completedTasks: 0,
      overdueTasks: 0,
      activeTasks: 0,
      completionRate: 0
    };

    baseStats.completedTasks = Math.floor(baseStats.totalTasks * (0.3 + Math.random() * 0.4));
    baseStats.overdueTasks = Math.floor(Math.random() * 3);
    baseStats.activeTasks = baseStats.totalTasks - baseStats.completedTasks;
    baseStats.completionRate = baseStats.totalTasks > 0 ? baseStats.completedTasks / baseStats.totalTasks : 0;

    return baseStats;
  }

  private createError(code: string, message: string, originalError?: any): TasksError {
    const error = new Error(message) as TasksError;
    error.code = code;
    error.details = originalError;
    return error;
  }

  private emitProjectEvent(type: string, data: any): void {
    const event = new CustomEvent('project-event', {
      detail: { type, ...data }
    });
    window.dispatchEvent(event);
    
    // Update localStorage for cross-tab synchronization
    localStorage.setItem('projects_updated', Date.now().toString());
  }
}

// Export singleton instance
export const projectManagement = new ProjectManagement();