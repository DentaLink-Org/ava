# Dashboard Data Architecture Overview

## Purpose
This document provides a comprehensive overview of the Dashboard page's data architecture within the Claude Dashboard system. The data architecture is designed to be flexible, performant, and easily manageable by AI agents while providing real-time data updates and robust error handling.

## Data Architecture Philosophy

### Core Principles
1. **Page Isolation**: All data logic contained within the dashboard page directory
2. **Type Safety**: Comprehensive TypeScript types for all data structures
3. **Real-time Updates**: Configurable refresh intervals for live data
4. **Error Resilience**: Graceful handling of data failures
5. **Mock-to-Production**: Seamless transition from mock to real data sources
6. **Performance First**: Optimized data fetching and caching strategies

### Architecture Overview
The Dashboard data system follows a **layered architecture pattern**:

```
┌─────────────────┐
│   Components    │ ← React Components (KPICards, etc.)
├─────────────────┤
│     Hooks       │ ← Data Hooks (useDashboardData, useKPIMetrics)
├─────────────────┤
│   API Layer     │ ← API Functions (fetchDashboardMetrics, etc.)
├─────────────────┤
│  Data Sources   │ ← External APIs (Supabase, REST APIs, etc.)
└─────────────────┘
```

## Data Flow Architecture

### 1. Data Source Layer
**Purpose**: Define and configure external data sources
**Location**: `config.yaml` - `data.sources`
**Responsibility**: Connection configuration and query definitions

```yaml
data:
  sources:
    - name: "orders"
      type: "supabase"
      query: "SELECT COUNT(*) as count, SUM(amount) as revenue FROM orders"
      refresh: "30s"
    - name: "customers"
      type: "supabase"  
      query: "SELECT COUNT(*) as count FROM customers"
      refresh: "1m"
```

**Supported Source Types**:
- **supabase**: Supabase database connections
- **rest**: Generic REST API endpoints
- **graphql**: GraphQL endpoints (future)
- **mock**: Mock data generators (development)

### 2. API Layer
**Purpose**: Abstract data fetching logic and provide consistent interfaces
**Location**: `src/pages/dashboard/api/`
**Files**:
- `metrics.ts`: Core metrics API functions
- `index.ts`: API exports and utilities

#### Core API Functions
```typescript
// Primary data fetching function
export const fetchDashboardMetrics = async (): Promise<DashboardApiResponse>

// Specific metric refresh
export const refreshMetric = async (metricId: string): Promise<DashboardApiResponse>

// Data validation
export const validateMetricsData = (data: unknown): data is DashboardMetrics
```

**API Response Structure**:
```typescript
interface DashboardApiResponse {
  success: boolean;
  data?: DashboardMetrics;
  error?: string;
}
```

### 3. Hooks Layer
**Purpose**: Provide React-friendly data interfaces with state management
**Location**: `src/pages/dashboard/hooks/`
**Files**:
- `useDashboardData.ts`: Primary data hook
- `index.ts`: Hook exports

#### Primary Data Hook
```typescript
export const useDashboardData = (refreshInterval: number = 30000): UseDashboardDataResult
```

**Features**:
- Automatic data fetching on mount
- Configurable refresh intervals
- Loading and error state management
- Manual refetch capability
- Real-time data updates

