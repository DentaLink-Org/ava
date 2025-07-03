/**
 * Page List Component - Shows all dashboard pages with management actions
 */

import React, { useState } from 'react';
import { Button } from '../../_shared/components/Button';
import { Card } from '../../_shared/components/Card';
import { PageInfo } from '../types';

interface PageListProps {
  pages: PageInfo[];
  onSelect: (page: PageInfo) => void;
  onEdit: (page: PageInfo) => void;
  onDelete: (page: PageInfo) => void;
  onDuplicate: (page: PageInfo) => void;
  selectedPage?: PageInfo | null;
  showFilters?: boolean;
  allowReorder?: boolean;
  showDetails?: boolean;
  componentId?: string;
  pageId?: string;
}

export const PageList: React.FC<PageListProps> = ({
  pages,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  selectedPage,
  showFilters = true,
  showDetails = true
}) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('order');

  const filteredPages = pages.filter(page => {
    if (filter === 'all') return true;
    if (filter === 'active') return page.status === 'active';
    if (filter === 'draft') return page.status === 'draft';
    if (filter === 'disabled') return page.status === 'disabled';
    return true;
  });

  const sortedPages = [...filteredPages].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'modified':
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      case 'order':
      default:
        return (a.order || 999) - (b.order || 999);
    }
  });

  const getStatusBadge = (status: PageInfo['status']) => {
    const styles = {
      active: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
      draft: { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' },
      disabled: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }
    };

    return (
      <span 
        className="status-badge"
        style={styles[status]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="page-list">
      {showFilters && (
        <div className="filters">
          <div className="filter-group">
            <label>Filter:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Pages</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="order">Order</option>
              <option value="title">Title</option>
              <option value="modified">Last Modified</option>
            </select>
          </div>
        </div>
      )}

      <div className="pages-grid">
        {sortedPages.map(page => (
          <Card
            key={page.id}
            className={`page-card ${selectedPage?.id === page.id ? 'selected' : ''}`}
            onClick={() => onSelect(page)}
          >
            <div className="page-card-header">
              <div className="page-info">
                <h3 className="page-title">{page.title}</h3>
                <p className="page-route">{page.route}</p>
              </div>
              {getStatusBadge(page.status)}
            </div>

            {page.description && (
              <p className="page-description">{page.description}</p>
            )}

            {showDetails && (
              <div className="page-details">
                <div className="detail-item">
                  <span className="detail-label">Components:</span>
                  <span className="detail-value">{page.componentCount || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{page.category || 'uncategorized'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Modified:</span>
                  <span className="detail-value">{formatDate(page.lastModified)}</span>
                </div>
              </div>
            )}

            <div className="page-actions">
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(page);
                }}
                icon={<span>✏️</span>}
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(page);
                }}
                icon={<span>📋</span>}
              >
                Duplicate
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete "${page.title}"?`)) {
                    onDelete(page);
                  }
                }}
                icon={<span>🗑️</span>}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {sortedPages.length === 0 && (
        <div className="empty-state">
          <p>No pages found matching your criteria.</p>
        </div>
      )}

      <style jsx>{`
        .page-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .filters {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          backdrop-filter: blur(8px);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-group label {
          font-weight: 500;
          color: #374151;
          white-space: nowrap;
        }

        .filter-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .pages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .page-card {
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
          background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
          position: relative;
          overflow: hidden;
        }

        .page-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .page-card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform: translateY(-4px) scale(1.01);
          border-color: #e5e7eb;
        }

        .page-card:hover::before {
          transform: scaleX(1);
        }

        .page-card.selected {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
          box-shadow: 0 0 0 1px #3b82f6, 0 20px 25px -5px rgba(59, 130, 246, 0.1);
        }

        .page-card.selected::before {
          transform: scaleX(1);
        }

        .page-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .page-info {
          flex: 1;
        }

        .page-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          color: #111827;
          background: linear-gradient(135deg, #111827, #374151);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-route {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          background: #f8fafc;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
          display: inline-block;
        }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .status-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .page-description {
          color: #4b5563;
          font-size: 0.875rem;
          line-height: 1.4;
          margin: 0 0 1rem 0;
        }

        .page-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #e2e8f0;
          position: relative;
        }

        .page-details::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #06b6d4, #3b82f6);
          border-radius: 8px 8px 0 0;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .detail-label {
          color: #6b7280;
        }

        .detail-value {
          color: #111827;
          font-weight: 500;
        }

        .page-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        @media (max-width: 768px) {
          .filters {
            flex-direction: column;
            gap: 1rem;
          }

          .pages-grid {
            grid-template-columns: 1fr;
          }

          .page-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};