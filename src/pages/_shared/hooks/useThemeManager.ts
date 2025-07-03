/**
 * Theme Manager Hook
 * Manages theme loading, caching, and real-time updates from database
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RuntimeTheme, ThemeContext, ThemeOperations, ThemeVariationRecord } from '../types/theme';

interface UseThemeManagerOptions {
  pageId?: string;
  enableCaching?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface ThemeManagerState {
  currentTheme: RuntimeTheme | null;
  availableThemes: RuntimeTheme[];
  pageThemeAssignments: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface ThemeManagerActions {
  loadTheme: (themeId: string) => Promise<RuntimeTheme>;
  applyThemeToPage: (pageId: string, themeId: string, isVariation?: boolean) => Promise<void>;
  getAllThemes: () => Promise<RuntimeTheme[]>;
  getPageTheme: (pageId: string) => Promise<RuntimeTheme>;
  refreshThemes: () => Promise<void>;
  clearCache: () => void;
  createCustomTheme: (theme: any) => Promise<string>;
  resetToDefault: (pageId: string) => Promise<void>;
  // Variation operations
  createThemeVariation: (parentThemeId: string, variation: any) => Promise<string>;
  getThemeVariations: (themeId: string) => Promise<ThemeVariationRecord[]>;
}

type ThemeManagerReturn = ThemeManagerState & ThemeManagerActions;

// Theme cache
const themeCache = new Map<string, RuntimeTheme>();
const pageThemeCache = new Map<string, string>();
let lastCacheUpdate = new Date(0);

/**
 * Hook for managing theme operations and state
 */
