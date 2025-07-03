'use client';

import React from 'react';
import { Issue, IssueStatus } from './IssueTracker';

interface IssueListProps {
  issues: Issue[];
  onGeneratePlan: (issue: Issue) => void;
  isGeneratingPlan: boolean;
}

export const IssueList: React.FC<IssueListProps> = ({ 
  issues, 
  onGeneratePlan, 
  isGeneratingPlan 
}) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: IssueStatus): string => {
    switch (status) {
      case 'unchecked': return '🔴';
      case 'planning': return '🔄';
      case 'planned': return '✅';
      default: return '❓';
    }
  };

  const getStatusLabel = (status: IssueStatus): string => {
    switch (status) {
      case 'unchecked': return 'Not Investigated';
      case 'planning': return 'Generating Plan...';
      case 'planned': return 'Plan Ready';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: IssueStatus): string => {
    switch (status) {
      case 'unchecked': return '#ef4444';
      case 'planning': return '#3b82f6';
      case 'planned': return '#22c55e';
      default: return '#6b7280';
    }
  };

  if (issues.length === 0) {
    return (
      <div className="issue-list-empty">
        <div className="empty-icon">🐛</div>
        <div className="empty-title">No issues reported yet</div>
        <div className="empty-description">
          Create your first issue to start tracking problems and generating solutions
        </div>
        
        <style jsx>{`
          .issue-list-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            text-align: center;
            height: 200px;
          }

          .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
          }

          .empty-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--color-text, #1f2937);
            margin-bottom: 8px;
          }

          .empty-description {
            font-size: 13px;
            color: var(--color-textSecondary, #6b7280);
            line-height: 1.5;
            max-width: 280px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="issue-list-container">
      <div className="issue-list">
        {issues.map((issue) => (
          <div key={issue.id} className="issue-item">
            <div className="issue-header">
              <div className="issue-status">
                <span 
                  className="status-icon" 
                  style={{ color: getStatusColor(issue.status) }}
                >
                  {getStatusIcon(issue.status)}
                </span>
                <span 
                  className="status-label"
                  style={{ color: getStatusColor(issue.status) }}
                >
                  {getStatusLabel(issue.status)}
                </span>
              </div>
              <div className="issue-date">
                {formatDate(issue.createdAt)}
              </div>
            </div>

            <div className="issue-content">
              <h4 className="issue-title">{issue.title}</h4>
              <p className="issue-description">{issue.description}</p>
              
              <div className="issue-metadata">
                {issue.tags && issue.tags.length > 0 && (
                  <div className="issue-tags">
                    {issue.tags.map((tag, index) => (
                      <span key={index} className="issue-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {issue.source === 'github' && (
                  <div className="github-source">
                    <span className="github-badge">
                      <span className="github-icon">🐙</span>
                      GitHub #{issue.githubIssueNumber}
                    </span>
                    {issue.githubUrl && (
                      <a 
                        href={issue.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="github-link"
                        title="View on GitHub"
                      >
                        🔗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="issue-actions">
              {issue.status === 'unchecked' && (
                <button
                  onClick={() => onGeneratePlan(issue)}
                  disabled={isGeneratingPlan}
                  className="generate-plan-btn"
                >
                  {isGeneratingPlan ? 'Generating Plan...' : '🔍 Generate Investigation Plan'}
                </button>
              )}
              
              {issue.status === 'planning' && (
                <div className="planning-indicator">
                  <div className="planning-spinner"></div>
                  <span>Investigating issue and creating plan...</span>
                </div>
              )}
              
              {issue.status === 'planned' && issue.planFilePath && (
                <div className="plan-ready">
                  <span className="plan-ready-text">
                    ✅ Investigation plan created
                  </span>
                  <span className="plan-file-path">
                    {issue.planFilePath}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .issue-list-container {
          flex: 1;
          overflow-y: auto;
          padding: 8px 16px 16px;
        }

        .issue-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .issue-item {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 8px;
          padding: 16px;
          transition: all 0.2s ease;
        }

        .issue-item:hover {
          border-color: var(--color-primary, #3b82f6);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
        }

        .issue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .issue-status {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-icon {
          font-size: 14px;
        }

        .status-label {
          font-size: 12px;
          font-weight: 500;
        }

        .issue-date {
          font-size: 11px;
          color: var(--color-textSecondary, #6b7280);
        }

        .issue-content {
          margin-bottom: 16px;
        }

        .issue-title {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text, #1f2937);
          line-height: 1.4;
        }

        .issue-description {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: var(--color-textSecondary, #6b7280);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .issue-metadata {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .issue-tags {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .issue-tag {
          background: var(--color-surfaceSecondary, #f8fafc);
          color: var(--color-textSecondary, #6b7280);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          border: 1px solid var(--color-border, #e5e7eb);
        }

        .github-source {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .github-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #24292e;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .github-icon {
          font-size: 10px;
        }

        .github-link {
          color: var(--color-textSecondary, #6b7280);
          text-decoration: none;
          font-size: 12px;
          transition: color 0.2s ease;
        }

        .github-link:hover {
          color: var(--color-primary, #3b82f6);
        }

        .issue-actions {
          border-top: 1px solid var(--color-border, #e5e7eb);
          padding-top: 12px;
        }

        .generate-plan-btn {
          background: var(--color-primary, #3b82f6);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .generate-plan-btn:hover:not(:disabled) {
          background: var(--color-primaryDark, #2563eb);
          transform: translateY(-1px);
        }

        .generate-plan-btn:disabled {
          background: var(--color-textSecondary, #6b7280);
          cursor: not-allowed;
          transform: none;
        }

        .planning-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--color-primary, #3b82f6);
          font-size: 12px;
          font-weight: 500;
        }

        .planning-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid var(--color-primary, #3b82f6);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .plan-ready {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .plan-ready-text {
          color: var(--color-success, #22c55e);
          font-size: 12px;
          font-weight: 500;
        }

        .plan-file-path {
          font-size: 11px;
          color: var(--color-textSecondary, #6b7280);
          font-family: 'Courier New', monospace;
          background: var(--color-surfaceSecondary, #f8fafc);
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid var(--color-border, #e5e7eb);
        }

        @media (max-width: 768px) {
          .issue-list-container {
            padding: 8px 8px 16px;
          }
          
          .issue-item {
            padding: 12px;
          }
          
          .issue-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .issue-description {
            -webkit-line-clamp: 2;
          }
        }
      `}</style>
    </div>
  );
};

export default IssueList;