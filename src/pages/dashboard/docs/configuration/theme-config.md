# Dashboard Theme and Styling Configuration

This comprehensive guide explains the theme and styling configuration system for the Dashboard page. The theme system enables AI agents to customize colors, typography, spacing, and visual design without modifying CSS files directly, using a powerful configuration-driven approach.

## 🎨 Theme Configuration Overview

The Dashboard page uses a sophisticated theming system built on CSS custom properties (variables) that can be configured through YAML and modified via automation scripts. The system supports complete visual customization while maintaining design consistency and responsive behavior.

### Theme Configuration Structure

```yaml
theme:
  colors:                             # Color palette configuration
    primary: "#f97316"                # Primary brand color
    secondary: "#ea580c"              # Secondary accent color
    background: "#fafafa"             # Page background
    surface: "#ffffff"                # Component surfaces
    text: "#111827"                   # Primary text color
    textSecondary: "#6b7280"          # Secondary text color
  
  spacing:                            # Spacing scale configuration
    base: 4                           # Base spacing unit (4 = 1rem)
    small: 2                          # Small spacing (2 = 0.5rem)
    large: 8                          # Large spacing (8 = 2rem)
  
  typography:                         # Typography configuration
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"                  # Base font size
    lineHeight: 1.5                   # Base line height
```

## 🎯 Color System Configuration

### Primary Color Palette

The Dashboard uses a semantic color system with specific roles for each color:

#### Core Colors

##### primary
**Type**: `string` (CSS color)  
**Default**: `#f97316` (Orange)  
**Usage**: Primary buttons, links, highlights, brand elements

```yaml
colors:
  primary: "#f97316"                  # Orange theme
  # primary: "#3b82f6"               # Blue theme
  # primary: "#10b981"               # Green theme
  # primary: "#8b5cf6"               # Purple theme
```

##### secondary
**Type**: `string` (CSS color)  
**Default**: `#ea580c` (Dark Orange)  
**Usage**: Secondary buttons, hover states, accents

```yaml
colors:
  secondary: "#ea580c"                # Complementary to primary
  # secondary: "#1d4ed8"             # Darker blue variant
  # secondary: "#059669"             # Darker green variant
```

##### background
**Type**: `string` (CSS color)  
**Default**: `#fafafa` (Light Gray)  
**Usage**: Page background, container backgrounds

```yaml
colors:
  background: "#fafafa"               # Light theme
  # background: "#111827"            # Dark theme
  # background: "#f3f4f6"            # Neutral gray
```

##### surface
**Type**: `string` (CSS color)  
**Default**: `#ffffff` (White)  
**Usage**: Card backgrounds, component surfaces, elevated elements

```yaml
colors:
  surface: "#ffffff"                  # Light surfaces
  # surface: "#1f2937"               # Dark surfaces
  # surface: "#f9fafb"               # Off-white surfaces
```

#### Text Colors

##### text
**Type**: `string` (CSS color)  
**Default**: `#111827` (Dark Gray)  
**Usage**: Primary text, headings, high-emphasis content

```yaml
colors:
  text: "#111827"                     # Dark text on light backgrounds
  # text: "#f9fafb"                  # Light text on dark backgrounds
```

##### textSecondary
**Type**: `string` (CSS color)  
**Default**: `#6b7280` (Medium Gray)  
**Usage**: Secondary text, descriptions, labels, placeholders

```yaml
colors:
  textSecondary: "#6b7280"            # Medium contrast
  # textSecondary: "#9ca3af"         # Lower contrast
  # textSecondary: "#4b5563"         # Higher contrast
```

#### Status Colors

Additional colors for states and feedback:

```yaml
colors:
  # Status colors (optional)
  success: "#10b981"                  # Success states, positive feedback
  warning: "#f59e0b"                  # Warning states, attention needed
  error: "#ef4444"                    # Error states, destructive actions
  info: "#3b82f6"                     # Information, neutral actions
```

### Color Format Support

The system supports multiple CSS color formats:

#### Hex Colors
```yaml
colors:
  primary: "#f97316"                  # 6-digit hex
  secondary: "#ea5"                   # 3-digit hex (shorthand)
```

#### RGB/RGBA Colors
```yaml
colors:
  primary: "rgb(249, 115, 22)"        # RGB format
  secondary: "rgba(234, 88, 12, 0.9)" # RGBA with transparency
```

#### HSL/HSLA Colors
```yaml
colors:
  primary: "hsl(24, 95%, 53%)"        # HSL format
  secondary: "hsla(18, 89%, 48%, 0.9)" # HSLA with transparency
```

