# Common Dashboard Modifications

This document provides practical examples of the most common modifications AI agents make to the Dashboard page, with step-by-step instructions, code examples, and automation script usage.

## 📋 Overview

The Dashboard page supports a wide range of modifications through its modular architecture. This guide covers the most frequently requested changes, organized by complexity and use case.

### Modification Categories
- **Layout Changes** - Grid arrangements, spacing, positioning
- **Visual Updates** - Colors, themes, styling improvements
- **Component Modifications** - Adding, removing, or updating components
- **Data Integration** - New metrics, data sources, refresh patterns
- **Functionality Enhancements** - New features, interactions, behaviors

## 🎯 Quick Reference

### Most Common Modifications (90% of requests)
1. **Change theme colors** - Update color scheme for branding
2. **Add new KPI metric** - Display additional business metrics
3. **Modify layout grid** - Reorganize component positioning
4. **Update navigation links** - Change destination URLs or add new links
5. **Customize refresh intervals** - Adjust data update frequency

### Automation Scripts Available
- `change-theme.ts` - Theme and color modifications
- `add-component.ts` - Component addition and configuration
- `update-layout.sh` - Layout and positioning changes
- `deploy-changes.sh` - Safe deployment with rollback

## 🎨 Theme and Visual Modifications

### 1. Change Brand Colors

**Use Case**: Update dashboard to match company branding
**Automation**: Use `change-theme.ts` script
**Difficulty**: Easy (5 minutes)

#### Step-by-Step Process
```bash
# Navigate to dashboard directory
cd src/pages/dashboard

# Run theme change script
node scripts/change-theme.ts --primary="#1e40af" --secondary="#3b82f6" --accent="#60a5fa"
```

#### Manual Implementation
```yaml
# config.yaml - Update theme section
theme:
  primary: "#1e40af"      # Main brand color
  secondary: "#3b82f6"    # Secondary brand color
  accent: "#60a5fa"       # Accent/highlight color
  background: "#f8fafc"   # Background color
  text: "#1e293b"         # Primary text color
  textSecondary: "#64748b" # Secondary text color
```

#### CSS Updates
```css
/* styles.css - Custom property updates */
:root {
  --color-primary: #1e40af;
  --color-secondary: #3b82f6;
  --color-accent: #60a5fa;
  --color-background: #f8fafc;
  --color-text: #1e293b;
  --color-text-secondary: #64748b;
}

/* KPI cards with new colors */
.kpi-card {
  background: var(--color-background);
  border: 1px solid var(--color-secondary);
  color: var(--color-text);
}

.kpi-card .value {
  color: var(--color-primary);
}
```

#### Validation
```bash
# Test the changes
npm run build
npm run start

# Check for theme consistency
grep -r "color-primary" styles.css
```

### 2. Dark Mode Implementation

**Use Case**: Add dark mode toggle for user preference
**Difficulty**: Medium (15 minutes)

#### Configuration Update
```yaml
# config.yaml - Add dark mode support
theme:
  modes:
    light:
      primary: "#1e40af"
      background: "#ffffff"
      text: "#1e293b"
    dark:
      primary: "#60a5fa"
      background: "#0f172a"
      text: "#f1f5f9"
  defaultMode: "light"
  enableToggle: true
```

#### CSS Implementation
```css
/* styles.css - Dark mode styles */
[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-background: #0f172a;
  --color-text: #f1f5f9;
  --color-text-secondary: #94a3b8;
}

[data-theme="dark"] .dashboard-container {
  background: var(--color-background);
  color: var(--color-text);
}

[data-theme="dark"] .kpi-card {
  background: #1e293b;
  border-color: #334155;
}
```

#### Component Addition
```typescript
// components/ThemeToggle.tsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
```

### 3. Custom Logo Integration

**Use Case**: Add company logo to dashboard header
**Difficulty**: Easy (10 minutes)

#### Asset Addition
```bash
# Add logo to assets
mkdir -p assets/images
# Copy logo file to assets/images/logo.png
```

