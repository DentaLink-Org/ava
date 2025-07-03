# QuickStartCard Component Documentation

## Overview

The `QuickStartCard` component is an informational guidance card designed to help new users get started with the dashboard. It provides a welcoming message, helpful instructions, and a prominent call-to-action button that directs users to the most relevant section of the application.

## Purpose

The QuickStartCard serves as an onboarding tool that:
- Provides clear guidance for new users
- Highlights the primary action users should take
- Spans the full width of the dashboard for prominence
- Integrates seamlessly with the dashboard's design system
- Offers a welcoming entry point to the application

## Component API

### Props Interface

```typescript
interface QuickStartCardProps {
  title: string;               // Card title (required)
  description: string;         // Instructional text (required)
  primaryAction: {             // Call-to-action configuration (required)
    text: string;              // Link text
    href: string;              // Navigation destination
  };
  theme?: any;                 // Theme customization (optional)
  componentId?: string;        // Component identifier (optional)
  pageId?: string;             // Parent page identifier (optional)
}
```

### Required Props

- **title**: The heading displayed prominently on the card
- **description**: Instructional text that guides the user
- **primaryAction**: Object containing link text and destination URL

### Optional Props

- **theme**: Custom styling object for component-specific theming
- **componentId**: Used for automation targeting and analytics
- **pageId**: Parent page context (typically 'dashboard')

## Usage Examples

### Basic Implementation

```tsx
import { QuickStartCard } from './components';

<QuickStartCard 
  title="Quick Start"
  description="Start by visiting the Databases page to create and manage your data."
  primaryAction={{
    text: "Go to Databases",
    href: "/databases"
  }}
/>
```

### Custom Onboarding Message

```tsx
<QuickStartCard 
  title="Welcome to Analytics"
  description="Begin exploring your data by connecting your first database and running your initial queries."
  primaryAction={{
    text: "Connect Database",
    href: "/databases/new"
  }}
/>
```

### Task-Focused Guidance

```tsx
<QuickStartCard 
  title="Get Organized"
  description="Create your first project and start tracking tasks to improve team productivity."
  primaryAction={{
    text: "Create Project",
    href: "/tasks/new-project"
  }}
/>
```

### With Component Identification

```tsx
<QuickStartCard 
  title="Quick Start"
  description="Start by visiting the Databases page to create and manage your data."
  primaryAction={{
    text: "Go to Databases",
    href: "/databases"
  }}
  componentId="dashboard-quickstart"
  pageId="dashboard"
/>
```

## Configuration in YAML

The QuickStartCard is configured in the dashboard's `config.yaml`:

```yaml
components:
  - id: "quick-start-card"
    type: "QuickStartCard"
    position:
      col: 1      # Start at first column
      row: 3      # Third row (after header and navigation cards)
      span: 12    # Full width (all 12 columns)
    props:
      title: "Quick Start"
      description: "Start by visiting the Databases page to create and manage your data."
      primaryAction:
        text: "Go to Databases"
        href: "/databases"
```

### Position Configuration

- **col**: Starting column (typically 1 for full-width cards)
- **row**: Grid row position
- **span**: Number of columns (typically 12 for full width)

### Action Configuration

The `primaryAction` object defines the call-to-action:
- **text**: The displayed link text
- **href**: The destination URL or route

## Styling

### CSS Classes

The QuickStartCard uses the following class structure:

```css
.quick-start-card {
  /* Main card container */
}

.quick-start-header {
  /* Header section with icon and title */
}

.quick-start-icon {
  /* Icon styling */
}

.quick-start-title {
  /* Title text styling */
}

.quick-start-description {
  /* Description text with embedded link */
}

.quick-start-link {
  /* Call-to-action link styling */
}
```

### Default Styles

