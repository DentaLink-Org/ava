/**
 * Page Operations API - Backend operations for managing pages
 */

import { PageInfo, PageCreateRequest, PageUpdateRequest } from '../types';

export class PageOperations {
  
  /**
   * Create a new page with directory structure and configuration
   */
  static async createPage(request: PageCreateRequest): Promise<{ success: boolean; pageId: string; message: string }> {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...request,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create page');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create page');
    }
  }

  /**
   * Update an existing page configuration
   */
  static async updatePage(request: PageUpdateRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/pages/${request.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...request,
          lastModified: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update page');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update page');
    }
  }

  /**
   * Delete a page and its directory structure
   */
  static async deletePage(pageId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete page');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete page');
    }
  }

  /**
   * Duplicate an existing page
   */
  static async duplicatePage(
    sourcePageId: string, 
    newPageId: string, 
    newTitle: string
  ): Promise<{ success: boolean; pageId: string; message: string }> {
    try {
      const response = await fetch(`/api/pages/${sourcePageId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPageId,
          newTitle,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to duplicate page');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to duplicate page');
    }
  }

  /**
   * Get page configuration
   */
  static async getPageConfig(pageId: string): Promise<any> {
    try {
      const response = await fetch(`/api/pages/${pageId}/config`);
      
      if (!response.ok) {
        throw new Error(`Failed to load page config: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load page config');
    }
  }

  /**
   * Update page configuration
   */
  static async updatePageConfig(pageId: string, config: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/pages/${pageId}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config,
          lastModified: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update page config');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update page config');
    }
  }

  /**
   * Validate page configuration
   */
  static async validatePageConfig(config: any): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const response = await fetch('/api/pages/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config })
      });

      if (!response.ok) {
        throw new Error('Failed to validate config');
      }

      return await response.json();
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed']
      };
    }
  }

  /**
   * Import page from file/URL
   */
  static async importPage(source: File | string, pageId?: string): Promise<{ success: boolean; pageId: string; message: string }> {
    try {
      const formData = new FormData();
      
      if (typeof source === 'string') {
        // Import from URL
        formData.append('url', source);
      } else {
        // Import from file
        formData.append('file', source);
      }
      
      if (pageId) {
        formData.append('pageId', pageId);
      }

      const response = await fetch('/api/pages/import', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import page');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to import page');
    }
  }

  /**
   * Export page configuration
   */
  static async exportPage(pageId: string): Promise<Blob> {
    try {
      const response = await fetch(`/api/pages/${pageId}/export`);
      
      if (!response.ok) {
        throw new Error('Failed to export page');
      }

      return await response.blob();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to export page');
    }
  }

  /**
   * Export all pages
   */
  static async exportAllPages(): Promise<Blob> {
    try {
      const response = await fetch('/api/pages/export');
      
      if (!response.ok) {
        throw new Error('Failed to export pages');
      }

      return await response.blob();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to export pages');
    }
  }

  /**
   * Get page templates
   */
  static async getTemplates(): Promise<any[]> {
    try {
      const response = await fetch('/api/pages/templates');
      
      if (!response.ok) {
        throw new Error('Failed to load templates');
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to load templates:', error);
      return [];
    }
  }

  /**
   * Create page from template
   */
  static async createFromTemplate(
    templateId: string, 
    pageId: string, 
    title: string
  ): Promise<{ success: boolean; pageId: string; message: string }> {
    try {
      const response = await fetch('/api/pages/from-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId,
          pageId,
          title,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create page from template');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create page from template');
    }
  }
}