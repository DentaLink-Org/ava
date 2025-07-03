# Change Theme Script Documentation

## Purpose
This document provides a comprehensive guide to the `change-theme.ts` automation script for the Dashboard page. This script enables AI agents to dynamically modify the dashboard's visual appearance by updating theme colors, typography, and spacing through the configuration system.

## Overview
The `change-theme.ts` script is a TypeScript-based automation tool that:
- Updates theme colors (primary, secondary, background, text, etc.)
- Modifies typography settings (font family, size, line height)
- Adjusts spacing values (base, small, large)
- Validates all theme changes before applying
- Creates automatic backups before modifications
- Provides theme reset and inspection capabilities

## Script Location
```
src/pages/dashboard/scripts/change-theme.ts
```

## Core Functionality

### Key Features
- **Color Management**: Support for hex, RGB, HSL, and named colors
- **Typography Control**: Font family, size, and line height configuration
- **Spacing System**: Configurable spacing scales for layout consistency
- **Validation Layer**: Comprehensive validation for all theme values
- **Backup System**: Automatic theme-specific backups before changes
- **Theme Reset**: Restore to carefully designed default theme
- **Current Theme Inspection**: View current theme configuration
- **CLI Interface**: Command-line usage optimized for agent automation

### Theme Structure
The script manages a comprehensive theme object:
```typescript
interface Theme {
  colors: {
    primary: string;        // Main brand color
    secondary: string;      // Secondary brand color
    background: string;     // Page background
    surface: string;        // Card/surface background
    text: string;          // Primary text color
    textSecondary: string; // Secondary text color
  };
  spacing: {
    base: number;          // Base spacing unit (px)
    small: number;         // Small spacing multiplier
    large: number;         // Large spacing multiplier
  };
  typography: {
    fontFamily: string;    // Font stack
    fontSize: string;      // Base font size
    lineHeight: number;    // Line height ratio
  };
}
```

## Usage Patterns

### Color Updates
```bash
# Update primary brand color
node change-theme.ts color primary "#3b82f6"

# Update background color
node change-theme.ts color background "#f8fafc"

# Update text colors
node change-theme.ts color text "#0f172a"
node change-theme.ts color textSecondary "#64748b"
```

### Typography Modifications
```bash
# Change font family
node change-theme.ts font fontFamily "Roboto, sans-serif"

# Update base font size
node change-theme.ts font fontSize "18px"

# Adjust line height
node change-theme.ts font lineHeight 1.6
```

### Spacing Adjustments
```bash
# Update base spacing unit
node change-theme.ts spacing base 6

# Modify spacing scale
node change-theme.ts spacing small 3
node change-theme.ts spacing large 12
```

### Theme Management
```bash
# View current theme configuration
node change-theme.ts current

# Reset to default theme
node change-theme.ts reset
```

## Command Reference

### Color Command
```bash
node change-theme.ts color <colorName> <colorValue>
```

**Color Names:**
- `primary` - Main brand color (buttons, links, accents)
- `secondary` - Secondary brand color (hover states, highlights)
- `background` - Page/container background color
- `surface` - Card and surface background color
- `text` - Primary text color
- `textSecondary` - Secondary/muted text color

**Color Value Formats:**
- **Hex**: `#3b82f6`, `#f00`
- **RGB**: `rgb(59, 130, 246)`, `rgba(59, 130, 246, 0.8)`
- **HSL**: `hsl(217, 91%, 60%)`, `hsla(217, 91%, 60%, 0.8)`
- **Named**: `blue`, `red`, `white`, `black`, `gray`

**Examples:**
```bash
# Brand colors
node change-theme.ts color primary "#2563eb"
node change-theme.ts color secondary "#1d4ed8"

# Dark mode colors
node change-theme.ts color background "#0f172a"
node change-theme.ts color surface "#1e293b"
node change-theme.ts color text "#f1f5f9"
node change-theme.ts color textSecondary "#94a3b8"

# Light theme
node change-theme.ts color background "#ffffff"
node change-theme.ts color surface "#f8fafc"
node change-theme.ts color text "#0f172a"
```

### Spacing Command
```bash
node change-theme.ts spacing <spacingName> <value>
```

**Spacing Names:**
- `base` - Base spacing unit in pixels (typically 4-8px)
- `small` - Small spacing multiplier (typically 0.5-1x base)
- `large` - Large spacing multiplier (typically 2-4x base)

**Value Range:** 0-100 pixels

**Examples:**
```bash
# Compact spacing
node change-theme.ts spacing base 4
node change-theme.ts spacing small 2
node change-theme.ts spacing large 6

# Generous spacing
node change-theme.ts spacing base 8
node change-theme.ts spacing small 4
node change-theme.ts spacing large 16
```