```css
.page-dashboard .quick-start-card {
  background: var(--color-primary);        /* Orange background */
  border: 2px solid var(--color-secondary); /* Darker orange border */
  border-radius: var(--radius-lg);         /* 12px border radius */
  padding: var(--spacing-xl);              /* 2rem padding */
  box-shadow: var(--shadow-lg);            /* Elevated shadow */
  grid-column: 1 / -1;                     /* Full width span */
}

.page-dashboard .quick-start-header {
  display: flex;                           /* Flex layout */
  align-items: center;                     /* Vertical center */
  margin-bottom: var(--spacing-base);      /* 1rem bottom margin */
}

.page-dashboard .quick-start-icon {
  width: 1.5rem;                           /* 24px icon size */
  height: 1.5rem;
  color: white;                            /* White icon */
  margin-right: var(--spacing-sm);         /* 0.5rem right margin */
}

.page-dashboard .quick-start-title {
  font-size: var(--font-size-lg);          /* 1.125rem */
  font-weight: 500;                        /* Medium weight */
  color: white;                            /* White text */
  margin: 0;                               /* No margins */
}

.page-dashboard .quick-start-description {
  color: rgba(255, 255, 255, 0.9);         /* Semi-transparent white */
  margin: 0 0 var(--spacing-base) 0;       /* Bottom margin only */
  line-height: 1.5;                       /* Readable line height */
}

.page-dashboard .quick-start-link {
  font-weight: 500;                        /* Medium weight */
  text-decoration: underline;              /* Underlined link */
  color: white;                            /* White text */
  transition: color var(--transition-fast); /* 150ms color transition */
}

.page-dashboard .quick-start-link:hover {
  color: rgba(255, 255, 255, 0.9);         /* Slightly dimmed on hover */
}
```

### CSS Variables Used

```css
--color-primary: #f97316;        /* Main orange background */
--color-secondary: #ea580c;      /* Border color */
--spacing-xl: 2rem;              /* Card padding */
--spacing-base: 1rem;            /* Header bottom margin */
--spacing-sm: 0.5rem;            /* Icon right margin */
--radius-lg: 12px;               /* Border radius */
--shadow-lg: /* ... */;          /* Card shadow */
--font-size-lg: 1.125rem;        /* Title font size */
--transition-fast: 150ms ease-in-out; /* Link hover transition */
```

## Icon System

### Default Icon

The QuickStartCard uses the `Database` icon from Lucide React by default:

```tsx
import { Database } from 'lucide-react';

<Database className="quick-start-icon" />
```

### Custom Icons

To use different icons, modify the component import:

```tsx
import { Zap, Star, Rocket } from 'lucide-react';

// For onboarding
<Zap className="quick-start-icon" />

// For achievement
<Star className="quick-start-icon" />

// For getting started
<Rocket className="quick-start-icon" />
```

## Common Modifications

### 1. Changing Card Colors

```css
.page-dashboard .quick-start-card {
  background: #3b82f6;            /* Blue background */
  border-color: #2563eb;          /* Darker blue border */
}
```

### 2. Different Card Layouts

```css
/* Compact version */
.page-dashboard .quick-start-card.compact {
  padding: var(--spacing-lg);
  grid-column: span 8;            /* Narrower width */
}

/* Centered layout */
.page-dashboard .quick-start-card.centered {
  text-align: center;
}

.page-dashboard .quick-start-card.centered .quick-start-header {
  justify-content: center;
}
```

### 3. Enhanced Typography

```css
.page-dashboard .quick-start-title {
  font-size: var(--font-size-xl);  /* Larger title */
  font-weight: 600;                /* Bolder weight */
}

.page-dashboard .quick-start-description {
  font-size: var(--font-size-base); /* Larger description */
}
```

### 4. Button-Style Action

Instead of an inline link, create a button-style action:

```css
.page-dashboard .quick-start-card .action-button {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-base);
  text-decoration: none;
  font-weight: 500;
  margin-top: var(--spacing-sm);
  transition: all var(--transition-base);
}

.page-dashboard .quick-start-card .action-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}
```

### 5. Gradient Backgrounds

```css
.page-dashboard .quick-start-card {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
}
```

## Advanced Customization

### Dynamic Content

