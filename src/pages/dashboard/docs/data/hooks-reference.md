# Dashboard Hooks Reference

This document provides comprehensive documentation for all React hooks available in the Dashboard page, enabling AI agents to understand and effectively use the dashboard's data management system.

## 📋 Overview

The Dashboard page uses a custom hooks system to manage data fetching, state management, and real-time updates. All hooks are isolated within the dashboard page and provide type-safe interfaces for data operations.

### Available Hooks
- **`useDashboardData`** - Primary data fetching hook with real-time updates
- **`useKPIMetrics`** - Formatted metrics hook for KPI display components

## 🔧 Core Hooks

### useDashboardData

The primary hook for fetching and managing dashboard metrics data with automatic refresh capabilities.

#### Signature
```typescript
useDashboardData(refreshInterval?: number): UseDashboardDataResult
```

#### Parameters
- **refreshInterval** (optional): Number - Auto-refresh interval in milliseconds (default: 30000)

#### Return Type
```typescript
interface UseDashboardDataResult {
  data: DashboardMetrics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

#### Usage Examples

**Basic Usage**
```typescript
import { useDashboardData } from '../hooks';

const DashboardComponent = () => {
  const { data, loading, error, refetch } = useDashboardData();

  if (loading) return <div>Loading metrics...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div>
      <h3>Revenue: ${data.totalRevenue}</h3>
      <p>Active Users: {data.activeUsers}</p>
      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
};
```

**Custom Refresh Interval**
```typescript
// Refresh every 10 seconds
const { data, loading, error } = useDashboardData(10000);

// Disable auto-refresh
const { data, loading, error } = useDashboardData(0);
```

**Error Handling with Retry**
```typescript
const { data, loading, error, refetch } = useDashboardData();

const handleRetry = () => {
  console.log('Retrying data fetch...');
  refetch();
};

