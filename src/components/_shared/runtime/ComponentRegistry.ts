/**
 * Component registry system for page-specific component management
 * Enables dynamic component loading and page isolation
 */

import { 
  ComponentRegistry as IComponentRegistry, 
  PageComponent, 
  ComponentError 
} from './types';

/**
 * Registry for managing page-specific components with complete isolation
 */
export class ComponentRegistry implements IComponentRegistry {
  private registry: Map<string, Map<string, PageComponent>>;
  private componentMetadata: Map<string, Map<string, ComponentMetadata>>;

  constructor() {
    this.registry = new Map();
    this.componentMetadata = new Map();
  }

  /**
   * Register a component for a specific page
   * @param pageId - Unique page identifier
   * @param componentType - Component type identifier
   * @param component - React component to register
   */
  register(pageId: string, componentType: string, component: PageComponent): void {
    try {
      this.validateInputs(pageId, componentType, component);

      // Initialize page registry if it doesn't exist
      if (!this.registry.has(pageId)) {
        this.registry.set(pageId, new Map());
        this.componentMetadata.set(pageId, new Map());
      }

      const pageRegistry = this.registry.get(pageId)!;
      const pageMetadata = this.componentMetadata.get(pageId)!;

      // Check for existing component
      if (pageRegistry.has(componentType)) {
        console.warn(`Component '${componentType}' already registered for page '${pageId}'. Overwriting.`);
      }

      // Register component and metadata
      pageRegistry.set(componentType, component);
      pageMetadata.set(componentType, {
        registeredAt: new Date(),
        pageId,
        componentType,
        version: '1.0.0'
      });

      console.log(`✅ Registered component '${componentType}' for page '${pageId}'`);
    } catch (error) {
      throw new ComponentError(
        `Failed to register component '${componentType}' for page '${pageId}': ${(error as Error).message}`,
        pageId,
        componentType
      );
    }
  }

  /**
   * Retrieve a component for a specific page
   * @param pageId - Unique page identifier
   * @param componentType - Component type identifier
   * @returns Component if found, null otherwise
   */
  get(pageId: string, componentType: string): PageComponent | null {
    try {
      this.validatePageAndComponentType(pageId, componentType);

      const pageRegistry = this.registry.get(pageId);
      if (!pageRegistry) {
        return null;
      }

      return pageRegistry.get(componentType) || null;
    } catch (error) {
      console.error(`Error retrieving component '${componentType}' for page '${pageId}':`, error);
      return null;
    }
  }

  /**
   * Get all components registered for a specific page
   * @param pageId - Unique page identifier
   * @returns Record of component types to components
   */
  getPageComponents(pageId: string): Record<string, PageComponent> {
    try {
      this.validatePageId(pageId);

      const pageRegistry = this.registry.get(pageId);
      if (!pageRegistry) {
        return {};
      }

      const components: Record<string, PageComponent> = {};
      pageRegistry.forEach((component, componentType) => {
        components[componentType] = component;
      });

      return components;
    } catch (error) {
      console.error(`Error retrieving components for page '${pageId}':`, error);
      return {};
    }
  }

  /**
   * Unregister a specific component from a page
   * @param pageId - Unique page identifier
   * @param componentType - Component type identifier
   */
  unregister(pageId: string, componentType: string): void {
    try {
      this.validatePageAndComponentType(pageId, componentType);

      const pageRegistry = this.registry.get(pageId);
      const pageMetadata = this.componentMetadata.get(pageId);

      if (!pageRegistry || !pageMetadata) {
        console.warn(`No components registered for page '${pageId}'`);
        return;
      }

      const removed = pageRegistry.delete(componentType);
      pageMetadata.delete(componentType);

      if (removed) {
        console.log(`✅ Unregistered component '${componentType}' from page '${pageId}'`);
      } else {
        console.warn(`Component '${componentType}' was not registered for page '${pageId}'`);
      }
    } catch (error) {
      throw new ComponentError(
        `Failed to unregister component '${componentType}' from page '${pageId}': ${(error as Error).message}`,
        pageId,
        componentType
      );
    }
  }

  /**
   * Clear all components for a specific page
   * @param pageId - Unique page identifier
   */
  clear(pageId: string): void {
    try {
      this.validatePageId(pageId);

      const pageRegistry = this.registry.get(pageId);
      const pageMetadata = this.componentMetadata.get(pageId);

      if (!pageRegistry || !pageMetadata) {
        console.warn(`No components registered for page '${pageId}'`);
        return;
      }

      const componentCount = pageRegistry.size;
      pageRegistry.clear();
      pageMetadata.clear();

      console.log(`✅ Cleared ${componentCount} components from page '${pageId}'`);
    } catch (error) {
      throw new ComponentError(
        `Failed to clear components for page '${pageId}': ${(error as Error).message}`,
        pageId
      );
    }
  }

  /**
   * Check if a component is registered for a page
   * @param pageId - Unique page identifier
   * @param componentType - Component type identifier
   * @returns True if component is registered
   */
  has(pageId: string, componentType: string): boolean {
    try {
      this.validatePageAndComponentType(pageId, componentType);

      const pageRegistry = this.registry.get(pageId);
      return pageRegistry ? pageRegistry.has(componentType) : false;
    } catch (error) {
      console.error(`Error checking component '${componentType}' for page '${pageId}':`, error);
      return false;
    }
  }