```tsx
const DynamicQuickStartCard = ({ user, onboardingStep }) => {
  const getQuickStartContent = () => {
    switch (onboardingStep) {
      case 'databases':
        return {
          title: "Connect Your Data",
          description: "Set up your first database connection to start analyzing your data.",
          primaryAction: {
            text: "Add Database",
            href: "/databases/new"
          }
        };
      case 'tasks':
        return {
          title: "Organize Your Work",
          description: "Create your first project to track tasks and collaborate with your team.",
          primaryAction: {
            text: "Create Project",
            href: "/tasks/new"
          }
        };
      default:
        return {
          title: "Welcome Back!",
          description: "Continue where you left off or explore new features.",
          primaryAction: {
            text: "View Dashboard",
            href: "/dashboard"
          }
        };
    }
  };

  const content = getQuickStartContent();
  
  return <QuickStartCard {...content} />;
};
```

### Conditional Rendering

```tsx
const ConditionalQuickStartCard = ({ user, completedOnboarding }) => {
  if (completedOnboarding) {
    return (
      <QuickStartCard 
        title="Explore Advanced Features"
        description="You've mastered the basics! Discover advanced analytics and automation tools."
        primaryAction={{
          text: "View Advanced Features",
          href: "/advanced"
        }}
      />
    );
  }

  return (
    <QuickStartCard 
      title="Get Started"
      description="Welcome! Let's set up your first database connection."
      primaryAction={{
        text: "Start Setup",
        href: "/onboarding"
      }}
    />
  );
};
```

### Progress Tracking

```tsx
const ProgressAwareQuickStartCard = ({ completionPercentage }) => {
  return (
    <div className="quick-start-with-progress">
      <QuickStartCard 
        title={`Setup Progress: ${completionPercentage}%`}
        description="Complete your setup to unlock all dashboard features."
        primaryAction={{
          text: "Continue Setup",
          href: "/setup"
        }}
      />
      <div className="progress-bar" style={{ width: `${completionPercentage}%` }} />
    </div>
  );
};
```

## Accessibility Features

### Semantic HTML

The component uses semantic HTML structure:
- Proper heading hierarchy with `<h3>`
- Descriptive text in `<p>` tags
- Semantic `<Link>` components for navigation

### Keyboard Navigation

```tsx
<QuickStartCard 
  title="Quick Start"
  description="Start by visiting the Databases page."
  primaryAction={{
    text: "Go to Databases",
    href: "/databases"
  }}
  aria-label="Quick start guidance card"
/>
```

### Screen Reader Support

The component provides clear context:
- Descriptive title
- Informative description
- Clear action text

## Performance Considerations

### Memoization

```tsx
import { memo } from 'react';

export const QuickStartCard = memo<QuickStartCardProps>(({
  title,
  description,
  primaryAction
}) => {
  // Component implementation
});
```

### Lazy Loading

```tsx
const QuickStartCard = dynamic(
  () => import('./components/QuickStartCard'),
  { ssr: true }
);
```

### Link Prefetching

```tsx
<Link 
  href={primaryAction.href} 
  className="quick-start-link"
  prefetch={true}
>
  {primaryAction.text}
</Link>
```

## Testing Strategies

### Unit Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickStartCard } from './QuickStartCard';

