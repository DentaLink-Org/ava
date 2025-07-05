export const vpsConfig = {
  apiUrl: process.env.VPS_API_URL || 'https://69.62.69.181',
  apiKey: process.env.VPS_API_KEY || '',
  apiSecret: process.env.VPS_API_SECRET || '',
  requestTimeout: parseInt(process.env.VPS_REQUEST_TIMEOUT || '30000', 10),
  debug: process.env.VPS_DEBUG === 'true',
  
  endpoints: {
    auth: {
      token: '/api/auth/token',
    },
    jobs: {
      create: '/api/jobs',
      status: (jobId: string) => `/api/jobs/${jobId}`,
      progress: (jobId: string) => `/api/sse/job-progress/${jobId}`,
    },
  },
  
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    retryMultiplier: 2,
  },
} as const;

export type VpsConfig = typeof vpsConfig;