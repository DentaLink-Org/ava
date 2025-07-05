# Component Development Guide for Task Management System

## Overview
This guide provides comprehensive instructions for creating new components in the task management system, based on lessons learned during the TaskVelocityTracker and TaskBottleneckAnalyzer implementation.

## 🚨 Critical Issues to Avoid

### 1. TypeScript Type Mismatches
**Issue**: TaskStatus is an INTERFACE, not a string enum
```typescript
// ❌ WRONG - This will cause compilation errors
tasks.filter(task => task.status === 'blocked')

// ✅ CORRECT - Handle both string and interface cases
tasks.filter(task => 
  typeof task.status === 'string' ? task.status === 'blocked' : task.status.id === 'blocked'
)
```

**Root Cause**: The `Task.status` field uses the `TaskStatus` interface:
```typescript
export interface TaskStatus {
  id: string;
  name: string;
  color: string;
  position: number;
  isDefault: boolean;
  isCompleted: boolean;
  projectId?: string;
}
```

### 2. Lucide React Icon Imports
**Issue**: Not all icon names exist in Lucide React
```typescript
// ❌ WRONG - 'Sprint' doesn't exist in Lucide
import { Sprint } from 'lucide-react';

// ✅ CORRECT - Use existing icons or alternatives
import { Target, Activity } from 'lucide-react';
```

**Solution**: Always verify icon names exist in Lucide React documentation before importing.

### 3. Duplicate Imports
**Issue**: Importing the same icon twice causes compilation errors
```typescript
// ❌ WRONG - Target imported twice
import { 
  Target,
  Users,
  // ... other imports
  Target  // Duplicate!
} from 'lucide-react';
```

**Solution**: Always review import lists for duplicates before finalizing.

## 📋 Component Development Checklist

### Pre-Development Phase
- [ ] **Read TypeScript Development Guidelines** (`TYPESCRIPT_DEVELOPMENT_GUIDELINES.md`)
- [ ] **Study existing component patterns** (TaskAnalyticsDashboard.tsx, TaskBurndownChart.tsx)
- [ ] **Verify all icon imports** exist in Lucide React
- [ ] **Understand data types** - Review `types.ts` for interface definitions
- [ ] **Check hook availability** - Confirm which hooks are available for data fetching

### Development Phase
- [ ] **Create component file** in `/src/components/playground/components/`
- [ ] **Follow naming conventions** - Use PascalCase for component names
- [ ] **Implement proper TypeScript types** - Define all interfaces and props
- [ ] **Handle loading/error states** - Include comprehensive state management
- [ ] **Add responsive design** - Ensure mobile compatibility
- [ ] **Include accessibility features** - ARIA labels, keyboard navigation

### Post-Development Phase
- [ ] **Add to component exports** - Update `index.ts`
- [ ] **Register component** - Update `register-components.ts`
- [ ] **Run TypeScript check** - `npm run type-check`
- [ ] **Test in playground** - Verify component renders correctly
- [ ] **Update TODO.md** - Mark tasks as completed

## 🏗️ Component Architecture Patterns

### Standard Component Structure
```typescript
import React, { useState, useCallback, useMemo } from 'react';
import { IconName } from 'lucide-react';
import { useTaskAnalytics } from '../../tasks/hooks/useTaskAnalytics';
import { useEnhancedTaskData } from '../../tasks/hooks/useEnhancedTaskData';
import type { TaskAnalytics, Task, TaskFilter } from '../../tasks/types';

interface ComponentNameProps {
  // Define all props with proper types
  projectId?: string;
  milestoneId?: string;
  height?: number;
  // ... other props
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  projectId,
  milestoneId,
  height = 600,
  // ... other props
}) => {
  // State management
  const [viewState, setViewState] = useState('default');
  
  // Data hooks
  const { analytics, loading, error, refetch } = useTaskAnalytics({
    projectId,
    milestoneId,
    // ... other options
  });

  // Memoized calculations
  const processedData = useMemo(() => {
    // Process analytics data here
    return {};
  }, [analytics]);

  // Event handlers
  const handleAction = useCallback(() => {
    // Handle user actions
  }, []);

  // Loading state
  if (loading) {
    return <LoadingComponent />;
  }

  // Error state
  if (error) {
    return <ErrorComponent error={error} onRetry={refetch} />;
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm" style={{ height }}>
      {/* Header */}
      <div className="border-b bg-gray-50 p-4">
        {/* Header content */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Main content */}
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 p-3">
        {/* Footer content */}
      </div>
    </div>
  );
};

export default ComponentName;
```

