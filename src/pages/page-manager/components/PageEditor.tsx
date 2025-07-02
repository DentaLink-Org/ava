/**
 * Page Editor Component - Full-featured editor for creating and modifying pages
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../../_shared/components/Button';
import { Card } from '../../_shared/components/Card';
import { PageInfo, PageCreateRequest, PageUpdateRequest } from '../types';

interface PageEditorProps {
  page?: PageInfo | null;
  onSave: (page: PageInfo | null, config: any) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'clone' | 'hidden';
  showPreview?: boolean;
  autoSave?: boolean;
  componentId?: string;
  pageId?: string;
}

interface PageFormData {
  id: string;
  title: string;
  route: string;
  description: string;
  category: string;
  visible: boolean;
  order: number;
  configYaml: string;
}

export const PageEditor: React.FC<PageEditorProps> = ({
  page,
  onSave,
  onCancel,
  mode,
  showPreview = true,
  autoSave = false
}) => {
  const [formData, setFormData] = useState<PageFormData>({
    id: '',
    title: '',
    route: '',
    description: '',
    category: 'main',
    visible: true,
    order: 999,
    configYaml: ''
  });

  const [loading, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Load page data when page changes
  useEffect(() => {
    if (page && (mode === 'edit' || mode === 'clone')) {
      setFormData({
        id: mode === 'clone' ? '' : page.id,
        title: mode === 'clone' ? `Copy of ${page.title}` : page.title,
        route: mode === 'clone' ? '' : page.route,
        description: page.description || '',
        category: page.category || 'main',
        visible: page.visible ?? true,
        order: page.order || 999,
        configYaml: '' // Will be loaded separately
      });

      // Load the full page configuration
      if (page.id) {
        loadPageConfig(page.id);
      }
    } else if (mode === 'create') {
      // Reset form for new page
      setFormData({
        id: '',
        title: '',
        route: '',
        description: '',
        category: 'main',
        visible: true,
        order: 999,
        configYaml: getDefaultConfig()
      });
    }
  }, [page, mode]);

  const loadPageConfig = async (pageId: string) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/config`);
      if (response.ok) {
        const config = await response.json();
        // Convert to YAML string for editing
        const yamlString = JSON.stringify(config, null, 2); // Simplified - would use yaml library
        setFormData(prev => ({ ...prev, configYaml: yamlString }));
      }
    } catch (error) {
      console.warn('Failed to load page config:', error);
      setFormData(prev => ({ ...prev, configYaml: getDefaultConfig() }));
    }
  };

  const getDefaultConfig = () => {
    return `# Page Configuration
page:
  title: "New Page"
  route: "/new-page"
  description: "A new dashboard page"

layout:
  type: "grid"
  columns: 12
  gap: 4
  padding: 6

components:
  - id: "welcome-header"
    type: "WelcomeHeader"
    position:
      col: 1
      row: 1
      span: 12
    props:
      title: "New Page"
      subtitle: "Welcome to your new page"

navigation:
  showSidebar: true
  customHeader: false
  breadcrumbs: true

meta:
  version: "1.0.0"
  author: "Dashboard User"
  lastModified: "${new Date().toISOString()}"`;
  };

  const handleInputChange = (field: keyof PageFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);

    // Auto-generate route from title
    if (field === 'title' && mode === 'create') {
      const route = '/' + value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, route }));
    }

    // Auto-generate ID from title  
    if (field === 'title' && (mode === 'create' || mode === 'clone')) {
      const id = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, id }));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.id.trim()) return 'Page ID is required';
    if (!formData.title.trim()) return 'Page title is required';
    if (!formData.route.trim()) return 'Page route is required';
    if (!formData.route.startsWith('/')) return 'Route must start with /';
    if (!formData.configYaml.trim()) return 'Page configuration is required';

    // Validate ID format
    if (!/^[a-z0-9-]+$/.test(formData.id)) {
      return 'Page ID can only contain lowercase letters, numbers, and hyphens';
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let config;
      try {
        config = JSON.parse(formData.configYaml); // Simplified - would parse YAML
      } catch (parseError) {
        throw new Error('Invalid configuration format');
      }

      const pageData: PageInfo = {
        id: formData.id,
        title: formData.title,
        route: formData.route,
        description: formData.description,
        category: formData.category,
        visible: formData.visible,
        order: formData.order,
        status: 'active',
        lastModified: new Date().toISOString(),
        configPath: `src/pages/${formData.id}/config.yaml`,
        componentPath: `src/pages/${formData.id}`
      };

      await onSave(pageData, config);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  if (mode === 'hidden') {
    return null;
  }

  return (
    <Card className="page-editor">
      <div className="editor-header">
        <h3>
          {mode === 'create' && 'Create New Page'}
          {mode === 'edit' && 'Edit Page'}
          {mode === 'clone' && 'Clone Page'}
        </h3>
        {showPreview && (
          <Button
            variant="secondary"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="editor-content">
        <div className="form-section">
          <h4>Page Details</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Page ID</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                disabled={mode === 'edit'}
                placeholder="page-id"
              />
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Page Title"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Route</label>
              <input
                type="text"
                value={formData.route}
                onChange={(e) => handleInputChange('route', e.target.value)}
                placeholder="/page-route"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="main">Main</option>
                <option value="tools">Tools</option>
                <option value="admin">Admin</option>
                <option value="reports">Reports</option>
                <option value="customization">Customization</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the page"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value))}
                min="1"
                max="999"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.visible}
                  onChange={(e) => handleInputChange('visible', e.target.checked)}
                />
                Visible in navigation
              </label>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h4>Page Configuration</h4>
          <textarea
            className="config-editor"
            value={formData.configYaml}
            onChange={(e) => handleInputChange('configYaml', e.target.value)}
            placeholder="Page configuration in YAML format..."
            rows={20}
          />
        </div>
      </div>

      <div className="editor-actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Page'}
        </Button>
      </div>

      <style jsx>{`
        .page-editor {
          margin-top: 2rem;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .editor-header h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
        }

        .error-message {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }

        .editor-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .form-section h4,
        .config-section h4 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }

        .checkbox-group {
          flex-direction: row;
          align-items: center;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        .config-editor {
          width: 100%;
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          resize: vertical;
        }

        .editor-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 1024px) {
          .editor-content {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Card>
  );
};