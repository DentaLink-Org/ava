# Add Component Script Documentation

## Purpose
This document provides a comprehensive guide to the `add-component.ts` automation script for the Dashboard page. This script enables AI agents to dynamically add new components to the dashboard by modifying the `config.yaml` file safely and efficiently.

## Overview
The `add-component.ts` script is a TypeScript-based automation tool that:
- Adds new components to the dashboard grid layout
- Validates component positions and prevents conflicts
- Creates automatic backups before modifications
- Generates unique component IDs
- Supports custom props, styling, and positioning

## Script Location
```
src/pages/dashboard/scripts/add-component.ts
```

## Core Functionality

### Key Features
- **Automatic ID Generation**: Creates unique component identifiers
- **Grid Position Validation**: Ensures components fit within the grid system
- **Conflict Detection**: Prevents overlapping components
- **Backup System**: Creates timestamped backups before changes
- **Props Support**: Accepts complex component properties
- **Custom Styling**: Supports className and inline styles
- **CLI Interface**: Command-line usage for agent automation

### Validation System
The script includes multiple validation layers:
1. **Position Validation**: Checks column, row, and span values
2. **Grid Boundary Validation**: Ensures components don't exceed grid limits
3. **Conflict Detection**: Prevents overlapping with existing components
4. **Configuration Validation**: Verifies YAML structure integrity

## Usage Patterns

### Basic Component Addition
```bash
# Add a component with minimal configuration
node add-component.ts add WelcomeHeader 1 1 12 '{"title":"Welcome"}'

# Add component with position parameters
node add-component.ts add KPICards 2 1 6 '{"metrics":[]}'
```

### Advanced Component Addition
```bash
# Add component with custom styling and complex props
node add-component.ts add QuickStartCard 3 1 12 '{
  "title": "Getting Started",
  "description": "Complete these steps to set up your dashboard",
  "primaryAction": {
    "text": "Start Setup",
    "href": "/setup"
  },
  "className": "custom-quickstart",
  "style": {
    "backgroundColor": "#f8fafc",
    "borderRadius": "0.75rem"
  }
}'
```

### Position Checking
```bash
# List current component positions to find available space
node add-component.ts list
```

## Command Reference

### Add Command
```bash
node add-component.ts add <type> <row> <col> <span> [props-json]
```

**Parameters:**
- `type`: Component type (must match available component types)
- `row`: Grid row position (starting from 1)
- `col`: Grid column position (1 to max columns)
- `span`: Number of columns to span
- `props-json`: Optional JSON string with component properties

**Examples:**
```bash
# Basic header component
node add-component.ts add WelcomeHeader 1 1 12 '{"title":"Dashboard","subtitle":"Admin Overview"}'

# Navigation card with icon
node add-component.ts add DatabaseLinkCard 2 1 6 '{"title":"Databases","icon":"Database","href":"/databases"}'

# KPI cards with metrics
node add-component.ts add KPICards 3 1 12 '{
  "metrics": [
    {"title":"Users","value":1234,"description":"Active users"},
    {"title":"Revenue","value":"$45.2K","description":"This month"}
  ]
}'
```

### List Command
```bash
node add-component.ts list
```
Displays current component positions and grid usage information.

## Component Types

### Available Component Types
Based on the dashboard's component registry:

1. **WelcomeHeader**
   - Purpose: Main dashboard header with title and subtitle
   - Typical Position: Row 1, spanning full width (12 columns)
   - Required Props: `title`, optional `subtitle`

2. **DatabaseLinkCard**
   - Purpose: Navigation card to databases page
   - Typical Position: Half-width (6 columns)
   - Required Props: `title`, `href`, optional `icon`, `description`

3. **TasksLinkCard**
   - Purpose: Navigation card to tasks page
   - Typical Position: Half-width (6 columns)
   - Required Props: `title`, `href`, optional `icon`, `description`

4. **QuickStartCard**
   - Purpose: Onboarding and quick action card
   - Typical Position: Full width (12 columns)
   - Required Props: `title`, `description`, optional `primaryAction`

5. **KPICards**
   - Purpose: Display key performance indicators
   - Typical Position: Full width (12 columns)
   - Required Props: `metrics` array

6. **DashboardContainer**
   - Purpose: Layout wrapper (rarely added manually)
   - Typical Position: Full layout container
   - Props: Layout configuration

## Grid System

