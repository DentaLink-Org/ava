# Claude CLI Chatbot - Quick Start Guide

**For AI Agents**: This is a one-shot implementation guide for adding the Claude CLI chatbot to any page in the AVA system.

## ⚡ Quick Implementation (5 minutes)

### Prerequisites Check
```bash
# 1. Verify Claude CLI is installed
which claude
# Should return: /Users/{username}/.claude/local/claude

# 2. Test Claude CLI works
claude --print "What is your current working directory?"
# Should return current directory path
```

### Add to Any Page (3 steps)

#### Step 1: Update Page Config
In your page's `config.yaml`, add:
```yaml
components:
  # ... existing components ...
  
  - id: "chatbot"
    type: "ChatBot"
    position:
      col: 1
      row: 4      # Adjust based on your layout
      span: 8
    props:
      className: "page-chatbot"
```

#### Step 2: Register Component
In your page's `register-components.ts`, add:
```typescript
import { ChatBot } from '../_shared/components';

export const registerPageComponents = () => {
  // ... existing registrations ...
  componentRegistry.register(PAGE_ID, 'ChatBot', ChatBot as any);
};
```

#### Step 3: Test
1. Start dev server: `npm run dev`
2. Visit your page
3. Look for chatbot button in bottom-right corner
4. Click to open and test with: "What is your current working directory?"

## ✅ Verification Checklist

- [ ] Claude CLI installed and working
- [ ] Chatbot appears on page (bottom-right corner)
- [ ] Chatbot opens when clicked
- [ ] Can send message and receive response
- [ ] API health check works: `curl -X GET localhost:3000/api/claude/execute`

## 🔧 Files Already Created

### Components (✅ Ready to use)
- `/src/pages/_shared/components/chatbot/ChatBot.tsx`
- `/src/pages/_shared/components/chatbot/ChatMessage.tsx`  
- `/src/pages/_shared/components/chatbot/ChatInput.tsx`
- `/src/pages/_shared/components/chatbot/index.ts`

### API Endpoint (✅ Ready to use)
- `/src/app/api/claude/execute/route.ts`

### Exports (✅ Ready to use)
- Updated `/src/pages/_shared/components/index.ts`

## 🚨 Common Issues & Quick Fixes

### Issue: Chatbot doesn't appear
**Fix**: Check component registration in `register-components.ts`

### Issue: API errors
**Fix**: Check Claude CLI path with `which claude`

### Issue: Timeout errors  
**Fix**: Default is 5 minutes. Set `CLAUDE_EXECUTION_TIMEOUT=600000` for 10 minutes if needed

### Issue: Permission errors
**Fix**: Run `chmod +x $(which claude)`

## 🧪 Test Commands

```bash
# Test API health
curl -X GET http://localhost:3000/api/claude/execute

# Test simple execution
curl -X POST http://localhost:3000/api/claude/execute \
  -H "Content-Type: application/json" \
  -d '{"prompt": "pwd"}'

# Test file operations
curl -X POST http://localhost:3000/api/claude/execute \
  -H "Content-Type: application/json" \
  -d '{"prompt": "ls -la src/"}'
```

## 📋 Page Examples

### Dashboard Page
```yaml
# src/pages/dashboard/config.yaml
components:
  - id: "chatbot"
    type: "ChatBot"
    position: { col: 1, row: 5, span: 8 }
```

```typescript
// src/pages/dashboard/register-components.ts
import { ChatBot } from '../_shared/components';
componentRegistry.register('dashboard', 'ChatBot', ChatBot as any);
```

### Database Page  
```yaml
# src/pages/databases/config.yaml
components:
  - id: "chatbot"
    type: "ChatBot"
    position: { col: 1, row: 6, span: 8 }
```

```typescript
// src/pages/databases/register-components.ts
import { ChatBot } from '../_shared/components';
componentRegistry.register('databases', 'ChatBot', ChatBot as any);
```

## 🎯 Success Criteria

After implementation, you should be able to:
1. **See** the chatbot button (🤖) in bottom-right corner
2. **Open** the chatbot by clicking the toggle
3. **Send** messages like "List files in src directory"
4. **Receive** responses from Claude CLI
5. **Use** all Claude CLI tools (Read, Write, LS, Grep, etc.)

## 📚 Full Documentation

For detailed information, see:
- [`README.md`](README.md) - Complete implementation guide
- [`API.md`](API.md) - API reference and examples
- [`COMPONENTS.md`](COMPONENTS.md) - Component documentation
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) - Problem solving guide

---

**Implementation Status**: ✅ Production Ready  
**Total Implementation Time**: ~5 minutes  
**Complexity**: Low (copy-paste ready)