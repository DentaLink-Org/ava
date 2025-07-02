# Dashboard Component Configuration Reference

This comprehensive reference guide explains how to configure Dashboard components through the YAML configuration system. Understanding component configuration is essential for AI agents to effectively customize dashboard functionality without modifying code.

## 🎯 Component Configuration Overview

The Dashboard page uses a declarative configuration system where components are defined in YAML format. Each component configuration includes positioning, properties, styling, and behavior settings that control how components render and function.

### Configuration Structure

```yaml
components:
  - id: "component-identifier"        # Unique identifier
    type: "ComponentType"             # Registered component type
    position:                         # Grid positioning
      col: 1                          # Starting column
      row: 1                          # Starting row  
      span: 6                         # Column span
      rowSpan: 1                      # Row span (optional)
    props:                            # Component-specific properties
      title: "Component Title"
      description: "Component description"
    style:                            # Inline styles (optional)
      backgroundColor: "#ffffff"
    className: "custom-class"         # Additional CSS classes (optional)
```

## 📋 Core Configuration Properties

### Component Identification

#### id
**Type**: `string`  
**Required**: Yes  
**Description**: Unique identifier for the component instance

```yaml
id: "welcome-header"                  # Simple identifier
# id: "kpi-metrics-main"             # Descriptive identifier
# id: "nav-card-databases"           # Hierarchical naming
```

**Naming Conventions**:
- Use lowercase with hyphens
- Include component purpose: `"revenue-chart"`, `"user-stats"`
- Avoid special characters and spaces
- Make identifiers descriptive and unique

#### type
**Type**: `string`  
**Required**: Yes  
**Description**: Registered component type that determines which component to render

```yaml
type: "WelcomeHeader"                 # Header component
# type: "KPICards"                   # Metrics display
# type: "DatabaseLinkCard"           # Navigation card
```

**Available Component Types**:
- `WelcomeHeader`: Page header with title and subtitle
- `DatabaseLinkCard`: Navigation card to databases page
- `TasksLinkCard`: Navigation card to tasks page
- `QuickStartCard`: Onboarding and guidance card
- `KPICards`: Key performance indicators display
- `DashboardContainer`: Layout container component

### Component Positioning

The positioning system uses CSS Grid coordinates to place components precisely:

#### position
**Type**: `object`  
**Required**: Yes  
**Description**: Grid positioning configuration

```yaml
position:
  col: 1                              # Starting column (1-based)
  row: 1                              # Starting row (1-based)
  span: 6                             # Column span
  rowSpan: 1                          # Row span (optional)
```

##### col (Column Start)
**Type**: `number`  
**Range**: 1 to `layout.columns`  
**Required**: Yes

```yaml
position:
  col: 1                              # Left edge
  # col: 7                           # Right half in 12-column grid
  # col: 4                           # Center start in 12-column grid
```

##### row (Row Start)  
**Type**: `number`  
**Range**: 1 to ∞  
**Required**: Yes

```yaml
position:
  row: 1                              # First row
  # row: 2                           # Second row
  # row: 5                           # Fifth row
```

##### span (Column Span)
**Type**: `number`  
**Range**: 1 to remaining columns  
**Required**: Yes

```yaml
position:
  span: 12                            # Full width
  # span: 6                          # Half width
  # span: 4                          # One-third width
  # span: 3                          # One-quarter width
```

##### rowSpan (Row Span)
**Type**: `number`  
**Range**: 1 to ∞  
**Required**: No  
**Default**: 1

```yaml
position:
  rowSpan: 1                          # Single row (default)
  # rowSpan: 2                       # Two rows tall
  # rowSpan: 3                       # Three rows tall
```

### Component Properties

#### props
**Type**: `object`  
**Required**: Yes  
**Description**: Component-specific properties that control functionality and content

```yaml
props:
  title: "Dashboard"                  # String property
  showIcon: true                      # Boolean property
  metrics: []                         # Array property
  primaryAction:                      # Object property
    text: "Get Started"
    href: "/start"
```

