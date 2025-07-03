/**
 * Features Database Component
 * Provides database view and management for page features
 * Demonstrates synchronized database functionality
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Edit, Trash2, Search, Filter, Download, Upload } from 'lucide-react';
import { Card } from '../../_shared/components/Card';
import { Button } from '../../_shared/components/Button';
import { FeaturesAPI } from '../../page-manager/api/features-api';
import { usePageFeatures } from '../../page-manager/hooks/usePageFeatures';
import { 
  PageFeature, 
  FeatureCreateRequest, 
  FeatureUpdateRequest,
  FeatureFilter,
  FeatureStatus,
  FeaturePriority,
  FeatureCategory,
  ImplementationStatus 
} from '../../page-manager/types/features';

interface FeaturesDatabaseProps {
  className?: string;
}

export const FeaturesDatabase: React.FC<FeaturesDatabaseProps> = ({ className = '' }) => {
  const {
    features,
    stats,
    loading,
    error,
    createFeature,
    updateFeature,
    deleteFeature,
    filterFeatures,
    refreshFeatures
  } = usePageFeatures({ autoRefresh: true });

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<PageFeature | null>(null);
  const [filter, setFilter] = useState<FeatureFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState<Partial<FeatureCreateRequest>>({
    page_id: '',
    name: '',
    description: '',
    priority: 'medium',
    category: 'functionality',
    estimated_hours: undefined
  });

  // Apply search and filters
  useEffect(() => {
    const delayedFilter = setTimeout(() => {
      const appliedFilter: FeatureFilter = {
        ...filter,
        search: searchQuery || undefined,
        sort_by: 'updated_at',
        sort_order: 'desc'
      };
      filterFeatures(appliedFilter);
    }, 300);

    return () => clearTimeout(delayedFilter);
  }, [searchQuery, filter, filterFeatures]);

  const handleCreateFeature = async () => {
    if (!formData.page_id || !formData.name || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const success = await createFeature(formData as FeatureCreateRequest);
    if (success) {
      setShowCreateModal(false);
      resetForm();
    }
  };

  const handleUpdateFeature = async (feature: PageFeature, updates: Partial<FeatureUpdateRequest>) => {
    const success = await updateFeature({
      id: feature.id,
      ...updates
    });
    
    if (success) {
      setEditingFeature(null);
    }
  };

  const handleDeleteFeature = async (feature: PageFeature) => {
    if (confirm(`Are you sure you want to delete "${feature.name}"?`)) {
      await deleteFeature(feature.id);
    }
  };

  const resetForm = () => {
    setFormData({
      page_id: '',
      name: '',
      description: '',
      priority: 'medium',
      category: 'functionality',
      estimated_hours: undefined
    });
  };

  const exportFeatures = () => {
    const dataStr = JSON.stringify(features, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `page-features-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPriorityIcon = (priority: FeaturePriority) => {
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
      case 'testing': return '🧪';
      case 'in_progress': return '🔄';
      case 'needs_review': return '👀';
      case 'not_started': return '⏸️';
      default: return '❓';
    }
  };

  const formatCategory = (category: FeatureCategory) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatStatus = (status: ImplementationStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading && features.length === 0) {
    return (
      <Card className={`features-database loading ${className}`}>
        <div className="loading-content">
          <div className="loading-spinner" />
          <h3>Loading Features Database...</h3>
          <p>Connecting to synchronized database</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`features-database ${className}`}>
      <Card className="database-header">
        <div className="header-content">
          <div className="header-info">
            <h2>📊 Features Database</h2>
            <p>Centralized management of all page features with real-time synchronization</p>
          </div>
          
          <div className="header-actions">
            <Button
              variant="ghost"
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              icon={viewMode === 'table' ? <span>🎴</span> : <span>📋</span>}
            >
              {viewMode === 'table' ? 'Card View' : 'Table View'}
            </Button>
            
            <Button
              variant="secondary"
              onClick={exportFeatures}
              icon={<Download size={16} />}
            >
              Export
            </Button>
            
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              icon={<Plus size={16} />}
            >
              Add Feature
            </Button>
          </div>
        </div>

        {stats && (
          <div className="database-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total_features}</span>
              <span className="stat-label">Total Features</span>
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
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button
            variant="ghost"
            onClick={refreshFeatures}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
        </div>

        <div className="filter-section">
          <select
            value={filter.page_id || ''}
            onChange={(e) => setFilter({ ...filter, page_id: e.target.value || undefined })}
          >
            <option value="">All Pages</option>
            <option value="dashboard">Dashboard</option>
            <option value="databases">Databases</option>
            <option value="tasks">Tasks</option>
            <option value="page-manager">Page Manager</option>
          </select>

          <select
            value={filter.priority?.[0] || ''}
            onChange={(e) => setFilter({ 
              ...filter, 
              priority: e.target.value ? [e.target.value as FeaturePriority] : undefined 
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
                  <th>Feature Name</th>
                  <th>Page</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Progress</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {features.map(feature => (
                  <tr key={feature.id} className="feature-row">
                    <td>
                      <div className="feature-name-cell">
                        <strong>{feature.name}</strong>
                        <div className="feature-description-preview">
                          {feature.description.substring(0, 80)}
                          {feature.description.length > 80 ? '...' : ''}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="page-tag">{feature.page_id}</span>
                    </td>
                    <td>
                      <div className="priority-cell">
                        <span>{getPriorityIcon(feature.priority)}</span>
                        <span>{feature.priority}</span>
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        <span>{getStatusIcon(feature.implementation_status)}</span>
                        <span>{formatStatus(feature.implementation_status)}</span>
                      </div>
                    </td>
                    <td>{formatCategory(feature.category)}</td>
                    <td>
                      {feature.estimated_hours && (
                        <span className="hours-tag">{feature.estimated_hours}h</span>
                      )}
                    </td>
                    <td>{new Date(feature.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingFeature(feature)}
                          icon={<Edit size={14} />}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFeature(feature)}
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
            {features.map(feature => (
              <Card key={feature.id} className="feature-card">
                <div className="card-header">
                  <h4>{feature.name}</h4>
                  <div className="card-badges">
                    <span className="priority-badge">
                      {getPriorityIcon(feature.priority)} {feature.priority}
                    </span>
                    <span className="status-badge">
                      {getStatusIcon(feature.implementation_status)} {formatStatus(feature.implementation_status)}
                    </span>
                  </div>
                </div>
                
                <p className="card-description">{feature.description}</p>
                
                <div className="card-meta">
                  <span className="page-tag">{feature.page_id}</span>
                  <span className="category-tag">{formatCategory(feature.category)}</span>
                  {feature.estimated_hours && (
                    <span className="hours-tag">{feature.estimated_hours}h</span>
                  )}
                </div>
                
                <div className="card-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingFeature(feature)}
                    icon={<Edit size={14} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteFeature(feature)}
                    icon={<Trash2 size={14} />}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {features.length === 0 && !loading && (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No Features Found</h3>
            <p>Start by creating your first feature or adjust your filters</p>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              icon={<Plus size={16} />}
            >
              Create First Feature
            </Button>
          </div>
        )}
      </Card>

      {/* Create Feature Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <Card className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Feature</h3>
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
                  <label>Page ID *</label>
                  <select
                    value={formData.page_id}
                    onChange={(e) => setFormData({ ...formData, page_id: e.target.value })}
                  >
                    <option value="">Select Page</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="databases">Databases</option>
                    <option value="tasks">Tasks</option>
                    <option value="page-manager">Page Manager</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as FeaturePriority })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Feature Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter feature name..."
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as FeatureCategory })}
                  >
                    <option value="ui_component">UI Component</option>
                    <option value="functionality">Functionality</option>
                    <option value="integration">Integration</option>
                    <option value="performance">Performance</option>
                    <option value="security">Security</option>
                    <option value="accessibility">Accessibility</option>
                    <option value="analytics">Analytics</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this feature does..."
                  rows={4}
                />
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

            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateFeature}>
                Create Feature
              </Button>
            </div>
          </Card>
        </div>
      )}

      <style jsx>{`
        .features-database {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .database-header {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 1px solid #3b82f6;
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
          color: #1e40af;
        }

        .header-info p {
          margin: 0;
          color: #3730a3;
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
          color: #3b82f6;
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
          max-width: 400px;
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

        .feature-row:hover {
          background: #f8fafc;
        }

        .feature-name-cell strong {
          display: block;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .feature-description-preview {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .page-tag, .category-tag, .hours-tag {
          background: #e5e7eb;
          color: #374151;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .priority-cell, .status-cell {
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
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .feature-card {
          transition: all 0.2s ease;
        }

        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .card-header h4 {
          margin: 0;
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
          max-width: 600px;
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
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
          border-top: 3px solid #3b82f6;
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

export default FeaturesDatabase;