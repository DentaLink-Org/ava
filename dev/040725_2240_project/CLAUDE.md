# Task Management System Implementation Guide for AI Agents

## Project Overview

**Project**: Enhanced Task Management System Implementation  
**Start Date**: July 4, 2025  
**Project ID**: 040725_2240_project  
**Total Tasks**: 87 atomic tasks across 4 phases  
**Repository**: https://github.com/AVI-Tech/ava  
**Branch**: `dev`  
**Deployment**: Vercel (automatic from `dev` branch)

## Your Role as an AI Agent

You are part of a collaborative AI team implementing a comprehensive task management system for an AI B2B SaaS platform. Your job is to:

1. **Pick up the next available task** from the TODO.md file
2. **Complete the task** following established patterns and conventions
3. **Test your implementation** thoroughly
4. **Document your work** and hand off to the next agent
5. **Maintain project continuity** through proper git practices

## Task Management Context

Our organization follows a hierarchical approach to task management:

### Organizational Structure
- **Company Objectives** → **Milestones** → **Tasks**
- **Milestones** break down company objectives into manageable phases
- **Tasks** are assigned to individuals and directly impact milestone progress
- **Progress** flows upward: Task completion → Milestone progress → Objective achievement

### Task Lifecycle
1. **Creation**: Tasks are created within the context of a milestone
2. **Assignment**: Tasks get assigned to individual team members
3. **Execution**: Team members work on tasks with real-time progress tracking
4. **Completion**: Task completion automatically updates milestone progress
5. **Reporting**: Progress is aggregated across tasks, milestones, and objectives

## Getting Started

### 1. Read the Project Documentation
**ALWAYS START HERE** - Read these files in order:
1. `/CLAUDE.md` - Overall project guidelines (main project guide)
2. `/PLAN.md` - High-level implementation strategy  
3. `/TODO.md` - Atomic tasks breakdown
4. `/dev/040725_2240_project/CLAUDE.md` - This file (task management-specific guide)

### 2. Check Current Project Status
```bash
# Check git status
git status

# Check current branch (should be 'dev')
git branch

# Check recent commits for context
git log --oneline -10

# Check for any open issues
gh issue list --state open
```

### 3. Understand the Architecture
- **Page-Centric Architecture**: Components organized by page in `/src/components/[page-name]/`
- **Playground-First Development**: Always start new components in `/src/components/playground/`
- **Database**: Supabase (PostgreSQL) - **NEVER** run database operations locally
- **Real-time**: WebSocket support for live updates
- **Deployment**: Vercel with automatic deployments from `dev` branch

## Task Management System Features

### Core Task Features
1. **Task Creation & Management**
   - Create tasks with detailed descriptions
   - Set priority levels (Critical, High, Medium, Low)
   - Assign due dates and time estimates
   - Link tasks to milestones and projects

2. **Task Assignment & Collaboration**
   - Assign tasks to team members
   - Set task dependencies
   - Enable task commenting and discussions
   - Track task progress with status updates

3. **Task Organization**
   - Organize tasks by projects and milestones
   - Use tags and categories for filtering
   - Create custom task workflows
   - Enable task templates for recurring work

4. **Progress Tracking**
   - Real-time progress updates
   - Burndown charts and velocity tracking
   - Time tracking and reporting
   - Milestone progress visualization

### Advanced Features
1. **Task Analytics**
   - Performance metrics and KPIs
   - Team productivity analytics
   - Bottleneck identification
   - Predictive completion dates

2. **Workflow Automation**
   - Auto-assignment based on skills
   - Automated status updates
   - Escalation procedures
   - Integration with external tools

3. **Reporting & Insights**
   - Custom reporting dashboards
   - Export capabilities
   - Historical trend analysis
   - Resource allocation reports

## Task Selection and Execution

### Finding Your Next Task

1. **Check TODO.md Progress**: Look for the first uncompleted task in the current phase
2. **Verify Dependencies**: Ensure all prerequisite tasks are completed
3. **Check for Active Work**: Look for recent commits or open issues related to your task
4. **Claim the Task**: Update the TODO.md to mark your task as "in progress"

### Task Execution Process

#### Phase 1 Example - Task Database Schema
```bash
# 1. Read the task requirements
# Task 1.1.1: Create Enhanced Task Database Schema

# 2. Check existing patterns
ls /database/schema/
cat /database/schema/complete_setup.sql

# 3. Create your schema file
# Follow existing patterns from other schema files

# 4. Test your schema
npm run db:verify

# 5. Update TODO.md to mark task complete
```

