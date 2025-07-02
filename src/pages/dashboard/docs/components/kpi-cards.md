# KPICards Component Documentation

## Overview

The `KPICards` component is a comprehensive metrics display system that renders key performance indicators (KPIs) in an organized, visually appealing grid layout. It supports various data types, formatting options, and interactive features to help users quickly understand important business metrics and performance data.

## Purpose

The KPICards component serves as the primary metrics visualization tool that:
- Displays multiple KPIs in a responsive grid layout
- Supports numeric values with automatic formatting
- Shows trend indicators with delta values and colors
- Provides descriptive context for each metric
- Adapts to different screen sizes automatically
- Integrates seamlessly with the dashboard's design system

## Component API

### Props Interface

```typescript
interface KPICardsProps {
  metrics: KPIMetric[];        // Array of KPI data (required)
  theme?: any;                 // Theme customization (optional)
  componentId?: string;        // Component identifier (optional)
  pageId?: string;             // Parent page identifier (optional)
}

interface KPIMetric {
  id: string;                  // Unique metric identifier (required)
  title: string;               // Metric display name (required)
  value: number | string;      // Metric value (required)
  suffix?: string;             // Value suffix (e.g., "%", "K") (optional)
  description: string;         // Metric context/description (required)
  delta?: string;              // Change indicator (optional)
  deltaType?: 'increase' | 'decrease' | 'neutral'; // Delta styling (optional)
}
```

### Required Props

- **metrics**: Array of KPIMetric objects containing metric data
- Each metric must have: `id`, `title`, `value`, and `description`

### Optional Props

- **theme**: Custom styling object for component-specific theming
- **componentId**: Used for automation targeting and analytics
- **pageId**: Parent page context (typically 'dashboard')

## Usage Examples

### Basic Implementation

```tsx
import { KPICards } from './components';

const basicMetrics = [
  {
    id: "revenue",
    title: "Total Revenue",
    value: 125000,
    suffix: "",
    description: "This quarter"
  },
  {
    id: "users",
    title: "Active Users",
    value: 1450,
    suffix: "",
    description: "Last 30 days"
  }
];

<KPICards metrics={basicMetrics} />
```

### With Trend Indicators

```tsx
const trendMetrics = [
  {
    id: "sales",
    title: "Sales",
    value: 89500,
    suffix: "",
    description: "This month",
    delta: "+12%",
    deltaType: "increase"
  },
  {
    id: "conversion",
    title: "Conversion Rate",
    value: 3.2,
    suffix: "%",
    description: "Last 7 days",
    delta: "-0.5%",
    deltaType: "decrease"
  },
  {
    id: "retention",
    title: "Customer Retention",
    value: 94,
    suffix: "%",
    description: "Monthly rate",
    delta: "stable",
    deltaType: "neutral"
  }
];

<KPICards metrics={trendMetrics} />
```

### Mixed Data Types

```tsx
const mixedMetrics = [
  {
    id: "orders",
    title: "Orders",
    value: 1247,
    suffix: "",
    description: "Today"
  },
  {
    id: "status",
    title: "System Status",
    value: "Healthy",
    suffix: "",
    description: "All systems operational"
  },
  {
    id: "uptime",
    title: "Uptime",
    value: 99.9,
    suffix: "%",
    description: "Last 30 days"
  }
];

<KPICards metrics={mixedMetrics} />
```

### With Component Identification

```tsx
<KPICards 
  metrics={dashboardMetrics}
  componentId="main-kpi-display"
  pageId="dashboard"
/>
```

## Configuration in YAML

The KPICards component is configured in the dashboard's `config.yaml`:

```yaml
components:
  - id: "kpi-cards"
    type: "KPICards"
    position:
      col: 1      # Start at first column
      row: 4      # Fourth row (after other components)
      span: 12    # Full width (all 12 columns)
    props:
      metrics:
        - id: "total-revenue"
          title: "Total Revenue"
          value: 0
          suffix: ""
          description: "From orders table"
        - id: "active-users"
          title: "Active Users"
          value: 0
          suffix: ""
          description: "From customers table"
        - id: "orders-processed"
          title: "Orders Processed"
          value: 247
          suffix: ""
          description: "This month"
        - id: "page-builder"
          title: "Page Builder"
          value: "Ready"
          suffix: ""
          description: "Create custom pages"
```

### Metric Configuration

