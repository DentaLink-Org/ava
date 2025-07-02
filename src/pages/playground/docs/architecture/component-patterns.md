# Dashboard Component Architecture & Design Patterns

This document outlines the component architecture and design patterns used throughout the Dashboard page. Understanding these patterns is essential for AI agents to create, modify, and extend components effectively.

## 🏗️ Core Component Patterns

### Standard Component Structure
All Dashboard components follow a consistent structural pattern:

```typescript
/**
 * Component Description
 * Brief description of component purpose and functionality
 */

import React from 'react';
import { ComponentNameProps } from '../types';

export const ComponentName: React.FC<ComponentNameProps> = ({
  // Primary props (required)
  primaryProp,
  // Secondary props (optional)
  secondaryProp,
  // Standard system props (always included)
  theme,
  componentId,
  pageId
}) => {
  return (
    <div className="component-name" data-component-id={componentId}>
      {/* Component content */}
    </div>
  );
};
```

### Component Interface Pattern
Every component must implement the standard interface pattern:

```typescript
// Standard component props interface
export interface ComponentNameProps {
  // Component-specific props
  title: string;
  description?: string;
  
  // Standard system props (required for all components)
  theme?: any;                    // Theme object for styling
  componentId?: string;           // Unique component identifier
  pageId?: string;               // Page identifier for context
}
```

## 🎨 Component Categories & Patterns

### 1. Layout Components
**Purpose**: Provide structural layout and containment
**Pattern**: Container + Grid System

```typescript
// Example: DashboardContainer
export const DashboardContainer: React.FC<DashboardContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`dashboard-page-container ${className}`}>
      <div className="dashboard-content-grid">
        {children}
      </div>
    </div>
  );
};
```

**Key Characteristics**:
- Load page-specific styles via CSS imports
- Provide grid container structure
- Handle responsive layout adaptation
- Accept children for content composition

### 2. Header Components
**Purpose**: Display page titles, subtitles, and introductory content
**Pattern**: Title + Subtitle + Optional Actions

```typescript
// Example: WelcomeHeader
export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  title,
  subtitle,
  theme,
  componentId,
  pageId
}) => {
  return (
    <div className="welcome-header" data-component-id={componentId}>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
};
```

**Key Characteristics**:
- Simple, clean typography hierarchy
- Semantic HTML structure (h1, p tags)
- CSS class naming follows component-pattern
- Data attributes for debugging and testing

### 3. Navigation Components
**Purpose**: Provide links and navigation between pages
**Pattern**: Icon + Content + Link Wrapper

```typescript
// Example: DatabaseLinkCard
export const DatabaseLinkCard: React.FC<DatabaseLinkCardProps> = ({
  title,
  description,
  href,
  icon,
  theme,
  componentId,
  pageId
}) => {
  const IconComponent = icon === 'Database' ? Database : Database;

  return (
    <Link href={href} className="link-card" data-component-id={componentId}>
      <div className="link-card-content">
        <IconComponent className="link-card-icon" />
        <div>
          <h3 className="link-card-title">{title}</h3>
          <p className="link-card-description">{description}</p>
        </div>
      </div>
    </Link>
  );
};
```

**Key Characteristics**:
- Next.js Link component for client-side navigation
- Lucide React icons for consistency
- Flexible icon system via props
- Hover states handled by CSS
- Semantic content structure

### 4. Data Display Components
**Purpose**: Present data, metrics, and information
**Pattern**: Data Processing + Conditional Rendering + Formatting

```typescript
// Example: KPICards
export const KPICards: React.FC<KPICardsProps> = ({
  metrics,
  theme,
  componentId,
  pageId
}) => {
  const renderKPICard = (metric: KPIMetric) => {
    return (
      <div key={metric.id} className="kpi-card">
        <h3 className="kpi-card-title">{metric.title}</h3>
        <p className="kpi-card-value">
          {typeof metric.value === 'number' && metric.value > 1000 
            ? metric.value.toLocaleString() 
            : metric.value}
          {metric.suffix}
        </p>
        <p className="kpi-card-description">{metric.description}</p>
        {metric.delta && (
          <div className={`kpi-card-delta ${metric.deltaType || 'neutral'}`}>
            {metric.delta}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="kpi-cards" data-component-id={componentId}>
      {metrics.map(renderKPICard)}
    </div>
  );
};
```

**Key Characteristics**:
- Array data processing with map functions
- Helper functions for complex rendering logic
- Number formatting for large values
- Conditional rendering for optional elements
- CSS classes for state indication (delta types)

