/**
 * Route Registry - System for managing page routes and metadata
 * Enables dynamic route resolution and validation for page-centric architecture
 */

import { PageConfig } from './types';

export interface RouteMetadata {
  id: string;
  path: string;
  title: string;
  description?: string;
  icon?: string;
  order?: number;
  visible?: boolean;
  requiresAuth?: boolean;
  roles?: string[];
  category?: string;
}

export interface RouteRegistryEntry {
  id: string;
  metadata: RouteMetadata;
  configPath: string;
  componentPath: string;
  isValid: boolean;
  lastValidated?: Date;
  validationErrors?: string[];
}

/**
 * Route Registry Class
 */
export class RouteRegistry {
  private routes = new Map<string, RouteRegistryEntry>();
  private pathIndex = new Map<string, string>(); // path -> routeId mapping
  private initialized = false;

  constructor() {
    this.initializeDefaultRoutes();
  }

  /**
   * Initialize with default page routes
   */
  private initializeDefaultRoutes(): void {
    const defaultRoutes: RouteMetadata[] = [
      {
        id: 'dashboard',
        path: '/',
        title: 'Dashboard',
        description: 'Admin dashboard overview with KPIs and navigation',
        icon: 'dashboard',
        order: 1,
        visible: true,
        category: 'main'
      },
      {
        id: 'databases',
        path: '/databases',
        title: 'Databases',
        description: 'Database management and schema editor',
        icon: 'database',
        order: 2,
        visible: true,
        category: 'main'
      },
      {
        id: 'tasks',
        path: '/tasks',
        title: 'Tasks',
        description: 'Task management with kanban board and project organization',
        icon: 'tasks',
        order: 3,
        visible: true,
        category: 'main'
      },
      {
        id: 'themes',
        path: '/themes',
        title: 'Theme Gallery',
        description: 'Browse and customize themes for your dashboard pages',
        icon: 'palette',
        order: 4,
        visible: true,
        category: 'customization'
      },
      {
        id: 'page-manager',
        path: '/page-manager',
        title: 'Page Manager',
        description: 'Create, edit, and manage dashboard pages',
        icon: 'settings',
        order: 5,
        visible: true,
        category: 'admin'
      },
      {
        id: 'playground',
        path: '/playground',
        title: 'Playground',
        description: 'Component testing and development playground',
        icon: 'play',
        order: 6,
        visible: true,
        category: 'development'
      }
    ];

    for (const route of defaultRoutes) {
      this.registerRoute(route);
    }

    this.initialized = true;
  }

  /**
   * Register a new route
   */
  registerRoute(metadata: RouteMetadata): void {
    const entry: RouteRegistryEntry = {
      id: metadata.id,
      metadata,
      configPath: `src/components/${metadata.id}/config.yaml`,
      componentPath: `src/components/${metadata.id}`,
      isValid: true, // Assume valid until validation fails
      lastValidated: new Date()
    };

    this.routes.set(metadata.id, entry);
    this.pathIndex.set(metadata.path, metadata.id);

    console.log(`Registered route: ${metadata.id} (${metadata.path})`);
  }

  /**
   * Unregister a route
   */
  unregisterRoute(routeId: string): boolean {
    const entry = this.routes.get(routeId);
    if (!entry) {
      return false;
    }

    this.routes.delete(routeId);
    this.pathIndex.delete(entry.metadata.path);

    console.log(`Unregistered route: ${routeId}`);
    return true;
  }

  /**
   * Get route by ID
   */
  getRoute(routeId: string): RouteRegistryEntry | null {
    return this.routes.get(routeId) || null;
  }

  /**
   * Get route by path
   */
  getRouteByPath(path: string): RouteRegistryEntry | null {
    const routeId = this.pathIndex.get(path);
    return routeId ? this.getRoute(routeId) : null;
  }

  /**
   * Get all registered routes
   */
  getAllRoutes(): RouteRegistryEntry[] {
    return Array.from(this.routes.values());
  }

  /**
   * Get visible routes for navigation
   */
  getVisibleRoutes(): RouteRegistryEntry[] {
    return this.getAllRoutes()
      .filter(route => route.metadata.visible !== false)
      .sort((a, b) => (a.metadata.order || 999) - (b.metadata.order || 999));
  }

