# Navigation Cards Documentation

## Overview

The Navigation Cards (`DatabaseLinkCard` and `TasksLinkCard`) are interactive navigation components that provide prominent, visually appealing links to major sections of the dashboard system. These cards serve as the primary navigation method for users to access the Databases and Tasks pages from the main dashboard.

## Purpose

Navigation cards are designed to:
- Provide clear, visual navigation to key dashboard sections
- Display descriptive information about each destination
- Maintain consistent styling and interaction patterns
- Support icon-based visual identification
- Enable easy customization of navigation destinations

## Components

### DatabaseLinkCard

Links users to the database management section.

### TasksLinkCard  

Links users to the task management section.

Both components share identical APIs and styling patterns, differing only in their default icons and content.

## Component API

### Props Interface

Both components use nearly identical prop interfaces:

```typescript
interface DatabaseLinkCardProps {
  title: string;           // Card title (required)
  description: string;     // Card description (required)
  href: string;           // Navigation destination (required)
  icon: string;           // Icon identifier (required)
  theme?: any;            // Theme customization (optional)
  componentId?: string;   // Component identifier (optional)
  pageId?: string;        // Parent page identifier (optional)
}

interface TasksLinkCardProps {
  title: string;           // Card title (required)
  description: string;     // Card description (required)
  href: string;           // Navigation destination (required)
  icon: string;           // Icon identifier (required)
  theme?: any;            // Theme customization (optional)
  componentId?: string;   // Component identifier (optional)
  pageId?: string;        // Parent page identifier (optional)
}
```

### Required Props

- **title**: The main heading displayed on the card
- **description**: Supporting text explaining the card's purpose
- **href**: The URL or route to navigate to when clicked
- **icon**: Icon identifier (currently supports 'Database' and 'CheckSquare')

### Optional Props

- **theme**: Custom styling object
- **componentId**: Used for automation targeting
- **pageId**: Parent page context (typically 'dashboard')

## Usage Examples

### Basic Implementation

```tsx
import { DatabaseLinkCard, TasksLinkCard } from './components';

// Database navigation card
<DatabaseLinkCard 
  title="Databases"
  description="Manage your databases"
  href="/databases"
  icon="Database"
/>

// Tasks navigation card
<TasksLinkCard 
  title="Task Management"
  description="Organize and track tasks"
  href="/tasks"
  icon="CheckSquare"
/>
```

### Side-by-Side Layout

```tsx
<div className="navigation-cards-container">
  <DatabaseLinkCard 
    title="Database Center"
    description="Create, connect, and manage databases"
    href="/databases"
    icon="Database"
  />
  <TasksLinkCard 
    title="Project Tasks"
    description="Track progress and manage workflows"
    href="/tasks"
    icon="CheckSquare"
  />
</div>
```

### With Custom Destinations

```tsx
<DatabaseLinkCard 
  title="Data Analytics"
  description="Explore data insights and reports"
  href="/analytics"
  icon="Database"
/>

<TasksLinkCard 
  title="Project Board"
  description="Kanban-style project management"
  href="/projects"
  icon="CheckSquare"
/>
```

### With Component IDs

```tsx
<DatabaseLinkCard 
  title="Databases"
  description="Manage your databases"
  href="/databases"
  icon="Database"
  componentId="primary-db-link"
  pageId="dashboard"
/>
```

## Configuration in YAML

Navigation cards are configured in the dashboard's `config.yaml`:

```yaml
components:
  - id: "database-link-card"
    type: "DatabaseLinkCard"
    position:
      col: 1      # Left side of grid
      row: 2      # Second row
      span: 6     # Half width (6 of 12 columns)
    props:
      title: "Databases"
      description: "Manage your databases"
      href: "/databases"
      icon: "Database"
      
  - id: "tasks-link-card"
    type: "TasksLinkCard"
    position:
      col: 7      # Right side of grid
      row: 2      # Second row
      span: 6     # Half width (6 of 12 columns)
    props:
      title: "Task Management"
      description: "Organize and track tasks"
      href: "/tasks"
      icon: "CheckSquare"
```

### Position Configuration

- **col**: Starting column (1-12)
- **row**: Grid row position
- **span**: Number of columns (typically 6 for side-by-side layout)

