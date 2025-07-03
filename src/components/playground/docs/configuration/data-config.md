# Dashboard Data Source Configuration

This comprehensive guide explains the data configuration system for the Dashboard page. The data system enables AI agents to configure external data sources, manage data fetching, implement caching strategies, and handle real-time updates without modifying component code.

## 🎯 Data Configuration Overview

The Dashboard page uses a flexible data source configuration system that supports multiple data providers, automatic refresh intervals, query-based data fetching, and transformation pipelines. Data sources are configured declaratively in YAML and consumed by components through React hooks.

### Data Configuration Structure

```yaml
data:
  sources:                            # Array of data sources
    - name: "orders"                  # Unique data source name
      type: "supabase"                # Data source type
      query: "SELECT * FROM orders"   # SQL query or endpoint
      refresh: "30s"                  # Refresh interval
      transform: "aggregateOrders"    # Data transformation (optional)
    
    - name: "customers"
      type: "api"
      endpoint: "/api/customers"
      method: "GET"
      refresh: "1m"
```

## 📋 Data Source Types

The system supports multiple data source types for different integration scenarios:

### Supabase Data Sources

**Type**: `"supabase"`  
**Description**: Direct SQL queries to Supabase PostgreSQL database

```yaml
- name: "orders-revenue"
  type: "supabase"
  query: "SELECT COUNT(*) as count, SUM(amount) as revenue FROM orders WHERE created_at > NOW() - INTERVAL '30 days'"
  refresh: "30s"
```

**Configuration Properties**:
- `query`: SQL query string (required)
- `refresh`: Refresh interval (optional)
- `transform`: Data transformation function (optional)

**Common Query Patterns**:
```yaml
# Aggregation query
query: "SELECT COUNT(*) as total, AVG(amount) as average FROM orders"

# Filtered data
query: "SELECT * FROM customers WHERE status = 'active' AND created_at > '2025-01-01'"

# Joined data
query: "SELECT o.*, c.name FROM orders o JOIN customers c ON o.customer_id = c.id"

# Time-based grouping
query: "SELECT DATE_TRUNC('day', created_at) as date, COUNT(*) as count FROM orders GROUP BY date ORDER BY date"
```

### API Data Sources

**Type**: `"api"`  
**Description**: External REST API endpoints

```yaml
- name: "external-metrics"
  type: "api"
  endpoint: "/api/v1/metrics"
  method: "GET"
  refresh: "5m"
  headers:
    Authorization: "Bearer {{env.API_TOKEN}}"
    Content-Type: "application/json"
```

**Configuration Properties**:
- `endpoint`: API endpoint URL (required)
- `method`: HTTP method (optional, default: "GET")
- `headers`: HTTP headers (optional)
- `body`: Request body for POST/PUT (optional)
- `refresh`: Refresh interval (optional)
- `transform`: Data transformation function (optional)

**HTTP Methods**:
- `GET`: Retrieve data (most common)
- `POST`: Submit data with body
- `PUT`: Update resources
- `DELETE`: Remove resources

### Static Data Sources

**Type**: `"static"`  
**Description**: Static JSON data embedded in configuration

```yaml
- name: "dashboard-config"
  type: "static"
  data:
    version: "1.0.0"
    features:
      - "real-time-updates"
      - "data-export"
      - "custom-charts"
    limits:
      maxUsers: 1000
      maxQueries: 10000
```

**Configuration Properties**:
- `data`: Static JSON data (required)
- `transform`: Data transformation function (optional)

### Internal Data Sources

**Type**: `"internal"`  
**Description**: Data from internal page hooks and state

```yaml
- name: "component-state"
  type: "internal"
  source: "useComponentState"
  params:
    componentId: "kpi-cards"
```

**Configuration Properties**:
- `source`: Internal hook or function name (required)
- `params`: Parameters passed to the source (optional)

## 🔄 Refresh Configuration

### Refresh Intervals

Data sources can automatically refresh on specified intervals:

```yaml
refresh: "30s"                        # Every 30 seconds
# refresh: "5m"                       # Every 5 minutes
# refresh: "1h"                       # Every hour
# refresh: "24h"                      # Daily
```

**Supported Intervals**:
- `s`: Seconds (e.g., `"30s"`, `"45s"`)
- `m`: Minutes (e.g., `"1m"`, `"15m"`)
- `h`: Hours (e.g., `"1h"`, `"6h"`)

**Performance Guidelines**:
- **High frequency (< 1m)**: Critical real-time data only
- **Medium frequency (1-15m)**: Dashboard metrics and KPIs
- **Low frequency (> 15m)**: Reference data and configurations

### Manual Refresh

Data sources can be refreshed manually through the API:

```javascript
// Refresh specific data source
await refreshDataSource('orders');

// Refresh all data sources
await refreshAllDataSources();
```

