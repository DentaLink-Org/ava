# Dashboard Component Catalog

This comprehensive catalog documents all components available in the Dashboard page. Each component is designed for specific purposes and follows consistent patterns for easy modification and extension by AI agents.

## 📊 Component Overview

The Dashboard page contains **6 core components** organized into functional categories:

| Component | Type | Purpose | Grid Position | Dependencies |
|-----------|------|---------|---------------|--------------|
| **DashboardContainer** | Layout | Root layout container | N/A | None |
| **WelcomeHeader** | Header | Page title and subtitle | 1-12, Row 1 | None |
| **DatabaseLinkCard** | Navigation | Database page navigation | 1-6, Row 2 | Next.js Link, Lucide Icons |
| **TasksLinkCard** | Navigation | Tasks page navigation | 7-12, Row 2 | Next.js Link, Lucide Icons |
| **QuickStartCard** | Content | Onboarding guidance | 1-12, Row 3 | Next.js Link, Lucide Icons |
| **KPICards** | Data Display | Metrics and statistics | 1-12, Row 4 | Dashboard data hooks |

## 🏗️ Layout Components

### DashboardContainer
**File**: `components/DashboardContainer.tsx`  
**Type**: Layout Container  
**Purpose**: Root layout component that loads page-specific styles and provides the main grid structure

#### Component Structure
```typescript
interface DashboardContainerProps {
  children: React.ReactNode;
  className?: string;
}

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

#### Key Features
- **Style Loading**: Automatically imports `../styles.css`
- **Grid Container**: Provides 12-column CSS Grid layout
- **Responsive Design**: Adapts to different screen sizes
- **CSS Classes**: Uses `dashboard-page-container` and `dashboard-content-grid`

#### Usage Notes
- Always used as the root component for the Dashboard page
- Children components are automatically positioned within the grid
- No configuration required through `config.yaml`
- Handles all page-level styling and layout

#### CSS Styling
```css
.dashboard-page-container {
  padding: var(--spacing-lg);
  max-width: var(--content-max-width);
  margin: 0 auto;
  min-height: 100vh;
}

.dashboard-content-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}
```

## 📝 Header Components

### WelcomeHeader
**File**: `components/WelcomeHeader.tsx`  
**Type**: Header Component  
**Purpose**: Display page title and subtitle with clean typography

#### Component Structure
```typescript
interface WelcomeHeaderProps {
  title: string;                  // Required: Page title
  subtitle: string;               // Required: Page subtitle
  theme?: any;                    // Optional: Theme object
  componentId?: string;           // System: Component identifier
  pageId?: string;               // System: Page identifier
}

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

#### Configuration Example
```yaml
components:
  - id: "welcome-header"
    type: "WelcomeHeader"
    position:
      col: 1
      row: 1
      span: 12
    props:
      title: "Dashboard"
      subtitle: "Welcome to your admin dashboard"
```

#### Key Features
- **Semantic HTML**: Uses `h1` and `p` tags for proper hierarchy
- **Typography**: Styled with CSS custom properties
- **Full Width**: Spans entire grid width (columns 1-12)
- **Accessibility**: Proper heading structure for screen readers

#### CSS Styling
```css
.page-dashboard .welcome-header h1 {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;
}

.page-dashboard .welcome-header p {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: var(--spacing-sm) 0 0 0;
}
```

#### Customization Options
- **Title Text**: Any string value
- **Subtitle Text**: Any string value  
- **Typography**: Via CSS custom properties
- **Colors**: Via theme color variables

## 🧭 Navigation Components

### DatabaseLinkCard
**File**: `components/DatabaseLinkCard.tsx`  
**Type**: Navigation Card  
**Purpose**: Provide navigation link to the Databases page with visual appeal

#### Component Structure
```typescript
interface DatabaseLinkCardProps {
  title: string;                  // Required: Card title
  description: string;            // Required: Card description
  href: string;                   // Required: Navigation URL
  icon: string;                   // Required: Icon name (Lucide)
  theme?: any;                    // Optional: Theme object
  componentId?: string;           // System: Component identifier
  pageId?: string;               // System: Page identifier
}

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

#### Configuration Example
```yaml
components:
  - id: "database-link-card"
    type: "DatabaseLinkCard"
    position:
      col: 1
      row: 2
      span: 6
    props:
      title: "Databases"
      description: "Manage your databases"
      href: "/databases"
      icon: "Database"
