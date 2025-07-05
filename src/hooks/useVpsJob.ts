import { useState, useCallback } from 'react';
import { VpsJobRequest } from '@/lib/vps/types';

export interface VpsJobSubmissionState {
  isSubmitting: boolean;
  jobId: string | null;
  error: string | null;
}

export interface VpsJobSubmissionResult {
  state: VpsJobSubmissionState;
  submitJob: (request: VpsJobRequest) => Promise<string>;
  reset: () => void;
}

export function useVpsJob(): VpsJobSubmissionResult {
  const [state, setState] = useState<VpsJobSubmissionState>({
    isSubmitting: false,
    jobId: null,
    error: null
  });

  const submitJob = useCallback(async (request: VpsJobRequest): Promise<string> => {
    setState(prev => ({
      ...prev,
      isSubmitting: true,
      error: null
    }));

    try {
      const response = await fetch('/api/vps/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Job submission failed');
      }

      const jobId = data.jobId;
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        jobId,
        error: null
      }));

      return jobId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isSubmitting: false,
      jobId: null,
      error: null
    });
  }, []);

  return {
    state,
    submitJob,
    reset
  };
}