Each metric in the `metrics` array supports:
- **id**: Unique identifier for the metric
- **title**: Display name shown above the value
- **value**: The actual metric value (number or string)
- **suffix**: Optional unit or symbol (%, K, M, etc.)
- **description**: Context or source information
- **delta**: Optional change indicator
- **deltaType**: Color coding for the delta value

## Styling

### CSS Classes

The KPICards component uses the following class structure:

```css
.kpi-cards {
  /* Main container grid */
}

.kpi-card {
  /* Individual KPI card */
}

.kpi-card-title {
  /* Metric title styling */
}

.kpi-card-value {
  /* Metric value display */
}

.kpi-card-description {
  /* Metric description text */
}

.kpi-card-delta {
  /* Delta/trend indicator */
}

.kpi-card-delta.increase {
  /* Positive trend styling */
}

.kpi-card-delta.decrease {
  /* Negative trend styling */
}

.kpi-card-delta.neutral {
  /* Neutral trend styling */
}
```

### Default Styles

```css
.page-dashboard .kpi-cards {
  display: grid;                                    /* CSS Grid layout */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive columns */
  gap: var(--spacing-base);                         /* 1rem gap between cards */
  grid-column: 1 / -1;                             /* Full width span */
}

.page-dashboard .kpi-card {
  background: var(--color-surface);                /* White background */
  border: 1px solid var(--color-border);           /* Light gray border */
  padding: var(--spacing-xl);                      /* 2rem padding */
  border-radius: var(--radius-lg);                 /* 12px border radius */
  box-shadow: var(--shadow-base);                  /* Subtle shadow */
  transition: all var(--transition-base);          /* 250ms transitions */
}

.page-dashboard .kpi-card:hover {
  transform: translateY(-2px);                     /* Lift effect */
  box-shadow: var(--shadow-lg);                    /* Enhanced shadow */
  border-color: var(--color-primary);              /* Orange border */
}

.page-dashboard .kpi-card-title {
  font-size: var(--font-size-sm);                  /* 0.875rem */
  font-weight: 600;                                /* Semi-bold */
  color: var(--color-text-secondary);              /* Muted color */
  margin: 0 0 var(--spacing-sm) 0;                 /* Bottom margin */
  text-transform: uppercase;                       /* All caps */
  letter-spacing: 0.05em;                         /* Slight letter spacing */
}

.page-dashboard .kpi-card-value {
  font-size: var(--font-size-3xl);                 /* 1.875rem - Large value */
  font-weight: 700;                                /* Bold */
  color: var(--color-text);                        /* Primary text color */
  margin: 0 0 var(--spacing-xs) 0;                 /* Small bottom margin */
  line-height: 1;                                  /* Tight line height */
}

.page-dashboard .kpi-card-description {
  font-size: var(--font-size-sm);                  /* 0.875rem */
  color: var(--color-text-secondary);              /* Muted color */
  margin: 0;                                       /* No margins */
  line-height: 1.4;                               /* Readable line height */
}

.page-dashboard .kpi-card-delta {
  font-size: var(--font-size-sm);                  /* 0.875rem */
  font-weight: 500;                                /* Medium weight */
  margin-top: var(--spacing-xs);                   /* Top margin */
  display: flex;                                   /* Flex layout */
  align-items: center;                             /* Vertical center */
  gap: var(--spacing-xs);                          /* Gap between elements */
}

.page-dashboard .kpi-card-delta.increase {
  color: var(--color-success);                     /* Green for positive */
}

.page-dashboard .kpi-card-delta.decrease {
  color: var(--color-error);                       /* Red for negative */
}

.page-dashboard .kpi-card-delta.neutral {
  color: var(--color-text-secondary);              /* Gray for neutral */
}
```

### CSS Variables Used

```css
--color-surface: #ffffff;        /* Card background */
--color-border: #e5e7eb;         /* Card border */
--color-text: #111827;           /* Primary text */
--color-text-secondary: #6b7280; /* Secondary text */
--color-primary: #f97316;        /* Hover border color */
--color-success: #10b981;        /* Positive delta */
--color-error: #ef4444;          /* Negative delta */
--spacing-xl: 2rem;              /* Card padding */
--spacing-base: 1rem;            /* Grid gap */
--spacing-sm: 0.5rem;            /* Title margin */
--spacing-xs: 0.25rem;           /* Small margins */
--radius-lg: 12px;               /* Border radius */
--shadow-base: /* ... */;        /* Default shadow */
--shadow-lg: /* ... */;          /* Hover shadow */
--font-size-sm: 0.875rem;        /* Small text */
--font-size-3xl: 1.875rem;       /* Value text */
--transition-base: 250ms ease-in-out; /* Hover transitions */
```

