/**
 * Page Manager Header Component
 */

import React from 'react';
import { Button } from '../../_shared/components/Button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showActions?: boolean;
  onCreatePage?: () => void;
  onImportPage?: () => void;
  componentId?: string;
  pageId?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showActions = false,
  onCreatePage,
  onImportPage
}) => {
  return (
    <div className="page-header">
      <div className="header-content">
        <div className="header-text">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        
        {showActions && (
          <div className="header-actions">
            <Button
              variant="primary"
              onClick={onCreatePage}
              className="create-page-btn"
              size="lg"
              icon={<span>✨</span>}
            >
              Create New Page
            </Button>
            <Button
              variant="secondary"
              onClick={onImportPage}
              className="import-page-btn"
              size="lg"
              icon={<span>📁</span>}
            >
              Import Page
            </Button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .page-header {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 2rem;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
        }

        .page-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
        }

        .header-text {
          flex: 1;
        }

        .page-title {
          font-size: 2.25rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #111827, #374151, #4f46e5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
          position: relative;
        }

        .page-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
        }

        .page-subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          margin: 1rem 0 0 0;
          line-height: 1.5;
          font-weight: 500;
          max-width: 600px;
          position: relative;
          padding-left: 1rem;
        }

        .page-subtitle::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 20px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding-top: 0.5rem;
        }

        .create-page-btn,
        .import-page-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .create-page-btn:hover,
        .import-page-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .page-title {
            font-size: 1.75rem;
          }

          .header-actions {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};