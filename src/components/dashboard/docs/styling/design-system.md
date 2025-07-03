# Dashboard Design System Reference

## Purpose
This document provides a comprehensive reference for the Dashboard page's design system - a complete set of design tokens, components, patterns, and guidelines that ensure visual consistency and usability. This reference enables AI agents to create new components and modify existing ones while maintaining design coherence.

## Design System Overview
The Dashboard design system is built on **atomic design principles** with a **token-based architecture** that provides:
- **Design Tokens**: Foundational values for colors, typography, spacing, and effects
- **Component Library**: Reusable UI components with consistent styling
- **Layout System**: Grid-based responsive layout patterns
- **Interaction Patterns**: Consistent hover, focus, and state behaviors

## Design Tokens

### Color Palette

#### Primary Colors
The Dashboard uses an orange-based primary color scheme for brand identity and key interactive elements:

```css
/* Primary Brand Colors */
--color-primary: #f97316        /* Orange 500 - Main brand color */
--color-secondary: #ea580c      /* Orange 600 - Hover/active states */
```

**Usage Guidelines**:
- **Primary**: Call-to-action buttons, active states, brand elements
- **Secondary**: Hover states, pressed states, secondary actions

**Accessibility**: Primary colors meet WCAG AA contrast requirements against white backgrounds.

#### Neutral Color Scale
Comprehensive neutral colors for text, backgrounds, and borders:

```css
/* Neutral Colors */
--color-background: #fafafa     /* Gray 50 - Page background */
--color-surface: #ffffff        /* White - Card/container backgrounds */
--color-text: #111827          /* Gray 900 - Primary text */
--color-text-secondary: #6b7280 /* Gray 500 - Secondary text */
--color-border: #e5e7eb        /* Gray 200 - Borders and dividers */
```

**Usage Guidelines**:
- **Background**: Page-level backgrounds, large areas
- **Surface**: Card backgrounds, modal backgrounds, elevated surfaces
- **Text**: Primary headings, body text, high-importance content
- **Text Secondary**: Helper text, labels, less important content
- **Border**: Dividers, input borders, card outlines

#### Semantic Colors
Colors that convey meaning and state information:

```css
/* Semantic Colors */
--color-success: #10b981       /* Green 500 - Success states */
--color-warning: #f59e0b       /* Amber 500 - Warning states */
--color-error: #ef4444         /* Red 500 - Error states */
--color-info: #3b82f6          /* Blue 500 - Info states */
```

**Usage Guidelines**:
- **Success**: Positive feedback, completed actions, growth indicators
- **Warning**: Caution messages, pending states, attention needed
- **Error**: Error messages, failed actions, critical issues
- **Info**: Neutral information, tips, general notifications

#### Dark Mode Color Adaptations
```css
/* Dark Mode Overrides */
@media (prefers-color-scheme: dark) {
  --color-background: #111827   /* Gray 900 */
  --color-surface: #1f2937      /* Gray 800 */
  --color-text: #f9fafb         /* Gray 50 */
  --color-text-secondary: #9ca3af /* Gray 400 */
  --color-border: #374151       /* Gray 700 */
}
```

### Typography System

#### Font Family
```css
--font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
```

**Font Stack Strategy**:
1. **Inter**: Primary web font (clean, modern, highly legible)
2. **System Fonts**: Fallback to native system fonts for performance
3. **Sans-serif**: Generic fallback for maximum compatibility

#### Type Scale
Harmonious font size progression based on 1rem (16px) base:

```css
/* Font Sizes */
--font-size-xs: 0.75rem     /* 12px - Labels, captions */
--font-size-sm: 0.875rem    /* 14px - Body text, UI elements */
--font-size-base: 1rem      /* 16px - Default body text */
--font-size-lg: 1.125rem    /* 18px - Large body text */
--font-size-xl: 1.25rem     /* 20px - Small headings */
--font-size-2xl: 1.5rem     /* 24px - Section headings */
--font-size-3xl: 1.875rem   /* 30px - Page headings */
--font-size-4xl: 2.25rem    /* 36px - Hero headings */
```

#### Font Weight Scale
```css
/* Font Weights */
font-weight: 400    /* Normal - Body text */
font-weight: 500    /* Medium - UI labels, navigation */
font-weight: 600    /* Semibold - Subheadings, emphasis */
font-weight: 700    /* Bold - Headings, strong emphasis */
```

#### Line Height Guidelines
```css
/* Line Heights */
line-height: 1.2    /* Tight - Large headings */
line-height: 1.4    /* Snug - UI elements, small text */
line-height: 1.5    /* Normal - Body text */
line-height: 1.6    /* Relaxed - Long-form content */
```