  /**
   * Get routes by category
   */
  getRoutesByCategory(category: string): RouteRegistryEntry[] {
    return this.getAllRoutes()
      .filter(route => route.metadata.category === category)
      .sort((a, b) => (a.metadata.order || 999) - (b.metadata.order || 999));
  }

  /**
   * Validate a route exists and is accessible
   */
  async validateRoute(routeId: string): Promise<boolean> {
    const entry = this.routes.get(routeId);
    if (!entry) {
      return false;
    }

    try {
      // Check if config file exists (simplified validation)
      const configExists = await this.checkFileExists(entry.configPath);
      const componentExists = await this.checkDirectoryExists(entry.componentPath);

      const isValid = configExists && componentExists;
      
      // Update route entry
      entry.isValid = isValid;
      entry.lastValidated = new Date();
      
      if (!isValid) {
        entry.validationErrors = [
          !configExists ? `Config file not found: ${entry.configPath}` : '',
          !componentExists ? `Component directory not found: ${entry.componentPath}` : ''
        ].filter(Boolean);
      } else {
        entry.validationErrors = undefined;
      }

      return isValid;
    } catch (error) {
      console.error(`Route validation failed for ${routeId}:`, error);
      entry.isValid = false;
      entry.validationErrors = [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`];
      return false;
    }
  }

  /**
   * Validate all routes
   */
  async validateAllRoutes(): Promise<{ valid: number; invalid: number; errors: string[] }> {
    const results = await Promise.allSettled(
      Array.from(this.routes.keys()).map(routeId => this.validateRoute(routeId))
    );

    let valid = 0;
    let invalid = 0;
    const errors: string[] = [];

    results.forEach((result, index) => {
      const routeId = Array.from(this.routes.keys())[index];
      const entry = this.routes.get(routeId);

      if (result.status === 'fulfilled' && result.value) {
        valid++;
      } else {
        invalid++;
        if (entry?.validationErrors) {
          errors.push(...entry.validationErrors.map(err => `${routeId}: ${err}`));
        }
      }
    });

    return { valid, invalid, errors };
  }

  /**
   * Check if a route ID is valid
   */
  isValidRoute(routeId: string): boolean {
    const entry = this.routes.get(routeId);
    return entry?.isValid === true;
  }

  /**
   * Get route metadata for breadcrumbs or navigation
   */
  getRouteMetadata(routeId: string): RouteMetadata | null {
    const entry = this.routes.get(routeId);
    return entry?.metadata || null;
  }

  /**
   * Update route metadata
   */
  updateRouteMetadata(routeId: string, updates: Partial<RouteMetadata>): boolean {
    const entry = this.routes.get(routeId);
    if (!entry) {
      return false;
    }

    // Update path index if path changed
    if (updates.path && updates.path !== entry.metadata.path) {
      this.pathIndex.delete(entry.metadata.path);
      this.pathIndex.set(updates.path, routeId);
    }

    entry.metadata = { ...entry.metadata, ...updates };
    return true;
  }

  /**
   * Simple file existence check (placeholder - would need actual implementation)
   */
  private async checkFileExists(path: string): Promise<boolean> {
    // In a real implementation, this would check if the file exists
    // For now, assume files exist for registered routes
    return true;
  }

  /**
   * Simple directory existence check (placeholder - would need actual implementation)
   */
  private async checkDirectoryExists(path: string): Promise<boolean> {
    // In a real implementation, this would check if the directory exists
    // For now, assume directories exist for registered routes
    return true;
  }

  /**
   * Get navigation structure
   */
  getNavigationStructure(): { 
    main: RouteMetadata[];
    categories: Record<string, RouteMetadata[]>;
  } {
    const visibleRoutes = this.getVisibleRoutes();
    const main = visibleRoutes.filter(route => route.metadata.category === 'main');
    
    const categories: Record<string, RouteMetadata[]> = {};
    visibleRoutes.forEach(route => {
      const category = route.metadata.category || 'uncategorized';
      if (category !== 'main') {
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(route.metadata);
      }
    });

    return {
      main: main.map(route => route.metadata),
      categories
    };
  }

  /**
   * Reset registry to default state
   */
  reset(): void {
    this.routes.clear();
    this.pathIndex.clear();
    this.initialized = false;
    this.initializeDefaultRoutes();
  }
}

// Export singleton instance
export const routeRegistry = new RouteRegistry();