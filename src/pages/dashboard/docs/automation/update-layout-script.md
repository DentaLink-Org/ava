# Update Layout Script Documentation

## Purpose
This document provides a comprehensive guide to the `update-layout.sh` automation script for the Dashboard page. This script enables AI agents to dynamically modify the dashboard's grid layout system, including columns, spacing, padding, and layout types through safe configuration updates.

## Overview
The `update-layout.sh` script is a Bash-based automation tool that:
- Modifies grid column count (1-24 columns)
- Adjusts gap spacing between components (0-20 units)
- Updates container padding (0-20 units)
- Changes layout type (grid, flex, or custom)
- Creates automatic backups before modifications
- Validates YAML syntax after changes
- Provides safe configuration management

## Script Location
```
src/pages/dashboard/scripts/update-layout.sh
```

## Core Functionality

### Key Features
- **Grid Column Management**: Flexible column count from 1-24
- **Spacing Control**: Gap and padding configuration
- **Layout Type Switching**: Support for grid, flex, and custom layouts
- **Automatic Backup**: Creates timestamped backups before changes
- **YAML Validation**: Ensures configuration integrity
- **Error Handling**: Validates input ranges and prevents invalid configurations
- **Safe Operations**: All changes are reversible through backups

### Layout Structure
The script manages the layout section of the configuration:
```yaml
layout:
  type: "grid"      # Layout system type
  columns: 12       # Number of grid columns
  gap: 4           # Gap between components (spacing units)
  padding: 6       # Container padding (spacing units)
```

## Usage Patterns

### Grid Column Updates
```bash
# Standard 12-column grid
./scripts/update-layout.sh columns 12

# Dense 16-column layout
./scripts/update-layout.sh columns 16

# Wide 24-column layout
./scripts/update-layout.sh columns 24

# Simple 6-column layout
./scripts/update-layout.sh columns 6
```

### Gap Spacing Adjustments
```bash
# Tight spacing
./scripts/update-layout.sh gap 2

# Default spacing
./scripts/update-layout.sh gap 4

# Generous spacing
./scripts/update-layout.sh gap 8

# Maximum spacing
./scripts/update-layout.sh gap 20
```

### Padding Configuration
```bash
# Minimal padding
./scripts/update-layout.sh padding 2

# Standard padding
./scripts/update-layout.sh padding 6

# Generous padding
./scripts/update-layout.sh padding 12

# Maximum padding
./scripts/update-layout.sh padding 20
```

### Layout Type Changes
```bash
# Grid layout (default)
./scripts/update-layout.sh type grid

# Flexbox layout
./scripts/update-layout.sh type flex

# Custom layout
./scripts/update-layout.sh type custom
```

### Utility Commands
```bash
# Create manual backup
./scripts/update-layout.sh backup

# Validate current configuration
./scripts/update-layout.sh validate
```

## Command Reference

### Columns Command
```bash
./scripts/update-layout.sh columns <1-24>
```

**Purpose**: Updates the number of grid columns
**Range**: 1-24 columns
**Impact**: Affects component positioning and layout density

**Examples:**
```bash
# Mobile-optimized layout
./scripts/update-layout.sh columns 4

# Standard desktop layout
./scripts/update-layout.sh columns 12

# High-density layout
./scripts/update-layout.sh columns 16

# Ultra-wide layout
./scripts/update-layout.sh columns 24
```

### Gap Command
```bash
./scripts/update-layout.sh gap <0-20>
```

**Purpose**: Sets spacing between grid components
**Range**: 0-20 spacing units
**Impact**: Controls visual separation between components

**Examples:**
```bash
# No gap (components touch)
./scripts/update-layout.sh gap 0

# Minimal gap
./scripts/update-layout.sh gap 2

# Standard gap
./scripts/update-layout.sh gap 4

# Large gap
./scripts/update-layout.sh gap 8

# Maximum gap
./scripts/update-layout.sh gap 20
```