### Conditional Refresh

Configure conditional refresh based on data changes:

```yaml
- name: "conditional-data"
  type: "supabase"
  query: "SELECT * FROM orders WHERE updated_at > {{lastUpdate}}"
  refresh: "1m"
  refreshCondition: "hasChanges"
```

## 🔧 Data Transformation

### Transform Functions

Transform raw data into component-ready format:

```yaml
- name: "kpi-metrics"
  type: "supabase" 
  query: "SELECT COUNT(*) as orders, SUM(amount) as revenue FROM orders"
  transform: "formatKPIMetrics"
```

**Transform Function Examples**:
```javascript
// Transform raw data into KPI format
const formatKPIMetrics = (rawData) => {
  const { orders, revenue } = rawData[0];
  
  return [
    {
      id: 'total-orders',
      title: 'Total Orders',
      value: orders,
      description: 'All time',
      delta: '+12%',
      deltaType: 'increase'
    },
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: revenue,
      suffix: ' USD',
      description: 'All time',
      delta: '+8.5%', 
      deltaType: 'increase'
    }
  ];
};

// Register transform function
registerTransform('formatKPIMetrics', formatKPIMetrics);
```

### Built-in Transformations

Common transformation patterns available by default:

#### aggregateMetrics
Converts raw database rows into metrics format:

```yaml
transform: "aggregateMetrics"
transformConfig:
  metrics:
    - field: "revenue"
      title: "Total Revenue"
      suffix: " USD"
    - field: "orders"
      title: "Total Orders"
```

#### formatCurrency
Formats numeric values as currency:

```yaml
transform: "formatCurrency"
transformConfig:
  currency: "USD"
  locale: "en-US"
```

#### calculateDeltas
Calculates percentage changes between current and previous values:

```yaml
transform: "calculateDeltas"
transformConfig:
  compareField: "previous_value"
  deltaField: "current_value"
```

## 📊 Data Hook Integration

### useDashboardData Hook

Components consume data through the `useDashboardData` hook:

```typescript
import { useDashboardData } from '../hooks';

export const MetricsComponent = () => {
  const { data, loading, error, refetch } = useDashboardData('orders');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h3>Orders: {data.count}</h3>
      <p>Revenue: ${data.revenue}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
};
```

**Hook Return Values**:
- `data`: Transformed data from the source
- `loading`: Boolean loading state
- `error`: Error object if fetch failed
- `refetch`: Function to manually refresh data

### useKPIMetrics Hook

Specialized hook for KPI components:

```typescript
import { useKPIMetrics } from '../hooks';

export const KPICards = () => {
  const { metrics, loading, error, refetch } = useKPIMetrics();
  
  return (
    <div className="kpi-cards">
      {metrics.map(metric => (
        <div key={metric.id} className="kpi-card">
          <h3>{metric.title}</h3>
          <p>{metric.value}{metric.suffix}</p>
          <small>{metric.description}</small>
        </div>
      ))}
    </div>
  );
};
```

### Custom Data Hooks

Create specialized hooks for specific data patterns:

```typescript
// Custom hook for user analytics
export const useUserAnalytics = () => {
  const { data, loading, error } = useDashboardData('user-analytics');
  
  const processedData = useMemo(() => {
    if (!data) return null;
    
    return {
      activeUsers: data.activeUsers,
      newUsers: data.newUsers,
      retention: calculateRetention(data.users),
      engagement: calculateEngagement(data.sessions)
    };
  }, [data]);
  
  return { data: processedData, loading, error };
};
```

## 🔒 Security & Authentication

### Environment Variables

Use environment variables for sensitive configuration:

```yaml
- name: "secure-api"
  type: "api"
  endpoint: "{{env.API_ENDPOINT}}/metrics"
  headers:
    Authorization: "Bearer {{env.API_TOKEN}}"
    X-API-Key: "{{env.API_KEY}}"
```

**Environment Variable Access**:
- `{{env.VARIABLE_NAME}}`: Accesses environment variables
- Variables are resolved at runtime
- Secure variables are not exposed to client-side code

### Authentication Patterns

#### API Key Authentication
```yaml
headers:
  X-API-Key: "{{env.API_KEY}}"
```

#### Bearer Token Authentication
```yaml
headers:
  Authorization: "Bearer {{env.ACCESS_TOKEN}}"
```

#### Basic Authentication
```yaml
headers:
  Authorization: "Basic {{env.BASIC_AUTH}}"
```

### Data Privacy

Configure data privacy and filtering:

```yaml
- name: "user-data"
  type: "supabase"
  query: "SELECT id, email_hash, created_at FROM users WHERE consent = true"
  privacy:
    hashFields: ["email"]
    excludeFields: ["password", "ssn"]
    anonymize: true
```