#### Phase 1 Example - Task Component Creation
```bash
# 1. Start in playground
cd /src/components/playground/components/

# 2. Create component following existing patterns
# Look at existing components for structure

# 3. Update component registration
# Add to /src/components/playground/register-components.ts

# 4. Test component in playground
npm run dev
# Visit http://localhost:3000/playground

# 5. Update TODO.md
```

### Development Commands You Need

```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Test database connection
npm run db:test

# Setup database (if needed)
npm run db:setup

# Run tests
npm test

# Build for production
npm run build
```

## Git Workflow and Collaboration

### Understanding Project History

**ALWAYS** check the git history before starting:
```bash
# See recent work on task implementation
git log --oneline --grep="task\|milestone" -10

# Check what files have been modified recently
git log --stat --since="1 week ago"

# See current branch and status
git status
git branch -v
```

### Making Commits

Follow the established commit pattern:
```bash
# Stage your changes
git add .

# Make descriptive commit
git commit -m "feat(tasks): implement advanced task filtering system

- Add multi-criteria filtering with AND/OR logic
- Include saved filter templates
- Add real-time filter updates
- Include search within filtered results

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to dev branch
git push origin dev
```

### Commit Message Format
```
<type>(<scope>): <description>

<body explaining what was done>

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`  
**Scopes**: `tasks`, `milestones`, `database`, `api`, `components`

## Development Best Practices

### Code Standards

#### **CRITICAL**: TypeScript Development Guidelines
**Before starting ANY component development**, you MUST read and follow the TypeScript Development Guidelines in `TYPESCRIPT_DEVELOPMENT_GUIDELINES.md`. This document contains essential rules learned from previous TypeScript compilation errors.

**Key Requirements from Guidelines**:
- **NEVER use `as any`** - Always use proper TypeScript types
- **Import enums correctly** - Use `import { EnumName }` not `import type { EnumName }`
- **Define complete interfaces** - Include all required properties before implementation
- **Validate component props** - Ensure playground configurations match component requirements
- **Check icon imports** - Verify all Lucide React icons are properly imported

1. **Follow Existing Patterns**
   ```typescript
   // Look at existing components for structure
   // Example: /src/components/tasks/components/TaskBoard.tsx
   
   // Follow the same:
   // - Import organization
   // - Interface definitions
   // - Component structure
   // - Export patterns
   ```

2. **TypeScript Requirements**
   ```typescript
   // Always define proper interfaces
   interface TaskCardProps {
     task: Task;
     onEdit: (task: Task) => void;
     onDelete: (id: string) => void;
     onStatusChange: (id: string, status: TaskStatus) => void;
   }
   
   // Use existing types when possible
   import { Task, Project, Milestone } from '../types';
   ```

3. **Component Structure**
   ```typescript
   // Follow this pattern for all components
   import React from 'react';
   import { ComponentProps } from './types';
   
   export const ComponentName: React.FC<ComponentProps> = ({
     prop1,
     prop2,
     ...props
   }) => {
     // Component logic here
     
     return (
       <div className="component-class">
         {/* Component JSX */}
       </div>
     );
   };
   ```

### Testing Requirements

#### **MANDATORY**: TypeScript Validation
**Before ANY commit**, you MUST run these commands to prevent compilation errors:
```bash
# Run TypeScript compilation check
npm run type-check

# Run linting
npm run lint

# If either fails, fix all errors before proceeding
```

1. **Test in Playground First**
   ```bash
   # Always test new components in playground
   cd /src/components/playground/
   # Create component
   # Register component
   # Test in browser at http://localhost:3000/playground
   ```

2. **Component Testing**
   ```bash
   # Run type checking
   npm run type-check
   
   # Run linting
   npm run lint
   
   # Test component rendering
   npm test
   ```

3. **Integration Testing**
   ```bash
   # Test with real data
   npm run db:test
   
   # Test real-time updates
   # Open multiple browser tabs to test WebSocket sync
   ```

## Task-Specific Implementation Guidelines

### Task Components Architecture

```
src/components/tasks/
├── components/
│   ├── TaskBoard.tsx                 # Main task board interface
│   ├── TaskCard.tsx                  # Individual task representation
│   ├── TaskCreateModal.tsx           # Task creation interface
│   ├── TaskEditModal.tsx             # Task editing interface
│   ├── TaskList.tsx                  # List view of tasks
│   ├── TaskFilter.tsx                # Advanced filtering
│   ├── TaskProgress.tsx              # Progress tracking
│   ├── TaskAssignment.tsx            # Assignment management
│   ├── TaskDependency.tsx            # Dependency management
│   ├── TaskTimeline.tsx              # Timeline visualization
│   ├── TaskAnalytics.tsx             # Analytics dashboard
│   └── TaskAutomation.tsx            # Workflow automation
├── hooks/
│   ├── useTaskData.ts                # Task data management
│   ├── useTaskProgress.ts            # Progress tracking
│   ├── useTaskAssignment.ts          # Assignment logic
│   └── useTaskAnalytics.ts           # Analytics hooks
├── api/
│   ├── task-operations.ts            # CRUD operations
│   ├── task-analytics.ts             # Analytics API
│   └── task-automation.ts            # Automation API
├── types.ts                          # Task-specific types
└── config.yaml                       # Task page configuration
```

