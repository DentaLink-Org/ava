# Milestone Management Implementation Guide for AI Agents

## Project Overview

**Project**: Milestone Management System Implementation  
**Start Date**: July 4, 2025  
**Project ID**: 040725_1620_project  
**Total Tasks**: 95 atomic tasks across 4 phases  
**Repository**: https://github.com/AVI-Tech/ava  
**Branch**: `dev`  
**Deployment**: Vercel (automatic from `dev` branch)

## Your Role as an AI Agent

You are part of a collaborative AI team implementing a comprehensive milestone management system for an AI B2B SaaS platform. Your job is to:

1. **Pick up the next available task** from the TODO.md file
2. **Complete the task** following established patterns and conventions
3. **Test your implementation** thoroughly
4. **Document your work** and hand off to the next agent
5. **Maintain project continuity** through proper git practices

## Getting Started

### 1. Read the Project Documentation
**ALWAYS START HERE** - Read these files in order:
1. `/CLAUDE.md` - Overall project guidelines (main project guide)
2. `/PLAN.md` - High-level implementation strategy  
3. `/TODO.md` - Atomic tasks breakdown
4. `/dev/040725_1620_project/CLAUDE.md` - This file (milestone-specific guide)

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

## Task Selection and Execution

### Finding Your Next Task

1. **Check TODO.md Progress**: Look for the first uncompleted task in the current phase
2. **Verify Dependencies**: Ensure all prerequisite tasks are completed
3. **Check for Active Work**: Look for recent commits or open issues related to your task
4. **Claim the Task**: Update the TODO.md to mark your task as "in progress"

### Task Execution Process

#### Phase 1 Example - Database Schema Task
```bash
# 1. Read the task requirements
# Task 1.1.1: Create Milestone Database Schema

# 2. Check existing patterns
ls /database/schema/
cat /database/schema/complete_setup.sql

# 3. Create your schema file
# Follow existing patterns from other schema files

# 4. Test your schema
npm run db:verify

# 5. Update TODO.md to mark task complete
```

#### Phase 1 Example - Component Creation Task
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
# See recent work on milestone implementation
git log --oneline --grep="milestone" -10

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
git commit -m "feat(milestones): implement milestone data provider

- Add React context for milestone state management
- Include CRUD operations with optimistic updates
- Add real-time synchronization with WebSocket
- Include error boundary and loading states

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
**Scopes**: `milestones`, `tasks`, `database`, `api`, `components`

### Using GitHub Issues

#### Creating Issues for Problems
```bash
# Create issue for bugs or blockers
gh issue create --title "Database migration fails on milestone table creation" \
  --body "Describe the problem, steps to reproduce, expected behavior"

# Create issue for questions
gh issue create --title "Clarification needed on milestone-task relationship" \
  --body "What specific information you need"
```

