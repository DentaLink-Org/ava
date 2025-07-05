'use client';

import { VpsJob } from './VpsDemo';

export interface VpsJobHistoryProps {
  jobs: VpsJob[];
  activeJobId: string | null;
  onJobSelected: (jobId: string) => void;
}

export function VpsJobHistory({ jobs, activeJobId, onJobSelected }: VpsJobHistoryProps) {
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diff = endTime.getTime() - start.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (jobs.length === 0) {
    return (
      <div className="vps-job-history">
        <h3>Job History</h3>
        <div className="empty-state">
          <p>No jobs submitted yet</p>
          <small>Submit your first job to see it here</small>
        </div>

        <style jsx>{`
          .vps-job-history h3 {
            margin-bottom: 15px;
            color: #333;
          }

          .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #666;
          }

          .empty-state p {
            margin-bottom: 5px;
            font-size: 16px;
          }

          .empty-state small {
            font-size: 14px;
            color: #999;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="vps-job-history">
      <h3>Job History</h3>
      
      <div className="job-list">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`job-item ${activeJobId === job.id ? 'active' : ''}`}
            onClick={() => onJobSelected(job.id)}
          >
            <div className="job-header">
              <div className="job-type">{job.type}</div>
              <div 
                className="job-status"
                style={{ color: getStatusColor(job.status) }}
              >
                {getStatusIcon(job.status)} {job.status}
              </div>
            </div>
            
            <div className="job-details">
              <div className="job-id">
                ID: <code>{job.id.slice(0, 8)}...</code>
              </div>
              <div className="job-time">
                {formatTime(job.submittedAt)}
              </div>
            </div>

            <div className="job-duration">
              Duration: {formatDuration(job.submittedAt, job.completedAt)}
            </div>

            {job.error && (
              <div className="job-error">
                Error: {job.error}
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .vps-job-history h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .job-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .job-item {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .job-item:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .job-item.active {
          border-color: #0070f3;
          background: #f0f9ff;
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .job-type {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .job-status {
          font-size: 12px;
          font-weight: 500;
        }

        .job-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .job-id {
          font-size: 12px;
          color: #666;
        }

        .job-id code {
          background: #f1f5f9;
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 11px;
        }

        .job-time {
          font-size: 12px;
          color: #666;
        }

        .job-duration {
          font-size: 12px;
          color: #666;
        }

        .job-error {
          margin-top: 8px;
          padding: 6px 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 4px;
          color: #dc2626;
          font-size: 11px;
        }
      `}</style>
    </div>
  );
}