### 5. Content Components
**Purpose**: Display instructional or informational content
**Pattern**: Content + Actions + Optional Links

```typescript
// Example: QuickStartCard
export const QuickStartCard: React.FC<QuickStartCardProps> = ({
  title,
  description,
  primaryAction,
  theme,
  componentId,
  pageId
}) => {
  return (
    <div className="quick-start-card" data-component-id={componentId}>
      <div className="quick-start-header">
        <Zap className="quick-start-icon" />
        <h3 className="quick-start-title">{title}</h3>
      </div>
      <p className="quick-start-description">{description}</p>
      <Link href={primaryAction.href} className="quick-start-link">
        {primaryAction.text}
      </Link>
    </div>
  );
};
```

**Key Characteristics**:
- Icon + title header pattern
- Descriptive content with clear call-to-action
- Link integration for user actions
- Consistent styling with page theme

## 🔧 Design Pattern Standards

### CSS Class Naming Convention
All components follow a consistent CSS class naming pattern:

```css
/* Pattern: .component-name */
.welcome-header { /* Root component class */ }
.welcome-header h1 { /* Element-specific styles */ }

.link-card { /* Root component class */ }
.link-card-content { /* Sub-element class */ }
.link-card-title { /* Specific element class */ }
.link-card-description { /* Specific element class */ }

.kpi-cards { /* Container component class */ }
.kpi-card { /* Individual item class */ }
.kpi-card-title { /* Element-specific class */ }
.kpi-card-value { /* Element-specific class */ }
```

**Naming Rules**:
- Component root: `component-name`
- Sub-elements: `component-name-element`
- State modifiers: `component-name-element.state` (e.g., `.kpi-card-delta.increase`)
- Container components: Plural form (e.g., `kpi-cards` contains `kpi-card`)

### Data Attribute Pattern
All components include standard data attributes for debugging and testing:

```typescript
// Required data attributes
<div 
  className="component-name" 
  data-component-id={componentId}    // Unique component instance ID
  data-page-id={pageId}             // Page context (optional)
  data-testid="component-name"      // Testing identifier (optional)
>
```

### Theme Integration Pattern
Components receive theme information through props but rely on CSS custom properties:

```typescript
// Component receives theme prop but doesn't directly use it
export const Component: React.FC<ComponentProps> = ({
  theme,  // Available for future use
  // ... other props
}) => {
  // Components use CSS custom properties instead of direct theme values
  return <div className="component">Content</div>;
};
```

```css
/* CSS uses custom properties for theming */
.page-dashboard .component {
  background-color: var(--color-surface);
  color: var(--color-text);
  padding: var(--spacing-lg);
}
```

## 📊 Component Registration Pattern

### Registration System
All components must be registered with the component registry:

```typescript
// src/pages/dashboard/register-components.ts
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

### Component Export Pattern
Components are exported through a centralized index file:

```typescript
// src/pages/dashboard/components/index.ts
export { DashboardContainer } from './DashboardContainer';
export { WelcomeHeader } from './WelcomeHeader';
export { DatabaseLinkCard } from './DatabaseLinkCard';
export { TasksLinkCard } from './TasksLinkCard';
export { QuickStartCard } from './QuickStartCard';
export { KPICards } from './KPICards';

// Re-export types for convenience
export type {
  WelcomeHeaderProps,
  DatabaseLinkCardProps,
  TasksLinkCardProps,
  QuickStartCardProps,
  KPICardsProps,
  KPIMetric
} from '../types';
```

## 🎯 Props Patterns

### Standard Props Interface
Every component implements standard props for system integration:

```typescript
interface StandardComponentProps {
  // System integration props (always included)
  theme?: any;                    // Theme object for styling
  componentId?: string;           // Unique component identifier  
  pageId?: string;               // Page identifier for context
}

// Component-specific props extend standard props
interface WelcomeHeaderProps extends StandardComponentProps {
  title: string;                  // Required component props
  subtitle: string;               // Required component props
}
```

### Configuration-Driven Props
Components receive props from the configuration system:

```yaml
# config.yaml component configuration
components:
  - id: "welcome-header"
    type: "WelcomeHeader"
    position: { col: 1, row: 1, span: 12 }
    props:                        # These become component props
      title: "Dashboard"
      subtitle: "Welcome to your admin dashboard"
