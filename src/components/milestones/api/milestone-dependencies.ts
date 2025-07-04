import type { 
  MilestoneDependency,
  MilestoneDependenciesResponse,
  CreateDependencyData,
  DependencyType,
  ValidationResult,
  ValidationError,
  DependencyError,
  Milestone,
  DependencyGraph,
  GraphNode,
  GraphEdge
} from '../types';

// Mock dependency data
const mockDependencies: MilestoneDependency[] = [
  {
    id: 'dep-1',
    milestoneId: 'milestone-2',
    dependsOnId: 'milestone-1',
    dependencyType: 'finish_to_start',
    lagDays: 7,
    createdAt: '2025-06-01T10:00:00Z',
    createdBy: 'user-1'
  },
  {
    id: 'dep-2',
    milestoneId: 'milestone-4',
    dependsOnId: 'milestone-3',
    dependencyType: 'finish_to_start',
    lagDays: 0,
    createdAt: '2025-06-05T14:00:00Z',
    createdBy: 'user-2'
  }
];

// Simulate API delay
const simulateDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate unique ID
const generateId = () => `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

class MilestoneDependencyOperations {
  private dependencies: MilestoneDependency[] = [...mockDependencies];

  // List all dependencies for a milestone
  async list(milestoneId?: string): Promise<MilestoneDependenciesResponse> {
    await simulateDelay();

    try {
      let filteredDependencies = [...this.dependencies];
      
      if (milestoneId) {
        filteredDependencies = filteredDependencies.filter(
          dep => dep.milestoneId === milestoneId || dep.dependsOnId === milestoneId
        );
      }

      return {
        dependencies: filteredDependencies,
        total: filteredDependencies.length
      };
    } catch (error) {
      throw this.createError('FETCH_FAILED', 'Failed to fetch dependencies', error);
    }
  }

  // Create new dependency
  async create(dependencyData: CreateDependencyData): Promise<MilestoneDependency> {
    await simulateDelay();

    try {
      // Validate dependency doesn't already exist
      const existingDep = this.dependencies.find(
        dep => dep.milestoneId === dependencyData.milestoneId && 
               dep.dependsOnId === dependencyData.dependsOnId
      );

      if (existingDep) {
        throw this.createError(
          'DEPENDENCY_EXISTS', 
          'Dependency already exists between these milestones'
        );
      }

      // Validate no self-dependency
      if (dependencyData.milestoneId === dependencyData.dependsOnId) {
        throw this.createError(
          'SELF_DEPENDENCY', 
          'A milestone cannot depend on itself'
        );
      }

      // Check for circular dependencies
      const wouldCreateCycle = await this.checkForCircularDependency(
        dependencyData.milestoneId,
        dependencyData.dependsOnId
      );

      if (wouldCreateCycle) {
        throw this.createError(
          'CIRCULAR_DEPENDENCY',
          'Creating this dependency would result in a circular reference'
        );
      }

      const now = new Date().toISOString();
      const newDependency: MilestoneDependency = {
        id: generateId(),
        milestoneId: dependencyData.milestoneId,
        dependsOnId: dependencyData.dependsOnId,
        dependencyType: dependencyData.dependencyType || 'finish_to_start',
        lagDays: dependencyData.lagDays || 0,
        createdAt: now,
        createdBy: 'user-1' // In real implementation, get from auth context
      };

      this.dependencies.push(newDependency);

      // Emit event for real-time updates
      this.emitDependencyEvent('dependency-created', {
        dependency: newDependency,
        dependencyId: newDependency.id
      });

      return { ...newDependency };
    } catch (error) {
      if (error instanceof Error && error.message.includes('DEPENDENCY_EXISTS')) {
        throw error;
      }
      throw this.createError('CREATE_FAILED', 'Failed to create dependency', error);
    }
  }

  // Delete dependency
  async delete(dependencyId: string): Promise<void> {
    await simulateDelay();

    try {
      const index = this.dependencies.findIndex(dep => dep.id === dependencyId);
      if (index === -1) {
        throw this.createError('DEPENDENCY_NOT_FOUND', `Dependency ${dependencyId} not found`);
      }

      const deletedDep = this.dependencies.splice(index, 1)[0];

      // Emit event for real-time updates
      this.emitDependencyEvent('dependency-deleted', {
        dependencyId,
        milestoneId: deletedDep.milestoneId,
        dependsOnId: deletedDep.dependsOnId
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('DEPENDENCY_NOT_FOUND')) {
        throw error;
      }
      throw this.createError('DELETE_FAILED', 'Failed to delete dependency', error);
    }
  }

  // Update dependency
  async update(dependencyId: string, updates: Partial<MilestoneDependency>): Promise<MilestoneDependency> {
    await simulateDelay();

    try {
      const depIndex = this.dependencies.findIndex(dep => dep.id === dependencyId);
      if (depIndex === -1) {
        throw this.createError('DEPENDENCY_NOT_FOUND', `Dependency ${dependencyId} not found`);
      }

      const currentDep = this.dependencies[depIndex];
      
      // If changing the dependency relationship, check for cycles
      if (updates.dependsOnId && updates.dependsOnId !== currentDep.dependsOnId) {
        const wouldCreateCycle = await this.checkForCircularDependency(
          currentDep.milestoneId,
          updates.dependsOnId
        );

        if (wouldCreateCycle) {
          throw this.createError(
            'CIRCULAR_DEPENDENCY',
            'Updating this dependency would result in a circular reference'
          );
        }
      }

      const updatedDep: MilestoneDependency = {
        ...currentDep,
        ...updates,
        id: dependencyId // Ensure ID doesn't change
      };

      this.dependencies[depIndex] = updatedDep;

      // Emit event for real-time updates
      this.emitDependencyEvent('dependency-updated', {
        dependency: updatedDep,
        dependencyId,
        changes: updates
      });

      return { ...updatedDep };
    } catch (error) {
      if (error instanceof Error && 
          (error.message.includes('DEPENDENCY_NOT_FOUND') || 
           error.message.includes('CIRCULAR_DEPENDENCY'))) {
        throw error;
      }
      throw this.createError('UPDATE_FAILED', 'Failed to update dependency', error);
    }
  }

  // Validate dependencies for a set of milestones
  async validateDependencies(milestoneIds: string[]): Promise<ValidationResult> {
    await simulateDelay();

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Get all dependencies for the specified milestones
      const relevantDeps = this.dependencies.filter(
        dep => milestoneIds.includes(dep.milestoneId) || milestoneIds.includes(dep.dependsOnId)
      );

      // Check for circular dependencies
      for (const milestoneId of milestoneIds) {
        const hasCycle = await this.detectCycleFromMilestone(milestoneId, new Set());
        if (hasCycle) {
          errors.push({
            field: 'dependencies',
            message: `Circular dependency detected involving milestone ${milestoneId}`,
            code: 'CIRCULAR_DEPENDENCY'
          });
        }
      }

      // Check for orphaned dependencies (dependencies to non-existent milestones)
      for (const dep of relevantDeps) {
        if (!milestoneIds.includes(dep.dependsOnId)) {
          warnings.push({
            field: 'dependencies',
            message: `Milestone ${dep.milestoneId} depends on external milestone ${dep.dependsOnId}`,
            code: 'EXTERNAL_DEPENDENCY'
          });
        }
      }

      // Check for excessive dependency chains
      for (const milestoneId of milestoneIds) {
        const chainLength = await this.getMaxDependencyChainLength(milestoneId);
        if (chainLength > 5) {
          warnings.push({
            field: 'dependencies',
            message: `Milestone ${milestoneId} has a dependency chain longer than 5 levels`,
            code: 'LONG_DEPENDENCY_CHAIN'
          });
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      throw this.createError('VALIDATION_FAILED', 'Failed to validate dependencies', error);
    }
  }

  // Get critical path for a set of milestones
  async getCriticalPath(milestoneIds: string[]): Promise<string[]> {
    await simulateDelay();

    try {
      // Build dependency graph
      const graph = await this.buildDependencyGraph(milestoneIds);
      
      // Find milestones with no dependencies (start nodes)
      const startNodes = milestoneIds.filter(id => 
        !this.dependencies.some(dep => dep.milestoneId === id)
      );

      // Find milestones that nothing depends on (end nodes)
      const endNodes = milestoneIds.filter(id =>
        !this.dependencies.some(dep => dep.dependsOnId === id)
      );

      // For each path from start to end, calculate total duration
      // This is a simplified critical path calculation
      let longestPath: string[] = [];
      let maxDuration = 0;

      for (const start of startNodes) {
        for (const end of endNodes) {
          const paths = this.findAllPaths(start, end, graph);
          for (const path of paths) {
            // In real implementation, calculate actual duration based on milestone dates
            if (path.length > longestPath.length) {
              longestPath = path;
              maxDuration = path.length; // Simplified
            }
          }
        }
      }

      return longestPath;
    } catch (error) {
      throw this.createError('CRITICAL_PATH_FAILED', 'Failed to calculate critical path', error);
    }
  }

  // Build dependency graph for visualization
  async buildDependencyGraph(milestoneIds: string[]): Promise<DependencyGraph> {
    await simulateDelay();

    try {
      const nodes: GraphNode[] = [];
      const edges: GraphEdge[] = [];

      // Create nodes for each milestone
      for (const milestoneId of milestoneIds) {
        // In real implementation, fetch milestone details
        nodes.push({
          id: milestoneId,
          label: `Milestone ${milestoneId}`,
          type: 'milestone',
          status: 'in_progress', // Mock status
          progress: 50, // Mock progress
          dueDate: new Date().toISOString(),
          isOverdue: false,
          isCritical: false
        });
      }

      // Create edges for dependencies
      const relevantDeps = this.dependencies.filter(
        dep => milestoneIds.includes(dep.milestoneId) && milestoneIds.includes(dep.dependsOnId)
      );

      for (const dep of relevantDeps) {
        edges.push({
          id: dep.id,
          from: dep.dependsOnId,
          to: dep.milestoneId,
          type: dep.dependencyType,
          lagDays: dep.lagDays,
          isCritical: false // Will be determined by critical path calculation
        });
      }

      // Mark critical path
      const criticalPath = await this.getCriticalPath(milestoneIds);
      for (let i = 0; i < criticalPath.length - 1; i++) {
        const edge = edges.find(e => 
          e.from === criticalPath[i] && e.to === criticalPath[i + 1]
        );
        if (edge) {
          edge.isCritical = true;
        }
      }

      // Mark critical nodes
      criticalPath.forEach(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          node.isCritical = true;
        }
      });

      return { nodes, edges, criticalPath };
    } catch (error) {
      throw this.createError('GRAPH_BUILD_FAILED', 'Failed to build dependency graph', error);
    }
  }

  // Private helper methods
  private async checkForCircularDependency(milestoneId: string, dependsOnId: string): Promise<boolean> {
    // Check if creating this dependency would create a cycle
    const visited = new Set<string>();
    return this.detectCycleFromMilestone(dependsOnId, visited, milestoneId);
  }

  private detectCycleFromMilestone(
    currentId: string, 
    visited: Set<string>, 
    targetId?: string
  ): boolean {
    if (visited.has(currentId)) {
      return true;
    }

    if (targetId && currentId === targetId) {
      return true;
    }

    visited.add(currentId);

    const dependencies = this.dependencies.filter(dep => dep.dependsOnId === currentId);
    for (const dep of dependencies) {
      if (this.detectCycleFromMilestone(dep.milestoneId, new Set(visited), targetId)) {
        return true;
      }
    }

    return false;
  }

  private async getMaxDependencyChainLength(milestoneId: string, depth: number = 0): Promise<number> {
    const dependencies = this.dependencies.filter(dep => dep.milestoneId === milestoneId);
    
    if (dependencies.length === 0) {
      return depth;
    }

    let maxDepth = depth;
    for (const dep of dependencies) {
      const chainDepth = await this.getMaxDependencyChainLength(dep.dependsOnId, depth + 1);
      maxDepth = Math.max(maxDepth, chainDepth);
    }

    return maxDepth;
  }

  private findAllPaths(start: string, end: string, graph: DependencyGraph): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();
    
    const dfs = (current: string, path: string[]) => {
      if (current === end) {
        paths.push([...path, current]);
        return;
      }

      visited.add(current);
      
      const outgoingEdges = graph.edges.filter(e => e.from === current);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.to)) {
          dfs(edge.to, [...path, current]);
        }
      }
      
      visited.delete(current);
    };

    dfs(start, []);
    return paths;
  }

  private createError(code: string, message: string, originalError?: any): DependencyError {
    const error = new Error(message) as DependencyError;
    error.code = code;
    error.details = originalError;
    return error;
  }

  private emitDependencyEvent(type: string, data: any): void {
    const event = new CustomEvent('milestone-dependency-event', {
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
export const milestoneDependencyOperations = new MilestoneDependencyOperations();

// Type guard for validation warnings
interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}