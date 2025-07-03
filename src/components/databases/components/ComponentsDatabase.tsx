/**
 * Components Database Component
 * Provides database view and management for page components
 * Demonstrates synchronized database functionality for component specifications
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Edit, Trash2, Search, Filter, Download, Upload, Code, Package } from 'lucide-react';
import { Card } from '../../_shared/components/Card';
import { Button } from '../../_shared/components/Button';
import { ComponentsAPI } from '../../page-manager/api/components-api';
import { usePageComponents } from '../../page-manager/hooks/usePageComponents';
import { 
  PageComponent, 
  ComponentCreateRequest, 
  ComponentUpdateRequest,
  ComponentFilter,
  ComponentStatus,
  ComponentPriority,
  ComponentCategory,
  ComponentGroup,
  ImplementationStatus 
} from '../../page-manager/types/components';

interface ComponentsDatabaseProps {
  className?: string;
}

export const ComponentsDatabase: React.FC<ComponentsDatabaseProps> = ({ className = '' }) => {
  const {
    components,
    stats,
    summary,
    loading,
    error,
    createComponent,
    updateComponent,
    deleteComponent,
    filterComponents,
    refreshComponents
  } = usePageComponents({ autoRefresh: true });

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<PageComponent | null>(null);
  const [filter, setFilter] = useState<ComponentFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState<Partial<ComponentCreateRequest>>({
    name: '',
    title: '',
    description: '',
    functionality: '',
    priority: 'medium',
    category: 'other',
    group: 'utility',
    estimated_hours: undefined
  });

  // Apply search and filters
  useEffect(() => {
    const delayedFilter = setTimeout(() => {
      const appliedFilter: ComponentFilter = {
        ...filter,
        search: searchQuery || undefined,
        sort_by: 'updated_at',
        sort_order: 'desc'
      };
      filterComponents(appliedFilter);
    }, 300);

    return () => clearTimeout(delayedFilter);
  }, [searchQuery, filter, filterComponents]);

  const handleCreateComponent = async () => {
    if (!formData.name || !formData.title || !formData.description || !formData.functionality) {
      alert('Please fill in all required fields');
      return;
    }

    const success = await createComponent(formData as ComponentCreateRequest);
    if (success) {
      setShowCreateModal(false);
      resetForm();
    }
  };

  const handleUpdateComponent = async (component: PageComponent, updates: Partial<ComponentUpdateRequest>) => {
    const success = await updateComponent({
      id: component.id,
      ...updates
    });
    
    if (success) {
      setEditingComponent(null);
    }
  };

  const handleDeleteComponent = async (component: PageComponent) => {
    if (confirm(`Are you sure you want to delete "${component.name}"?`)) {
      await deleteComponent(component.id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      description: '',
      functionality: '',
      priority: 'medium',
      category: 'other',
      group: 'utility',
      estimated_hours: undefined
    });
  };

  const exportComponents = () => {
    const dataStr = JSON.stringify(components, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `page-components-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPriorityIcon = (priority: ComponentPriority) => {
    switch (priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusIcon = (status: ImplementationStatus) => {
    switch (status) {
      case 'completed': return '✅';
      case 'deployed': return '🚀';
      case 'reviewed': return '👍';
      case 'testing': return '🧪';
      case 'in_progress': return '🔄';
      case 'needs_review': return '👀';
      case 'not_started': return '⏸️';
      default: return '❓';
    }
  };

  const getGroupIcon = (group: ComponentGroup) => {
    switch (group) {
      case 'interactive': return '🎯';
      case 'data': return '📊';
      case 'navigation': return '🧭';
      case 'layout': return '📐';
      case 'feedback': return '💬';
      case 'utility': return '🔧';
      default: return '📦';
    }
  };

  const formatCategory = (category: ComponentCategory) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatStatus = (status: ImplementationStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatGroup = (group: ComponentGroup) => {
    return group.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading && components.length === 0) {
    return (
      <Card className={`components-database loading ${className}`}>
        <div className="loading-content">
          <div className="loading-spinner" />
          <h3>Loading Components Database...</h3>
          <p>Connecting to synchronized component specifications</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`components-database ${className}`}>
      <Card className="database-header">
        <div className="header-content">
          <div className="header-info">
            <h2>🧩 Components Database</h2>
            <p>Centralized management of all component specifications with implementation tracking</p>
          </div>
          
          <div className="header-actions">
            <Button
              variant="ghost"
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              icon={viewMode === 'table' ? <Package size={16} /> : <span>📋</span>}
            >
              {viewMode === 'table' ? 'Card View' : 'Table View'}
            </Button>
            
            <Button
              variant="secondary"
              onClick={exportComponents}
              icon={<Download size={16} />}
            >
              Export
            </Button>
            
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              icon={<Plus size={16} />}
            >
              Add Component
            </Button>
          </div>
        </div>

        {stats && (
          <div className="database-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total_components}</span>
              <span className="stat-label">Total Components</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.completion_percentage}%</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.by_implementation.in_progress}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.by_priority.high + stats.by_priority.critical}</span>
              <span className="stat-label">High Priority</span>
            </div>
          </div>
        )}
      </Card>

      <Card className="database-controls">
        <div className="search-section">
          <div className="search-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search components by name, title, description, or functionality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button
            variant="ghost"
            onClick={refreshComponents}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
        </div>

        <div className="filter-section">
          <select
            value={filter.category?.[0] || ''}
            onChange={(e) => setFilter({ 
              ...filter, 
              category: e.target.value ? [e.target.value as ComponentCategory] : undefined 
            })}
          >
            <option value="">All Categories</option>
            <option value="core_task">Core Task</option>
            <option value="creation_editing">Creation & Editing</option>
            <option value="planning_organization">Planning & Organization</option>
            <option value="collaboration">Collaboration</option>
            <option value="analytics_reporting">Analytics & Reporting</option>
            <option value="time_tracking">Time Tracking</option>
            <option value="automation_workflow">Automation & Workflow</option>
            <option value="mobile_accessibility">Mobile & Accessibility</option>
            <option value="integration">Integration</option>
            <option value="specialized_views">Specialized Views</option>
            <option value="ui_basic">UI Basic</option>
            <option value="data_display">Data Display</option>
            <option value="navigation">Navigation</option>
            <option value="form">Form</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filter.group?.[0] || ''}
            onChange={(e) => setFilter({ 
              ...filter, 
              group: e.target.value ? [e.target.value as ComponentGroup] : undefined 
            })}
          >
            <option value="">All Groups</option>
            <option value="interactive">Interactive</option>
            <option value="data">Data</option>
            <option value="navigation">Navigation</option>
            <option value="layout">Layout</option>
            <option value="feedback">Feedback</option>
            <option value="utility">Utility</option>
          </select>

          <select
            value={filter.priority?.[0] || ''}
            onChange={(e) => setFilter({ 
              ...filter, 
              priority: e.target.value ? [e.target.value as ComponentPriority] : undefined 
            })}
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filter.implementation_status?.[0] || ''}
            onChange={(e) => setFilter({ 
              ...filter, 
              implementation_status: e.target.value ? [e.target.value as ImplementationStatus] : undefined 
            })}
          >
            <option value="">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="testing">Testing</option>
            <option value="needs_review">Needs Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="completed">Completed</option>
            <option value="deployed">Deployed</option>
          </select>
        </div>
      </Card>

      {error && (
        <Card className="error-card">
          <div className="error-content">
            <span>⚠️</span>
            <div>
              <h4>Database Error</h4>
              <p>{error}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="database-content">
        {viewMode === 'table' ? (
          <div className="table-view">
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Category</th>
                  <th>Group</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {components.map(component => (
                  <tr key={component.id} className="component-row">
                    <td>
                      <div className="component-name-cell">
                        <strong>{component.title}</strong>
                        <div className="component-name">{component.name}</div>
                        <div className="component-description-preview">
                          {component.description.substring(0, 80)}
                          {component.description.length > 80 ? '...' : ''}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">{formatCategory(component.category)}</span>
                    </td>
                    <td>
                      <div className="group-cell">
                        <span>{getGroupIcon(component.group)}</span>
                        <span>{formatGroup(component.group)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="priority-cell">
                        <span>{getPriorityIcon(component.priority)}</span>
                        <span>{component.priority}</span>
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        <span>{getStatusIcon(component.implementation_status)}</span>
                        <span>{formatStatus(component.implementation_status)}</span>
                      </div>
                    </td>
                    <td>
                      {component.estimated_hours && (
                        <span className="hours-tag">{component.estimated_hours}h</span>
                      )}
                    </td>
                    <td>{new Date(component.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingComponent(component)}
                          icon={<Edit size={14} />}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComponent(component)}
                          icon={<Trash2 size={14} />}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="cards-view">
            {components.map(component => (
              <Card key={component.id} className="component-card">
                <div className="card-header">
                  <div className="card-title-section">
                    <h4>{component.title}</h4>
                    <div className="component-name-tag">{component.name}</div>
                  </div>
                  <div className="card-badges">
                    <span className="priority-badge">
                      {getPriorityIcon(component.priority)} {component.priority}
                    </span>
                    <span className="status-badge">
                      {getStatusIcon(component.implementation_status)} {formatStatus(component.implementation_status)}
                    </span>
                  </div>
                </div>
                
                <p className="card-description">{component.description}</p>
                
                <div className="functionality-section">
                  <h5>Functionality</h5>
                  <p className="functionality-text">{component.functionality}</p>
                </div>
                
                <div className="card-meta">
                  <span className="group-tag">
                    {getGroupIcon(component.group)} {formatGroup(component.group)}
                  </span>
                  <span className="category-tag">{formatCategory(component.category)}</span>
                  {component.estimated_hours && (
                    <span className="hours-tag">{component.estimated_hours}h</span>
                  )}
                </div>

                {component.features && component.features.length > 0 && (
                  <div className="features-section">
                    <h5>Key Features</h5>
                    <div className="features-list">
                      {component.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="feature-item">• {feature}</div>
                      ))}
                      {component.features.length > 3 && (
                        <div className="feature-item">+ {component.features.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )}

                {component.file_path && (
                  <div className="file-path-section">
                    <Code size={14} />
                    <span className="file-path">{component.file_path}</span>
                  </div>
                )}
                
                <div className="card-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingComponent(component)}
                    icon={<Edit size={14} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteComponent(component)}
                    icon={<Trash2 size={14} />}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {components.length === 0 && !loading && (
          <div className="empty-state">
            <span className="empty-icon">🧩</span>
            <h3>No Components Found</h3>
            <p>Start by creating your first component specification or adjust your filters</p>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              icon={<Plus size={16} />}
            >
              Create First Component
            </Button>
          </div>
        )}
      </Card>

      {/* Create Component Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <Card className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Component</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Component Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., TaskCardEnhanced"
                  />
                </div>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Enhanced Task Card"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as ComponentPriority })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Estimated Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimated_hours || ''}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || undefined })}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ComponentCategory })}
                  >
                    <option value="core_task">Core Task</option>
                    <option value="creation_editing">Creation & Editing</option>
                    <option value="planning_organization">Planning & Organization</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="analytics_reporting">Analytics & Reporting</option>
                    <option value="time_tracking">Time Tracking</option>
                    <option value="automation_workflow">Automation & Workflow</option>
                    <option value="mobile_accessibility">Mobile & Accessibility</option>
                    <option value="integration">Integration</option>
                    <option value="specialized_views">Specialized Views</option>
                    <option value="ui_basic">UI Basic</option>
                    <option value="data_display">Data Display</option>
                    <option value="navigation">Navigation</option>
                    <option value="form">Form</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Group</label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value as ComponentGroup })}
                  >
                    <option value="interactive">Interactive</option>
                    <option value="data">Data</option>
                    <option value="navigation">Navigation</option>
                    <option value="layout">Layout</option>
                    <option value="feedback">Feedback</option>
                    <option value="utility">Utility</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of what this component is..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Functionality *</label>
                <textarea
                  value={formData.functionality}
                  onChange={(e) => setFormData({ ...formData, functionality: e.target.value })}
                  placeholder="Detailed explanation of what this component does and its features..."
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateComponent}>
                Create Component
              </Button>
            </div>
          </Card>
        </div>
      )}

      <style jsx>{`
        .components-database {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .database-header {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid #0891b2;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .header-info h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #0e7490;
        }

        .header-info p {
          margin: 0;
          color: #155e75;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .database-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0891b2;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .database-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .search-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .search-input {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 0.75rem;
          flex: 1;
          max-width: 500px;
        }

        .search-input input {
          border: none;
          outline: none;
          background: none;
          flex: 1;
          font-size: 0.875rem;
        }

        .filter-section {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-section select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          font-size: 0.875rem;
          min-width: 140px;
        }

        .database-content {
          overflow: hidden;
        }

        .table-view {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          text-align: left;
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .component-row:hover {
          background: #f8fafc;
        }

        .component-name-cell strong {
          display: block;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .component-name {
          color: #6b7280;
          font-size: 0.875rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          margin-bottom: 0.25rem;
        }

        .component-description-preview {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .category-tag, .group-tag, .hours-tag {
          background: #e5e7eb;
          color: #374151;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .component-name-tag {
          background: #f0f9ff;
          color: #0891b2;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          margin-top: 0.25rem;
        }

        .priority-cell, .status-cell, .group-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .cards-view {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .component-card {
          transition: all 0.2s ease;
          border: 1px solid #e5e7eb;
        }

        .component-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border-color: #0891b2;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .card-title-section h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }

        .card-badges {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }

        .priority-badge, .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          background: #f3f4f6;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .card-description {
          color: #4b5563;
          line-height: 1.5;
          margin: 0 0 1rem 0;
        }

        .functionality-section {
          margin: 1rem 0;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 6px;
          border-left: 3px solid #0891b2;
        }

        .functionality-section h5 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #0e7490;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .functionality-text {
          margin: 0;
          color: #374151;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .features-section {
          margin: 1rem 0;
        }

        .features-section h5 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .feature-item {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .file-path-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 1rem 0;
          padding: 0.5rem;
          background: #f1f5f9;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }

        .file-path {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.75rem;
          color: #475569;
        }

        .card-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          color: #374151;
        }

        .empty-state p {
          margin: 0 0 2rem 0;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border: 1px solid #e5e7eb;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          background: white;
          transition: all 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #0891b2;
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .error-card {
          background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
          border: 1px solid #fecaca;
        }

        .error-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #991b1b;
        }

        .error-content h4 {
          margin: 0 0 0.25rem 0;
          font-weight: 600;
        }

        .error-content p {
          margin: 0;
          font-size: 0.875rem;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
          color: #6b7280;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f4f6;
          border-top: 3px solid #0891b2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
          }

          .database-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .search-section {
            width: 100%;
          }

          .filter-section {
            width: 100%;
            flex-wrap: wrap;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .cards-view {
            grid-template-columns: 1fr;
          }

          .modal-content {
            width: 95%;
            margin: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ComponentsDatabase;