### Required Imports Pattern
```typescript
// React essentials
import React, { useState, useCallback, useMemo, useEffect } from 'react';

// Icons - VERIFY THESE EXIST in Lucide React
import { 
  AlertTriangle,  // For errors
  RefreshCw,      // For refresh buttons
  Settings,       // For configuration
  // ... other verified icons
} from 'lucide-react';

// Hooks - These are available and tested
import { useTaskAnalytics } from '../../tasks/hooks/useTaskAnalytics';
import { useEnhancedTaskData } from '../../tasks/hooks/useEnhancedTaskData';

// Types - Import properly (types vs values)
import type { 
  TaskAnalytics, 
  Task,
  TaskFilter,
  // Do NOT import TaskStatus as type - it's used as interface
} from '../../tasks/types';
```

## 🔍 Data Access Patterns

### Using TaskAnalytics Hook
```typescript
const {
  analytics,
  loading,
  error,
  refetch,
  exportData
} = useTaskAnalytics({
  projectId,
  milestoneId,
  dateRange: {
    start: startDate.toISOString(),
    end: endDate.toISOString()
  },
  autoRefresh: true,
  refreshInterval: 30000
});
```

### Using EnhancedTaskData Hook
```typescript
const {
  tasks,
  loading: tasksLoading,
  filter,
  setFilter
} = useEnhancedTaskData({
  projectId,
  milestoneId,
  enableRealtime: true
});
```

### Available Analytics Data Structure
```typescript
interface TaskAnalytics {
  // Basic metrics
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  estimationAccuracy: number;

  // Distributions (Record<string, number>)
  priorityDistribution: Record<TaskPriority, number>;
  statusDistribution: Record<string, number>;
  effortDistribution: Record<TaskEffort, number>;
  complexityDistribution: Record<TaskComplexity, number>;
  riskDistribution: Record<TaskRisk, number>;

  // Team performance array
  teamPerformance: {
    assigneeId: string;
    totalTasks: number;
    completedTasks: number;
    averageCompletionTime: number;
    completionRate: number;
  }[];

  // Time-series data
  burndownData: {
    date: string;
    totalTasks: number;
    completedTasks: number;
    remainingTasks: number;
  }[];

  velocityData: {
    period: string;
    storyPointsCompleted: number;
    tasksCompleted: number;
  }[];
}
```

## 🎨 UI/UX Patterns

### Standard Header Pattern
```typescript
<div className="border-b bg-gray-50 p-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-2">
      <IconName className="w-5 h-5 text-gray-500" />
      <h3 className="text-lg font-semibold text-gray-900">Component Title</h3>
      {/* Status indicators */}
    </div>
    
    <div className="flex items-center space-x-2">
      {/* Controls and actions */}
    </div>
  </div>
</div>
```

### Standard Loading State
```typescript
if (loading || tasksLoading) {
  return (
    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading data...</p>
      </div>
    </div>
  );
}
```

### Standard Error State
```typescript
if (error) {
  return (
    <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
      <div className="text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">Failed to load data</p>
        <p className="text-red-600 text-sm">{error.message}</p>
        <button
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
```

### Metrics Display Pattern
```typescript
<div className="grid grid-cols-2 md:grid-cols-6 gap-4">
  {metrics.map((metric) => (
    <div key={metric.id} className="text-center">
      <div className="text-2xl font-bold" style={{ color: metric.color }}>
        {formatValue(metric.value)}
      </div>
      <div className="text-sm text-gray-600">{metric.label}</div>
    </div>
  ))}
</div>
```

