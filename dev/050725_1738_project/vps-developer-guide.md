# VPS_DEVELOPER_GUIDE.md - Backend Implementation

## Overview

You are responsible for implementing the VPS backend API that will process data and provide real-time updates to a Vercel-hosted frontend. The system must support JWT authentication, background job processing, and Server-Sent Events (SSE) for progress tracking.

## System Architecture

Your VPS server will:
1. Accept authenticated API requests from Vercel
2. Queue data processing jobs using Redis
3. Process jobs asynchronously with progress tracking
4. Stream real-time updates via SSE
5. Handle high concurrency and implement security measures

## API Contract (What You Must Provide)

The Vercel frontend expects these exact endpoints:

```
Base URL: https://your-domain.com

1. Health Check
   GET /health
   Response: 200 OK
   Body: { "status": "healthy", "timestamp": "ISO-8601-date" }

2. Get Authentication Token
   POST /api/auth/token
   Headers: { "X-API-Key": "shared-api-key" }
   Response: 200 OK
   Body: { "token": "jwt-token", "expiresIn": 1800 }

3. Submit Processing Job
   POST /api/jobs
   Headers: { "Authorization": "Bearer jwt-token" }
   Body: { "processingType": "string", "data": [...], "options": {} }
   Response: 202 Accepted
   Body: { "jobId": "job_unique_id", "status": "PENDING" }

4. Get Job Status
   GET /api/jobs/:jobId
   Headers: { "Authorization": "Bearer jwt-token" }
   Response: 200 OK
   Body: { 
     "jobId": "string",
     "status": "PENDING|PROCESSING|COMPLETED|FAILED",
     "progress": 0-100,
     "createdAt": "ISO-8601",
     "result": {...} // if completed
     "error": "string" // if failed
   }

5. SSE Progress Stream
   GET /api/sse/job-progress/:jobId
   Headers: { "Authorization": "Bearer jwt-token" }
   Response: SSE stream with progress updates
```

## Server Setup Instructions

### Step 1: Initial VPS Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl git build-essential nginx redis-server certbot python3-certbot-nginx ufw fail2ban

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/vps-api
sudo chown $USER:$USER /var/www/vps-api
cd /var/www/vps-api
```

### Step 2: Project Structure

Create this directory structure:

```
/var/www/vps-api/
├── server.js
├── package.json
├── .env
├── ecosystem.config.js
├── config/
│   ├── redis.js
│   └── jwt.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── validation.js
├── routes/
│   ├── auth.js
│   ├── jobs.js
│   └── sse.js
├── services/
│   ├── jobQueue.js
│   └── jobProcessor.js
├── utils/
│   └── logger.js
└── logs/
```

### Step 3: Package Configuration

Create `package.json`:

```json
{
  "name": "vps-api-server",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bullmq": "^4.0.0",
    "redis": "^4.6.0",
    "express-rate-limit": "^6.7.0",
    "rate-limit-redis": "^3.0.1",
    "dotenv": "^16.0.3",
    "joi": "^17.9.0",
    "winston": "^3.8.0",
    "express-async-errors": "^3.1.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0"
  }
}
```

### Step 4: Environment Configuration

Create `.env`:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Security
JWT_SECRET=generate-a-very-secure-random-string-here
JWT_EXPIRES_IN=30m
API_KEY=shared-secret-key-with-vercel-team

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Step 5: Main Server Implementation

Create `server.js`:

```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import 'express-async-errors';
import { createClient } from 'redis';
import { authRouter } from './routes/auth.js';
import { jobsRouter } from './routes/jobs.js';
import { sseRouter } from './routes/sse.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Redis client for app-wide use
export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  password: process.env.REDIS_PASSWORD || undefined
});

