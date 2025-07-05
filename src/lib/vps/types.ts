export interface VpsAuthToken {
  token: string;
  expiresIn: number; // VPS returns expiresIn (seconds)
}

export interface CachedVpsAuthToken {
  token: string;
  expiresAt: string; // Calculated expiration timestamp for caching
}

export interface VpsJobRequest {
  processingType: 'type1' | 'type2' | 'type3';
  data: Record<string, any>[];
  options?: Record<string, any>;
}

export interface VpsJob {
  jobId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  createdAt: string;
  processingType: string;
  dataCount: string;
  startedAt?: string;
  completedAt?: string;
  result?: any;
  processingTime?: string;
}

export interface VpsJobProgress {
  jobId: string;
  progress: number;
  status: string;
  message?: string;
  result?: any;
  error?: string;
  estimatedCompletion?: string;
  processedCount?: number;
  totalCount?: number;
  details?: Record<string, any>;
}

export interface VpsApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

export interface VpsClientOptions {
  apiUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  timeout?: number;
  debug?: boolean;
  onProgress?: (progress: VpsJobProgress) => void;
}

export interface VpsRequestOptions {
  signal?: AbortSignal;
  retries?: number;
  timeout?: number;
}