# VERCEL_DEVELOPER_GUIDE.md - Frontend Implementation

## Overview

You are responsible for implementing the Vercel/Next.js frontend that communicates with a VPS backend API. The system uses Server-Sent Events (SSE) for real-time progress updates and JWT authentication for secure communication.

## System Architecture

Your Vercel app will:
1. Submit data processing jobs to the VPS API
2. Receive job IDs and track progress via SSE
3. Display real-time updates to users
4. Handle authentication and error states

## VPS API Endpoints (What You'll Connect To)

The VPS developer will provide these endpoints:

```
Base URL: https://your-vps-domain.com

Health Check:
GET /health
Response: { status: "healthy", timestamp: "2024-01-01T00:00:00Z" }

Authentication:
POST /api/auth/token
Headers: { "X-API-Key": "your-api-key" }
Response: { token: "jwt-token", expiresIn: 1800 }

Submit Job:
POST /api/jobs
Headers: { "Authorization": "Bearer jwt-token" }
Body: { processingType: "type1", data: [...], options: {} }
Response: { jobId: "job_xxx", status: "PENDING" }

Get Job Status:
GET /api/jobs/:jobId
Headers: { "Authorization": "Bearer jwt-token" }
Response: { jobId: "job_xxx", status: "PROCESSING", progress: 45, ... }

SSE Progress Stream:
GET /api/sse/job-progress/:jobId
Headers: { "Authorization": "Bearer jwt-token" }
Response: Server-Sent Events stream
```

## Implementation Steps

### Step 1: Environment Configuration

Add these variables to your Vercel project:

```bash
# Production Environment Variables
VPS_API_URL=https://your-vps-domain.com
VPS_API_KEY=your-secure-api-key-from-vps-team
JWT_SECRET=same-jwt-secret-as-vps
NEXT_PUBLIC_VPS_API_URL=https://your-vps-domain.com

# Development Environment Variables (for local testing)
DEV_VPS_API_URL=http://localhost:3000
DEV_VPS_API_KEY=dev-api-key
```

### Step 2: Create API Client Library

Create `lib/vpsClient.js`:

```javascript
// Singleton VPS API client with token caching
class VPSClient {
  constructor() {
    this.baseURL = process.env.VPS_API_URL || process.env.DEV_VPS_API_URL;
    this.apiKey = process.env.VPS_API_KEY || process.env.DEV_VPS_API_KEY;
    this.tokenCache = null;
    this.tokenExpiry = null;
  }

  async getAuthToken() {
    // Return cached token if still valid
    if (this.tokenCache && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.tokenCache;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status}`);
      }

      const { token, expiresIn } = await response.json();
      
      // Cache token with 5-minute buffer before expiry
      this.tokenCache = token;
      this.tokenExpiry = new Date(Date.now() + (expiresIn - 300) * 1000);
      
      return token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      throw error;
    }
  }

  async request(endpoint, options = {}) {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseURL}/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`VPS API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async submitJob(data) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getJobStatus(jobId) {
    return this.request(`/jobs/${jobId}`);
  }
}

export const vpsClient = new VPSClient();
```

### Step 3: Create API Routes

Create `pages/api/submit-job.js`:

```javascript
import { vpsClient } from '../../lib/vpsClient';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const { processingType, data } = req.body;
    
    if (!processingType || !data || !Array.isArray(data)) {
      return res.status(400).json({ 
        error: 'Invalid request. Required: processingType, data (array)' 
      });
    }

    // Submit job to VPS
    const result = await vpsClient.submitJob(req.body);
    
    // Return 202 Accepted with job details
    res.status(202).json({
      message: 'Job submitted successfully',
      ...result
    });
  } catch (error) {
    console.error('Job submission error:', error);
    
    // Return appropriate error status
    if (error.message.includes('401')) {
      res.status(401).json({ error: 'Authentication failed' });
    } else if (error.message.includes('400')) {
      res.status(400).json({ error: 'Invalid job data' });
    } else {
      res.status(503).json({ error: 'VPS service unavailable' });
    }
  }
}

// Configure API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Adjust based on your data size needs
    }
  }
};
```

Create `pages/api/job-status/[jobId].js`:

```javascript
import { vpsClient } from '../../../lib/vpsClient';

export default async function handler(req, res) {
  const { jobId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const status = await vpsClient.getJobStatus(jobId);
    res.status(200).json(status);
  } catch (error) {
    console.error('Status fetch error:', error);
    
    if (error.message.includes('404')) {
      res.status(404).json({ error: 'Job not found' });
    } else {
      res.status(503).json({ error: 'Unable to fetch job status' });
    }
  }
}
```

Create `pages/api/job-progress.js` for SSE proxy:

```javascript
export default async function handler(req, res) {
  const { jobId } = req.query;

  if (!jobId) {
    return res.status(400).json({ error: 'Job ID required' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Disable buffering
  });

  // Get auth token
  let token;
  try {
    const { vpsClient } = await import('../../lib/vpsClient');
    token = await vpsClient.getAuthToken();
  } catch (error) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Authentication failed' })}\n\n`);
    res.end();
    return;
  }

  try {
    // Connect to VPS SSE endpoint
    const vpsUrl = `${process.env.VPS_API_URL}/api/sse/job-progress/${jobId}`;
    const response = await fetch(vpsUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream'
      }
    });

    if (!response.ok) {
      throw new Error(`VPS SSE connection failed: ${response.status}`);
    }

    // Pipe VPS SSE to client
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        res.write(chunk);
      }
    } catch (error) {
      console.error('SSE streaming error:', error);
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('SSE connection error:', error);
    res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
  } finally {
    res.end();
  }
}

// Disable body parser for streaming
export const config = {
  api: {
    bodyParser: false
  }
};
```

### Step 4: Create React Hooks

Create `hooks/useJobProgress.js`:

```javascript
import { useEffect, useState, useCallback } from 'react';

export function useJobProgress(jobId) {
  const [state, setState] = useState({
    status: null,
    progress: 0,
    result: null,
    error: null,
    isComplete: false,
    isConnected: false
  });

  useEffect(() => {
    if (!jobId) return;

    let eventSource;
    let reconnectTimeout;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connect = () => {
      eventSource = new EventSource(`/api/job-progress?jobId=${jobId}`);
      
      eventSource.addEventListener('connected', () => {
        setState(prev => ({ ...prev, isConnected: true, error: null }));
        reconnectAttempts = 0;
      });

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          setState(prev => ({
            ...prev,
            status: data.status,
            progress: parseInt(data.progress) || 0,
            result: data.result ? JSON.parse(data.result) : null,
            isComplete: data.status === 'COMPLETED' || data.status === 'FAILED',
            error: data.status === 'FAILED' ? data.error : null
          }));

          // Close connection when job is done
          if (data.status === 'COMPLETED' || data.status === 'FAILED') {
            eventSource.close();
          }
        } catch (error) {
          console.error('Failed to parse SSE data:', error);
        }
      };

      eventSource.addEventListener('error', (event) => {
        setState(prev => ({ ...prev, isConnected: false }));
        
        if (event.data) {
          const errorData = JSON.parse(event.data);
          setState(prev => ({ ...prev, error: errorData.error }));
        }

        eventSource.close();

        // Attempt reconnection with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts && !state.isComplete) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectTimeout = setTimeout(() => {
            reconnectAttempts++;
            connect();
          }, delay);
        }
      });
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [jobId]);

  return state;
}
```

Create `hooks/useJobSubmission.js`:

```javascript
import { useState, useCallback } from 'react';

export function useJobSubmission() {
  const [state, setState] = useState({
    isSubmitting: false,
    jobId: null,
    error: null
  });

  const submitJob = useCallback(async (jobData) => {
    setState({ isSubmitting: true, jobId: null, error: null });

    try {
      const response = await fetch('/api/submit-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Job submission failed');
      }

      setState({
        isSubmitting: false,
        jobId: data.jobId,
        error: null
      });

      return data.jobId;
    } catch (error) {
      setState({
        isSubmitting: false,
        jobId: null,
        error: error.message
      });
      throw error;
    }
  }, []);

  return {
    ...state,
    submitJob
  };
}
```

### Step 5: Create UI Components

Create `components/JobProcessor.js`:

```javascript
import { useState } from 'react';
import { useJobSubmission } from '../hooks/useJobSubmission';
import { useJobProgress } from '../hooks/useJobProgress';