  /**
   * Get metadata for a specific component
   * @param pageId - Unique page identifier
   * @param componentType - Component type identifier
   * @returns Component metadata if found
   */
  getComponentMetadata(pageId: string, componentType: string): ComponentMetadata | null {
    try {
      this.validatePageAndComponentType(pageId, componentType);

      const pageMetadata = this.componentMetadata.get(pageId);
      if (!pageMetadata) {
        return null;
      }

      return pageMetadata.get(componentType) || null;
    } catch (error) {
      console.error(`Error retrieving metadata for component '${componentType}' on page '${pageId}':`, error);
      return null;
    }
  }

  /**
   * Get all registered pages
   * @returns Array of page IDs
   */
  getRegisteredPages(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Get component statistics for a page
   * @param pageId - Unique page identifier
   * @returns Component statistics
   */
  getPageStats(pageId: string): PageComponentStats {
    try {
      this.validatePageId(pageId);

      const pageRegistry = this.registry.get(pageId);
      const pageMetadata = this.componentMetadata.get(pageId);

      if (!pageRegistry || !pageMetadata) {
        return {
          pageId,
          componentCount: 0,
          componentTypes: [],
          lastRegistration: null
        };
      }

      const componentTypes = Array.from(pageRegistry.keys());
      const registrationDates = Array.from(pageMetadata.values())
        .map(meta => meta.registeredAt)
        .sort((a, b) => b.getTime() - a.getTime());

      return {
        pageId,
        componentCount: pageRegistry.size,
        componentTypes,
        lastRegistration: registrationDates[0] || null
      };
    } catch (error) {
      console.error(`Error retrieving stats for page '${pageId}':`, error);
      return {
        pageId,
        componentCount: 0,
        componentTypes: [],
        lastRegistration: null
      };
    }
  }

  /**
   * Bulk register components for a page
   * @param pageId - Unique page identifier
   * @param components - Record of component types to components
   */
  registerBulk(pageId: string, components: Record<string, PageComponent>): void {
    try {
      this.validatePageId(pageId);

      if (!components || typeof components !== 'object') {
        throw new Error('Components must be a valid object');
      }

      let successCount = 0;
      let errorCount = 0;

      Object.entries(components).forEach(([componentType, component]) => {
        try {
          this.register(pageId, componentType, component);
          successCount++;
        } catch (error) {
          console.error(`Failed to register component '${componentType}':`, error);
          errorCount++;
        }
      });

      console.log(`✅ Bulk registration completed for page '${pageId}': ${successCount} success, ${errorCount} errors`);
    } catch (error) {
      throw new ComponentError(
        `Failed to bulk register components for page '${pageId}': ${(error as Error).message}`,
        pageId
      );
    }
  }

  /**
   * Export page components for backup or transfer
   * @param pageId - Unique page identifier
   * @returns Serializable component data
   */
  exportPageComponents(pageId: string): PageComponentExport {
    try {
      this.validatePageId(pageId);

      const stats = this.getPageStats(pageId);
      const metadata = this.componentMetadata.get(pageId);

      return {
        pageId,
        exportedAt: new Date(),
        componentCount: stats.componentCount,
        componentTypes: stats.componentTypes,
        metadata: metadata ? Object.fromEntries(metadata) : {}
      };
    } catch (error) {
      throw new ComponentError(
        `Failed to export components for page '${pageId}': ${(error as Error).message}`,
        pageId
      );
    }
  }

  // Private validation methods
  private validateInputs(pageId: string, componentType: string, component: any): void {
    this.validatePageId(pageId);
    this.validateComponentType(componentType);
    this.validateComponent(component);
  }

  private validatePageId(pageId: string): void {
    if (!pageId || typeof pageId !== 'string' || pageId.trim().length === 0) {
      throw new Error('Page ID must be a non-empty string');
    }
  }

  private validateComponentType(componentType: string): void {
    if (!componentType || typeof componentType !== 'string' || componentType.trim().length === 0) {
      throw new Error('Component type must be a non-empty string');
    }
  }

  private validateComponent(component: any): void {
    if (!component || typeof component !== 'function') {
      throw new Error('Component must be a valid React component function');
    }
  }

  private validatePageAndComponentType(pageId: string, componentType: string): void {
    this.validatePageId(pageId);
    this.validateComponentType(componentType);
  }
}

// Supporting interfaces
interface ComponentMetadata {
  registeredAt: Date;
  pageId: string;
  componentType: string;
  version: string;
}

interface PageComponentStats {
  pageId: string;
  componentCount: number;
  componentTypes: string[];
  lastRegistration: Date | null;
}

interface PageComponentExport {
  pageId: string;
  exportedAt: Date;
  componentCount: number;
  componentTypes: string[];
  metadata: Record<string, ComponentMetadata>;
}

// Export singleton instance for convenience
export const componentRegistry = new ComponentRegistry();

// Make registry available globally for component registration
if (typeof window !== 'undefined') {
  (window as any).__componentRegistry = componentRegistry;
}