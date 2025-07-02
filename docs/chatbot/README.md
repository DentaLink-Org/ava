# Claude CLI Chatbot Integration

This document provides comprehensive instructions for implementing and maintaining the Claude CLI chatbot integration in the AVA Dashboard system.

## 📋 Overview

The Claude CLI chatbot is a sophisticated integration that allows users to interact with Claude Code CLI directly through the web interface. It provides real-time AI assistance for development tasks, file operations, and system administration.

### Key Features
- **Fixed Position Interface**: Bottom-right corner collapsible chatbot
- **Real-time Communication**: Direct integration with Claude CLI
- **Context Awareness**: Sends current page and project information
- **Multi-message Types**: User, assistant, and system messages
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Robust error handling with user-friendly messages

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│               Frontend                  │
├─────────────────────────────────────────┤
│  ChatBot Component (Bottom-right UI)   │
│  ├── ChatMessage (Message display)     │
│  ├── ChatInput (User input)            │
│  └── Loading states & animations       │
├─────────────────────────────────────────┤
│               API Layer                 │
├─────────────────────────────────────────┤
│  /api/claude/execute                    │
│  ├── Request validation                 │
│  ├── Context building                   │
│  ├── Claude CLI spawning               │
│  └── Response handling                  │
├─────────────────────────────────────────┤
│               Claude CLI                │
├─────────────────────────────────────────┤
│  Local Claude installation             │
│  ├── Command execution                  │
│  ├── Tool access (Read, Write, etc.)   │
│  └── Project directory operations       │
└─────────────────────────────────────────┘
```

## 🚀 Quick Implementation Guide

### Step 1: Verify Prerequisites

1. **Check Claude CLI Installation**:
   ```bash
   which claude
   # Should return: /Users/{username}/.claude/local/claude
   ```

2. **Test Claude CLI**:
   ```bash
   claude --print "What is your current working directory?"
   ```

### Step 2: API Endpoint Setup

The API endpoint is already implemented at `/src/app/api/claude/execute/route.ts`. Key features:

- **Path Detection**: Automatically detects Claude CLI location
- **Context Building**: Includes project information and current page context
- **Process Management**: 30-second timeout with proper cleanup
- **Error Handling**: Comprehensive error messages and logging

**Environment Variables** (optional):
```env
CLAUDE_CLI_PATH=/path/to/claude          # Custom Claude CLI path
CLAUDE_EXECUTION_TIMEOUT=30000           # Timeout in milliseconds (default: 30s)
```

### Step 3: Component Integration

#### 3.1 Components Already Created

The chatbot components are located in `/src/pages/_shared/components/chatbot/`:

- **`ChatBot.tsx`**: Main chatbot interface
- **`ChatMessage.tsx`**: Individual message component  
- **`ChatInput.tsx`**: Input component with send functionality
- **`index.ts`**: Export file

#### 3.2 Add to Any Page

To add the chatbot to a page, follow these steps:

**1. Update Page Configuration (`config.yaml`)**:
```yaml
components:
  # ... existing components ...
  
  - id: "chatbot"
    type: "ChatBot"
    position:
      col: 1
      row: 4
      span: 8
    props:
      className: "page-specific-chatbot"
```

**2. Register Component (`register-components.ts`)**:
```typescript
import { ChatBot } from '../_shared/components';

export const registerPageComponents = () => {
  // ... existing registrations ...
  componentRegistry.register(PAGE_ID, 'ChatBot', ChatBot as any);
};
```

## 🛠️ Implementation Details

### Frontend Components

#### ChatBot Component
- **Location**: `/src/pages/_shared/components/chatbot/ChatBot.tsx`
- **Features**: Collapsible interface, message history, loading states
- **Styling**: CSS-in-JS with CSS variables for theming
- **State Management**: Local React state for messages and UI state

#### ChatMessage Component  
- **Location**: `/src/pages/_shared/components/chatbot/ChatMessage.tsx`
- **Features**: User/assistant/system message types with distinct styling
- **Timestamp Display**: Formatted time for each message
- **Icons**: Emoji-based avatars for different message types

#### ChatInput Component
- **Location**: `/src/pages/_shared/components/chatbot/ChatInput.tsx`
- **Features**: Auto-resizing textarea, keyboard shortcuts (Enter to send)
- **Validation**: Prevents empty message submission
- **Accessibility**: Proper focus management and disabled states

### API Implementation

#### Request/Response Format
```typescript
// Request
interface ExecuteRequest {
  prompt: string;
  context?: {
    pageId?: string;
    currentPage?: string; 
    timestamp?: string;
  };
}

// Response
interface ExecuteResponse {
  success: boolean;
  result?: string;
  error?: string;
  executionId?: string;
}
```

#### Context Building
The API automatically builds context for Claude CLI:
```typescript
=== CONTEXT INFORMATION ===
Project: AVA System (Next.js 14 with TypeScript)
Working Directory: /Users/derakhshani/Documents/GitHub/AVI-Tech/ava
Current Time: 2025-07-02T20:50:41.052Z
Page ID: playground
Current Page: /playground

Available Tools: Read, LS, Glob, Grep, Write, Edit, MultiEdit, Bash
Project Structure: Page-centric Next.js app with component registry
=== END CONTEXT ===

User Request: {user_prompt}
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_CLI_PATH` | `/Users/{user}/.claude/local/claude` | Path to Claude CLI executable |
| `CLAUDE_EXECUTION_TIMEOUT` | `300000` | Timeout in milliseconds (5 minutes) |

### Component Props

#### ChatBot Props
```typescript
interface ChatBotProps {
  className?: string;  // Additional CSS classes
}
```

#### ChatMessage Props
```typescript
interface ChatMessageProps {
  message: {
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isLoading?: boolean;
  };
}
```

#### ChatInput Props
```typescript
interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