### Padding Command
```bash
./scripts/update-layout.sh padding <0-20>
```

**Purpose**: Sets container padding around the entire grid
**Range**: 0-20 spacing units
**Impact**: Controls space between grid and page edges

**Examples:**
```bash
# No padding (full bleed)
./scripts/update-layout.sh padding 0

# Minimal padding
./scripts/update-layout.sh padding 2

# Standard padding
./scripts/update-layout.sh padding 6

# Generous padding
./scripts/update-layout.sh padding 12

# Maximum padding
./scripts/update-layout.sh padding 20
```

### Type Command
```bash
./scripts/update-layout.sh type <grid|flex|custom>
```

**Purpose**: Changes the layout system type
**Options**: grid, flex, custom
**Impact**: Fundamentally changes how components are positioned

**Layout Types:**

#### Grid Layout
```bash
./scripts/update-layout.sh type grid
```
- **Best For**: Structured dashboards with defined positions
- **Behavior**: Components placed in specific grid positions
- **Features**: Column/row positioning, span control, gap management

#### Flex Layout
```bash
./scripts/update-layout.sh type flex
```
- **Best For**: Dynamic content that needs to flow naturally
- **Behavior**: Components arrange based on content size and flex rules
- **Features**: Automatic wrapping, flexible sizing, content-driven layout

#### Custom Layout
```bash
./scripts/update-layout.sh type custom
```
- **Best For**: Specialized layouts requiring manual positioning
- **Behavior**: Minimal layout constraints, maximum flexibility
- **Features**: Custom CSS classes, manual positioning, advanced styling

### Utility Commands

#### Backup Command
```bash
./scripts/update-layout.sh backup
```
Creates a manual backup of the current configuration for safety.

#### Validate Command
```bash
./scripts/update-layout.sh validate
```
Validates the current YAML configuration without making changes.

## Layout Patterns and Examples

### Responsive Layout Configurations

#### Mobile-First Layout
```bash
# Optimize for mobile devices
./scripts/update-layout.sh columns 4
./scripts/update-layout.sh gap 2
./scripts/update-layout.sh padding 4
```

#### Tablet Layout
```bash
# Medium screen optimization
./scripts/update-layout.sh columns 8
./scripts/update-layout.sh gap 4
./scripts/update-layout.sh padding 6
```

#### Desktop Layout
```bash
# Standard desktop configuration
./scripts/update-layout.sh columns 12
./scripts/update-layout.sh gap 4
./scripts/update-layout.sh padding 6
```

#### Ultra-wide Layout
```bash
# Large screen optimization
./scripts/update-layout.sh columns 16
./scripts/update-layout.sh gap 6
./scripts/update-layout.sh padding 8
```

### Density Configurations

#### Compact Layout
```bash
# High information density
./scripts/update-layout.sh columns 16
./scripts/update-layout.sh gap 2
./scripts/update-layout.sh padding 4
```

#### Comfortable Layout
```bash
# Balanced density and readability
./scripts/update-layout.sh columns 12
./scripts/update-layout.sh gap 4
./scripts/update-layout.sh padding 6
```

#### Spacious Layout
```bash
# Maximum readability and breathing room
./scripts/update-layout.sh columns 8
./scripts/update-layout.sh gap 8
./scripts/update-layout.sh padding 12
```

### Specialized Layout Scenarios

#### Executive Dashboard
```bash
# Clean, focused layout for executives
./scripts/update-layout.sh columns 6
./scripts/update-layout.sh gap 6
./scripts/update-layout.sh padding 10
./scripts/update-layout.sh type grid
```

#### Operational Dashboard
```bash
# Dense, information-rich layout for operators
./scripts/update-layout.sh columns 20
./scripts/update-layout.sh gap 2
./scripts/update-layout.sh padding 3
./scripts/update-layout.sh type grid
```

#### Presentation Dashboard
```bash
# Large, visible layout for presentations
./scripts/update-layout.sh columns 4
./scripts/update-layout.sh gap 8
./scripts/update-layout.sh padding 16
./scripts/update-layout.sh type grid
```