describe('QuickStartCard', () => {
  const defaultProps = {
    title: "Test Quick Start",
    description: "Test description with action.",
    primaryAction: {
      text: "Test Action",
      href: "/test"
    }
  };

  it('renders title and description', () => {
    render(<QuickStartCard {...defaultProps} />);
    
    expect(screen.getByText('Test Quick Start')).toBeInTheDocument();
    expect(screen.getByText(/Test description/)).toBeInTheDocument();
  });

  it('renders action link with correct href', () => {
    render(<QuickStartCard {...defaultProps} />);
    
    const actionLink = screen.getByText('Test Action');
    expect(actionLink).toHaveAttribute('href', '/test');
  });

  it('applies component ID when provided', () => {
    render(
      <QuickStartCard 
        {...defaultProps} 
        componentId="test-quickstart" 
      />
    );
    
    const card = screen.getByText('Test Quick Start').closest('.quick-start-card');
    expect(card).toHaveAttribute('data-component-id', 'test-quickstart');
  });

  it('displays Database icon', () => {
    const { container } = render(<QuickStartCard {...defaultProps} />);
    const icon = container.querySelector('.quick-start-icon');
    expect(icon).toBeInTheDocument();
  });
});
```

### Integration Testing

```tsx
describe('QuickStartCard Integration', () => {
  it('navigates when action link is clicked', async () => {
    const mockPush = jest.fn();
    jest.mock('next/router', () => ({
      useRouter: () => ({
        push: mockPush
      })
    }));

    render(<QuickStartCard {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Test Action'));
    expect(mockPush).toHaveBeenCalledWith('/test');
  });
});
```

## Common Issues & Solutions

### Issue: Action Link Not Working

**Problem**: Clicking the action link doesn't navigate to the intended page.

**Solution**: Verify the href value and routing setup:
```tsx
primaryAction: {
  text: "Go to Databases",
  href: "/databases"  // Ensure this route exists
}
```

### Issue: Card Not Full Width

**Problem**: Card doesn't span the full dashboard width.

**Solution**: Check grid configuration:
```yaml
position:
  col: 1
  span: 12  # Must span all 12 columns
```

### Issue: Styling Not Applied

**Problem**: Custom styles not taking effect.

**Solution**: Ensure CSS selector specificity:
```css
.page-dashboard .quick-start-card {
  /* Styles with proper specificity */
}
```

### Issue: Icon Not Displaying

**Problem**: Database icon appears broken or missing.

**Solution**: Verify Lucide React import:
```tsx
import { Database } from 'lucide-react';
```

### Issue: Text Overflow

**Problem**: Long descriptions cause layout issues.

**Solution**: Add text wrapping and overflow handling:
```css
.page-dashboard .quick-start-description {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
```

## Migration Guide

### From Static HTML

```tsx
// Old implementation
<div className="welcome-message">
  <h3>Get Started</h3>
  <p>Visit databases to begin. <a href="/databases">Go now</a></p>
</div>

// New implementation
<QuickStartCard 
  title="Get Started"
  description="Visit databases to begin."
  primaryAction={{
    text: "Go now",
    href: "/databases"
  }}
/>
```

### Style Migration

```css
/* Old styles */
.welcome-message { background: blue; }

/* New styles */
.page-dashboard .quick-start-card { 
  background: var(--color-primary); 
}
```

## Analytics Integration

### Tracking User Interactions

```tsx
const AnalyticsQuickStartCard = ({ onActionClick }) => {
  const handleActionClick = () => {
    // Track the interaction
    analytics.track('quickstart_action_clicked', {
      action: 'go_to_databases',
      component: 'QuickStartCard'
    });
    
    onActionClick?.();
  };

  return (
    <QuickStartCard 
      title="Quick Start"
      description="Start by visiting the Databases page."
      primaryAction={{
        text: "Go to Databases",
        href: "/databases"
      }}
      onClick={handleActionClick}
    />
  );
};
```

## Related Documentation

- [Component Catalog](./component-catalog.md) - Overview of all dashboard components
- [Navigation Cards](./navigation-cards.md) - DatabaseLinkCard & TasksLinkCard
- [Dashboard Container](./dashboard-container.md) - Parent container component
- [Component Patterns](../architecture/component-patterns.md) - Development patterns
- [Layout Configuration](../configuration/layout-config.md) - Grid positioning
- [Styling Overview](../styling/styling-overview.md) - Dashboard styling system

## Summary

The QuickStartCard component serves as an essential onboarding tool that:

- **Guides New Users**: Provides clear direction for getting started
- **Prominent Placement**: Spans full width for maximum visibility
- **Clear Call-to-Action**: Features embedded links within descriptive text
- **Consistent Design**: Integrates seamlessly with dashboard styling
- **Flexible Content**: Supports customizable titles, descriptions, and actions
- **Accessible Design**: Uses semantic HTML and proper keyboard navigation
- **Theme Integration**: Respects dashboard color scheme and variables

This component is particularly effective for reducing user confusion during initial interactions with the dashboard, providing a clear path forward while maintaining the overall design consistency of the system.