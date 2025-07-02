'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IssueForm } from './IssueForm';
import { IssueList } from './IssueList';

export type IssueStatus = 'unchecked' | 'planning' | 'planned';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  pageId: string;
  createdAt: Date;
  planFilePath?: string;
  tags?: string[];
  source?: 'manual' | 'github';
  githubIssueNumber?: number;
  githubUrl?: string;
}

interface IssueTrackerProps {
  pageId: string;
  className?: string;
}

export const IssueTracker: React.FC<IssueTrackerProps> = ({ 
  pageId, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);

  // Load existing issues for this page
  useEffect(() => {
    loadIssues();
  }, [pageId]);

  const loadIssues = async () => {
    try {
      const response = await fetch(`/api/issues?pageId=${pageId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.issues)) {
          // Convert date strings back to Date objects
          const processedIssues = data.issues.map((issue: any) => ({
            ...issue,
            createdAt: new Date(issue.createdAt)
          }));
          setIssues(processedIssues);
        }
      }
    } catch (error) {
      console.error('Failed to load issues:', error);
    }
  };

  const handleCreateIssue = async (issueData: { title: string; description: string; tags?: string[] }) => {
    const newIssue: Issue = {
      id: Date.now().toString(),
      title: issueData.title,
      description: issueData.description,
      status: 'unchecked',
      pageId,
      createdAt: new Date(),
      tags: issueData.tags || [],
      source: 'manual'
    };

    try {
      // Save to backend
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ issue: newIssue }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIssues(prev => [newIssue, ...prev]);
          setIsCreatingIssue(false);
        } else {
          throw new Error(data.error || 'Failed to save issue');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      alert(`Failed to create issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGeneratePlan = async (issue: Issue) => {
    setIsLoading(true);
    
    // Update issue status to planning
    setIssues(prev => prev.map(i => 
      i.id === issue.id ? { ...i, status: 'planning' } : i
    ));

    try {
      const response = await fetch('/api/issues/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issue: {
            ...issue,
            status: 'planning'
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update issue with plan file path and planned status
        setIssues(prev => prev.map(i => 
          i.id === issue.id 
            ? { 
                ...i, 
                status: 'planned', 
                planFilePath: data.planFilePath 
              } 
            : i
        ));
      } else {
        throw new Error(data.error || 'Failed to generate plan');
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      
      // Reset issue status back to unchecked on error
      setIssues(prev => prev.map(i => 
        i.id === issue.id ? { ...i, status: 'unchecked' } : i
      ));
      
      alert(`Failed to generate plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncGithub = async () => {
    setIsSyncingGithub(true);
    
    try {
      const response = await fetch('/api/issues/sync-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Reload issues to get the synced GitHub issues
        await loadIssues();
        
        if (data.syncedCount > 0) {
          alert(`Successfully synced ${data.syncedCount} issue${data.syncedCount > 1 ? 's' : ''} from GitHub!`);
        } else {
          alert('No new issues found on GitHub or all issues are already synced.');
        }
      } else {
        throw new Error(data.error || 'Failed to sync GitHub issues');
      }
    } catch (error) {
      console.error('Error syncing GitHub issues:', error);
      alert(`Failed to sync GitHub issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSyncingGithub(false);
    }
  };

  const toggleTracker = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsCreatingIssue(false);
    }
  };

  const getStatusCount = (status: IssueStatus) => {
    return issues.filter(issue => issue.status === status).length;
  };

  return (
    <>
      <div className={`issue-tracker-container ${isOpen ? 'open' : 'closed'} ${className}`}>
        <div className="issue-tracker-header" onClick={toggleTracker}>
          <div className="issue-tracker-title">
            <div className="issue-tracker-icon">🐛</div>
            <span>Issue Tracker</span>
            <div className="issue-tracker-badges">
              <span className="issue-badge unchecked">{getStatusCount('unchecked')}</span>
              <span className="issue-badge planning">{getStatusCount('planning')}</span>
              <span className="issue-badge planned">{getStatusCount('planned')}</span>
            </div>
          </div>
          <button className="issue-tracker-toggle" aria-label="Toggle issue tracker">
            {isOpen ? '−' : '+'}
          </button>
        </div>
        
        {isOpen && (
          <div className="issue-tracker-content">
            <div className="issue-tracker-toolbar">
              <div className="toolbar-left">
                <button 
                  className="create-issue-btn"
                  onClick={() => setIsCreatingIssue(true)}
                  disabled={isCreatingIssue || isSyncingGithub}
                >
                  + New Issue
                </button>
                <button 
                  className="sync-github-btn"
                  onClick={handleSyncGithub}
                  disabled={isCreatingIssue || isSyncingGithub || isLoading}
                  title="Sync open issues from GitHub repository"
                >
                  {isSyncingGithub ? (
                    <>
                      <div className="sync-spinner"></div>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <span className="github-icon">⬇️</span>
                      Sync Github
                    </>
                  )}
                </button>
              </div>
              <div className="issue-count">
                {issues.length} issue{issues.length !== 1 ? 's' : ''} on {pageId}
              </div>
            </div>

            {isCreatingIssue && (
              <IssueForm
                onSubmit={handleCreateIssue}
                onCancel={() => setIsCreatingIssue(false)}
                pageId={pageId}
              />
            )}

            <IssueList
              issues={issues}
              onGeneratePlan={handleGeneratePlan}
              isGeneratingPlan={isLoading}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .issue-tracker-container {
          position: fixed;
          bottom: 20px;
          left: 20px;
          width: 450px;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          z-index: 999;
          font-family: var(--font-family, 'Inter, system-ui, sans-serif');
          transition: all 0.3s ease;
        }

        .issue-tracker-container.closed {
          height: 60px;
        }

        .issue-tracker-container.open {
          height: 600px;
          max-height: 80vh;
        }

        .issue-tracker-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--color-warning, #f59e0b);
          color: white;
          border-radius: 12px 12px 0 0;
          cursor: pointer;
          user-select: none;
        }

        .issue-tracker-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          flex: 1;
        }

        .issue-tracker-icon {
          font-size: 20px;
        }

        .issue-tracker-badges {
          display: flex;
          gap: 4px;
          margin-left: 8px;
        }

        .issue-badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 500;
          min-width: 18px;
          text-align: center;
        }

        .issue-badge.unchecked {
          background: rgba(239, 68, 68, 0.8);
        }

        .issue-badge.planning {
          background: rgba(59, 130, 246, 0.8);
        }

        .issue-badge.planned {
          background: rgba(34, 197, 94, 0.8);
        }

        .issue-tracker-toggle {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .issue-tracker-content {
          display: flex;
          flex-direction: column;
          height: 540px;
          max-height: calc(80vh - 60px);
        }

        .issue-tracker-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--color-border, #e5e7eb);
          background: var(--color-surfaceSecondary, #f8fafc);
        }

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .create-issue-btn, .sync-github-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .create-issue-btn {
          background: var(--color-primary, #3b82f6);
          color: white;
        }

        .create-issue-btn:hover:not(:disabled) {
          background: var(--color-primaryDark, #2563eb);
          transform: translateY(-1px);
        }

        .sync-github-btn {
          background: #24292e;
          color: white;
        }

        .sync-github-btn:hover:not(:disabled) {
          background: #1b1f23;
          transform: translateY(-1px);
        }

        .create-issue-btn:disabled, .sync-github-btn:disabled {
          background: var(--color-textSecondary, #6b7280);
          cursor: not-allowed;
          transform: none;
        }

        .github-icon {
          font-size: 14px;
        }

        .sync-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .issue-count {
          font-size: 12px;
          color: var(--color-textSecondary, #6b7280);
        }

        @media (max-width: 768px) {
          .issue-tracker-container {
            width: calc(100vw - 40px);
            left: 20px;
            right: 20px;
          }
          
          .issue-tracker-container.open {
            height: 70vh;
            max-height: 70vh;
          }
          
          .issue-tracker-content {
            height: calc(70vh - 60px);
            max-height: calc(70vh - 60px);
          }

          .issue-tracker-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .toolbar-left {
            flex-direction: column;
            gap: 8px;
          }

          .create-issue-btn, .sync-github-btn {
            width: 100%;
            justify-content: center;
          }

          .issue-count {
            text-align: center;
          }
        }

        @media (max-width: 1200px) {
          .issue-tracker-container {
            left: 20px;
            bottom: 90px; /* Avoid collision with chatbot */
          }
        }
      `}</style>
    </>
  );
};

export default IssueTracker;