#### Component Update
```typescript
// components/WelcomeHeader.tsx - Add logo support
interface WelcomeHeaderProps {
  title: string;
  subtitle: string;
  logo?: string;
  theme?: any;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ 
  title, 
  subtitle, 
  logo,
  theme 
}) => {
  return (
    <div className="welcome-header">
      {logo && (
        <img 
          src={logo} 
          alt="Company Logo" 
          className="company-logo"
        />
      )}
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
};
```

#### Configuration Update
```yaml
# config.yaml - Add logo configuration
components:
  WelcomeHeader:
    props:
      title: "Welcome to Dashboard"
      subtitle: "Your business metrics at a glance"
      logo: "/assets/images/logo.png"
```

## 📊 Data and Metrics Modifications

### 4. Add New KPI Metric

**Use Case**: Display additional business metric (e.g., Customer Satisfaction Score)
**Automation**: Use `add-component.ts` script for new metric cards
**Difficulty**: Medium (20 minutes)

#### Step 1: Update Types
```typescript
// types.ts - Add new metric type
export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  activeUsers: number;
  ordersProcessed: number;
  customerSatisfaction: number; // New metric
}

export interface KPIMetric {
  id: string;
  title: string;
  value: number | string;
  suffix?: string;
  description: string;
  delta?: string;
  deltaType?: 'increase' | 'decrease' | 'neutral';
  format?: 'currency' | 'percentage' | 'number'; // New formatting option
}
```

#### Step 2: Update API Layer
```typescript
// api/metrics.ts - Add new metric to mock data
const generateMetricsData = (): DashboardMetrics => ({
  totalRevenue: Math.floor(Math.random() * 100000) + 50000,
  totalOrders: Math.floor(Math.random() * 1000) + 200,
  averageOrderValue: Math.floor(Math.random() * 200) + 50,
  activeUsers: Math.floor(Math.random() * 500) + 100,
  ordersProcessed: 247,
  customerSatisfaction: Math.floor(Math.random() * 20) + 80 // 80-100%
});
```

#### Step 3: Update Hook
```typescript
// hooks/useDashboardData.ts - Add new metric to formatted output
export const useKPIMetrics = () => {
  const { data, loading, error, refetch } = useDashboardData();

  const formatMetrics = useCallback(() => {
    if (!data) return [];

    return [
      // Existing metrics...
      {
        id: 'customer-satisfaction',
        title: 'Customer Satisfaction',
        value: data.customerSatisfaction,
        suffix: '%',
        description: 'Based on recent surveys',
        delta: '+2.3%',
        deltaType: 'increase' as const,
        format: 'percentage' as const
      }
    ];
  }, [data]);

  return {
    metrics: formatMetrics(),
    loading,
    error,
    refetch
  };
};
```

#### Step 4: Update Validation
```typescript
// api/metrics.ts - Update validation function
export const validateMetricsData = (data: unknown): data is DashboardMetrics => {
  if (typeof data !== 'object' || data === null) return false;
  
  const metrics = data as Record<string, unknown>;
  
  return (
    typeof metrics.totalRevenue === 'number' &&
    typeof metrics.totalOrders === 'number' &&
    typeof metrics.averageOrderValue === 'number' &&
    typeof metrics.activeUsers === 'number' &&
    typeof metrics.ordersProcessed === 'number' &&
    typeof metrics.customerSatisfaction === 'number' // New validation
  );
};
```

#### Automation Script Usage
```bash
# Use automation script to add the metric
node scripts/add-component.ts \
  --type="metric" \
  --name="customer-satisfaction" \
  --title="Customer Satisfaction" \
  --format="percentage"
```

### 5. Change Data Refresh Interval

**Use Case**: Update metrics more frequently for real-time monitoring
**Difficulty**: Easy (5 minutes)

#### Configuration Update
```yaml
# config.yaml - Update refresh settings
data:
  refreshInterval: 10000  # 10 seconds instead of 30
  enableRealtime: true
  retryAttempts: 5
```