## Component Impact Analysis

### How Layout Changes Affect Components

#### Column Changes
When updating columns, existing components may need repositioning:

```bash
# Before: 12-column layout
# Component at col: 7, span: 6 (columns 7-12)

./scripts/update-layout.sh columns 8

# After: 8-column layout
# Same component now extends beyond grid (7-12 > 8)
# Manual component adjustment needed
```

#### Gap Changes
Gap changes affect visual spacing but don't break component positioning:

```bash
# Safe gap changes - no component updates needed
./scripts/update-layout.sh gap 6
./scripts/update-layout.sh gap 2
```

#### Layout Type Changes
Layout type changes may require component restructuring:

```bash
# Grid to Flex: Position properties become less relevant
./scripts/update-layout.sh type flex

# Flex to Grid: May need to add position properties
./scripts/update-layout.sh type grid
```

### Component Validation Workflow

After layout changes, validate component positioning:

```bash
# 1. Update layout
./scripts/update-layout.sh columns 16

# 2. Check component positions
node scripts/add-component.ts list

# 3. Validate configuration
./scripts/update-layout.sh validate

# 4. Test visual layout
# (Manual verification in browser)
```

## Advanced Usage Scenarios

### Multi-Step Layout Transformations

#### Desktop to Mobile Optimization
```bash
# Step 1: Reduce columns for mobile
./scripts/update-layout.sh columns 4

# Step 2: Tighten spacing
./scripts/update-layout.sh gap 2
./scripts/update-layout.sh padding 3

# Step 3: Switch to flex for better mobile flow
./scripts/update-layout.sh type flex
```

#### High-Density Data Dashboard
```bash
# Step 1: Maximize columns
./scripts/update-layout.sh columns 24

# Step 2: Minimize spacing
./scripts/update-layout.sh gap 1
./scripts/update-layout.sh padding 2

# Step 3: Maintain grid precision
./scripts/update-layout.sh type grid
```

#### Presentation-Ready Layout
```bash
# Step 1: Reduce density for visibility
./scripts/update-layout.sh columns 6

# Step 2: Increase spacing for clarity
./scripts/update-layout.sh gap 10
./scripts/update-layout.sh padding 15

# Step 3: Keep grid structure
./scripts/update-layout.sh type grid
```

### Custom Layout Development

#### Creating Layout Variants
```bash
# Create backup before experimenting
./scripts/update-layout.sh backup

# Experiment with custom layout
./scripts/update-layout.sh type custom
./scripts/update-layout.sh columns 14
./scripts/update-layout.sh gap 5

# Validate and test
./scripts/update-layout.sh validate
```

#### A/B Testing Layouts
```bash
# Layout A: Standard
./scripts/update-layout.sh backup  # Save as baseline
./scripts/update-layout.sh columns 12
./scripts/update-layout.sh gap 4

# Layout B: Dense
./scripts/update-layout.sh columns 16
./scripts/update-layout.sh gap 2

# Revert to baseline if needed
# cp .backups/config_backup_[timestamp].yaml config.yaml
```

## Error Handling and Validation

### Common Error Scenarios

#### Invalid Column Count
```bash
# Error: Columns out of range
./scripts/update-layout.sh columns 30
# Output: ❌ Error: Columns must be between 1 and 24
```

#### Invalid Spacing Values
```bash
# Error: Gap value too high
./scripts/update-layout.sh gap 25
# Output: ❌ Error: Gap must be between 0 and 20

# Error: Negative padding
./scripts/update-layout.sh padding -5
# Output: ❌ Error: Padding must be between 0 and 20
```

#### Invalid Layout Type
```bash
# Error: Unknown layout type
./scripts/update-layout.sh type unknown
# Output: ❌ Error: Layout type must be 'grid', 'flex', or 'custom'
```

