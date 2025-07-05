# Vercel-VPS Integration TODO List

## Phase 1: Environment Setup & Configuration

### 1.1 Environment Variables
- [ ] Add `VPS_API_URL` to Vercel environment variables (production)
- [ ] Add `VPS_API_KEY` to Vercel environment variables (production)
- [ ] Add `JWT_SECRET` to Vercel environment variables (must match VPS)
- [ ] Add `NEXT_PUBLIC_VPS_API_URL` for client-side access
- [ ] Set up development environment variables in `.env.local`
  - [ ] `DEV_VPS_API_URL=http://localhost:3000`
  - [ ] `DEV_VPS_API_KEY=dev-api-key`

### 1.2 Verify Page-Centric Architecture Compatibility
- [ ] Review current page structure for integration points
- [ ] Determine which pages will use the VPS communication
- [ ] Plan component placement within the page-centric structure

## Phase 2: Core API Client Implementation

### 2.1 VPS Client Library
- [ ] Create `/src/lib/vpsClient.ts` with TypeScript interfaces
- [ ] Implement singleton VPS API client class
- [ ] Add JWT token caching mechanism with 5-minute buffer
- [ ] Implement `getAuthToken()` method with automatic renewal
- [ ] Create `request()` wrapper method for all API calls
- [ ] Add `submitJob()` method for job submission
- [ ] Add `getJobStatus()` method for status checking
- [ ] Implement proper error handling with custom error types

### 2.2 Error Handling
- [ ] Create `/src/lib/vpsClient/errorHandler.ts`
- [ ] Define `APIError` class with status and code properties
- [ ] Implement `handleAPIError()` function for error categorization
- [ ] Add `retryWithBackoff()` function for automatic retries
- [ ] Handle network errors, auth errors, rate limiting, and server errors

## Phase 3: Next.js API Routes

### 3.1 Job Submission Route
- [ ] Create `/src/app/api/submit-job/route.ts`
- [ ] Implement POST handler with request validation
- [ ] Add body size limit configuration (10mb)
- [ ] Forward requests to VPS with proper error handling
- [ ] Return 202 Accepted with job details
- [ ] Handle auth failures, validation errors, and service unavailability

### 3.2 Job Status Route
- [ ] Create `/src/app/api/job-status/[jobId]/route.ts`
- [ ] Implement GET handler with job ID parameter
- [ ] Forward status requests to VPS
- [ ] Handle 404 for non-existent jobs
- [ ] Implement proper error responses

### 3.3 SSE Progress Route
- [ ] Create `/src/app/api/job-progress/route.ts`
- [ ] Set up SSE headers correctly
- [ ] Implement VPS SSE proxy functionality
- [ ] Handle authentication and connection errors
- [ ] Pipe VPS SSE stream to client
- [ ] Implement cleanup on disconnect
- [ ] Disable body parser for streaming

## Phase 4: React Hooks Implementation

### 4.1 Job Progress Hook
- [ ] Create `/src/hooks/useJobProgress.ts`
- [ ] Implement EventSource connection management
- [ ] Add automatic reconnection with exponential backoff
- [ ] Parse and handle different event types
- [ ] Track connection status, progress, results, and errors
- [ ] Close connection when job completes
- [ ] Add cleanup on component unmount

### 4.2 Job Submission Hook
- [ ] Create `/src/hooks/useJobSubmission.ts`
- [ ] Implement submission state management
- [ ] Add error handling and loading states
- [ ] Return jobId on successful submission
- [ ] Provide clear error messages to users

## Phase 5: UI Components in Playground

### 5.1 Job Processor Component
- [ ] Create `/src/components/playground/JobProcessor.tsx`
- [ ] Design submission form UI
- [ ] Add processing type selection
- [ ] Implement data input interface
- [ ] Create progress display with percentage
- [ ] Add connection status indicator
- [ ] Show real-time status updates
- [ ] Display results when complete
- [ ] Add error state handling
- [ ] Include "Process Another Job" functionality

