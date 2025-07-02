# WelcomeHeader Component Documentation

## Overview

The `WelcomeHeader` component is the primary heading element for the Dashboard page, providing a clean and prominent title section with support for subtitles. It serves as the visual introduction to the dashboard, establishing the page context and welcoming users with customizable messaging.

## Purpose

The WelcomeHeader component is designed to:
- Display the main dashboard title prominently
- Provide contextual subtitle information
- Establish visual hierarchy at the top of the page
- Adapt to theme customizations
- Span the full width of the dashboard grid

## Component API

### Props Interface

```typescript
interface WelcomeHeaderProps {
  title: string;           // Main heading text (required)
  subtitle: string;        // Secondary descriptive text (required)
  theme?: any;            // Theme customization object (optional)
  componentId?: string;   // Unique component identifier (optional)
  pageId?: string;        // Parent page identifier (optional)
}
```

### Required Props

- **title**: The main heading text displayed prominently
- **subtitle**: Supporting text that provides additional context

### Optional Props

- **theme**: Custom theme object for component-specific styling
- **componentId**: Used for targeting specific instances in automation
- **pageId**: Identifies the parent page (typically 'dashboard')

## Usage Examples

### Basic Implementation

```tsx
import { WelcomeHeader } from './components';

<WelcomeHeader 
  title="Dashboard"
  subtitle="Welcome to your admin dashboard"
/>
```

### With Custom Messaging

```tsx
<WelcomeHeader 
  title="Analytics Dashboard"
  subtitle="Real-time insights and performance metrics"
/>
```

### With Component Identification

```tsx
<WelcomeHeader 
  title="Dashboard"
  subtitle="Welcome back, Admin"
  componentId="main-welcome-header"
  pageId="dashboard"
/>
```

### Dynamic Content

```tsx
const currentUser = useCurrentUser();

<WelcomeHeader 
  title={`Welcome, ${currentUser.name}`}
  subtitle={`Last login: ${currentUser.lastLogin}`}
/>
```

## Configuration in YAML

The WelcomeHeader is configured in the dashboard's `config.yaml`:

```yaml
components:
  - id: "welcome-header"
    type: "WelcomeHeader"
    position:
      col: 1      # Start at first column
      row: 1      # First row
      span: 12    # Full width (all 12 columns)
    props:
      title: "Dashboard"
      subtitle: "Welcome to your admin dashboard"
```

### Position Configuration

- **col**: Starting column (1-12)
- **row**: Grid row position
- **span**: Number of columns to span (typically 12 for full width)

## Styling

### CSS Classes

The component uses the following CSS class structure:

```css
.welcome-header {
  /* Container styles */
}

.welcome-header h1 {
  /* Title styles */
}

.welcome-header p {
  /* Subtitle styles */
}
```

### Default Styles

```css
.page-dashboard .welcome-header {
  grid-column: 1 / -1;              /* Full width span */
  margin-bottom: var(--spacing-lg); /* Bottom spacing */
}

.page-dashboard .welcome-header h1 {
  font-size: var(--font-size-3xl);  /* 1.875rem */
  font-weight: 700;                 /* Bold */
  color: var(--color-text);         /* Primary text color */
  margin: 0;
  line-height: 1.2;
}

.page-dashboard .welcome-header p {
  font-size: var(--font-size-lg);           /* 1.125rem */
  color: var(--color-text-secondary);       /* Muted text */
  margin: var(--spacing-sm) 0 0 0;          /* Top margin only */
}
```

### CSS Variables Used

```css
--font-size-3xl: 1.875rem;      /* Title size */
--font-size-lg: 1.125rem;       /* Subtitle size */
--color-text: #111827;          /* Primary text color */
--color-text-secondary: #6b7280; /* Secondary text color */
--spacing-lg: 1.5rem;           /* Bottom margin */
--spacing-sm: 0.5rem;           /* Subtitle top margin */
```

## Common Modifications

### 1. Changing Title Size

```css
.page-dashboard .welcome-header h1 {
  font-size: 2.5rem; /* Larger title */
}
```

### 2. Adding Gradient Text

