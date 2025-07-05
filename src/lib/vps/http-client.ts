import { vpsConfig } from '@/config/vps';
import { VpsRequestOptions } from './types';
import { VpsError, createAbortSignal, createRetryDelay, delay, debugLog, parseApiError } from './utils';

export interface HttpRequestOptions extends VpsRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  baseUrl?: string;
}

export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private debug: boolean;

  constructor(
    baseUrl: string = vpsConfig.apiUrl,
    defaultHeaders: Record<string, string> = {},
    timeout: number = vpsConfig.requestTimeout,
    debug: boolean = vpsConfig.debug
  ) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
    this.timeout = timeout;
    this.debug = debug;
  }

  async request<T = any>(
    endpoint: string,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      signal,
      retries = vpsConfig.retryConfig.maxRetries,
      timeout = this.timeout,
      baseUrl = this.baseUrl,
    } = options;

    const url = `${baseUrl}${endpoint}`;
    const finalHeaders = { ...this.defaultHeaders, ...headers };
    
    debugLog(this.debug, `${method} ${url}`, { headers: finalHeaders, body });

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        const abortSignal = signal || createAbortSignal(timeout);
        
        const response = await fetch(url, {
          method,
          headers: finalHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: abortSignal,
        });

        const responseData = await response.json().catch(() => null);
        
        debugLog(this.debug, `Response ${response.status}:`, responseData);

        if (!response.ok) {
          const error = parseApiError(responseData || {
            error: 'Request failed',
            message: `HTTP ${response.status}: ${response.statusText}`,
            statusCode: response.status,
          });
          
          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            throw error;
          }
          
          lastError = error;
          
          if (attempt <= retries) {
            const retryDelay = createRetryDelay(
              attempt,
              vpsConfig.retryConfig.retryDelay,
              vpsConfig.retryConfig.retryMultiplier
            );
            debugLog(this.debug, `Retrying in ${retryDelay}ms (attempt ${attempt}/${retries})`);
            await delay(retryDelay);
            continue;
          }
        }

        return responseData as T;
      } catch (error: any) {
        debugLog(this.debug, `Request error:`, error);
        
        if (error.name === 'AbortError') {
          throw new VpsError('Request timeout', 408);
        }
        
        if (error instanceof VpsError) {
          throw error;
        }
        
        lastError = error;
        
        if (attempt <= retries) {
          const retryDelay = createRetryDelay(
            attempt,
            vpsConfig.retryConfig.retryDelay,
            vpsConfig.retryConfig.retryMultiplier
          );
          debugLog(this.debug, `Retrying in ${retryDelay}ms (attempt ${attempt}/${retries})`);
          await delay(retryDelay);
          continue;
        }
      }
    }

    throw lastError || new VpsError('Request failed after retries');
  }

  get<T = any>(endpoint: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T = any>(endpoint: string, body?: any, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  delete<T = any>(endpoint: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }
}