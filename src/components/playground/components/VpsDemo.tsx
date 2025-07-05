'use client';

import { useState } from 'react';
import { VpsJobSubmitter } from './VpsJobSubmitter';
import { VpsProgressTracker } from './VpsProgressTracker';
import { VpsJobHistory } from './VpsJobHistory';

export interface VpsJob {
  id: string;
  type: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  submittedAt: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export function VpsDemo() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobHistory, setJobHistory] = useState<VpsJob[]>([]);

  const handleJobSubmitted = (jobId: string, jobType: string) => {
    const newJob: VpsJob = {
      id: jobId,
      type: jobType,
      status: 'PENDING',
      submittedAt: new Date()
    };
    
    setJobHistory(prev => [newJob, ...prev]);
    setActiveJobId(jobId);
  };

  const handleJobCompleted = (jobId: string, result?: any, error?: string) => {
    setJobHistory(prev => prev.map(job => 
      job.id === jobId 
        ? { 
            ...job, 
            status: error ? 'FAILED' : 'COMPLETED',
            completedAt: new Date(),
            result,
            error
          }
        : job
    ));
  };

  const handleJobSelected = (jobId: string) => {
    setActiveJobId(jobId);
  };

  const handleReset = () => {
    setActiveJobId(null);
  };

  return (
    <div className="vps-demo">
      <div className="vps-demo-header">
        <h2>VPS Processing Demo</h2>
        <p>Submit data processing jobs to the VPS server and track their progress in real-time.</p>
      </div>

      <div className="vps-demo-grid">
        <div className="vps-demo-main">
          {!activeJobId ? (
            <VpsJobSubmitter onJobSubmitted={handleJobSubmitted} />
          ) : (
            <VpsProgressTracker 
              jobId={activeJobId}
              onJobCompleted={handleJobCompleted}
              onReset={handleReset}
            />
          )}
        </div>

        <div className="vps-demo-sidebar">
          <VpsJobHistory 
            jobs={jobHistory}
            activeJobId={activeJobId}
            onJobSelected={handleJobSelected}
          />
        </div>
      </div>

      <style jsx>{`
        .vps-demo {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .vps-demo-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .vps-demo-header h2 {
          color: #333;
          margin-bottom: 10px;
        }

        .vps-demo-header p {
          color: #666;
          font-size: 16px;
        }

        .vps-demo-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
        }

        .vps-demo-main {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .vps-demo-sidebar {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        @media (max-width: 768px) {
          .vps-demo-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}