#### Missing Arguments
```bash
# Error: No value provided
./scripts/update-layout.sh columns
# Output: ❌ Error: Columns must be between 1 and 24
```

### Recovery Procedures

#### Automatic Backup Recovery
```bash
# List available backups
ls -la .backups/ | grep config_backup

# Restore from specific backup
cp .backups/config_backup_20250701_143022.yaml config.yaml

# Validate restored configuration
./scripts/update-layout.sh validate
```

#### Manual Configuration Fix
```bash
# Check current layout settings
grep -A 4 "layout:" config.yaml

# Manually edit if needed
# Then validate
./scripts/update-layout.sh validate
```

#### Reset to Known Good State
```bash
# Use version control to restore
git checkout config.yaml

# Or restore from a known good backup
cp .backups/config_backup_working.yaml config.yaml
```

## Integration with Dashboard System

### Configuration File Structure
The script modifies the layout section in `config.yaml`:
```yaml
page:
  title: "Dashboard"
  route: "/"
  description: "Main admin dashboard"

layout:
  type: "grid"       # Modified by 'type' command
  columns: 12        # Modified by 'columns' command
  gap: 4            # Modified by 'gap' command
  padding: 6        # Modified by 'padding' command

components:
  # Component definitions remain unchanged
  # But may need adjustment after column changes
```

### CSS Grid Generation
Layout values are converted to CSS Grid properties:
```css
.dashboard-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);  /* columns value */
  gap: 1rem;                               /* gap * 0.25rem */
  padding: 1.5rem;                         /* padding * 0.25rem */
}
```

### Component Positioning Impact
Grid changes affect how components are positioned:
```yaml
# Component positioning in 12-column grid
position:
  col: 1      # Column 1
  row: 1      # Row 1
  span: 6     # Spans 6 columns (1-6)

# After changing to 8-column grid:
# span: 6 is still valid (1-6 within 8)
# But span: 8 would fill the entire width
```

## Best Practices

### For AI Agents

1. **Always Backup Before Major Changes**
   ```bash
   # Create explicit backup before changing columns
   ./scripts/update-layout.sh backup
   ./scripts/update-layout.sh columns 16
   ```

2. **Validate After Each Change**
   ```bash
   # Make change and immediately validate
   ./scripts/update-layout.sh gap 6
   ./scripts/update-layout.sh validate
   ```

3. **Consider Component Impact**
   ```bash
   # Check component positions before changing columns
   node scripts/add-component.ts list
   ./scripts/update-layout.sh columns 8
   node scripts/add-component.ts list  # Verify still valid
   ```

4. **Test Layout Changes Incrementally**
   ```bash
   # Make small changes and test
   ./scripts/update-layout.sh columns 14  # Small increase
   # Test visually, then continue
   ./scripts/update-layout.sh columns 16  # Further increase
   ```

### Layout Design Guidelines

1. **Column Count Selection**
   - **4-6 columns**: Mobile/simple layouts
   - **8-12 columns**: Standard desktop layouts
   - **16-20 columns**: High-density dashboards
   - **24 columns**: Maximum flexibility

2. **Gap Spacing Guidelines**
   - **0-2**: Tight, compact layouts
   - **3-5**: Standard comfortable spacing
   - **6-10**: Generous, airy layouts
   - **10+**: Presentation or accessibility layouts

3. **Padding Considerations**
   - **0-3**: Full-bleed, maximized content
   - **4-8**: Standard container padding
   - **9-15**: Comfortable reading distance
   - **15+**: Presentation or print layouts

### Performance Considerations

1. **Grid Performance**
   - More columns = more CSS grid tracks
   - Minimal performance impact up to 24 columns
   - Gap and padding have negligible performance cost

2. **Layout Type Performance**
   - **Grid**: Best performance for fixed layouts
   - **Flex**: Good performance, more dynamic
   - **Custom**: Depends on implementation

3. **Change Frequency**
   - Layout changes require CSS recalculation
   - Batch multiple changes when possible
   - Test performance with many components

## Troubleshooting