// Connect to Redis
redisClient.on('error', err => logger.error('Redis Client Error', err));
await redisClient.connect();
logger.info('Connected to Redis');

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Rate limiting on API routes
app.use('/api', rateLimiter);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/sse', sseRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`VPS API Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Allowed origins: ${process.env.ALLOWED_ORIGINS}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await redisClient.quit();
  process.exit(0);
});
```

### Step 6: Authentication Implementation

Create `middleware/auth.js`:

```javascript
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export const generateToken = (payload) => {
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN,
      issuer: 'vps-api'
    }
  );
  
  return token;
};

export const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    logger.warn('Invalid API key attempt', { ip: req.ip });
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    logger.error('JWT verification failed', { error: error.message });
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

Create `routes/auth.js`:

```javascript
import { Router } from 'express';
import { generateToken, verifyApiKey } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

export const authRouter = Router();

authRouter.post('/token', verifyApiKey, (req, res) => {
  try {
    // Generate token with client identifier
    const token = generateToken({
      client: 'vercel-app',
      timestamp: Date.now()
    });
    
    // Calculate expiry in seconds
    const expiresIn = 30 * 60; // 30 minutes
    
    logger.info('Token generated for Vercel client');
    
    res.json({
      token,
      expiresIn
    });
  } catch (error) {
    logger.error('Token generation failed', { error: error.message });
    res.status(500).json({ error: 'Failed to generate token' });
  }
});
```

### Step 7: Job Queue Implementation

Create `services/jobQueue.js`:

```javascript
import { Queue, Worker } from 'bullmq';
import { redisClient } from '../server.js';
import { logger } from '../utils/logger.js';

// Queue configuration
const queueConfig = {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 500,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
};

// Create queue
export const processingQueue = new Queue('data-processing', queueConfig);

// Job management functions
export const createJob = async (jobData) => {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Store initial job metadata
  const jobMeta = {
    status: 'PENDING',
    progress: 0,
    createdAt: new Date().toISOString(),
    processingType: jobData.processingType,
    dataCount: jobData.data.length
  };
  
  await redisClient.hSet(`job:${jobId}`, jobMeta);
  
  // Add to queue
  await processingQueue.add(jobId, {
    jobId,
    ...jobData
  });
  
  logger.info('Job created', { jobId, processingType: jobData.processingType });
  
  return { jobId, status: 'PENDING' };
};

export const getJobStatus = async (jobId) => {
  const jobData = await redisClient.hGetAll(`job:${jobId}`);
  
  if (!jobData || Object.keys(jobData).length === 0) {
    return null;
  }
  
  // Parse result if completed
  if (jobData.result) {
    try {
      jobData.result = JSON.parse(jobData.result);
    } catch (e) {
      // Keep as string if not valid JSON
    }
  }
  
  return jobData;
};

// Create worker
const worker = new Worker('data-processing', async (job) => {
  const { jobId, data, processingType, options } = job.data;
  
  logger.info('Processing job', { jobId, processingType });
  
  try {
    // Update status to processing
    await redisClient.hSet(`job:${jobId}`, {
      status: 'PROCESSING',
      startedAt: new Date().toISOString()
    });
    
    // Process data based on type
    let result;
    switch (processingType) {
      case 'type1':
        result = await processType1(data, job, jobId);
        break;
      case 'type2':
        result = await processType2(data, job, jobId);
        break;
      case 'type3':
        result = await processType3(data, job, jobId);
        break;
      default:
        throw new Error(`Unknown processing type: ${processingType}`);
    }
    
    // Store completion
    await redisClient.hSet(`job:${jobId}`, {
      status: 'COMPLETED',
      progress: 100,
      completedAt: new Date().toISOString(),
      result: JSON.stringify(result),
      processingTime: Date.now() - new Date(job.timestamp).getTime()
    });
    
    logger.info('Job completed', { jobId, processingType });
    return result;
    
  } catch (error) {
    logger.error('Job failed', { jobId, error: error.message });
    
    await redisClient.hSet(`job:${jobId}`, {
      status: 'FAILED',
      error: error.message,
      failedAt: new Date().toISOString()
    });
    
    throw error;
  }
}, queueConfig);

// Processing functions
async function processType1(data, job, jobId) {
  const totalItems = data.length;
  let processed = 0;
  
  for (const item of data) {
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    processed++;
    const progress = Math.floor((processed / totalItems) * 100);
    
    // Update progress
    await job.updateProgress(progress);
    await redisClient.hSet(`job:${jobId}`, 'progress', progress);
  }
  
  return {
    processed: totalItems,
    summary: `Processed ${totalItems} items successfully`
  };
}

async function processType2(data, job, jobId) {
  // Different processing logic
  const results = [];
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    
    // Complex processing simulation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    results.push({
      original: item,
      processed: { ...item, timestamp: new Date().toISOString() }
    });
    
    const progress = Math.floor(((i + 1) / data.length) * 100);
    await job.updateProgress(progress);
    await redisClient.hSet(`job:${jobId}`, 'progress', progress);
  }
  
  return { results, count: results.length };
}

async function processType3(data, job, jobId) {
  // Batch processing simulation
  const batchSize = 10;
  const batches = Math.ceil(data.length / batchSize);
  const results = [];
  
  for (let i = 0; i < batches; i++) {
    const batch = data.slice(i * batchSize, (i + 1) * batchSize);
    
    // Process batch
    await new Promise(resolve => setTimeout(resolve, 500));
    results.push(...batch.map(item => ({ ...item, batchId: i })));
    
    const progress = Math.floor(((i + 1) / batches) * 100);
    await job.updateProgress(progress);
    await redisClient.hSet(`job:${jobId}`, 'progress', progress);
  }
  
  return { 
    results, 
    batches, 
    totalProcessed: results.length 
  };
}

// Worker event handlers
worker.on('completed', (job) => {
  logger.info('Worker completed job', { jobId: job.id });
});

worker.on('failed', (job, err) => {
  logger.error('Worker job failed', { jobId: job.id, error: err.message });
});

worker.on('error', (err) => {
  logger.error('Worker error', { error: err.message });
});
```

