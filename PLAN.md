# Claude Code CLI Chatbot Integration Plan

## Overview
Add a chatbot feature to the AVA system that allows users to interact with Claude Code CLI agent via the web interface. Based on analysis of `claude_dashboard` implementation, this plan provides a straightforward approach to integrate Claude Code CLI capabilities.

## Current AVA Architecture Analysis
- **Framework**: Next.js 14 with TypeScript
- **Architecture**: Page-centric system with component registry
- **API Structure**: Next.js API routes (`/api/*`)
- **Frontend**: React components with real-time rendering via `PageRenderer`
- **Theme System**: Database-driven theme management
- **Component System**: Modular components with configuration-based rendering

## Integration Strategy

### 1. Backend Infrastructure (API Layer)

#### New API Endpoints
```
/api/claude/
├── chat/          - WebSocket server for real-time communication
├── execute/       - Execute Claude Code CLI commands
└── status/        - Check execution status and progress
```

#### Core Backend Files
```
src/app/api/claude/
├── chat/route.ts           - WebSocket upgrade handler
├── execute/route.ts        - Claude CLI execution endpoint
├── status/[id]/route.ts    - Status checking endpoint
└── lib/
    ├── claude-executor.ts  - Core CLI execution logic
    ├── websocket-server.ts - WebSocket server implementation
    └── types.ts           - TypeScript definitions
```

### 2. Frontend Components

#### New Chatbot Components
```
src/pages/_shared/components/chatbot/
├── index.ts
├── ChatBot.tsx              - Main chatbot interface
├── ChatMessage.tsx          - Individual message component
├── ChatInput.tsx            - Input component with send button
├── ExecutionProgress.tsx    - Progress indicator
└── ChatHistory.tsx          - Message history display
```

#### Integration Points
- Add chatbot toggle button to existing `Navigation.tsx`
- Integrate with existing theme system
- Use existing `ErrorBoundary.tsx` for error handling

### 3. Implementation Steps

#### Phase 1: Basic Chat Interface (Week 1)
1. **Create chatbot UI components**
   - Collapsible chat interface (bottom-right corner)
   - Message display with user/assistant differentiation
   - Input field with send button
   - Simple CSS animations for show/hide

2. **Add basic API endpoint**
   - `/api/claude/execute` for command processing
   - Simple text-based request/response
   - Basic error handling

#### Phase 2: Claude CLI Integration (Week 2)
1. **Implement Claude CLI executor**
   - Spawn Claude CLI processes
   - Handle stdout/stderr streams
   - Process management (timeout, cleanup)
   - Environment setup (PATH, working directory)

2. **Add context building**
   - Current page information
   - Project structure analysis
   - Component registry data
   - Theme configuration

#### Phase 3: Real-time Communication (Week 3)
1. **WebSocket implementation**
   - Upgrade HTTP to WebSocket in `/api/claude/chat`
   - Real-time progress updates
   - Execution status streaming
   - Client-server message handling

2. **Progress tracking**
   - Execution stages (Starting, Analyzing, Planning, Executing, Completed)
   - Progress percentage
   - Current step descriptions
   - Error state handling

#### Phase 4: Integration & Polish (Week 4)
1. **System integration**
   - Add chatbot to page configurations
   - Theme system integration
   - Component registry updates
   - Error boundary integration

2. **Security & validation**
   - Input sanitization
   - Command validation
   - Process sandboxing
   - Resource limits

### 4. Technical Implementation Details

#### Claude CLI Command Structure
```javascript
const args = [
  '-p', prompt,
  '--output-format', 'text',
  '--allowedTools', 'Read,LS,Glob,Grep,Write,Edit,MultiEdit'
];

const claudeProcess = spawn('/usr/local/bin/claude', args, {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: '/Users/derakhshani/Documents/GitHub/AVI-Tech/ava',
  env: { ...process.env }
});
```

#### WebSocket Message Format
```typescript
// Client to Server
interface ChatMessage {
  type: 'execute_claude';
  prompt: string;
  executionId: string;
  context: {
    pageId: string;
    currentPage: string;
    projectInfo: object;
  };
}

// Server to Client
interface ProgressUpdate {
  type: 'progress_update';
  executionId: string;
  data: {
    status: 'starting' | 'analyzing' | 'planning' | 'executing' | 'completed' | 'error';
    progress: number; // 0-100
    currentStep: string;
    result?: string;
    error?: string;
  };
}
```

#### Context Building
```typescript
const buildContext = async (pageId: string) => ({
  pageId,
  currentPage: pageId,
  projectInfo: {
    name: 'AVA System',
    framework: 'Next.js 14',
    language: 'TypeScript',
    architecture: 'Page-centric component system'
  },
  availableComponents: componentRegistry.getPageComponents(pageId),
  currentTheme: await getCurrentTheme(pageId),
  projectStructure: await getProjectStructure()
});
```

### 5. UI/UX Design

#### Chatbot Interface
- **Position**: Fixed bottom-right corner
- **State**: Collapsible (minimized/expanded)
- **Size**: 400px width x 500px height when expanded
- **Theme**: Integrate with existing theme system
- **Animation**: Smooth slide-in/out transitions

#### Chat Messages
- **User messages**: Right-aligned, blue background
- **Assistant messages**: Left-aligned, gray background
- **System messages**: Center-aligned, subtle styling
- **Progress updates**: Inline progress bars with status text

### 6. Security Considerations

#### Input Validation
- Sanitize user input before passing to Claude CLI
- Validate execution context
- Prevent dangerous command injection

#### Process Management
- 2-minute execution timeout
- Proper process cleanup
- Resource usage monitoring
- Concurrent execution limits (max 3)

#### File System Access
- Restrict Claude CLI to project directory only
- Validate file paths
- Prevent access to sensitive system files

### 7. Configuration

#### Environment Variables
```bash
CLAUDE_CLI_PATH=/usr/local/bin/claude
CLAUDE_EXECUTION_TIMEOUT=120000
CLAUDE_MAX_CONCURRENT=3
WEBSOCKET_PORT=3001
```

#### Integration with Existing System
- Add chatbot configuration to page configs
- Update component registry
- Extend theme system for chat styling
- Add to navigation components

### 8. Testing Strategy

#### Unit Tests
- Claude executor logic
- WebSocket message handling
- Context building functions
- Input validation

#### Integration Tests
- End-to-end chat flow
- Claude CLI execution
- Progress tracking
- Error handling

#### User Testing
- Interface usability
- Response times
- Error recovery
- Mobile responsiveness

## Success Criteria
1. Users can open chatbot from any page
2. Natural language commands execute Claude CLI
3. Real-time progress updates during execution
4. Results displayed in chat interface
5. Proper error handling and recovery
6. Secure execution environment
7. Integration with existing theme system

## Risk Mitigation
- **Performance**: Implement execution queuing and timeout
- **Security**: Sandboxed execution with limited file access
- **Reliability**: Robust error handling and process cleanup
- **Scalability**: Connection pooling and resource limits

This plan provides a straightforward approach to adding Claude Code CLI capabilities to the AVA system while leveraging the existing architecture and minimizing complexity.