/**
 * Route Utilities - Helper functions for route management and navigation
 */

import { routeRegistry } from '../runtime/RouteRegistry';
import { RouteMetadata, RouteRegistryEntry } from '../runtime/types';

/**
 * Route validation utilities
 */
export const routeUtils = {
  /**
   * Check if a route ID is valid and accessible
   */
  isValidRoute(routeId: string): boolean {
    return routeRegistry.isValidRoute(routeId);
  },

  /**
   * Resolve route ID from URL path
   */
  resolveRouteFromPath(path: string): string | null {
    // Normalize path
    const normalizedPath = path === '' || path === '/' ? '/' : path;
    
    const route = routeRegistry.getRouteByPath(normalizedPath);
    return route?.id || null;
  },

  /**
   * Get route metadata for navigation
   */
  getRouteMetadata(routeId: string): RouteMetadata | null {
    return routeRegistry.getRouteMetadata(routeId);
  },

  /**
   * Get all visible routes for navigation
   */
  getNavigationRoutes(): RouteMetadata[] {
    return routeRegistry.getVisibleRoutes().map(entry => entry.metadata);
  },

  /**
   * Build navigation structure for sidebar/menu
   */
  getNavigationStructure(): {
    main: RouteMetadata[];
    categories: Record<string, RouteMetadata[]>;
  } {
    return routeRegistry.getNavigationStructure();
  },

  /**
   * Generate breadcrumb trail for a route
   */
  getBreadcrumbs(routeId: string): RouteMetadata[] {
    const route = routeRegistry.getRouteMetadata(routeId);
    if (!route) return [];
    
    // For now, return just the current route
    // This could be enhanced to support nested routes
    return [route];
  },

  /**
   * Validate all routes and return summary
   */
  async validateAllRoutes(): Promise<{
    valid: number;
    invalid: number;
    errors: string[];
  }> {
    return await routeRegistry.validateAllRoutes();
  },

  /**
   * Check if user has access to route (placeholder for auth integration)
   */
  hasRouteAccess(routeId: string, userRoles?: string[]): boolean {
    const metadata = routeRegistry.getRouteMetadata(routeId);
    if (!metadata) return false;
    
    // If no roles required, allow access
    if (!metadata.roles || metadata.roles.length === 0) {
      return true;
    }
    
    // If no user roles provided, deny access to protected routes
    if (!userRoles || userRoles.length === 0) {
      return false;
    }
    
    // Check if user has any of the required roles
    return metadata.roles.some(role => userRoles.includes(role));
  },

  /**
   * Get route path from route ID
   */
  getRoutePath(routeId: string): string | null {
    const metadata = routeRegistry.getRouteMetadata(routeId);
    return metadata?.path || null;
  },

  /**
   * Register a new route dynamically
   */
  registerRoute(metadata: RouteMetadata): void {
    routeRegistry.registerRoute(metadata);
  },

  /**
   * Update route metadata
   */
  updateRoute(routeId: string, updates: Partial<RouteMetadata>): boolean {
    return routeRegistry.updateRouteMetadata(routeId, updates);
  },

  /**
   * Generate route URL with query parameters
   */
  buildRouteUrl(routeId: string, params?: Record<string, string>): string {
    const path = this.getRoutePath(routeId);
    if (!path) return '/';
    
    if (!params || Object.keys(params).length === 0) {
      return path;
    }
    
    const searchParams = new URLSearchParams(params);
    return `${path}?${searchParams.toString()}`;
  },

  /**
   * Check if route requires authentication
   */
  requiresAuth(routeId: string): boolean {
    const metadata = routeRegistry.getRouteMetadata(routeId);
    return metadata?.requiresAuth === true;
  },

  /**
   * Get routes by category
   */
  getRoutesByCategory(category: string): RouteMetadata[] {
    return routeRegistry.getRoutesByCategory(category).map(entry => entry.metadata);
  },

  /**
   * Search routes by title or description
   */
  searchRoutes(query: string): RouteMetadata[] {
    const allRoutes = routeRegistry.getVisibleRoutes();
    const searchTerm = query.toLowerCase();
    
    return allRoutes
      .filter(entry => {
        const metadata = entry.metadata;
        return (
          metadata.title.toLowerCase().includes(searchTerm) ||
          (metadata.description && metadata.description.toLowerCase().includes(searchTerm))
        );
      })
      .map(entry => entry.metadata);
  }
};

/**
 * Navigation helpers for React components
 */
export const navigationHelpers = {
  /**
   * Get navigation items for sidebar
   */
  getSidebarItems(): RouteMetadata[] {
    return routeUtils.getNavigationRoutes()
      .filter(route => route.visible !== false)
      .sort((a, b) => (a.order || 999) - (b.order || 999));
  },

  /**
   * Get breadcrumb items for current route
   */
  getBreadcrumbItems(routeId: string): RouteMetadata[] {
    return routeUtils.getBreadcrumbs(routeId);
  },

  /**
   * Check if route is currently active
   */
  isActiveRoute(routeId: string, currentRouteId: string): boolean {
    return routeId === currentRouteId;
  },

  /**
   * Get route icon (placeholder for icon system)
   */
  getRouteIcon(routeId: string): string | null {
    const metadata = routeUtils.getRouteMetadata(routeId);
    return metadata?.icon || null;
  }
};