#### Named Colors
```yaml
colors:
  background: "white"                 # CSS named colors
  text: "black"
```

### Color Accessibility Guidelines

Ensure sufficient contrast ratios for accessibility:

#### Text Contrast Requirements
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text (18px+)**: Minimum 3:1 contrast ratio
- **UI elements**: Minimum 3:1 contrast ratio

#### Recommended Color Combinations
```yaml
# High contrast (WCAG AAA)
colors:
  background: "#ffffff"
  text: "#000000"                     # 21:1 contrast ratio

# Good contrast (WCAG AA)
colors:
  background: "#ffffff"
  text: "#111827"                     # 16.8:1 contrast ratio
  textSecondary: "#374151"            # 9.2:1 contrast ratio

# Minimum contrast (WCAG AA Large)
colors:
  background: "#f3f4f6"
  text: "#1f2937"                     # 12.6:1 contrast ratio
```

## 📏 Spacing System Configuration

### Spacing Scale

The Dashboard uses a consistent spacing scale based on a base unit:

#### Base Spacing Unit

##### base
**Type**: `number`  
**Default**: `4`  
**Unit**: `0.25rem` increments  
**Usage**: Standard spacing between elements

```yaml
spacing:
  base: 4                             # 4 × 0.25rem = 1rem
  # base: 6                          # 6 × 0.25rem = 1.5rem
  # base: 8                          # 8 × 0.25rem = 2rem
```

#### Spacing Variants

##### small
**Type**: `number`  
**Default**: `2`  
**Usage**: Tight spacing, compact layouts

```yaml
spacing:
  small: 2                            # 2 × 0.25rem = 0.5rem
  # small: 1                         # 1 × 0.25rem = 0.25rem
  # small: 3                         # 3 × 0.25rem = 0.75rem
```

##### large
**Type**: `number`  
**Default**: `8`  
**Usage**: Generous spacing, section separation

```yaml
spacing:
  large: 8                            # 8 × 0.25rem = 2rem
  # large: 12                        # 12 × 0.25rem = 3rem
  # large: 6                         # 6 × 0.25rem = 1.5rem
```

### Spacing Scale Reference

| Value | Output   | Common Usage                          |
|-------|----------|---------------------------------------|
| `1`   | 0.25rem  | Minimal spacing, borders              |
| `2`   | 0.5rem   | Small gaps, tight layouts             |
| `3`   | 0.75rem  | Medium-small spacing                  |
| `4`   | 1rem     | Standard spacing (default)            |
| `6`   | 1.5rem   | Medium-large spacing                  |
| `8`   | 2rem     | Large spacing, section breaks         |
| `12`  | 3rem     | Extra large spacing                   |
| `16`  | 4rem     | Section separation                    |
| `20`  | 5rem     | Major layout spacing                  |

### CSS Custom Properties Generated

The spacing configuration generates these CSS variables:

```css
.page-dashboard {
  --spacing-xs: 0.25rem;              /* small ÷ 2 */
  --spacing-sm: 0.5rem;               /* small value */
  --spacing-base: 1rem;               /* base value */
  --spacing-lg: 1.5rem;               /* base × 1.5 */
  --spacing-xl: 2rem;                 /* large value */
  --spacing-2xl: 3rem;                /* large × 1.5 */
}
```

## 🔤 Typography Configuration

### Font System

The typography system controls font families, sizes, and text rendering:

#### Font Family

##### fontFamily
**Type**: `string`  
**Default**: `"Inter, system-ui, sans-serif"`  
**Usage**: Primary font stack for all text

```yaml
typography:
  fontFamily: "Inter, system-ui, sans-serif"     # Modern sans-serif
  # fontFamily: "Georgia, serif"                 # Serif typeface
  # fontFamily: "Monaco, monospace"              # Monospace font
  # fontFamily: "'Helvetica Neue', Arial, sans-serif"  # Classic sans-serif
```

**Font Stack Recommendations**:
```yaml
# Modern system fonts
fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"

# Classic web-safe fonts
fontFamily: "Arial, Helvetica, sans-serif"

# Serif for formal content
fontFamily: "Georgia, 'Times New Roman', serif"

# Monospace for code
fontFamily: "'Fira Code', Monaco, 'Cascadia Code', monospace"
```

#### Font Size

##### fontSize
**Type**: `string`  
**Default**: `"16px"`  
**Usage**: Base font size for body text

```yaml
typography:
  fontSize: "16px"                    # Standard size
  # fontSize: "14px"                  # Compact interface
  # fontSize: "18px"                  # Large text for accessibility
  # fontSize: "1rem"                  # Relative sizing
```