### Spacing System

#### Spacing Scale
Consistent spacing based on 0.25rem (4px) increments:

```css
/* Spacing Tokens */
--spacing-0: 0rem       /* 0px - No spacing */
--spacing-xs: 0.25rem   /* 4px - Tight spacing */
--spacing-sm: 0.5rem    /* 8px - Small spacing */
--spacing-base: 1rem    /* 16px - Base spacing unit */
--spacing-lg: 1.5rem    /* 24px - Large spacing */
--spacing-xl: 2rem      /* 32px - Extra large spacing */
--spacing-2xl: 3rem     /* 48px - Section spacing */
--spacing-3xl: 4rem     /* 64px - Page-level spacing */
```

#### Spacing Usage Guidelines

**Component Internal Spacing**:
- **xs (4px)**: Icon-text gaps, tight element spacing
- **sm (8px)**: Button internal padding, form element spacing
- **base (16px)**: Card padding, general element spacing
- **lg (24px)**: Section padding, component spacing

**Layout Spacing**:
- **xl (32px)**: Component margins, large section padding
- **2xl (48px)**: Page section spacing, major layout gaps
- **3xl (64px)**: Page-level margins, hero section spacing

### Border and Radius System

#### Border Radius Scale
```css
/* Border Radius */
--radius-none: 0px      /* Square corners */
--radius-sm: 4px        /* Subtle rounding */
--radius-base: 8px      /* Standard rounding */
--radius-lg: 12px       /* Prominent rounding */
--radius-xl: 16px       /* Large rounding */
--radius-full: 50%      /* Circle/pill shape */
```

**Usage Guidelines**:
- **None**: Tables, strict layouts, data displays
- **Small (4px)**: Input fields, small buttons, tags
- **Base (8px)**: Buttons, form controls, small cards
- **Large (12px)**: Cards, modals, major components
- **XL (16px)**: Hero elements, prominent features
- **Full**: Profile pictures, status indicators, pills

### Shadow System

#### Shadow Scale
Progressive shadow system for elevation and depth:

```css
/* Shadows */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
--shadow-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
```

**Usage Guidelines**:
- **XS/SM**: Subtle depth for input fields, small elements
- **Base**: Standard cards, buttons, tooltips
- **Large**: Modals, dropdowns, floating panels
- **XL**: Major overlays, full-screen components
- **Hover**: Interactive element hover states

### Transition System

#### Timing Functions
```css
/* Transition Durations */
--transition-fast: 150ms ease-in-out     /* Quick interactions */
--transition-base: 250ms ease-in-out     /* Standard interactions */
--transition-slow: 350ms ease-in-out     /* Complex animations */
```

**Usage Guidelines**:
- **Fast (150ms)**: Button hovers, simple state changes
- **Base (250ms)**: Card hovers, form interactions, toggles
- **Slow (350ms)**: Complex animations, layout changes

#### Easing Functions
- **ease-in-out**: Standard easing for most interactions
- **ease-out**: Entrances, appearing elements
- **ease-in**: Exits, disappearing elements

## Component Design Patterns

### Card Components

#### Base Card Pattern
**Structure**: Container with background, border, padding, and shadow
**Variants**: Basic, Interactive, Elevated

```css
/* Base Card */
.card-base {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-base);
}

/* Interactive Card */
.card-interactive {
  transition: all var(--transition-base);
  cursor: pointer;
}

.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}
```

#### Card Content Structure
```css
/* Card Header */
.card-header {
  margin-bottom: var(--spacing-base);
  padding-bottom: var(--spacing-base);
  border-bottom: 1px solid var(--color-border);
}

/* Card Body */
.card-body {
  margin-bottom: var(--spacing-base);
}

/* Card Footer */
.card-footer {
  margin-top: var(--spacing-base);
  padding-top: var(--spacing-base);
  border-top: 1px solid var(--color-border);
}
```

### Button Components

#### Button Hierarchy
**Primary**: Main actions, call-to-action
**Secondary**: Secondary actions, alternative options
**Tertiary**: Subtle actions, less important options

```css
/* Primary Button */
.button-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-base);
  border-radius: var(--radius-base);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.button-primary:hover {
  background-color: var(--color-secondary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}

/* Secondary Button */
.button-secondary {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.button-secondary:hover {
  background-color: #f9fafb;
  border-color: var(--color-primary);
}
```

