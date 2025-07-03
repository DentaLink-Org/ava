/**
 * Theme Provider System for page-specific theming
 * Enables complete theme isolation between pages with CSS custom properties
 */

'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PageTheme, ThemeError } from './types';

// Theme context interface
interface ThemeContextValue {
  theme: PageTheme;
  setTheme: (theme: PageTheme) => void;
  updateTheme: (updates: Partial<PageTheme>) => void;
  resetTheme: () => void;
  pageId: string;
}

// Create theme context
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Theme Provider Props
interface ThemeProviderProps {
  pageId: string;
  theme: PageTheme;
  children: React.ReactNode;
  onThemeChange?: (theme: PageTheme) => void;
}

/**
 * Page-specific theme provider with CSS custom property injection
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  pageId,
  theme: initialTheme,
  children,
  onThemeChange
}) => {
  const [theme, setThemeState] = useState<PageTheme>(initialTheme);

  // Validate theme on mount and updates
  useEffect(() => {
    try {
      validateTheme(theme);
    } catch (error) {
      console.error(`Theme validation failed for page '${pageId}':`, error);
      throw new ThemeError(`Invalid theme for page '${pageId}': ${(error as Error).message}`, 'validation');
    }
  }, [theme, pageId]);

  // Inject CSS custom properties when theme changes
  useEffect(() => {
    injectThemeStyles(pageId, theme);
    
    // Cleanup function to remove styles when component unmounts
    return () => {
      removeThemeStyles(pageId);
    };
  }, [pageId, theme]);

  // Set theme with validation and callback
  const setTheme = (newTheme: PageTheme) => {
    try {
      validateTheme(newTheme);
      setThemeState(newTheme);
      onThemeChange?.(newTheme);
    } catch (error) {
      throw new ThemeError(`Failed to set theme for page '${pageId}': ${(error as Error).message}`, 'update');
    }
  };

  // Update theme partially
  const updateTheme = (updates: Partial<PageTheme>) => {
    const updatedTheme: PageTheme = {
      ...theme,
      ...updates,
      colors: { ...theme.colors, ...updates.colors },
      spacing: { ...theme.spacing, ...updates.spacing },
      typography: { ...theme.typography, ...updates.typography }
    };
    setTheme(updatedTheme);
  };

  // Reset to initial theme
  const resetTheme = () => {
    setTheme(initialTheme);
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo((): ThemeContextValue => ({
    theme,
    setTheme,
    updateTheme,
    resetTheme,
    pageId
  }), [theme, pageId]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <div 
        className={`page-container page-${pageId}`}
        data-page-id={pageId}
        style={{ 
          ['--page-id' as any]: `"${pageId}"`,
          isolation: 'isolate' // Create new stacking context for style isolation
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new ThemeError('useTheme must be used within a ThemeProvider', 'context');
  }
  return context;
};

/**
 * Hook to access only theme values (lighter weight)
 */
export const useThemeValues = (): PageTheme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new ThemeError('useThemeValues must be used within a ThemeProvider', 'context');
  }
  return context.theme;
};

/**
 * Higher-order component to inject theme into components
 */
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: PageTheme }>
): React.FC<P> => {
  return (props: P) => {
    const theme = useThemeValues();
    return <Component {...props} theme={theme} />;
  };
};

// Theme validation function
const validateTheme = (theme: PageTheme): void => {
  if (!theme || typeof theme !== 'object') {
    throw new Error('Theme must be a valid object');
  }

  // Validate colors
  if (!theme.colors || typeof theme.colors !== 'object') {
    throw new Error('Theme must have a colors object');
  }

  const requiredColors = ['primary', 'background', 'text'];
  requiredColors.forEach(color => {
    if (!theme.colors[color as keyof typeof theme.colors]) {
      throw new Error(`Theme colors must include '${color}'`);
    }
    const colorValue = theme.colors[color as keyof typeof theme.colors];
    if (colorValue && !isValidHexColor(colorValue)) {
      throw new Error(`Theme color '${color}' must be a valid hex color`);
    }
  });

  // Validate spacing
  if (!theme.spacing || typeof theme.spacing !== 'object') {
    throw new Error('Theme must have a spacing object');
  }

  if (typeof theme.spacing.base !== 'number' || theme.spacing.base < 0) {
    throw new Error('Theme spacing.base must be a non-negative number');
  }

  // Validate optional spacing values
  if (theme.spacing.small !== undefined && (typeof theme.spacing.small !== 'number' || theme.spacing.small < 0)) {
    throw new Error('Theme spacing.small must be a non-negative number');
  }

  if (theme.spacing.large !== undefined && (typeof theme.spacing.large !== 'number' || theme.spacing.large < 0)) {
    throw new Error('Theme spacing.large must be a non-negative number');
  }

  // Validate typography if present
  if (theme.typography) {
    if (theme.typography.lineHeight !== undefined && 
        (typeof theme.typography.lineHeight !== 'number' || theme.typography.lineHeight <= 0)) {
      throw new Error('Theme typography.lineHeight must be a positive number');
    }
  }
};

