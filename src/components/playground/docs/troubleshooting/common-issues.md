# Common Issues and Solutions

This guide provides solutions to common problems agents might encounter when working with the Dashboard page. Each issue includes symptoms, root causes, and step-by-step resolution procedures.

## 🚨 Quick Reference

### Most Common Issues
1. [Configuration Validation Errors](#configuration-validation-errors)
2. [Component Registration Issues](#component-registration-issues)
3. [Grid Positioning Conflicts](#grid-positioning-conflicts)
4. [Theme Application Problems](#theme-application-problems)
5. [Build and TypeScript Errors](#build-and-typescript-errors)
6. [Automation Script Failures](#automation-script-failures)

## 📋 Issue Categories

### Configuration Validation Errors

#### Issue: YAML Syntax Error
**Symptoms**:
- Page fails to load
- Console error: "YAML parsing error"
- Blank page or error boundary displayed

**Common Causes**:
- Invalid indentation (mixing tabs and spaces)
- Missing quotes around special characters
- Incorrect nesting levels
- Missing required fields

**Solution**:
```bash
# 1. Validate YAML syntax
cd src/pages/dashboard
yamllint config.yaml

# 2. Check for common syntax issues
# Look for:
# - Consistent indentation (2 spaces recommended)
# - Proper quotes around strings with special characters
# - Correct array/object notation

# 3. Use the validation script
npm run validate:config

# 4. Fix common patterns:
```

**Before (incorrect)**:
```yaml
components:
  - id: my-component    # Missing quotes
    position: 
      col: 1 row: 1    # Invalid object syntax
    span: 12
```

**After (correct)**:
```yaml
components:
  - id: "my-component"
    position: 
      col: 1
      row: 1
      span: 12
```

#### Issue: Missing Required Configuration Fields
**Symptoms**:
- Error: "Missing required field: [field_name]"
- Component fails to render
- Validation script reports missing fields

**Solution**:
```yaml
# Ensure all required fields are present:
page:
  title: "Dashboard"        # Required
  route: "/"               # Required
  description: "..."       # Optional

layout:
  type: "grid"            # Required
  columns: 12             # Required for grid type
  gap: 4                  # Optional (defaults to 4)
  padding: 6              # Optional (defaults to 6)

components:
  - id: "unique-id"       # Required
    type: "ComponentName" # Required
    position:             # Required
      col: 1             # Required
      row: 1             # Required
      span: 12           # Required
    props: {}            # Optional
```

### Component Registration Issues

#### Issue: Component Not Found
**Symptoms**:
- Error: "Component 'ComponentName' not found in registry"
- Empty space where component should render
- Console warning about missing component

**Common Causes**:
- Component not registered in `components/index.ts`
- Typo in component type name
- Component file not exported properly

**Solution**:
```typescript
// 1. Check components/index.ts
import { WelcomeHeader } from './WelcomeHeader';
import { KPICards } from './KPICards';
// ... other imports

// 2. Ensure all components are registered
const components = [
  { name: 'WelcomeHeader', component: WelcomeHeader },
  { name: 'KPICards', component: KPICards },
  // Add missing component here
];

// 3. Verify component export
// In the component file:
export const MyComponent: React.FC<MyComponentProps> = ({ ...props }) => {
  // Component implementation
};

// 4. Check config.yaml for exact spelling
components:
  - type: "MyComponent"  # Must match registration name exactly
```

#### Issue: Component Props Type Mismatch
**Symptoms**:
- TypeScript error in component
- Runtime error about invalid props
- Component renders incorrectly

**Solution**:
```typescript
// 1. Define proper TypeScript interface
interface MyComponentProps {
  title: string;
  count?: number;  // Optional props marked with ?
  items: string[];
}

// 2. Update config.yaml to match interface
components:
  - type: "MyComponent"
    props:
      title: "Dashboard"     # Required string
      count: 42             # Optional number
      items: ["a", "b"]     # Required array

// 3. Add runtime validation
export const MyComponent: React.FC<MyComponentProps> = ({ 
  title,
  count = 0,  // Default values for optional props
  items = []
}) => {
  // Validate props
  if (!title) {
    console.error('MyComponent: title prop is required');
    return null;
  }
  
  return (
    // Component JSX
  );
};
```

### Grid Positioning Conflicts

#### Issue: Components Overlapping
**Symptoms**:
- Components rendering on top of each other
- Layout appears broken
- Console warnings about grid conflicts

**Common Causes**:
- Multiple components assigned to same grid position
- Span values causing overlap
- Incorrect row/column calculations

**Solution**:
```yaml
# 1. Check for position conflicts
# Use the grid visualization tool:
npm run debug:grid

# 2. Calculate positions correctly
# Grid is 12 columns wide
# Example layout without overlap:
components:
  - id: "header"
    position: { col: 1, row: 1, span: 12 }  # Full width, row 1
  
  - id: "left-card"
    position: { col: 1, row: 2, span: 6 }   # Half width left, row 2
  
  - id: "right-card"
    position: { col: 7, row: 2, span: 6 }   # Half width right, row 2
  
  - id: "footer"
    position: { col: 1, row: 3, span: 12 }  # Full width, row 3

# 3. Common patterns:
# Full width: span: 12
# Half width: span: 6 (two components: col 1 & col 7)
# Third width: span: 4 (three components: col 1, col 5, col 9)
# Quarter width: span: 3 (four components: col 1, col 4, col 7, col 10)
```

#### Issue: Components Not Responsive
**Symptoms**:
- Layout breaks on mobile devices
- Components too small/large on different screens
- Horizontal scrolling appears

**Solution**:
```css
/* 1. Check responsive breakpoints in styles.css */
@media (max-width: 768px) {
  .dashboard-container {
    grid-template-columns: 1fr !important;  /* Single column on mobile */
  }
  
  .dashboard-component {
    grid-column: 1 / -1 !important;  /* Full width on mobile */
  }
}

/* 2. Use responsive-friendly configurations */
```

```yaml
# Consider mobile-first layouts
layout:
  type: "grid"
  columns: 12
  responsive:
    mobile: { columns: 1 }    # Single column on mobile
    tablet: { columns: 6 }    # 6 columns on tablet
    desktop: { columns: 12 }  # Full 12 on desktop
```

### Theme Application Problems

#### Issue: Theme Changes Not Applying
**Symptoms**:
- Colors remain unchanged after theme update
- Inconsistent styling across components
- CSS custom properties not updating

**Common Causes**:
- CSS specificity conflicts
- Cached styles not refreshing
- Incorrect CSS custom property names

**Solution**:
```bash
# 1. Clear cache and rebuild
npm run clean
npm run build

# 2. Verify theme changes in styles.css
```

```css
/* Check CSS custom properties are defined */
:root {
  --color-primary: #3b82f6;
  --color-background: #ffffff;
  --color-text: #1f2937;
  /* ... other properties */
}

/* 3. Ensure components use CSS properties */
.component {
  background-color: var(--color-background);
  color: var(--color-text);
  /* Avoid hardcoded colors */
}
```

```typescript
// 4. Force theme refresh programmatically
const refreshTheme = () => {
  // Remove and re-add stylesheet
  const link = document.querySelector('link[href*="styles.css"]');
  if (link) {
    link.href = link.href.split('?')[0] + '?v=' + Date.now();
  }
};
```

#### Issue: Dark Mode Not Working
**Symptoms**:
- Dark mode toggle doesn't change colors
- Some components remain light themed
- Inconsistent dark mode application

**Solution**:
```css
/* 1. Ensure dark mode variables are defined */
[data-theme="dark"] {
  --color-background: #1f2937;
  --color-text: #f9fafb;
  --color-primary: #60a5fa;
  /* Define all color overrides */
}

/* 2. Apply to all components */
.dashboard-container[data-theme="dark"] {
  background-color: var(--color-background);
}

/* 3. Check theme toggle implementation */
```

```typescript
const toggleTheme = () => {
  const root = document.documentElement;
  const currentTheme = root.getAttribute('data-theme');
  root.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
};
```

### Build and TypeScript Errors

#### Issue: TypeScript Compilation Errors
**Symptoms**:
- Build fails with TS errors
- Red underlines in IDE
- `npm run build` fails

**Common Solutions**:
```bash
# 1. Update TypeScript definitions
npm install --save-dev @types/react @types/node

# 2. Check tsconfig.json settings
```

```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "jsx": "react-jsx"
  }
}
```

```typescript
// 3. Common type fixes
// Define proper interfaces
interface ComponentProps {
  title: string;
  onClick?: () => void;  // Optional callback
}

// Use proper React types
const Component: React.FC<ComponentProps> = ({ title, onClick }) => {
  return <div onClick={onClick}>{title}</div>;
};

// 4. Handle potentially undefined values
const value = data?.property ?? 'default';
```

#### Issue: Import Errors
**Symptoms**:
- "Module not found" errors
- Components not importing correctly
- Build fails with resolution errors

**Solution**:
```typescript
// 1. Use correct relative imports
import { WelcomeHeader } from './WelcomeHeader';  // Same directory
import { useTheme } from '../hooks/useTheme';     // Parent directory
import type { DashboardData } from '../types';    // Type imports

// 2. Check file extensions
import { Component } from './Component';     // .tsx extension implied
import styles from './styles.module.css';    // Explicit for CSS

// 3. Verify export/import match
// In Component.tsx:
export const MyComponent = () => { };       // Named export

// In index.ts:
import { MyComponent } from './Component';   // Named import

// 4. Update path aliases if using
// In tsconfig.json:
{
  "compilerOptions": {
    "paths": {
      "@dashboard/*": ["src/pages/dashboard/*"]
    }
  }
}
```

### Automation Script Failures

#### Issue: Script Permission Denied
**Symptoms**:
- "Permission denied" when running scripts
- Scripts fail to execute
- Bash scripts not running

**Solution**:
```bash
# 1. Make scripts executable
chmod +x src/pages/dashboard/scripts/*.sh

# 2. Check Node script permissions
ls -la src/pages/dashboard/scripts/

# 3. Run with proper permissions
# For bash scripts:
bash src/pages/dashboard/scripts/update-layout.sh

# For Node scripts:
node src/pages/dashboard/scripts/add-component.ts
```

#### Issue: Script Modifies Wrong Files
**Symptoms**:
- Changes appear in unexpected places
- Configuration gets corrupted
- Backup files created incorrectly

**Solution**:
```bash
# 1. Always run scripts from correct directory
cd src/pages/dashboard
./scripts/update-layout.sh

# 2. Check script working directory
# In script:
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."  # Navigate to dashboard directory

# 3. Verify backup before changes
cp config.yaml config.yaml.backup
# Run script
# If issues, restore:
mv config.yaml.backup config.yaml
```

## 🔧 Debugging Tools

### Configuration Validator
```bash
# Validate configuration syntax and schema
npm run validate:dashboard

# Check specific issues
npm run validate:dashboard -- --verbose
```

### Component Inspector
```typescript
// Add debug mode to components
const DEBUG = process.env.NODE_ENV === 'development';

export const Component = (props) => {
  if (DEBUG) {
    console.log('Component props:', props);
    console.log('Component rendering at:', new Date());
  }
  
  return (
    // Component JSX
  );
};
```

### Grid Debugger
```css
/* Add visual grid debugging */
.debug-grid {
  background-image: 
    repeating-linear-gradient(
      0deg,
      rgba(255, 0, 0, 0.1),
      rgba(255, 0, 0, 0.1) 1px,
      transparent 1px,
      transparent 20px
    );
  outline: 2px dashed red;
}

/* Apply in development */
.dashboard-container.debug .dashboard-component {
  outline: 1px solid blue;
  position: relative;
}

.dashboard-container.debug .dashboard-component::before {
  content: attr(data-component-id);
  position: absolute;
  top: 0;
  left: 0;
  background: yellow;
  padding: 2px 4px;
  font-size: 10px;
}
```

## 🚑 Emergency Recovery

### Complete Reset Procedure
```bash
# 1. Backup current state
cp -r src/pages/dashboard src/pages/dashboard.backup

# 2. Reset to default configuration
cd src/pages/dashboard
git checkout config.yaml styles.css

# 3. Clear build cache
rm -rf .next/cache
npm run clean

# 4. Rebuild
npm run build

# 5. Test
npm run dev
```

### Rollback Procedure
```bash
# 1. Check backup directory
ls -la src/pages/dashboard/backups/

# 2. Find latest working backup
# Backups are timestamped: backup-2024-07-01-14-30-45

# 3. Restore specific backup
cp backups/backup-2024-07-01-14-30-45/config.yaml ./config.yaml
cp backups/backup-2024-07-01-14-30-45/styles.css ./styles.css

# 4. Restart development server
npm run dev
```

## 📚 Prevention Best Practices

### Before Making Changes
1. **Always create backups**: Use `deploy-changes.sh` which handles backups automatically
2. **Validate configurations**: Run validation before applying changes
3. **Test in development**: Never modify production directly
4. **Use automation scripts**: They include built-in validation and rollback

### During Development
1. **Incremental changes**: Make small, testable modifications
2. **Check console logs**: Watch for warnings and errors
3. **Use TypeScript**: Catches many errors at compile time
4. **Test responsive**: Check all screen sizes

### After Changes
1. **Run full test suite**: `npm run test:dashboard`
2. **Validate configuration**: `npm run validate:dashboard`
3. **Check accessibility**: `npm run a11y:check`
4. **Document changes**: Update relevant documentation

## 🔗 Related Documentation

- [Validation Errors Reference](./validation-errors.md) - Detailed validation error messages
- [Debugging Guide](./debugging-guide.md) - Advanced debugging techniques
- [Recovery Procedures](./recovery-procedures.md) - Complete recovery workflows
- [Configuration Overview](../configuration/config-overview.md) - Configuration system details

---

*Remember: Most issues can be prevented by using the automation scripts and following the established patterns. When in doubt, create a backup before making changes.*