```

### Optional Props Handling
Components handle optional props with default values and conditional rendering:

```typescript
export const Component: React.FC<ComponentProps> = ({
  title,
  subtitle,
  description,                    // Optional prop
  showIcon = true,               // Optional with default
  actions = [],                  // Optional array with default
  theme,
  componentId,
  pageId
}) => {
  return (
    <div className="component" data-component-id={componentId}>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      {description && (             // Conditional rendering
        <p className="description">{description}</p>
      )}
      {showIcon && <Icon />}       // Conditional rendering
      {actions.length > 0 && (     // Array length check
        <div className="actions">
          {actions.map(action => (
            <button key={action.id}>{action.label}</button>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 📱 Responsive Design Patterns

### Grid-Aware Components
Components work within the 12-column grid system and adapt to different screen sizes:

```css
/* Desktop: 12-column grid */
.page-dashboard .component {
  grid-column: span 6;           /* Half width */
}

/* Tablet: 8-column grid */
@media (max-width: 1024px) {
  .page-dashboard .component {
    grid-column: span 4;         /* Half width of 8 columns */
  }
}

/* Mobile: Single column */
@media (max-width: 768px) {
  .page-dashboard .component {
    grid-column: span 1;         /* Full width */
  }
}
```

### Content Adaptation Patterns
Components adapt their internal layout for different screen sizes:

```css
/* Desktop layout */
.page-dashboard .link-card-content {
  display: flex;
  align-items: center;
}

/* Mobile layout */
@media (max-width: 480px) {
  .page-dashboard .link-card-content {
    flex-direction: column;
    text-align: center;
  }
  
  .page-dashboard .link-card-icon {
    margin-right: 0;
    margin-bottom: var(--spacing-sm);
  }
}
```

## 🔄 State Management Patterns

### Loading States
Components handle loading states with skeleton patterns:

```typescript
export const Component: React.FC<ComponentProps> = ({ 
  data, 
  loading, 
  error 
}) => {
  if (loading) {
    return (
      <div className="component loading">
        <div className="loading-skeleton title"></div>
        <div className="loading-skeleton content"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="component error">
        <p>Error loading component: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="component">
      {/* Normal component content */}
    </div>
  );
};
```

### Error Boundaries
Components include error boundary patterns for graceful failure:

```css
/* Error state styling */
.page-dashboard .component.error {
  background: #fef2f2;
  border: 2px dashed var(--color-error);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  color: #dc2626;
}
```

## 🧪 Testing Patterns

### Component Testing Structure
Components include standard testing hooks:

```typescript
// Component includes testing attributes
<div 
  className="component-name"
  data-component-id={componentId}
  data-testid="component-name"        // For testing
  data-page-id={pageId}
>
```

### Test-Friendly Patterns
Components are designed for easy testing:

```typescript
// Testable component structure
export const Component: React.FC<ComponentProps> = (props) => {
  // Pure component - no side effects
  // Predictable output based on props
  // Clear DOM structure for testing
  
  return (
    <div data-testid="component-root">
      <h1 data-testid="component-title">{props.title}</h1>
      <p data-testid="component-description">{props.description}</p>
    </div>
  );
};
```

## 🚀 Extension Patterns

### Creating New Components
Follow this pattern when creating new components:

```typescript
// 1. Define types in types.ts
export interface NewComponentProps {
  title: string;
  content: string;
  theme?: any;
  componentId?: string;
  pageId?: string;
}

// 2. Create component file
// src/pages/dashboard/components/NewComponent.tsx
import React from 'react';
import { NewComponentProps } from '../types';

export const NewComponent: React.FC<NewComponentProps> = ({
  title,
  content,
  theme,
  componentId,
  pageId
}) => {
  return (
    <div className="new-component" data-component-id={componentId}>
      <h2 className="new-component-title">{title}</h2>
      <div className="new-component-content">{content}</div>
    </div>
  );
};

// 3. Add styles to styles.css
.page-dashboard .new-component {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

// 4. Export from index.ts
export { NewComponent } from './NewComponent';

// 5. Register component
registerComponent('dashboard', 'NewComponent', NewComponent);

// 6. Add to configuration
components:
  - id: "new-component"
    type: "NewComponent"
    position: { col: 1, row: 5, span: 6 }
    props:
      title: "New Feature"
      content: "Component content"
```

## 📖 Related Documentation

- **[Architecture Overview](overview.md)**: Complete system architecture
- **[File Organization](file-organization.md)**: Directory structure and file placement
- **[Component Catalog](../components/component-catalog.md)**: Complete component reference
- **[Configuration Overview](../configuration/config-overview.md)**: Component configuration system

---

These component patterns ensure consistency, maintainability, and agent-friendly development across the Dashboard page. Following these patterns guarantees components work seamlessly within the system architecture.