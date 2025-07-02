# Chatbot Troubleshooting Guide

Comprehensive troubleshooting guide for the Claude CLI chatbot integration.

## 🚨 Common Issues

### 1. Claude CLI Not Found

#### Symptoms
- Error message: "Claude CLI not found at /path/to/claude"
- Health check shows `claudeCliExists: false`
- 500 error when sending messages

#### Diagnosis Steps
```bash
# Check if Claude CLI is installed
which claude

# Test Claude CLI directly
claude --version

# Check file permissions
ls -la /Users/$(whoami)/.claude/local/claude
```

#### Solutions

**A. Standard Installation Path**
```bash
# If Claude CLI is installed via standard method
export CLAUDE_CLI_PATH="/Users/$(whoami)/.claude/local/claude"
```

**B. Custom Installation Path**
```bash
# Find Claude CLI location
find /usr -name "claude" 2>/dev/null
find /opt -name "claude" 2>/dev/null
find ~ -name "claude" 2>/dev/null

# Set environment variable
export CLAUDE_CLI_PATH="/path/to/your/claude"
```

**C. Reinstall Claude CLI**
```bash
# Download and install Claude CLI
curl -fsSL https://install.claude.ai/claude-code | sh
```

**D. Fix Permissions**
```bash
# Make Claude CLI executable
chmod +x /Users/$(whoami)/.claude/local/claude
```

### 2. Execution Timeouts

#### Symptoms
- Error: "Claude CLI execution timeout (5 minutes)"
- Long-running commands fail
- Partial responses

#### Diagnosis
```bash
# Test command execution time
time claude --print "Your problematic command here"
```

#### Solutions

**A. Increase Timeout**
```env
# In .env.local or environment
CLAUDE_EXECUTION_TIMEOUT=600000  # 10 minutes (if needed beyond default 5 minutes)
```

**B. Optimize Prompts**
- Use specific, focused prompts
- Break complex tasks into smaller requests
- Avoid broad analysis requests

**C. Check System Resources**
```bash
# Check CPU and memory usage
top -pid $(pgrep claude)
```

### 3. Component Not Appearing

#### Symptoms
- Chatbot doesn't show on page
- No chatbot toggle button
- Console errors about missing components

#### Diagnosis Steps

**A. Check Browser Console**
```javascript
// Open browser dev tools and check for errors
console.error // Look for React/component errors
```

**B. Verify Registration**
```typescript
// Check if component is registered
console.log(componentRegistry.getComponent('playground', 'ChatBot'));
```

#### Solutions

**A. Fix Component Registration**
```typescript
// In register-components.ts
import { ChatBot } from '../_shared/components';

export const registerPageComponents = () => {
  componentRegistry.register(PAGE_ID, 'ChatBot', ChatBot as any);
  console.log('ChatBot registered for', PAGE_ID); // Debug log
};
```

**B. Fix Config.yaml**
```yaml
components:
  - id: "chatbot"
    type: "ChatBot"  # Must match registered name exactly
    position:
      col: 1
      row: 4
      span: 8
    props:
      className: "page-chatbot"
```

**C. Check Imports**
```typescript
// Verify export path in index.ts files
export { ChatBot, ChatMessage, ChatInput } from './chatbot';
```

### 4. API Connection Issues

#### Symptoms
- Network errors (fetch failed)
- 404 errors on API endpoints
- CORS errors

#### Diagnosis
```bash
# Test API endpoint directly
curl -X GET http://localhost:3000/api/claude/execute

# Test POST endpoint
curl -X POST http://localhost:3000/api/claude/execute \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}'
```

#### Solutions

**A. Verify Next.js Server**
```bash
# Check if development server is running
npm run dev
# Should show: Local: http://localhost:3000
```

**B. Check API Route File**
```bash
# Verify file exists
ls -la src/app/api/claude/execute/route.ts
```

**C. Fix API Route Structure**
```typescript
// Ensure proper Next.js 14 API route structure
export async function GET() { /* ... */ }
export async function POST(request: NextRequest) { /* ... */ }
```

### 5. Message Display Issues

#### Symptoms
- Messages not displaying
- Incorrect message formatting
- Missing timestamps or avatars

#### Diagnosis
```javascript
// Check message structure in browser console
console.log('Messages:', messages);
```

#### Solutions

**A. Fix Message Structure**
```typescript
const message: Message = {
  id: Date.now().toString(),        // Required
  type: 'user',                     // Required: 'user' | 'assistant' | 'system'
  content: 'Message content',       // Required
  timestamp: new Date(),            // Required
  isLoading: false                  // Optional
};
```

**B. Check CSS Variables**
```css
:root {
  --color-surface: #ffffff;
  --color-text: #1f2937;
  --color-primary: #3b82f6;
  /* Ensure all required variables are defined */
}
```

### 6. Styling and Layout Issues

#### Symptoms
- Chatbot positioning incorrect
- Responsive layout broken
- Theme colors not applied

#### Diagnosis
```css
/* Check computed styles in browser dev tools */
.chatbot-container {
  /* Inspect actual CSS values */
}
```

#### Solutions

**A. Fix Positioning**
```css
.chatbot-container {
  position: fixed !important;
  bottom: 20px !important;
  right: 20px !important;
  z-index: 1000 !important;
}
```