### Step 8: SSE Implementation

Create `routes/sse.js`:

```javascript
import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getJobStatus } from '../services/jobQueue.js';
import { logger } from '../utils/logger.js';

export const sseRouter = Router();

sseRouter.get('/job-progress/:jobId', verifyToken, async (req, res) => {
  const { jobId } = req.params;
  
  logger.info('SSE connection established', { jobId, client: req.user.client });
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable Nginx buffering
    'Access-Control-Allow-Origin': req.headers.origin || '*'
  });
  
  // Send initial connection event
  res.write('event: connected\n');
  res.write(`data: {"message": "Connected to job progress stream"}\n\n`);
  
  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(':keep-alive\n\n');
  }, 30000);
  
  // Send updates
  const updateInterval = setInterval(async () => {
    try {
      const jobStatus = await getJobStatus(jobId);
      
      if (!jobStatus) {
        res.write('event: error\n');
        res.write(`data: {"error": "Job not found"}\n\n`);
        cleanup();
        return;
      }
      
      // Send status update
      res.write(`data: ${JSON.stringify(jobStatus)}\n\n`);
      
      // Close connection when job is done
      if (jobStatus.status === 'COMPLETED' || jobStatus.status === 'FAILED') {
        logger.info('Job finished, closing SSE', { jobId, status: jobStatus.status });
        cleanup();
      }
    } catch (error) {
      logger.error('SSE update error', { jobId, error: error.message });
      res.write('event: error\n');
      res.write(`data: {"error": "${error.message}"}\n\n`);
      cleanup();
    }
  }, 2000); // Update every 2 seconds
  
  // Cleanup function
  const cleanup = () => {
    clearInterval(keepAlive);
    clearInterval(updateInterval);
    res.end();
  };
  
  // Handle client disconnect
  req.on('close', () => {
    logger.info('SSE client disconnected', { jobId });
    cleanup();
  });
  
  // Handle errors
  req.on('error', (error) => {
    logger.error('SSE connection error', { jobId, error: error.message });
    cleanup();
  });
});
```