export default function JobProcessor() {
  const [activeJobId, setActiveJobId] = useState(null);
  const { submitJob, isSubmitting, error: submitError } = useJobSubmission();
  const { 
    status, 
    progress, 
    result, 
    error: progressError, 
    isComplete,
    isConnected 
  } = useJobProgress(activeJobId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Example job data - customize based on your needs
      const jobData = {
        processingType: 'type1',
        data: [
          { id: 1, value: 'item1' },
          { id: 2, value: 'item2' }
        ],
        options: {
          priority: 'normal'
        }
      };

      const jobId = await submitJob(jobData);
      setActiveJobId(jobId);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  return (
    <div className="job-processor">
      <h2>Data Processing</h2>
      
      {/* Submit Form */}
      {!activeJobId && (
        <form onSubmit={handleSubmit}>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Submitting...' : 'Start Processing'}
          </button>
          
          {submitError && (
            <div className="error">
              Submission Error: {submitError}
            </div>
          )}
        </form>
      )}

      {/* Progress Display */}
      {activeJobId && (
        <div className="progress-container">
          <h3>Job ID: {activeJobId}</h3>
          
          <div className="connection-status">
            Connection: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
          
          <div className="status">
            Status: <strong>{status || 'Waiting...'}</strong>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
            <span className="progress-text">{progress}%</span>
          </div>
          
          {progressError && (
            <div className="error">
              Error: {progressError}
            </div>
          )}
          
          {isComplete && result && (
            <div className="result">
              <h4>Processing Complete!</h4>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
          
          {isComplete && (
            <button 
              onClick={() => setActiveJobId(null)}
              className="reset-button"
            >
              Process Another Job
            </button>
          )}
        </div>
      )}
      
      <style jsx>{`
        .job-processor {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .submit-button, .reset-button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .submit-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .progress-container {
          margin-top: 20px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        
        .connection-status {
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .status {
          margin: 10px 0;
        }
        
        .progress-bar {
          position: relative;
          height: 30px;
          background: #f0f0f0;
          border-radius: 15px;
          overflow: hidden;
          margin: 10px 0;
        }
        
        .progress-fill {
          position: absolute;
          height: 100%;
          background: #0070f3;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: bold;
        }
        
        .error {
          color: #ff0000;
          margin: 10px 0;
          padding: 10px;
          background: #ffeeee;
          border-radius: 5px;
        }
        
        .result {
          margin-top: 20px;
          padding: 10px;
          background: #f0fff0;
          border-radius: 5px;
        }
        
        .result pre {
          margin: 10px 0;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}
```

### Step 6: Error Handling and Retry Logic

Create `lib/errorHandler.js`:

```javascript
export class APIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function handleAPIError(error) {
  // Network errors
  if (error.message.includes('fetch')) {
    return new APIError(
      'Unable to connect to processing server',
      503,
      'NETWORK_ERROR'
    );
  }
  
  // Auth errors
  if (error.status === 401) {
    return new APIError(
      'Authentication failed. Please try again.',
      401,
      'AUTH_ERROR'
    );
  }
  
  // Rate limiting
  if (error.status === 429) {
    return new APIError(
      'Too many requests. Please wait and try again.',
      429,
      'RATE_LIMIT'
    );
  }
  
  // Server errors
  if (error.status >= 500) {
    return new APIError(
      'Server error. Please try again later.',
      error.status,
      'SERVER_ERROR'
    );
  }
  
  return error;
}

export async function retryWithBackoff(fn, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

### Step 7: Testing

Create `__tests__/vpsClient.test.js`:

```javascript
import { vpsClient } from '../lib/vpsClient';

describe('VPS Client', () => {
  it('should get auth token', async () => {
    const token = await vpsClient.getAuthToken();
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  it('should submit job', async () => {
    const jobData = {
      processingType: 'type1',
      data: [{ test: true }]
    };
    
    const result = await vpsClient.submitJob(jobData);
    expect(result.jobId).toBeTruthy();
    expect(result.status).toBe('PENDING');
  });

  it('should handle errors gracefully', async () => {
    await expect(
      vpsClient.request('/invalid-endpoint')
    ).rejects.toThrow();
  });
});
```

## Deployment Checklist

- [ ] All environment variables are set in Vercel dashboard
- [ ] API routes are tested with the actual VPS endpoints
- [ ] SSE connection works and reconnects on failure
- [ ] Error states are handled gracefully
- [ ] UI provides clear feedback during processing
- [ ] Rate limiting is respected
- [ ] Authentication tokens are cached appropriately

## API Integration Points

Ensure these match exactly with VPS implementation:

1. **Authentication Header**: Always `Authorization: Bearer <token>`
2. **API Key Header**: Always `X-API-Key: <your-api-key>` for token endpoint
3. **Content Type**: Always `application/json` for POST requests
4. **SSE Events**: Listen for standard `message` events and custom `error` events
5. **Job Status Values**: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify VPS allows your Vercel domain
   - Check both production and preview URLs are allowed

2. **SSE Not Working**
   - Ensure you're using the streaming API route
   - Check browser DevTools for EventSource errors
   - Verify authentication token is valid

3. **Authentication Failures**
   - Confirm API key matches VPS configuration
   - Check token expiration handling
   - Verify environment variables are set

4. **Timeout Errors**
   - Vercel functions have max 15-minute timeout
   - For longer processes, rely on SSE updates
   - Implement proper timeout handling

### Debug Mode

Add this to your `.env.local` for debugging:

```bash
NEXT_PUBLIC_DEBUG=true
```

Then add logging:

```javascript
if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
  console.log('API Request:', endpoint, options);
  console.log('API Response:', response);
}
```

## Support

Contact the VPS developer for:
- API key and authentication issues
- Endpoint availability problems
- Data format questions
- Performance concerns

Your responsibilities:
- Frontend implementation
- User experience
- Error handling on client side
- SSE connection management