## Value Formatting

### Automatic Number Formatting

The component automatically formats large numbers:

```tsx
// Values over 1000 get comma formatting
{ value: 1234567 }  // Displays as "1,234,567"
{ value: 999 }      // Displays as "999"
```

### Custom Suffixes

```tsx
const formattedMetrics = [
  {
    id: "conversion",
    title: "Conversion Rate",
    value: 3.45,
    suffix: "%",           // Displays as "3.45%"
    description: "This week"
  },
  {
    id: "revenue",
    title: "Revenue",
    value: 125,
    suffix: "K",           // Displays as "125K"
    description: "This month"
  }
];
```

### String Values

```tsx
const statusMetrics = [
  {
    id: "system-status",
    title: "System Status",
    value: "Operational",   // String values display as-is
    suffix: "",
    description: "All services running"
  }
];
```

## Delta Indicators

### Delta Types and Colors

```tsx
const deltaExamples = [
  {
    id: "growth",
    title: "Growth Rate",
    value: 15.2,
    suffix: "%",
    description: "Monthly growth",
    delta: "+2.3%",
    deltaType: "increase"    // Green color
  },
  {
    id: "churn",
    title: "Churn Rate",
    value: 2.1,
    suffix: "%",
    description: "Customer churn",
    delta: "-0.5%",
    deltaType: "decrease"    // Red color (bad for churn)
  },
  {
    id: "stability",
    title: "System Stability",
    value: "Stable",
    suffix: "",
    description: "No changes",
    delta: "unchanged",
    deltaType: "neutral"     // Gray color
  }
];
```

### Custom Delta Formatting

```tsx
// Percentage changes
delta: "+12.5%"
delta: "-3.2%"

// Absolute changes
delta: "+127 users"
delta: "-45 orders"

// Descriptive changes
delta: "stable"
delta: "improving"
delta: "declining"
```

## Common Modifications

### 1. Custom Grid Layouts

```css
/* Two-column layout */
.page-dashboard .kpi-cards.two-column {
  grid-template-columns: repeat(2, 1fr);
}

/* Four-column layout */
.page-dashboard .kpi-cards.four-column {
  grid-template-columns: repeat(4, 1fr);
}

/* Fixed card width */
.page-dashboard .kpi-cards.fixed-width {
  grid-template-columns: repeat(auto-fit, 300px);
  justify-content: center;
}
```

### 2. Different Card Sizes

```css
/* Compact cards */
.page-dashboard .kpi-card.compact {
  padding: var(--spacing-lg);
}

.page-dashboard .kpi-card.compact .kpi-card-value {
  font-size: var(--font-size-2xl);
}

/* Large cards */
.page-dashboard .kpi-card.large {
  padding: var(--spacing-2xl);
}

.page-dashboard .kpi-card.large .kpi-card-value {
  font-size: 3rem;
}
```

### 3. Color-Coded Cards

```css
/* Success-themed card */
.page-dashboard .kpi-card.success {
  border-color: var(--color-success);
  background: rgba(16, 185, 129, 0.05);
}

/* Warning-themed card */
.page-dashboard .kpi-card.warning {
  border-color: var(--color-warning);
  background: rgba(245, 158, 11, 0.05);
}

/* Error-themed card */
.page-dashboard .kpi-card.error {
  border-color: var(--color-error);
  background: rgba(239, 68, 68, 0.05);
}
```

### 4. Enhanced Value Display

```css
/* Currency formatting */
.page-dashboard .kpi-card-value.currency::before {
  content: "$";
  font-size: 0.8em;
  vertical-align: top;
}

/* Large number indicators */
.page-dashboard .kpi-card-value.large-number {
  font-family: 'Roboto Mono', monospace;
}
```

### 5. Interactive Cards

```css
/* Clickable cards */
.page-dashboard .kpi-card.clickable {
  cursor: pointer;
}

.page-dashboard .kpi-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.page-dashboard .kpi-card.clickable:active {
  transform: translateY(-1px);
}
```

## Advanced Customization

### Dynamic Metric Loading

```tsx
const DynamicKPICards = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics');
        const data = await response.json();
        setMetrics(data.metrics);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <KPICardsSkeleton />;
  }

  return <KPICards metrics={metrics} />;
};
```