### Grid Configuration
The dashboard uses a configurable grid system (default: 12 columns):
- **Columns**: 1-12 (configurable up to 24)
- **Rows**: Unlimited, auto-expanding
- **Gap**: Configurable spacing between components
- **Padding**: Container padding around grid

### Position Guidelines
```yaml
position:
  col: 1      # Starting column (1-based)
  row: 1      # Row number (1-based)  
  span: 12    # Number of columns to span
  rowSpan: 1  # Number of rows to span (optional)
```

### Common Layout Patterns
```bash
# Full-width header
row: 1, col: 1, span: 12

# Two half-width cards side by side
# Card 1: row: 2, col: 1, span: 6
# Card 2: row: 2, col: 7, span: 6

# Three equal-width cards
# Card 1: row: 3, col: 1, span: 4
# Card 2: row: 3, col: 5, span: 4
# Card 3: row: 3, col: 9, span: 4

# Asymmetric layout (2/3 + 1/3)
# Main: row: 4, col: 1, span: 8
# Sidebar: row: 4, col: 9, span: 4
```

## Props Configuration

### Component-Specific Props

#### WelcomeHeader Props
```typescript
interface WelcomeHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
}
```

#### Navigation Card Props
```typescript
interface NavigationCardProps {
  title: string;
  description?: string;
  href: string;
  icon?: string;
  className?: string;
  style?: React.CSSProperties;
}
```

#### QuickStartCard Props
```typescript
interface QuickStartCardProps {
  title: string;
  description: string;
  primaryAction?: {
    text: string;
    href: string;
  };
  className?: string;
  style?: React.CSSProperties;
}
```

#### KPICards Props
```typescript
interface KPICardsProps {
  metrics: Array<{
    id?: string;
    title: string;
    value: string | number;
    suffix?: string;
    description?: string;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
  }>;
  className?: string;
  style?: React.CSSProperties;
}
```

### Universal Props
All components support these optional props:
- `className`: CSS class name for custom styling
- `style`: Inline CSS styles object
- `id`: Custom component identifier (auto-generated if not provided)

## Examples and Use Cases

### Common Scenarios

#### 1. Adding a New Metrics Section
```bash
# Add KPI cards below existing content
node add-component.ts add KPICards 5 1 12 '{
  "metrics": [
    {
      "title": "Database Connections",
      "value": 45,
      "description": "Active connections",
      "trend": "up"
    },
    {
      "title": "Query Performance",
      "value": "23ms",
      "description": "Average response time",
      "trend": "down"
    },
    {
      "title": "Storage Used",
      "value": "234GB",
      "description": "Of 500GB total",
      "trend": "neutral"
    }
  ]
}'
```

#### 2. Adding Navigation Cards
```bash
# Add new navigation section
node add-component.ts add DatabaseLinkCard 3 1 4 '{
  "title": "Analytics",
  "description": "View reports and insights",
  "href": "/analytics",
  "icon": "BarChart3"
}'

node add-component.ts add TasksLinkCard 3 5 4 '{
  "title": "Settings",
  "description": "Configure your workspace", 
  "href": "/settings",
  "icon": "Settings"
}'

node add-component.ts add QuickStartCard 3 9 4 '{
  "title": "Help",
  "description": "Documentation and support",
  "primaryAction": {
    "text": "View Docs",
    "href": "/help"
  }
}'
```

#### 3. Adding Custom Welcome Section
```bash
# Replace or add additional welcome header
node add-component.ts add WelcomeHeader 6 1 12 '{
  "title": "System Status",
  "subtitle": "Real-time monitoring and alerts",
  "className": "status-header",
  "style": {
    "backgroundColor": "#f0f9ff",
    "border": "1px solid #0ea5e9",
    "borderRadius": "0.5rem"
  }
}'
```

### Advanced Configuration Examples

#### Custom Styling with Themes
```bash
# Add component with theme-aware styling
node add-component.ts add QuickStartCard 4 1 12 '{
  "title": "Feature Spotlight",
  "description": "Discover new capabilities and improvements",
  "primaryAction": {
    "text": "Explore Features",
    "href": "/features"
  },
  "className": "feature-spotlight",
  "style": {
    "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "color": "white",
    "border": "none"
  }
}'
```