```

#### Key Features
- **Next.js Navigation**: Uses Next.js `Link` for client-side routing
- **Lucide Icons**: Database icon from lucide-react
- **Hover Effects**: CSS-based hover animations
- **Responsive**: Adapts from 6-column to full-width on mobile
- **Accessibility**: Proper link semantics and focus states

### TasksLinkCard
**File**: `components/TasksLinkCard.tsx`  
**Type**: Navigation Card  
**Purpose**: Provide navigation link to the Tasks page

#### Component Structure
```typescript
// Same interface as DatabaseLinkCard
interface TasksLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  theme?: any;
  componentId?: string;
  pageId?: string;
}
```

#### Configuration Example
```yaml
components:
  - id: "tasks-link-card"
    type: "TasksLinkCard"
    position:
      col: 7
      row: 2
      span: 6
    props:
      title: "Task Management"
      description: "Organize and track tasks"
      href: "/tasks"
      icon: "CheckSquare"
```

#### Key Features
- **Identical Pattern**: Same structure as DatabaseLinkCard
- **CheckSquare Icon**: Uses CheckSquare icon from lucide-react
- **Complementary Positioning**: Right half of row 2 (columns 7-12)

#### Shared Navigation Card CSS
```css
.page-dashboard .link-card {
  background: var(--color-primary);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
  text-decoration: none;
  display: block;
  color: white;
  grid-column: span 6;
}

.page-dashboard .link-card:hover {
  background: var(--color-secondary);
  box-shadow: var(--shadow-hover);
  transform: translateY(-1px);
  color: white;
}

.page-dashboard .link-card-content {
  display: flex;
  align-items: center;
}

.page-dashboard .link-card-icon {
  width: 2rem;
  height: 2rem;
  color: white;
  margin-right: var(--spacing-base);
}
```

## 📋 Content Components

### QuickStartCard
**File**: `components/QuickStartCard.tsx`  
**Type**: Content Card  
**Purpose**: Provide onboarding guidance and quick actions for new users

#### Component Structure
```typescript
interface QuickStartCardProps {
  title: string;                  // Required: Card title
  description: string;            // Required: Instructional content
  primaryAction: {                // Required: Call-to-action
    text: string;                 // Link text
    href: string;                 // Link URL
  };
  theme?: any;                    // Optional: Theme object
  componentId?: string;           // System: Component identifier
  pageId?: string;               // System: Page identifier
}

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
        <Database className="quick-start-icon" />
        <h3 className="quick-start-title">{title}</h3>
      </div>
      <p className="quick-start-description">
        {description}{' '}
        <Link href={primaryAction.href} className="quick-start-link">
          {primaryAction.text}
        </Link>
      </p>
    </div>
  );
};
```

#### Configuration Example
```yaml
components:
  - id: "quick-start-card"
    type: "QuickStartCard"
    position:
      col: 1
      row: 3
      span: 12
    props:
      title: "Quick Start"
      description: "Start by visiting the Databases page to create and manage your data."
      primaryAction:
        text: "Go to Databases"
        href: "/databases"
```

#### Key Features
- **Onboarding Focus**: Designed to guide new users
- **Integrated Action**: Call-to-action link within description
- **Full Width**: Spans entire grid width (columns 1-12)
- **Database Icon**: Uses Database icon for visual consistency
- **Inline Link**: Action link integrated naturally in text

#### CSS Styling
```css
.page-dashboard .quick-start-card {
  background: var(--color-primary);
  border: 2px solid var(--color-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  grid-column: 1 / -1;
}

.page-dashboard .quick-start-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-base);
}

.page-dashboard .quick-start-title {
  font-size: var(--font-size-lg);
  font-weight: 500;
  color: white;
  margin: 0;
}

.page-dashboard .quick-start-link {
  font-weight: 500;
  text-decoration: underline;
  color: white;
  transition: color var(--transition-fast);
}
```

## 📊 Data Display Components

### KPICards
**File**: `components/KPICards.tsx`  
**Type**: Data Display Grid  
**Purpose**: Display key performance indicators and metrics in a responsive grid

#### Component Structure
```typescript
interface KPIMetric {
  id: string;                     // Unique metric identifier
  title: string;                  // Metric display name
  value: number | string;         // Metric value
  suffix?: string;                // Optional unit suffix
  description: string;            // Metric description
  delta?: string;                 // Optional change indicator
  deltaType?: 'increase' | 'decrease' | 'neutral'; // Change type
}

interface KPICardsProps {
  metrics: KPIMetric[];           // Array of metrics to display
  theme?: any;                    // Optional: Theme object
  componentId?: string;           // System: Component identifier
  pageId?: string;               // System: Page identifier
}

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

#### Configuration Example
```yaml
components:
  - id: "kpi-cards"
    type: "KPICards"
    position:
      col: 1
      row: 4
      span: 12
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

#### Key Features
- **Dynamic Data**: Integrates with dashboard data hooks
- **Number Formatting**: Automatic locale formatting for large numbers
- **Responsive Grid**: Auto-fit grid layout adapts to screen size
- **Delta Indicators**: Support for increase/decrease/neutral indicators
- **Mixed Value Types**: Supports both numeric and string values
- **Individual Cards**: Each metric rendered as separate card

#### Data Integration
The KPICards component typically receives data through the `useKPIMetrics` hook:

```typescript
// In a parent component or page
const { metrics, loading, error } = useKPIMetrics();