### Step 9: Job Routes Implementation

Create `routes/jobs.js`:

```javascript
import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { validateJobSubmission } from '../middleware/validation.js';
import { createJob, getJobStatus } from '../services/jobQueue.js';
import { logger } from '../utils/logger.js';

export const jobsRouter = Router();

// Submit new job
jobsRouter.post('/', verifyToken, validateJobSubmission, async (req, res) => {
  try {
    const { processingType, data, options } = req.body;
    
    logger.info('Job submission request', { 
      processingType, 
      dataCount: data.length,
      client: req.user.client 
    });
    
    const job = await createJob({
      processingType,
      data,
      options: options || {}
    });
    
    res.status(202).json(job);
  } catch (error) {
    logger.error('Job submission failed', { error: error.message });
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Get job status
jobsRouter.get('/:jobId', verifyToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await getJobStatus(jobId);
    
    if (!status) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(status);
  } catch (error) {
    logger.error('Failed to get job status', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve job status' });
  }
});
```

### Step 10: Validation Middleware

Create `middleware/validation.js`:

```javascript
import Joi from 'joi';

const jobSchema = Joi.object({
  processingType: Joi.string()
    .valid('type1', 'type2', 'type3')
    .required()
    .messages({
      'any.required': 'Processing type is required',
      'any.only': 'Invalid processing type'
    }),
  
  data: Joi.array()
    .items(Joi.object())
    .min(1)
    .max(1000)
    .required()
    .messages({
      'array.min': 'Data array must contain at least one item',
      'array.max': 'Data array cannot exceed 1000 items',
      'any.required': 'Data array is required'
    }),
  
  options: Joi.object()
    .optional()
    .default({})
});

export const validateJobSubmission = (req, res, next) => {
  const { error, value } = jobSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors
    });
  }
  
  req.body = value;
  next();
};
```

### Step 11: Rate Limiting

Create `middleware/rateLimiter.js`:

```javascript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../server.js';
import { logger } from '../utils/logger.js';

export const rateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  message: 'Too many requests, please try again later',
  
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { 
      ip: req.ip,
      path: req.path
    });
    
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: res.getHeader('Retry-After')
    });
  },
  
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});
```

### Step 12: Error Handler

Create `middleware/errorHandler.js`:

```javascript
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  // CORS error
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS policy violation',
      origin: req.headers.origin
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid authentication token'
    });
  }
  
  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
```

### Step 13: Logger Configuration

Create `utils/logger.js`:

```javascript
import winston from 'winston';

const logFormat = winston.format.printf(({ timestamp, level, message, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});
```

### Step 14: Nginx Configuration

Create `/etc/nginx/sites-available/vps-api`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Proxy configuration
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # SSE specific location
    location ~ ^/api/sse/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Cache-Control 'no-cache';
        proxy_set_header X-Accel-Buffering 'no';
        proxy_buffering off;
        proxy_read_timeout 24h;
        keepalive_timeout 0;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
    }
}
```

### Step 15: PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'vps-api',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Logging
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    
    // Advanced options
    max_memory_restart: '1G',
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 3000
  }]
};
```

### Step 16: Security Setup

```bash
# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# Install and configure fail2ban
sudo apt install fail2ban -y
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Create custom jail for API
sudo tee /etc/fail2ban/jail.d/vps-api.conf << EOF
[vps-api]
enabled = true
port = http,https
filter = vps-api
logpath = /var/www/vps-api/logs/combined.log
maxretry = 5
findtime = 600
bantime = 3600
EOF

# Create filter
sudo tee /etc/fail2ban/filter.d/vps-api.conf << EOF
[Definition]
failregex = .*Invalid API key attempt.*ip: <HOST>
            .*Rate limit exceeded.*ip: <HOST>
ignoreregex =
EOF

sudo systemctl restart fail2ban
```