**B. Fix Responsive Issues**
```css
@media (max-width: 768px) {
  .chatbot-container {
    width: calc(100vw - 40px) !important;
    right: 20px !important;
    left: 20px !important;
  }
}
```

**C. Theme Integration**
```typescript
// Ensure theme variables are available
const theme = useTheme(); // If using theme context
```

## 🔧 Debug Mode & Logging

### Enable Verbose Logging

**Server-side (API)**
```typescript
// In route.ts, add more detailed logging
console.log(`[${executionId}] Full command:`, CLAUDE_CLI_PATH, args);
console.log(`[${executionId}] Working directory:`, PROJECT_ROOT);
console.log(`[${executionId}] Environment:`, process.env.PATH);
```

**Client-side (Components)**
```typescript
// In ChatBot.tsx, add debug logging
console.log('Sending message:', content);
console.log('API response:', data);
console.log('Current messages:', messages);
```

### API Health Check

Create a debug endpoint:
```bash
# Check all API health
curl -X GET http://localhost:3000/api/claude/execute
```

Expected response:
```json
{
  "status": "healthy",
  "claudeCliExists": true,
  "claudeCliPath": "/Users/username/.claude/local/claude",
  "timeout": 30000,
  "projectRoot": "/path/to/project"
}
```

## 🔍 Systematic Debugging Process

### Step 1: Environment Check
```bash
# 1. Check Node.js and npm versions
node --version  # Should be ≥18.0.0
npm --version   # Should be ≥8.0.0

# 2. Check Claude CLI
which claude
claude --version

# 3. Check Next.js server
curl -I http://localhost:3000
```

### Step 2: Component Check
```bash
# 1. Verify files exist
ls -la src/pages/_shared/components/chatbot/
ls -la src/app/api/claude/execute/

# 2. Check TypeScript compilation
npm run type-check

# 3. Check for linting errors
npm run lint
```

### Step 3: Runtime Check
```javascript
// 1. Open browser console on the page
// 2. Check for component registration
console.log(window.componentRegistry);

// 3. Check for API availability
fetch('/api/claude/execute').then(r => r.json()).then(console.log);
```

### Step 4: API Testing
```bash
# 1. Test health endpoint
curl -X GET localhost:3000/api/claude/execute

# 2. Test execution with simple command
curl -X POST localhost:3000/api/claude/execute \
  -H "Content-Type: application/json" \
  -d '{"prompt": "echo hello"}'

# 3. Test with file operation
curl -X POST localhost:3000/api/claude/execute \
  -H "Content-Type: application/json" \
  -d '{"prompt": "pwd"}'
```

## 🛠️ Emergency Fixes

### Quick Reset Procedure

```bash
# 1. Stop development server
Ctrl+C

# 2. Clear Next.js cache
rm -rf .next

# 3. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 4. Restart server
npm run dev
```

### Component Re-registration

```typescript
// In browser console, force re-registration
if (window.componentRegistry) {
  window.componentRegistry.clear('playground');
  // Then refresh the page
  window.location.reload();
}
```

### API Route Reset

```bash
# If API routes are not working, restart Next.js
# Sometimes hot reload doesn't catch API route changes
npm run dev
```

## 📊 Performance Diagnostics

### Memory Usage
```bash
# Check Node.js memory usage
ps aux | grep node

# Monitor during chatbot usage
top -pid $(pgrep node)
```

### Network Analysis
```javascript
// In browser dev tools, check Network tab
// Look for:
// - Failed API requests
// - Slow response times
// - CORS issues
```

### Claude CLI Performance
```bash
# Test Claude CLI performance directly
time claude --print "List files in current directory"
time claude --print "Read package.json and summarize"
```

## 🆘 When All Else Fails

### Complete Reinstall

```bash
# 1. Backup any custom changes
cp -r src/pages/_shared/components/chatbot /tmp/chatbot-backup

# 2. Clean everything
rm -rf node_modules .next package-lock.json

# 3. Reinstall Claude CLI
rm -rf ~/.claude
curl -fsSL https://install.claude.ai/claude-code | sh

# 4. Reinstall project dependencies
npm install

# 5. Restart development server
npm run dev
```

### Check for Known Issues

1. **Next.js Version Compatibility**: Ensure using Next.js 14
2. **React Version**: Must be React 18+
3. **Node.js Version**: Must be Node.js 18+
4. **Claude CLI Version**: Use latest version

### Get Help

1. **Check Server Logs**: Look at terminal where `npm run dev` is running
2. **Browser Console**: Check for JavaScript errors
3. **API Logs**: Check API response details
4. **Component State**: Use React Developer Tools

### Documentation References

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [React Component Patterns](https://reactpatterns.com/)
- [Claude CLI Documentation](https://docs.anthropic.com/en/docs/claude-code)

## 📝 Reporting Issues

When reporting issues, include:

1. **Environment Details**:
   ```bash
   node --version
   npm --version
   claude --version
   ```

2. **Error Messages**: Full error messages from console/terminal

3. **Steps to Reproduce**: Exact steps that cause the issue

4. **Expected vs Actual Behavior**: What should happen vs what happens

5. **Browser/OS**: Browser version and operating system

6. **Code Changes**: Any modifications made to the default implementation