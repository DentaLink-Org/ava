import { vpsConfig } from '@/config/vps';
import { HttpClient, HttpRequestOptions } from './http-client';
import { VpsAuthToken, CachedVpsAuthToken, VpsRequestOptions } from './types';
import { isTokenExpired, debugLog } from './utils';

export class AuthManager {
  private httpClient: HttpClient;
  private apiKey: string;
  private apiSecret: string;
  private currentToken: CachedVpsAuthToken | null = null;
  private tokenPromise: Promise<CachedVpsAuthToken> | null = null;
  private debug: boolean;

  constructor(
    httpClient: HttpClient,
    apiKey: string,
    apiSecret: string,
    debug: boolean = false
  ) {
    this.httpClient = httpClient;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.debug = debug;
  }

  async getToken(options?: VpsRequestOptions): Promise<string> {
    // If we have a valid token, return it
    if (this.currentToken && !isTokenExpired(this.currentToken.expiresAt)) {
      debugLog(this.debug, 'Using cached token');
      return this.currentToken.token;
    }

    // If a token request is already in progress, wait for it
    if (this.tokenPromise) {
      debugLog(this.debug, 'Waiting for in-progress token request');
      const token = await this.tokenPromise;
      return token.token;
    }

    // Request a new token
    debugLog(this.debug, 'Requesting new token');
    this.tokenPromise = this.requestNewToken(options);
    
    try {
      this.currentToken = await this.tokenPromise;
      return this.currentToken.token;
    } finally {
      this.tokenPromise = null;
    }
  }

  private async requestNewToken(options?: VpsRequestOptions): Promise<CachedVpsAuthToken> {
    const requestOptions: HttpRequestOptions = {
      ...options,
      headers: {
        'X-API-Key': this.apiKey, // Send API key as header, not body
      },
    };

    const response = await this.httpClient.post<VpsAuthToken>(
      vpsConfig.endpoints.auth.token,
      {}, // Empty body - API key should be in headers
      requestOptions
    );

    // Convert expiresIn (seconds) to expiresAt (timestamp)
    const expiresAt = new Date(Date.now() + (response.expiresIn * 1000)).toISOString();
    
    debugLog(this.debug, 'Token received, expires at:', expiresAt);
    
    return {
      token: response.token,
      expiresAt
    };
  }

  clearToken(): void {
    debugLog(this.debug, 'Clearing cached token');
    this.currentToken = null;
    this.tokenPromise = null;
  }

  async ensureValidToken(options?: VpsRequestOptions): Promise<void> {
    await this.getToken(options);
  }
}