### Real-Time Updates

```tsx
const RealTimeKPICards = () => {
  const [metrics, setMetrics] = useState(initialMetrics);

  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedMetrics = await fetchLatestMetrics();
      setMetrics(updatedMetrics);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return <KPICards metrics={metrics} />;
};
```

### Conditional Metric Display

```tsx
const ConditionalKPICards = ({ userRole, permissions }) => {
  const getVisibleMetrics = () => {
    return allMetrics.filter(metric => {
      if (metric.id === 'revenue' && !permissions.viewFinancials) {
        return false;
      }
      if (metric.id === 'admin-stats' && userRole !== 'admin') {
        return false;
      }
      return true;
    });
  };

  return <KPICards metrics={getVisibleMetrics()} />;
};
```

### Custom Formatting

```tsx
const CustomFormattedKPICards = ({ rawMetrics }) => {
  const formatMetrics = (metrics) => {
    return metrics.map(metric => ({
      ...metric,
      value: formatValue(metric.value, metric.type),
      delta: formatDelta(metric.delta, metric.deltaType)
    }));
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'percentage':
        return `${value}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value;
    }
  };

  return <KPICards metrics={formatMetrics(rawMetrics)} />;
};
```

## Accessibility Features

### Semantic HTML

The component uses semantic HTML structure:
- Proper heading hierarchy with `<h3>` for titles
- Descriptive text in `<p>` tags
- Logical reading order

### Screen Reader Support

```tsx
<KPICards 
  metrics={metrics}
  aria-label="Key performance indicators dashboard"
  componentId="main-kpis"
/>
```

### Color Accessibility

The delta indicators use both color and text:
- Green for positive changes with "+" prefix
- Red for negative changes with "-" prefix
- Descriptive text for context

## Performance Considerations

### Memoization

```tsx
import { memo, useMemo } from 'react';

export const KPICards = memo<KPICardsProps>(({ metrics }) => {
  const formattedMetrics = useMemo(() => {
    return metrics.map(formatMetric);
  }, [metrics]);

  return (
    <div className="kpi-cards">
      {formattedMetrics.map(renderKPICard)}
    </div>
  );
});
```

### Virtualization for Large Sets

```tsx
import { FixedSizeGrid as Grid } from 'react-window';

const VirtualizedKPICards = ({ metrics }) => {
  const itemsPerRow = 3;
  const rowCount = Math.ceil(metrics.length / itemsPerRow);

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * itemsPerRow + columnIndex;
    const metric = metrics[index];
    
    if (!metric) return <div style={style} />;
    
    return (
      <div style={style}>
        <KPICard metric={metric} />
      </div>
    );
  };

  return (
    <Grid
      columnCount={itemsPerRow}
      columnWidth={300}
      height={400}
      rowCount={rowCount}
      rowHeight={200}
      width="100%"
    >
      {Cell}
    </Grid>
  );
};
```

## Testing Strategies

### Unit Testing

```tsx
import { render, screen } from '@testing-library/react';
import { KPICards } from './KPICards';