**Property Types**:
- **Strings**: Text content, URLs, identifiers
- **Numbers**: Counts, values, dimensions
- **Booleans**: Feature toggles, visibility flags
- **Arrays**: Lists of items, metrics, actions
- **Objects**: Complex data structures, nested configurations

### Optional Configuration Properties

#### style
**Type**: `object`  
**Required**: No  
**Description**: Inline CSS styles applied directly to the component

```yaml
style:
  backgroundColor: "#f8f9fa"          # Background color
  padding: "16px"                     # Custom padding
  borderRadius: "8px"                 # Border radius
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"  # Shadow effect
```

**Style Properties**:
- Use camelCase for CSS property names
- Include units for dimensional values
- Use hex codes or CSS color names for colors
- Follow CSS syntax for complex values

#### className
**Type**: `string`  
**Required**: No  
**Description**: Additional CSS classes applied to the component

```yaml
className: "custom-component"         # Single class
# className: "feature-highlight important"  # Multiple classes
```

**Class Naming**:
- Use kebab-case for class names
- Separate multiple classes with spaces
- Ensure classes are defined in `styles.css`
- Avoid conflicts with existing component classes

## 🎨 Component-Specific Configuration

### WelcomeHeader Component

Header component that displays page title and subtitle.

```yaml
- id: "welcome-header"
  type: "WelcomeHeader"
  position: { col: 1, row: 1, span: 12 }
  props:
    title: "Dashboard"                # Main page title
    subtitle: "Welcome to your admin dashboard"  # Subtitle text
```

**Required Props**:
- `title`: Main heading text
- `subtitle`: Descriptive subtitle

**Example Configurations**:
```yaml
# Standard header
props:
  title: "Dashboard"
  subtitle: "Manage your data and analytics"

# Custom branded header  
props:
  title: "Company Portal"
  subtitle: "Internal management dashboard"
  
# Minimal header
props:
  title: "Admin"
  subtitle: "Quick access to tools"
```

### DatabaseLinkCard Component

Navigation card linking to the databases page.

```yaml
- id: "database-link-card"
  type: "DatabaseLinkCard"
  position: { col: 1, row: 2, span: 6 }
  props:
    title: "Databases"               # Card title
    description: "Manage your databases"  # Card description
    href: "/databases"               # Navigation URL
    icon: "Database"                 # Lucide icon name
```

**Required Props**:
- `title`: Card heading
- `description`: Card description text
- `href`: Navigation URL
- `icon`: Lucide React icon name

**Available Icons**:
- `Database`: Database icon
- `Server`: Server icon
- `HardDrive`: Storage icon
- `Layers`: Layers icon

**Example Configurations**:
```yaml
# Standard database card
props:
  title: "Databases"
  description: "Connect and manage data sources"
  href: "/databases"
  icon: "Database"

# Custom data card
props:
  title: "Data Sources"
  description: "Configure external connections"
  href: "/data-sources"
  icon: "Server"
```

### TasksLinkCard Component

Navigation card linking to the tasks page.

```yaml
- id: "tasks-link-card"
  type: "TasksLinkCard"
  position: { col: 7, row: 2, span: 6 }
  props:
    title: "Task Management"         # Card title
    description: "Organize and track tasks"  # Card description
    href: "/tasks"                   # Navigation URL
    icon: "CheckSquare"              # Lucide icon name
```

**Required Props**:
- `title`: Card heading
- `description`: Card description text
- `href`: Navigation URL
- `icon`: Lucide React icon name

**Available Icons**:
- `CheckSquare`: Task/checkbox icon
- `List`: List icon
- `Calendar`: Calendar icon
- `Users`: Team icon

### QuickStartCard Component

Onboarding card with guidance and primary action.

```yaml
- id: "quick-start-card"
  type: "QuickStartCard"
  position: { col: 1, row: 3, span: 12 }
  props:
    title: "Quick Start"             # Card title
    description: "Get started with the dashboard"  # Description
    primaryAction:                   # Main action button
      text: "Go to Databases"       # Button text
      href: "/databases"             # Button URL
```

