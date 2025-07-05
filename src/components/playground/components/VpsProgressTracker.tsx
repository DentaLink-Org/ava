'use client';

import { useEffect } from 'react';
import { useVpsProgress } from '@/hooks/useVpsProgress';

export interface VpsProgressTrackerProps {
  jobId: string;
  onJobCompleted: (jobId: string, result?: any, error?: string) => void;
  onReset: () => void;
}

export function VpsProgressTracker({ jobId, onJobCompleted, onReset }: VpsProgressTrackerProps) {
  const { state, reconnect, disconnect } = useVpsProgress(jobId);

  useEffect(() => {
    if (state.isComplete && state.progress) {
      onJobCompleted(
        jobId,
        state.progress.result,
        state.progress.error
      );
    }
  }, [state.isComplete, state.progress, jobId, onJobCompleted]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return '#f59e0b';
      case 'PROCESSING': return '#3b82f6';
      case 'COMPLETED': return '#10b981';
      case 'FAILED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return '⏳';
      case 'PROCESSING': return '⚡';
      case 'COMPLETED': return '✅';
      case 'FAILED': return '❌';
      default: return '❓';
    }
  };

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="vps-progress-tracker">
      <div className="progress-header">
        <h3>Job Progress</h3>
        <div className="job-id">
          Job ID: <code>{jobId}</code>
        </div>
      </div>

      <div className="connection-status">
        <div className={`status-indicator ${state.isConnected ? 'connected' : 'disconnected'}`}>
          {state.isConnected ? '🟢' : '🔴'}
        </div>
        <span>
          {state.isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {!state.isConnected && !state.isComplete && (
          <button onClick={reconnect} className="reconnect-button">
            Reconnect
          </button>
        )}
      </div>

      {state.progress && (
        <div className="progress-details">
          <div className="status-section">
            <div className="status-badge" style={{ backgroundColor: getStatusColor(state.progress.status) }}>
              {getStatusIcon(state.progress.status)} {state.progress.status.toUpperCase()}
            </div>
            
            {state.progress.message && (
              <div className="status-message">
                {state.progress.message}
              </div>
            )}
          </div>

          <div className="progress-section">
            <div className="progress-label">
              Progress: {state.progress.progress || 0}%
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${state.progress.progress || 0}%` }}
              />
            </div>
          </div>

          {state.progress.estimatedCompletion && (
            <div className="eta-section">
              <strong>ETA:</strong> {new Date(state.progress.estimatedCompletion).toLocaleTimeString()}
            </div>
          )}

          {state.progress.processedCount !== undefined && state.progress.totalCount !== undefined && (
            <div className="count-section">
              <strong>Processed:</strong> {state.progress.processedCount} / {state.progress.totalCount} items
            </div>
          )}

          {state.progress.result && (
            <div className="result-section">
              <h4>Result:</h4>
              <pre className="result-data">
                {JSON.stringify(state.progress.result, null, 2)}
              </pre>
            </div>
          )}

          {state.progress.error && (
            <div className="error-section">
              <h4>Error:</h4>
              <div className="error-message">
                {state.progress.error}
              </div>
            </div>
          )}
        </div>
      )}

      {state.error && (
        <div className="connection-error">
          <strong>Connection Error:</strong> {state.error}
        </div>
      )}

      {state.isComplete && (
        <div className="completion-actions">
          <button onClick={onReset} className="reset-button">
            Process Another Job
          </button>
        </div>
      )}

      <style jsx>{`
        .vps-progress-tracker {
          max-width: 100%;
        }

        .progress-header {
          margin-bottom: 20px;
        }

        .progress-header h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .job-id {
          color: #666;
          font-size: 14px;
        }

        .job-id code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .status-indicator {
          font-size: 12px;
        }

        .reconnect-button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 5px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .progress-details {
          space-y: 15px;
        }

        .status-section {
          margin-bottom: 15px;
        }

        .status-badge {
          display: inline-block;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .status-message {
          color: #666;
          font-style: italic;
        }

        .progress-section {
          margin-bottom: 15px;
        }

        .progress-label {
          margin-bottom: 8px;
          font-weight: 600;
        }

        .progress-bar {
          height: 20px;
          background: #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          transition: width 0.3s ease;
          border-radius: 10px;
        }

        .eta-section,
        .count-section {
          margin-bottom: 15px;
          color: #555;
        }

        .result-section,
        .error-section {
          margin-bottom: 15px;
        }

        .result-section h4,
        .error-section h4 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .result-data {
          background: #f1f5f9;
          padding: 15px;
          border-radius: 8px;
          font-size: 12px;
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #e2e8f0;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 10px;
          border-radius: 6px;
        }

        .connection-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .completion-actions {
          margin-top: 20px;
          text-align: center;
        }

        .reset-button {
          background: #10b981;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .reset-button:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
}