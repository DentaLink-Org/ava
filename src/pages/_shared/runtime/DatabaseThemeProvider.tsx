/**
 * Database Theme Provider
 * Enhanced theme provider that loads themes from database and supports real-time switching
 */

'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { RuntimeTheme } from '../types/theme';
import { useThemeManager } from '../hooks/useThemeManager';
import { injectThemeCSS, removeThemeCSS } from '../utils/theme-injection';

// Database theme context interface
interface DatabaseThemeContextValue {
  currentTheme: RuntimeTheme | null;
  availableThemes: RuntimeTheme[];
  isLoading: boolean;
  error: string | null;
  pageId: string;
  
  // Theme operations
  applyTheme: (themeId: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
  refreshThemes: () => Promise<void>;
  
  // Theme utilities
  getCSSProperty: (property: string) => string;
  getThemeValue: (path: string) => string | undefined;
}

// Create database theme context
const DatabaseThemeContext = createContext<DatabaseThemeContextValue | null>(null);

// Database Theme Provider Props
interface DatabaseThemeProviderProps {
  pageId: string;
  children: React.ReactNode;
  fallbackTheme?: RuntimeTheme;
  enableAutoRefresh?: boolean;
  onThemeChange?: (theme: RuntimeTheme) => void;
}

/**
 * Database-powered theme provider with real-time updates
 */
export const DatabaseThemeProvider: React.FC<DatabaseThemeProviderProps> = ({
  pageId,
  children,
  fallbackTheme,
  enableAutoRefresh = false,
  onThemeChange
}) => {
  const [appliedTheme, setAppliedTheme] = useState<RuntimeTheme | null>(null);

  // Use theme manager for database operations
  const {
    currentTheme,
    availableThemes,
    isLoading,
    error,
    applyThemeToPage,
    getPageTheme,
    resetToDefault: resetThemeToDefault,
    refreshThemes
  } = useThemeManager({
    pageId,
    enableCaching: true,
    autoRefresh: enableAutoRefresh,
    refreshInterval: 30000
  });

  // Force theme reload when pageId changes to ensure persistence
  useEffect(() => {
    const loadPageTheme = async () => {
      try {
        const theme = await getPageTheme(pageId);
        setAppliedTheme(theme);
      } catch (error) {
        console.error(`Failed to load theme for page ${pageId}:`, error);
        if (fallbackTheme) {
          setAppliedTheme(fallbackTheme);
        }
      }
    };

    loadPageTheme();
  }, [pageId, getPageTheme, fallbackTheme]);

  // Update applied theme when current theme changes
  useEffect(() => {
    if (currentTheme) {
      setAppliedTheme(currentTheme);
      onThemeChange?.(currentTheme);
    } else if (fallbackTheme && !appliedTheme) {
      setAppliedTheme(fallbackTheme);
      onThemeChange?.(fallbackTheme);
    }
  }, [currentTheme, fallbackTheme, onThemeChange, appliedTheme]);

  // Inject CSS custom properties when theme changes
  useEffect(() => {
    if (appliedTheme) {
      injectThemeCSS(pageId, appliedTheme);
    }
    
    // Don't remove theme CSS on unmount to prevent flashing
    // Let the next theme application clean up old styles
  }, [pageId, appliedTheme]);

  // Apply theme to current page
  const applyTheme = async (themeId: string): Promise<void> => {
    try {
      await applyThemeToPage(pageId, themeId);
      // Force refresh of page theme to ensure UI updates
      const updatedTheme = await getPageTheme(pageId);
      setAppliedTheme(updatedTheme);
    } catch (error) {
      console.error('Failed to apply theme:', error);
      throw error;
    }
  };

  // Reset to default theme
  const resetToDefault = async (): Promise<void> => {
    try {
      await resetThemeToDefault(pageId);
      // Theme will be updated via the useThemeManager hook
    } catch (error) {
      console.error('Failed to reset theme:', error);
      throw error;
    }
  };

  // Get CSS custom property value
  const getCSSProperty = (property: string): string => {
    if (!appliedTheme) return '';
    return appliedTheme.cssProperties[property] || '';
  };

  // Get theme value by path (e.g., 'colors.primary')
  const getThemeValue = (path: string): string | undefined => {
    if (!appliedTheme) return undefined;
    
    const cssKey = `--${path.replace('.', '-')}`;
    return appliedTheme.cssProperties[cssKey];
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo((): DatabaseThemeContextValue => ({
    currentTheme: appliedTheme,
    availableThemes,
    isLoading,
    error,
    pageId,
    applyTheme,
    resetToDefault,
    refreshThemes,
    getCSSProperty,
    getThemeValue
  }), [
    appliedTheme,
    availableThemes,
    isLoading,
    error,
    pageId,
    applyTheme,
    resetToDefault,
    refreshThemes,
    getCSSProperty,
    getThemeValue
  ]);

  return (
    <DatabaseThemeContext.Provider value={contextValue}>
      <div 
        className={`page-container page-${pageId}`}
        data-page-id={pageId}
        data-theme-id={appliedTheme?.id}
        style={{ 
          ['--page-id' as any]: `"${pageId}"`,
          isolation: 'isolate' // Create new stacking context for style isolation
        }}
      >
        {children}
      </div>
    </DatabaseThemeContext.Provider>
  );
};

/**
 * Hook to access database theme context
 */
export const useDatabaseTheme = (): DatabaseThemeContextValue => {
  const context = useContext(DatabaseThemeContext);
  if (!context) {
    throw new Error('useDatabaseTheme must be used within a DatabaseThemeProvider');
  }
  return context;
};

/**
 * Hook to access only current theme (lighter weight)
 */
export const useCurrentTheme = (): RuntimeTheme | null => {
  const context = useContext(DatabaseThemeContext);
  if (!context) {
    throw new Error('useCurrentTheme must be used within a DatabaseThemeProvider');
  }
  return context.currentTheme;
};

/**
 * Higher-order component to inject database theme into components
 */
export const withDatabaseTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: RuntimeTheme | null }>
): React.FC<P> => {
  return (props: P) => {
    const theme = useCurrentTheme();
    return <Component {...props} theme={theme} />;
  };
};



/**
 * Theme utility functions for database themes
 */
export const databaseThemeUtils = {
  /**
   * Get CSS variable value
   */
  getCSSVar: (property: string): string => {
    return `var(${property})`;
  },

  /**
   * Get inline styles for theme properties
   */
  getInlineStyles: (properties: Record<string, string>): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    Object.entries(properties).forEach(([key, cssProperty]) => {
      (styles as any)[key] = `var(${cssProperty})`;
    });
    return styles;
  },

  /**
   * Generate theme-aware className
   */
  getThemeClass: (pageId: string, baseClass: string): string => {
    return `${baseClass} page-${pageId}-themed`;
  },

  /**
   * Check if theme is dark mode
   */
  isDarkTheme: (theme: RuntimeTheme): boolean => {
    return theme.category === 'dark';
  },

  /**
   * Get contrast ratio for accessibility
   */
  getContrastRatio: (color1: string, color2: string): number => {
    // Simplified contrast calculation
    // In production, you'd want a more accurate algorithm
    const getLuminance = (color: string): number => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
      
      return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }
};