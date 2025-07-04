# Milestone Management System

A comprehensive milestone management system for project tracking and visualization.

## Overview

The milestone management system provides:

- **Complete CRUD operations** for milestones
- **Progress tracking** with automatic calculation from tasks
- **Dependency management** with circular dependency prevention
- **Real-time updates** via WebSocket events
- **React hooks** for easy component integration
- **TypeScript support** with comprehensive type definitions

## Quick Start

### Installation

The milestone system is integrated into the existing task management system. Import components from:

```typescript
import { 
  useMilestoneData, 
  useMilestoneProgress,
  useMilestoneDependencies,
  milestoneAPI 
} from '@/components/milestones';
```

### Basic Usage

#### Fetch Milestones

```typescript
import { useMilestoneData } from '@/components/milestones';

function MilestoneList({ projectId }: { projectId: string }) {
  const { 
    milestones, 
    loading, 
    error, 
    createMilestone,
    updateMilestone,
    deleteMilestone 
  } = useMilestoneData({ projectId });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {milestones.map(milestone => (
        <div key={milestone.id}>
          <h3>{milestone.title}</h3>
          <p>Progress: {milestone.progress}%</p>
          <p>Status: {milestone.status}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Track Progress

```typescript
import { useMilestoneProgress } from '@/components/milestones';

function ProgressTracker({ milestoneId }: { milestoneId: string }) {
  const { 
    currentProgress, 
    trend, 
    updateProgress,
    progressStats 
  } = useMilestoneProgress({ milestoneId });

  const handleProgressUpdate = async (newProgress: number) => {
    await updateProgress(milestoneId, newProgress, 'Manual update');
  };

  return (
    <div>
      <h3>Current Progress: {currentProgress}%</h3>
      <p>Trend: {trend?.trend}</p>
      <p>Velocity: {trend?.velocity}% per day</p>
      <button onClick={() => handleProgressUpdate(currentProgress + 10)}>
        Update Progress
      </button>
    </div>
  );
}
```

#### Manage Dependencies

```typescript
import { useMilestoneDependencies } from '@/components/milestones';

