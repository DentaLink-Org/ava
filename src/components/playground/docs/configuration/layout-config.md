# Dashboard Layout Configuration System

This comprehensive guide explains the complete layout configuration system for the Dashboard page. The layout system provides a flexible, CSS Grid-based architecture that enables AI agents to precisely control component positioning, spacing, and responsive behavior.

## 🏗️ Layout Architecture Overview

The Dashboard page uses a **CSS Grid-based layout system** that provides:

- **12-column grid** (configurable from 1-24 columns)
- **Flexible row positioning** with automatic height calculation
- **Responsive design** with automatic breakpoint handling
- **Component-level positioning control** via configuration
- **Multiple layout types** (grid, flex, custom)

### Layout Configuration Structure

```yaml
# config.yaml - Layout Configuration
layout:
  type: "grid"              # Layout system type
  columns: 12               # Number of grid columns (1-24)
  gap: 4                    # Grid gap in spacing units (0-20)
  padding: 6                # Container padding in spacing units (0-20)
```

## 📋 Layout Configuration Reference

### Layout Types

The system supports three layout types with different characteristics:

#### 1. Grid Layout (Recommended)
**Type**: `"grid"`  
**Description**: CSS Grid-based layout with precise positioning control

```yaml
layout:
  type: "grid"
  columns: 12               # Grid columns (default: 12)
  gap: 4                    # Space between components
  padding: 6                # Container padding
```

**Characteristics**:
- Precise component positioning with row/column coordinates
- Automatic responsive behavior across screen sizes
- Optimal for dashboard layouts with mixed component sizes
- Components can span multiple columns and rows

#### 2. Flex Layout
**Type**: `"flex"`  
**Description**: Flexbox-based layout with automatic component flow

```yaml
layout:
  type: "flex"
  gap: 4                    # Space between components
  padding: 6                # Container padding
  # columns property ignored in flex mode
```

**Characteristics**:
- Components flow naturally based on content size
- Automatic wrapping to new rows as needed
- Good for content-driven layouts
- Less precise positioning control

#### 3. Custom Layout
**Type**: `"custom"`  
**Description**: Advanced layout with custom CSS implementation

```yaml
layout:
  type: "custom"
  gap: 4
  padding: 6
  # Additional custom properties can be added
```

**Characteristics**:
- Requires custom CSS implementation in `styles.css`
- Maximum flexibility for complex layouts
- Used for specialized dashboard designs
- Requires advanced CSS knowledge

### Layout Properties

#### columns
**Type**: `number`  
**Range**: 1-24  
**Default**: 12  
**Grid Layout Only**

Defines the number of columns in the CSS Grid system.

```yaml
layout:
  columns: 12               # Standard 12-column grid
  # columns: 16             # Extended 16-column grid
  # columns: 24             # Maximum 24-column grid
```

**Common Values**:
- `12`: Standard dashboard layout (recommended)
- `16`: Extended layout for complex dashboards
- `8`: Simplified layout for smaller screens
- `24`: Maximum granularity for precise control

#### gap
**Type**: `number`  
**Range**: 0-20  
**Default**: 4  
**All Layout Types**

Controls spacing between components using the design system's spacing scale.

```yaml
layout:
  gap: 4                    # Standard spacing
  # gap: 2                 # Tight spacing
  # gap: 6                 # Loose spacing
  # gap: 0                 # No spacing
```

**Spacing Scale Mapping**:
- `0`: No gap (0rem)
- `2`: Small gap (0.5rem)
- `4`: Standard gap (1rem) - **Recommended**
- `6`: Large gap (1.5rem)
- `8`: Extra large gap (2rem)

#### padding
**Type**: `number`  
**Range**: 0-20  
**Default**: 6  
**All Layout Types**

Controls padding around the entire dashboard container.

```yaml
layout:
  padding: 6                # Standard container padding
  # padding: 4             # Reduced padding for mobile
  # padding: 8             # Increased padding for large screens
```