## Styling

### CSS Classes

The navigation cards use the following class structure:

```css
.link-card {
  /* Main card container */
}

.link-card-content {
  /* Inner content layout */
}

.link-card-icon {
  /* Icon styling */
}

.link-card-title {
  /* Title text styling */
}

.link-card-description {
  /* Description text styling */
}
```

### Default Styles

```css
.page-dashboard .link-card {
  background: var(--color-primary);        /* Orange background */
  padding: var(--spacing-xl);              /* 2rem padding */
  border-radius: var(--radius-lg);         /* 12px border radius */
  box-shadow: var(--shadow-lg);            /* Elevated shadow */
  transition: all var(--transition-base);   /* 250ms transitions */
  text-decoration: none;                   /* Remove link underline */
  display: block;                          /* Block-level link */
  color: white;                            /* White text */
  grid-column: span 6;                     /* Half-width by default */
}

.page-dashboard .link-card:hover {
  background: var(--color-secondary);      /* Darker orange on hover */
  box-shadow: var(--shadow-hover);         /* Enhanced shadow */
  transform: translateY(-1px);             /* Subtle lift effect */
  color: white;                            /* Maintain white text */
}

.page-dashboard .link-card-content {
  display: flex;                           /* Flex layout */
  align-items: center;                     /* Vertical center */
}

.page-dashboard .link-card-icon {
  width: 2rem;                             /* 32px icon size */
  height: 2rem;
  color: white;
  margin-right: var(--spacing-base);       /* 1rem right margin */
}

.page-dashboard .link-card-title {
  font-size: var(--font-size-lg);          /* 1.125rem */
  font-weight: 500;                        /* Medium weight */
  margin: 0 0 var(--spacing-xs) 0;         /* Bottom margin only */
}

.page-dashboard .link-card-description {
  font-size: var(--font-size-sm);          /* 0.875rem */
  opacity: 0.9;                            /* Slightly transparent */
  margin: 0;                               /* No margins */
}
```

### CSS Variables Used

```css
--color-primary: #f97316;        /* Main orange color */
--color-secondary: #ea580c;      /* Darker orange for hover */
--spacing-xl: 2rem;              /* Card padding */
--spacing-base: 1rem;            /* Icon margin */
--spacing-xs: 0.25rem;           /* Title bottom margin */
--radius-lg: 12px;               /* Border radius */
--shadow-lg: /* ... */;          /* Card shadow */
--shadow-hover: /* ... */;       /* Hover shadow */
--transition-base: 250ms ease-in-out; /* Transition timing */
--font-size-lg: 1.125rem;        /* Title font size */
--font-size-sm: 0.875rem;        /* Description font size */
```

## Icon System

### Supported Icons

The components currently support these icons from Lucide React:

- **DatabaseLinkCard**: `Database` icon
- **TasksLinkCard**: `CheckSquare` icon

### Icon Implementation

```tsx
// DatabaseLinkCard icon handling
import { Database } from 'lucide-react';
const IconComponent = icon === 'Database' ? Database : Database;

// TasksLinkCard icon handling
import { CheckSquare } from 'lucide-react';
const IconComponent = icon === 'CheckSquare' ? CheckSquare : CheckSquare;
```

### Extending Icon Support

To add more icons, update the component logic:

```tsx
import { Database, CheckSquare, Users, Settings } from 'lucide-react';

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Database': return Database;
    case 'CheckSquare': return CheckSquare;
    case 'Users': return Users;
    case 'Settings': return Settings;
    default: return Database; // Fallback
  }
};

const IconComponent = getIconComponent(icon);
```

## Common Modifications

### 1. Changing Card Colors

```css
.page-dashboard .link-card {
  background: #3b82f6; /* Blue instead of orange */
}

.page-dashboard .link-card:hover {
  background: #2563eb; /* Darker blue for hover */
}
```

### 2. Different Layouts

```css
/* Vertical stacking on smaller screens */
@media (max-width: 768px) {
  .page-dashboard .link-card {
    grid-column: 1 / -1; /* Full width */
    margin-bottom: var(--spacing-lg);
  }
}

/* Single column layout */
.page-dashboard .link-card.full-width {
  grid-column: 1 / -1; /* Span all 12 columns */
}
```

