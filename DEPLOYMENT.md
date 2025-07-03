# AVA Deployment Guide

This project has been separated into two independent applications:

## Architecture Overview

- **Backend** (`/back`): Express.js API server with all business logic
- **Frontend** (`/front`): Next.js React application deployed to Vercel

## Running Locally

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd back
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your configuration:
   ```
   PORT=8000
   FRONTEND_URL=http://localhost:3000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd front
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.local.example .env.local
   ```

4. Edit `.env.local` with your configuration:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Production Deployment

### Backend Deployment

The backend can be deployed to any Node.js hosting service:

- **Railway**: Connect your GitHub repo, set environment variables
- **Heroku**: Use the Heroku CLI or GitHub integration
- **DigitalOcean**: Deploy to App Platform
- **AWS**: Use Elastic Beanstalk or EC2

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `front`
3. Configure environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
   ```
4. Deploy

## API Integration

All API calls in the frontend use the centralized API client located at `front/src/lib/api-client.ts`.

Example usage:
```typescript
import { apiClient } from '@/lib/api-client';

// Get dashboard metrics
const { data, error } = await apiClient.dashboard.getMetrics();

// Create a new database
const result = await apiClient.databases.create({
  name: 'My Database',
  type: 'postgres'
});
```

## Maintaining Modularity

The modular page structure is preserved:

- **Backend**: Each page's API logic remains in `back/src/pages/[page-name]/api/`
- **Frontend**: Each page's components remain in `front/src/pages/[page-name]/components/`

Claude agents can still navigate to specific page directories to make changes while maintaining the separation of concerns.

## Directory Structure

```
ava/
├── back/                    # Backend Express.js server
│   ├── src/pages/          # Page-specific API routes
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── front/                  # Frontend Next.js app
│   ├── src/                # Frontend source code
│   │   ├── pages/         # Page components (no API routes)
│   │   └── lib/           # API client and utilities
│   └── package.json       # Frontend dependencies
└── DEPLOYMENT.md          # This file
```

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 8000)
- `FRONTEND_URL`: Frontend URL for CORS
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key

### Frontend (.env.local)
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL

## Health Checks

The backend provides a health check endpoint at `/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45
}
```