**Padding Scale Mapping**:
- `0`: No padding (0rem)
- `4`: Reduced padding (1rem)
- `6`: Standard padding (1.5rem) - **Recommended**
- `8`: Large padding (2rem)
- `12`: Extra large padding (3rem)

## 🎯 Component Positioning System

### Grid Position Configuration

Each component is positioned using a coordinate system within the layout grid:

```yaml
components:
  - id: "example-component"
    type: "ComponentType"
    position:
      col: 1                # Starting column (1-based)
      row: 1                # Starting row (1-based)
      span: 6               # Column span (1 to remaining columns)
      rowSpan: 1            # Row span (optional, default: 1)
    props:
      # Component props...
```

#### Position Properties

##### col (Column Start)
**Type**: `number`  
**Range**: 1 to `layout.columns`  
**Required**: Yes

Defines the starting column for the component.

```yaml
position:
  col: 1                    # Start at first column
  # col: 7                 # Start at column 7 (right half in 12-column grid)
```

##### row (Row Start)
**Type**: `number`  
**Range**: 1 to ∞  
**Required**: Yes

Defines the starting row for the component. Rows are created automatically as needed.

```yaml
position:
  row: 1                    # First row (header area)
  # row: 2                 # Second row (main content)
  # row: 3                 # Third row (footer area)
```

##### span (Column Span)
**Type**: `number`  
**Range**: 1 to remaining columns from `col`  
**Required**: Yes

Defines how many columns the component should span.

```yaml
position:
  span: 12                  # Full width
  # span: 6                # Half width
  # span: 4                # One-third width
  # span: 3                # One-quarter width
```

##### rowSpan (Row Span)
**Type**: `number`  
**Range**: 1 to ∞  
**Required**: No  
**Default**: 1

Defines how many rows the component should span.

```yaml
position:
  rowSpan: 1                # Single row (default)
  # rowSpan: 2             # Spans two rows
  # rowSpan: 3             # Spans three rows
```

### Position Calculation Examples

#### 12-Column Grid Examples

```yaml
layout:
  columns: 12

components:
  # Full width header
  - position: { col: 1, row: 1, span: 12 }
  
  # Two half-width components
  - position: { col: 1, row: 2, span: 6 }
  - position: { col: 7, row: 2, span: 6 }
  
  # Three equal-width components
  - position: { col: 1, row: 3, span: 4 }
  - position: { col: 5, row: 3, span: 4 }
  - position: { col: 9, row: 3, span: 4 }
  
  # Mixed layout: 1/3 + 2/3
  - position: { col: 1, row: 4, span: 4 }
  - position: { col: 5, row: 4, span: 8 }
```

#### 16-Column Grid Examples

```yaml
layout:
  columns: 16

components:
  # Four equal-width components
  - position: { col: 1, row: 1, span: 4 }
  - position: { col: 5, row: 1, span: 4 }
  - position: { col: 9, row: 1, span: 4 }
  - position: { col: 13, row: 1, span: 4 }
  
  # Sidebar + main content
  - position: { col: 1, row: 2, span: 4 }    # Sidebar
  - position: { col: 5, row: 2, span: 12 }   # Main content
```

### Position Validation

The system validates component positions to prevent conflicts:

#### Conflict Detection
- **Overlap Prevention**: Components cannot occupy the same grid cells
- **Boundary Checking**: Components cannot extend beyond grid boundaries
- **Gap Validation**: Ensures proper spacing between components

#### Error Examples

```yaml
# ❌ Invalid: Extends beyond 12-column grid
position: { col: 10, row: 1, span: 6 }  # 10 + 6 = 16 > 12

# ❌ Invalid: Column start exceeds grid
position: { col: 15, row: 1, span: 2 }  # col 15 > 12 columns

# ❌ Invalid: Overlapping components
components:
  - position: { col: 1, row: 1, span: 8 }   # Occupies cols 1-8
  - position: { col: 5, row: 1, span: 6 }   # Overlaps cols 5-8
```