#### Line Height

##### lineHeight
**Type**: `number`  
**Default**: `1.5`  
**Usage**: Base line height ratio for text

```yaml
typography:
  lineHeight: 1.5                     # Standard spacing
  # lineHeight: 1.4                   # Tight spacing
  # lineHeight: 1.6                   # Loose spacing
  # lineHeight: 2.0                   # Double spacing
```

### Typography Scale Generated

The typography configuration generates these CSS variables:

```css
.page-dashboard {
  --font-family: Inter, system-ui, sans-serif;
  --font-size-sm: 0.875rem;           /* fontSize × 0.875 */
  --font-size-base: 1rem;             /* fontSize value */
  --font-size-lg: 1.125rem;           /* fontSize × 1.125 */
  --font-size-xl: 1.25rem;            /* fontSize × 1.25 */
  --font-size-2xl: 1.5rem;            /* fontSize × 1.5 */
  --font-size-3xl: 1.875rem;          /* fontSize × 1.875 */
}
```

## 🎛️ Advanced Theme Configuration

### Dark Mode Support

Configure dark mode themes with automatic switching:

```yaml
theme:
  # Light theme (default)
  colors:
    primary: "#f97316"
    background: "#ffffff"
    surface: "#f9fafb"
    text: "#111827"
    textSecondary: "#6b7280"
  
  # Dark mode variants
  darkMode:
    colors:
      primary: "#fb923c"              # Lighter orange for dark backgrounds
      background: "#111827"           # Dark background
      surface: "#1f2937"              # Dark surface
      text: "#f9fafb"                 # Light text
      textSecondary: "#d1d5db"        # Medium light text
```

### Responsive Typography

Configure typography that adapts to screen size:

```yaml
typography:
  # Base typography
  fontFamily: "Inter, system-ui, sans-serif"
  fontSize: "16px"
  lineHeight: 1.5
  
  # Responsive scaling
  responsive:
    mobile:
      fontSize: "14px"                # Smaller on mobile
      lineHeight: 1.4
    tablet:
      fontSize: "15px"                # Medium on tablet
      lineHeight: 1.45
    desktop:
      fontSize: "16px"                # Full size on desktop
      lineHeight: 1.5
```

### Brand-Specific Themes

Configure themes for different brands or use cases:

#### Corporate Theme
```yaml
theme:
  name: "corporate"
  colors:
    primary: "#1f2937"                # Professional gray
    secondary: "#374151"
    background: "#f9fafb"
    surface: "#ffffff"
    text: "#111827"
    textSecondary: "#6b7280"
  typography:
    fontFamily: "'Helvetica Neue', Arial, sans-serif"
    fontSize: "15px"
    lineHeight: 1.4
```

#### Creative Theme
```yaml
theme:
  name: "creative"
  colors:
    primary: "#8b5cf6"                # Creative purple
    secondary: "#a78bfa"
    background: "#faf5ff"
    surface: "#ffffff"
    text: "#1f2937"
    textSecondary: "#6b7280"
  typography:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.6
```

#### High Contrast Theme
```yaml
theme:
  name: "high-contrast"
  colors:
    primary: "#000000"                # Maximum contrast
    secondary: "#333333"
    background: "#ffffff"
    surface: "#ffffff"
    text: "#000000"
    textSecondary: "#333333"
  typography:
    fontFamily: "Arial, sans-serif"   # High legibility font
    fontSize: "18px"                  # Larger text
    lineHeight: 1.5
```

## 🔧 Theme Automation Scripts

### change-theme.ts Script

The Dashboard includes a powerful script for theme modifications:

#### Basic Usage

```bash
# Navigate to dashboard directory
cd src/pages/dashboard

# Update primary color
node scripts/change-theme.ts color primary "#3b82f6"

# Update spacing
node scripts/change-theme.ts spacing base 6

# Update typography
node scripts/change-theme.ts font fontFamily "Roboto, sans-serif"

# View current theme
node scripts/change-theme.ts current

# Reset to default theme
node scripts/change-theme.ts reset
```

#### Available Commands

##### Color Updates
```bash
# Primary brand color
node scripts/change-theme.ts color primary "#3b82f6"

# Background color
node scripts/change-theme.ts color background "#f3f4f6"

# Text colors
node scripts/change-theme.ts color text "#1f2937"
node scripts/change-theme.ts color textSecondary "#6b7280"

# Surface color
node scripts/change-theme.ts color surface "#ffffff"
```

##### Spacing Updates
```bash
# Base spacing unit
node scripts/change-theme.ts spacing base 6

# Small spacing
node scripts/change-theme.ts spacing small 3

# Large spacing
node scripts/change-theme.ts spacing large 12
```