describe('KPICards', () => {
  const mockMetrics = [
    {
      id: "test-metric",
      title: "Test Metric",
      value: 1234,
      suffix: "",
      description: "Test description"
    },
    {
      id: "test-metric-2",
      title: "Test Metric 2",
      value: "Active",
      suffix: "",
      description: "Status metric",
      delta: "+10%",
      deltaType: "increase"
    }
  ];

  it('renders all metrics', () => {
    render(<KPICards metrics={mockMetrics} />);
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('Test Metric 2')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('formats numbers correctly', () => {
    const numberMetric = [{
      id: "number-test",
      title: "Number Test",
      value: 1234567,
      suffix: "",
      description: "Large number"
    }];

    render(<KPICards metrics={numberMetric} />);
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('displays delta indicators with correct styling', () => {
    render(<KPICards metrics={mockMetrics} />);
    
    const deltaElement = screen.getByText('+10%');
    expect(deltaElement).toHaveClass('increase');
  });

  it('applies component ID when provided', () => {
    const { container } = render(
      <KPICards 
        metrics={mockMetrics} 
        componentId="test-kpi-cards" 
      />
    );
    
    const kpiContainer = container.querySelector('.kpi-cards');
    expect(kpiContainer).toHaveAttribute('data-component-id', 'test-kpi-cards');
  });
});
```

### Integration Testing

```tsx
describe('KPICards Integration', () => {
  it('updates when metrics change', () => {
    const { rerender } = render(<KPICards metrics={initialMetrics} />);
    expect(screen.getByText('100')).toBeInTheDocument();

    const updatedMetrics = [
      { ...initialMetrics[0], value: 200 }
    ];
    
    rerender(<KPICards metrics={updatedMetrics} />);
    expect(screen.getByText('200')).toBeInTheDocument();
  });
});
```

### Visual Testing

```tsx
// Storybook stories
export const Default = () => (
  <KPICards metrics={defaultMetrics} />
);

export const WithDeltas = () => (
  <KPICards metrics={metricsWithDeltas} />
);

export const LoadingState = () => (
  <KPICards metrics={skeletonMetrics} />
);

export const ErrorState = () => (
  <KPICards metrics={errorMetrics} />
);
```

## Common Issues & Solutions

### Issue: Cards Not Responsive

**Problem**: Cards don't adapt to screen size changes.

**Solution**: Ensure proper grid configuration:
```css
.page-dashboard .kpi-cards {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
```

### Issue: Large Numbers Overflow

**Problem**: Very large numbers break card layout.

**Solution**: Add overflow handling:
```css
.page-dashboard .kpi-card-value {
  word-break: break-all;
  overflow-wrap: break-word;
}
```

### Issue: Delta Colors Not Showing

**Problem**: Delta indicators appear without color coding.

**Solution**: Verify deltaType values:
```tsx
// Ensure deltaType matches CSS classes
deltaType: "increase" // not "positive"
deltaType: "decrease" // not "negative"
deltaType: "neutral"  // not "stable"
```

### Issue: Performance with Many Metrics

**Problem**: Page becomes slow with 20+ metrics.

**Solution**: Implement virtualization or pagination:
```tsx
const chunkedMetrics = useMemo(() => 
  metrics.slice(0, maxVisible), [metrics, maxVisible]
);
```

### Issue: Inconsistent Card Heights

**Problem**: Cards with different content have uneven heights.

**Solution**: Use CSS Grid alignment:
```css
.page-dashboard .kpi-cards {
  align-items: stretch;
}

.page-dashboard .kpi-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
```

## Data Integration

### API Integration

```tsx
const useKPIData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard/kpis')
      .then(response => response.json())
      .then(data => setData(data.metrics))
      .catch(error => setError(error))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};
```

### Database Integration

```tsx
// Example with Supabase
const useDatabaseKPIs = () => {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    const fetchKPIs = async () => {
      const { data: orders } = await supabase
        .from('orders')
        .select('amount')
        .gte('created_at', startOfMonth());

      const { data: users } = await supabase
        .from('users')
        .select('id')
        .gte('last_active', thirtyDaysAgo());

      setMetrics([
        {
          id: 'revenue',
          title: 'Monthly Revenue',
          value: orders.reduce((sum, order) => sum + order.amount, 0),
          suffix: '',
          description: 'This month'
        },
        {
          id: 'active-users',
          title: 'Active Users',
          value: users.length,
          suffix: '',
          description: 'Last 30 days'
        }
      ]);
    };

    fetchKPIs();
  }, []);

  return metrics;
};
```

## Related Documentation

- [Component Catalog](./component-catalog.md) - Overview of all dashboard components
- [Dashboard Container](./dashboard-container.md) - Parent container component
- [Data Configuration](../configuration/data-config.md) - Data source configuration
- [Component Patterns](../architecture/component-patterns.md) - Development patterns
- [Styling Overview](../styling/styling-overview.md) - Dashboard styling system
- [API Reference](../data/api-reference.md) - API integration patterns

## Summary

The KPICards component provides a comprehensive solution for displaying key performance indicators:

- **Flexible Data Display**: Supports numbers, strings, and formatted values
- **Responsive Grid Layout**: Automatically adapts to screen sizes
- **Trend Indicators**: Color-coded delta values for change tracking
- **Professional Design**: Clean cards with hover effects and proper spacing
- **High Performance**: Optimized for large datasets with formatting
- **Accessibility Compliant**: Semantic HTML and screen reader friendly
- **Easy Integration**: Works with APIs, databases, and static data
- **Customizable Styling**: Extensive CSS customization options

This component serves as the primary metrics dashboard, giving users immediate insight into important business KPIs while maintaining a clean, professional appearance that integrates seamlessly with the overall dashboard design.