### 3. Custom Card Sizes

```css
/* Larger cards */
.page-dashboard .link-card.large {
  padding: var(--spacing-2xl);
  grid-column: span 8; /* Wider span */
}

/* Compact cards */
.page-dashboard .link-card.compact {
  padding: var(--spacing-lg);
  grid-column: span 4; /* Narrower span */
}
```

### 4. Icon Customization

```css
/* Larger icons */
.page-dashboard .link-card-icon {
  width: 3rem;
  height: 3rem;
}

/* Colored icons */
.page-dashboard .link-card-icon {
  color: #fbbf24; /* Yellow icon on orange background */
}
```

### 5. Animation Effects

```css
/* Rotation on hover */
.page-dashboard .link-card:hover .link-card-icon {
  transform: rotate(5deg);
  transition: transform var(--transition-base);
}

/* Scale effect */
.page-dashboard .link-card:hover {
  transform: translateY(-2px) scale(1.02);
}
```

## Advanced Customization

### Dynamic Content

```tsx
const DynamicNavigationCard = ({ type, stats }) => {
  const cardProps = {
    database: {
      title: "Databases",
      description: `${stats.dbCount} databases connected`,
      href: "/databases",
      icon: "Database"
    },
    tasks: {
      title: "Tasks",
      description: `${stats.taskCount} tasks pending`,
      href: "/tasks", 
      icon: "CheckSquare"
    }
  };

  const Component = type === 'database' ? DatabaseLinkCard : TasksLinkCard;
  
  return <Component {...cardProps[type]} />;
};
```

### Conditional Rendering

```tsx
const ConditionalNavigationCards = ({ userPermissions }) => {
  return (
    <>
      {userPermissions.canAccessDatabases && (
        <DatabaseLinkCard 
          title="Databases"
          description="Manage your databases"
          href="/databases"
          icon="Database"
        />
      )}
      
      {userPermissions.canAccessTasks && (
        <TasksLinkCard 
          title="Tasks"
          description="Organize and track tasks"
          href="/tasks"
          icon="CheckSquare"
        />
      )}
    </>
  );
};
```

### Theme Integration

```tsx
const ThemedNavigationCard = ({ theme }) => {
  const cardStyle = {
    '--card-bg': theme.primaryColor,
    '--card-hover-bg': theme.secondaryColor,
    '--card-text': theme.textColor
  };

  return (
    <div style={cardStyle}>
      <DatabaseLinkCard 
        title="Databases"
        description="Manage your databases"
        href="/databases"
        icon="Database"
        theme={theme}
      />
    </div>
  );
};
```

## Accessibility Features

### Keyboard Navigation

Navigation cards are fully keyboard accessible:
- **Tab**: Navigate between cards
- **Enter/Space**: Activate the link
- **Focus indicators**: Visual focus ring

### Screen Reader Support

```tsx
<DatabaseLinkCard 
  title="Databases"
  description="Manage your databases"
  href="/databases"
  icon="Database"
  aria-label="Navigate to database management section"
/>
```

### Semantic HTML

The cards use semantic link elements:
```tsx
<Link href={href} className="link-card">
  {/* Card content */}
</Link>
```

## Performance Considerations

### Code Splitting

```tsx
// Lazy load navigation cards
const DatabaseLinkCard = dynamic(
  () => import('./components/DatabaseLinkCard'),
  { ssr: true }
);
```

### Memoization

```tsx
import { memo } from 'react';

export const DatabaseLinkCard = memo<DatabaseLinkCardProps>(({
  title,
  description,
  href,
  icon
}) => {
  // Component implementation
});
```

### Image Optimization

For custom icons:
```tsx
import Image from 'next/image';

<Image 
  src="/icons/database.svg"
  alt=""
  width={32}
  height={32}
  className="link-card-icon"
/>
```

## Testing Strategies

### Unit Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DatabaseLinkCard } from './DatabaseLinkCard';