##### Typography Updates
```bash
# Font family
node scripts/change-theme.ts font fontFamily "Georgia, serif"

# Font size
node scripts/change-theme.ts font fontSize "18px"

# Line height
node scripts/change-theme.ts font lineHeight 1.6
```

#### Batch Theme Updates

For multiple simultaneous changes, modify the script directly:

```typescript
// Update multiple properties at once
await changeTheme({
  colors: {
    primary: "#3b82f6",
    secondary: "#1d4ed8",
    background: "#f8fafc"
  },
  spacing: {
    base: 6,
    small: 3,
    large: 12
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "16px",
    lineHeight: 1.5
  }
});
```

### Theme Validation

The script includes comprehensive validation:

#### Color Validation
- Hex colors: `#ffffff`, `#fff`
- RGB/RGBA: `rgb(255,255,255)`, `rgba(255,255,255,0.5)`
- HSL/HSLA: `hsl(0,0%,100%)`, `hsla(0,0%,100%,0.5)`
- Named colors: `white`, `black`, `red`

#### Spacing Validation
- Range: 0-100 units
- Type: Must be numbers
- Prevents negative values

#### Typography Validation
- Line height: 0.5-3.0 range
- Font family: Any valid CSS font stack
- Font size: Any valid CSS size unit

## 🎨 CSS Custom Properties System

### Generated CSS Variables

The theme configuration automatically generates CSS custom properties:

#### Color Variables
```css
.page-dashboard {
  --color-primary: #f97316;
  --color-secondary: #ea580c;
  --color-background: #fafafa;
  --color-surface: #ffffff;
  --color-text: #111827;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

#### Spacing Variables
```css
.page-dashboard {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-base: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
}
```

#### Typography Variables
```css
.page-dashboard {
  --font-family: Inter, system-ui, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
}
```

#### Additional Design Variables
```css
.page-dashboard {
  /* Border radius */
  --radius-sm: 4px;
  --radius-base: 8px;
  --radius-lg: 12px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
}
```

### Using CSS Variables in Components

Components automatically inherit theme variables:

```css
/* Component styling using theme variables */
.page-dashboard .custom-component {
  background-color: var(--color-surface);
  color: var(--color-text);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  transition: all var(--transition-base);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: var(--line-height);
}

.page-dashboard .custom-component:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-hover);
}
```

## 🎯 Component-Specific Theming

### Individual Component Customization

Components can have specific theme overrides:

```yaml
components:
  - id: "custom-kpi-card"
    type: "KPICards"
    position: { col: 1, row: 4, span: 6 }
    props:
      metrics: []
    style:
      backgroundColor: "var(--color-success)"
      color: "white"
    className: "success-theme"
```

### Component Theme Classes

Create theme variants with CSS classes:

```css
/* Success theme variant */
.page-dashboard .success-theme {
  --color-surface: var(--color-success);
  --color-text: white;
  --color-text-secondary: rgba(255, 255, 255, 0.8);
}

/* Warning theme variant */
.page-dashboard .warning-theme {
  --color-surface: var(--color-warning);
  --color-text: var(--color-text);
  --color-border: var(--color-warning);
}

/* Dark theme variant */
.page-dashboard .dark-theme {
  --color-surface: #1f2937;
  --color-text: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-border: #374151;
}
```

### Dynamic Theme Application

Apply themes conditionally based on data or state:

```yaml
components:
  - id: "status-card"
    type: "KPICards"
    position: { col: 1, row: 3, span: 4 }
    props:
      metrics: []
    className: "{{data.status === 'healthy' ? 'success-theme' : 'warning-theme'}}"
```

## 🌓 Responsive Design Integration

### Breakpoint-Aware Theming

Themes adapt automatically to different screen sizes:

```css
/* Desktop theme */
.page-dashboard {
  --spacing-base: 1rem;
  --font-size-base: 1rem;
}

