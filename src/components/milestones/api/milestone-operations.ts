import type { 
  Milestone, 
  MilestonesResponse,
  MilestoneResponse,
  MilestoneFilter,
  CreateMilestoneData,
  UpdateMilestoneData,
  MilestoneError,
  MilestoneEvent,
  ProjectWithMilestones,
  TaskWithMilestone
} from '../types';

// Mock data store for development
const mockMilestones: Milestone[] = [
  {
    id: 'milestone-1',
    projectId: 'project-1',
    title: 'MVP Release',
    description: 'Launch minimum viable product with core features',
    dueDate: '2025-08-01T23:59:59Z',
    status: 'in_progress',
    priority: 'high',
    color: '#3b82f6',
    progress: 45,
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-06-30T14:30:00Z',
    createdBy: 'user-1',
    assignedTo: ['user-1', 'user-2', 'user-3'],
    metadata: {
      estimatedHours: 240,
      actualHours: 108,
      budgetAllocated: 50000,
      budgetSpent: 22500,
      tags: ['release', 'mvp', 'critical'],
      riskLevel: 'medium',
      stakeholders: ['stakeholder-1', 'stakeholder-2'],
      deliverables: ['Feature set A', 'Feature set B', 'Documentation']
    },
    isArchived: false,
    dependencies: [],
    tasks: []
  },
  {
    id: 'milestone-2',
    projectId: 'project-1',
    title: 'Beta Testing Phase',
    description: 'Complete beta testing with selected users',
    dueDate: '2025-09-15T23:59:59Z',
    status: 'pending',
    priority: 'high',
    color: '#10b981',
    progress: 0,
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-06-15T09:20:00Z',
    createdBy: 'user-1',
    assignedTo: ['user-2', 'user-4'],
    metadata: {
      estimatedHours: 120,
      tags: ['testing', 'qa', 'beta'],
      riskLevel: 'low',
      stakeholders: ['stakeholder-2', 'stakeholder-3'],
      deliverables: ['Test reports', 'Bug fixes', 'Performance metrics']
    },
    isArchived: false,
    dependencies: [{
      id: 'dep-1',
      milestoneId: 'milestone-2',
      dependsOnId: 'milestone-1',
      dependencyType: 'finish_to_start',
      lagDays: 7,
      createdAt: '2025-06-01T10:00:00Z',
      createdBy: 'user-1'
    }],
    tasks: []
  },
  {
    id: 'milestone-3',
    projectId: 'project-2',
    title: 'Infrastructure Setup',
    description: 'Complete cloud infrastructure and CI/CD pipeline',
    dueDate: '2025-07-15T17:00:00Z',
    status: 'completed',
    priority: 'medium',
    color: '#f59e0b',
    progress: 100,
    completedAt: '2025-06-28T16:45:00Z',
    createdAt: '2025-05-15T08:00:00Z',
    updatedAt: '2025-06-28T16:45:00Z',
    createdBy: 'user-2',
    assignedTo: ['user-3'],
    metadata: {
      estimatedHours: 80,
      actualHours: 75,
      budgetAllocated: 20000,
      budgetSpent: 18500,
      tags: ['infrastructure', 'devops', 'setup'],
      riskLevel: 'low',
      deliverables: ['AWS setup', 'CI/CD pipeline', 'Monitoring']
    },
    isArchived: false,
    dependencies: [],
    tasks: []
  }
];

