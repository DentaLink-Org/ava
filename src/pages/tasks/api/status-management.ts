import type { TaskStatus, TaskStatusesResponse, TasksError } from '../types';

// Mock data store for development
const mockStatuses: TaskStatus[] = [
  {
    id: 'todo',
    name: 'To Do',
    color: '#6b7280',
    position: 0,
    isDefault: true,
    isCompleted: false
  },
  {
    id: 'in-progress',
    name: 'In Progress',
    color: '#3b82f6',
    position: 1,
    isDefault: false,
    isCompleted: false
  },
  {
    id: 'review',
    name: 'Review',
    color: '#f59e0b',
    position: 2,
    isDefault: false,
    isCompleted: false
  },
  {
    id: 'done',
    name: 'Done',
    color: '#10b981',
    position: 3,
    isDefault: false,
    isCompleted: true
  }
];

// Simulate API delay
const simulateDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

class StatusManagement {
  private statuses: TaskStatus[] = [...mockStatuses];

  // Get all task statuses
  async list(projectId?: string): Promise<TaskStatusesResponse> {
    await simulateDelay();

    try {
      // In a real implementation, this would filter by project-specific statuses
      // For now, return global statuses
      const statuses = [...this.statuses].sort((a, b) => a.position - b.position);

      return {
        statuses
      };
    } catch (error) {
      throw this.createError('FETCH_FAILED', 'Failed to fetch task statuses', error);
    }
  }

  // Get single status by ID
  async get(statusId: string): Promise<TaskStatus> {
    await simulateDelay(200);

    const status = this.statuses.find(s => s.id === statusId);
    if (!status) {
      throw this.createError('STATUS_NOT_FOUND', `Status with ID ${statusId} not found`);
    }

    return { ...status };
  }

  // Create new status (for project-specific statuses)
  async create(statusData: Omit<TaskStatus, 'id'>): Promise<TaskStatus> {
    await simulateDelay();

    try {
      // Validate required fields
      if (!statusData.name?.trim()) {
        throw this.createError('VALIDATION_ERROR', 'Status name is required');
      }

      if (!statusData.color) {
        throw this.createError('VALIDATION_ERROR', 'Status color is required');
      }

      // Check for duplicate names
      const existingStatus = this.statuses.find(s => 
        s.name.toLowerCase() === statusData.name.trim().toLowerCase()
      );
      if (existingStatus) {
        throw this.createError('VALIDATION_ERROR', 'A status with this name already exists');
      }

      const newStatus: TaskStatus = {
        ...statusData,
        id: this.generateId(statusData.name),
        name: statusData.name.trim(),
        position: statusData.position ?? this.getNextPosition()
      };

      this.statuses.push(newStatus);
      this.reorderStatuses();

      return { ...newStatus };
    } catch (error) {
      if (error instanceof Error && error.message.includes('VALIDATION_ERROR')) {
        throw error;
      }
      throw this.createError('CREATE_FAILED', 'Failed to create status', error);
    }
  }

  // Update existing status
  async update(statusId: string, updates: Partial<TaskStatus>): Promise<TaskStatus> {
    await simulateDelay();

    try {
      const statusIndex = this.statuses.findIndex(s => s.id === statusId);
      if (statusIndex === -1) {
        throw this.createError('STATUS_NOT_FOUND', `Status with ID ${statusId} not found`);
      }

      // Validate updates
      if (updates.name !== undefined) {
        if (!updates.name.trim()) {
          throw this.createError('VALIDATION_ERROR', 'Status name cannot be empty');
        }

        // Check for duplicate names (excluding current status)
        const existingStatus = this.statuses.find(s => 
          s.name.toLowerCase() === updates.name!.trim().toLowerCase() && s.id !== statusId
        );
        if (existingStatus) {
          throw this.createError('VALIDATION_ERROR', 'A status with this name already exists');
        }

        updates.name = updates.name.trim();
      }

      const currentStatus = this.statuses[statusIndex];
      const updatedStatus: TaskStatus = {
        ...currentStatus,
        ...updates,
        id: statusId // Ensure ID doesn't change
      };

      this.statuses[statusIndex] = updatedStatus;

      // Reorder if position changed
      if (updates.position !== undefined) {
        this.reorderStatuses();
      }

      return { ...updatedStatus };
    } catch (error) {
      if (error instanceof Error && (error.message.includes('VALIDATION_ERROR') || error.message.includes('STATUS_NOT_FOUND'))) {
        throw error;
      }
      throw this.createError('UPDATE_FAILED', 'Failed to update status', error);
    }
  }

  // Delete status
  async delete(statusId: string): Promise<void> {
    await simulateDelay();

    try {
      const statusIndex = this.statuses.findIndex(s => s.id === statusId);
      if (statusIndex === -1) {
        throw this.createError('STATUS_NOT_FOUND', `Status with ID ${statusId} not found`);
      }

      const status = this.statuses[statusIndex];

      // Prevent deletion of default status
      if (status.isDefault) {
        throw this.createError('VALIDATION_ERROR', 'Cannot delete the default status');
      }

      // In a real implementation, check if status is used by any tasks
      // For now, we'll allow deletion

      this.statuses.splice(statusIndex, 1);
      this.reorderStatuses();
    } catch (error) {
      if (error instanceof Error && (error.message.includes('STATUS_NOT_FOUND') || error.message.includes('VALIDATION_ERROR'))) {
        throw error;
      }
      throw this.createError('DELETE_FAILED', 'Failed to delete status', error);
    }
  }

  // Reorder statuses
  async reorder(statusIds: string[]): Promise<TaskStatus[]> {
    await simulateDelay();

    try {
      // Validate that all status IDs exist
      const existingIds = new Set(this.statuses.map(s => s.id));
      const missingIds = statusIds.filter(id => !existingIds.has(id));
      if (missingIds.length > 0) {
        throw this.createError('VALIDATION_ERROR', `Status IDs not found: ${missingIds.join(', ')}`);
      }

      // Reorder statuses
      const reorderedStatuses: TaskStatus[] = [];
      statusIds.forEach((id, index) => {
        const status = this.statuses.find(s => s.id === id);
        if (status) {
          reorderedStatuses.push({
            ...status,
            position: index
          });
        }
      });

      this.statuses = reorderedStatuses;

      return [...this.statuses];
    } catch (error) {
      if (error instanceof Error && error.message.includes('VALIDATION_ERROR')) {
        throw error;
      }
      throw this.createError('REORDER_FAILED', 'Failed to reorder statuses', error);
    }
  }

  // Private helper methods
  private generateId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  private getNextPosition(): number {
    if (this.statuses.length === 0) return 0;
    const maxPosition = Math.max(...this.statuses.map(s => s.position));
    return maxPosition + 1;
  }

  private reorderStatuses(): void {
    this.statuses.sort((a, b) => a.position - b.position);
    this.statuses.forEach((status, index) => {
      status.position = index;
    });
  }

  private createError(code: string, message: string, originalError?: any): TasksError {
    const error = new Error(message) as TasksError;
    error.code = code;
    error.details = originalError;
    return error;
  }
}

// Export singleton instance
export const statusManagement = new StatusManagement();