/* Tablet adjustments */
@media (max-width: 1024px) {
  .page-dashboard {
    --spacing-base: 0.875rem;
    --font-size-base: 0.9375rem;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .page-dashboard {
    --spacing-base: 0.75rem;
    --font-size-base: 0.875rem;
    --radius-lg: 8px;             /* Smaller radius on mobile */
  }
}
```

### Mobile-First Theming

Configure themes starting from mobile:

```yaml
theme:
  # Mobile-first base theme
  colors:
    primary: "#f97316"
    background: "#ffffff"
  spacing:
    base: 3                           # Smaller on mobile
  typography:
    fontSize: "14px"                  # Smaller text on mobile
  
  # Responsive overrides
  responsive:
    tablet:
      spacing:
        base: 4
      typography:
        fontSize: "15px"
    desktop:
      spacing:
        base: 4
      typography:
        fontSize: "16px"
```

## 🛠️ Development and Testing

### Theme Development Workflow

#### 1. Local Theme Testing
```bash
# Test theme changes locally
node scripts/change-theme.ts color primary "#3b82f6"

# Preview changes in browser
npm run dev

# Reset if needed
node scripts/change-theme.ts reset
```

#### 2. Theme Validation
```bash
# Validate theme configuration
npm run validate-theme

# Check accessibility
npm run test-accessibility

# Test across breakpoints
npm run test-responsive
```

#### 3. Theme Backup and Restore
```bash
# Create theme backup
node scripts/change-theme.ts current > theme-backup.yaml

# Restore from backup
cat theme-backup.yaml | node scripts/restore-theme.ts
```

### Custom Theme Development

Create custom themes for specific use cases:

```typescript
// Define custom theme
const customTheme = {
  colors: {
    primary: "#8b5cf6",
    secondary: "#a78bfa",
    background: "#faf5ff",
    surface: "#ffffff",
    text: "#1f2937",
    textSecondary: "#6b7280"
  },
  spacing: {
    base: 5,
    small: 2,
    large: 10
  },
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: "16px",
    lineHeight: 1.6
  }
};

// Apply custom theme
await changeTheme(customTheme);
```

### A/B Testing Themes

Test multiple theme variants:

```yaml
# Theme A - Current
theme:
  name: "variant-a"
  colors:
    primary: "#f97316"
    background: "#ffffff"

# Theme B - Test variant
# theme:
#   name: "variant-b"
#   colors:
#     primary: "#3b82f6"
#     background: "#f8fafc"
```

## 🚨 Troubleshooting Theme Issues

### Common Theme Problems

#### Colors Not Applying
**Problem**: Theme colors not visible in components

**Solutions**:
1. **Check CSS variable usage**:
   ```css
   /* Correct usage */
   .component { color: var(--color-text); }
   
   /* Incorrect - hardcoded */
   .component { color: #111827; }
   ```

2. **Verify CSS specificity**:
   ```css
   /* More specific selector needed */
   .page-dashboard .component {
     color: var(--color-primary);
   }
   ```

3. **Check theme configuration syntax**:
   ```yaml
   # Correct YAML syntax
   colors:
     primary: "#f97316"
   
   # Incorrect - missing quotes
   colors:
     primary: #f97316
   ```

#### Spacing Inconsistencies
**Problem**: Inconsistent spacing across components

**Solutions**:
1. **Use spacing variables consistently**:
   ```css
   /* Consistent with theme */
   .component { padding: var(--spacing-lg); }
   
   /* Inconsistent - hardcoded */
   .component { padding: 24px; }
   ```

2. **Check spacing scale configuration**:
   ```yaml
   spacing:
     base: 4                         # Ensure valid numbers
     small: 2
     large: 8
   ```

#### Typography Not Loading
**Problem**: Custom fonts not displaying

**Solutions**:
1. **Check font loading**:
   ```css
   /* Ensure font is imported */
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
   ```

2. **Verify font family syntax**:
   ```yaml
   typography:
     fontFamily: "'Inter', system-ui, sans-serif"  # Proper quotes
   ```

### Theme Debugging Tools

#### Browser DevTools
```javascript
// Check CSS variables in console
getComputedStyle(document.documentElement).getPropertyValue('--color-primary');

// List all custom properties
Array.from(document.styleSheets)
  .flatMap(sheet => Array.from(sheet.cssRules))
  .filter(rule => rule.style && rule.selectorText === '.page-dashboard')
  .forEach(rule => console.log(rule.cssText));
```

#### Theme Validation
```bash
# Validate current theme
node scripts/change-theme.ts current

# Test color contrast
npm run test-contrast

# Check responsive behavior
npm run test-responsive-theme
```

## 📖 Related Documentation

- **[Styling Overview](../styling/styling-overview.md)**: Complete styling system architecture
- **[Component Configuration](component-config.md)**: Component styling integration
- **[Layout Configuration](layout-config.md)**: Layout and spacing system
- **[Design System](../styling/design-system.md)**: Design system reference
- **[Automation Scripts](../automation/change-theme-script.md)**: Theme automation tools

---

This theme configuration system provides complete control over the visual design of the Dashboard page while maintaining consistency, accessibility, and responsive behavior. Understanding these patterns enables AI agents to create beautiful, branded dashboard experiences through configuration alone.