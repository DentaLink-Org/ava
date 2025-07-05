import { vpsConfig } from '@/config/vps';
import { HttpClient } from './http-client';
import { AuthManager } from './auth-manager';
import {
  VpsClientOptions,
  VpsJob,
  VpsJobRequest,
  VpsRequestOptions,
  VpsJobProgress,
} from './types';
import { debugLog, VpsError } from './utils';

export class VpsClient {
  private httpClient: HttpClient;
  private authManager: AuthManager;
  private options: Required<VpsClientOptions>;
  private sseConnections: Map<string, EventSource> = new Map();

  constructor(options: VpsClientOptions = {}) {
    this.options = {
      apiUrl: options.apiUrl || vpsConfig.apiUrl,
      apiKey: options.apiKey || vpsConfig.apiKey,
      apiSecret: options.apiSecret || vpsConfig.apiSecret,
      timeout: options.timeout || vpsConfig.requestTimeout,
      debug: options.debug || vpsConfig.debug,
      onProgress: options.onProgress || (() => {}),
    };

    this.httpClient = new HttpClient(
      this.options.apiUrl,
      {},
      this.options.timeout,
      this.options.debug
    );

    this.authManager = new AuthManager(
      this.httpClient,
      this.options.apiKey,
      this.options.apiSecret,
      this.options.debug
    );

    this.validateConfiguration();
  }

  private validateConfiguration(): void {
    if (!this.options.apiKey) {
      throw new VpsError('VPS API key is required');
    }
    if (!this.options.apiSecret) {
      throw new VpsError('VPS API secret is required');
    }
  }

  private async ensureAuthenticated(options?: VpsRequestOptions): Promise<void> {
    const token = await this.authManager.getToken(options);
    this.httpClient.setHeader('Authorization', `Bearer ${token}`);
  }

  async submitJob(
    request: VpsJobRequest,
    options?: VpsRequestOptions
  ): Promise<VpsJob> {
    debugLog(this.options.debug, 'Submitting job:', request);
    
    await this.ensureAuthenticated(options);
    
    const job = await this.httpClient.post<VpsJob>(
      vpsConfig.endpoints.jobs.create,
      request,
      options
    );
    
    debugLog(this.options.debug, 'Job submitted:', job.jobId);
    return job;
  }

  async getJobStatus(
    jobId: string,
    options?: VpsRequestOptions
  ): Promise<VpsJob> {
    debugLog(this.options.debug, 'Getting job status:', jobId);
    
    await this.ensureAuthenticated(options);
    
    const job = await this.httpClient.get<VpsJob>(
      vpsConfig.endpoints.jobs.status(jobId),
      options
    );
    
    debugLog(this.options.debug, 'Job status:', job.status);
    return job;
  }

  async waitForCompletion(
    jobId: string,
    options?: VpsRequestOptions & { pollInterval?: number }
  ): Promise<VpsJob> {
    const pollInterval = options?.pollInterval || 2000;
    
    debugLog(this.options.debug, 'Waiting for job completion:', jobId);
    
    while (true) {
      const job = await this.getJobStatus(jobId, options);
      
      if (job.status === 'COMPLETED' || job.status === 'FAILED') {
        debugLog(this.options.debug, 'Job finished:', job.status);
        return job;
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  trackProgress(
    jobId: string,
    onProgress?: (progress: VpsJobProgress) => void
  ): () => void {
    debugLog(this.options.debug, 'Starting progress tracking:', jobId);
    
    // Close any existing connection for this job
    this.stopProgressTracking(jobId);
    
    const progressCallback = onProgress || this.options.onProgress;
    const url = `${this.options.apiUrl}${vpsConfig.endpoints.jobs.progress(jobId)}`;
    
    // Get auth token first
    this.authManager.getToken().then(token => {
      const eventSource = new EventSource(`${url}?token=${encodeURIComponent(token)}`);
      
      eventSource.onmessage = (event) => {
        try {
          const progress = JSON.parse(event.data) as VpsJobProgress;
          debugLog(this.options.debug, 'Progress update:', progress);
          progressCallback(progress);
        } catch (error) {
          debugLog(this.options.debug, 'Error parsing progress data:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        debugLog(this.options.debug, 'SSE error:', error);
        eventSource.close();
        this.sseConnections.delete(jobId);
      };
      
      this.sseConnections.set(jobId, eventSource);
    }).catch(error => {
      debugLog(this.options.debug, 'Failed to get auth token for SSE:', error);
    });
    
    // Return cleanup function
    return () => this.stopProgressTracking(jobId);
  }

  stopProgressTracking(jobId: string): void {
    const connection = this.sseConnections.get(jobId);
    if (connection) {
      debugLog(this.options.debug, 'Stopping progress tracking:', jobId);
      connection.close();
      this.sseConnections.delete(jobId);
    }
  }

  stopAllProgressTracking(): void {
    debugLog(this.options.debug, 'Stopping all progress tracking');
    this.sseConnections.forEach(connection => connection.close());
    this.sseConnections.clear();
  }

  async submitAndTrack(
    request: VpsJobRequest,
    options?: VpsRequestOptions
  ): Promise<{
    job: VpsJob;
    stopTracking: () => void;
    completion: Promise<VpsJob>;
  }> {
    const job = await this.submitJob(request, options);
    const stopTracking = this.trackProgress(job.jobId);
    const completion = this.waitForCompletion(job.jobId, options);
    
    return { job, stopTracking, completion };
  }

  async getAuthToken(options?: VpsRequestOptions): Promise<string> {
    return await this.authManager.getToken(options);
  }

  clearAuth(): void {
    this.authManager.clearToken();
    this.httpClient.removeHeader('Authorization');
  }

  destroy(): void {
    this.stopAllProgressTracking();
    this.clearAuth();
  }
}