#### Component Usage
```typescript
// Any component using the hook
const { data, loading, error } = useDashboardData(10000); // 10 second refresh
```

#### Conditional Refresh Based on Metric
```typescript
// Advanced: Different refresh rates for different metrics
const useAdaptiveRefresh = () => {
  const [refreshInterval, setRefreshInterval] = useState(30000);
  
  // Faster refresh for critical metrics
  useEffect(() => {
    const criticalMetrics = ['totalRevenue', 'activeUsers'];
    const hasCriticalUpdates = criticalMetrics.some(metric => 
      // Check if metric needs frequent updates
      shouldRefreshFrequently(metric)
    );
    
    setRefreshInterval(hasCriticalUpdates ? 5000 : 30000);
  }, []);
  
  return useDashboardData(refreshInterval);
};
```

## 🏗 Layout and Structure Modifications

### 6. Reorganize Component Layout

**Use Case**: Change from 2-column to 3-column layout
**Automation**: Use `update-layout.sh` script
**Difficulty**: Easy (10 minutes)

#### Automation Script Usage
```bash
# Update layout using script
./scripts/update-layout.sh --columns=3 --gap="2rem" --responsive=true
```

#### Manual Configuration
```yaml
# config.yaml - Update layout settings
layout:
  type: "grid"
  columns: 3
  gap: "2rem"
  responsive: true
  breakpoints:
    mobile: 1
    tablet: 2
    desktop: 3
```

#### CSS Updates
```css
/* styles.css - Update grid layout */
.dashboard-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding: 2rem;
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .dashboard-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .dashboard-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### 7. Add New Navigation Card

**Use Case**: Add link to new section (e.g., Reports page)
**Difficulty**: Easy (10 minutes)

#### Configuration Addition
```yaml
# config.yaml - Add new navigation card
components:
  ReportsLinkCard:
    type: "NavigationCard"
    props:
      title: "Reports"
      description: "View detailed analytics and reports"
      href: "/reports"
      icon: "📊"
    position:
      row: 2
      column: 3
```

#### Component Registration
```typescript
// register-components.ts - Register new component
import { ReportsLinkCard } from './components/ReportsLinkCard';

export const componentRegistry = {
  // Existing components...
  ReportsLinkCard
};
```

#### Component Implementation
```typescript
// components/ReportsLinkCard.tsx
import React from 'react';
import { DatabaseLinkCardProps } from '../types';

export const ReportsLinkCard: React.FC<DatabaseLinkCardProps> = ({
  title,
  description,
  href,
  icon,
  theme
}) => {
  return (
    <a href={href} className="navigation-card reports-card">
      <div className="card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </a>
  );
};
```

### 8. Customize Component Spacing

**Use Case**: Increase spacing between components for better visual hierarchy
**Difficulty**: Easy (5 minutes)

#### CSS Updates
```css
/* styles.css - Update spacing */
.dashboard-container {
  gap: 3rem; /* Increased from 2rem */
  padding: 3rem; /* Increased padding */
}

.component-wrapper {
  margin-bottom: 2rem; /* Add bottom margin */
}

.kpi-cards-grid {
  gap: 1.5rem; /* Increase gap between KPI cards */
}
```

#### Configuration Update
```yaml
# config.yaml - Update spacing configuration
layout:
  gap: "3rem"
  padding: "3rem"
  componentSpacing: "2rem"
```

## 🔧 Functionality Enhancements

### 9. Add Click Analytics

**Use Case**: Track user interactions with dashboard components
**Difficulty**: Medium (15 minutes)

#### Analytics Hook
```typescript
// hooks/useAnalytics.ts
import { useCallback } from 'react';

export const useAnalytics = () => {
  const trackClick = useCallback((eventName: string, properties: any) => {
    // Send analytics event
    console.log('Analytics Event:', eventName, properties);
    
    // Future: Send to analytics service
    // analytics.track(eventName, properties);
  }, []);
  
  const trackMetricClick = useCallback((metricId: string) => {
    trackClick('metric_clicked', {
      metric_id: metricId,
      page: 'dashboard',
      timestamp: new Date().toISOString()
    });
  }, [trackClick]);
  
  return { trackClick, trackMetricClick };
};
```

#### Component Integration
```typescript
// components/KPICards.tsx - Add click tracking
import { useAnalytics } from '../hooks/useAnalytics';