#### Button Sizes
```css
/* Size Variants */
.button-sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.button-base {
  padding: var(--spacing-sm) var(--spacing-base);
  font-size: var(--font-size-sm);
}

.button-lg {
  padding: var(--spacing-base) var(--spacing-lg);
  font-size: var(--font-size-base);
}
```

### Navigation Components

#### Link Cards Pattern
**Structure**: Prominent navigation cards with icons, titles, and descriptions
**Usage**: Page-to-page navigation, feature access

```css
.navigation-card {
  background: var(--color-primary);
  color: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  text-decoration: none;
  display: block;
  transition: all var(--transition-base);
}

.navigation-card:hover {
  background: var(--color-secondary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}
```

### Data Display Components

#### KPI Card Pattern
**Structure**: Title, large value, description, optional trend indicator
**Usage**: Key metrics, statistics, performance indicators

```css
.kpi-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
}

.kpi-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-sm);
}

.kpi-value {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
}

.kpi-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.4;
}
```

## Layout Patterns

### Grid System

#### 12-Column Grid
**Base Structure**: CSS Grid with 12 equal columns
**Responsive**: Adapts to 8-column (tablet) and 1-column (mobile)

```css
.layout-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--spacing-lg);
}

/* Responsive Breakpoints */
@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media (max-width: 768px) {
  .layout-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-base);
  }
}
```

#### Component Spanning
```css
/* Full Width */
.span-full { grid-column: 1 / -1; }

/* Half Width */
.span-half { grid-column: span 6; }

/* Third Width */
.span-third { grid-column: span 4; }

/* Quarter Width */
.span-quarter { grid-column: span 3; }
```

### Container Patterns

#### Page Container
```css
.page-container {
  max-width: var(--content-max-width);  /* 1200px */
  margin: 0 auto;
  padding: var(--spacing-lg);
  min-height: 100vh;
}
```

#### Section Container
```css
.section-container {
  margin-bottom: var(--spacing-2xl);
}

.section-header {
  margin-bottom: var(--spacing-lg);
}

.section-content {
  /* Content styling */
}
```

## State Patterns

### Loading States

#### Skeleton Loading
**Purpose**: Content placeholders during data loading
**Implementation**: Animated background gradients

```css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-sm);
  color: transparent;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

#### Loading Spinners
```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Error States

#### Error Card Pattern
```css
.error-state {
  background: #fef2f2;
  border: 2px dashed var(--color-error);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  color: #dc2626;
}

.error-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.error-message {
  font-size: var(--font-size-sm);
  line-height: 1.5;
}
```

### Empty States

#### Empty State Pattern
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-state-icon {
  width: 48px;
  height: 48px;
  margin-bottom: var(--spacing-base);
  opacity: 0.5;
}

.empty-state-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text);
}

.empty-state-description {
  font-size: var(--font-size-sm);
  line-height: 1.5;
  margin-bottom: var(--spacing-lg);
}
```

## Interaction Patterns

### Hover Effects

#### Standard Hover Pattern
```css
.interactive-element {
  transition: all var(--transition-base);
}

.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

#### Button Hover Pattern
```css
.button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}
```

### Focus States

#### Accessibility-First Focus
```css
.focusable:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* High Contrast Support */
@media (prefers-contrast: high) {
  .focusable:focus {
    outline: 3px solid var(--color-text);
  }
}
```

### Active States

#### Click/Press Feedback
```css
.clickable:active {
  transform: translateY(1px);
  box-shadow: var(--shadow-sm);
}
```

## Responsive Design Patterns

### Breakpoint System
```css
/* Mobile First Approach */
/* Mobile: 0px - 767px (default) */

/* Tablet */
@media (min-width: 768px) {
  /* Tablet styles */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Desktop styles */
}

/* Large Desktop */
@media (min-width: 1200px) {
  /* Large screen styles */
}
```

### Responsive Typography
```css
/* Fluid Typography */
.responsive-heading {
  font-size: var(--font-size-2xl);
}

@media (max-width: 768px) {
  .responsive-heading {
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 480px) {
  .responsive-heading {
    font-size: var(--font-size-lg);
  }
}
```

### Responsive Spacing
```css
/* Responsive Container Padding */
.container {
  padding: var(--spacing-lg);
}

@media (max-width: 768px) {
  .container {
    padding: var(--spacing-base);
  }
}
```

## Accessibility Guidelines

### Color Contrast Requirements
- **Normal Text**: 4.5:1 contrast ratio minimum
- **Large Text**: 3:1 contrast ratio minimum
- **Interactive Elements**: 3:1 contrast ratio for borders/backgrounds