function DependencyManager({ projectId }: { projectId: string }) {
  const { 
    dependencies, 
    createDependency,
    deleteDependency,
    getCriticalPath,
    checkForCycle 
  } = useMilestoneDependencies({ projectId });

  const handleAddDependency = async (
    milestoneId: string, 
    dependsOnId: string
  ) => {
    // Check for circular dependency first
    const wouldCreateCycle = await checkForCycle(milestoneId, dependsOnId);
    
    if (wouldCreateCycle) {
      alert('This would create a circular dependency!');
      return;
    }

    await createDependency({
      milestoneId,
      dependsOnId,
      dependencyType: 'finish_to_start'
    });
  };

  return (
    <div>
      <h3>Dependencies ({dependencies.length})</h3>
      {dependencies.map(dep => (
        <div key={dep.id}>
          {dep.milestoneId} depends on {dep.dependsOnId}
          <button onClick={() => deleteDependency(dep.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### Milestone Operations

#### `milestoneAPI.milestones`

- `list(filter?)` - Get milestones with optional filtering
- `get(id)` - Get single milestone with full details
- `create(data)` - Create new milestone
- `update(id, updates)` - Update existing milestone
- `delete(id)` - Delete milestone
- `calculateProgress(id)` - Calculate progress from linked tasks
- `getByProject(projectId)` - Get all milestones for a project
- `getOverdue(projectId?)` - Get overdue milestones
- `getUpcoming(days?, projectId?)` - Get upcoming milestones

#### `milestoneAPI.progress`

- `getProgressHistory(milestoneId)` - Get historical progress data
- `recordProgress(milestoneId, percentage, completedTasks, totalTasks, notes?)` - Record manual progress
- `calculateFromTasks(milestoneId, completedTasks, totalTasks)` - Calculate automatic progress
- `getProgressTrend(milestoneId)` - Get trend analysis
- `getLatestProgress(milestoneId)` - Get most recent progress record

#### `milestoneAPI.dependencies`

- `list(milestoneId?)` - Get dependencies
- `create(data)` - Create new dependency
- `delete(id)` - Delete dependency
- `validateDependencies(milestoneIds)` - Validate for circular dependencies
- `getCriticalPath(milestoneIds)` - Calculate critical path
- `buildDependencyGraph(milestoneIds)` - Build visualization graph

### React Hooks

#### `useMilestoneData(options)`

**Options:**
- `projectId?: string` - Filter by project
- `filter?: MilestoneFilter` - Additional filtering
- `autoRefresh?: boolean` - Enable auto-refresh (default: true)
- `refreshInterval?: number` - Refresh interval in ms (default: 30000)
- `enableRealtime?: boolean` - Enable real-time updates (default: true)

**Returns:**
- `milestones: Milestone[]` - Array of milestones
- `loading: boolean` - Loading state
- `error: MilestoneError | null` - Error state
- `createMilestone(data)` - Create function
- `updateMilestone(id, updates)` - Update function
- `deleteMilestone(id)` - Delete function
- `calculateProgress(id)` - Progress calculation function
- `refetch()` - Manual refresh function
- `stats` - Computed statistics

#### `useMilestoneProgress(options)`

**Options:**
- `milestoneId?: string` - Target milestone
- `autoRefresh?: boolean` - Enable auto-refresh (default: true)
- `refreshInterval?: number` - Refresh interval in ms (default: 60000)
- `enableRealtime?: boolean` - Enable real-time updates (default: true)

**Returns:**
- `progress: MilestoneProgress[]` - Progress history
- `currentProgress: number` - Current progress percentage
- `loading: boolean` - Loading state
- `error: MilestoneError | null` - Error state
- `updateProgress(milestoneId, progress, notes?)` - Update function
- `trend: ProgressTrend` - Trend analysis
- `progressStats` - Computed statistics

#### `useMilestoneDependencies(options)`

**Options:**
- `milestoneId?: string` - Target milestone
- `projectId?: string` - Filter by project
- `autoRefresh?: boolean` - Enable auto-refresh (default: true)
- `refreshInterval?: number` - Refresh interval in ms (default: 30000)
- `enableRealtime?: boolean` - Enable real-time updates (default: true)

**Returns:**
- `dependencies: MilestoneDependency[]` - Array of dependencies
- `loading: boolean` - Loading state
- `error: DependencyError | null` - Error state
- `createDependency(data)` - Create function
- `deleteDependency(id)` - Delete function
- `validateDependencies(deps)` - Validation function
- `getCriticalPath(milestoneIds)` - Critical path calculation
- `getDependencyGraph(milestoneId)` - Graph generation
- `checkForCycle(fromId, toId)` - Cycle detection

## Type Definitions

### Core Types

```typescript
interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: MilestoneStatus;
  priority: TaskPriority;
  color: string;
  progress: number; // 0-100
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo: string[];
  metadata: MilestoneMetadata;
  isArchived: boolean;
  dependencies: MilestoneDependency[];
  tasks: Task[];
}

type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
```

### Filter Types

```typescript
interface MilestoneFilter {
  projectId?: string;
  status?: MilestoneStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dateRange?: TimelineRange;
  tags?: string[];
  search?: string;
  overdue?: boolean;
  completedOnly?: boolean;
}
```

## Real-time Events

The system emits the following events for real-time updates:

### Milestone Events
- `milestone-created` - When a milestone is created
- `milestone-updated` - When a milestone is updated
- `milestone-deleted` - When a milestone is deleted
- `milestone-completed` - When a milestone is completed
- `progress-updated` - When milestone progress changes

### Dependency Events
- `dependency-created` - When a dependency is created
- `dependency-updated` - When a dependency is updated
- `dependency-deleted` - When a dependency is deleted

### Progress Events
- `progress-recorded` - When manual progress is recorded
- `progress-calculated` - When automatic progress is calculated

## Error Handling

All API operations can throw `MilestoneError` or `DependencyError`:

```typescript
interface MilestoneError extends Error {
  code: string;
  details?: Record<string, any>;
  field?: string;
}

interface DependencyError extends MilestoneError {
  dependencyId?: string;
  circularPath?: string[];
}
```

Common error codes:
- `MILESTONE_NOT_FOUND`
- `VALIDATION_ERROR`
- `CIRCULAR_DEPENDENCY`
- `DEPENDENCY_CONFLICT`
- `CREATE_FAILED`
- `UPDATE_FAILED`
- `DELETE_FAILED`

## Performance Considerations

- **Caching**: All hooks implement local state caching
- **Real-time**: Events are debounced to prevent excessive updates
- **Lazy Loading**: Progress and dependencies are loaded on-demand
- **Optimistic Updates**: UI updates immediately before API confirmation
- **Auto-refresh**: Configurable refresh intervals for data consistency

## Integration with Tasks

The milestone system integrates seamlessly with the existing task management:

- Tasks can be linked to milestones via `milestoneId`
- Progress is automatically calculated from task completion
- Task forms include milestone selection
- Milestone completion affects task prioritization

## Database Schema

The system adds the following tables:

- `milestones` - Core milestone data
- `milestone_dependencies` - Dependency relationships
- `milestone_progress` - Progress history tracking
- `milestone_comments` - Discussion threads
- `projects` - Project management (extends existing)
- `users` - User management (extends existing)

See `/database/schema/milestones.sql` for complete schema definitions.

## Migration Guide

To integrate milestone management into existing projects:

1. **Run Database Migration**:
   ```bash
   npm run db:setup milestones
   ```

2. **Update Task Components**:
   ```typescript
   // Add milestone selection to task forms
   import { useMilestoneData } from '@/components/milestones';
   
   const { milestones } = useMilestoneData({ projectId });
   ```

3. **Add Milestone Views**:
   ```typescript
   // Create milestone pages using provided hooks
   import { useMilestoneData, useMilestoneProgress } from '@/components/milestones';
   ```

4. **Configure Real-time Updates**:
   ```typescript
   // Enable real-time features
   const options = { enableRealtime: true };
   ```

## Examples

See the `/src/components/playground/` directory for complete component examples demonstrating all milestone management features.