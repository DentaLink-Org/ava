/**
 * Page Components Hook
 * Manages page components data and operations with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '../../databases/api/supabase';
import { ComponentsAPI } from '../api/components-api';
import { 
  PageComponent, 
  ComponentCreateRequest, 
  ComponentUpdateRequest, 
  ComponentFilter,
  ComponentStats,
  ComponentSummary 
} from '../types/components';

interface UsePageComponentsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UsePageComponentsReturn {
  components: PageComponent[];
  stats: ComponentStats | null;
  summary: ComponentSummary | null;
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  createComponent: (request: ComponentCreateRequest) => Promise<boolean>;
  updateComponent: (request: ComponentUpdateRequest) => Promise<boolean>;
  deleteComponent: (id: string) => Promise<boolean>;
  
  // Data management
  refreshComponents: () => Promise<void>;
  filterComponents: (filter: ComponentFilter) => Promise<void>;
  
  // Search and retrieval
  getComponentByName: (name: string) => Promise<PageComponent | null>;
  getComponentsByCategory: (category: string) => Promise<PageComponent[]>;
  getComponentsByGroup: (group: string) => Promise<PageComponent[]>;
  searchComponents: (searchTerm: string) => Promise<void>;
  
  // State management
  selectedComponent: PageComponent | null;
  setSelectedComponent: (component: PageComponent | null) => void;
  
  // Bulk operations
  createMultipleComponents: (requests: ComponentCreateRequest[]) => Promise<boolean>;
  deleteMultipleComponents: (ids: string[]) => Promise<boolean>;
}

export const usePageComponents = (options: UsePageComponentsOptions = {}): UsePageComponentsReturn => {
  const { autoRefresh = true, refreshInterval = 30000 } = options;
  
  const [components, setComponents] = useState<PageComponent[]>([]);
  const [stats, setStats] = useState<ComponentStats | null>(null);
  const [summary, setSummary] = useState<ComponentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<PageComponent | null>(null);
  const [currentFilter, setCurrentFilter] = useState<ComponentFilter>({});

  // Load components
  const loadComponents = useCallback(async (filter: ComponentFilter = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await ComponentsAPI.getComponents(filter);
      
      if (response.success) {
        setComponents(response.data);
      } else {
        setError(response.error || 'Failed to load components');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error loading components:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load component statistics
  const loadStats = useCallback(async () => {
    try {
      const response = await ComponentsAPI.getComponentStats();
      
      if (response.success) {
        setStats(response.data);
      } else {
        console.error('Failed to load component stats:', response.error);
      }
    } catch (err) {
      console.error('Error loading component stats:', err);
    }
  }, []);

  // Load component summary
  const loadSummary = useCallback(async () => {
    try {
      const response = await ComponentsAPI.getComponentSummary();
      
      if (response.success) {
        setSummary(response.data);
      } else {
        console.error('Failed to load component summary:', response.error);
      }
    } catch (err) {
      console.error('Error loading component summary:', err);
    }
  }, []);

  // Refresh components, stats, and summary
  const refreshComponents = useCallback(async () => {
    await Promise.all([
      loadComponents(currentFilter),
      loadStats(),
      loadSummary()
    ]);
  }, [loadComponents, loadStats, loadSummary, currentFilter]);

  // Filter components
  const filterComponents = useCallback(async (filter: ComponentFilter) => {
    setCurrentFilter(filter);
    await loadComponents(filter);
  }, [loadComponents]);

  // Search components
  const searchComponents = useCallback(async (searchTerm: string) => {
    const filter: ComponentFilter = { search: searchTerm };
    await filterComponents(filter);
  }, [filterComponents]);

  // Get component by name
  const getComponentByName = useCallback(async (name: string): Promise<PageComponent | null> => {
    try {
      const response = await ComponentsAPI.getComponentByName(name);
      return response.success ? response.data : null;
    } catch (err) {
      console.error('Error getting component by name:', err);
      return null;
    }
  }, []);

  // Get components by category
  const getComponentsByCategory = useCallback(async (category: string): Promise<PageComponent[]> => {
    try {
      const response = await ComponentsAPI.getComponentsByCategory(category);
      return response.success ? response.data : [];
    } catch (err) {
      console.error('Error getting components by category:', err);
      return [];
    }
  }, []);

  // Get components by group
  const getComponentsByGroup = useCallback(async (group: string): Promise<PageComponent[]> => {
    try {
      const response = await ComponentsAPI.getComponentsByGroup(group);
      return response.success ? response.data : [];
    } catch (err) {
      console.error('Error getting components by group:', err);
      return [];
    }
  }, []);

  // Create component
  const createComponent = useCallback(async (request: ComponentCreateRequest): Promise<boolean> => {
    try {
      setError(null);
      const response = await ComponentsAPI.createComponent(request);
      
      if (response.success) {
        await refreshComponents();
        return true;
      } else {
        setError(response.error || 'Failed to create component');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating component:', err);
      return false;
    }
  }, [refreshComponents]);

  // Update component
  const updateComponent = useCallback(async (request: ComponentUpdateRequest): Promise<boolean> => {
    try {
      setError(null);
      const response = await ComponentsAPI.updateComponent(request);
      
      if (response.success) {
        await refreshComponents();
        return true;
      } else {
        setError(response.error || 'Failed to update component');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error updating component:', err);
      return false;
    }
  }, [refreshComponents]);

  // Delete component
  const deleteComponent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await ComponentsAPI.deleteComponent(id);
      
      if (response.success) {
        // Clear selected component if it was deleted
        if (selectedComponent?.id === id) {
          setSelectedComponent(null);
        }
        await refreshComponents();
        return true;
      } else {
        setError(response.error || 'Failed to delete component');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error deleting component:', err);
      return false;
    }
  }, [refreshComponents, selectedComponent]);

  // Create multiple components
  const createMultipleComponents = useCallback(async (requests: ComponentCreateRequest[]): Promise<boolean> => {
    try {
      setError(null);
      const results = await Promise.allSettled(
        requests.map(request => ComponentsAPI.createComponent(request))
      );
      
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;
      
      if (successful > 0) {
        await refreshComponents();
      }
      
      const failed = results.length - successful;
      if (failed > 0) {
        setError(`${successful} components created successfully, ${failed} failed`);
        return false;
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating multiple components:', err);
      return false;
    }
  }, [refreshComponents]);

  // Delete multiple components
  const deleteMultipleComponents = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      setError(null);
      const results = await Promise.allSettled(
        ids.map(id => ComponentsAPI.deleteComponent(id))
      );
      
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;
      
      if (successful > 0) {
        // Clear selected component if it was deleted
        if (selectedComponent && ids.includes(selectedComponent.id)) {
          setSelectedComponent(null);
        }
        await refreshComponents();
      }
      
      const failed = results.length - successful;
      if (failed > 0) {
        setError(`${successful} components deleted successfully, ${failed} failed`);
        return false;
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error deleting multiple components:', err);
      return false;
    }
  }, [refreshComponents, selectedComponent]);

  // Set up real-time subscription
  useEffect(() => {
    if (!autoRefresh) return;

    const subscription = supabaseClient
      .channel('page_components_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'page_components'
        }, 
        (payload) => {
          console.log('Component change detected:', payload);
          refreshComponents();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [autoRefresh, refreshComponents]);

  // Set up periodic refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      refreshComponents();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshComponents]);

  // Initial load
  useEffect(() => {
    loadComponents(currentFilter);
    loadStats();
    loadSummary();
  }, [loadComponents, loadStats, loadSummary, currentFilter]);

  return {
    components,
    stats,
    summary,
    loading,
    error,
    
    createComponent,
    updateComponent,
    deleteComponent,
    
    refreshComponents,
    filterComponents,
    
    getComponentByName,
    getComponentsByCategory,
    getComponentsByGroup,
    searchComponents,
    
    selectedComponent,
    setSelectedComponent,
    
    createMultipleComponents,
    deleteMultipleComponents
  };
};

export default usePageComponents;