#### Referencing Issues in Commits
```bash
# Reference issue in commit message
git commit -m "fix(database): resolve milestone table creation issue

- Fix foreign key constraint definition
- Add proper index creation order
- Update migration rollback procedure

Fixes #123

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Problem-Solving Protocol

### When You Encounter Problems

1. **Check Recent History**
   ```bash
   # Look for similar issues in recent commits
   git log --oneline --grep="error\|fix\|issue" -20
   
   # Check if someone else hit the same problem
   gh issue list --search "milestone" --state all
   ```

2. **Check Documentation**
   - Read `/CLAUDE.md` for project guidelines
   - Check `/docs/` directory for specific guides
   - Look at existing component implementations

3. **Create an Issue**
   ```bash
   # Document the problem
   gh issue create --title "Clear, specific title" \
     --body "## Problem Description
   What went wrong?
   
   ## Steps to Reproduce
   1. Step 1
   2. Step 2
   
   ## Expected Behavior
   What should happen?
   
   ## Actual Behavior
   What actually happened?
   
   ## Additional Context
   Error messages, logs, etc."
   ```

4. **Hand Off Cleanly**
   - Commit your work in progress
   - Update TODO.md with your progress
   - Reference the issue in your commit message
   - Let the next agent know what's needed

### When You Solve a Problem

1. **Document the Solution**
   ```bash
   # Commit with clear explanation
   git commit -m "fix(milestones): resolve component registration issue

   - Fixed circular dependency in component imports
   - Updated registration order in register-components.ts
   - Added proper error handling for missing components

   Fixes #456

   🤖 Generated with [Claude Code](https://claude.ai/code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

2. **Update Documentation**
   - Add to troubleshooting sections if applicable
   - Update TODO.md with any new insights
   - Create follow-up tasks if needed

3. **Close Related Issues**
   ```bash
   # Reference in commit message to auto-close
   git commit -m "feat(milestones): complete milestone board component

   - Implement timeline visualization with progress bars
   - Add drag-and-drop milestone reordering
   - Include responsive design for mobile
   - Add accessibility features (ARIA labels, keyboard nav)

   Closes #123, #124

   🤖 Generated with [Claude Code](https://claude.ai/code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

## Development Best Practices

### Code Standards

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
   interface MilestoneCardProps {
     milestone: Milestone;
     onEdit: (milestone: Milestone) => void;
     onDelete: (id: string) => void;
   }
   
   // Use existing types when possible
   import { Task, Project } from '../tasks/types';
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

### Performance Considerations

1. **Component Optimization**
   ```typescript
   // Use React.memo for expensive components
   export const MilestoneCard = React.memo<MilestoneCardProps>(({ milestone, onEdit }) => {
     // Component implementation
   });
   
   // Use useMemo for expensive calculations
   const progress = useMemo(() => {
     return calculateProgress(milestone.tasks);
   }, [milestone.tasks]);
   ```

2. **Data Fetching**
   ```typescript
   // Follow existing hook patterns
   const { milestones, loading, error } = useMilestoneData({
     projectId,
     enableRealtime: true
   });
   ```

## Deployment and Vercel Integration

### Automatic Deployment

- **Vercel automatically deploys** from the `dev` branch
- **Every push to `dev`** triggers a new deployment
- **Check deployment status** at https://vercel.com/avi-tech/ava

### Environment Variables

The system uses prefixed environment variables:
```env
AVA_NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
AVA_NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### Database Considerations

**CRITICAL**: Never run database operations locally
- All database changes happen through Vercel's Supabase connection
- Test database connections with `npm run db:test`
- Use migration scripts for schema changes

## Handoff Protocol

### When You Complete a Task

1. **Update TODO.md**
   ```markdown
   - [x] Task 1.1.1: Create Milestone Database Schema
   ```

2. **Commit Your Work**
   ```bash
   git add .
   git commit -m "feat(milestones): complete milestone database schema

   - Create milestones table with proper indexes
   - Add milestone_dependencies table
   - Update tasks table with milestone_id column
   - Add RLS policies following existing patterns

   Completes TODO task 1.1.1

   🤖 Generated with [Claude Code](https://claude.ai/code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   
   git push origin dev
   ```

3. **Document for Next Agent**
   ```bash
   # Create a brief handoff note
   git commit -m "docs(milestones): handoff notes for next agent

   - Database schema completed and tested
   - Next task: Create milestone types (Task 1.2.1)
   - All tests passing, ready for type system implementation

   🤖 Generated with [Claude Code](https://claude.ai/code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

### When You Encounter a Blocker

1. **Document the Issue**
   ```bash
   gh issue create --title "Milestone schema migration failing on foreign key constraint" \
     --body "## Problem
   Migration script fails when creating milestone_dependencies table
   
   ## Error Message
   ```
   ERROR: relation 'milestones' does not exist
   ```
   
   ## Work Completed
   - Created milestones table schema
   - Added proper indexes
   - Started dependencies table
   
   ## Next Steps Needed
   - Fix table creation order
   - Test migration script
   - Complete Task 1.1.1
   
   ## Files Modified
   - /database/schema/milestones.sql
   - /database/migrations/add_milestone_tables.sql"
   ```

2. **Commit Work in Progress**
   ```bash
   git add .
   git commit -m "wip(milestones): milestone schema creation in progress

   - Add milestone table definition
   - Start milestone_dependencies table
   - Issue with foreign key constraints (see #789)

   Partial progress on TODO task 1.1.1

   🤖 Generated with [Claude Code](https://claude.ai/code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

## Common Scenarios and Solutions

### Scenario 1: Component Won't Register
```bash
# Check the registration file
cat /src/components/playground/register-components.ts

# Verify import paths
# Check component exports
# Look for naming conflicts
```

### Scenario 2: Database Connection Issues
```bash
# Test database connection
npm run db:test

# Check environment variables
npm run db:verify

# Never run local database operations
```

### Scenario 3: TypeScript Errors
```bash
# Run type checking
npm run type-check

# Check existing type definitions
cat /src/components/tasks/types.ts

# Follow existing patterns
```

### Scenario 4: Real-time Updates Not Working
```bash
# Check WebSocket connection
# Look at existing real-time implementations
cat /src/components/tasks/hooks/useTaskManager.ts

# Follow the same patterns
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
- [ ] Integration with existing systems

## Emergency Contacts and Resources

### Getting Help
- **Create GitHub Issues** for blockers or questions
- **Check recent commits** for similar implementations
- **Review existing components** for patterns
- **Read project documentation** thoroughly

### Key Files to Reference
- `/CLAUDE.md` - Main project guidelines
- `/PLAN.md` - Implementation strategy
- `/TODO.md` - Your task list
- `/src/components/tasks/` - Existing task management implementation
- `/database/schema/` - Database schema examples

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

## Remember: You're Part of a Team

- **Each agent** contributes to the larger milestone implementation
- **Your work** enables the next agent to continue
- **Clear documentation** and **clean commits** are essential
- **Ask questions** through GitHub issues when needed
- **Follow established patterns** to maintain consistency

**Good luck, and thank you for your contribution to the milestone management system!**

---

*This guide is specific to the milestone implementation project. Always refer to the main `/CLAUDE.md` for overall project guidelines and conventions.*