### Font Command
```bash
node change-theme.ts font <property> <value>
```

**Font Properties:**
- `fontFamily` - Font stack (string)
- `fontSize` - Base font size with units (string)
- `lineHeight` - Line height ratio (number)

**Examples:**
```bash
# Modern sans-serif
node change-theme.ts font fontFamily "Inter, system-ui, sans-serif"

# Serif font
node change-theme.ts font fontFamily "Georgia, serif"

# Google Fonts
node change-theme.ts font fontFamily "Roboto, sans-serif"

# Font size adjustments
node change-theme.ts font fontSize "14px"
node change-theme.ts font fontSize "18px"

# Line height for readability
node change-theme.ts font lineHeight 1.4  # Compact
node change-theme.ts font lineHeight 1.6  # Comfortable
node change-theme.ts font lineHeight 1.8  # Generous
```

### Current Command
```bash
node change-theme.ts current
```
Displays the complete current theme configuration in YAML format.

### Reset Command
```bash
node change-theme.ts reset
```
Restores the dashboard to the default theme configuration.

## Theme Presets and Examples

### Default Theme
```yaml
theme:
  colors:
    primary: "#f97316"      # Orange
    secondary: "#ea580c"    # Dark orange
    background: "#f3f4f6"   # Light gray
    surface: "#ffffff"      # White
    text: "#111827"         # Dark gray
    textSecondary: "#6b7280" # Medium gray
  spacing:
    base: 4                 # 4px base unit
    small: 2                # 2px small
    large: 8                # 8px large
  typography:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.5
```

### Dark Mode Theme
```bash
# Apply dark mode colors
node change-theme.ts color background "#0f172a"
node change-theme.ts color surface "#1e293b"
node change-theme.ts color text "#f1f5f9"
node change-theme.ts color textSecondary "#94a3b8"
node change-theme.ts color primary "#3b82f6"
node change-theme.ts color secondary "#1d4ed8"
```

### Corporate Blue Theme
```bash
# Professional blue theme
node change-theme.ts color primary "#1e40af"
node change-theme.ts color secondary "#1e3a8a"
node change-theme.ts color background "#f8fafc"
node change-theme.ts color surface "#ffffff"
node change-theme.ts color text "#1e293b"
node change-theme.ts color textSecondary "#475569"
```

### Minimal Theme
```bash
# Clean, minimal appearance
node change-theme.ts color primary "#000000"
node change-theme.ts color secondary "#404040"
node change-theme.ts color background "#ffffff"
node change-theme.ts color surface "#f9fafb"
node change-theme.ts color text "#000000"
node change-theme.ts color textSecondary "#6b7280"
node change-theme.ts spacing base 6
node change-theme.ts font fontFamily "system-ui, sans-serif"
```

### High Contrast Theme
```bash
# Accessibility-focused high contrast
node change-theme.ts color primary "#0000ff"
node change-theme.ts color secondary "#800080"
node change-theme.ts color background "#ffffff"
node change-theme.ts color surface "#ffffff"
node change-theme.ts color text "#000000"
node change-theme.ts color textSecondary "#333333"
node change-theme.ts font lineHeight 1.6
```

## Advanced Usage Scenarios

### Seasonal Themes
```bash
# Spring theme
node change-theme.ts color primary "#10b981"  # Green
node change-theme.ts color secondary "#059669"
node change-theme.ts color background "#f0fdf4"

# Summer theme
node change-theme.ts color primary "#f59e0b"  # Yellow
node change-theme.ts color secondary "#d97706"
node change-theme.ts color background "#fffbeb"

# Autumn theme
node change-theme.ts color primary "#dc2626"  # Red
node change-theme.ts color secondary "#b91c1c"
node change-theme.ts color background "#fef2f2"

# Winter theme
node change-theme.ts color primary "#3b82f6"  # Blue
node change-theme.ts color secondary "#2563eb"
node change-theme.ts color background "#f8fafc"
```

### Brand Customization
```bash
# Company brand colors
node change-theme.ts color primary "#FF6B35"    # Brand orange
node change-theme.ts color secondary "#FF8E53"  # Brand light orange
node change-theme.ts color background "#FAFAFA" # Off-white
node change-theme.ts font fontFamily "Montserrat, sans-serif"
```

### Density Adjustments
```bash
# Compact interface
node change-theme.ts spacing base 3
node change-theme.ts spacing small 1
node change-theme.ts spacing large 6
node change-theme.ts font fontSize "14px"
node change-theme.ts font lineHeight 1.4

# Spacious interface
node change-theme.ts spacing base 8
node change-theme.ts spacing small 4
node change-theme.ts spacing large 16
node change-theme.ts font fontSize "18px"
node change-theme.ts font lineHeight 1.6
```