**Required Props**:
- `title`: Card heading
- `description`: Guidance text
- `primaryAction`: Object with `text` and `href`

**Primary Action Properties**:
- `text`: Button label
- `href`: Navigation URL

**Example Configurations**:
```yaml
# Database onboarding
props:
  title: "Quick Start"
  description: "Begin by connecting your first database"
  primaryAction:
    text: "Add Database"
    href: "/databases/new"

# Tutorial guidance
props:
  title: "Welcome Guide"
  description: "Learn how to use the dashboard effectively"
  primaryAction:
    text: "Start Tutorial"
    href: "/tutorial"
```

### KPICards Component

Display component for key performance indicators and metrics.

```yaml
- id: "kpi-cards"
  type: "KPICards"
  position: { col: 1, row: 4, span: 12 }
  props:
    metrics:                         # Array of metric objects
      - id: "total-revenue"          # Metric identifier
        title: "Total Revenue"       # Metric title
        value: 125000                # Metric value
        suffix: " USD"               # Value suffix
        description: "This quarter"  # Metric description
        delta: "+12%"                # Change indicator
        deltaType: "increase"        # Change type
```

**Required Props**:
- `metrics`: Array of metric objects

**Metric Object Properties**:
- `id`: Unique metric identifier
- `title`: Metric display name
- `value`: Numeric or string value
- `description`: Metric context
- `suffix`: Optional value suffix (e.g., " USD", "%")
- `delta`: Optional change indicator (e.g., "+12%", "-5%")
- `deltaType`: Change type ("increase", "decrease", "neutral")

**Example Configurations**:
```yaml
# Financial metrics
props:
  metrics:
    - id: "revenue"
      title: "Total Revenue"
      value: 245000
      suffix: " USD"
      description: "Year to date"
      delta: "+15%"
      deltaType: "increase"
    
    - id: "customers"
      title: "Active Customers"
      value: 1247
      description: "Current month"
      delta: "+8%"
      deltaType: "increase"

# System metrics
props:
  metrics:
    - id: "uptime"
      title: "System Uptime"
      value: "99.9%"
      description: "Last 30 days"
      deltaType: "neutral"
      
    - id: "response-time"
      title: "Avg Response Time"
      value: 245
      suffix: "ms"
      description: "Last hour"
      delta: "-12ms"
      deltaType: "increase"
```

### DashboardContainer Component

Layout container that wraps other components.

```yaml
- id: "dashboard-container"
  type: "DashboardContainer"
  position: { col: 1, row: 1, span: 12 }
  props:
    className: "custom-container"     # Optional container class
```

**Optional Props**:
- `className`: Additional CSS classes for styling

## 🎛️ Advanced Configuration Patterns

### Dynamic Property Values

Components can use dynamic values from data sources:

```yaml
- id: "dynamic-kpi"
  type: "KPICards"
  position: { col: 1, row: 4, span: 12 }
  props:
    metrics:
      - id: "live-users"
        title: "Active Users"
        value: "{{data.users.count}}"    # Dynamic value from data source
        description: "Currently online"
```

### Conditional Configuration

Components can be configured conditionally:

```yaml
- id: "admin-panel"
  type: "QuickStartCard" 
  position: { col: 1, row: 5, span: 6 }
  props:
    title: "Admin Tools"
    description: "{{user.isAdmin ? 'Manage system settings' : 'Contact administrator'}}"
    primaryAction:
      text: "{{user.isAdmin ? 'Open Admin Panel' : 'Request Access'}}"
      href: "{{user.isAdmin ? '/admin' : '/contact'}}"
```

### Multi-Language Configuration

Support multiple languages through configuration:

```yaml
- id: "welcome-header-i18n"
  type: "WelcomeHeader"
  position: { col: 1, row: 1, span: 12 }
  props:
    title: "{{i18n.dashboard.title}}"
    subtitle: "{{i18n.dashboard.subtitle}}"
```