## 🎨 Responsive Design System

### Automatic Responsive Behavior

The layout system automatically adapts to different screen sizes:

#### Desktop (>1024px)
```css
.dashboard-content-grid {
  grid-template-columns: repeat(12, 1fr);  /* Full 12 columns */
  gap: var(--spacing-lg);                  /* Standard gap */
}
```

#### Tablet (768px-1024px)
```css
@media (max-width: 1024px) {
  .dashboard-content-grid {
    grid-template-columns: repeat(8, 1fr); /* Reduced to 8 columns */
    gap: var(--spacing-md);                 /* Smaller gap */
  }
}
```

#### Mobile (<768px)
```css
@media (max-width: 768px) {
  .dashboard-content-grid {
    grid-template-columns: 1fr;            /* Single column */
    gap: var(--spacing-sm);                 /* Minimal gap */
  }
}
```

### Component Adaptation

Individual components adapt their positioning automatically:

```css
/* Desktop: Half-width components */
.page-dashboard .link-card {
  grid-column: span 6;
}

/* Tablet: Adjust proportions */
@media (max-width: 1024px) {
  .page-dashboard .link-card {
    grid-column: span 4;        /* Half of 8 columns */
  }
}

/* Mobile: Full-width */
@media (max-width: 768px) {
  .page-dashboard .link-card {
    grid-column: span 1;        /* Full width */
  }
}
```

## 🔧 Layout Automation Scripts

### update-layout.sh Script

The Dashboard includes a powerful script for modifying layout configuration:

#### Basic Usage

```bash
# Navigate to dashboard directory
cd src/pages/dashboard

# Update grid columns
./scripts/update-layout.sh columns 16

# Update spacing
./scripts/update-layout.sh gap 6

# Update padding
./scripts/update-layout.sh padding 8

# Change layout type
./scripts/update-layout.sh type flex

# Create backup
./scripts/update-layout.sh backup

# Validate configuration
./scripts/update-layout.sh validate
```

#### Available Commands

##### columns
Update the number of grid columns (1-24)

```bash
./scripts/update-layout.sh columns 12    # Standard 12-column grid
./scripts/update-layout.sh columns 16    # Extended 16-column grid
./scripts/update-layout.sh columns 8     # Simplified 8-column grid
```

##### gap
Update spacing between components (0-20)

```bash
./scripts/update-layout.sh gap 4         # Standard spacing
./scripts/update-layout.sh gap 2         # Tight spacing
./scripts/update-layout.sh gap 6         # Loose spacing
```

##### padding
Update container padding (0-20)

```bash
./scripts/update-layout.sh padding 6     # Standard padding
./scripts/update-layout.sh padding 4     # Reduced padding
./scripts/update-layout.sh padding 8     # Increased padding
```

##### type
Change layout type

```bash
./scripts/update-layout.sh type grid     # CSS Grid layout
./scripts/update-layout.sh type flex     # Flexbox layout
./scripts/update-layout.sh type custom   # Custom layout
```

##### backup
Create configuration backup

```bash
./scripts/update-layout.sh backup        # Creates timestamped backup
```

##### validate
Validate current configuration

```bash
./scripts/update-layout.sh validate      # Checks YAML syntax
```

#### Script Features

- **Automatic Backup**: Creates backup before each change
- **YAML Validation**: Validates configuration after updates
- **Error Handling**: Prevents invalid values and configurations
- **Rollback Support**: Easy restoration from backups

## 📐 Layout Planning & Best Practices

### Grid Planning Process

#### 1. Define Content Areas
Identify the main content areas for your dashboard:

```yaml
# Content area planning
areas:
  header: { rows: 1, priority: "high" }
  navigation: { rows: 1, priority: "high" }
  main_content: { rows: "2-4", priority: "high" }
  sidebar: { columns: "3-4", priority: "medium" }
  footer: { rows: 1, priority: "low" }
```

#### 2. Choose Grid System
Select appropriate grid columns based on content complexity:

- **8 columns**: Simple dashboards with large components
- **12 columns**: Standard dashboards (recommended)
- **16 columns**: Complex dashboards with mixed component sizes
- **24 columns**: Highly detailed layouts requiring precise control

#### 3. Map Component Positions
Plan component positions to avoid conflicts:

```yaml
# Position planning matrix (12-column example)
#     1  2  3  4  5  6  7  8  9 10 11 12
# R1 [    Header spanning full width      ]
# R2 [  Nav Left   ] [   Nav Right       ]
# R3 [ Sidebar ] [     Main Content      ]
# R4 [    Footer spanning full width      ]

components:
  - { id: "header", position: { col: 1, row: 1, span: 12 } }
  - { id: "nav-left", position: { col: 1, row: 2, span: 6 } }
  - { id: "nav-right", position: { col: 7, row: 2, span: 6 } }
  - { id: "sidebar", position: { col: 1, row: 3, span: 3 } }
  - { id: "main", position: { col: 4, row: 3, span: 9 } }
  - { id: "footer", position: { col: 1, row: 4, span: 12 } }
```

### Layout Design Patterns

#### Dashboard Header Pattern
```yaml
components:
  - id: "page-header"
    position: { col: 1, row: 1, span: 12 }
    # Full-width header across top
```

#### Sidebar + Main Content Pattern
```yaml
components:
  - id: "sidebar"
    position: { col: 1, row: 2, span: 3 }
  - id: "main-content"
    position: { col: 4, row: 2, span: 9 }
```

#### Card Grid Pattern
```yaml
components:
  # Row of cards
  - id: "card-1"
    position: { col: 1, row: 2, span: 4 }
  - id: "card-2"
    position: { col: 5, row: 2, span: 4 }
  - id: "card-3"
    position: { col: 9, row: 2, span: 4 }
```

#### Hero + Supporting Content Pattern
```yaml
components:
  - id: "hero-section"
    position: { col: 1, row: 1, span: 12, rowSpan: 2 }
  - id: "support-1"
    position: { col: 1, row: 3, span: 6 }
  - id: "support-2"
    position: { col: 7, row: 3, span: 6 }
```

### Responsive Design Guidelines

#### Mobile-First Planning
Design for mobile screens first, then enhance for larger screens:

```yaml
# Mobile consideration in component planning
components:
  - id: "priority-content"
    position: { col: 1, row: 1, span: 12 }  # Always full-width
    # This will adapt to single column on mobile
  
  - id: "secondary-content"
    position: { col: 1, row: 2, span: 6 }   # Half-width on desktop
    # Will become full-width on mobile
```

#### Breakpoint Awareness
Consider how components will reflow at different breakpoints:

- **Desktop (12 columns)**: Full control over positioning
- **Tablet (8 columns)**: Components maintain proportions
- **Mobile (1 column)**: All components stack vertically

## 🛠️ Advanced Layout Configuration

### Custom Layout Implementation

For specialized layouts, use the custom layout type:

```yaml
layout:
  type: "custom"
  gap: 4
  padding: 6
  # Custom properties
  customClass: "dashboard-custom-layout"
  gridAreas: "header sidebar main"
```

Then implement in `styles.css`:

```css
.page-dashboard.dashboard-custom-layout .dashboard-content-grid {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 300px 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: var(--spacing-lg);
}

.page-dashboard .custom-header {
  grid-area: header;
}

.page-dashboard .custom-sidebar {
  grid-area: sidebar;
}

.page-dashboard .custom-main {
  grid-area: main;
}
```

### Dynamic Layout Updates

Components can be repositioned dynamically:

```javascript
// Example: Dynamic position update via API
const updateComponentPosition = async (componentId, newPosition) => {
  const config = await loadConfig();
  const component = config.components.find(c => c.id === componentId);
  
  if (component) {
    component.position = newPosition;
    await saveConfig(config);
  }
};

// Usage
await updateComponentPosition('kpi-cards', {
  col: 1,
  row: 3,
  span: 8
});
```

