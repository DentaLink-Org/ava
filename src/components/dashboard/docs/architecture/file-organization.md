# Dashboard Page File Organization

This document provides a comprehensive guide to the file organization and directory structure of the Dashboard page. Understanding this structure is essential for AI agents to navigate, modify, and extend the page effectively.

## 📁 Complete Directory Structure

```
src/pages/dashboard/                    # ROOT: Dashboard page directory
├── docs/                              # 📚 Complete documentation system
│   ├── TODO.md                        # Task tracking for documentation
│   ├── PLAN.md                        # Documentation planning document
│   ├── architecture/                  # 🏗️ System architecture docs
│   │   ├── overview.md                # Complete architectural overview
│   │   ├── component-patterns.md      # Component architecture patterns
│   │   └── file-organization.md       # This document
│   ├── components/                    # 🧩 Component system documentation
│   │   ├── component-catalog.md       # Complete component catalog
│   │   ├── dashboard-container.md     # DashboardContainer guide
│   │   ├── welcome-header.md         # WelcomeHeader guide
│   │   ├── navigation-cards.md       # Navigation card components
│   │   ├── quickstart-card.md        # QuickStartCard guide
│   │   ├── kpi-cards.md             # KPICards system
│   │   └── creating-components.md    # Component creation guide
│   ├── configuration/                # ⚙️ Configuration system docs
│   │   ├── config-overview.md        # Configuration architecture
│   │   ├── layout-config.md         # Layout configuration
│   │   ├── component-config.md      # Component configuration
│   │   ├── data-config.md           # Data source configuration
│   │   └── theme-config.md          # Theme configuration
│   ├── automation/                   # 🤖 Automation scripts docs
│   │   ├── automation-overview.md    # Automation capabilities
│   │   ├── add-component-script.md   # add-component.ts guide
│   │   ├── change-theme-script.md    # change-theme.ts guide
│   │   ├── update-layout-script.md   # update-layout.sh guide
│   │   ├── deploy-changes-script.md  # deploy-changes.sh guide
│   │   └── script-development.md     # Creating new scripts
│   ├── styling/                      # 🎨 Styling system docs
│   │   ├── styling-overview.md       # Styling architecture
│   │   ├── design-system.md         # Design system reference
│   │   ├── responsive-design.md      # Responsive implementation
│   │   ├── dark-mode.md             # Dark mode system
│   │   └── customization.md         # Styling customization
│   ├── data/                         # 📊 Data management docs
│   │   ├── data-overview.md         # Data architecture
│   │   ├── hooks-reference.md       # Hooks documentation
│   │   ├── api-reference.md         # API system docs
│   │   ├── mock-data.md            # Mock data system
│   │   └── real-time-updates.md     # Real-time data updates
│   ├── examples/                     # 💡 Practical examples
│   │   ├── common-modifications.md   # Common modifications
│   │   ├── component-examples.md     # Component examples
│   │   ├── layout-examples.md       # Layout examples
│   │   ├── theme-examples.md        # Theme examples
│   │   └── data-integration.md      # Data integration
│   └── troubleshooting/              # 🔧 Troubleshooting guides
│       ├── common-issues.md         # Common problems
│       ├── validation-errors.md     # Validation errors
│       ├── debugging-guide.md       # Debugging tools
│       └── recovery-procedures.md   # Error recovery
├── components/                       # 🧩 React components
│   ├── DashboardContainer.tsx       # ✅ Root layout container
│   ├── WelcomeHeader.tsx           # ✅ Page header component
│   ├── DatabaseLinkCard.tsx        # ✅ Database navigation card
│   ├── TasksLinkCard.tsx           # ✅ Tasks navigation card
│   ├── QuickStartCard.tsx          # ✅ Onboarding component
│   ├── KPICards.tsx                # ✅ Metrics display component
│   └── index.ts                    # ✅ Component exports
├── hooks/                           # ⚡ React hooks for data
│   ├── useDashboardData.ts         # ✅ Main data hook
│   └── index.ts                    # ✅ Hook exports
├── api/                            # 🌐 API handlers
│   ├── metrics.ts                  # ✅ Dashboard metrics API
│   └── index.ts                    # ✅ API exports
├── scripts/                        # 🤖 Automation scripts
│   ├── add-component.ts            # ✅ Add component script
│   ├── change-theme.ts             # ✅ Theme modification script
│   ├── update-layout.sh            # ✅ Layout update script
│   └── deploy-changes.sh           # ✅ Deployment script
├── utils/                          # 🛠️ Utility functions
│   └── (empty - reserved for future utilities)
├── config.yaml                     # ⚙️ Page configuration
├── styles.css                      # 🎨 Page-specific styles
├── types.ts                        # 📝 TypeScript type definitions
├── register-components.ts          # 🔗 Component registration
└── test-dashboard.ts               # 🧪 Page testing suite
```