// CSS custom property injection
const injectThemeStyles = (pageId: string, theme: PageTheme): void => {
  const styleId = `theme-${pageId}`;
  
  // Remove existing styles
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create CSS custom properties
  const cssVariables = generateCSSVariables(pageId, theme);
  
  // Create and inject style element
  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = cssVariables;
  
  document.head.appendChild(styleElement);
};

// Remove theme styles
const removeThemeStyles = (pageId: string): void => {
  const styleId = `theme-${pageId}`;
  const styleElement = document.getElementById(styleId);
  if (styleElement) {
    styleElement.remove();
  }
};

// Generate CSS custom properties
const generateCSSVariables = (pageId: string, theme: PageTheme): string => {
  const selector = `.page-${pageId}`;
  
  let css = `${selector} {\n`;
  
  // Color variables
  css += `  --${pageId}-color-primary: ${theme.colors.primary};\n`;
  css += `  --${pageId}-color-background: ${theme.colors.background};\n`;
  css += `  --${pageId}-color-text: ${theme.colors.text};\n`;
  
  if (theme.colors.secondary) {
    css += `  --${pageId}-color-secondary: ${theme.colors.secondary};\n`;
  }
  if (theme.colors.surface) {
    css += `  --${pageId}-color-surface: ${theme.colors.surface};\n`;
  }
  if (theme.colors.textSecondary) {
    css += `  --${pageId}-color-text-secondary: ${theme.colors.textSecondary};\n`;
  }
  
  // Spacing variables
  css += `  --${pageId}-spacing-base: ${theme.spacing.base}px;\n`;
  if (theme.spacing.small !== undefined) {
    css += `  --${pageId}-spacing-small: ${theme.spacing.small}px;\n`;
  } else {
    css += `  --${pageId}-spacing-small: ${theme.spacing.base / 2}px;\n`;
  }
  if (theme.spacing.large !== undefined) {
    css += `  --${pageId}-spacing-large: ${theme.spacing.large}px;\n`;
  } else {
    css += `  --${pageId}-spacing-large: ${theme.spacing.base * 2}px;\n`;
  }
  
  // Typography variables
  if (theme.typography) {
    if (theme.typography.fontFamily) {
      css += `  --${pageId}-font-family: ${theme.typography.fontFamily};\n`;
    }
    if (theme.typography.fontSize) {
      css += `  --${pageId}-font-size: ${theme.typography.fontSize};\n`;
    }
    if (theme.typography.lineHeight) {
      css += `  --${pageId}-line-height: ${theme.typography.lineHeight};\n`;
    }
  }
  
  css += '}\n';
  
  return css;
};

// Utility function to validate hex colors
const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

/**
 * Theme utility functions for components
 */
export const themeUtils = {
  /**
   * Get CSS variable name for a theme property
   */
  getCSSVar: (pageId: string, property: string): string => {
    return `var(--${pageId}-${property})`;
  },

  /**
   * Get inline styles for theme properties
   */
  getInlineStyles: (pageId: string, properties: Record<string, string>): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    Object.entries(properties).forEach(([key, value]) => {
      (styles as any)[key] = `var(--${pageId}-${value})`;
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
   * Convert theme spacing to CSS values
   */
  getSpacing: (theme: PageTheme, multiplier: number = 1): string => {
    return `${theme.spacing.base * multiplier}px`;
  },

  /**
   * Get contrasting text color based on background
   */
  getContrastColor: (backgroundColor: string): string => {
    // Simple contrast calculation (in a real app, you'd want a more sophisticated algorithm)
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
};

/**
 * Default theme for fallback
 */
export const defaultTheme: PageTheme = {
  colors: {
    primary: '#f97316',
    background: '#f3f4f6',
    text: '#111827',
    secondary: '#6b7280',
    surface: '#ffffff',
    textSecondary: '#6b7280'
  },
  spacing: {
    base: 4,
    small: 2,
    large: 8
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '16px',
    lineHeight: 1.5
  }
};