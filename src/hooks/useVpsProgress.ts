import { useState, useEffect, useCallback } from 'react';
import { VpsJobProgress } from '@/lib/vps/types';

export interface VpsProgressState {
  isConnected: boolean;
  progress: VpsJobProgress | null;
  error: string | null;
  isComplete: boolean;
}

export interface VpsProgressResult {
  state: VpsProgressState;
  reconnect: () => void;
  disconnect: () => void;
}

export function useVpsProgress(jobId: string | null): VpsProgressResult {
  const [state, setState] = useState<VpsProgressState>({
    isConnected: false,
    progress: null,
    error: null,
    isComplete: false
  });

  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  const disconnect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setState(prev => ({ ...prev, isConnected: false }));
  }, [eventSource]);

  const connect = useCallback(() => {
    if (!jobId) return;

    // Close existing connection
    if (eventSource) {
      eventSource.close();
    }

    const newEventSource = new EventSource(`/api/vps/jobs/${jobId}/progress`);
    setEventSource(newEventSource);

    newEventSource.onopen = () => {
      setState(prev => ({ ...prev, isConnected: true, error: null }));
      setReconnectAttempts(0);
    };

    newEventSource.onmessage = (event) => {
      try {
        const progress: VpsJobProgress = JSON.parse(event.data);
        
        const isComplete = progress.status === 'COMPLETED' || progress.status === 'FAILED';
        
        setState(prev => ({
          ...prev,
          progress,
          isComplete,
          error: progress.status === 'FAILED' ? progress.error || 'Job failed' : null
        }));

        // Close connection when job is complete
        if (isComplete) {
          newEventSource.close();
          setEventSource(null);
        }
      } catch (error) {
        console.error('Failed to parse progress data:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to parse progress data'
        }));
      }
    };

    newEventSource.onerror = (event) => {
      console.error('SSE connection error:', event);
      setState(prev => ({ ...prev, isConnected: false }));
      
      newEventSource.close();
      setEventSource(null);

      // Attempt reconnection with exponential backoff
      if (reconnectAttempts < maxReconnectAttempts && !state.isComplete) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connect();
        }, delay);
      } else {
        setState(prev => ({
          ...prev,
          error: 'Connection failed after multiple attempts'
        }));
      }
    };
  }, [jobId, eventSource, reconnectAttempts, state.isComplete]);

  const reconnect = useCallback(() => {
    setReconnectAttempts(0);
    connect();
  }, [connect]);

  useEffect(() => {
    if (jobId && !eventSource) {
      connect();
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [jobId, connect, eventSource]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    state,
    reconnect,
    disconnect
  };
}