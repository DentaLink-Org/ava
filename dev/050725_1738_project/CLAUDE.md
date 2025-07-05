# Claude Agent Instructions for Vercel-VPS Integration

## Project Overview

You are working on implementing the Vercel-side of a communication system between our Vercel-hosted Next.js application and a VPS server that handles background processing tasks. This integration allows our platform to offload heavy processing to a dedicated server while providing real-time progress updates to users.

## Your Mission

Your primary goal is to implement a robust, user-friendly interface for submitting data processing jobs to the VPS and displaying real-time progress updates using Server-Sent Events (SSE).

## Key Technical Context

### Architecture
- **Frontend**: Next.js 14 App Router on Vercel
- **Backend API**: Express.js on VPS with Redis job queue
- **Communication**: REST API with JWT auth + SSE for real-time updates
- **Current Codebase**: Page-centric architecture with components organized by page

### API Contract
The VPS provides these endpoints:
- `POST /api/auth/token` - Get JWT token (requires API key)
- `POST /api/jobs` - Submit processing job
- `GET /api/jobs/:jobId` - Get job status
- `GET /api/sse/job-progress/:jobId` - SSE stream for progress

## Using the TODO.md

The TODO.md file contains a comprehensive, phased approach to implementation:

1. **Check off tasks** as you complete them using `[x]`
2. **Work in phases** - complete all tasks in a phase before moving to the next
3. **Add new tasks** as you discover additional requirements
4. **Update task descriptions** if you find better approaches
5. **Note blockers** by adding comments next to blocked tasks

### Priority Phases
1. **Phase 1-2**: Critical setup and core client implementation
2. **Phase 3-5**: MVP functionality (API routes, hooks, basic UI)
3. **Phase 6-7**: Quality assurance (testing, type safety)
4. **Phase 8-9**: Production readiness
5. **Phase 10**: Future enhancements (don't start these in MVP)

## Development Workflow

### 1. Start Every Session
```bash
# Check TODO status
cat dev/050725_1738_project/TODO.md | grep -E "^\- \["

# Review any notes from previous sessions
ls dev/050725_1738_project/notes/
```

### 2. Component Development Process
1. **Always create in `/playground` first**
2. **Test thoroughly** with mock data
3. **Once working**, duplicate to target page directory
4. **Never move** - always duplicate to preserve playground version

### 3. File Organization
```
/src/lib/vpsClient/          # VPS client library
  ├── index.ts               # Main client class
  ├── types.ts               # TypeScript interfaces
  └── errorHandler.ts        # Error handling utilities

/src/app/api/                # API routes
  ├── submit-job/route.ts
  ├── job-status/[jobId]/route.ts
  └── job-progress/route.ts

/src/hooks/                  # Shared hooks
  ├── useJobProgress.ts
  └── useJobSubmission.ts

/src/components/playground/  # Test components first here
  └── JobProcessor.tsx
```

### 4. Testing Strategy
- **Manual Testing**: Use the playground page
- **Unit Tests**: Focus on vpsClient and hooks
- **Integration Tests**: Mock VPS responses
- **E2E Testing**: Coordinate with VPS team for live testing

## Critical Implementation Details

### 1. Authentication Flow
```typescript
// The client handles token caching automatically
const client = new VPSClient();
// Don't manually manage tokens - the client does this
```

### 2. SSE Implementation
```typescript
// SSE requires special handling in Next.js
// Must disable body parser and handle streaming correctly
export const runtime = 'nodejs'; // Not edge
```

### 3. Error Handling Pattern
```typescript
try {
  const result = await vpsClient.submitJob(data);
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    // Show user-friendly rate limit message
  } else if (error.code === 'AUTH_ERROR') {
    // Token might be expired, client will retry
  } else {
    // Generic error handling
  }
}
```

### 4. Progress Updates
- Progress events come every 2 seconds
- Connection automatically closes when job completes
- Implement reconnection logic for dropped connections

## Common Pitfalls to Avoid

1. **Don't expose API keys client-side** - Use API routes as proxy
2. **Don't forget NEXT_PUBLIC_ prefix** for client-side env vars
3. **Don't cache job results** - Always fetch fresh status
4. **Don't ignore TypeScript errors** - They prevent runtime issues
5. **Don't skip error boundaries** - SSE connections can fail

## Environment Variables

### Required for Development (.env.local)
```bash
# These are for development only
DEV_VPS_API_URL=http://localhost:3000
DEV_VPS_API_KEY=dev-api-key
```

### Required for Production (Vercel Dashboard)
```bash
VPS_API_URL=https://vps-domain.com
VPS_API_KEY=<get-from-vps-team>
JWT_SECRET=<must-match-vps-secret>
NEXT_PUBLIC_VPS_API_URL=https://vps-domain.com
```

## Coordination Points

### With VPS Team
1. **API Key**: Get the shared secret for authentication
2. **Endpoints**: Verify the exact URLs and test connectivity
3. **CORS**: Ensure your Vercel URLs are whitelisted
4. **Rate Limits**: Understand the limits to handle gracefully

### With Main Platform
1. **UI Patterns**: Match existing component styles
2. **Error Handling**: Follow platform conventions
3. **Navigation**: Integrate with existing page structure
4. **State Management**: Use existing patterns

## Testing Checklist

Before considering the integration complete:

- [ ] Token generation and caching works
- [ ] Job submission returns job ID
- [ ] SSE connection establishes and receives updates
- [ ] Progress bar updates smoothly
- [ ] Connection recovery works after network issues
- [ ] Error states display user-friendly messages
- [ ] Rate limiting is handled gracefully
- [ ] Works in both development and production
- [ ] TypeScript has no errors
- [ ] All tests pass

## Next Steps After MVP

Once the basic integration is working:

1. **Enhance UI**: Add more detailed progress information
2. **Add Features**: Job history, templates, batch processing
3. **Optimize**: Reduce re-renders, add caching where appropriate
4. **Monitor**: Add analytics to track usage patterns
5. **Document**: Create user guide for the feature

## Quick Commands

```bash
# Run development server
npm run dev

# Type check
npm run type-check

# Run tests
npm test

# Check VPS health (when running)
curl http://localhost:3000/health
```

## Getting Help

1. **Check the guides**: 
   - `vercel-developer-guide.md` - Your main reference
   - `vps-developer-guide.md` - Understand the backend

2. **Review TODO.md**: See what's been done and what's next

3. **Test in Playground**: Always verify functionality there first

4. **Coordinate with VPS team**: For API issues or questions

Remember: The goal is to create a seamless experience for users submitting processing jobs. Focus on reliability, clear feedback, and graceful error handling. Good luck!