// Metrics are automatically formatted for KPICards
// [
//   {
//     id: 'total-revenue',
//     title: 'Total Revenue',
//     value: 75234,
//     description: 'From orders table',
//     delta: '+12.3%',
//     deltaType: 'increase'
//   },
//   // ... more metrics
// ]
```

#### CSS Styling
```css
.page-dashboard .kpi-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-base);
  grid-column: 1 / -1;
}

.page-dashboard .kpi-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  transition: all var(--transition-base);
}

.page-dashboard .kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.page-dashboard .kpi-card-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.page-dashboard .kpi-card-value {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1;
}

.page-dashboard .kpi-card-delta.increase {
  color: var(--color-success);
}

.page-dashboard .kpi-card-delta.decrease {
  color: var(--color-error);
}
```

## 🔧 Component Registration System

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

## 📱 Responsive Behavior

### Desktop Layout (>1024px)
- **Navigation Cards**: Side-by-side (6 columns each)
- **KPI Cards**: 4-column auto-fit grid
- **Full Components**: Welcome header and QuickStart span full width

### Tablet Layout (768px-1024px)
- **Navigation Cards**: Side-by-side (4 columns each on 8-column grid)
- **KPI Cards**: 2-3 column auto-fit grid
- **Maintained Spacing**: Consistent padding and gaps

### Mobile Layout (<768px)
- **Navigation Cards**: Stacked (full width each)
- **KPI Cards**: Single column layout
- **Compact Spacing**: Reduced padding and gaps
- **Icon Adjustments**: Modified icon positioning for small screens

## 🎨 Theming Integration

All components integrate with the page-wide theming system through CSS custom properties:

### Available Theme Variables
```css
/* Color System */
--color-primary: #f97316;        /* Orange primary */
--color-secondary: #ea580c;      /* Orange secondary */
--color-background: #fafafa;     /* Light gray background */
--color-surface: #ffffff;        /* White cards/surfaces */
--color-text: #111827;           /* Dark text */
--color-text-secondary: #6b7280; /* Gray secondary text */

/* Spacing System */
--spacing-xs: 0.25rem;           /* 4px */
--spacing-sm: 0.5rem;            /* 8px */
--spacing-base: 1rem;            /* 16px */
--spacing-lg: 1.5rem;            /* 24px */
--spacing-xl: 2rem;              /* 32px */
--spacing-2xl: 3rem;             /* 48px */

/* Typography */
--font-size-sm: 0.875rem;        /* 14px */
--font-size-base: 1rem;          /* 16px */
--font-size-lg: 1.125rem;        /* 18px */
--font-size-xl: 1.25rem;         /* 20px */
--font-size-2xl: 1.5rem;         /* 24px */
--font-size-3xl: 1.875rem;       /* 30px */
```

## 🧪 Testing Integration

All components include testing attributes:

```typescript
// Component includes testing hooks
<div 
  className="component-name"
  data-component-id={componentId}     // For component identification
  data-testid="component-name"        // For testing frameworks
  data-page-id={pageId}              // For page context
>
```

## 🚀 Extension Patterns

### Adding New Components
1. **Create component file** in `components/`
2. **Define props interface** in `types.ts`
3. **Export from `components/index.ts`**
4. **Register in `register-components.ts`**
5. **Add CSS styles** to `styles.css`
6. **Configure in `config.yaml`**

### Example: Adding a ChartWidget
```typescript
// 1. Define interface in types.ts
interface ChartWidgetProps {
  title: string;
  data: ChartData[];
  type: 'line' | 'bar' | 'pie';
  theme?: any;
  componentId?: string;
  pageId?: string;
}

// 2. Create component
export const ChartWidget: React.FC<ChartWidgetProps> = ({
  title, data, type, theme, componentId, pageId
}) => {
  return (
    <div className="chart-widget" data-component-id={componentId}>
      <h3 className="chart-widget-title">{title}</h3>
      {/* Chart implementation */}
    </div>
  );
};

// 3. Register component
registerComponent('dashboard', 'ChartWidget', ChartWidget);

// 4. Add to configuration
components:
  - id: "sales-chart"
    type: "ChartWidget"
    position: { col: 1, row: 5, span: 8 }
    props:
      title: "Sales Trends"
      type: "line"
      data: []
```

## 📖 Related Documentation

- **[Component Patterns](../architecture/component-patterns.md)**: Detailed component architecture
- **[Creating Components](creating-components.md)**: Step-by-step component creation guide
- **[Configuration Reference](../configuration/component-config.md)**: Component configuration options
- **[Styling Overview](../styling/styling-overview.md)**: CSS system and theming

---

This component catalog provides complete information for understanding, modifying, and extending all Dashboard components. Each component is designed for maximum flexibility while maintaining consistency and accessibility standards.