# Creating New Dashboard Components

This comprehensive guide walks AI agents through the complete process of creating new components for the Dashboard page. Following these patterns ensures components integrate seamlessly with the existing architecture and maintain consistency across the system.

## 🎯 Quick Start Overview

Creating a new Dashboard component involves 6 essential steps:

1. **[Define TypeScript types](#step-1-define-typescript-types)** in `types.ts`
2. **[Create the component file](#step-2-create-component-file)** in `components/`
3. **[Add component styles](#step-3-add-component-styles)** to `styles.css`
4. **[Export from index](#step-4-export-component)** in `components/index.ts`
5. **[Register component](#step-5-register-component)** in `register-components.ts`
6. **[Configure component](#step-6-configure-component)** in `config.yaml`

## 📋 Prerequisites

Before creating a component, ensure you understand:

- **[Component Patterns](../architecture/component-patterns.md)**: Standard patterns and conventions
- **[Component Catalog](component-catalog.md)**: Existing components for reference
- **[Configuration System](../configuration/config-overview.md)**: How components are configured

## 🚀 Step-by-Step Component Creation

### Step 1: Define TypeScript Types

All component types are defined in `/src/pages/dashboard/types.ts`. Add your component's interface following the standard pattern:

```typescript
// Add to src/pages/dashboard/types.ts

export interface YourComponentProps {
  // Required component-specific props
  title: string;
  description: string;
  
  // Optional component-specific props
  showIcon?: boolean;
  actions?: ComponentAction[];
  
  // Standard system props (always included)
  theme?: any;
  componentId?: string;
  pageId?: string;
}

// Define any supporting types
export interface ComponentAction {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
}
```

**Type Definition Standards**:
- Always extend the standard props (`theme`, `componentId`, `pageId`)
- Use clear, descriptive property names
- Mark optional props with `?`
- Define complex objects as separate interfaces
- Include JSDoc comments for complex types

### Step 2: Create Component File

Create your component file in `/src/pages/dashboard/components/YourComponent.tsx`:

```typescript
/**
 * Your Component Name
 * Brief description of component purpose and functionality
 */

import React from 'react';
import { YourComponentProps } from '../types';
// Import any necessary icons from lucide-react
import { Icon, AnotherIcon } from 'lucide-react';

export const YourComponent: React.FC<YourComponentProps> = ({
  // Required props
  title,
  description,
  
  // Optional props with defaults
  showIcon = true,
  actions = [],
  
  // Standard system props
  theme,
  componentId,
  pageId
}) => {
  // Helper functions (if needed)
  const handleAction = (action: ComponentAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      window.location.href = action.href;
    }
  };

  return (
    <div className="your-component" data-component-id={componentId}>
      {/* Header section */}
      <div className="your-component-header">
        {showIcon && <Icon className="your-component-icon" />}
        <h3 className="your-component-title">{title}</h3>
      </div>
      
      {/* Content section */}
      <div className="your-component-content">
        <p className="your-component-description">{description}</p>
      </div>
      
      {/* Actions section (conditional) */}
      {actions.length > 0 && (
        <div className="your-component-actions">
          {actions.map(action => (
            <button
              key={action.id}
              className="your-component-action"
              onClick={() => handleAction(action)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

**Component Development Standards**:
- Include comprehensive JSDoc comment at the top
- Import types from `../types`
- Use functional components with TypeScript
- Follow the standard props destructuring pattern
- Include `data-component-id` attribute on root element
- Use helper functions for complex logic
- Implement conditional rendering for optional elements
- Follow the established CSS class naming convention

### Step 3: Add Component Styles

Add styles to `/src/pages/dashboard/styles.css` following the established patterns:

```css
/* Your Component Styles */
.page-dashboard .your-component {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all 0.2s ease;
}

.page-dashboard .your-component:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Header styles */
.page-dashboard .your-component-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.page-dashboard .your-component-icon {
  width: 24px;
  height: 24px;
  margin-right: var(--spacing-sm);
  color: var(--color-primary);
}

.page-dashboard .your-component-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

/* Content styles */
.page-dashboard .your-component-content {
  margin-bottom: var(--spacing-md);
}

.page-dashboard .your-component-description {
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Actions styles */
.page-dashboard .your-component-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.page-dashboard .your-component-action {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.page-dashboard .your-component-action:hover {
  background: var(--color-primary-dark);
}

/* Responsive design */
@media (max-width: 768px) {
  .page-dashboard .your-component-header {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .page-dashboard .your-component-icon {
    margin-right: 0;
    margin-bottom: var(--spacing-xs);
  }
  
  .page-dashboard .your-component-actions {
    flex-direction: column;
  }
  
  .page-dashboard .your-component-action {
    width: 100%;
    justify-content: center;
  }
}
```

**Styling Standards**:
- Always prefix with `.page-dashboard` for page-specific scoping
- Use CSS custom properties (variables) for colors, spacing, and borders
- Follow the component-element naming pattern (`.component-element`)
- Include hover states for interactive elements
- Implement responsive design patterns for mobile devices
- Use consistent spacing and sizing with the design system
- Add transitions for smooth interactions

### Step 4: Export Component

Add your component to `/src/pages/dashboard/components/index.ts`:

```typescript
// Add to existing exports
export { YourComponent } from './YourComponent';

// Add to type exports
export type {
  YourComponentProps,
  ComponentAction  // If you defined supporting types
} from '../types';
```

**Export Standards**:
- Export the component itself
- Export related types for external use
- Maintain alphabetical order in the export list
- Group component exports and type exports separately

### Step 5: Register Component

Register your component in `/src/pages/dashboard/register-components.ts`:

```typescript
// Add import
import { YourComponent } from './components';

// Add registration call
registerComponent('dashboard', 'YourComponent', YourComponent);
```

**Registration Standards**:
- Use the exact component name as the type string
- Follow the existing import and registration pattern
- Maintain alphabetical order in registrations
- Use 'dashboard' as the page identifier

### Step 6: Configure Component

Add your component to `/src/pages/dashboard/config.yaml`:

```yaml
components:
  # Add your component to the existing list
  - id: "your-component-1"
    type: "YourComponent"
    position:
      col: 1        # Grid column (1-12)
      row: 6        # Grid row number
      span: 6       # Column span (1-12)
      rowSpan: 1    # Row span (optional)
    props:
      title: "Your Component Title"
      description: "Component description text"
      showIcon: true
      actions:
        - id: "action-1"
          label: "Primary Action"
          href: "/some-page"
        - id: "action-2"
          label: "Secondary Action"
          onClick: "handleCustomAction"
```

**Configuration Standards**:
- Use descriptive, unique component IDs
- Position components to avoid conflicts with existing ones
- Provide all required props in the configuration
- Use meaningful default values for optional props
- Follow YAML formatting conventions

## 🔧 Using the Automation Script

The fastest way to add a component is using the automation script:

```bash
# Navigate to the dashboard directory
cd /src/pages/dashboard

# Add a component using the script
node scripts/add-component.ts add YourComponent 6 1 6 '{"title":"New Component","description":"Description text"}'

# List current positions to avoid conflicts
node scripts/add-component.ts list
```

**Script Usage Tips**:
- Always check existing positions with `list` before adding
- Use the script for quick prototyping and testing
- The script automatically handles configuration updates
- Review and adjust the generated configuration as needed

## 📝 Component Categories & Examples

### Layout Components
**Purpose**: Structural layout and containment  
**Example**: Container components, grid wrappers, section dividers

```typescript
export const LayoutComponent: React.FC<LayoutComponentProps> = ({
  children,
  columns = 12,
  gap = 'md',
  theme,
  componentId
}) => {
  return (
    <div 
      className={`layout-component layout-columns-${columns} layout-gap-${gap}`}
      data-component-id={componentId}
    >
      {children}
    </div>
  );
};
```

### Data Display Components  
**Purpose**: Present metrics, charts, and information  
**Example**: Charts, tables, metric cards, progress indicators

```typescript
export const DataDisplay: React.FC<DataDisplayProps> = ({
  data,
  format = 'card',
  showEmpty = true,
  theme,
  componentId
}) => {
  if (!data.length && !showEmpty) return null;
  
  return (
    <div className={`data-display data-display-${format}`} data-component-id={componentId}>
      {data.length ? (
        data.map(item => (
          <div key={item.id} className="data-display-item">
            {/* Render data item */}
          </div>
        ))
      ) : (
        <div className="data-display-empty">No data available</div>
      )}
    </div>
  );
};
```

### Interactive Components
**Purpose**: User actions, forms, controls  
**Example**: Buttons, forms, controls, interactive widgets

```typescript
export const InteractiveComponent: React.FC<InteractiveComponentProps> = ({
  actions,
  onAction,
  disabled = false,
  theme,
  componentId
}) => {
  const handleAction = (actionId: string) => {
    if (!disabled && onAction) {
      onAction(actionId);
    }
  };

  return (
    <div className={`interactive-component ${disabled ? 'disabled' : ''}`} data-component-id={componentId}>
      {actions.map(action => (
        <button
          key={action.id}
          className="interactive-action"
          onClick={() => handleAction(action.id)}
          disabled={disabled}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};
```

### Navigation Components
**Purpose**: Links, menus, routing  
**Example**: Link cards, breadcrumbs, navigation menus

```typescript
import Link from 'next/link';

export const NavigationComponent: React.FC<NavigationComponentProps> = ({
  links,
  style = 'card',
  showIcons = true,
  theme,
  componentId
}) => {
  return (
    <nav className={`navigation-component navigation-${style}`} data-component-id={componentId}>
      {links.map(link => (
        <Link key={link.id} href={link.href} className="navigation-link">
          {showIcons && link.icon && <Icon className="navigation-icon" />}
          <span className="navigation-text">{link.label}</span>
        </Link>
      ))}
    </nav>
  );
};
```

## 🎨 Advanced Patterns

### State Management in Components

```typescript
import React, { useState, useEffect } from 'react';

export const StatefulComponent: React.FC<StatefulComponentProps> = ({
  initialData,
  autoRefresh = false,
  refreshInterval = 30000,
  theme,
  componentId
}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch data logic
      const response = await fetch('/api/data');
      const newData = await response.json();
      setData(newData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stateful-component loading" data-component-id={componentId}>
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stateful-component error" data-component-id={componentId}>
        <p className="error-message">Error: {error}</p>
        <button onClick={fetchData} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="stateful-component" data-component-id={componentId}>
      {/* Render component with data */}
    </div>
  );
};
```

### Custom Hooks Integration

```typescript
// Create custom hook in /src/pages/dashboard/hooks/useCustomData.ts
export const useCustomData = (componentId: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch logic specific to this component
      const result = await api.getComponentData(componentId);
      setData(result);
    } catch (error) {
      console.error('Error fetching component data:', error);
    } finally {
      setLoading(false);
    }
  }, [componentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
};

// Use in component
export const HookBasedComponent: React.FC<HookBasedComponentProps> = ({
  componentId,
  theme
}) => {
  const { data, loading, refetch } = useCustomData(componentId);

  return (
    <div className="hook-based-component" data-component-id={componentId}>
      {/* Component implementation */}
    </div>
  );
};
```

### Configuration-Driven Styling

```typescript
export const ConfigurableComponent: React.FC<ConfigurableComponentProps> = ({
  style = {},
  className = '',
  variant = 'default',
  theme,
  componentId
}) => {
  const componentClasses = [
    'configurable-component',
    `configurable-component-${variant}`,
    className
  ].filter(Boolean).join(' ');

  const componentStyle = {
    ...style,
    ...(theme?.componentOverrides?.[componentId] || {})
  };

  return (
    <div 
      className={componentClasses}
      style={componentStyle}
      data-component-id={componentId}
    >
      {/* Component content */}
    </div>
  );
};
```

## 🧪 Testing Your Component

### Component Testing Checklist

- [ ] **Visual Testing**: Component renders correctly in all screen sizes
- [ ] **Props Testing**: All props work as expected
- [ ] **Interaction Testing**: Interactive elements respond correctly
- [ ] **Error States**: Component handles missing/invalid props gracefully
- [ ] **Accessibility**: Component is accessible with proper ARIA labels
- [ ] **Configuration**: Component integrates with config.yaml correctly

### Manual Testing Steps

1. **Add component to configuration** with test props
2. **Verify rendering** in the dashboard page
3. **Test responsive behavior** at different screen sizes
4. **Validate interactions** (hover, click, focus states)
5. **Check browser console** for errors or warnings
6. **Test with different prop combinations**

### Using Browser DevTools

```javascript
// Test component in browser console
// Find component by data attribute
const component = document.querySelector('[data-component-id="your-component-1"]');

// Verify component structure
console.log(component.className);
console.log(component.dataset);

// Test styling
console.log(getComputedStyle(component));
```

## 🚨 Troubleshooting Common Issues

### Component Not Rendering

**Problem**: Component doesn't appear on the page  
**Solutions**:
- Verify component is exported in `components/index.ts`
- Check component is registered in `register-components.ts`
- Ensure configuration in `config.yaml` is valid
- Check browser console for TypeScript or runtime errors

### Styling Issues

**Problem**: Styles not applying correctly  
**Solutions**:
- Ensure CSS classes use `.page-dashboard` prefix
- Check CSS custom properties are defined in `:root`
- Verify class naming follows the established convention
- Clear browser cache and reload

### Props Not Working

**Problem**: Component props not receiving expected values  
**Solutions**:
- Verify prop types match interface definition
- Check configuration YAML syntax is correct
- Ensure prop names match exactly (case-sensitive)
- Use browser devtools to inspect component props

### Grid Layout Issues

**Problem**: Component positioning conflicts or overflows  
**Solutions**:
- Use `node scripts/add-component.ts list` to check positions
- Verify column span doesn't exceed grid bounds (1-12)
- Check for overlapping components at same row
- Adjust `rowSpan` if component needs more height

## 📚 Reference Examples

### Complete Example: StatusIndicator Component

Here's a complete example showing all patterns together:

```typescript
// 1. Type definition in types.ts
export interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error';
  title: string;
  description?: string;
  showDetails?: boolean;
  onStatusClick?: (status: string) => void;
  theme?: any;
  componentId?: string;
  pageId?: string;
}

// 2. Component implementation
import React from 'react';
import { Circle, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { StatusIndicatorProps } from '../types';

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  title,
  description,
  showDetails = true,
  onStatusClick,
  theme,
  componentId,
  pageId
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'online': return <CheckCircle className="status-icon status-online" />;
      case 'warning': return <AlertTriangle className="status-icon status-warning" />;
      case 'error': return <X className="status-icon status-error" />;
      default: return <Circle className="status-icon status-offline" />;
    }
  };

  const handleStatusClick = () => {
    if (onStatusClick) {
      onStatusClick(status);
    }
  };

  return (
    <div 
      className={`status-indicator status-indicator-${status}`}
      data-component-id={componentId}
      data-testid="status-indicator"
    >
      <div className="status-indicator-header" onClick={handleStatusClick}>
        {getStatusIcon()}
        <h3 className="status-indicator-title">{title}</h3>
      </div>
      
      {showDetails && description && (
        <div className="status-indicator-details">
          <p className="status-indicator-description">{description}</p>
        </div>
      )}
    </div>
  );
};

// 3. Styles in styles.css
.page-dashboard .status-indicator {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all 0.2s ease;
}

.page-dashboard .status-indicator-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: var(--spacing-sm);
}

.page-dashboard .status-icon {
  width: 20px;
  height: 20px;
  margin-right: var(--spacing-sm);
}

.page-dashboard .status-icon.status-online { color: #22c55e; }
.page-dashboard .status-icon.status-warning { color: #f59e0b; }
.page-dashboard .status-icon.status-error { color: #ef4444; }
.page-dashboard .status-icon.status-offline { color: #6b7280; }

.page-dashboard .status-indicator-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.page-dashboard .status-indicator-description {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 0.875rem;
}

// 4. Export from index.ts
export { StatusIndicator } from './StatusIndicator';
export type { StatusIndicatorProps } from '../types';

// 5. Register component
registerComponent('dashboard', 'StatusIndicator', StatusIndicator);

// 6. Configuration example
components:
  - id: "system-status"
    type: "StatusIndicator"
    position: { col: 7, row: 3, span: 6 }
    props:
      status: "online"
      title: "System Status"
      description: "All systems operational"
      showDetails: true
```

## 📖 Related Documentation

- **[Component Patterns](../architecture/component-patterns.md)**: Detailed architectural patterns
- **[Component Catalog](component-catalog.md)**: Reference for all existing components
- **[Configuration System](../configuration/config-overview.md)**: How component configuration works
- **[Automation Scripts](../automation/add-component-script.md)**: Using automation for component creation
- **[Styling System](../styling/styling-overview.md)**: Dashboard styling architecture

---

This guide provides everything needed to create new Dashboard components that integrate seamlessly with the existing system. Follow these patterns to ensure your components are maintainable, accessible, and agent-friendly.