export const KPICards: React.FC<KPICardsProps> = ({ metrics, theme }) => {
  const { trackMetricClick } = useAnalytics();
  
  const handleMetricClick = (metric: KPIMetric) => {
    trackMetricClick(metric.id);
    // Additional click handling
  };
  
  return (
    <div className="kpi-cards-grid">
      {metrics.map(metric => (
        <div 
          key={metric.id} 
          className="kpi-card clickable"
          onClick={() => handleMetricClick(metric)}
        >
          {/* Metric content */}
        </div>
      ))}
    </div>
  );
};
```

### 10. Add Export Functionality

**Use Case**: Allow users to export dashboard data as CSV or PDF
**Difficulty**: Medium (25 minutes)

#### Export Hook
```typescript
// hooks/useExport.ts
import { useCallback } from 'react';
import { DashboardMetrics } from '../types';

export const useExport = () => {
  const exportToCSV = useCallback((data: DashboardMetrics) => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Revenue', data.totalRevenue],
      ['Total Orders', data.totalOrders],
      ['Average Order Value', data.averageOrderValue],
      ['Active Users', data.activeUsers],
      ['Orders Processed', data.ordersProcessed]
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);
  
  const exportToPDF = useCallback(async (data: DashboardMetrics) => {
    // Future: Implement PDF export
    console.log('PDF export not yet implemented');
  }, []);
  
  return { exportToCSV, exportToPDF };
};
```

#### Export Component
```typescript
// components/ExportButton.tsx
import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useExport } from '../hooks/useExport';

export const ExportButton: React.FC = () => {
  const { data } = useDashboardData();
  const { exportToCSV, exportToPDF } = useExport();
  
  const handleExport = (format: 'csv' | 'pdf') => {
    if (!data) return;
    
    if (format === 'csv') {
      exportToCSV(data);
    } else {
      exportToPDF(data);
    }
  };
  
  return (
    <div className="export-controls">
      <button onClick={() => handleExport('csv')}>
        Export CSV
      </button>
      <button onClick={() => handleExport('pdf')}>
        Export PDF
      </button>
    </div>
  );
};
```

## 🚀 Advanced Modifications

### 11. Add Real-time WebSocket Updates

**Use Case**: Real-time data updates without polling
**Difficulty**: Advanced (45 minutes)

#### WebSocket Hook
```typescript
// hooks/useWebSocket.ts
import { useState, useEffect, useCallback } from 'react';

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastMessage(data);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };
    
    return () => {
      ws.close();
    };
  }, [url]);
  
  const sendMessage = useCallback((message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  }, [socket, isConnected]);
  
  return { isConnected, lastMessage, sendMessage };
};
```

#### Real-time Data Hook
```typescript
// hooks/useRealTimeDashboard.ts
import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { DashboardMetrics } from '../types';

export const useRealTimeDashboard = () => {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const { isConnected, lastMessage } = useWebSocket('ws://localhost:8080/dashboard');
  
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'metrics_update') {
      setData(lastMessage.data);
    }
  }, [lastMessage]);
  
  return {
    data,
    isConnected,
    isRealTime: true
  };
};
```

### 12. Add Data Filtering and Search

**Use Case**: Filter metrics by date range or search criteria
**Difficulty**: Advanced (30 minutes)

#### Filter Hook
```typescript
// hooks/useDataFilter.ts
import { useState, useMemo } from 'react';
import { DashboardMetrics } from '../types';

interface FilterOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  metricTypes?: string[];
  minValue?: number;
  maxValue?: number;
}