#### Complex Metrics Configuration
```bash
# Add comprehensive metrics dashboard
node add-component.ts add KPICards 2 1 12 '{
  "metrics": [
    {
      "id": "user-growth",
      "title": "User Growth",
      "value": 1234,
      "suffix": "users",
      "description": "30-day growth",
      "change": 15.3,
      "trend": "up"
    },
    {
      "id": "revenue-metrics",
      "title": "Monthly Revenue",
      "value": "$45,230",
      "description": "Recurring revenue",
      "change": -2.1,
      "trend": "down"
    },
    {
      "id": "system-health",
      "title": "System Health",
      "value": "99.9%",
      "suffix": "uptime",
      "description": "Last 30 days",
      "trend": "neutral"
    },
    {
      "id": "task-completion",
      "title": "Task Completion",
      "value": 847,
      "suffix": "tasks",
      "description": "This month",
      "change": 8.7,
      "trend": "up"
    }
  ],
  "className": "metrics-dashboard"
}'
```

## Error Handling

### Common Error Scenarios

#### 1. Position Conflicts
```
❌ Position conflict with component "welcome-header" at row 1, col 1
```
**Solution**: Choose a different position or move existing component
```bash
# Check existing positions first
node add-component.ts list

# Choose available position
node add-component.ts add WelcomeHeader 2 1 12 '{"title":"New Header"}'
```

#### 2. Invalid Grid Position
```
❌ Component extends beyond grid (col 9 + span 6 > 12)
```
**Solution**: Adjust column position or span
```bash
# Fix: Reduce span or adjust column
node add-component.ts add KPICards 2 9 4 '{"metrics":[]}'  # Fixed span
# OR
node add-component.ts add KPICards 2 7 6 '{"metrics":[]}'  # Fixed column
```

#### 3. Invalid Props JSON
```
❌ Invalid props JSON: Unexpected token
```
**Solution**: Check JSON syntax and escaping
```bash
# Incorrect: Unescaped quotes
node add-component.ts add WelcomeHeader 1 1 12 '{"title":"Welcome "User""}'

# Correct: Properly escaped
node add-component.ts add WelcomeHeader 1 1 12 '{"title":"Welcome \"User\""}'

# Alternative: Use single quotes inside
node add-component.ts add WelcomeHeader 1 1 12 '{"title":"Welcome User"}'
```

#### 4. Component Type Not Found
```
❌ Unknown component type: CustomComponent
```
**Solution**: Use registered component types only
```bash
# Check available types in component catalog
# Use valid component types: WelcomeHeader, KPICards, etc.
node add-component.ts add WelcomeHeader 1 1 12 '{"title":"Header"}'
```

### Recovery Procedures

#### Automatic Backup Restoration
```bash
# Script creates automatic backups before changes
# Check backup directory
ls -la .backups/

# Restore from most recent backup
cp .backups/config_backup_2025-07-01T10-30-45-123Z.yaml config.yaml
```

#### Manual Correction
```bash
# Edit config.yaml directly to fix issues
# Remove problematic component entry
# Re-run validation
node ../scripts/deploy-changes.sh validate
```

## Integration with Dashboard System

### Configuration File Impact
The script modifies `config.yaml` in the components section:
```yaml
components:
  - id: "generated-id-123"
    type: "WelcomeHeader"
    position:
      col: 1
      row: 1
      span: 12
    props:
      title: "Dashboard"
      subtitle: "Welcome message"
```

### Component Registration
Components must be registered in the dashboard's component system:
- Located in `src/pages/dashboard/components/`
- Exported from component index files
- Available in the component registry

### Backup System
Automatic backups are created in `.backups/` directory:
```
.backups/
├── config_backup_2025-07-01T10-15-30-456Z.yaml
├── config_backup_2025-07-01T10-20-15-789Z.yaml
└── config_backup_2025-07-01T10-25-00-012Z.yaml
```

## Best Practices

### For AI Agents

1. **Always Check Positions First**
   ```bash
   # Start every session by checking current layout
   node add-component.ts list
   ```

2. **Use Descriptive Component IDs**
   ```bash
   # Include meaningful ID in props
   '{"id":"sales-dashboard","title":"Sales Overview"}'
   ```

3. **Plan Grid Layout**
   - Consider mobile responsiveness
   - Leave space for future components
   - Use consistent row organization

4. **Validate Props Structure**
   - Test JSON syntax before adding
   - Include required props for each component type
   - Use appropriate data types

### Safety Guidelines

