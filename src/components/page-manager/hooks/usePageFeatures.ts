/**
 * Page Features Hook
 * Manages page features data and operations with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '../../databases/api/supabase';
import { FeaturesAPI } from '../api/features-api';
import { 
  PageFeature, 
  FeatureCreateRequest, 
  FeatureUpdateRequest, 
  FeatureFilter,
  FeatureStats,
  PageFeatureSummary 
} from '../types/features';

interface UsePageFeaturesOptions {
  pageId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UsePageFeaturesReturn {
  features: PageFeature[];
  stats: FeatureStats | null;
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  createFeature: (request: FeatureCreateRequest) => Promise<boolean>;
  updateFeature: (request: FeatureUpdateRequest) => Promise<boolean>;
  deleteFeature: (id: string) => Promise<boolean>;
  
  // Data management
  refreshFeatures: () => Promise<void>;
  filterFeatures: (filter: FeatureFilter) => Promise<void>;
  
  // State management
  selectedFeature: PageFeature | null;
  setSelectedFeature: (feature: PageFeature | null) => void;
  
  // Bulk operations
  createMultipleFeatures: (requests: FeatureCreateRequest[]) => Promise<boolean>;
  deleteMultipleFeatures: (ids: string[]) => Promise<boolean>;
}

export const usePageFeatures = (options: UsePageFeaturesOptions = {}): UsePageFeaturesReturn => {
  const { pageId, autoRefresh = true, refreshInterval = 30000 } = options;
  
  const [features, setFeatures] = useState<PageFeature[]>([]);
  const [stats, setStats] = useState<FeatureStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<PageFeature | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FeatureFilter>({});

  // Load features
  const loadFeatures = useCallback(async (filter: FeatureFilter = {}) => {
    try {
      setLoading(true);
      setError(null);

      const appliedFilter = { ...filter };
      if (pageId) {
        appliedFilter.page_id = pageId;
      }

      const response = await FeaturesAPI.getFeatures(appliedFilter);
      
      if (response.success && response.data) {
        setFeatures(response.data);
      } else {
        setError(response.error || 'Failed to load features');
        setFeatures([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error loading features:', err);
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  // Load feature statistics
  const loadStats = useCallback(async () => {
    try {
      const response = await FeaturesAPI.getFeatureStats(pageId);
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        console.error('Failed to load feature stats:', response.error);
        setStats(null);
      }
    } catch (err) {
      console.error('Error loading feature stats:', err);
    }
  }, [pageId]);

  // Refresh features and stats
  const refreshFeatures = useCallback(async () => {
    await Promise.all([
      loadFeatures(currentFilter),
      loadStats()
    ]);
  }, [loadFeatures, loadStats, currentFilter]);

  // Filter features
  const filterFeatures = useCallback(async (filter: FeatureFilter) => {
    setCurrentFilter(filter);
    await loadFeatures(filter);
  }, [loadFeatures]);

  // Create feature
  const createFeature = useCallback(async (request: FeatureCreateRequest): Promise<boolean> => {
    try {
      setError(null);
      const response = await FeaturesAPI.createFeature(request);
      
      if (response.success) {
        await refreshFeatures();
        return true;
      } else {
        setError(response.error || 'Failed to create feature');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating feature:', err);
      return false;
    }
  }, [refreshFeatures]);

  // Update feature
  const updateFeature = useCallback(async (request: FeatureUpdateRequest): Promise<boolean> => {
    try {
      setError(null);
      const response = await FeaturesAPI.updateFeature(request);
      
      if (response.success) {
        await refreshFeatures();
        return true;
      } else {
        setError(response.error || 'Failed to update feature');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error updating feature:', err);
      return false;
    }
  }, [refreshFeatures]);

  // Delete feature
  const deleteFeature = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await FeaturesAPI.deleteFeature(id);
      
      if (response.success) {
        // Clear selected feature if it was deleted
        if (selectedFeature?.id === id) {
          setSelectedFeature(null);
        }
        await refreshFeatures();
        return true;
      } else {
        setError(response.error || 'Failed to delete feature');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error deleting feature:', err);
      return false;
    }
  }, [refreshFeatures, selectedFeature]);

  // Create multiple features
  const createMultipleFeatures = useCallback(async (requests: FeatureCreateRequest[]): Promise<boolean> => {
    try {
      setError(null);
      const results = await Promise.allSettled(
        requests.map(request => FeaturesAPI.createFeature(request))
      );
      
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;
      
      if (successful > 0) {
        await refreshFeatures();
      }
      
      const failed = results.length - successful;
      if (failed > 0) {
        setError(`${successful} features created successfully, ${failed} failed`);
        return false;
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating multiple features:', err);
      return false;
    }
  }, [refreshFeatures]);

  // Delete multiple features
  const deleteMultipleFeatures = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      setError(null);
      const results = await Promise.allSettled(
        ids.map(id => FeaturesAPI.deleteFeature(id))
      );
      
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;
      
      if (successful > 0) {
        // Clear selected feature if it was deleted
        if (selectedFeature && ids.includes(selectedFeature.id)) {
          setSelectedFeature(null);
        }
        await refreshFeatures();
      }
      
      const failed = results.length - successful;
      if (failed > 0) {
        setError(`${successful} features deleted successfully, ${failed} failed`);
        return false;
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error deleting multiple features:', err);
      return false;
    }
  }, [refreshFeatures, selectedFeature]);

  // Set up real-time subscription
  useEffect(() => {
    if (!autoRefresh) return;

    const subscription = supabaseClient
      .channel('page_features_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'page_features',
          filter: pageId ? `page_id=eq.${pageId}` : undefined
        }, 
        (payload) => {
          console.log('Feature change detected:', payload);
          refreshFeatures();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [autoRefresh, pageId, refreshFeatures]);

  // Set up periodic refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      refreshFeatures();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshFeatures]);

  // Initial load
  useEffect(() => {
    loadFeatures(currentFilter);
    loadStats();
  }, [loadFeatures, loadStats, currentFilter]);

  return {
    features,
    stats,
    loading,
    error,
    
    createFeature,
    updateFeature,
    deleteFeature,
    
    refreshFeatures,
    filterFeatures,
    
    selectedFeature,
    setSelectedFeature,
    
    createMultipleFeatures,
    deleteMultipleFeatures
  };
};

export default usePageFeatures;