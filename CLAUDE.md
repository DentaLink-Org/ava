# Claude Agent Instructions for AI Platform Development

## Overview
You are an AI development assistant for a complex AI B2B SaaS platform. This platform is designed to streamline product management, including task management, documentation, strategy setting, milestone tracking, progress monitoring, and marketing campaign testing.

## Architecture Overview
- **Page-Centric Architecture**: The system uses a dynamic routing approach with `[...page]` catch-all routes
- **Component Organization**: Components are organized by page, with each page having its own component registry and configuration
- **MCP Integration**: Includes Model Context Protocol servers for GitHub and Supabase integration
- **Real-time Features**: WebSocket support for live updates and interactions

## Key Development Guidelines

### 1. Development Environment
- **Local Development**: This folder is on a local computer for development
- **Hosting**: The repo is hosted on Vercel
- **Database**: Uses Vercel's Supabase connection - NO database operations should be performed locally
- **Environment Variables**: Uses prefixed variables (`AVA_NEXT_PUBLIC_SUPABASE_URL`) to avoid conflicts with Vercel's automatic Supabase integration

### 2. Development Workflow

#### Component Development
1. **Always start in Playground**: All new components must be created and tested in the `/playground` page first
2. **Test thoroughly**: Ensure components work correctly in Playground before duplicating them
3. **Duplicate when ready**: Once tested, components are DUPLICATED (not moved) to their designated pages
   - Each page maintains its own component registry and configuration
   - Components exist independently in each page's directory
   - This allows page-specific customizations

#### Code Changes Workflow
1. Make necessary code changes following the modular architecture
2. Test changes thoroughly
3. At the end of major changes, ask: "Should I document, commit, and push these changes to the dev branch?"

#### If user confirms push:
1. **Create Report**: 
   - Generate a comprehensive report of all changes made
   - Save to `reports/` folder with format: `YYYYMMDD_HHMMSS_report_title.md`
   
2. **Commit Changes**:
   - Include the report in the commit
   - Use descriptive commit messages
   
3. **Push to Dev Branch**:
   - Push all changes to the `dev` branch
   - Never push directly to main/master

### 3. Architecture Principles

#### Modularity is Key
- Design all components to be modular and reusable
- Keep components simple and focused on single responsibilities
- Ensure easy modification and enhancement by future agents

#### Agent-Friendly Code
- Write clear, self-documenting code
- Use consistent naming conventions
- Add comments only where business logic is complex
- Structure code for easy navigation and understanding

### 4. Platform Features

The platform includes functionality for:
- Task Management with drag-and-drop support
- Documentation Management
- Strategy Setting
- Milestone Tracking
- Progress Monitoring
- Marketing Campaign Testing
- Team Collaboration
- Analytics and Reporting with real-time data
- Dynamic Theme System (database-backed)
- GitHub Integration for issue tracking
- Database Management UI for multiple database connections
- MCP (Model Context Protocol) integration:
  - GitHub MCP server for repository operations
  - Supabase MCP server for database operations

### 5. Important Reminders

- **Database**: Never perform database operations locally - all database interactions happen through Vercel's Supabase connection
- **Testing**: Always test new features in Playground first
- **Commits**: Only commit and push when explicitly asked by the user
- **Reports**: Always create detailed reports before committing major changes
- **Branch**: Always work on and push to the `dev` branch

### 6. Development Commands

Common commands you might need:
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm test

# Database commands
npm run db:setup    # Setup database
npm run db:test     # Test database connection
npm run db:verify   # Verify database configuration
```

### 7. File Structure Best Practices

- **Page-Centric Structure**: `/src/components/[page-name]/`
  - Each page has its own component directory
  - Contains: components/, hooks/, api/, types.ts, config.yaml, register-components.ts
- **Shared Components**: `/src/components/_shared/` - Shared utilities and components
- **App Directory**: `/src/app/` - Next.js 14 app router with dynamic `[...page]` routing
- **Libraries**: `/src/lib/` - Core utilities (Supabase client)
- **MCP Servers**: `/src/mcp/` - Model Context Protocol integrations
- **Database**: `/database/` - SQL schema and migration files
- **Styles**: Tailwind CSS + page-specific CSS modules
- **Reports**: `/reports/` - Development reports (format: `YYYYMMDD_HHMM_title.md`)

### 8. Environment Variables for Production

When deploying to Vercel, set these environment variables:
```
AVA_NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
AVA_NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

The AVA_ prefix is used to avoid conflicts with Vercel's automatic Supabase integration.

### 9. Tech Stack Summary

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + CSS Modules
- **UI Components**: Custom components with Lucide React icons
- **State Management**: React hooks and context
- **Real-time**: WebSocket (ws library)
- **Drag & Drop**: react-beautiful-dnd
- **Testing**: Jest
- **Validation**: AJV for JSON schema validation

## Goal
Create a highly modular, maintainable, and agent-friendly AI platform that enables efficient management of B2B SaaS products. Every decision should prioritize simplicity and ease of future modifications.