```css
.page-dashboard .welcome-header h1 {
  background: linear-gradient(to right, #f97316, #ea580c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 3. Custom Spacing

```css
.page-dashboard .welcome-header {
  margin-bottom: 3rem; /* More space below header */
  padding: 2rem 0;     /* Add vertical padding */
}
```

### 4. Adding Background

```css
.page-dashboard .welcome-header {
  background: var(--color-surface);
  padding: 2rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
```

### 5. Responsive Typography

```css
@media (max-width: 768px) {
  .page-dashboard .welcome-header h1 {
    font-size: 1.5rem;
  }
  
  .page-dashboard .welcome-header p {
    font-size: 1rem;
  }
}
```

## Advanced Customization

### Theme Integration

The component accepts a theme prop for runtime styling:

```tsx
<WelcomeHeader 
  title="Dashboard"
  subtitle="Analytics Overview"
  theme={{
    titleColor: '#1a1a1a',
    subtitleColor: '#666666',
    fontFamily: 'Inter, sans-serif'
  }}
/>
```

### Conditional Rendering

```tsx
const WelcomeSection = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <WelcomeHeaderSkeleton />;
  
  return (
    <WelcomeHeader 
      title={user ? `Welcome, ${user.name}` : 'Dashboard'}
      subtitle={user ? `Role: ${user.role}` : 'Please sign in'}
    />
  );
};
```

### Animation Effects

```css
.page-dashboard .welcome-header {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Integration Examples

### With Data Fetching

```tsx
const DynamicWelcomeHeader = () => {
  const { data: stats } = useDashboardStats();
  
  return (
    <WelcomeHeader 
      title="Dashboard"
      subtitle={`${stats?.activeUsers || 0} active users today`}
    />
  );
};
```

### With Internationalization

```tsx
import { useTranslation } from 'react-i18next';

const LocalizedWelcomeHeader = () => {
  const { t } = useTranslation();
  
  return (
    <WelcomeHeader 
      title={t('dashboard.title')}
      subtitle={t('dashboard.subtitle')}
    />
  );
};
```

### With User Preferences

```tsx
const PersonalizedWelcomeHeader = () => {
  const { preferences } = useUserPreferences();
  
  return (
    <WelcomeHeader 
      title={preferences.dashboardTitle || 'Dashboard'}
      subtitle={preferences.welcomeMessage || 'Welcome to your dashboard'}
    />
  );
};
```

## Accessibility Considerations

### Semantic HTML

The component uses semantic heading tags:
- `<h1>` for the main title (only one per page)
- `<p>` for the subtitle

### Screen Reader Support

```tsx
<WelcomeHeader 
  title="Dashboard"
  subtitle="Navigation and metrics overview"
  aria-label="Dashboard welcome section"
/>
```

### Heading Hierarchy

Ensure the WelcomeHeader's `<h1>` is the only h1 on the page:

```tsx
// ✅ Correct - WelcomeHeader has the only h1
<WelcomeHeader title="Dashboard" />
<Section title="Analytics" /> // Uses h2

// ❌ Incorrect - Multiple h1 tags
<WelcomeHeader title="Dashboard" />
<AnotherComponent><h1>Analytics</h1></AnotherComponent>
```

## Testing Strategies

### Unit Testing

```tsx
import { render, screen } from '@testing-library/react';
import { WelcomeHeader } from './WelcomeHeader';

describe('WelcomeHeader', () => {
  it('renders title and subtitle', () => {
    render(
      <WelcomeHeader 
        title="Test Dashboard"
        subtitle="Test Subtitle"
      />
    );
    
    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });
  
  it('applies component ID when provided', () => {
    render(
      <WelcomeHeader 
        title="Dashboard"
        subtitle="Welcome"
        componentId="test-header"
      />
    );
    
    const header = screen.getByText('Dashboard').closest('.welcome-header');
    expect(header).toHaveAttribute('data-component-id', 'test-header');
  });
});
```

### Visual Testing

```tsx
// Storybook story
export const Default = () => (
  <WelcomeHeader 
    title="Dashboard"
    subtitle="Welcome to your admin dashboard"
  />
);

export const LongContent = () => (
  <WelcomeHeader 
    title="Enterprise Analytics Dashboard"
    subtitle="Comprehensive business intelligence and real-time performance metrics for your organization"
  />
);
```

## Common Issues & Solutions

### Issue: Title Text Wrapping

**Problem**: Long titles wrap incorrectly on smaller screens.

**Solution**: Add responsive text handling:
```css
.page-dashboard .welcome-header h1 {
  word-wrap: break-word;
  hyphens: auto;
}
```

### Issue: Inconsistent Spacing

**Problem**: Header spacing varies between pages.

**Solution**: Use consistent CSS variables:
```css
.welcome-header {
  margin-bottom: var(--spacing-lg); /* Always use variables */
}
```

### Issue: Theme Not Applied

**Problem**: Custom theme props not affecting styling.

**Solution**: Implement theme handling in component:
```tsx
<div 
  className="welcome-header" 
  style={{
    '--title-color': theme?.titleColor,
    '--subtitle-color': theme?.subtitleColor
  }}
>
```

### Issue: Missing Semantic Structure

**Problem**: Multiple h1 tags on the page.

**Solution**: Ensure WelcomeHeader is the only h1:
```tsx
// Configure other components to use h2-h6
<WelcomeHeader title="Main Title" /> // h1
<SectionHeader level={2} title="Section" /> // h2
```

## Performance Considerations

### Memoization

For static content, memoize the component:

```tsx
import { memo } from 'react';

export const WelcomeHeader = memo<WelcomeHeaderProps>(({ 
  title, 
  subtitle 
}) => {
  return (
    <div className="welcome-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
});
```

### Dynamic Import

For conditional rendering:

```tsx
const WelcomeHeader = dynamic(
  () => import('./components/WelcomeHeader'),
  { ssr: true }
);
```

## Migration Guide

### From Legacy Header

If migrating from an older header component:

```tsx
// Old implementation
<PageHeader>
  <h1>Dashboard</h1>
  <span>Welcome message</span>
</PageHeader>

// New implementation
<WelcomeHeader 
  title="Dashboard"
  subtitle="Welcome message"
/>
```

### Style Migration

```css
/* Old styles */
.page-header h1 { font-size: 32px; }

/* New styles using variables */
.welcome-header h1 { font-size: var(--font-size-3xl); }
```

## Related Documentation

- [Component Catalog](./component-catalog.md) - Overview of all dashboard components
- [Dashboard Container](./dashboard-container.md) - Parent container component
- [Component Patterns](../architecture/component-patterns.md) - Development patterns
- [Theme Configuration](../configuration/theme-config.md) - Theming system
- [Creating Components](./creating-components.md) - Guide for new components

## Summary

The WelcomeHeader component provides a simple yet essential function: displaying the dashboard's title and subtitle with proper styling and semantic structure. Its key features include:

- Clean, semantic HTML structure with h1 and p tags
- Full-width grid spanning for prominent display
- Theme integration support
- Responsive typography
- Easy customization through CSS variables
- Accessibility-compliant heading hierarchy

This component sets the visual tone for the dashboard and should be the first component rendered in the dashboard layout, establishing the page context for users.