/**
 * Hook for managing pages - provides CRUD operations for dashboard pages
 */

import { useState, useEffect, useCallback } from 'react';
import { PageInfo, PageCreateRequest, PageUpdateRequest, PageManagerState } from '../types';
import { routeRegistry } from '../../_shared/runtime/RouteRegistry';

export const usePageManager = () => {
  const [state, setState] = useState<PageManagerState>({
    pages: [],
    selectedPage: null,
    editingPage: null,
    loading: true,
    error: null,
    templates: []
  });

  // Load all pages from route registry
  const loadPages = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const routes = routeRegistry.getAllRoutes();
      const pages: PageInfo[] = routes.map(route => ({
        id: route.id,
        title: route.metadata.title,
        route: route.metadata.path,
        description: route.metadata.description,
        icon: route.metadata.icon,
        order: route.metadata.order,
        visible: route.metadata.visible,
        category: route.metadata.category,
        status: route.isValid ? 'active' : 'disabled',
        lastModified: route.lastValidated?.toISOString() || new Date().toISOString(),
        componentCount: 0, // Will be loaded from config
        configPath: route.configPath,
        componentPath: route.componentPath
      }));

      // Load component counts for each page
      for (const page of pages) {
        try {
          const response = await fetch(`/api/pages/${page.id}/config`);
          if (response.ok) {
            const config = await response.json();
            page.componentCount = config.components?.length || 0;
            page.author = config.meta?.author;
            page.version = config.meta?.version;
          }
        } catch (error) {
          console.warn(`Failed to load config for page ${page.id}:`, error);
        }
      }

      setState(prev => ({
        ...prev,
        pages: pages.sort((a, b) => (a.order || 999) - (b.order || 999)),
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load pages'
      }));
    }
  }, []);

  // Create a new page
  const createPage = useCallback(async (request: PageCreateRequest) => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to create page: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Register the new route
      routeRegistry.registerRoute({
        id: request.id,
        path: request.route,
        title: request.title,
        description: request.description,
        category: request.category,
        visible: request.visible,
        order: request.order
      });

      // Reload pages to reflect changes
      await loadPages();
      
      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create page');
    }
  }, [loadPages]);

  // Update an existing page
  const updatePage = useCallback(async (request: PageUpdateRequest) => {
    try {
      const response = await fetch(`/api/pages/${request.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to update page: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update route registry if metadata changed
      if (request.title || request.route || request.description) {
        routeRegistry.updateRouteMetadata(request.id, {
          title: request.title,
          path: request.route,
          description: request.description,
          visible: request.visible,
          order: request.order,
          category: request.category
        });
      }

      // Reload pages to reflect changes
      await loadPages();
      
      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update page');
    }
  }, [loadPages]);

  // Delete a page
  const deletePage = useCallback(async (pageId: string) => {
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete page: ${response.statusText}`);
      }

      // Unregister from route registry
      routeRegistry.unregisterRoute(pageId);

      // Reload pages to reflect changes
      await loadPages();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete page');
    }
  }, [loadPages]);

  // Duplicate a page
  const duplicatePage = useCallback(async (pageId: string, newId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newId, newTitle })
      });

      if (!response.ok) {
        throw new Error(`Failed to duplicate page: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Register the new route
      const originalPage = state.pages.find(p => p.id === pageId);
      if (originalPage) {
        routeRegistry.registerRoute({
          id: newId,
          path: `/${newId}`,
          title: newTitle,
          description: `Copy of ${originalPage.title}`,
          category: originalPage.category,
          visible: false, // Start as hidden
          order: (originalPage.order || 0) + 1
        });
      }

      // Reload pages to reflect changes
      await loadPages();
      
      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to duplicate page');
    }
  }, [state.pages, loadPages]);

  // Select a page
  const selectPage = useCallback((page: PageInfo | null) => {
    setState(prev => ({ ...prev, selectedPage: page }));
  }, []);

  // Start editing a page
  const startEditing = useCallback((page: PageInfo | null) => {
    setState(prev => ({ ...prev, editingPage: page }));
  }, []);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setState(prev => ({ ...prev, editingPage: null }));
  }, []);

  // Load pages on mount
  useEffect(() => {
    loadPages();
  }, [loadPages]);

  return {
    ...state,
    actions: {
      loadPages,
      createPage,
      updatePage,
      deletePage,
      duplicatePage,
      selectPage,
      startEditing,
      cancelEditing
    }
  };
};