### Theme-Aware Configuration

Components can adapt to theme settings:

```yaml
- id: "themed-component"
  type: "KPICards"
  position: { col: 1, row: 3, span: 12 }
  style:
    backgroundColor: "{{theme.colors.surface}}"
    color: "{{theme.colors.text}}"
  props:
    metrics: []
```

## 🔧 Configuration Validation

### Schema Validation

The system validates component configurations against JSON Schema:

```typescript
// Component configuration schema
{
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 },
    type: { type: "string", minLength: 1 },
    position: {
      type: "object",
      properties: {
        col: { type: "number", minimum: 1 },
        row: { type: "number", minimum: 1 },
        span: { type: "number", minimum: 1 },
        rowSpan: { type: "number", minimum: 1 }
      },
      required: ["col", "row", "span"]
    },
    props: { type: "object" },
    style: { type: "object" },
    className: { type: "string" }
  },
  required: ["id", "type", "position", "props"]
}
```

### Common Validation Errors

#### Missing Required Properties
```yaml
# ❌ Error: Missing required 'id' property
- type: "WelcomeHeader"
  position: { col: 1, row: 1, span: 12 }
  props: { title: "Dashboard" }

# ✅ Correct: All required properties included
- id: "header"
  type: "WelcomeHeader"
  position: { col: 1, row: 1, span: 12 }
  props: { title: "Dashboard", subtitle: "Welcome" }
```

#### Invalid Position Values
```yaml
# ❌ Error: col must be >= 1
position: { col: 0, row: 1, span: 6 }

# ❌ Error: span extends beyond grid
position: { col: 10, row: 1, span: 6 }  # 10 + 6 > 12

# ✅ Correct: Valid position within grid
position: { col: 7, row: 1, span: 6 }   # 7 + 6 = 13, but ends at 12
```

#### Invalid Component Types
```yaml
# ❌ Error: Component type not registered
type: "NonExistentComponent"

# ✅ Correct: Valid registered component
type: "WelcomeHeader"
```

### Configuration Testing

Test component configurations before deployment:

```bash
# Validate configuration syntax
./scripts/update-layout.sh validate

# Test component rendering
npm run test-components

# Check for position conflicts
node scripts/add-component.ts list
```

## 🛠️ Configuration Management Tools

### Adding Components via Script

Use the automation script to add components:

```bash
# Add a new component
node scripts/add-component.ts add KPICards 5 1 12 '{"metrics":[]}'

# Check positions before adding
node scripts/add-component.ts list
```

### Manual Configuration Updates

Edit `config.yaml` directly for complex changes:

```yaml
# Add new component manually
components:
  # Existing components...
  
  # New component
  - id: "custom-metrics"
    type: "KPICards"
    position: { col: 1, row: 5, span: 8 }
    props:
      metrics:
        - id: "custom-metric"
          title: "Custom Value"
          value: 42
          description: "Custom description"
    style:
      backgroundColor: "#f8f9fa"
      padding: "20px"
    className: "highlight-card"
```

### Configuration Backup & Restore

```bash
# Create backup before changes
./scripts/update-layout.sh backup

# List available backups
ls src/pages/dashboard/.backups/

# Restore from backup (manual process)
cp .backups/config_backup_20250701_143022.yaml config.yaml
```

## 🚨 Troubleshooting Configuration Issues

### Component Not Rendering

**Problem**: Component doesn't appear on the page

**Solutions**:
1. **Check component registration**:
   ```bash
   grep -n "ComponentType" src/pages/dashboard/register-components.ts
   ```

2. **Verify configuration syntax**:
   ```bash
   ./scripts/update-layout.sh validate
   ```

3. **Check browser console** for JavaScript errors

4. **Validate component props** against component interface

### Position Conflicts

**Problem**: Components overlapping or not positioned correctly

**Solutions**:
1. **List current positions**:
   ```bash
   node scripts/add-component.ts list
   ```