**Return Type**:
```typescript
interface UseDashboardDataResult {
  data: DashboardMetrics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

#### Specialized KPI Hook
```typescript
export const useKPIMetrics = () => {
  metrics: KPIMetric[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

**KPI Formatting Features**:
- Automatic data transformation
- Delta calculation and formatting
- Metric categorization
- Display-ready data structures

### 4. Component Integration
**Purpose**: Consume data in React components with proper state handling
**Components**:
- `KPICards.tsx`: Displays metrics using `useKPIMetrics`
- Other components: Can use `useDashboardData` directly

## Data Types and Schemas

### Core Data Types

#### Dashboard Metrics
```typescript
interface DashboardMetrics {
  totalRevenue: number;        // Total revenue from orders
  totalOrders: number;         // Total number of orders
  averageOrderValue: number;   // Average value per order
  activeUsers: number;         // Number of active users
  ordersProcessed: number;     // Orders processed this period
}
```

#### KPI Metric Structure
```typescript
interface KPIMetric {
  id: string;                  // Unique metric identifier
  title: string;               // Display title
  value: number | string;      // Metric value (formatted)
  suffix?: string;             // Value suffix (%, $, etc.)
  description: string;         // Metric description
  delta?: string;              // Change indicator (+12.3%)
  deltaType?: 'increase' | 'decrease' | 'neutral'; // Change type
}
```

#### Component Props Types
```typescript
interface KPICardsProps {
  metrics: KPIMetric[];
  theme?: any;
  componentId?: string;
  pageId?: string;
}

interface WelcomeHeaderProps {
  title: string;
  subtitle: string;
  theme?: any;
  componentId?: string;
  pageId?: string;
}
```

### Data Source Configuration Types

#### Source Definition
```typescript
interface DataSource {
  name: string;               // Source identifier
  type: 'supabase' | 'rest' | 'graphql' | 'mock';
  query: string;              // Query/endpoint definition
  refresh: string;            // Refresh interval (30s, 1m, 5m)
  timeout?: number;           // Request timeout
  retries?: number;           // Retry attempts
}
```

#### Configuration Schema
```typescript
interface DashboardDataConfig {
  sources: DataSource[];
  defaultRefreshInterval: number;
  enableRealtime: boolean;
  cacheStrategy: 'memory' | 'localStorage' | 'none';
}
```

## Data State Management

### Loading States
The data system provides comprehensive loading state management:

```typescript
// Hook usage example
const { data, loading, error, refetch } = useDashboardData();

// Loading states
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

// Render with data
return <KPICards metrics={data} />;
```

### Error Handling Strategy

#### Error Types
1. **Network Errors**: Connection failures, timeouts
2. **Data Validation Errors**: Invalid response structure
3. **Configuration Errors**: Invalid data source configuration
4. **Authentication Errors**: Unauthorized access to data sources

#### Error Recovery
```typescript
const handleError = (error: Error) => {
  // Log error for debugging
  console.error('Dashboard data error:', error);
  
  // Attempt recovery strategies
  if (error.message.includes('network')) {
    // Retry with exponential backoff
    setTimeout(() => refetch(), 1000);
  } else if (error.message.includes('validation')) {
    // Use fallback data
    setData(getFallbackData());
  }
};
```

### Real-time Data Updates

#### Refresh Strategies
1. **Interval-based**: Regular polling at configured intervals
2. **Manual Refresh**: User-triggered data updates
3. **WebSocket (Future)**: Real-time push updates
4. **Event-driven (Future)**: Update on specific events

#### Refresh Configuration
```typescript
// Component-level refresh control
const { data, refetch } = useDashboardData(30000); // 30-second intervals

// Manual refresh
const handleRefresh = () => {
  refetch();
};

// Disable auto-refresh
const { data } = useDashboardData(0); // No automatic refresh
```

## Mock Data System

### Development Mock Data
For development and testing, the system includes comprehensive mock data generation:

```typescript
const generateMockData = (): DashboardMetrics => ({
  totalRevenue: Math.floor(Math.random() * 100000) + 50000,
  totalOrders: Math.floor(Math.random() * 1000) + 200,
  averageOrderValue: Math.floor(Math.random() * 200) + 50,
  activeUsers: Math.floor(Math.random() * 500) + 100,
  ordersProcessed: 247 // Static value for consistency
});
```

### Mock-to-Production Transition
The architecture supports seamless transition from mock to production data:

```typescript
// Development: Uses mock data
const data = generateMockData();

// Production: Uses real API calls
const { data } = await supabase
  .from('orders')
  .select('COUNT(*) as count, SUM(amount) as revenue');
```

### Mock Data Features
- **Realistic Values**: Generated data within reasonable ranges
- **Consistent Patterns**: Predictable data for testing
- **Randomization**: Simulates real-world data variability
- **Performance**: Fast generation without external dependencies

## Data Integration Patterns

### Supabase Integration (Primary)
The Dashboard is designed primarily for Supabase integration:

```typescript
// Future Supabase implementation
const fetchOrderData = async (): Promise<OrderData> => {
  const { data, error } = await supabase
    .from('orders')
    .select('COUNT(*) as count, SUM(amount) as revenue');
  
  if (error) throw new Error(error.message);
  return data[0];
};

const fetchCustomerData = async (): Promise<CustomerData> => {
  const { data, error } = await supabase
    .from('customers')
    .select('COUNT(*) as count');
  
  if (error) throw new Error(error.message);
  return data[0];
};
```

### REST API Integration
Generic REST API support for flexibility:

```typescript
// REST API implementation
const fetchMetricsFromAPI = async (): Promise<DashboardMetrics> => {
  const response = await fetch('/api/dashboard/metrics', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  const data = await response.json();
  return validateMetricsData(data) ? data : throw new Error('Invalid data format');
};
```

### GraphQL Integration (Future)
Planned GraphQL support for complex queries:

```typescript
// Future GraphQL implementation
const DASHBOARD_METRICS_QUERY = gql`
  query DashboardMetrics {
    orders {
      totalCount
      totalRevenue
    }
    customers {
      activeCount
    }
    metrics {
      averageOrderValue
      ordersProcessed
    }
  }
`;
```

## Performance Optimization

### Caching Strategy
The data system implements multiple caching levels:

1. **React State Cache**: In-memory component state
2. **Hook-level Cache**: Shared cache across hook instances
3. **Browser Cache**: localStorage for persistence
4. **API Cache**: Server-side response caching

### Optimized Data Fetching
```typescript
// Debounced refresh to prevent excessive API calls
const debouncedRefetch = useMemo(
  () => debounce(refetch, 1000),
  [refetch]
);

// Conditional fetching based on data freshness
useEffect(() => {
  const isDataStale = !data || 
    (Date.now() - lastFetchTime) > refreshInterval;
  
  if (isDataStale) {
    fetchData();
  }
}, [data, lastFetchTime, refreshInterval]);
```

### Bundle Size Optimization
- **Tree Shaking**: Import only used functions
- **Lazy Loading**: Load data utilities on demand
- **Code Splitting**: Separate data logic from UI components

## Data Validation and Security

### Input Validation
```typescript
export const validateMetricsData = (data: unknown): data is DashboardMetrics => {
  if (typeof data !== 'object' || data === null) return false;
  
  const metrics = data as Record<string, unknown>;
  
  return (
    typeof metrics.totalRevenue === 'number' && metrics.totalRevenue >= 0 &&
    typeof metrics.totalOrders === 'number' && metrics.totalOrders >= 0 &&
    typeof metrics.averageOrderValue === 'number' && metrics.averageOrderValue >= 0 &&
    typeof metrics.activeUsers === 'number' && metrics.activeUsers >= 0 &&
    typeof metrics.ordersProcessed === 'number' && metrics.ordersProcessed >= 0
  );
};
```

### Security Considerations
1. **Data Sanitization**: Validate all incoming data
2. **Error Message Sanitization**: Prevent information leakage
3. **Rate Limiting**: Prevent excessive API calls
4. **Authentication**: Secure API endpoints
5. **CORS Configuration**: Proper cross-origin request handling

### Data Privacy
- **No PII Storage**: Dashboard metrics contain only aggregated data
- **Minimal Data Retention**: Cache data only as needed
- **Secure Transmission**: HTTPS for all data requests

## Configuration-Driven Data Sources

### YAML Configuration
Data sources are defined in the dashboard configuration:

```yaml
data:
  sources:
    - name: "orders"
      type: "supabase"
      query: "SELECT COUNT(*) as count, SUM(amount) as revenue FROM orders"
      refresh: "30s"
      timeout: 5000
      retries: 3
    - name: "customers"
      type: "supabase"
      query: "SELECT COUNT(*) as count FROM customers"
      refresh: "1m"
      timeout: 3000
      retries: 2
```

### Dynamic Configuration Loading
```typescript
// Load data configuration from YAML
const loadDataConfig = async (): Promise<DashboardDataConfig> => {
  const config = await import('../config.yaml');
  return config.data;
};

// Apply configuration to data fetching
const applyDataConfig = (config: DashboardDataConfig) => {
  config.sources.forEach(source => {
    registerDataSource(source.name, source);
  });
};
```

### Runtime Configuration Updates
The system supports runtime configuration updates through automation scripts:

```bash
# Update data source configuration
./scripts/update-data-config.sh --source orders --refresh 15s

# Add new data source
./scripts/add-data-source.sh --name analytics --type rest --endpoint /api/analytics
```

## Monitoring and Debugging

### Data Metrics Tracking
```typescript
// Track data fetching performance
const trackDataFetch = (source: string, duration: number, success: boolean) => {
  console.log(`Data fetch [${source}]: ${duration}ms, success: ${success}`);
  
  // Send to analytics (future)
  analytics.track('data_fetch', {
    source,
    duration,
    success,
    timestamp: Date.now()
  });
};
```

### Error Logging
```typescript
// Comprehensive error logging
const logDataError = (error: Error, context: string) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.error('Dashboard Data Error:', errorInfo);
  
  // Send to error tracking service (future)
  errorTracking.captureException(error, errorInfo);
};
```

### Development Tools
```typescript
// Development-only data debugging
if (process.env.NODE_ENV === 'development') {
  (window as any).dashboardData = {
    getCurrentData: () => data,
    forceRefresh: () => refetch(),
    getErrorHistory: () => errorHistory,
    simulateError: () => setError(new Error('Simulated error'))
  };
}
```

## Future Enhancements

### 1. Real-time Data Streaming
**WebSocket Integration**:
```typescript
// Future WebSocket implementation
const useRealtimeData = (endpoint: string) => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket(endpoint);
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(newData);
    };
    
    return () => ws.close();
  }, [endpoint]);
  
  return data;
};
```

### 2. Advanced Caching
**Redis Integration**:
```typescript
// Future Redis caching
const cacheData = async (key: string, data: any, ttl: number) => {
  await redis.setex(key, ttl, JSON.stringify(data));
};

const getCachedData = async (key: string) => {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
};
```

### 3. Data Transformation Pipeline
**ETL Capabilities**:
```typescript
// Future data transformation pipeline
const transformData = (rawData: any): DashboardMetrics => {
  return pipe(
    normalize,
    validate,
    enrich,
    format
  )(rawData);
};
```

### 4. Advanced Analytics
**Data Insights**:
```typescript
// Future analytics capabilities
const analyzeMetrics = (historical: DashboardMetrics[]) => {
  return {
    trends: calculateTrends(historical),
    forecasts: generateForecasts(historical),
    anomalies: detectAnomalies(historical)
  };
};
```

## Best Practices for AI Agents

### 1. Data Hook Usage
```typescript
// ✅ Good: Use appropriate hook for use case
const KPIComponent = () => {
  const { metrics, loading, error } = useKPIMetrics(); // Specialized hook
  return <KPICards metrics={metrics} loading={loading} error={error} />;
};

// ✅ Good: Handle all states
const DataComponent = () => {
  const { data, loading, error, refetch } = useDashboardData();
  
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return <EmptyState />;
  
  return <DataDisplay data={data} />;
};
```

### 2. Error Handling
```typescript
// ✅ Good: Comprehensive error handling
const handleDataError = (error: Error) => {
  // Log for debugging
  console.error('Data error:', error);
  
  // Show user-friendly message
  showNotification('Failed to load data. Retrying...');
  
  // Attempt recovery
  setTimeout(refetch, 2000);
};
```

### 3. Performance Optimization
```typescript
// ✅ Good: Optimize refresh intervals
const ProductionComponent = () => {
  // Use appropriate refresh interval for production
  const { data } = useDashboardData(60000); // 1 minute for production
};

const DevelopmentComponent = () => {
  // Use faster refresh for development
  const { data } = useDashboardData(5000); // 5 seconds for development
};
```

### 4. Type Safety
```typescript
// ✅ Good: Use proper TypeScript types
const processMetrics = (metrics: DashboardMetrics): KPIMetric[] => {
  return Object.entries(metrics).map(([key, value]) => ({
    id: key,
    title: formatTitle(key),
    value: formatValue(value),
    description: getDescription(key)
  }));
};

// ❌ Avoid: Using 'any' type
const processMetrics = (metrics: any): any => {
  // Type safety lost
};
```

## Summary
The Dashboard data architecture provides a robust, scalable, and maintainable foundation for data management. Built on TypeScript with comprehensive error handling, real-time updates, and flexible data source integration, the system enables AI agents to confidently work with dashboard data while maintaining performance and reliability.

The layered architecture, from configuration-driven data sources through API abstraction to React hooks, provides clear separation of concerns and enables easy testing, modification, and extension of data functionality. The mock-to-production transition capabilities ensure smooth development workflow while the type-safe interfaces prevent runtime errors and improve development experience.