## 📄 Core Files Overview

### Configuration Files

#### `config.yaml` - Page Configuration
**Purpose**: Complete page configuration using YAML format
**Location**: `src/pages/dashboard/config.yaml`
**Agent Access**: ✅ **Full Read/Write Access**

```yaml
# Example structure
page:
  title: "Dashboard"                  # Page title
  route: "/"                         # URL route
  description: "Main admin dashboard" # Page description

layout:
  type: "grid"                       # Layout type
  columns: 12                        # Grid columns
  gap: 4                            # Grid gap
  padding: 6                        # Page padding

components:                         # Component definitions
  - id: "welcome-header"            # Unique component ID
    type: "WelcomeHeader"           # Component type
    position: { col: 1, row: 1, span: 12 }  # Grid position
    props: { title: "Dashboard" }   # Component props

data:                              # Data source configuration
  sources:
    - name: "orders"               # Data source name
      type: "supabase"             # Source type
      query: "SELECT ..."          # Database query
      refresh: "30s"               # Refresh interval
```

#### `types.ts` - Type Definitions
**Purpose**: All TypeScript type definitions for the page
**Location**: `src/pages/dashboard/types.ts`
**Agent Access**: ✅ **Full Read/Write Access**

```typescript
// Component props interfaces
export interface WelcomeHeaderProps {
  title: string;
  subtitle: string;
  theme?: any;
  componentId?: string;
  pageId?: string;
}

// Data interfaces
export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  activeUsers: number;
  ordersProcessed: number;
}

// Hook return types
export interface UseDashboardDataResult {
  data: DashboardMetrics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

### Styling Files

#### `styles.css` - Page Styles
**Purpose**: Complete CSS styling system for the page
**Location**: `src/pages/dashboard/styles.css`
**Agent Access**: ✅ **Full Read/Write Access**

```css
/* CSS Custom Properties for theming */
.page-dashboard {
  --color-primary: #f97316;
  --color-secondary: #ea580c;
  --spacing-base: 1rem;
  --font-size-lg: 1.125rem;
}

/* Component-specific styles */
.page-dashboard .welcome-header { /* ... */ }
.page-dashboard .link-card { /* ... */ }
.page-dashboard .kpi-card { /* ... */ }
```

**Key Patterns**:
- All styles scoped with `.page-dashboard`
- CSS custom properties for theming
- Component-specific class naming
- Responsive design breakpoints
- Accessibility considerations

## 🧩 Component Directory Structure

### `components/` Directory
**Purpose**: All React components for the Dashboard page
**Agent Access**: ✅ **Full Read/Write Access**

#### Component File Pattern
Each component follows this structure:

```typescript
// ComponentName.tsx
/**
 * Component Description
 * Brief description of component purpose
 */

import React from 'react';
import { ComponentNameProps } from '../types';

export const ComponentName: React.FC<ComponentNameProps> = ({
  // Props destructuring
}) => {
  return (
    <div className="component-name" data-component-id={componentId}>
      {/* Component JSX */}
    </div>
  );
};
```

#### `index.ts` - Component Exports
**Purpose**: Centralized component exports
**Location**: `src/pages/dashboard/components/index.ts`

```typescript
// Component exports
export { DashboardContainer } from './DashboardContainer';
export { WelcomeHeader } from './WelcomeHeader';
export { DatabaseLinkCard } from './DatabaseLinkCard';
export { TasksLinkCard } from './TasksLinkCard';
export { QuickStartCard } from './QuickStartCard';
export { KPICards } from './KPICards';

// Type re-exports for convenience
export type {
  WelcomeHeaderProps,
  DatabaseLinkCardProps,
  TasksLinkCardProps,
  QuickStartCardProps,
  KPICardsProps,
  KPIMetric
} from '../types';
```

### Component Registration System

#### `register-components.ts` - Component Registry
**Purpose**: Register all components with the system
**Location**: `src/pages/dashboard/register-components.ts`

```typescript
import { registerComponent } from '../_shared/runtime/ComponentRegistry';
import {
  WelcomeHeader,
  DatabaseLinkCard,
  TasksLinkCard,
  QuickStartCard,
  KPICards
} from './components';

