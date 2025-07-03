/**
 * Page Actions Component - Quick action buttons for page management
 */

import React from 'react';
import { Button } from '../../_shared/components/Button';
import { Card } from '../../_shared/components/Card';
import { PageInfo } from '../types';

interface PageActionsProps {
  onCreatePage: () => void;
  onImportPage: () => void;
  onExportPages: () => void;
  selectedPage?: PageInfo | null;
  actions?: Array<{
    type: string;
    text: string;
    variant: 'primary' | 'secondary' | 'outline' | 'danger';
  }>;
  componentId?: string;
  pageId?: string;
}

export const PageActions: React.FC<PageActionsProps> = ({
  onCreatePage,
  onImportPage,
  onExportPages,
  selectedPage,
  actions
}) => {
  const handleExport = () => {
    if (selectedPage) {
      // Export single page
      const dataStr = JSON.stringify({
        page: selectedPage,
        timestamp: new Date().toISOString()
      }, null, 2);
      
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedPage.id}-page-config.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Export all pages
      onExportPages();
    }
  };

  return (
    <div className="page-actions-panel">
      <div className="actions-header">
        <h3>Quick Actions</h3>
        {selectedPage && (
          <span className="selected-indicator">
            {selectedPage.title} selected
          </span>
        )}
      </div>

      <div className="actions-list">
        <Button
          variant="primary"
          onClick={onCreatePage}
          className="action-button w-full"
          icon={<span>✨</span>}
        >
          Create New Page
        </Button>

        <Button
          variant="secondary" 
          onClick={onImportPage}
          className="action-button w-full"
          icon={<span>📁</span>}
        >
          Import Page
        </Button>

        <Button
          variant="ghost"
          onClick={handleExport}
          className="action-button w-full border border-gray-200 hover:border-gray-300"
          icon={<span>📤</span>}
        >
          {selectedPage ? 'Export Page' : 'Export All'}
        </Button>

        {selectedPage && (
          <>
            <div className="separator" />
            
            <Button
              variant="secondary"
              onClick={() => window.open(selectedPage.route, '_blank')}
              className="action-button w-full"
              icon={<span>👁️</span>}
            >
              Preview Page
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(selectedPage.route);
                // Could show toast notification here
              }}
              className="action-button w-full border border-gray-200 hover:border-gray-300"
              icon={<span>🔗</span>}
            >
              Copy Route
            </Button>
          </>
        )}
      </div>

      <div className="stats-section">
        <h4>System Stats</h4>
        <div className="stat-item">
          <span>Total Pages</span>
          <span className="stat-value">4</span>
        </div>
        <div className="stat-item">
          <span>Active Pages</span>
          <span className="stat-value">4</span>
        </div>
        <div className="stat-item">
          <span>Draft Pages</span>
          <span className="stat-value">0</span>
        </div>
      </div>

      <style jsx>{`
        .page-actions-panel {
          height: fit-content;
          position: sticky;
          top: 1rem;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(8px);
        }

        .actions-header {
          margin-bottom: 1.5rem;
          padding: 1.5rem 1.5rem 0;
        }

        .actions-header h3 {
          margin: 0 0 0.75rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          background: linear-gradient(135deg, #111827, #374151);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .selected-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          background: linear-gradient(135deg, #dbeafe, #eff6ff);
          color: #1e40af;
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid #93c5fd;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .selected-indicator::before {
          content: '✓';
          font-weight: bold;
        }

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
          padding: 0 1.5rem;
        }

        .action-button {
          justify-content: flex-start;
          text-align: left;
          transition: all 0.2s ease;
        }

        .action-button:hover {
          transform: translateY(-1px);
        }

        .separator {
          height: 2px;
          background: linear-gradient(90deg, #e5e7eb, #d1d5db, #e5e7eb);
          margin: 0.75rem 0;
          border-radius: 1px;
        }

        .stats-section {
          padding: 1.5rem;
          border-top: 2px solid #f1f5f9;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .stats-section h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 700;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stats-section h4::before {
          content: '📊';
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .stat-item:not(:last-child) {
          border-bottom: 1px solid #e2e8f0;
        }

        .stat-value {
          font-weight: 700;
          color: #111827;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          padding: 0.375rem 0.75rem;
          border-radius: 8px;
          border: 1px solid #bae6fd;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          min-width: 2rem;
          text-align: center;
        }

        @media (max-width: 1024px) {
          .page-actions-panel {
            position: static;
          }
        }
      `}</style>
    </div>
  );
};