## 📈 Real-Time Data Updates

### WebSocket Configuration

Configure real-time updates through WebSocket connections:

```yaml
- name: "live-metrics"
  type: "websocket"
  endpoint: "wss://api.example.com/live"
  channels: ["orders", "users"]
  refresh: "realtime"
```

### Server-Sent Events

Configure server-sent events for real-time updates:

```yaml
- name: "notifications"
  type: "sse"
  endpoint: "/api/events"
  eventTypes: ["order_created", "user_registered"]
```

### Polling Optimization

Optimize polling frequency based on user activity:

```yaml
- name: "adaptive-polling"
  type: "api"
  endpoint: "/api/metrics"
  refresh: "adaptive"
  refreshConfig:
    active: "30s"      # When user is active
    inactive: "5m"     # When user is inactive
    background: "15m"  # When tab is in background
```

## 🚀 Performance Optimization

### Caching Strategy

Configure data caching to improve performance:

```yaml
- name: "cached-data"
  type: "api"
  endpoint: "/api/heavy-computation"
  refresh: "1h"
  cache:
    enabled: true
    ttl: "30m"                      # Cache time-to-live
    strategy: "stale-while-revalidate"
```

**Cache Strategies**:
- `cache-first`: Return cached data if available
- `network-first`: Try network, fallback to cache
- `stale-while-revalidate`: Return cache, update in background

### Data Pagination

Handle large datasets with pagination:

```yaml
- name: "paginated-orders"
  type: "supabase"
  query: "SELECT * FROM orders ORDER BY created_at DESC LIMIT {{limit}} OFFSET {{offset}}"
  pagination:
    enabled: true
    pageSize: 50
    maxPages: 10
```

### Query Optimization

Optimize database queries for performance:

```yaml
- name: "optimized-metrics"
  type: "supabase"
  query: |
    SELECT 
      COUNT(*) as total_orders,
      SUM(amount) as total_revenue,
      AVG(amount) as avg_order_value
    FROM orders 
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND status = 'completed'
  indexes: ["created_at", "status"]    # Suggest required indexes
```

## 🔍 Data Validation & Error Handling

### Data Schema Validation

Validate incoming data against schemas:

```yaml
- name: "validated-metrics"
  type: "api"
  endpoint: "/api/metrics"
  validation:
    schema: "metricsSchema"
    required: ["revenue", "orders", "users"]
    types:
      revenue: "number"
      orders: "number"
      users: "number"
```

**Validation Schema Example**:
```typescript
const metricsSchema = {
  type: 'object',
  properties: {
    revenue: { type: 'number', minimum: 0 },
    orders: { type: 'number', minimum: 0 },
    users: { type: 'number', minimum: 0 }
  },
  required: ['revenue', 'orders', 'users']
};
```

### Error Handling Configuration

Configure error handling and retry logic:

```yaml
- name: "resilient-api"
  type: "api"
  endpoint: "/api/unreliable"
  errorHandling:
    retries: 3
    retryDelay: "1s"
    backoff: "exponential"
    fallback: "cached-data"
    timeout: "10s"
```

**Error Handling Options**:
- `retries`: Number of retry attempts
- `retryDelay`: Delay between retries
- `backoff`: Retry strategy (linear, exponential)
- `fallback`: Fallback data source name
- `timeout`: Request timeout

### Data Quality Monitoring

Monitor data quality and freshness:

```yaml
- name: "monitored-data"
  type: "supabase"
  query: "SELECT * FROM metrics WHERE updated_at > NOW() - INTERVAL '1 hour'"
  monitoring:
    freshness: "1h"                   # Data must be fresh within 1 hour
    completeness: 0.95                # 95% of expected fields must be present
    accuracy: "validateMetrics"       # Custom validation function
```

## 🛠️ Development & Testing

### Mock Data Configuration

Configure mock data for development:

```yaml
- name: "development-data"
  type: "mock"
  mockData:
    orders: 1250
    revenue: 125000
    users: 450
  refreshSimulation: true             # Simulate data changes
```

### Test Data Sources

Configure data sources for testing:

```yaml
- name: "test-metrics"
  type: "static"
  data:
    revenue: 100000
    orders: 500
    conversion: 0.032
  environment: "test"                 # Only active in test environment
```

### Data Source Testing

Test data source configurations:

```bash
# Test data source connectivity
npm run test-data-source orders

# Validate data source configuration
npm run validate-data-config

# Preview data source output
npm run preview-data orders --limit 5
```

## 📋 Complete Data Configuration Examples

### E-commerce Dashboard Data