// Register all dashboard components
registerComponent('dashboard', 'WelcomeHeader', WelcomeHeader);
registerComponent('dashboard', 'DatabaseLinkCard', DatabaseLinkCard);
registerComponent('dashboard', 'TasksLinkCard', TasksLinkCard);
registerComponent('dashboard', 'QuickStartCard', QuickStartCard);
registerComponent('dashboard', 'KPICards', KPICards);
```

## ⚡ Data Management Structure

### `hooks/` Directory
**Purpose**: React hooks for data management
**Agent Access**: ✅ **Full Read/Write Access**

#### `useDashboardData.ts` - Main Data Hook
**Purpose**: Primary data fetching hook for dashboard metrics

```typescript
export const useDashboardData = (refreshInterval: number = 30000): UseDashboardDataResult => {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Implementation details...
  
  return { data, loading, error, refetch };
};

// Specialized hook for KPI metrics
export const useKPIMetrics = () => {
  const { data, loading, error, refetch } = useDashboardData();
  // Format data for KPI cards
  return { metrics: formatMetrics(), loading, error, refetch };
};
```

#### `index.ts` - Hook Exports
**Purpose**: Centralized hook exports

```typescript
export { useDashboardData, useKPIMetrics } from './useDashboardData';
// Future hooks exports here
```

### `api/` Directory
**Purpose**: API handlers and data fetching functions
**Agent Access**: ✅ **Full Read/Write Access**

#### `metrics.ts` - Metrics API
**Purpose**: Dashboard-specific API functions

```typescript
// API function for fetching metrics
export const fetchDashboardMetrics = async (): Promise<DashboardApiResponse> => {
  try {
    // API implementation
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Validation function
export const validateMetricsData = (data: unknown): data is DashboardMetrics => {
  // Type validation logic
};
```

#### `index.ts` - API Exports
**Purpose**: Centralized API exports

```typescript
export { 
  fetchDashboardMetrics, 
  refreshMetric, 
  validateMetricsData 
} from './metrics';
```

## 🤖 Automation Scripts Structure

### `scripts/` Directory
**Purpose**: Automation scripts for agent-driven modifications
**Agent Access**: ✅ **Full Read/Write/Execute Access**

#### Script Types and Purposes

##### `add-component.ts` - Component Addition
**Purpose**: Add new components to the dashboard
**Usage**: `node add-component.ts --type=NewWidget --position="1,5,6"`

```typescript
export const addComponent = async (options: {
  type: string;
  position: { col: number; row: number; span: number };
  props: Record<string, any>;
}) => {
  // Implementation for adding components
};
```

##### `change-theme.ts` - Theme Modification
**Purpose**: Update colors, typography, and styling
**Usage**: `node change-theme.ts --primary="#10b981" --secondary="#059669"`

```typescript
export const changeTheme = async (colors: Partial<PageTheme['colors']>) => {
  // Implementation for theme changes
};
```

##### `update-layout.sh` - Layout Updates
**Purpose**: Modify grid layout and component positioning
**Usage**: `./update-layout.sh --columns=16 --gap=6`

```bash
#!/bin/bash
# Shell script for layout modifications
# Updates config.yaml layout section
```

##### `deploy-changes.sh` - Change Deployment
**Purpose**: Deploy and validate all changes
**Usage**: `./deploy-changes.sh --validate --backup`

```bash
#!/bin/bash
# Deployment script with validation and rollback
# Ensures changes work before finalizing
```

## 🛠️ Utility Structure

### `utils/` Directory
**Purpose**: Helper functions and utilities (currently empty, reserved for future use)
**Agent Access**: ✅ **Full Read/Write Access**

**Intended for**:
- Data formatting utilities
- Validation helpers
- Component utilities
- Performance helpers

## 🧪 Testing Structure

### `test-dashboard.ts` - Testing Suite
**Purpose**: Page-specific testing and validation
**Agent Access**: ✅ **Read/Write Access**

```typescript
// Test configuration validation
export const testConfigValidation = () => {
  // Test implementation
};

// Test component rendering
export const testComponentRendering = () => {
  // Test implementation
};

// Test data hooks
export const testDataHooks = () => {
  // Test implementation
};
```

## 🔒 Access Control & Boundaries

### Agent Work Zone (Full Access)
```
src/pages/dashboard/              # ✅ FULL CONTROL
├── components/                   # ✅ Create, modify, delete
├── hooks/                        # ✅ Create, modify, delete
├── api/                          # ✅ Create, modify, delete
├── scripts/                      # ✅ Create, modify, execute
├── utils/                        # ✅ Create, modify, delete
├── docs/                         # ✅ Create, modify, delete
├── config.yaml                   # ✅ Modify configuration
├── styles.css                    # ✅ Modify styles
├── types.ts                      # ✅ Modify types
├── register-components.ts        # ✅ Modify registrations
└── test-dashboard.ts             # ✅ Modify tests
```

### Read-Only Areas (No Modifications)
```
src/pages/_shared/                # ❌ SHARED RUNTIME - Do not modify
└── runtime/                      # ❌ Core system files

src/pages/[other-pages]/          # ❌ OTHER PAGES - No access
└── ...                           # ❌ Cross-page modifications forbidden
```

## 📋 File Naming Conventions

### Components
- **Format**: `PascalCase.tsx`
- **Examples**: `WelcomeHeader.tsx`, `DatabaseLinkCard.tsx`
- **Exports**: Named export matching filename

### Hooks
- **Format**: `useCamelCase.ts`
- **Examples**: `useDashboardData.ts`, `useKPIMetrics.ts`
- **Exports**: Named export matching filename

### API Files
- **Format**: `kebab-case.ts` or `camelCase.ts`
- **Examples**: `metrics.ts`, `data-sources.ts`
- **Exports**: Multiple named exports

### Scripts
- **TypeScript**: `kebab-case.ts`
- **Shell**: `kebab-case.sh`
- **Examples**: `add-component.ts`, `update-layout.sh`

### Documentation
- **Format**: `kebab-case.md`
- **Examples**: `component-patterns.md`, `file-organization.md`

## 🔄 Import/Export Patterns

### Internal Imports (Within Dashboard Page)
```typescript
// Component imports
import { WelcomeHeader } from './components/WelcomeHeader';
import { useDashboardData } from './hooks/useDashboardData';
import { fetchDashboardMetrics } from './api/metrics';

// Type imports
import { DashboardMetrics, KPIMetric } from './types';

// Relative imports for same-level files
import { ComponentName } from './ComponentName';
```

### External Imports (From Shared Runtime)
```typescript
// Shared runtime imports
import { registerComponent } from '../_shared/runtime/ComponentRegistry';
import { PageRenderer } from '../_shared/runtime/PageRenderer';
```

### Third-Party Imports
```typescript
// React ecosystem
import React from 'react';
import Link from 'next/link';

// UI libraries
import { Database, CheckSquare, Zap } from 'lucide-react';

// Utilities
import { clsx } from 'clsx';
```

## 📊 File Size Guidelines

### Recommended File Sizes
- **Components**: 50-200 lines (aim for single responsibility)
- **Hooks**: 50-150 lines (focused data logic)
- **API Files**: 100-300 lines (related endpoints grouped)
- **Types**: No limit (comprehensive type definitions)
- **Styles**: 200-600 lines (complete page styling)
- **Config**: 50-150 lines (comprehensive but readable)

### When to Split Files
- **Components** > 200 lines: Consider splitting into smaller components
- **Hooks** > 150 lines: Extract specialized hooks
- **API Files** > 300 lines: Split by functional areas
- **Types** > 500 lines: Group by feature areas

## 🔧 Development Workflow

### Creating New Files
1. **Determine file type and location**
2. **Follow naming conventions**
3. **Include proper file header comments**
4. **Add to appropriate index.ts exports**
5. **Update component registration if needed**
6. **Add to configuration if applicable**

### Modifying Existing Files
1. **Read file structure and dependencies**
2. **Follow existing patterns and conventions**
3. **Update related files (types, exports, configs)**
4. **Test changes with validation scripts**
5. **Update documentation if needed**

### File Dependencies
```
config.yaml ←→ types.ts ←→ components/*.tsx
     ↓             ↓           ↓
styles.css ←→ index.ts ←→ register-components.ts
     ↓             ↓           ↓
hooks/*.ts ←→ api/*.ts ←→ scripts/*.ts
```

## 📖 Related Documentation

- **[Architecture Overview](overview.md)**: Complete system architecture
- **[Component Patterns](component-patterns.md)**: Component design patterns
- **[Configuration Overview](../configuration/config-overview.md)**: Configuration system
- **[Automation Overview](../automation/automation-overview.md)**: Script usage and development

---

This file organization system provides maximum flexibility for AI agents while maintaining clear boundaries and consistent patterns. The structure supports both systematic modifications and creative extensions within the page isolation boundaries.