## 🎨 Styling & Theming

### CSS Variables Used
```css
--color-surface        /* Background colors */
--color-border         /* Border colors */
--color-primary        /* Primary button/accent color */
--color-text           /* Text colors */
--color-textSecondary  /* Secondary text colors */
--font-family          /* Font family */
```

### Responsive Breakpoints
- **Desktop**: Full 400px width chatbot
- **Mobile** (`max-width: 768px`): Full width minus 40px margins
- **Height**: Adaptive based on screen size (70vh max on mobile)

### Animation Details
- **Transition**: `all 0.3s ease` for open/close states
- **Loading Animation**: CSS keyframe bouncing dots
- **Hover Effects**: Button transform and color changes

## 🧪 Testing

### Manual Testing Checklist

1. **UI Functionality**:
   - [ ] Chatbot toggles open/closed correctly
   - [ ] Messages display with proper styling
   - [ ] Input field accepts text and submits on Enter
   - [ ] Loading indicator shows during execution
   - [ ] Error messages display appropriately

2. **API Integration**:
   - [ ] Health check endpoint responds: `GET /api/claude/execute`
   - [ ] Execute endpoint handles requests: `POST /api/claude/execute`
   - [ ] Claude CLI path is detected correctly
   - [ ] Timeouts work as expected (30 seconds)

3. **Claude CLI Integration**:
   - [ ] Commands execute successfully
   - [ ] Context information is included
   - [ ] File operations work (Read, Write, LS, etc.)
   - [ ] Error handling for invalid commands

### Test Commands

```bash
# Test API health
curl -X GET http://localhost:3000/api/claude/execute

# Test simple execution
curl -X POST http://localhost:3000/api/claude/execute \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is your current working directory?"}'

# Test file operations
curl -X POST http://localhost:3000/api/claude/execute \
  -H "Content-Type: application/json" \
  -d '{"prompt": "List the files in the src directory"}'
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Claude CLI Not Found
**Error**: `Claude CLI not found at /path/to/claude`

**Solutions**:
- Verify Claude CLI installation: `which claude`
- Set correct path in environment: `CLAUDE_CLI_PATH=/correct/path`
- Check file permissions: `ls -la /path/to/claude`

#### 2. Execution Timeouts
**Error**: `Claude CLI execution timeout (30 seconds)`

**Solutions**:
- Increase timeout: `CLAUDE_EXECUTION_TIMEOUT=60000`
- Simplify the prompt/query
- Check system resources and Claude CLI performance

#### 3. Component Not Appearing
**Error**: Chatbot doesn't show on page

**Solutions**:
- Verify component registration in `register-components.ts`
- Check config.yaml syntax and component configuration
- Ensure imports are correct in component files
- Check browser console for React/TypeScript errors

#### 4. API Connection Issues
**Error**: Network errors or 500 responses

**Solutions**:
- Check Next.js development server is running
- Verify API route exists: `/src/app/api/claude/execute/route.ts`
- Check server logs for detailed error messages
- Test API endpoints directly with curl

### Debug Mode

Enable verbose logging by checking server console output. The API logs:
- Execution start/completion
- Claude CLI command arguments
- stdout/stderr output (truncated to 100 chars)
- Process exit codes and signals

## 🔄 Future Enhancements

### Planned Features
- **WebSocket Integration**: Real-time streaming responses
- **Message History Persistence**: Save conversation history
- **File Upload Support**: Drag-and-drop file operations  
- **Multi-session Management**: Support multiple concurrent conversations
- **Custom Tool Restrictions**: Page-specific tool allowlists

### Extension Points
- **Custom Context Builders**: Page-specific context information
- **Message Formatters**: Custom message rendering (code syntax highlighting)
- **Integration Hooks**: Pre/post execution callbacks
- **Theme Customization**: Page-specific chatbot styling

## 📁 File Reference

### Core Files Created/Modified

```
src/
├── app/api/claude/execute/route.ts         # API endpoint
├── pages/_shared/components/
│   ├── chatbot/
│   │   ├── ChatBot.tsx                     # Main component
│   │   ├── ChatMessage.tsx                 # Message component  
│   │   ├── ChatInput.tsx                   # Input component
│   │   └── index.ts                        # Exports
│   └── index.ts                            # Updated exports
└── pages/playground/
    ├── config.yaml                         # Updated config
    └── register-components.ts               # Updated registration
```

### Documentation Files
```
docs/
└── chatbot/
    ├── README.md                           # This file
    ├── API.md                              # API documentation
    ├── COMPONENTS.md                       # Component reference
    └── TROUBLESHOOTING.md                  # Detailed troubleshooting
```

## 🏁 Quick Reference

### Adding Chatbot to New Page
1. Add component to `config.yaml`
2. Import and register in `register-components.ts` 
3. Test on page
4. Done! 🎉

### Testing Checklist
1. Health check: `curl -X GET localhost:3000/api/claude/execute`
2. Test execution: Send simple prompt via UI
3. Verify Claude CLI integration works
4. Check responsive design on mobile

### Support
- Check troubleshooting section above
- Review server logs for detailed error information
- Test Claude CLI directly: `claude --print "test command"`
- Verify all prerequisites are met

---

**Implementation Status**: ✅ Complete and tested
**Last Updated**: 2025-07-02
**Compatibility**: Next.js 14, React 18, Claude CLI latest