describe('DatabaseLinkCard', () => {
  const defaultProps = {
    title: "Test Database",
    description: "Test Description",
    href: "/test",
    icon: "Database"
  };

  it('renders title and description', () => {
    render(<DatabaseLinkCard {...defaultProps} />);
    
    expect(screen.getByText('Test Database')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('navigates when clicked', () => {
    const { container } = render(<DatabaseLinkCard {...defaultProps} />);
    const link = container.querySelector('a');
    
    expect(link).toHaveAttribute('href', '/test');
  });

  it('applies component ID', () => {
    render(
      <DatabaseLinkCard 
        {...defaultProps} 
        componentId="test-db-card" 
      />
    );
    
    const card = screen.getByText('Test Database').closest('a');
    expect(card).toHaveAttribute('data-component-id', 'test-db-card');
  });
});
```

### Integration Testing

```tsx
describe('Navigation Cards Integration', () => {
  it('renders side by side in grid layout', () => {
    render(
      <div className="dashboard-content-grid">
        <DatabaseLinkCard {...dbProps} />
        <TasksLinkCard {...tasksProps} />
      </div>
    );
    
    const cards = screen.getAllByRole('link');
    expect(cards).toHaveLength(2);
  });
});
```

## Common Issues & Solutions

### Issue: Cards Not Side-by-Side

**Problem**: Cards stack vertically instead of appearing side-by-side.

**Solution**: Ensure proper grid configuration:
```yaml
position:
  col: 1      # First card starts at column 1
  span: 6     # Each card spans 6 columns

position:
  col: 7      # Second card starts at column 7
  span: 6     # Also spans 6 columns
```

### Issue: Hover Effects Not Working

**Problem**: Card hover animations don't trigger.

**Solution**: Check CSS selector specificity:
```css
.page-dashboard .link-card:hover {
  /* Ensure .page-dashboard prefix is present */
}
```

### Issue: Icons Not Displaying

**Problem**: Icons appear as broken or missing.

**Solution**: Verify icon imports and names:
```tsx
import { Database, CheckSquare } from 'lucide-react';
// Ensure icon prop matches import name exactly
```

### Issue: Responsive Layout Breaking

**Problem**: Cards don't adapt well to mobile screens.

**Solution**: Add responsive CSS:
```css
@media (max-width: 768px) {
  .page-dashboard .link-card {
    grid-column: 1 / -1; /* Full width on mobile */
  }
}
```

### Issue: Navigation Not Working

**Problem**: Clicking cards doesn't navigate to intended pages.

**Solution**: Verify href values and routing setup:
```tsx
// Ensure href matches your routing structure
href="/databases" // Must match existing route
```

## Migration Guide

### From Legacy Navigation

```tsx
// Old implementation
<nav className="dashboard-nav">
  <a href="/databases">Databases</a>
  <a href="/tasks">Tasks</a>
</nav>

// New implementation
<>
  <DatabaseLinkCard 
    title="Databases"
    description="Manage your databases"
    href="/databases"
    icon="Database"
  />
  <TasksLinkCard 
    title="Tasks"
    description="Organize and track tasks"
    href="/tasks"
    icon="CheckSquare"
  />
</>
```

### Style Migration

```css
/* Old styles */
.nav-card { background: blue; }

/* New styles */
.page-dashboard .link-card { 
  background: var(--color-primary); 
}
```

## Related Documentation

- [Component Catalog](./component-catalog.md) - Overview of all dashboard components
- [Dashboard Container](./dashboard-container.md) - Parent container component
- [WelcomeHeader](./welcome-header.md) - Page header component
- [Component Patterns](../architecture/component-patterns.md) - Development patterns
- [Layout Configuration](../configuration/layout-config.md) - Grid positioning
- [Styling Overview](../styling/styling-overview.md) - Dashboard styling system

## Summary

The Navigation Cards (DatabaseLinkCard and TasksLinkCard) provide an essential navigation mechanism for the dashboard, offering:

- **Prominent Visual Design**: Eye-catching cards with icons and descriptions
- **Consistent Interaction**: Hover effects and smooth transitions
- **Grid Integration**: Perfect alignment with the dashboard's 12-column grid
- **Customizable Content**: Flexible titles, descriptions, and destinations
- **Accessibility Support**: Full keyboard navigation and screen reader compatibility
- **Responsive Design**: Adapts gracefully to different screen sizes

These components work together to create an intuitive navigation experience that guides users to the most important sections of the dashboard system.