### 5.2 Component Styling
- [ ] Create styled components or CSS modules
- [ ] Design progress bar with animations
- [ ] Style connection status indicators
- [ ] Add loading states and animations
- [ ] Ensure responsive design
- [ ] Match existing platform UI patterns

## Phase 6: Testing Implementation

### 6.1 Unit Tests
- [ ] Create `__tests__/vpsClient.test.ts`
- [ ] Test authentication token retrieval
- [ ] Test job submission functionality
- [ ] Test error handling scenarios
- [ ] Mock API responses for testing

### 6.2 Integration Tests
- [ ] Test API routes with mock VPS responses
- [ ] Test SSE connection handling
- [ ] Test error recovery mechanisms
- [ ] Verify timeout handling

### 6.3 Component Tests
- [ ] Test JobProcessor component states
- [ ] Test hook behavior with mock data
- [ ] Verify UI updates correctly
- [ ] Test user interaction flows

## Phase 7: Type Safety & Validation

### 7.1 TypeScript Interfaces
- [ ] Define job data interfaces
- [ ] Create API response types
- [ ] Add SSE event types
- [ ] Define error types
- [ ] Ensure all API interactions are typed

### 7.2 Input Validation
- [ ] Add client-side validation for job data
- [ ] Validate processing types
- [ ] Check data array constraints
- [ ] Provide helpful validation messages

## Phase 8: Production Preparation

### 8.1 Performance Optimization
- [ ] Implement request debouncing where appropriate
- [ ] Add loading skeletons for better UX
- [ ] Optimize re-renders in progress tracking
- [ ] Test with large data payloads

### 8.2 Error Recovery
- [ ] Add user-friendly error messages
- [ ] Implement retry buttons for failed operations
- [ ] Add connection status recovery UI
- [ ] Create fallback states for SSE failures

### 8.3 Monitoring & Logging
- [ ] Add client-side error tracking
- [ ] Log API performance metrics
- [ ] Track SSE connection stability
- [ ] Monitor job completion rates

## Phase 9: Documentation & Deployment

### 9.1 Documentation
- [ ] Document API client usage
- [ ] Create component usage examples
- [ ] Document environment variable setup
- [ ] Add troubleshooting guide

### 9.2 Deployment Checklist
- [ ] Verify all environment variables in Vercel
- [ ] Test with actual VPS endpoints
- [ ] Confirm CORS configuration
- [ ] Validate SSE through Vercel's infrastructure
- [ ] Test rate limiting behavior
- [ ] Verify error handling in production

### 9.3 Post-Deployment
- [ ] Monitor initial production usage
- [ ] Check for any CORS issues
- [ ] Verify SSL/TLS connections
- [ ] Monitor API response times
- [ ] Track error rates

## Phase 10: Future Enhancements (After MVP)

### 10.1 Advanced Features
- [ ] Add job cancellation functionality
- [ ] Implement job history viewing
- [ ] Add batch job submission
- [ ] Create job templates
- [ ] Add data export functionality

### 10.2 UI Enhancements
- [ ] Add dark mode support
- [ ] Create dashboard for job monitoring
- [ ] Add notification system
- [ ] Implement keyboard shortcuts
- [ ] Add accessibility improvements

## Notes for Developers

1. **Always test in Playground first** before duplicating to production pages
2. **Never perform database operations locally** - all DB ops go through Vercel
3. **Coordinate with VPS team** for API key and endpoint verification
4. **Follow existing patterns** in the page-centric architecture
5. **Create modular components** that can be easily modified by future agents
6. **Test SSE thoroughly** as it can be tricky through proxies
7. **Handle all error cases** to ensure good user experience

## Priority Order

1. Environment setup (Phase 1)
2. Core API client (Phase 2)
3. API routes (Phase 3)
4. Basic UI in Playground (Phase 5)
5. Testing (Phase 6)
6. Everything else follows

Remember: This is a living document. Update task status as you complete them and add new tasks as discovered.