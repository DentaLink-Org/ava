/**
 * Page Features Component
 * Displays and manages features for a specific page
 */

import React, { useState } from 'react';
import { Button } from '../../_shared/components/Button';
import { Card } from '../../_shared/components/Card';
import { usePageFeatures } from '../hooks/usePageFeatures';
import { FeatureCreateRequest, FeatureUpdateRequest, PageFeature, FeatureStatus, FeaturePriority, FeatureCategory, ImplementationStatus } from '../types/features';

interface PageFeaturesProps {
  pageId: string;
  pageName: string;
  onFeatureSelect?: (feature: PageFeature | null) => void;
  showCreateForm?: boolean;
}

export const PageFeatures: React.FC<PageFeaturesProps> = ({
  pageId,
  pageName,
  onFeatureSelect,
  showCreateForm = true
}) => {
  const {
    features,
    stats,
    loading,
    error,
    createFeature,
    updateFeature,
    deleteFeature,
    selectedFeature,
    setSelectedFeature
  } = usePageFeatures({ pageId });

  const [showForm, setShowForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState<PageFeature | null>(null);
  const [formData, setFormData] = useState<Partial<FeatureCreateRequest>>({
    page_id: pageId,
    name: '',
    description: '',
    priority: 'medium',
    category: 'functionality',
    estimated_hours: undefined
  });

  const handleCreateFeature = async () => {
    if (!formData.name || !formData.description) {
      alert('Please fill in the required fields');
      return;
    }

    const success = await createFeature(formData as FeatureCreateRequest);
    if (success) {
      setShowForm(false);
      setFormData({
        page_id: pageId,
        name: '',
        description: '',
        priority: 'medium',
        category: 'functionality',
        estimated_hours: undefined
      });
    }
  };

  const handleUpdateFeature = async (feature: PageFeature, updates: Partial<FeatureUpdateRequest>) => {
    const success = await updateFeature({
      id: feature.id,
      ...updates
    });
    
    if (success && editingFeature?.id === feature.id) {
      setEditingFeature(null);
    }
  };

  const handleDeleteFeature = async (feature: PageFeature) => {
    if (confirm(`Are you sure you want to delete "${feature.name}"?`)) {
      await deleteFeature(feature.id);
    }
  };

  const handleFeatureSelect = (feature: PageFeature) => {
    setSelectedFeature(feature);
    onFeatureSelect?.(feature);
  };

  const getPriorityColor = (priority: FeaturePriority) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: ImplementationStatus) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'deployed': return '#059669';
      case 'testing': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'needs_review': return '#8b5cf6';
      case 'not_started': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatCategory = (category: FeatureCategory) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatStatus = (status: ImplementationStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Card className="page-features-loading">
        <div className="loading-content">
          <div className="loading-spinner" />
          <p>Loading features...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="page-features">
      <div className="features-header">
        <div className="header-info">
          <h3>Features for {pageName}</h3>
          <p>Manage and track individual features for this page</p>
        </div>
        
        {showCreateForm && (
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
            icon={<span>✨</span>}
          >
            Add Feature
          </Button>
        )}
      </div>

      {stats && (
        <div className="features-stats">
          <div className="stat-card">
            <span className="stat-value">{stats.total_features}</span>
            <span className="stat-label">Total Features</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.completion_percentage}%</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.by_implementation.in_progress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.total_estimated_hours}h</span>
            <span className="stat-label">Estimated</span>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <div className="error-content">
            <p>{error}</p>
            {error.includes('table not found') && (
              <div className="setup-instructions">
                <h4>Setup Instructions:</h4>
                <ol>
                  <li>Open your Supabase Dashboard</li>
                  <li>Go to SQL Editor</li>
                  <li>Copy the SQL from: <code>src/components/page-manager/scripts/setup-features-simple.sql</code></li>
                  <li>Paste and run it in the SQL Editor</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <Card className="feature-form-card">
          <div className="form-header">
            <h4>Create New Feature</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              ✕
            </Button>
          </div>
          
          <div className="feature-form">
            <div className="form-row">
              <div className="form-group">
                <label>Feature Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter feature name..."
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority || 'medium'}
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
                <label>Category</label>
                <select
                  value={formData.category || 'functionality'}
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

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this feature does..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateFeature}>
                Create Feature
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="features-list">
        {features.length === 0 ? (
          <Card className="empty-features">
            <div className="empty-content">
              <span className="empty-icon">📋</span>
              <h4>No Features Yet</h4>
              <p>Start by adding your first feature for this page</p>
              {showCreateForm && (
                <Button
                  variant="primary"
                  onClick={() => setShowForm(true)}
                  icon={<span>✨</span>}
                >
                  Add First Feature
                </Button>
              )}
            </div>
          </Card>
        ) : (
          features.map(feature => (
            <Card 
              key={feature.id} 
              className={`feature-card ${selectedFeature?.id === feature.id ? 'selected' : ''}`}
              onClick={() => handleFeatureSelect(feature)}
            >
              <div className="feature-header">
                <div className="feature-title-section">
                  <h4 className="feature-name">{feature.name}</h4>
                  <div className="feature-badges">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(feature.priority) }}
                    >
                      {feature.priority}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(feature.implementation_status) }}
                    >
                      {formatStatus(feature.implementation_status)}
                    </span>
                  </div>
                </div>
                
                <div className="feature-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFeature(feature);
                    }}
                    icon={<span>✏️</span>}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFeature(feature);
                    }}
                    icon={<span>🗑️</span>}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <p className="feature-description">{feature.description}</p>

              <div className="feature-meta">
                <div className="meta-item">
                  <span className="meta-label">Category:</span>
                  <span className="meta-value">{formatCategory(feature.category)}</span>
                </div>
                {feature.estimated_hours && (
                  <div className="meta-item">
                    <span className="meta-label">Estimated:</span>
                    <span className="meta-value">{feature.estimated_hours}h</span>
                  </div>
                )}
                <div className="meta-item">
                  <span className="meta-label">Created:</span>
                  <span className="meta-value">{new Date(feature.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {editingFeature?.id === feature.id && (
                <div className="feature-edit-form">
                  <div className="edit-form-row">
                    <select
                      value={feature.implementation_status}
                      onChange={(e) => handleUpdateFeature(feature, { 
                        implementation_status: e.target.value as ImplementationStatus 
                      })}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="testing">Testing</option>
                      <option value="needs_review">Needs Review</option>
                      <option value="completed">Completed</option>
                      <option value="deployed">Deployed</option>
                    </select>
                    
                    <select
                      value={feature.priority}
                      onChange={(e) => handleUpdateFeature(feature, { 
                        priority: e.target.value as FeaturePriority 
                      })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  
                  <div className="edit-form-actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingFeature(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setEditingFeature(null)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <style jsx>{`
        .page-features {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .features-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
        }

        .header-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .header-info p {
          margin: 0;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .features-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          padding: 1rem 0;
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #3b82f6;
          display: block;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .error-message {
          background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 1rem 1.25rem;
          border-radius: 8px;
          border-left: 4px solid #ef4444;
          display: flex;
          gap: 1rem;
        }

        .error-message > span {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .error-content {
          flex: 1;
        }

        .error-content p {
          margin: 0 0 0.75rem 0;
          font-weight: 500;
        }

        .setup-instructions {
          background: rgba(255, 255, 255, 0.5);
          padding: 1rem;
          border-radius: 6px;
          border: 1px solid #fecaca;
        }

        .setup-instructions h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .setup-instructions ol {
          margin: 0;
          padding-left: 1.5rem;
          font-size: 0.8125rem;
        }

        .setup-instructions li {
          margin: 0.25rem 0;
        }

        .setup-instructions code {
          background: #fef2f2;
          padding: 0.125rem 0.375rem;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.75rem;
        }

        .feature-form-card {
          border: 2px solid #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .form-header h4 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        .feature-form {
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

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feature-card {
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
          position: relative;
        }

        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-color: #e2e8f0;
        }

        .feature-card.selected {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
        }

        .feature-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .feature-title-section {
          flex: 1;
        }

        .feature-name {
          margin: 0 0 0.75rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }

        .feature-badges {
          display: flex;
          gap: 0.5rem;
        }

        .priority-badge,
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .feature-actions {
          display: flex;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .feature-card:hover .feature-actions {
          opacity: 1;
        }

        .feature-description {
          color: #4b5563;
          line-height: 1.5;
          margin: 0 0 1rem 0;
        }

        .feature-meta {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          font-size: 0.875rem;
        }

        .meta-item {
          display: flex;
          gap: 0.5rem;
        }

        .meta-label {
          color: #6b7280;
          font-weight: 500;
        }

        .meta-value {
          color: #111827;
          font-weight: 600;
        }

        .feature-edit-form {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .edit-form-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .edit-form-row select {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
        }

        .edit-form-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .empty-features {
          text-align: center;
          padding: 3rem 2rem;
        }

        .empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .empty-icon {
          font-size: 3rem;
          opacity: 0.5;
        }

        .empty-content h4 {
          margin: 0;
          color: #374151;
          font-size: 1.25rem;
        }

        .empty-content p {
          margin: 0;
          color: #6b7280;
          max-width: 300px;
        }

        .page-features-loading {
          padding: 3rem;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
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
          .features-header {
            flex-direction: column;
            gap: 1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .features-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .feature-meta {
            flex-direction: column;
            gap: 0.5rem;
          }

          .edit-form-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default PageFeatures;