// Simulate API delay
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate unique ID
const generateId = () => `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

class MilestoneOperations {
  private milestones: Milestone[] = [...mockMilestones];

  // List milestones with optional filtering
  async list(filter: MilestoneFilter = {}): Promise<MilestonesResponse> {
    await simulateDelay();

    try {
      let filteredMilestones = [...this.milestones];

      // Apply filters
      if (filter.projectId) {
        filteredMilestones = filteredMilestones.filter(m => m.projectId === filter.projectId);
      }
      
      if (filter.status) {
        filteredMilestones = filteredMilestones.filter(m => m.status === filter.status);
      }
      
      if (filter.priority) {
        filteredMilestones = filteredMilestones.filter(m => m.priority === filter.priority);
      }
      
      if (filter.assigneeId) {
        filteredMilestones = filteredMilestones.filter(m => 
          m.assignedTo.includes(filter.assigneeId!)
        );
      }
      
      if (filter.tags && filter.tags.length > 0) {
        filteredMilestones = filteredMilestones.filter(m => 
          filter.tags!.some(tag => m.metadata.tags?.includes(tag))
        );
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredMilestones = filteredMilestones.filter(m =>
          m.title.toLowerCase().includes(searchLower) ||
          m.description?.toLowerCase().includes(searchLower) ||
          m.metadata.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      if (filter.dateRange) {
        const start = new Date(filter.dateRange.start);
        const end = new Date(filter.dateRange.end);
        filteredMilestones = filteredMilestones.filter(m => {
          if (!m.dueDate) return false;
          const dueDate = new Date(m.dueDate);
          return dueDate >= start && dueDate <= end;
        });
      }
      
      if (filter.overdue === true) {
        const now = new Date();
        filteredMilestones = filteredMilestones.filter(m => {
          if (!m.dueDate || m.status === 'completed' || m.status === 'cancelled') return false;
          return new Date(m.dueDate) < now;
        });
      }
      
      if (filter.completedOnly === true) {
        filteredMilestones = filteredMilestones.filter(m => m.status === 'completed');
      }

      // Filter out archived milestones unless specifically requested
      if (!filter.includeArchived) {
        filteredMilestones = filteredMilestones.filter(m => !m.isArchived);
      }

      // Sort by due date (earliest first) by default
      filteredMilestones.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      return {
        milestones: filteredMilestones,
        total: filteredMilestones.length,
        page: 1,
        limit: filteredMilestones.length
      };
    } catch (error) {
      throw this.createError('FETCH_FAILED', 'Failed to fetch milestones', error);
    }
  }

  // Get single milestone by ID
  async get(milestoneId: string): Promise<MilestoneResponse> {
    await simulateDelay(300);

    const milestone = this.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw this.createError('MILESTONE_NOT_FOUND', `Milestone with ID ${milestoneId} not found`);
    }

    // Populate linked tasks (in real implementation, this would be a join query)
    const linkedTasks = await this.getLinkedTasks(milestoneId);
    const milestoneWithTasks = {
      ...milestone,
      tasks: linkedTasks
    };

    return { milestone: milestoneWithTasks };
  }

  // Create new milestone
  async create(milestoneData: CreateMilestoneData): Promise<Milestone> {
    await simulateDelay();

    try {
      // Validate required fields
      if (!milestoneData.title?.trim()) {
        throw this.createError('VALIDATION_ERROR', 'Milestone title is required');
      }
      
      if (!milestoneData.projectId) {
        throw this.createError('VALIDATION_ERROR', 'Project ID is required');
      }

      // Validate dependencies don't create circular references
      if (milestoneData.dependencies && milestoneData.dependencies.length > 0) {
        // In real implementation, this would check for circular dependencies
        // For now, we'll skip this validation
      }

      const now = new Date().toISOString();
      const newMilestone: Milestone = {
        id: generateId(),
        projectId: milestoneData.projectId,
        title: milestoneData.title,
        description: milestoneData.description,
        dueDate: milestoneData.dueDate,
        status: 'pending',
        priority: milestoneData.priority || 'medium',
        color: milestoneData.color || '#3b82f6',
        progress: 0,
        createdAt: now,
        updatedAt: now,
        createdBy: 'user-1', // In real implementation, get from auth context
        assignedTo: milestoneData.assignedTo || [],
        metadata: milestoneData.metadata || {
          tags: [],
          stakeholders: [],
          deliverables: []
        },
        isArchived: false,
        dependencies: [],
        tasks: []
      };

      this.milestones.unshift(newMilestone);
      
      // Emit event for real-time updates
      this.emitMilestoneEvent('milestone-created', { 
        milestone: newMilestone,
        milestoneId: newMilestone.id
      });

      return { ...newMilestone };
    } catch (error) {
      if (error instanceof Error && error.message.includes('VALIDATION_ERROR')) {
        throw error;
      }
      throw this.createError('CREATE_FAILED', 'Failed to create milestone', error);
    }
  }

  // Update existing milestone
  async update(milestoneId: string, updates: UpdateMilestoneData): Promise<Milestone> {
    await simulateDelay();

    try {
      const milestoneIndex = this.milestones.findIndex(m => m.id === milestoneId);
      if (milestoneIndex === -1) {
        throw this.createError('MILESTONE_NOT_FOUND', `Milestone with ID ${milestoneId} not found`);
      }

      // Validate updates
      if (updates.title !== undefined && !updates.title.trim()) {
        throw this.createError('VALIDATION_ERROR', 'Milestone title cannot be empty');
      }

      const currentMilestone = this.milestones[milestoneIndex];
      const now = new Date().toISOString();
      
      // Handle status completion
      if (updates.status === 'completed' && currentMilestone.status !== 'completed') {
        updates.completedAt = now;
        updates.progress = 100;
      } else if (updates.status && updates.status !== 'completed' && currentMilestone.status === 'completed') {
        updates.completedAt = undefined;
      }

      const updatedMilestone: Milestone = {
        ...currentMilestone,
        ...updates,
        id: milestoneId, // Ensure ID doesn't change
        updatedAt: now,
        metadata: updates.metadata ? {
          ...currentMilestone.metadata,
          ...updates.metadata
        } : currentMilestone.metadata
      };

      this.milestones[milestoneIndex] = updatedMilestone;
      
      // Emit event for real-time updates
      this.emitMilestoneEvent('milestone-updated', { 
        milestone: updatedMilestone,
        milestoneId: milestoneId,
        changes: updates 
      });

      return { ...updatedMilestone };
    } catch (error) {
      if (error instanceof Error && (error.message.includes('VALIDATION_ERROR') || error.message.includes('MILESTONE_NOT_FOUND'))) {
        throw error;
      }
      throw this.createError('UPDATE_FAILED', 'Failed to update milestone', error);
    }
  }

  // Delete milestone
  async delete(milestoneId: string): Promise<void> {
    await simulateDelay();

    try {
      const milestoneIndex = this.milestones.findIndex(m => m.id === milestoneId);
      if (milestoneIndex === -1) {
        throw this.createError('MILESTONE_NOT_FOUND', `Milestone with ID ${milestoneId} not found`);
      }

      // Check if other milestones depend on this one
      const dependentMilestones = this.milestones.filter(m => 
        m.dependencies.some(d => d.dependsOnId === milestoneId)
      );
      
      if (dependentMilestones.length > 0) {
        throw this.createError(
          'DEPENDENCY_CONFLICT', 
          `Cannot delete milestone. ${dependentMilestones.length} milestone(s) depend on it.`
        );
      }

      this.milestones.splice(milestoneIndex, 1);
      
      // Emit event for real-time updates
      this.emitMilestoneEvent('milestone-deleted', { milestoneId });

      // Also remove any tasks linked to this milestone
      await this.unlinkAllTasks(milestoneId);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('MILESTONE_NOT_FOUND') || error.message.includes('DEPENDENCY_CONFLICT'))) {
        throw error;
      }
      throw this.createError('DELETE_FAILED', 'Failed to delete milestone', error);
    }
  }

  // Archive milestone (soft delete)
  async archive(milestoneId: string): Promise<Milestone> {
    return this.update(milestoneId, { isArchived: true });
  }

  // Restore archived milestone
  async restore(milestoneId: string): Promise<Milestone> {
    return this.update(milestoneId, { isArchived: false });
  }

  // Calculate milestone progress based on linked tasks
  async calculateProgress(milestoneId: string): Promise<number> {
    await simulateDelay(200);

    try {
      const milestone = this.milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        throw this.createError('MILESTONE_NOT_FOUND', `Milestone with ID ${milestoneId} not found`);
      }

      // Get linked tasks (in real implementation, query tasks with milestone_id)
      const linkedTasks = await this.getLinkedTasks(milestoneId);
      
      if (linkedTasks.length === 0) {
        return milestone.progress; // Return current progress if no tasks
      }

      const completedTasks = linkedTasks.filter(task => 
        task.status.isCompleted || task.status.id === 'done'
      ).length;

      const progress = Math.round((completedTasks / linkedTasks.length) * 100);

      // Update milestone progress
      await this.update(milestoneId, { progress });

      // Record progress history
      this.recordProgressHistory(milestoneId, progress, completedTasks, linkedTasks.length);

      return progress;
    } catch (error) {
      if (error instanceof Error && error.message.includes('MILESTONE_NOT_FOUND')) {
        throw error;
      }
      throw this.createError('PROGRESS_CALCULATION_FAILED', 'Failed to calculate milestone progress', error);
    }
  }

  // Get milestones by project
  async getByProject(projectId: string): Promise<ProjectWithMilestones> {
    await simulateDelay();

    try {
      const projectMilestones = this.milestones.filter(m => 
        m.projectId === projectId && !m.isArchived
      );

      // Sort by due date
      projectMilestones.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      // Calculate stats
      const now = new Date();
      const completedMilestones = projectMilestones.filter(m => m.status === 'completed').length;
      const overdueMilestones = projectMilestones.filter(m => 
        m.dueDate && new Date(m.dueDate) < now && m.status !== 'completed' && m.status !== 'cancelled'
      ).length;
      const activeMilestones = projectMilestones.filter(m => 
        m.status === 'in_progress'
      ).length;
      const milestoneCompletionRate = projectMilestones.length > 0 
        ? Math.round((completedMilestones / projectMilestones.length) * 100)
        : 0;

      // Mock project data (in real implementation, fetch from projects table)
      const projectWithMilestones: ProjectWithMilestones = {
        id: projectId,
        name: `Project ${projectId}`,
        description: 'Project description',
        color: '#3b82f6',
        ownerId: 'user-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
        isArchived: false,
        isFavorite: false,
        teamMembers: ['user-1', 'user-2', 'user-3'],
        settings: {
          allowComments: true,
          allowAttachments: true,
          requireDueDates: false,
          customStatuses: []
        },
        stats: {
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          activeTasks: 0,
          completionRate: 0
        },
        milestones: projectMilestones,
        milestoneCount: projectMilestones.length,
        completedMilestones,
        overdueMilestones,
        activeMilestones,
        milestoneCompletionRate
      };

      return projectWithMilestones;
    } catch (error) {
      throw this.createError('FETCH_PROJECT_MILESTONES_FAILED', 'Failed to fetch project milestones', error);
    }
  }

  // Get overdue milestones
  async getOverdue(projectId?: string): Promise<Milestone[]> {
    const filter: MilestoneFilter = {
      overdue: true,
      projectId
    };
    
    const response = await this.list(filter);
    return response.milestones;
  }

  // Get upcoming milestones (next 30 days)
  async getUpcoming(days: number = 30, projectId?: string): Promise<Milestone[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    const filter: MilestoneFilter = {
      dateRange: {
        start: now.toISOString(),
        end: futureDate.toISOString(),
        granularity: 'day'
      },
      projectId,
      completedOnly: false
    };
    
    const response = await this.list(filter);
    return response.milestones;
  }

  // Private helper methods
  private async getLinkedTasks(milestoneId: string): Promise<TaskWithMilestone[]> {
    // In real implementation, this would query tasks with milestone_id
    // For now, return mock data
    return [];
  }

  private async unlinkAllTasks(milestoneId: string): Promise<void> {
    // In real implementation, update all tasks with this milestone_id to null
    // For now, this is a no-op
  }

  private recordProgressHistory(
    milestoneId: string, 
    progress: number, 
    completedTasks: number, 
    totalTasks: number
  ): void {
    // In real implementation, insert into milestone_progress table
    // For now, just emit an event
    this.emitMilestoneEvent('progress-updated', {
      milestoneId,
      progress,
      completedTasks,
      totalTasks,
      recordedAt: new Date().toISOString()
    });
  }

  private createError(code: string, message: string, originalError?: any): MilestoneError {
    const error = new Error(message) as MilestoneError;
    error.code = code;
    error.details = originalError;
    return error;
  }

  private emitMilestoneEvent(type: MilestoneEvent['type'], data: any): void {
    const event = new CustomEvent('milestone-event', {
      detail: { 
        type, 
        ...data,
        userId: 'user-1', // In real implementation, get from auth context
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);
    
    // Update localStorage for cross-tab synchronization
    localStorage.setItem('milestones_updated', Date.now().toString());
  }
}

// Export singleton instance
export const milestoneOperations = new MilestoneOperations();