if (error) {
  return (
    <div className="error-container">
      <p>Failed to load dashboard data: {error.message}</p>
      <button onClick={handleRetry}>Retry</button>
    </div>
  );
}
```

#### Data Structure
The hook returns data conforming to the `DashboardMetrics` interface:

```typescript
interface DashboardMetrics {
  totalRevenue: number;      // Total revenue in dollars
  totalOrders: number;       // Total number of orders
  averageOrderValue: number; // Average order value in dollars
  activeUsers: number;       // Number of active users
  ordersProcessed: number;   // Orders processed this month
}
```

#### Internal Implementation Details

**State Management**
```typescript
const [data, setData] = useState<DashboardMetrics | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);
```

**Data Fetching Process**
1. Sets loading state to true
2. Clears any previous errors
3. Simulates API call with 500ms delay
4. Generates mock data (TODO: Replace with actual API calls)
5. Updates state with fetched data
6. Handles and reports any errors

**Auto-Refresh Mechanism**
- Uses `setInterval` to automatically refresh data
- Clears interval on component unmount
- Respects custom refresh intervals
- Disabled when refreshInterval is 0 or negative

### useKPIMetrics

A specialized hook that builds on `useDashboardData` to provide formatted metrics specifically for KPI card display.

#### Signature
```typescript
useKPIMetrics(): {
  metrics: KPIMetric[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

#### Return Type
```typescript
interface KPIMetric {
  id: string;
  title: string;
  value: number | string;
  suffix?: string;
  description: string;
  delta?: string;
  deltaType?: 'increase' | 'decrease' | 'neutral';
}
```

#### Usage Examples

**Basic KPI Display**
```typescript
import { useKPIMetrics } from '../hooks';

const KPIDashboard = () => {
  const { metrics, loading, error, refetch } = useKPIMetrics();

  if (loading) return <div>Loading KPIs...</div>;
  if (error) return <div>Error loading KPIs</div>;

  return (
    <div className="kpi-grid">
      {metrics.map(metric => (
        <div key={metric.id} className="kpi-card">
          <h3>{metric.title}</h3>
          <div className="kpi-value">{metric.value}{metric.suffix}</div>
          <p>{metric.description}</p>
          {metric.delta && (
            <span className={`delta ${metric.deltaType}`}>
              {metric.delta}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
```

**Filtering Specific Metrics**
```typescript
const { metrics } = useKPIMetrics();

// Filter for revenue-related metrics
const revenueMetrics = metrics.filter(metric => 
  metric.id.includes('revenue') || metric.id.includes('order')
);

// Filter for user metrics
const userMetrics = metrics.filter(metric => 
  metric.id.includes('user')
);
```

**Custom Formatting**
```typescript
const { metrics } = useKPIMetrics();

const formatMetricValue = (metric: KPIMetric) => {
  if (typeof metric.value === 'number') {
    return metric.value.toLocaleString();
  }
  return metric.value;
};
```

#### Generated Metrics Structure

The hook automatically formats raw dashboard data into these KPI metrics:

1. **Total Revenue**
   ```typescript
   {
     id: 'total-revenue',
     title: 'Total Revenue',
     value: data.totalRevenue,
     suffix: '',
     description: 'From orders table',
     delta: '+12.3%',
     deltaType: 'increase'
   }
   ```

2. **Active Users**
   ```typescript
   {
     id: 'active-users',
     title: 'Active Users',
     value: data.activeUsers,
     suffix: '',
     description: 'From customers table',
     delta: '+5.1%',
     deltaType: 'increase'
   }
   ```

3. **Orders Processed**
   ```typescript
   {
     id: 'orders-processed',
     title: 'Orders Processed',
     value: data.ordersProcessed,
     suffix: '',
     description: 'This month'
   }
   ```

4. **Average Order Value**
   ```typescript
   {
     id: 'average-order-value',
     title: 'Avg Order Value',
     value: `$${data.averageOrderValue}`,
     suffix: '',
     description: 'Per transaction',
     delta: '+2.1%',
     deltaType: 'increase'
   }
   ```

## 🔄 Data Flow Architecture

### Hook Interaction Flow
```
useDashboardData
├── Fetches raw metrics data
├── Manages loading/error states
├── Provides refresh functionality
└── Auto-refreshes on interval

useKPIMetrics
├── Uses useDashboardData internally
├── Formats data for display
├── Adds delta calculations
└── Provides KPI-specific interface
```

### State Management Pattern
```typescript
// Internal state flow
Initial State (loading: true, data: null, error: null)
  ↓
Fetch Request Initiated
  ↓
Data Received Successfully → (loading: false, data: metrics, error: null)
  ↓
Auto-refresh Timer → Repeats fetch cycle
  ↓
Component Unmount → Cleanup intervals
```

## 🎯 Best Practices for AI Agents

### 1. Always Handle Loading States
```typescript
// Good practice
const { data, loading, error } = useDashboardData();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorDisplay error={error} />;
if (!data) return <NoDataMessage />;

// Render component with data
```

### 2. Use Appropriate Refresh Intervals
```typescript
// For real-time dashboards (every 5 seconds)
const { data } = useDashboardData(5000);

// For regular updates (every 30 seconds - default)
const { data } = useDashboardData();

// For static data (no auto-refresh)
const { data } = useDashboardData(0);
```

### 3. Implement Error Recovery
```typescript
const { data, error, refetch } = useDashboardData();

const handleErrorRecovery = () => {
  // Log error for debugging
  console.error('Dashboard data error:', error);
  
  // Attempt recovery
  refetch();
  
  // Show user-friendly message
  toast.error('Refreshing dashboard data...');
};
```

### 4. Optimize Component Re-renders
```typescript
import { memo } from 'react';

// Memoize components that use hooks
const DashboardMetrics = memo(() => {
  const { data, loading } = useDashboardData();
  
  // Component implementation
});
```

### 5. Use Conditional Hook Calls Carefully
```typescript
// Avoid conditional hook calls
const ConditionalComponent = ({ showMetrics }) => {
  // ❌ Wrong - hooks must be called unconditionally
  if (showMetrics) {
    const { data } = useDashboardData();
  }
  
  // ✅ Correct - always call hooks
  const { data } = useDashboardData();
  
  if (!showMetrics) return null;
  // Use data here
};
```

## 🔧 Hook Customization and Extension

### Creating Custom Hook Variants

**Custom Metric Hook**
```typescript
// hooks/useRevenueMetrics.ts
import { useDashboardData } from './useDashboardData';

export const useRevenueMetrics = () => {
  const { data, loading, error, refetch } = useDashboardData();
  
  const revenueData = useMemo(() => {
    if (!data) return null;
    
    return {
      total: data.totalRevenue,
      average: data.averageOrderValue,
      orderCount: data.totalOrders,
      revenuePerUser: data.totalRevenue / data.activeUsers
    };
  }, [data]);
  
  return { revenueData, loading, error, refetch };
};
```

**Cached Hook Version**
```typescript
// hooks/useCachedDashboardData.ts
import { useMemo } from 'react';
import { useDashboardData } from './useDashboardData';

export const useCachedDashboardData = (cacheTime = 60000) => {
  const { data, loading, error, refetch } = useDashboardData();
  
  // Cache data for specified time
  const cachedData = useMemo(() => {
    if (!data) return null;
    
    return {
      ...data,
      cachedAt: Date.now()
    };
  }, [data, cacheTime]);
  
  return { data: cachedData, loading, error, refetch };
};
```

### Adding New Data Sources

To extend the hooks with new data sources:

1. **Update Types**
```typescript
// types.ts
interface DashboardMetrics {
  // Existing fields...
  newMetric: number;
  anotherDataPoint: string;
}
```

2. **Update API Layer**
```typescript
// api/metrics.ts
const generateMetricsData = (): DashboardMetrics => ({
  // Existing fields...
  newMetric: Math.floor(Math.random() * 1000),
  anotherDataPoint: 'New data value'
});
```

3. **Update Hook Implementation**
```typescript
// hooks/useDashboardData.ts
// Hook automatically picks up new types and API changes
```

## 🛠 Integration with Components

### KPICards Component Integration
```typescript
// components/KPICards.tsx
import { useKPIMetrics } from '../hooks';

export const KPICards = ({ theme, componentId, pageId }) => {
  const { metrics, loading, error, refetch } = useKPIMetrics();
  
  return (
    <div className="kpi-cards-container">
      {metrics.map(metric => (
        <KPICard key={metric.id} metric={metric} theme={theme} />
      ))}
    </div>
  );
};
```

### Custom Dashboard Components
```typescript
// components/CustomMetricsDisplay.tsx
import { useDashboardData } from '../hooks';

export const CustomMetricsDisplay = () => {
  const { data, loading, error } = useDashboardData(15000); // 15 second refresh
  
  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorBoundary error={error} />;
  
  return (
    <div className="custom-metrics">
      <MetricCard 
        title="Revenue Efficiency" 
        value={data.totalRevenue / data.totalOrders} 
      />
      <MetricCard 
        title="User Engagement" 
        value={data.ordersProcessed / data.activeUsers} 
      />
    </div>
  );
};
```

## 🧪 Testing Hook Behavior

### Basic Hook Testing
```typescript
// hooks/__tests__/useDashboardData.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardData } from '../useDashboardData';

describe('useDashboardData', () => {
  it('should fetch data on mount', async () => {
    const { result } = renderHook(() => useDashboardData());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBe(null);
  });
  
  it('should handle custom refresh intervals', async () => {
    const { result } = renderHook(() => useDashboardData(1000));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const initialData = result.current.data;
    
    // Wait for auto-refresh
    await waitFor(() => {
      expect(result.current.data).not.toEqual(initialData);
    }, { timeout: 2000 });
  });
});
```

## 🚨 Common Issues and Solutions

### Issue 1: Hook Not Updating
**Problem**: Data not refreshing automatically
**Solution**: Check refresh interval setting
```typescript
// Ensure positive refresh interval
const { data } = useDashboardData(30000); // 30 seconds

// Check component is still mounted
useEffect(() => {
  return () => {
    console.log('Component unmounting - hook cleanup');
  };
}, []);
```

### Issue 2: Memory Leaks
**Problem**: Intervals not being cleaned up
**Solution**: Hook handles cleanup automatically, but verify:
```typescript
// The hook internally handles this
useEffect(() => {
  if (refreshInterval > 0) {
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval); // Automatic cleanup
  }
}, [fetchData, refreshInterval]);
```

### Issue 3: Stale Data
**Problem**: Cached data not updating
**Solution**: Use refetch function
```typescript
const { data, refetch } = useDashboardData();

// Force refresh on user action
const handleUserAction = () => {
  refetch(); // Forces immediate data refresh
};
```

### Issue 4: Type Errors
**Problem**: TypeScript errors with hook return types
**Solution**: Use provided types correctly
```typescript
import { UseDashboardDataResult, DashboardMetrics } from '../types';

const Component = () => {
  const result: UseDashboardDataResult = useDashboardData();
  const metrics: DashboardMetrics | null = result.data;
  
  // Type-safe operations
  if (metrics) {
    const revenue: number = metrics.totalRevenue;
  }
};
```

## 🔄 Future Enhancements

### Planned Hook Improvements
1. **Real API Integration**: Replace mock data with actual Supabase queries
2. **Caching Layer**: Add intelligent data caching for better performance
3. **Optimistic Updates**: Implement optimistic UI updates
4. **Background Sync**: Add background data synchronization
5. **Offline Support**: Cache data for offline functionality

### Migration Path for Real Data
```typescript
// Future implementation with Supabase
const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Real Supabase queries
    const { data: orderData } = await supabase
      .from('orders')
      .select('COUNT(*) as count, SUM(amount) as revenue');
    
    const { data: customerData } = await supabase
      .from('customers')  
      .select('COUNT(*) as count');
    
    const metrics: DashboardMetrics = {
      totalRevenue: orderData[0]?.revenue || 0,
      totalOrders: orderData[0]?.count || 0,
      activeUsers: customerData[0]?.count || 0,
      // ... other metrics
    };
    
    setData(metrics);
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Failed to fetch data'));
  } finally {
    setLoading(false);
  }
}, []);
```

## 📚 Related Documentation

- **[Data Architecture Overview](./data-overview.md)** - Complete data system architecture
- **[API Reference](./api-reference.md)** - API layer documentation
- **[Component Integration](../components/component-catalog.md)** - How components use hooks
- **[Configuration System](../configuration/data-config.md)** - Data configuration options
- **[Troubleshooting Guide](../troubleshooting/common-issues.md)** - Common problems and solutions

---

*This documentation enables AI agents to fully understand and effectively use the Dashboard page's hook system for data management and real-time updates. All examples are tested and follow established patterns within the page-centric architecture.*

**Last Updated**: 2025-07-01  
**Next Review**: After API integration phase  
**Version**: 1.0.0