### Script Execution Issues

#### Permission Denied
```bash
# Make script executable
chmod +x scripts/update-layout.sh

# Check file permissions
ls -la scripts/update-layout.sh
```

#### Bash Not Found
```bash
# Run with explicit bash
bash scripts/update-layout.sh columns 12

# Check bash location
which bash
```

#### Backup Directory Issues
```bash
# Check backup directory
ls -la .backups/

# Create manually if needed
mkdir -p .backups
chmod 755 .backups
```

### Configuration Issues

#### YAML Syntax Errors
```bash
# Check YAML syntax
./scripts/update-layout.sh validate

# Install yq for better validation
brew install yq  # macOS
# or
sudo apt install yq  # Ubuntu
```

#### Configuration Not Applied
1. Verify config.yaml was modified
2. Check for file permission issues
3. Restart development server
4. Clear browser cache

#### Component Positioning Broken
```bash
# List current component positions
node scripts/add-component.ts list

# Check for conflicts after column changes
# Manually adjust component positions if needed
```

### Visual Layout Issues

#### Components Overlapping
- Reduce gap or increase columns
- Check component span values
- Verify position calculations

#### Layout Too Cramped
```bash
# Increase spacing
./scripts/update-layout.sh gap 6
./scripts/update-layout.sh padding 8
```

#### Layout Too Sparse
```bash
# Decrease spacing or increase density
./scripts/update-layout.sh columns 16
./scripts/update-layout.sh gap 2
```

## Performance Monitoring

### Layout Performance Metrics
- **Grid recalculation time**: < 16ms for smooth 60fps
- **Paint time**: Monitor with browser dev tools
- **Memory usage**: Minimal impact from layout changes
- **Responsive performance**: Test across screen sizes

### Optimization Strategies
1. **Batch Layout Changes**: Make multiple updates before validation
2. **Profile Before/After**: Use browser performance tools
3. **Test with Real Data**: Ensure performance with actual components
4. **Monitor Different Devices**: Test mobile and desktop performance

## Future Enhancements

### Planned Features
1. **Responsive Breakpoints**: Automatic layout switching by screen size
2. **Layout Templates**: Pre-configured layout patterns
3. **Visual Preview**: See layout changes before applying
4. **Component Auto-Adjustment**: Automatic position updates after column changes
5. **Layout Analytics**: Usage patterns and optimization suggestions

### Advanced Capabilities
- **Dynamic Grid Systems**: Runtime layout modifications
- **Layout Inheritance**: Base layouts with page-specific overrides
- **CSS Grid Areas**: Named grid regions for semantic positioning
- **Layout Animation**: Smooth transitions between layout states
- **Accessibility Integration**: Layout optimization for screen readers

## Related Documentation
- [Automation Overview](./automation-overview.md) - Complete automation system guide
- [Add Component Script](./add-component-script.md) - Component positioning guide
- [Configuration Overview](../configuration/config-overview.md) - Configuration system details
- [Layout Configuration](../configuration/layout-config.md) - Layout system architecture
- [Responsive Design](../styling/responsive-design.md) - Responsive design implementation

## Summary

The `update-layout.sh` script provides AI agents with comprehensive layout management capabilities for the dashboard. Key benefits:

- **Complete Layout Control**: Columns, spacing, padding, and layout types
- **Safe Operations**: Automatic backup and validation systems
- **Flexible Grid System**: Support for 1-24 columns with configurable spacing
- **Multiple Layout Types**: Grid, flex, and custom layout options
- **Error Prevention**: Input validation and range checking
- **Easy Recovery**: Multiple backup and rollback options

By following this guide, AI agents can efficiently customize dashboard layouts while maintaining visual consistency, component integrity, and system performance. The script's robust validation and backup systems ensure that layout modifications can be made confidently and recovered quickly if needed.

The layout system forms the foundation for component positioning and visual organization, making it a critical tool for creating effective, responsive dashboard designs that adapt to different use cases and screen sizes.