export const useThemeManager = (options: UseThemeManagerOptions = {}): ThemeManagerReturn => {
  const {
    pageId,
    enableCaching = true,
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options;

  const [state, setState] = useState<ThemeManagerState>({
    currentTheme: null,
    availableThemes: [],
    pageThemeAssignments: {},
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  // API base URL - fall back to test endpoint if database is not available
  const apiBase = '/api/themes';

  /**
   * Fetch theme by ID
   */
  const loadTheme = useCallback(async (themeId: string): Promise<RuntimeTheme> => {
    // Check cache first
    if (enableCaching && themeCache.has(themeId)) {
      return themeCache.get(themeId)!;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${apiBase}/${themeId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load theme');
      }

      const theme = result.data as RuntimeTheme;
      
      // Cache the theme
      if (enableCaching) {
        themeCache.set(themeId, theme);
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        lastUpdated: new Date()
      }));

      return theme;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, [enableCaching, apiBase]);

  /**
   * Get all available themes
   */
  const getAllThemes = useCallback(async (): Promise<RuntimeTheme[]> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let response = await fetch(`${apiBase}`);
      let result = await response.json();

      // If main API fails, try test endpoint
      if (!result.success) {
        console.warn('Main themes API failed, trying test endpoint');
        response = await fetch(`${apiBase}/test`);
        result = await response.json();
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to load themes');
      }

      const themes = result.data as RuntimeTheme[];
      
      // Cache all themes
      if (enableCaching) {
        themes.forEach(theme => {
          themeCache.set(theme.id, theme);
        });
      }

      setState(prev => ({ 
        ...prev, 
        availableThemes: themes,
        isLoading: false,
        lastUpdated: new Date()
      }));

      return themes;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, [enableCaching, apiBase]);

  /**
   * Get theme for specific page
   */
  const getPageTheme = useCallback(async (targetPageId: string): Promise<RuntimeTheme> => {
    // Check cache first
    if (enableCaching && pageThemeCache.has(targetPageId)) {
      const themeId = pageThemeCache.get(targetPageId)!;
      if (themeCache.has(themeId)) {
        return themeCache.get(themeId)!;
      }
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${apiBase}/pages/${targetPageId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load page theme');
      }

      const theme = result.data as RuntimeTheme;
      
      // Cache the theme and assignment
      if (enableCaching) {
        themeCache.set(theme.id, theme);
        pageThemeCache.set(targetPageId, theme.id);
      }

      // Update page theme assignments
      setState(prev => ({ 
        ...prev, 
        pageThemeAssignments: {
          ...prev.pageThemeAssignments,
          [targetPageId]: theme.id
        },
        currentTheme: targetPageId === pageId ? theme : prev.currentTheme,
        isLoading: false,
        lastUpdated: new Date()
      }));

      return theme;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, [enableCaching, apiBase, pageId]);

  /**
   * Apply theme to a specific page
   */
  const applyThemeToPage = useCallback(async (targetPageId: string, themeId: string, isVariation?: boolean): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${apiBase}/pages/${targetPageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ themeId, isVariation }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to apply theme');
      }

      const theme = result.data as RuntimeTheme;

      // Update cache
      if (enableCaching) {
        themeCache.set(theme.id, theme);
        pageThemeCache.set(targetPageId, theme.id);
      }

      // Update state
      setState(prev => ({ 
        ...prev, 
        pageThemeAssignments: {
          ...prev.pageThemeAssignments,
          [targetPageId]: theme.id
        },
        currentTheme: targetPageId === pageId ? theme : prev.currentTheme,
        isLoading: false,
        lastUpdated: new Date()
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, [enableCaching, apiBase, pageId]);

  /**
   * Create custom theme
   */
  const createCustomTheme = useCallback(async (themeData: any): Promise<string> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${apiBase}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(themeData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create theme');
      }

      const theme = result.data as RuntimeTheme;

      // Update cache and state
      if (enableCaching) {
        themeCache.set(theme.id, theme);
      }

      setState(prev => ({ 
        ...prev, 
        availableThemes: [...prev.availableThemes, theme],
        isLoading: false,
        lastUpdated: new Date()
      }));

      return theme.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, [enableCaching, apiBase]);

  /**
   * Reset page to default theme
   */
  const resetToDefault = useCallback(async (targetPageId: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${apiBase}/pages/${targetPageId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to reset theme');
      }

      const theme = result.data as RuntimeTheme;

      // Update cache
      if (enableCaching) {
        themeCache.set(theme.id, theme);
        pageThemeCache.delete(targetPageId);
      }

      // Update state
      setState(prev => {
        const newAssignments = { ...prev.pageThemeAssignments };
        delete newAssignments[targetPageId];
        
        return {
          ...prev,
          pageThemeAssignments: newAssignments,
          currentTheme: targetPageId === pageId ? theme : prev.currentTheme,
          isLoading: false,
          lastUpdated: new Date()
        };
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, [enableCaching, apiBase, pageId]);

  /**
   * Refresh all themes from server
   */
  const refreshThemes = useCallback(async (): Promise<void> => {
    if (enableCaching) {
      themeCache.clear();
      pageThemeCache.clear();
    }
    await getAllThemes();
  }, [enableCaching, getAllThemes]);

  /**
   * Clear cache manually
   */
  const clearCache = useCallback((): void => {
    themeCache.clear();
    pageThemeCache.clear();
    lastCacheUpdate = new Date(0);
    setState(prev => ({ 
      ...prev, 
      availableThemes: [],
      pageThemeAssignments: {},
      lastUpdated: null 
    }));
  }, []);

  /**
   * Create theme variation
   */
  const createThemeVariation = useCallback(async (parentThemeId: string, variation: any): Promise<string> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${apiBase}/variations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parentThemeId, variation }),
      });

      const result = await response.json();

      if (!result || !result.id) {
        throw new Error('Failed to create theme variation');
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        lastUpdated: new Date()
      }));

      return result.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, [apiBase]);

  /**
   * Get theme variations
   */
  const getThemeVariations = useCallback(async (themeId: string): Promise<ThemeVariationRecord[]> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${apiBase}/variations?parentThemeId=${themeId}`);
      const result = await response.json();

      if (!Array.isArray(result)) {
        throw new Error('Failed to fetch theme variations');
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        lastUpdated: new Date()
      }));

      return result as ThemeVariationRecord[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, [apiBase]);

  // Auto-refresh themes periodically
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshThemes().catch(console.error);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshThemes]);

  // Load current page theme on mount
  useEffect(() => {
    if (pageId) {
      getPageTheme(pageId).catch(console.error);
    }
  }, [pageId, getPageTheme]);

  // Load all themes on mount
  useEffect(() => {
    getAllThemes().catch(console.error);
  }, [getAllThemes]);

  return {
    ...state,
    loadTheme,
    applyThemeToPage,
    getAllThemes,
    getPageTheme,
    refreshThemes,
    clearCache,
    createCustomTheme,
    resetToDefault,
    createThemeVariation,
    getThemeVariations
  };
};