### Layout Performance Optimization

#### CSS Grid Optimization
```css
.page-dashboard .dashboard-content-grid {
  /* Use explicit grid sizing for performance */
  grid-template-columns: repeat(12, minmax(0, 1fr));
  
  /* Optimize for layout stability */
  grid-auto-rows: min-content;
  
  /* Enable GPU acceleration */
  will-change: transform;
  
  /* Optimize paint performance */
  contain: layout style paint;
}
```

#### Component Loading Strategy
```yaml
# Optimize component loading order
components:
  # Critical components first (above the fold)
  - id: "header"
    position: { col: 1, row: 1, span: 12 }
    priority: "critical"
  
  # Important components second
  - id: "navigation"
    position: { col: 1, row: 2, span: 12 }
    priority: "important"
  
  # Secondary components last
  - id: "footer"
    position: { col: 1, row: 5, span: 12 }
    priority: "secondary"
```

## 🚨 Troubleshooting Layout Issues

### Common Layout Problems

#### 1. Component Overlap
**Problem**: Components appearing on top of each other

**Diagnosis**:
```bash
# Check for position conflicts
./scripts/update-layout.sh validate
node scripts/add-component.ts list
```

**Solutions**:
- Verify component positions don't overlap
- Adjust `col` and `span` values to prevent conflicts
- Use different `row` values for conflicting components

#### 2. Components Extending Beyond Grid
**Problem**: Components cut off or extending beyond visible area

**Diagnosis**:
```yaml
# Check if col + span exceeds grid columns
position:
  col: 10
  span: 6        # 10 + 6 = 16, exceeds 12-column grid
```

**Solutions**:
- Reduce component `span`
- Move component to earlier `col`
- Increase grid `columns` in layout config

#### 3. Responsive Layout Breaking
**Problem**: Layout not adapting properly on mobile devices

**Solutions**:
```css
/* Add specific mobile overrides */
@media (max-width: 768px) {
  .page-dashboard .problematic-component {
    grid-column: 1 / -1;  /* Force full width */
    margin-bottom: var(--spacing-lg);
  }
}
```

#### 4. Inconsistent Spacing
**Problem**: Irregular spacing between components

**Diagnosis**:
```yaml
# Check layout gap configuration
layout:
  gap: 4          # Ensure consistent gap value
```

**Solutions**:
- Use consistent `gap` values in layout config
- Avoid custom margins on components
- Use the design system spacing scale

### Layout Debugging Tools

#### Browser DevTools
```javascript
// Debug grid layout in browser console
const grid = document.querySelector('.dashboard-content-grid');

// Visualize grid
grid.style.background = 'rgba(255,0,0,0.1)';
grid.style.gridGap = '2px solid red';

// Show grid lines
document.body.style.gridTemplate = 'grid';
```

#### Configuration Validation
```bash
# Validate configuration
./scripts/update-layout.sh validate

# Check component positions
node scripts/add-component.ts list

# Create backup before changes
./scripts/update-layout.sh backup
```

#### CSS Grid Inspector
Use browser DevTools Grid Inspector:
1. Open DevTools (F12)
2. Select `.dashboard-content-grid` element
3. Click grid badge to enable grid overlay
4. Inspect grid lines and component positioning

## 📖 Related Documentation

- **[Architecture Overview](../architecture/overview.md)**: Complete system architecture
- **[Component Patterns](../architecture/component-patterns.md)**: Component development patterns
- **[Configuration Overview](config-overview.md)**: Configuration system architecture
- **[Styling System](../styling/styling-overview.md)**: Dashboard styling architecture
- **[Component Creation Guide](../components/creating-components.md)**: Creating new components

---

This layout configuration system provides complete control over dashboard component positioning while maintaining responsive design and agent-friendly automation. The combination of configuration-driven positioning and automated scripts enables rapid dashboard customization without manual CSS modifications.