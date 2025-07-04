import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { 
  Milestone, 
  ProjectWithMilestones, 
  MilestoneDependency,
  CreateMilestoneData,
  UpdateMilestoneData,
  MilestoneError
} from '../../milestones/types';
import { milestoneAPI } from '../../milestones/api';

interface MilestoneContextValue {
  // Data
  milestones: Milestone[];
  projects: ProjectWithMilestones[];
  dependencies: MilestoneDependency[];
  selectedMilestone: Milestone | null;
  
  // Loading states
  loading: boolean;
  error: MilestoneError | null;
  
  // Actions
  createMilestone: (milestone: CreateMilestoneData) => Promise<Milestone>;
  updateMilestone: (milestoneId: string, updates: UpdateMilestoneData) => Promise<Milestone>;
  deleteMilestone: (milestoneId: string) => Promise<void>;
  selectMilestone: (milestoneId: string | null) => void;
  refetch: () => void;
  
  // Utilities
  getMilestoneById: (id: string) => Milestone | undefined;
  getMilestonesByProject: (projectId: string) => Milestone[];
  getProjectById: (id: string) => ProjectWithMilestones | undefined;
}

const MilestoneContext = createContext<MilestoneContextValue | null>(null);

interface MilestoneDataProviderProps {
  children: ReactNode;
  projectId?: string;
  enableRealtime?: boolean;
  enableCaching?: boolean;
}