## Validation and Error Handling

### Color Validation
The script validates color values using multiple formats:

```bash
# Valid color formats
node change-theme.ts color primary "#3b82f6"           # Hex
node change-theme.ts color primary "rgb(59, 130, 246)" # RGB
node change-theme.ts color primary "blue"              # Named

# Invalid color examples (will be rejected)
node change-theme.ts color primary "#gggggg"  # Invalid hex
node change-theme.ts color primary "invalid"  # Unknown name
```

### Spacing Validation
Spacing values must be within reasonable ranges:

```bash
# Valid spacing (0-100)
node change-theme.ts spacing base 4    # ✅ Valid
node change-theme.ts spacing base 20   # ✅ Valid

# Invalid spacing (will be rejected)
node change-theme.ts spacing base -5   # ❌ Negative value
node change-theme.ts spacing base 150  # ❌ Too large
```

### Typography Validation
Typography values are validated for reasonable ranges:

```bash
# Valid line height (0.5-3.0)
node change-theme.ts font lineHeight 1.5  # ✅ Valid
node change-theme.ts font lineHeight 2.0  # ✅ Valid

# Invalid line height (will be rejected)
node change-theme.ts font lineHeight 0.2  # ❌ Too small
node change-theme.ts font lineHeight 5.0  # ❌ Too large
```

### Common Error Scenarios

#### Invalid Color Format
```
❌ Theme validation failed:
Invalid color value for primary: #gggggg
```
**Solution**: Use valid hex, RGB, HSL, or named colors

#### Out of Range Values
```
❌ Theme validation failed:
Invalid spacing value for base: 150 (must be 0-100)
```
**Solution**: Use values within the specified ranges

#### Missing Arguments
```
❌ Usage: color <name> <value>
```
**Solution**: Provide all required command arguments

## Theme Integration

### Configuration File Impact
The script modifies the theme section in `config.yaml`:
```yaml
theme:
  colors:
    primary: "#3b82f6"
    secondary: "#1d4ed8"
    background: "#ffffff"
    surface: "#f8fafc"
    text: "#0f172a"
    textSecondary: "#64748b"
  spacing:
    base: 4
    small: 2
    large: 8
  typography:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.5
```

### CSS Variable Generation
Theme values are converted to CSS custom properties:
```css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #1d4ed8;
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #0f172a;
  --color-text-secondary: #64748b;
  
  --spacing-base: 4px;
  --spacing-small: 2px;
  --spacing-large: 8px;
  
  --font-family: "Inter, system-ui, sans-serif";
  --font-size: 16px;
  --line-height: 1.5;
}
```

### Component Usage
Dashboard components automatically use theme values:
```typescript
// Components access theme via CSS variables
const WelcomeHeader = () => (
  <div style={{
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    padding: 'var(--spacing-large)',
    fontFamily: 'var(--font-family)'
  }}>
    <h1>Dashboard</h1>
  </div>
);
```

## Backup and Recovery

### Automatic Backups
The script creates theme-specific backups:
```
.backups/
├── config_theme_backup_2025-07-01T10-15-30-456Z.yaml
├── config_theme_backup_2025-07-01T10-20-15-789Z.yaml
└── config_theme_backup_2025-07-01T10-25-00-012Z.yaml
```

### Recovery Procedures

#### Restore from Backup
```bash
# List available backups
ls -la .backups/ | grep theme_backup

# Restore specific backup
cp .backups/config_theme_backup_[timestamp].yaml config.yaml
```

#### Reset to Default
```bash
# Quick reset to default theme
node change-theme.ts reset
```

#### Manual Recovery
```bash
# Remove theme section from config.yaml
# The system will use default theme values
```

## Best Practices

### For AI Agents

1. **Check Current Theme First**
   ```bash
   # Always start by viewing current theme
   node change-theme.ts current
   ```

2. **Test Color Combinations**
   - Ensure sufficient contrast between text and background
   - Test primary/secondary color harmony
   - Consider accessibility requirements

3. **Validate Theme Coherence**
   ```bash
   # Apply related changes together
   node change-theme.ts color primary "#3b82f6"
   node change-theme.ts color secondary "#1d4ed8"
   ```

4. **Document Theme Intentions**
   - Note the theme purpose (dark mode, brand, seasonal)
   - Keep track of color meanings and usage
   - Document accessibility considerations

### Design Guidelines

1. **Color Accessibility**
   - Maintain 4.5:1 contrast ratio for text
   - Use 3:1 contrast for UI elements
   - Test with colorblind simulation tools

2. **Typography Hierarchy**
   - Keep line height between 1.4-1.6 for readability
   - Use appropriate font sizes (14px minimum)
   - Choose web-safe font stacks

