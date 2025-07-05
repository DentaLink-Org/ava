'use client';

import { useState } from 'react';
import { useVpsJob } from '@/hooks/useVpsJob';
import { VpsJobRequest } from '@/lib/vps/types';

export interface VpsJobSubmitterProps {
  onJobSubmitted: (jobId: string, jobType: string) => void;
}

const JOB_TYPES = [
  { value: 'type1', label: 'Type 1: Simple Processing (100ms per item)' },
  { value: 'type2', label: 'Type 2: Complex Processing (200ms per item)' },
  { value: 'type3', label: 'Type 3: Batch Processing (500ms per batch)' }
];

export function VpsJobSubmitter({ onJobSubmitted }: VpsJobSubmitterProps) {
  const [jobType, setJobType] = useState('type1');
  const [inputData, setInputData] = useState('');
  const [options, setOptions] = useState('{}');

  const { state, submitJob, reset } = useVpsJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputData.trim()) {
      alert('Please enter some data to process');
      return;
    }

    try {
      // Parse input data as JSON array
      let parsedData;
      try {
        parsedData = JSON.parse(inputData);
        if (!Array.isArray(parsedData)) {
          parsedData = [parsedData];
        }
      } catch {
        // If not valid JSON, treat as plain text array
        parsedData = [inputData];
      }

      // Parse options
      let parsedOptions = {};
      try {
        parsedOptions = JSON.parse(options);
      } catch {
        console.warn('Invalid options JSON, using default options');
      }

      const request: VpsJobRequest = {
        processingType: jobType as 'type1' | 'type2' | 'type3',
        data: parsedData,
        options: parsedOptions
      };

      const jobId = await submitJob(request);
      onJobSubmitted(jobId, jobType);
      
      // Reset form
      setInputData('');
      setOptions('{}');
      reset();
    } catch (error) {
      console.error('Job submission failed:', error);
      // Error is already handled by the hook
    }
  };

  return (
    <div className="vps-job-submitter">
      <h3>Submit Processing Job</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="jobType">Processing Type</label>
          <select
            id="jobType"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            disabled={state.isSubmitting}
          >
            {JOB_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="inputData">Input Data</label>
          <textarea
            id="inputData"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder='[{"id": 1, "name": "item1"}, {"id": 2, "name": "item2"}]'
            rows={8}
            disabled={state.isSubmitting}
            required
          />
          <small className="form-help">
            Enter JSON array with objects. Example: {`[{"id": 1, "name": "item1"}, {"id": 2, "name": "item2"}]`}
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="options">Processing Options (JSON)</label>
          <textarea
            id="options"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder='{"priority": "high", "timeout": 300}'
            rows={3}
            disabled={state.isSubmitting}
          />
          <small className="form-help">
            Optional JSON object with processing parameters
          </small>
        </div>

        {state.error && (
          <div className="error-message">
            <strong>Error:</strong> {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={state.isSubmitting}
          className="submit-button"
        >
          {state.isSubmitting ? 'Submitting...' : 'Submit Job'}
        </button>
      </form>

      <style jsx>{`
        .vps-job-submitter h3 {
          margin-bottom: 20px;
          color: #333;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #555;
        }

        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #0070f3;
        }

        .form-group textarea {
          font-family: 'Monaco', 'Menlo', monospace;
          resize: vertical;
        }

        .form-help {
          display: block;
          margin-top: 5px;
          color: #666;
          font-size: 12px;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 15px;
        }

        .submit-button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          width: 100%;
        }

        .submit-button:hover:not(:disabled) {
          background: #0051a5;
        }

        .submit-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}