2. **Check for overlaps** in configuration:
   ```yaml
   # Component A: cols 1-6
   position: { col: 1, row: 2, span: 6 }
   
   # Component B: cols 5-10 (overlaps cols 5-6)
   position: { col: 5, row: 2, span: 6 }  # ❌ Conflict
   ```

3. **Adjust positions** to avoid conflicts

### Invalid Props

**Problem**: Component receiving incorrect or missing props

**Solutions**:
1. **Check component interface** in `types.ts`:
   ```typescript
   interface WelcomeHeaderProps {
     title: string;      // Required
     subtitle: string;   // Required
     theme?: any;        // Optional
   }
   ```

2. **Verify prop types** in configuration:
   ```yaml
   props:
     title: "Dashboard"     # ✅ String
     subtitle: 123          # ❌ Should be string
   ```

3. **Use browser DevTools** to inspect component props

### Styling Issues

**Problem**: Custom styles not applying correctly

**Solutions**:
1. **Check CSS class specificity**:
   ```css
   /* More specific selector needed */
   .page-dashboard .custom-component {
     background-color: red !important;
   }
   ```

2. **Verify className** is applied:
   ```yaml
   className: "custom-class"  # Check class exists in styles.css
   ```

3. **Use inline styles** for debugging:
   ```yaml
   style:
     backgroundColor: "red"   # Temporary debugging style
   ```

## 📚 Configuration Examples

### Complete Dashboard Configuration

```yaml
page:
  title: "Analytics Dashboard"
  route: "/"
  description: "Business analytics and metrics"

layout:
  type: "grid"
  columns: 12
  gap: 4
  padding: 6

components:
  # Header section
  - id: "main-header"
    type: "WelcomeHeader"
    position: { col: 1, row: 1, span: 12 }
    props:
      title: "Analytics Dashboard"
      subtitle: "Real-time business insights"

  # Navigation cards
  - id: "data-nav"
    type: "DatabaseLinkCard"
    position: { col: 1, row: 2, span: 6 }
    props:
      title: "Data Sources"
      description: "Manage connections"
      href: "/databases"
      icon: "Database"

  - id: "tasks-nav"
    type: "TasksLinkCard"
    position: { col: 7, row: 2, span: 6 }
    props:
      title: "Tasks"
      description: "Track progress"
      href: "/tasks"
      icon: "CheckSquare"

  # Quick start guidance
  - id: "onboarding"
    type: "QuickStartCard"
    position: { col: 1, row: 3, span: 12 }
    props:
      title: "Get Started"
      description: "Connect your first data source to begin"
      primaryAction:
        text: "Connect Database"
        href: "/databases/new"

  # Key metrics
  - id: "business-metrics"
    type: "KPICards"
    position: { col: 1, row: 4, span: 12 }
    props:
      metrics:
        - id: "revenue"
          title: "Monthly Revenue"
          value: 125000
          suffix: " USD"
          description: "Current month"
          delta: "+12%"
          deltaType: "increase"
        
        - id: "customers"
          title: "Active Customers"
          value: 2847
          description: "Active this month"
          delta: "+156"
          deltaType: "increase"
        
        - id: "conversion"
          title: "Conversion Rate"
          value: "3.2%"
          description: "Last 30 days"
          delta: "+0.3%"
          deltaType: "increase"
        
        - id: "satisfaction"
          title: "Customer Satisfaction"
          value: "4.8/5"
          description: "Average rating"
          deltaType: "neutral"
```

## 📖 Related Documentation

- **[Layout Configuration](layout-config.md)**: Grid positioning and layout system
- **[Component Patterns](../architecture/component-patterns.md)**: Component development patterns
- **[Component Catalog](../components/component-catalog.md)**: Complete component reference
- **[Creating Components](../components/creating-components.md)**: Building new components
- **[Configuration Overview](config-overview.md)**: Configuration system architecture

---

This component configuration reference provides complete control over dashboard components through YAML configuration. Understanding these patterns enables AI agents to customize dashboard functionality effectively without code modifications.