// Cache for storing data
const dataCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const MilestoneDataProvider: React.FC<MilestoneDataProviderProps> = ({
  children,
  projectId,
  enableRealtime = true,
  enableCaching = true
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projects, setProjects] = useState<ProjectWithMilestones[]>([]);
  const [dependencies, setDependencies] = useState<MilestoneDependency[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<MilestoneError | null>(null);

  // Cache utilities
  const getCacheKey = (key: string) => `milestone_${key}`;
  
  const getCachedData = (key: string) => {
    if (!enableCaching) return null;
    const cached = dataCache.get(getCacheKey(key));
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  };

  const setCachedData = (key: string, data: any) => {
    if (!enableCaching) return;
    dataCache.set(getCacheKey(key), {
      data,
      timestamp: Date.now()
    });
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      // Check cache first
      const cacheKey = projectId ? `project_${projectId}` : 'all_milestones';
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        setMilestones(cachedData.milestones || []);
        setProjects(cachedData.projects || []);
        setDependencies(cachedData.dependencies || []);
        setLoading(false);
        return;
      }

      // Fetch milestones
      const milestonesResponse = await milestoneAPI.milestones.list({
        projectId,
        includeArchived: false
      });

      // Fetch dependencies for all milestones
      let allDependencies: MilestoneDependency[] = [];
      for (const milestone of milestonesResponse.milestones) {
        try {
          const depResponse = await milestoneAPI.dependencies.list(milestone.id);
          allDependencies = [...allDependencies, ...depResponse.dependencies];
        } catch (err) {
          console.warn(`Failed to fetch dependencies for milestone ${milestone.id}:`, err);
        }
      }

      // Fetch project data (mock for now)
      const mockProjects: ProjectWithMilestones[] = [
        {
          id: 'project-1',
          name: 'Website Redesign',
          description: 'Complete overhaul of company website',
          color: '#3b82f6',
          ownerId: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: new Date().toISOString(),
          isArchived: false,
          isFavorite: false,
          teamMembers: ['user-1', 'user-2', 'user-3'],
          settings: { allowComments: true, allowAttachments: true, requireDueDates: false, customStatuses: [] },
          stats: { totalTasks: 0, completedTasks: 0, overdueTasks: 0, activeTasks: 0, completionRate: 0 },
          milestones: milestonesResponse.milestones.filter(m => m.projectId === 'project-1'),
          milestoneCount: milestonesResponse.milestones.filter(m => m.projectId === 'project-1').length,
          completedMilestones: milestonesResponse.milestones.filter(m => m.projectId === 'project-1' && m.status === 'completed').length,
          overdueMilestones: 0,
          activeMilestones: milestonesResponse.milestones.filter(m => m.projectId === 'project-1' && m.status === 'in_progress').length,
          milestoneCompletionRate: 0
        },
        {
          id: 'project-2',
          name: 'Mobile App Development',
          description: 'Native mobile app for iOS and Android',
          color: '#10b981',
          ownerId: 'user-2',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: new Date().toISOString(),
          isArchived: false,
          isFavorite: false,
          teamMembers: ['user-2', 'user-4'],
          settings: { allowComments: true, allowAttachments: true, requireDueDates: false, customStatuses: [] },
          stats: { totalTasks: 0, completedTasks: 0, overdueTasks: 0, activeTasks: 0, completionRate: 0 },
          milestones: milestonesResponse.milestones.filter(m => m.projectId === 'project-2'),
          milestoneCount: milestonesResponse.milestones.filter(m => m.projectId === 'project-2').length,
          completedMilestones: milestonesResponse.milestones.filter(m => m.projectId === 'project-2' && m.status === 'completed').length,
          overdueMilestones: 0,
          activeMilestones: milestonesResponse.milestones.filter(m => m.projectId === 'project-2' && m.status === 'in_progress').length,
          milestoneCompletionRate: 0
        }
      ];

      // Update state
      setMilestones(milestonesResponse.milestones);
      setProjects(mockProjects);
      setDependencies(allDependencies);

      // Cache the data
      setCachedData(cacheKey, {
        milestones: milestonesResponse.milestones,
        projects: mockProjects,
        dependencies: allDependencies
      });

    } catch (err) {
      const error = err as MilestoneError;
      setError(error);
      console.error('Failed to fetch milestone data:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, enableCaching]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealtime) return;

    const handleMilestoneEvent = (event: CustomEvent) => {
      const { type, milestoneId, milestone, changes } = event.detail;

      switch (type) {
        case 'milestone-created':
          if (milestone) {
            setMilestones(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === milestone.id)) return prev;
              return [milestone, ...prev];
            });
            
            // Clear cache to force refresh
            if (enableCaching) {
              const cacheKey = milestone.projectId ? `project_${milestone.projectId}` : 'all_milestones';
              dataCache.delete(getCacheKey(cacheKey));
            }
          }
          break;

        case 'milestone-updated':
          if (milestoneId && changes) {
            setMilestones(prev => prev.map(m => 
              m.id === milestoneId ? { ...m, ...changes, updatedAt: new Date().toISOString() } : m
            ));
            
            // Update selected milestone if it's the one being updated
            setSelectedMilestone(prev => 
              prev && prev.id === milestoneId ? { ...prev, ...changes, updatedAt: new Date().toISOString() } : prev
            );
          }
          break;

        case 'milestone-deleted':
          if (milestoneId) {
            setMilestones(prev => prev.filter(m => m.id !== milestoneId));
            
            // Clear selection if deleted milestone was selected
            setSelectedMilestone(prev => 
              prev && prev.id === milestoneId ? null : prev
            );
          }
          break;

        case 'milestone-completed':
          if (milestoneId) {
            const completedAt = new Date().toISOString();
            setMilestones(prev => prev.map(m => 
              m.id === milestoneId 
                ? { ...m, status: 'completed', progress: 100, completedAt, updatedAt: completedAt }
                : m
            ));
          }
          break;

        case 'progress-updated':
          if (milestoneId && typeof event.detail.progress === 'number') {
            setMilestones(prev => prev.map(m => 
              m.id === milestoneId 
                ? { ...m, progress: event.detail.progress, updatedAt: new Date().toISOString() }
                : m
            ));
          }
          break;
      }
    };

    // Listen for milestone events
    window.addEventListener('milestone-event', handleMilestoneEvent as EventListener);

    // Listen for cross-tab updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'milestones_updated') {
        fetchData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('milestone-event', handleMilestoneEvent as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchData, enableRealtime, enableCaching]);

  // CRUD operations
  const createMilestone = useCallback(async (milestoneData: CreateMilestoneData): Promise<Milestone> => {
    try {
      setError(null);
      
      let newMilestone: Milestone;
      
      if (milestoneData.dependencies && milestoneData.dependencies.length > 0) {
        const result = await milestoneAPI.createMilestoneWithDependencies(
          milestoneData,
          milestoneData.dependencies
        );
        newMilestone = result.milestone;
        
        // Update dependencies
        setDependencies(prev => [...prev, ...result.dependencies]);
      } else {
        newMilestone = await milestoneAPI.milestones.create(milestoneData);
      }
      
      // Add to local state (real-time event will also update it, but this provides immediate feedback)
      setMilestones(prev => [newMilestone, ...prev]);
      
      // Clear cache
      if (enableCaching) {
        const cacheKey = milestoneData.projectId ? `project_${milestoneData.projectId}` : 'all_milestones';
        dataCache.delete(getCacheKey(cacheKey));
      }
      
      return newMilestone;
    } catch (err) {
      const error = err as MilestoneError;
      setError(error);
      throw error;
    }
  }, [enableCaching]);

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
      
      // Update selected milestone if it's the one being updated
      setSelectedMilestone(prev => 
        prev && prev.id === milestoneId ? updatedMilestone : prev
      );
      
      return updatedMilestone;
    } catch (err) {
      const error = err as MilestoneError;
      setError(error);
      throw error;
    }
  }, []);

  const deleteMilestone = useCallback(async (milestoneId: string): Promise<void> => {
    try {
      setError(null);
      await milestoneAPI.deleteMilestoneWithCleanup(milestoneId);
      
      // Remove from local state
      setMilestones(prev => prev.filter(milestone => milestone.id !== milestoneId));
      
      // Clear selection if deleted milestone was selected
      setSelectedMilestone(prev => 
        prev && prev.id === milestoneId ? null : prev
      );
      
      // Remove related dependencies
      setDependencies(prev => prev.filter(dep => 
        dep.milestoneId !== milestoneId && dep.dependsOnId !== milestoneId
      ));
    } catch (err) {
      const error = err as MilestoneError;
      setError(error);
      throw error;
    }
  }, []);

  const selectMilestone = useCallback((milestoneId: string | null) => {
    if (milestoneId) {
      const milestone = milestones.find(m => m.id === milestoneId);
      setSelectedMilestone(milestone || null);
    } else {
      setSelectedMilestone(null);
    }
  }, [milestones]);

  // Utility functions
  const getMilestoneById = useCallback((id: string): Milestone | undefined => {
    return milestones.find(milestone => milestone.id === id);
  }, [milestones]);

  const getMilestonesByProject = useCallback((projectId: string): Milestone[] => {
    return milestones.filter(milestone => milestone.projectId === projectId && !milestone.isArchived);
  }, [milestones]);

  const getProjectById = useCallback((id: string): ProjectWithMilestones | undefined => {
    return projects.find(project => project.id === id);
  }, [projects]);

  const contextValue: MilestoneContextValue = {
    // Data
    milestones,
    projects,
    dependencies,
    selectedMilestone,
    
    // Loading states
    loading,
    error,
    
    // Actions
    createMilestone,
    updateMilestone,
    deleteMilestone,
    selectMilestone,
    refetch: fetchData,
    
    // Utilities
    getMilestoneById,
    getMilestonesByProject,
    getProjectById
  };

  return (
    <MilestoneContext.Provider value={contextValue}>
      {children}
    </MilestoneContext.Provider>
  );
};

// Hook to use the milestone context
export const useMilestoneContext = () => {
  const context = useContext(MilestoneContext);
  if (!context) {
    throw new Error('useMilestoneContext must be used within a MilestoneDataProvider');
  }
  return context;
};

// Error boundary component for milestone operations
export class MilestoneErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Milestone error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-2">Something went wrong with milestone management</h3>
          <p className="text-red-600 text-sm">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-3 px-3 py-1 text-sm bg-red-100 text-red-800 border border-red-300 rounded hover:bg-red-200"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}