3. **Spacing Consistency**
   - Use spacing multipliers consistently
   - Maintain vertical rhythm
   - Consider different screen sizes

## Common Theme Workflows

### Brand Implementation
```bash
# 1. Set brand colors
node change-theme.ts color primary "#company-primary"
node change-theme.ts color secondary "#company-secondary"

# 2. Configure typography
node change-theme.ts font fontFamily "Brand-Font, sans-serif"

# 3. Adjust spacing if needed
node change-theme.ts spacing base 6

# 4. Verify theme
node change-theme.ts current
```

### Dark Mode Toggle
```bash
# Light to Dark Mode
node change-theme.ts color background "#0f172a"
node change-theme.ts color surface "#1e293b"
node change-theme.ts color text "#f1f5f9"
node change-theme.ts color textSecondary "#94a3b8"

# Dark to Light Mode
node change-theme.ts color background "#ffffff"
node change-theme.ts color surface "#f8fafc"
node change-theme.ts color text "#0f172a"
node change-theme.ts color textSecondary "#64748b"
```

### Accessibility Enhancement
```bash
# High contrast theme
node change-theme.ts color primary "#0000ff"
node change-theme.ts color background "#ffffff"
node change-theme.ts color text "#000000"
node change-theme.ts font lineHeight 1.6
node change-theme.ts spacing base 6
```

## Troubleshooting

### Script Execution Issues

#### Permission Denied
```bash
# Make script executable
chmod +x scripts/change-theme.ts

# Run with node directly
node scripts/change-theme.ts current
```

#### Node.js Dependencies
```bash
# Install required packages
npm install js-yaml @types/js-yaml

# Verify installation
node -e "console.log(require('js-yaml'))"
```

### Theme Application Issues

#### Changes Not Visible
1. Verify config.yaml was updated
2. Check for CSS cache issues
3. Restart development server
4. Validate theme values in browser

#### Color Rendering Problems
1. Check color format validity
2. Verify CSS variable generation
3. Test in different browsers
4. Validate color accessibility

#### Spacing Issues
1. Confirm spacing units (px vs rem)
2. Check responsive design impact
3. Validate component integration
4. Test on different screen sizes

### Backup and Recovery Issues

#### Backup Creation Failed
```bash
# Check backup directory permissions
ls -la .backups/

# Create directory manually
mkdir -p .backups
chmod 755 .backups
```

#### Recovery Not Working
```bash
# Verify backup file integrity
head -10 .backups/config_theme_backup_[timestamp].yaml

# Check file permissions
chmod 644 config.yaml
```

## Performance Considerations

### Script Performance
- Theme updates: < 1 second execution time
- Backup creation: Near-instantaneous
- Validation: Minimal overhead
- No runtime performance impact

### CSS Performance
- CSS custom properties have excellent browser support
- Dynamic theme switching is efficient
- No need for CSS rebuilding
- Minimal memory usage

### Development Workflow
- Immediate visual feedback in development
- Hot reload preserves theme changes
- No build process required for theme updates
- Fast iteration for theme experimentation

## Future Enhancements

### Planned Features
1. **Theme Templates**: Pre-designed theme packages
2. **Color Palette Generation**: Automatic color harmony
3. **Accessibility Validation**: Contrast checking
4. **Theme Preview**: Visual preview before applying
5. **Batch Operations**: Apply multiple theme changes at once

### Advanced Capabilities
- **Dynamic Theme Switching**: Runtime theme changes
- **User Preference Storage**: Remember theme choices
- **System Theme Detection**: Auto dark/light mode
- **Component-Specific Theming**: Granular control
- **Animation Support**: Smooth theme transitions

## Related Documentation
- [Automation Overview](./automation-overview.md) - Complete automation system guide
- [Styling Overview](../styling/styling-overview.md) - Styling system architecture
- [Design System](../styling/design-system.md) - Design system reference
- [Configuration Overview](../configuration/config-overview.md) - Configuration system
- [Add Component Script](./add-component-script.md) - Component addition automation

## Summary

The `change-theme.ts` script provides AI agents with comprehensive theme customization capabilities for the dashboard. Key benefits:

- **Complete Theme Control**: Colors, typography, and spacing
- **Validation & Safety**: Automatic validation and backup creation
- **Multiple Formats**: Support for all CSS color formats
- **Accessibility Support**: Built-in accessibility considerations
- **Easy Recovery**: Multiple rollback and reset options
- **Agent-Optimized**: CLI interface designed for automation

By following this guide, AI agents can efficiently customize dashboard themes while maintaining visual consistency, accessibility standards, and system integrity. The script's robust validation and backup systems ensure that theme modifications can be made confidently and recovered quickly if needed.