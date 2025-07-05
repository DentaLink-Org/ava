# Troubleshooting Quick Reference

## 🚨 Emergency Fixes for Common Issues

### TypeScript Compilation Errors

#### "This comparison appears to be unintentional because the types 'TaskStatus' and 'string' have no overlap"
```typescript
// ❌ ERROR CODE
task.status === 'blocked'

// ✅ QUICK FIX
typeof task.status === 'string' ? task.status === 'blocked' : task.status.id === 'blocked'
```

#### "Module has no exported member 'IconName'"
```typescript
// ❌ COMMON ISSUE
import { Sprint, Balance } from 'lucide-react';  // These don't exist

// ✅ SAFE ALTERNATIVES
import { Target, Scale, Activity, BarChart3 } from 'lucide-react';
```

#### "Duplicate identifier 'IconName'"
```typescript
// ❌ ERROR - Icon imported twice
import { 
  Target,
  Users,
  Target  // ← DUPLICATE!
} from 'lucide-react';

// ✅ FIX - Remove duplicate
import { 
  Target,
  Users
} from 'lucide-react';
```

### Component Registration Issues

#### Component not showing in playground
```bash
# 1. Check TypeScript compilation first
npm run type-check

# 2. If compilation passes, check these files:
```

**File 1: `/src/components/playground/components/index.ts`**
```typescript
// Add this line:
export { default as YourComponent } from './YourComponent';
```

**File 2: `/src/components/playground/register-components.ts`**
```typescript
// Add to imports:
import {
  // ... existing
  YourComponent
} from './components';

// Add to registration:
componentRegistry.register(PLAYGROUND_PAGE_ID, 'YourComponent', YourComponent as any);
```

### Data Access Issues

#### Analytics data is undefined
```typescript
// ❌ WRONG - No safety check
const value = analytics.velocityData.map(v => v.value);

// ✅ CORRECT - Always check for data
const value = analytics?.velocityData?.map(v => v.value) || [];
```

#### Task filtering not working
```typescript
// ❌ WRONG - Assumes string status
tasks.filter(task => task.status === 'completed')

// ✅ CORRECT - Handle interface
tasks.filter(task => {
  if (typeof task.status === 'string') {
    return task.status === 'completed';
  }
  return task.status.id === 'completed';
})
```

## 🔧 Development Workflow Quick Commands

```bash
# Essential commands in order:
npm run type-check    # ALWAYS run this first
npm run dev          # Start development server
```

## 📋 Pre-Commit Checklist (30 seconds)

1. **TypeScript Check**: `npm run type-check` ✅
2. **Component Export**: Added to `index.ts` ✅  
3. **Component Registration**: Added to `register-components.ts` ✅
4. **No Console Errors**: Check browser console ✅
5. **TODO Updated**: Mark tasks complete ✅

## 🆘 When All Else Fails

### Nuclear Reset (Use with caution)
```bash
# If you break something badly:
git status                    # See what changed
git checkout -- filename.ts  # Reset specific file
git stash                    # Stash all changes
npm run type-check           # Verify clean state
```

### Common File Templates

**Minimal Working Component:**
```typescript
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  height?: number;
}

export const MinimalComponent: React.FC<Props> = ({ height = 400 }) => {
  return (
    <div className="bg-white rounded-lg border p-4" style={{ height }}>
      <h3>Component Works!</h3>
    </div>
  );
};

export default MinimalComponent;
```

## 🎯 Verified Safe Icon List (Copy-Paste Ready)

```typescript
// These icons are confirmed to exist:
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Gauge,
  LineChart,
  Minus,
  PieChart,
  RefreshCw,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
  Zap
} from 'lucide-react';
```

## 📞 Emergency Contacts

- **TypeScript Errors**: Check `TYPESCRIPT_DEVELOPMENT_GUIDELINES.md`
- **Component Patterns**: Check `COMPONENT_DEVELOPMENT_GUIDE.md`
- **Project Status**: Check `TODO.md`
- **Task Types**: Check `/src/components/tasks/types.ts`

---
**Last Updated**: After TaskVelocityTracker and TaskBottleneckAnalyzer implementation  
**Status**: All systems operational ✅