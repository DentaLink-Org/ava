import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  MilestoneDependency,
  UseMilestoneDependenciesReturn,
  CreateDependencyData,
  ValidationResult,
  DependencyGraph,
  Milestone,
  DependencyError
} from '../types';
import { milestoneAPI } from '../api';

interface UseMilestoneDependenciesOptions {
  milestoneId?: string;
  projectId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealtime?: boolean;
}

export function useMilestoneDependencies(options: UseMilestoneDependenciesOptions = {}): UseMilestoneDependenciesReturn {
  const { 
    milestoneId,
    projectId,
    autoRefresh = true, 
    refreshInterval = 30000,
    enableRealtime = true 
  } = options;
  
  const [dependencies, setDependencies] = useState<MilestoneDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DependencyError | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Fetch dependencies
  const fetchDependencies = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch dependencies for specific milestone or all
      const { dependencies: deps } = await milestoneAPI.dependencies.list(milestoneId);
      
      // If projectId is specified, filter to project milestones only
      if (projectId) {
        // In real implementation, would fetch milestone details to check projectId
        setDependencies(deps);
      } else {
        setDependencies(deps);
      }
      
    } catch (err) {
      const error = err as DependencyError;
      setError(error);
      console.error('Failed to fetch dependencies:', error);
    } finally {
      setLoading(false);
    }
  }, [milestoneId, projectId]);

  // Create dependency
  const createDependency = useCallback(async (
    dependencyData: CreateDependencyData
  ): Promise<MilestoneDependency> => {
    try {
      setError(null);
      
      const newDependency = await milestoneAPI.dependencies.create(dependencyData);
      
      // Add to local state
      setDependencies(prev => [...prev, newDependency]);
      
      // Revalidate if we have a validation context
      if (validationResult) {
        await validateCurrentDependencies();
      }
      
      return newDependency;
    } catch (err) {
      const error = err as DependencyError;
      setError(error);
      
      // Check if it's a circular dependency error
      if (error.code === 'CIRCULAR_DEPENDENCY') {
        // Update validation result with error
        setValidationResult({
          isValid: false,
          errors: [{
            field: 'dependencies',
            message: error.message,
            code: 'CIRCULAR_DEPENDENCY'
          }],
          warnings: []
        });
      }
      
      throw error;
    }
  }, [validationResult]);

  // Delete dependency
  const deleteDependency = useCallback(async (dependencyId: string): Promise<void> => {
    try {
      setError(null);
      
      await milestoneAPI.dependencies.delete(dependencyId);
      
      // Remove from local state
      setDependencies(prev => prev.filter(dep => dep.id !== dependencyId));
      
      // Revalidate
      if (validationResult) {
        await validateCurrentDependencies();
      }
    } catch (err) {
      const error = err as DependencyError;
      setError(error);
      throw error;
    }
  }, [validationResult]);

  // Validate dependencies
  const validateDependencies = useCallback(async (
    dependenciesToValidate: MilestoneDependency[]
  ): Promise<ValidationResult> => {
    try {
      setError(null);
      
      // Get unique milestone IDs
      const milestoneIds = Array.from(new Set([
        ...dependenciesToValidate.map(d => d.milestoneId),
        ...dependenciesToValidate.map(d => d.dependsOnId)
      ]));
      
      const result = await milestoneAPI.dependencies.validateDependencies(milestoneIds);
      setValidationResult(result);
      
      return result;
    } catch (err) {
      const error = err as DependencyError;
      setError(error);
      throw error;
    }
  }, []);

  // Validate current dependencies
  const validateCurrentDependencies = useCallback(async (): Promise<ValidationResult> => {
    return validateDependencies(dependencies);
  }, [dependencies, validateDependencies]);

  // Get critical path
  const getCriticalPath = useCallback(async (milestoneIds: string[]): Promise<Milestone[]> => {
    try {
      setError(null);
      
      // Get critical path milestone IDs
      const criticalPathIds = await milestoneAPI.dependencies.getCriticalPath(milestoneIds);
      
      // Fetch milestone details for critical path
      const criticalMilestones: Milestone[] = [];
      for (const id of criticalPathIds) {
        const { milestone } = await milestoneAPI.milestones.get(id);
        criticalMilestones.push(milestone);
      }
      
      return criticalMilestones;
    } catch (err) {
      const error = err as DependencyError;
      setError(error);
      throw error;
    }
  }, []);

  // Get dependency graph
  const getDependencyGraph = useCallback(async (
    targetMilestoneId: string
  ): Promise<DependencyGraph> => {
    try {
      setError(null);
      
      // Get all related dependencies
      const { dependencies: allDeps } = await milestoneAPI.dependencies.list();
      
      // Build graph starting from target milestone
      const relatedMilestoneIds = new Set<string>([targetMilestoneId]);
      
      // Find all connected milestones
      let changed = true;
      while (changed) {
        changed = false;
        for (const dep of allDeps) {
          if (relatedMilestoneIds.has(dep.milestoneId) && !relatedMilestoneIds.has(dep.dependsOnId)) {
            relatedMilestoneIds.add(dep.dependsOnId);
            changed = true;
          }
          if (relatedMilestoneIds.has(dep.dependsOnId) && !relatedMilestoneIds.has(dep.milestoneId)) {
            relatedMilestoneIds.add(dep.milestoneId);
            changed = true;
          }
        }
      }
      
      // Build graph with related milestones
      const graph = await milestoneAPI.dependencies.buildDependencyGraph(
        Array.from(relatedMilestoneIds)
      );
      
      return graph;
    } catch (err) {
      const error = err as DependencyError;
      setError(error);
      throw error;
    }
  }, []);

  // Check if adding a dependency would create a cycle
  const checkForCycle = useCallback(async (
    fromMilestoneId: string,
    toMilestoneId: string
  ): Promise<boolean> => {
    try {
      // Create temporary dependency for validation
      const tempDependencies = [
        ...dependencies,
        {
          id: 'temp',
          milestoneId: fromMilestoneId,
          dependsOnId: toMilestoneId,
          dependencyType: 'finish_to_start' as const,
          lagDays: 0,
          createdAt: new Date().toISOString(),
          createdBy: 'temp'
        }
      ];
      
      const milestoneIds = Array.from(new Set([
        ...tempDependencies.map(d => d.milestoneId),
        ...tempDependencies.map(d => d.dependsOnId)
      ]));
      
      const result = await milestoneAPI.dependencies.validateDependencies(milestoneIds);
      
      return result.errors.some(e => e.code === 'CIRCULAR_DEPENDENCY');
    } catch (err) {
      console.error('Error checking for cycle:', err);
      return false;
    }
  }, [dependencies]);

  // Initial fetch
  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchDependencies();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDependencies]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealtime) return;

    const handleDependencyEvent = (event: CustomEvent) => {
      const { type, dependency, dependencyId } = event.detail;

      switch (type) {
        case 'dependency-created':
          setDependencies(prev => {
            if (prev.some(d => d.id === dependency.id)) return prev;
            return [...prev, dependency];
          });
          break;

        case 'dependency-updated':
          setDependencies(prev => prev.map(d => 
            d.id === dependencyId ? { ...d, ...event.detail.changes } : d
          ));
          break;

        case 'dependency-deleted':
          setDependencies(prev => prev.filter(d => d.id !== dependencyId));
          break;
      }
    };

    window.addEventListener('milestone-dependency-event', handleDependencyEvent as EventListener);

    return () => {
      window.removeEventListener('milestone-dependency-event', handleDependencyEvent as EventListener);
    };
  }, [enableRealtime]);

  // Computed values
  const dependencyMap = useMemo(() => {
    const map = new Map<string, MilestoneDependency[]>();
    
    dependencies.forEach(dep => {
      // Group by milestone
      if (!map.has(dep.milestoneId)) {
        map.set(dep.milestoneId, []);
      }
      map.get(dep.milestoneId)!.push(dep);
      
      // Also track reverse dependencies
      const reverseKey = `reverse-${dep.dependsOnId}`;
      if (!map.has(reverseKey)) {
        map.set(reverseKey, []);
      }
      map.get(reverseKey)!.push(dep);
    });
    
    return map;
  }, [dependencies]);

  const getDependenciesForMilestone = useCallback((milestoneId: string) => {
    return dependencyMap.get(milestoneId) || [];
  }, [dependencyMap]);

  const getDependentMilestones = useCallback((milestoneId: string) => {
    return dependencyMap.get(`reverse-${milestoneId}`) || [];
  }, [dependencyMap]);

  return {
    dependencies,
    loading,
    error,
    createDependency,
    deleteDependency,
    validateDependencies,
    getCriticalPath,
    getDependencyGraph,
    refetch: fetchDependencies,
    
    // Additional methods
    checkForCycle,
    validateCurrentDependencies,
    getDependenciesForMilestone,
    getDependentMilestones,
    
    // Validation state
    validationResult,
    isValid: validationResult?.isValid ?? true,
    validationErrors: validationResult?.errors || [],
    validationWarnings: validationResult?.warnings || []
  };
}