### Focus Management
```css
/* Visible Focus Indicators */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove outline for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Screen Reader Support
```css
/* Screen Reader Only Content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Design System Usage Guidelines for AI Agents

### Creating New Components

#### 1. Start with Base Patterns
```css
/* Use established patterns as foundation */
.new-component {
  /* Base structure */
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  
  /* Interactive behavior */
  transition: all var(--transition-base);
}

.new-component:hover {
  /* Standard hover pattern */
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

#### 2. Follow Token Usage
```css
/* ✅ Good: Using design tokens */
.component {
  color: var(--color-text);
  font-size: var(--font-size-base);
  margin: var(--spacing-base);
}

/* ❌ Avoid: Magic numbers */
.component {
  color: #333333;
  font-size: 14px;
  margin: 15px;
}
```

#### 3. Maintain Consistency
- **Spacing**: Use spacing scale tokens consistently
- **Colors**: Stick to defined color palette
- **Typography**: Follow established type scale
- **Shadows**: Use shadow scale for elevation

### Modifying Existing Components

#### Safe Modifications
```css
/* ✅ Safe: Extending with design tokens */
.existing-component {
  /* Add new properties using tokens */
  border-left: 4px solid var(--color-primary);
}

/* ✅ Safe: Adding responsive behavior */
@media (max-width: 768px) {
  .existing-component {
    padding: var(--spacing-base);
  }
}
```

#### Risky Modifications
```css
/* ⚠️ Risky: Changing core structure */
.existing-component {
  display: none; /* Could break functionality */
}

/* ⚠️ Risky: Overriding accessibility features */
.existing-component:focus {
  outline: none; /* Removes accessibility */
}
```

### Theme Customization

#### Color Customization
```css
/* Override color tokens for theme variants */
.page-dashboard.theme-blue {
  --color-primary: #3b82f6;
  --color-secondary: #1d4ed8;
}

.page-dashboard.theme-green {
  --color-primary: #10b981;
  --color-secondary: #047857;
}
```

#### Spacing Customization
```css
/* Adjust spacing scale for compact layouts */
.page-dashboard.layout-compact {
  --spacing-base: 0.75rem;
  --spacing-lg: 1rem;
  --spacing-xl: 1.5rem;
}
```

## Quality Assurance Checklist

### Visual Consistency
- [ ] Uses design tokens for all styling properties
- [ ] Follows established component patterns
- [ ] Maintains visual hierarchy with typography scale
- [ ] Uses consistent spacing throughout

### Responsive Design
- [ ] Works across all breakpoints (mobile, tablet, desktop)
- [ ] Text remains readable at all sizes
- [ ] Interactive elements maintain appropriate touch targets
- [ ] Layout adapts gracefully to different screen sizes

### Accessibility
- [ ] Meets WCAG 2.1 AA contrast requirements
- [ ] Includes proper focus indicators
- [ ] Supports screen readers with appropriate markup
- [ ] Respects user motion preferences

### Performance
- [ ] Uses efficient CSS selectors
- [ ] Animations use transform/opacity for performance
- [ ] No unnecessary repaints or reflows
- [ ] Optimized for CSS delivery

### Browser Support
- [ ] Works in modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] Includes appropriate fallbacks for CSS features
- [ ] Maintains functionality without JavaScript
- [ ] Supports both light and dark mode preferences

## Design System Maintenance

### Adding New Tokens
When adding new design tokens:
1. **Evaluate Need**: Ensure token fills a gap in the system
2. **Follow Naming**: Use consistent naming convention
3. **Document Usage**: Provide clear usage guidelines
4. **Test Thoroughly**: Verify across all components

### Updating Existing Tokens
When modifying existing tokens:
1. **Impact Assessment**: Identify all affected components
2. **Gradual Rollout**: Update incrementally to prevent issues
3. **Backward Compatibility**: Maintain compatibility where possible
4. **Communication**: Document changes clearly

### Token Naming Convention
```css
/* Pattern: --{category}-{variant}-{state} */
--color-primary           /* Base primary color */
--color-primary-hover     /* Primary hover state */
--spacing-base           /* Base spacing unit */
--font-size-lg           /* Large font size */
--shadow-hover           /* Hover shadow effect */
```

## Summary
The Dashboard design system provides a comprehensive foundation for creating consistent, accessible, and maintainable UI components. By following the established patterns, using design tokens consistently, and adhering to accessibility guidelines, AI agents can confidently create and modify dashboard components while maintaining the overall design integrity and user experience quality.

The system's token-based architecture ensures flexibility for customization while maintaining visual consistency across all dashboard components. The comprehensive patterns and guidelines enable rapid development of new features while ensuring they integrate seamlessly with the existing design language.