export const useDataFilter = (data: DashboardMetrics | null) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  
  const filteredData = useMemo(() => {
    if (!data) return null;
    
    // Apply filters to data
    let filtered = { ...data };
    
    // Example: Filter by value range
    if (filters.minValue !== undefined) {
      Object.keys(filtered).forEach(key => {
        if (typeof filtered[key] === 'number' && filtered[key] < filters.minValue!) {
          // Handle filtering logic
        }
      });
    }
    
    return filtered;
  }, [data, filters]);
  
  return {
    filteredData,
    filters,
    setFilters,
    clearFilters: () => setFilters({})
  };
};
```

#### Filter Component
```typescript
// components/DataFilter.tsx
import React from 'react';
import { useDataFilter } from '../hooks/useDataFilter';

interface DataFilterProps {
  onFilterChange: (filters: any) => void;
}

export const DataFilter: React.FC<DataFilterProps> = ({ onFilterChange }) => {
  const handleDateRangeChange = (start: Date, end: Date) => {
    onFilterChange({
      dateRange: { start, end }
    });
  };
  
  return (
    <div className="data-filter">
      <h3>Filter Dashboard Data</h3>
      <div className="filter-controls">
        <input 
          type="date" 
          onChange={(e) => handleDateRangeChange(new Date(e.target.value), new Date())}
        />
        {/* Additional filter controls */}
      </div>
    </div>
  );
};
```

## 🛠 Testing Your Modifications

### Validation Checklist

After making any modification, run through this checklist:

```bash
# 1. Build and type check
npm run build
npm run type-check

# 2. Run tests
npm run test

# 3. Visual verification
npm run dev
# Check http://localhost:3000/dashboard

# 4. Configuration validation
node -e "console.log(require('./config.yaml'))"

# 5. Component registration check
grep -r "componentRegistry" . --include="*.ts"
```

### Common Issues and Solutions

#### Issue 1: Component Not Rendering
**Check**: Component registration in `register-components.ts`
```typescript
// Ensure component is exported
export const componentRegistry = {
  WelcomeHeader,
  DatabaseLinkCard,
  TasksLinkCard,
  QuickStartCard,
  KPICards,
  YourNewComponent // Add your component here
};
```

#### Issue 2: Configuration Not Loading
**Check**: YAML syntax and required fields
```bash
# Validate YAML syntax
python -c "import yaml; yaml.safe_load(open('config.yaml'))"
```

#### Issue 3: Styles Not Applied
**Check**: CSS import and class names
```css
/* Ensure styles are imported */
@import './components/YourComponent.css';

/* Check class naming consistency */
.your-component {
  /* styles */
}
```

## 🔄 Deployment and Rollback

### Safe Deployment Process

```bash
# 1. Backup current configuration
cp config.yaml config.yaml.backup

# 2. Deploy changes
./scripts/deploy-changes.sh --backup --validate

# 3. Verify deployment
curl http://localhost:3000/dashboard

# 4. Rollback if needed (automatic with deploy script)
./scripts/deploy-changes.sh --rollback
```

### Change Documentation

Always document your changes:

```markdown
# CHANGELOG.md
## [Date] - Dashboard Modifications

### Added
- New customer satisfaction KPI metric
- Dark mode toggle functionality
- Export to CSV feature

### Changed
- Updated layout from 2-column to 3-column grid
- Increased component spacing for better UX
- Modified refresh interval to 10 seconds

### Fixed
- Fixed KPI card hover effects
- Resolved responsive layout issues on mobile
```

## 📚 Related Documentation

- **[Component Creation Guide](../components/creating-components.md)** - How to build new components
- **[Configuration Reference](../configuration/config-overview.md)** - Complete configuration options
- **[Automation Scripts](../automation/automation-overview.md)** - Available automation tools
- **[API Integration](../data/api-reference.md)** - Data integration patterns
- **[Troubleshooting Guide](../troubleshooting/common-issues.md)** - Problem resolution

---

*This guide provides AI agents with practical, tested examples for the most common Dashboard page modifications. All examples follow the established patterns and can be safely implemented within the page-centric architecture.*

**Last Updated**: 2025-07-01  
**Next Review**: After automation script enhancements  
**Version**: 1.0.0