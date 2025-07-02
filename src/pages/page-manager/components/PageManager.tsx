/**
 * Main Page Manager Component
 * Coordinates all page management functionality
 */

import React, { useState, useCallback } from 'react';
import { PageHeader } from './PageHeader';
import { PageList } from './PageList';
import { PageActions } from './PageActions';
import { PageEditor } from './PageEditor';
import { PageFeatures } from './PageFeatures';
import { usePageManager } from '../hooks/usePageManager';
import { PageInfo, PageCreateRequest } from '../types';
import { PageOperations } from '../api/page-operations';

interface PageManagerProps {
  componentId?: string;
  pageId?: string;
}

export const PageManager: React.FC<PageManagerProps> = () => {
  const {
    pages,
    selectedPage,
    editingPage,
    loading,
    error,
    actions
  } = usePageManager();

  const [editorMode, setEditorMode] = useState<'create' | 'edit' | 'clone' | 'hidden'>('hidden');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Handle creating a new page
  const handleCreatePage = useCallback(() => {
    actions.selectPage(null);
    setEditorMode('create');
    setActionError(null);
  }, [actions]);

  // Handle editing an existing page
  const handleEditPage = useCallback((page: PageInfo) => {
    actions.selectPage(page);
    actions.startEditing(page);
    setEditorMode('edit');
    setActionError(null);
  }, [actions]);

  // Handle duplicating a page
  const handleDuplicatePage = useCallback(async (page: PageInfo) => {
    const newId = prompt('Enter ID for the duplicated page:', `${page.id}-copy`);
    const newTitle = prompt('Enter title for the duplicated page:', `Copy of ${page.title}`);
    
    if (!newId || !newTitle) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await actions.duplicatePage(page.id, newId, newTitle);
      // Success handled by usePageManager reload
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to duplicate page');
    } finally {
      setActionLoading(false);
    }
  }, [actions]);

  // Handle deleting a page
  const handleDeletePage = useCallback(async (page: PageInfo) => {
    if (!confirm(`Are you sure you want to delete "${page.title}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await actions.deletePage(page.id);
      // Clear selection if deleted page was selected
      if (selectedPage?.id === page.id) {
        actions.selectPage(null);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to delete page');
    } finally {
      setActionLoading(false);
    }
  }, [actions, selectedPage]);

  // Handle saving a page (create or update)
  const handleSavePage = useCallback(async (pageData: PageInfo | null, config: any) => {
    setActionLoading(true);
    setActionError(null);

    try {
      if (editorMode === 'create' && pageData) {
        // Create new page
        const createRequest: PageCreateRequest = {
          id: pageData.id,
          title: pageData.title,
          route: pageData.route,
          description: pageData.description,
          category: pageData.category,
          visible: pageData.visible,
          order: pageData.order
        };

        await actions.createPage(createRequest);
        
        // Also update the configuration if provided
        if (config) {
          await PageOperations.updatePageConfig(pageData.id, config);
        }
      } else if ((editorMode === 'edit' || editorMode === 'clone') && pageData) {
        // Update existing page
        await actions.updatePage({
          id: pageData.id,
          title: pageData.title,
          route: pageData.route,
          description: pageData.description,
          category: pageData.category,
          visible: pageData.visible,
          order: pageData.order,
          config
        });
      }

      // Close editor and clear editing state
      setEditorMode('hidden');
      actions.cancelEditing();
      actions.selectPage(pageData);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to save page');
    } finally {
      setActionLoading(false);
    }
  }, [editorMode, actions]);

  // Handle canceling editor
  const handleCancelEdit = useCallback(() => {
    setEditorMode('hidden');
    actions.cancelEditing();
    setActionError(null);
  }, [actions]);

  // Handle importing a page
  const handleImportPage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.yaml,.yml';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setActionLoading(true);
      setActionError(null);

      try {
        await PageOperations.importPage(file);
        await actions.loadPages(); // Refresh the page list
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'Failed to import page');
      } finally {
        setActionLoading(false);
      }
    };

    input.click();
  }, [actions]);

  // Handle exporting all pages
  const handleExportPages = useCallback(async () => {
    try {
      const blob = await PageOperations.exportAllPages();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-pages-${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to export pages');
    }
  }, []);

  if (loading) {
    return (
      <div className="page-manager-loading">
        <div className="loading-spinner" />
        <p>Loading page manager...</p>
      </div>
    );
  }

  return (
    <div className="page-manager">
      <PageHeader
        title="Page Manager"
        subtitle="Create, edit, and manage dashboard pages"
        showActions={true}
        onCreatePage={handleCreatePage}
        onImportPage={handleImportPage}
      />

      {(error || actionError) && (
        <div className="error-banner">
          {error || actionError}
        </div>
      )}

      <div className="page-manager-content">
        <div className="main-content">
          <PageList
            pages={pages}
            selectedPage={selectedPage}
            onSelect={actions.selectPage}
            onEdit={handleEditPage}
            onDelete={handleDeletePage}
            onDuplicate={handleDuplicatePage}
            showFilters={true}
            showDetails={true}
          />

          <PageEditor
            page={editingPage}
            mode={editorMode}
            onSave={handleSavePage}
            onCancel={handleCancelEdit}
            showPreview={true}
            autoSave={false}
          />

          {selectedPage && (
            <PageFeatures
              pageId={selectedPage.id}
              pageName={selectedPage.title}
              showCreateForm={true}
            />
          )}
        </div>

        <div className="sidebar-content">
          <PageActions
            selectedPage={selectedPage}
            onCreatePage={handleCreatePage}
            onImportPage={handleImportPage}
            onExportPages={handleExportPages}
          />
        </div>
      </div>

      {actionLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Processing...</p>
        </div>
      )}

      <style jsx>{`
        .page-manager {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          position: relative;
        }

        .page-manager::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.02) 0%, transparent 50%);
          pointer-events: none;
          z-index: -1;
        }

        .page-manager-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: 1rem;
          color: #6b7280;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f4f6;
          border-top: 3px solid #f97316;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-banner {
          background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          border-left: 4px solid #ef4444;
          box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.1);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .error-banner::before {
          content: '⚠️';
          font-size: 1.25rem;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .page-manager-content {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 2.5rem;
          align-items: start;
          position: relative;
        }

        .main-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .sidebar-content {
          position: sticky;
          top: 1rem;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          color: white;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .loading-overlay .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(255, 255, 255, 0.2);
          border-top: 4px solid white;
          animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .loading-overlay p {
          font-size: 1.125rem;
          font-weight: 500;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .page-manager-content {
            grid-template-columns: 1fr;
          }

          .sidebar-content {
            position: static;
            order: -1;
          }
        }
      `}</style>
    </div>
  );
};