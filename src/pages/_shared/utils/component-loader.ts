/**
 * Dynamic component loading system for page-specific components
 * Enables lazy loading and component caching for performance
 */

import React from 'react';
import { PageComponent, ComponentLoader, ComponentError } from '../runtime/types';
import { componentRegistry } from '../runtime/ComponentRegistry';

/**
 * Dynamic component loader with caching and lazy loading
 */
export class DynamicComponentLoader implements ComponentLoader {
  private loadingPromises: Map<string, Promise<PageComponent>>;
  private componentCache: Map<string, PageComponent>;

  constructor() {
    this.loadingPromises = new Map();
    this.componentCache = new Map();
  }

  /**
   * Load a single component dynamically
   * @param pageId - Unique page identifier
   * @param componentType - Component type to load
   * @returns Promise resolving to loaded component
   */
  async load(pageId: string, componentType: string): Promise<PageComponent> {
    const cacheKey = `${pageId}:${componentType}`;
    
    // Return cached component if available
    if (this.componentCache.has(cacheKey)) {
      return this.componentCache.get(cacheKey)!;
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Start loading component
    const loadingPromise = this.loadComponent(pageId, componentType);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const component = await loadingPromise;
      
      // Cache the loaded component
      this.componentCache.set(cacheKey, component);
      
      // Register with component registry
      componentRegistry.register(pageId, componentType, component);
      
      return component;
    } catch (error) {
      throw new ComponentError(
        `Failed to load component '${componentType}' for page '${pageId}': ${(error as Error).message}`,
        componentType,
        pageId
      );
    } finally {
      // Clean up loading promise
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Load multiple components for a page
   * @param pageId - Unique page identifier
   * @param componentTypes - Array of component types to load
   * @returns Promise resolving to record of loaded components
   */
  async loadBulk(pageId: string, componentTypes: string[]): Promise<Record<string, PageComponent>> {
    const loadPromises = componentTypes.map(async (componentType) => {
      try {
        const component = await this.load(pageId, componentType);
        return { componentType, component, error: null };
      } catch (error) {
        console.error(`Failed to load component '${componentType}':`, error);
        return { componentType, component: null, error: error as Error };
      }
    });

    const results = await Promise.all(loadPromises);
    const loadedComponents: Record<string, PageComponent> = {};
    const errors: string[] = [];

    results.forEach(({ componentType, component, error }) => {
      if (component) {
        loadedComponents[componentType] = component;
      } else if (error) {
        errors.push(`${componentType}: ${error.message}`);
      }
    });

    if (errors.length > 0) {
      console.warn(`Some components failed to load for page '${pageId}':`, errors);
    }

    return loadedComponents;
  }

  /**
   * Preload components without registering them
   * @param pageId - Unique page identifier
   * @param componentTypes - Array of component types to preload
   */
  async preload(pageId: string, componentTypes: string[]): Promise<void> {
    const preloadPromises = componentTypes.map(async (componentType) => {
      const cacheKey = `${pageId}:${componentType}`;
      
      // Skip if already cached or loading
      if (this.componentCache.has(cacheKey) || this.loadingPromises.has(cacheKey)) {
        return;
      }

      try {
        await this.load(pageId, componentType);
        console.log(`✅ Preloaded component '${componentType}' for page '${pageId}'`);
      } catch (error) {
        console.warn(`Failed to preload component '${componentType}' for page '${pageId}':`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Clear component cache for a page
   * @param pageId - Unique page identifier
   */
  clearCache(pageId: string): void {
    const keysToDelete: string[] = [];
    
    this.componentCache.forEach((_, key) => {
      if (key.startsWith(`${pageId}:`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.componentCache.delete(key);
    });

    console.log(`✅ Cleared component cache for page '${pageId}'`);
  }

  /**
   * Clear all component caches
   */
  clearAllCache(): void {
    this.componentCache.clear();
    console.log(`✅ Cleared all component caches`);
  }

  /**
   * Get cache statistics
   * @returns Cache statistics object
   */
  getCacheStats(): ComponentCacheStats {
    const cacheEntries = Array.from(this.componentCache.keys());
    const pageStats: Record<string, number> = {};

    cacheEntries.forEach(key => {
      const pageId = key.split(':')[0];
      pageStats[pageId] = (pageStats[pageId] || 0) + 1;
    });

    return {
      totalCachedComponents: this.componentCache.size,
      activeLoadingPromises: this.loadingPromises.size,
      pageStats,
      cacheKeys: cacheEntries
    };
  }

  // Protected method to allow extension
  protected async loadComponent(pageId: string, componentType: string): Promise<PageComponent> {
    try {
      // Try multiple loading strategies
      
      // Strategy 1: Dynamic import from page components
      try {
        const module = await import(`../../${pageId}/components/${componentType}.tsx`);
        if (module.default) {
          return module.default;
        }
        if (module[componentType]) {
          return module[componentType];
        }
      } catch (error) {
        console.debug(`Dynamic import failed for ${pageId}/${componentType}:`, error);
      }

      // Strategy 2: Try component index file
      try {
        const module = await import(`../../${pageId}/components/index.ts`);
        if (module[componentType]) {
          return module[componentType];
        }
      } catch (error) {
        console.debug(`Index import failed for ${pageId}/${componentType}:`, error);
      }

      // Strategy 3: Try shared components
      try {
        const module = await import(`../components/${componentType}.tsx`);
        if (module.default) {
          return module.default;
        }
        if (module[componentType]) {
          return module[componentType];
        }
      } catch (error) {
        console.debug(`Shared component import failed for ${componentType}:`, error);
      }

      // Strategy 4: Check if already registered
      const existingComponent = componentRegistry.get(pageId, componentType);
      if (existingComponent) {
        return existingComponent;
      }

      // If all strategies fail, throw error
      throw new Error(`Component '${componentType}' not found for page '${pageId}'`);
      
    } catch (error) {
      throw new ComponentError(
        `Failed to load component '${componentType}' for page '${pageId}': ${(error as Error).message}`,
        componentType,
        pageId
      );
    }
  }
}

/**
 * Webpack-specific component loader for development
 */
export class WebpackComponentLoader extends DynamicComponentLoader {
  protected async loadComponent(pageId: string, componentType: string): Promise<PageComponent> {
    // In development with webpack, use require.context for better HMR support
    if (process.env.NODE_ENV === 'development' && typeof (globalThis as any).__webpack_require__ !== 'undefined') {
      try {
        // This would be configured based on your webpack setup
        const componentContext = (require as any).context(
          `../../${pageId}/components`, 
          false, 
          /\.tsx?$/
        );
        
        const componentPath = `./${componentType}.tsx`;
        if (componentContext.keys().includes(componentPath)) {
          const module = componentContext(componentPath);
          return module.default || module[componentType];
        }
      } catch (error) {
        console.debug(`Webpack context loading failed for ${pageId}/${componentType}:`, error);
      }
    }

    // Fall back to parent implementation
    return super.loadComponent(pageId, componentType);
  }
}

// Component factory for creating components with default props
export class ComponentFactory {
  private loader: ComponentLoader;
  private defaultProps: Map<string, Record<string, any>>;

  constructor(loader: ComponentLoader) {
    this.loader = loader;
    this.defaultProps = new Map();
  }

  /**
   * Set default props for a component type
   * @param componentType - Component type
   * @param props - Default props
   */
  setDefaultProps(componentType: string, props: Record<string, any>): void {
    this.defaultProps.set(componentType, props);
  }

  /**
   * Create component with default props applied
   * @param pageId - Page identifier
   * @param componentType - Component type
   * @param overrideProps - Props to override defaults
   * @returns Component with props applied
   */
  async createComponent(
    pageId: string, 
    componentType: string, 
    overrideProps: Record<string, any> = {}
  ): Promise<PageComponent> {
    const BaseComponent = await this.loader.load(pageId, componentType);
    const defaultProps = this.defaultProps.get(componentType) || {};
    
    // Create wrapper component with merged props
    const WrappedComponent: PageComponent = (props) => {
      const mergedProps = { ...defaultProps, ...props, ...overrideProps };
      return BaseComponent(mergedProps);
    };

    // Preserve component name for debugging
    Object.defineProperty(WrappedComponent, 'name', {
      value: `${componentType}WithDefaults`
    });

    return WrappedComponent;
  }
}

// Utility functions for component management
export const componentUtils = {
  /**
   * Generate component fallback
   * @param componentType - Component type that failed to load
   * @param error - Error that occurred
   * @returns Fallback component
   */
  createFallbackComponent: (componentType: string, error?: Error): PageComponent => {
    return (props) => {
      return React.createElement('div', {
        className: 'component-fallback',
        style: {
          padding: '16px',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
          textAlign: 'center',
          color: '#6b7280'
        }
      }, [
        React.createElement('div', { key: 'title' }, `Component "${componentType}" not found`),
        error && React.createElement('div', { 
          key: 'error', 
          style: { fontSize: '12px', marginTop: '8px' } 
        }, error.message)
      ]);
    };
  },

  /**
   * Validate component interface
   * @param component - Component to validate
   * @returns Validation result
   */
  validateComponent: (component: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (typeof component !== 'function') {
      errors.push('Component must be a function');
    }

    // Basic React component validation
    try {
      if (component.length > 1) {
        errors.push('Component should accept at most one props argument');
      }
    } catch (error) {
      errors.push('Failed to analyze component signature');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// Cache statistics interface
interface ComponentCacheStats {
  totalCachedComponents: number;
  activeLoadingPromises: number;
  pageStats: Record<string, number>;
  cacheKeys: string[];
}

// Export singleton instances
export const componentLoader = new DynamicComponentLoader();
export const webpackComponentLoader = new WebpackComponentLoader();
export const componentFactory = new ComponentFactory(componentLoader);