```yaml
data:
  sources:
    # Real-time order metrics
    - name: "order-metrics"
      type: "supabase"
      query: |
        SELECT 
          COUNT(*) as total_orders,
          SUM(amount) as total_revenue,
          AVG(amount) as avg_order_value,
          COUNT(DISTINCT customer_id) as unique_customers
        FROM orders 
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        AND status IN ('completed', 'shipped')
      refresh: "1m"
      transform: "formatOrderMetrics"
    
    # Customer analytics
    - name: "customer-analytics"
      type: "supabase"
      query: |
        SELECT 
          COUNT(*) as total_customers,
          COUNT(CASE WHEN last_login >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as active_customers,
          AVG(lifetime_value) as avg_lifetime_value
        FROM customers
        WHERE created_at <= CURRENT_DATE
      refresh: "5m"
      transform: "formatCustomerAnalytics"
    
    # External payment data
    - name: "payment-stats"
      type: "api"
      endpoint: "{{env.PAYMENT_API}}/stats"
      method: "GET"
      headers:
        Authorization: "Bearer {{env.PAYMENT_TOKEN}}"
      refresh: "15m"
      cache:
        enabled: true
        ttl: "10m"
    
    # System performance metrics
    - name: "system-health"
      type: "internal"
      source: "useSystemHealth"
      refresh: "30s"
```

### Analytics Dashboard Data

```yaml
data:
  sources:
    # Website traffic
    - name: "traffic-metrics"
      type: "api"
      endpoint: "{{env.ANALYTICS_API}}/traffic"
      headers:
        X-API-Key: "{{env.ANALYTICS_KEY}}"
      refresh: "5m"
      transform: "formatTrafficMetrics"
    
    # Conversion funnel
    - name: "conversion-funnel"
      type: "supabase"
      query: |
        SELECT 
          event_type,
          COUNT(*) as event_count,
          COUNT(DISTINCT user_id) as unique_users
        FROM events 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY event_type
        ORDER BY event_count DESC
      refresh: "10m"
      transform: "formatFunnelData"
    
    # Real-time user sessions
    - name: "active-sessions"
      type: "websocket"
      endpoint: "wss://{{env.ANALYTICS_WS}}/sessions"
      channels: ["session_start", "session_end"]
      refresh: "realtime"
```

## 🚨 Troubleshooting Data Issues

### Common Data Problems

#### Data Source Not Loading
**Problem**: Data source returns no data or errors

**Solutions**:
1. **Check connectivity**:
   ```bash
   # Test database connection
   npm run test-db-connection
   
   # Test API endpoint
   curl -H "Authorization: Bearer $TOKEN" $API_ENDPOINT
   ```

2. **Validate query syntax**:
   ```sql
   -- Test query in database console
   SELECT COUNT(*) as count FROM orders WHERE created_at > NOW() - INTERVAL '30 days';
   ```

3. **Check environment variables**:
   ```bash
   # Verify environment variables are set
   echo $SUPABASE_URL
   echo $API_TOKEN
   ```

#### Slow Data Loading
**Problem**: Data sources taking too long to load

**Solutions**:
1. **Optimize queries**:
   ```yaml
   # Add indexes for better performance
   query: "SELECT * FROM orders USE INDEX (idx_created_at) WHERE created_at > ?"
   ```

2. **Implement caching**:
   ```yaml
   cache:
     enabled: true
     ttl: "5m"
     strategy: "stale-while-revalidate"
   ```

3. **Reduce data volume**:
   ```yaml
   # Limit result set
   query: "SELECT TOP 1000 * FROM orders ORDER BY created_at DESC"
   ```

#### Data Transformation Errors
**Problem**: Transform functions failing or returning incorrect data

**Solutions**:
1. **Validate input data**:
   ```typescript
   const safeTransform = (data) => {
     if (!data || !Array.isArray(data)) {
       console.warn('Invalid data format:', data);
       return [];
     }
     return data.map(transformItem);
   };
   ```

2. **Add error boundaries**:
   ```typescript
   const transformWithErrorHandling = (data) => {
     try {
       return transformData(data);
     } catch (error) {
       console.error('Transform error:', error);
       return fallbackData;
     }
   };
   ```

### Data Validation Tools

```bash
# Validate all data sources
npm run validate-data-sources

# Test specific data source
npm run test-data-source --name="orders"

# Preview data output
npm run preview-data --source="metrics" --limit=10

# Check data freshness
npm run check-data-freshness
```

## 📖 Related Documentation

- **[Component Configuration](component-config.md)**: Using data in components
- **[Layout Configuration](layout-config.md)**: Grid positioning system  
- **[Architecture Overview](../architecture/overview.md)**: Complete system architecture
- **[API Reference](../data/api-reference.md)**: API system documentation
- **[Hooks Reference](../data/hooks-reference.md)**: Data hooks documentation

---

This data configuration system provides comprehensive control over dashboard data sources while maintaining performance, security, and real-time capabilities. Understanding these patterns enables AI agents to configure robust data integrations for any dashboard scenario.