### Task Data Model

```typescript
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  projectId: string;
  milestoneId?: string;
  assigneeId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  dependencies: TaskDependency[];
  subtasks: Task[];
  progress: number;
  effort: TaskEffort;
  customFields: Record<string, any>;
}

export enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}
```

### Task Workflow Integration

1. **Milestone Integration**
   - Tasks automatically contribute to milestone progress
   - Milestone completion depends on task completion
   - Visual progress indicators show milestone impact

2. **Team Assignment**
   - Skills-based task assignment
   - Workload balancing
   - Availability tracking

3. **Real-time Updates**
   - Live progress updates across all views
   - Collaborative editing capabilities
   - Conflict resolution

## Handoff Protocol

### When You Complete a Task

1. **Update TODO.md**
   ```markdown
   - [x] Task 1.1.1: Create Enhanced Task Database Schema
   ```

2. **Commit Your Work**
   ```bash
   git add .
   git commit -m "feat(tasks): complete enhanced task database schema

   - Create tasks table with advanced fields
   - Add task_dependencies table
   - Add task_comments and task_attachments tables
   - Update existing tables with task relationships
   - Add proper indexes and RLS policies

   Completes TODO task 1.1.1

   🤖 Generated with [Claude Code](https://claude.ai/code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   
   git push origin dev
   ```

3. **Document for Next Agent**
   ```bash
   # Create a brief handoff note
   git commit -m "docs(tasks): handoff notes for next agent

   - Database schema completed and tested
   - Next task: Create enhanced task types (Task 1.2.1)
   - All tests passing, ready for type system implementation

   🤖 Generated with [Claude Code](https://claude.ai/code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

## Success Metrics

### Task Completion Criteria
- [ ] Task requirements fully implemented
- [ ] All tests passing (`npm run type-check`, `npm run lint`)
- [ ] Component tested in playground (if applicable)
- [ ] Documentation updated
- [ ] TODO.md updated with progress
- [ ] Clean commit with descriptive message
- [ ] No breaking changes to existing functionality

### Quality Checklist
- [ ] Follows existing code patterns
- [ ] Proper TypeScript typing
- [ ] Responsive design (mobile-friendly)
- [ ] Accessibility features (ARIA labels, keyboard nav)
- [ ] Error handling implemented
- [ ] Loading states included
- [ ] Real-time updates working (if applicable)
- [ ] Integration with milestone system

## Key Files to Reference

- `/CLAUDE.md` - Main project guidelines
- `/PLAN.md` - Implementation strategy
- `/TODO.md` - Your task list
- `/dev/040725_2240_project/CLAUDE.md` - This file (task management specific)
- **`/dev/040725_2240_project/TYPESCRIPT_DEVELOPMENT_GUIDELINES.md`** - **CRITICAL**: TypeScript rules to prevent compilation errors
- `/src/components/tasks/` - Existing task management implementation
- `/src/components/milestones/` - Milestone integration patterns
- `/database/schema/` - Database schema examples

## Emergency Contacts and Resources

### Getting Help
- **Create GitHub Issues** for blockers or questions
- **Check recent commits** for similar implementations
- **Review existing components** for patterns
- **Read project documentation** thoroughly

### Useful Commands Reference
```bash
# Development
npm run dev              # Start dev server
npm run type-check       # Check TypeScript
npm run lint            # Check code style

# Database
npm run db:test         # Test connection
npm run db:verify       # Verify setup
npm run db:setup        # Setup database

# Git
git log --oneline -10   # Recent commits
git status              # Current status
git branch -v           # Branch info

# GitHub
gh issue list           # View issues
gh issue create         # Create issue
```

---

## Remember: You're Building a Task Management System

- **Tasks** are the fundamental unit of work
- **Milestones** provide context and grouping
- **Progress** flows from tasks to milestones to objectives
- **Collaboration** is essential for team productivity
- **Real-time updates** keep everyone synchronized
- **Analytics** provide insights for continuous improvement

**Good luck, and thank you for your contribution to the enhanced task management system!**

---

*This guide is specific to the task management implementation project. Always refer to the main `/CLAUDE.md` for overall project guidelines and conventions.*