### Step 17: Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Starting deployment...${NC}"

# Install dependencies
echo "Installing dependencies..."
npm ci --production

# Run tests (optional)
# npm test

# Create logs directory
mkdir -p logs

# Start/Restart with PM2
echo "Starting application with PM2..."
pm2 startOrRestart ecosystem.config.js

# Save PM2 config
pm2 save

# Setup PM2 startup
sudo pm2 startup systemd -u $USER --hp /home/$USER

echo -e "${GREEN}Deployment complete!${NC}"

# Show status
pm2 status
```

Make it executable:
```bash
chmod +x deploy.sh
```

## Testing Procedures

### Test Authentication

```bash
# Get token
curl -X POST https://your-domain.com/api/auth/token \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json"

# Should return: {"token":"...", "expiresIn":1800}
```

### Test Job Submission

```bash
# Submit job
curl -X POST https://your-domain.com/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "processingType": "type1",
    "data": [{"id":1}, {"id":2}]
  }'

# Should return: {"jobId":"job_xxx", "status":"PENDING"}
```

### Test SSE Connection

```javascript
// Test SSE in browser console
const eventSource = new EventSource(
  'https://your-domain.com/api/sse/job-progress/JOB_ID',
  { headers: { 'Authorization': 'Bearer TOKEN' } }
);

eventSource.onmessage = (event) => {
  console.log('Progress:', JSON.parse(event.data));
};
```

## Monitoring and Maintenance

### Monitor Application

```bash
# View PM2 status
pm2 status

# View logs
pm2 logs vps-api --lines 100

# Monitor resources
pm2 monit

# View Redis status
redis-cli ping
redis-cli info stats
```

### Log Rotation

```bash
# Install PM2 log rotation
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

## API Documentation for Vercel Team

### Authentication Flow

1. Vercel sends API key to `/api/auth/token`
2. VPS returns JWT token valid for 30 minutes
3. Vercel includes token in all subsequent requests
4. Token should be cached and refreshed before expiry

### Expected Headers

All requests (except token endpoint):
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

Token endpoint only:
```
X-API-Key: <shared-api-key>
Content-Type: application/json
```

### Status Codes

- `200` - Success
- `202` - Job accepted
- `400` - Bad request / Validation error
- `401` - Unauthorized / Token expired
- `404` - Resource not found
- `429` - Rate limit exceeded
- `500` - Server error

### SSE Event Format

```
event: message
data: {"status":"PROCESSING","progress":45,"jobId":"job_123"}

event: error
data: {"error":"Job failed"}
```

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   sudo lsof -i :3000
   kill -9 <PID>
   ```

2. **Redis connection failed**
   ```bash
   sudo systemctl status redis
   sudo systemctl restart redis
   ```

3. **PM2 not starting**
   ```bash
   pm2 kill
   pm2 start ecosystem.config.js
   ```

4. **SSL certificate issues**
   ```bash
   sudo certbot renew --dry-run
   sudo certbot renew
   ```

## Security Checklist

- [ ] Strong JWT secret (min 32 characters)
- [ ] API key shared securely with Vercel team
- [ ] CORS configured for specific domains only
- [ ] Rate limiting enabled
- [ ] SSL/TLS properly configured
- [ ] Firewall rules active
- [ ] Fail2ban monitoring logs
- [ ] Regular security updates scheduled
- [ ] Logs not exposing sensitive data
- [ ] Input validation on all endpoints

## Support Contact

For Vercel team questions:
- API endpoint issues
- Authentication problems
- Rate limit adjustments needed
- New processing types required
- Performance concerns

Your responsibilities:
- Server uptime and maintenance
- Security updates
- SSL certificate renewal
- Performance optimization
- Error monitoring and fixes