## 📁 File Organization

### File Locations
```
src/components/playground/components/
├── ComponentName.tsx           # Your new component
├── index.ts                   # Export your component here
└── ... other components

src/components/playground/
└── register-components.ts      # Register your component here
```

### Required File Updates

#### 1. Add to `index.ts`
```typescript
// Add this line to exports
export { default as ComponentName } from './ComponentName';
```

#### 2. Add to `register-components.ts`
```typescript
// Add to imports
import {
  // ... existing imports
  ComponentName
} from './components';

// Add to registration function
componentRegistry.register(PLAYGROUND_PAGE_ID, 'ComponentName', ComponentName as any);
```

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Component renders without errors
- [ ] Loading states display correctly
- [ ] Error states handle failures gracefully
- [ ] Real-time updates work (if enabled)
- [ ] Responsive design works on mobile
- [ ] All interactive elements function
- [ ] Data calculations are accurate
- [ ] TypeScript compilation passes
- [ ] No console errors in browser

### Testing Commands
```bash
# TypeScript compilation
npm run type-check

# Start development server
npm run dev

# Visit playground
http://localhost:3000/playground
```

## 🔧 Common Issues and Solutions

### Issue: "Module has no exported member 'IconName'"
**Solution**: Check Lucide React documentation for correct icon names
- Use their search: https://lucide.dev/icons/
- Common alternatives: Activity, BarChart3, TrendingUp, AlertTriangle

### Issue: "This comparison appears to be unintentional"
**Solution**: Handle TaskStatus interface properly
```typescript
// Instead of: task.status === 'string'
// Use: typeof task.status === 'string' ? task.status === 'value' : task.status.id === 'value'
```

### Issue: Component not appearing in playground
**Solutions**:
1. Check component is exported in `index.ts`
2. Check component is registered in `register-components.ts`
3. Verify component name matches exactly (case-sensitive)
4. Check for TypeScript compilation errors

### Issue: Real-time updates not working
**Solution**: Ensure hooks are configured correctly
```typescript
const { analytics } = useTaskAnalytics({
  autoRefresh: true,           // Enable auto-refresh
  refreshInterval: 30000       // Set interval
});
```

## 📚 Reference Components

### Study These Examples
1. **TaskAnalyticsDashboard.tsx** - Comprehensive dashboard with multiple views
2. **TaskBurndownChart.tsx** - Chart component with time-series data
3. **TaskVelocityTracker.tsx** - Team performance tracking (just completed)
4. **TaskBottleneckAnalyzer.tsx** - Workflow analysis (just completed)

### Key Patterns from Reference Components
- Multi-view interfaces with tab switching
- Real-time data updates with loading states
- Comprehensive error handling
- Responsive grid layouts
- Interactive filtering and configuration
- Export and refresh capabilities

## 🎯 Success Criteria

A successfully implemented component should:
- [ ] Pass TypeScript compilation without errors
- [ ] Render correctly in playground environment
- [ ] Handle all data states (loading, error, empty, populated)
- [ ] Follow established UI/UX patterns
- [ ] Include proper accessibility features
- [ ] Work responsively across device sizes
- [ ] Integrate seamlessly with existing hooks and data flows

## 📝 Documentation Requirements

After creating a component:
1. **Update TODO.md** - Mark all related tasks as completed
2. **Add component description** - Brief description of features implemented
3. **Note any limitations** - Document known issues or missing features
4. **Update this guide** - Add any new patterns or issues discovered

## 🚀 Next Steps After Component Creation

1. **Test thoroughly** in playground environment
2. **Document any new patterns** discovered during development
3. **Update project progress** in TODO.md
4. **Prepare handoff notes** for next agent
5. **Consider integration** with production task management system

---

**Remember**: The goal is to create robust, maintainable components that integrate seamlessly with the existing task management ecosystem. Take time to understand the patterns before implementing new features.