1. **Backup Verification**
   ```bash
   # Verify backup was created
   ls -la .backups/ | head -1
   ```

2. **Incremental Changes**
   - Add one component at a time
   - Test functionality after each addition
   - Validate before proceeding

3. **Position Planning**
   - Draw layout on paper/digital tool
   - Calculate spans and positions
   - Check for conflicts manually

## Script Implementation Details

### Core Functions

#### `addComponent(options: AddComponentOptions)`
Main function for adding components:
- Creates backup automatically
- Validates position and conflicts
- Generates component configuration
- Updates and saves config file

#### `validatePosition(position: ComponentPosition, maxColumns: number)`
Validates grid position parameters:
- Checks column boundaries (1 to maxColumns)
- Validates row number (>= 1)
- Ensures span fits within grid
- Prevents grid overflow

#### `checkPositionConflicts(newPosition: ComponentPosition, existingComponents: any[])`
Detects overlapping components:
- Calculates component boundaries
- Checks for row and column overlap
- Reports specific conflict details
- Prevents overlapping placements

#### `generateComponentId(type: string)`
Creates unique component identifiers:
- Uses component type prefix
- Includes timestamp for uniqueness
- Adds random suffix
- Ensures ID uniqueness

### Configuration Structure
The script works with this configuration structure:
```typescript
interface DashboardConfig {
  page: {
    title: string;
    route: string;
    description: string;
  };
  layout: {
    type: string;
    columns: number;
    gap: number;
    padding: number;
  };
  components: ComponentConfig[];
}

interface ComponentConfig {
  id: string;
  type: string;
  position: ComponentPosition;
  props: Record<string, any>;
  className?: string;
  style?: Record<string, any>;
}
```

## Troubleshooting

### Common Issues and Solutions

#### Script Won't Execute
```bash
# Make script executable
chmod +x scripts/add-component.ts

# Run with node directly
node scripts/add-component.ts
```

#### Dependencies Missing
```bash
# Install required packages
npm install js-yaml @types/js-yaml
```

#### Permission Errors
```bash
# Check file permissions
ls -la config.yaml scripts/

# Fix permissions if needed
chmod 644 config.yaml
chmod +x scripts/add-component.ts
```

#### Backup Directory Issues
```bash
# Create backup directory manually
mkdir -p .backups

# Check directory permissions
ls -la .backups/
```

### Debug Mode
For troubleshooting, add debug logging:
```bash
# Set debug environment variable
DEBUG=1 node add-component.ts add WelcomeHeader 1 1 12 '{"title":"Debug"}'
```

## Performance Considerations

### Script Performance
- Execution time: < 1 second for typical operations
- Memory usage: Minimal (< 10MB)
- File I/O: Only config.yaml and backup files
- No impact on runtime application performance

### Configuration Size
- Typical config size: 2-10KB
- Backup storage: < 1MB for 100 backups
- YAML parsing: Near-instantaneous
- No performance degradation with many components

## Future Enhancements

### Planned Features
1. **Interactive Mode**: Guided component addition with prompts
2. **Template Support**: Pre-configured component templates
3. **Batch Operations**: Add multiple components at once
4. **Visual Preview**: Show layout before applying changes
5. **Position Suggestions**: Recommend optimal positions

### Extension Points
- Custom validation rules
- Component-specific position logic
- Advanced conflict resolution
- Layout optimization algorithms
- Component grouping and relationships

## Related Documentation
- [Automation Overview](./automation-overview.md) - Complete automation system guide
- [Component Catalog](../components/component-catalog.md) - Available components reference
- [Configuration Overview](../configuration/config-overview.md) - Configuration system architecture
- [Layout Configuration](../configuration/layout-config.md) - Grid system details
- [Deploy Changes Script](./deploy-changes-script.md) - Validation and deployment

## Summary

The `add-component.ts` script provides AI agents with a powerful, safe method to add new components to the dashboard. Key benefits:

- **Safe Operations**: Automatic backups and validation prevent data loss
- **Conflict Prevention**: Grid validation prevents overlapping components
- **Flexible Configuration**: Supports complex props and custom styling
- **Easy Recovery**: Multiple rollback options for error recovery
- **Agent-Friendly**: Clear CLI interface designed for automated usage

By following this guide, AI agents can efficiently add and configure dashboard components while maintaining system integrity and preventing common errors. The script's robust validation and backup systems ensure that modifications can be made confidently and recovered quickly if needed.