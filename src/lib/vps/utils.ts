import { VpsApiError } from './types';

export class VpsError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'VpsError';
  }
}

export function isVpsApiError(error: any): error is VpsApiError {
  return (
    error &&
    typeof error === 'object' &&
    'error' in error &&
    'message' in error &&
    'statusCode' in error
  );
}

export function parseApiError(error: any): VpsError {
  if (isVpsApiError(error)) {
    return new VpsError(error.message, error.statusCode, error.details);
  }
  
  if (error instanceof Error) {
    return new VpsError(error.message);
  }
  
  return new VpsError('An unknown error occurred');
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createRetryDelay(attempt: number, baseDelay: number, multiplier: number): number {
  return Math.min(baseDelay * Math.pow(multiplier, attempt - 1), 30000);
}

export function debugLog(debug: boolean, ...args: any[]): void {
  if (debug) {
    console.log('[VPS Client]', ...args);
  }
}

export function isTokenExpired(expiresAt: string): boolean {
  const expirationTime = new Date(expiresAt).getTime();
  const currentTime = new Date().getTime();
  const bufferTime = 60 * 1000; // 1 minute buffer
  
  return currentTime >= expirationTime - bufferTime;
}

export function createAbortSignal(timeout: number): AbortSignal {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  // Clean up timeout when signal is aborted
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  });
  
  return controller.signal;
}