import { useState, useEffect, useCallback } from 'react';
import { VpsClient } from '@/lib/vps';
import { VpsJob, VpsJobRequest, VpsRequestOptions } from '@/lib/vps/types';

export interface VpsClientState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface VpsClientResult {
  client: VpsClient | null;
  state: VpsClientState;
  submitJob: (request: VpsJobRequest, options?: VpsRequestOptions) => Promise<VpsJob>;
  getJobStatus: (jobId: string, options?: VpsRequestOptions) => Promise<VpsJob>;
  authenticate: () => Promise<void>;
  clearError: () => void;
}

export function useVpsClient(): VpsClientResult {
  const [client, setClient] = useState<VpsClient | null>(null);
  const [state, setState] = useState<VpsClientState>({
    isInitialized: false,
    isAuthenticated: false,
    error: null
  });

  const initializeClient = useCallback(async () => {
    try {
      const vpsClient = new VpsClient();
      setClient(vpsClient);
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize VPS client';
      setState(prev => ({
        ...prev,
        isInitialized: false,
        error: errorMessage
      }));
    }
  }, []);

  const authenticate = useCallback(async () => {
    if (!client) {
      throw new Error('VPS client not initialized');
    }

    try {
      await client.getAuthToken();
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [client]);

  const submitJob = useCallback(async (request: VpsJobRequest, options?: VpsRequestOptions): Promise<VpsJob> => {
    if (!client) {
      throw new Error('VPS client not initialized');
    }

    try {
      const job = await client.submitJob(request, options);
      setState(prev => ({ ...prev, error: null }));
      return job;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Job submission failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [client]);

  const getJobStatus = useCallback(async (jobId: string, options?: VpsRequestOptions): Promise<VpsJob> => {
    if (!client) {
      throw new Error('VPS client not initialized');
    }

    try {
      const job = await client.getJobStatus(jobId, options);
      setState(prev => ({ ...prev, error: null }));
      return job;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get job status';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [client]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    initializeClient();
  }, [initializeClient]);

  // Clean up client on unmount
  useEffect(() => {
    return () => {
      if (client) {
        client.destroy();
      }
    };
  }, [client]);

  return {
    client,
    state,
    submitJob,
    getJobStatus,
    authenticate,
    clearError
  };
}