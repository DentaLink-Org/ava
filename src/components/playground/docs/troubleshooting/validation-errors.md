# Validation Error Reference

This document provides a comprehensive reference for all validation errors that agents might encounter when working with the Dashboard page configuration system. Each error includes the exact error message, root cause, and precise resolution steps.

## 🚨 Quick Error Lookup

Use `Ctrl+F` to quickly find your specific error message:

- [YAML Syntax Errors](#yaml-syntax-errors)
- [Schema Validation Errors](#schema-validation-errors)
- [Component Configuration Errors](#component-configuration-errors)
- [Layout Configuration Errors](#layout-configuration-errors)
- [Data Configuration Errors](#data-configuration-errors)
- [Theme Configuration Errors](#theme-configuration-errors)

## 📋 Error Categories

### YAML Syntax Errors

#### Error: `YAMLParseError: bad indentation of a mapping entry`
```
Error parsing config.yaml at line 15, column 3:
bad indentation of a mapping entry
```

**Root Cause**: Inconsistent indentation in YAML file

**Fix**:
```yaml
# ❌ Incorrect - mixed indentation
components:
  - id: "header"
    type: "WelcomeHeader"
      position:  # Too many spaces
    col: 1

# ✅ Correct - consistent 2-space indentation
components:
  - id: "header"
    type: "WelcomeHeader"
    position:
      col: 1
```

#### Error: `YAMLParseError: found undefined alias`
```
Error: found undefined alias "unknown-anchor"
```

**Root Cause**: Using undefined YAML anchor reference

**Fix**:
```yaml
# ❌ Incorrect - undefined anchor
layout: &base-layout
  type: "grid"
  columns: 12

components:
  - <<: *undefined-anchor  # This anchor doesn't exist

# ✅ Correct - defined anchor
layout: &base-layout
  type: "grid"
  columns: 12

components:
  - id: "header"
    <<: *base-layout  # Use the defined anchor
```

#### Error: `YAMLParseError: can not read a block mapping entry`
```
Error at line 8: can not read a block mapping entry; a multiline key may not be an implicit key
```

**Root Cause**: Invalid YAML structure or syntax

**Fix**:
```yaml
# ❌ Incorrect - invalid mapping
components:
- id: header
  type: WelcomeHeader
  position: col: 1, row: 1  # Invalid inline mapping

# ✅ Correct - proper YAML structure
components:
  - id: "header"
    type: "WelcomeHeader"
    position:
      col: 1
      row: 1
```

### Schema Validation Errors

#### Error: `ValidationError: Missing required field 'page.title'`
```
Configuration validation failed:
Missing required field 'page.title'
```

**Root Cause**: Required configuration field is missing

**Fix**:
```yaml
# ❌ Missing required field
page:
  route: "/"
  # title is required but missing

# ✅ Complete required fields
page:
  title: "Dashboard"        # Required
  route: "/"               # Required
  description: "Main dashboard page"  # Optional
```

#### Error: `ValidationError: Invalid value for 'layout.type'`
```
Configuration validation failed:
Invalid value for 'layout.type': "flexbox"
Expected one of: ["grid", "flex", "custom"]
```

**Root Cause**: Configuration value not in allowed enum

**Fix**:
```yaml
# ❌ Invalid enum value
layout:
  type: "flexbox"  # Not a valid option

# ✅ Valid enum value
layout:
  type: "grid"     # Valid: "grid", "flex", or "custom"
  columns: 12
```

#### Error: `ValidationError: Property 'layout.columns' must be a number`
```
Configuration validation failed:
Property 'layout.columns' must be a number, received string
```

**Root Cause**: Type mismatch in configuration

**Fix**:
```yaml
# ❌ Wrong type (string instead of number)
layout:
  type: "grid"
  columns: "12"    # String value

# ✅ Correct type
layout:
  type: "grid"
  columns: 12      # Number value
```

### Component Configuration Errors

#### Error: `ComponentError: Component 'InvalidComponent' not found in registry`
```
Failed to render component at position [1,1]:
Component 'InvalidComponent' not found in registry
Available components: WelcomeHeader, KPICards, DatabaseLinkCard, TasksLinkCard, QuickStartCard
```

**Root Cause**: Component type doesn't exist in the component registry

**Fix**:
```yaml
# ❌ Component doesn't exist
components:
  - id: "header"
    type: "InvalidComponent"  # Not registered

# ✅ Use registered component
components:
  - id: "header"
    type: "WelcomeHeader"     # Available in registry
```

**Available Components**:
- `WelcomeHeader`
- `KPICards`
- `DatabaseLinkCard`
- `TasksLinkCard`
- `QuickStartCard`

#### Error: `ComponentError: Duplicate component ID 'header'`
```
Configuration validation failed:
Duplicate component ID 'header' found at positions [1,1] and [2,1]
Component IDs must be unique
```

**Root Cause**: Multiple components using the same ID

**Fix**:
```yaml
# ❌ Duplicate IDs
components:
  - id: "header"
    type: "WelcomeHeader"
    position: { col: 1, row: 1, span: 12 }
  
  - id: "header"          # Duplicate ID
    type: "KPICards"
    position: { col: 1, row: 2, span: 12 }

# ✅ Unique IDs
components:
  - id: "welcome-header"  # Unique ID
    type: "WelcomeHeader"
    position: { col: 1, row: 1, span: 12 }
  
  - id: "kpi-cards"       # Unique ID
    type: "KPICards"
    position: { col: 1, row: 2, span: 12 }
```

#### Error: `ComponentError: Invalid props for component 'WelcomeHeader'`
```
Component validation failed for 'WelcomeHeader':
Property 'invalidProp' is not allowed
Expected props: title, subtitle, showActions
```

**Root Cause**: Component props don't match the component's interface

**Fix**:
```typescript
// Check component interface definition
interface WelcomeHeaderProps {
  title: string;
  subtitle?: string;
  showActions?: boolean;
}
```

```yaml
# ❌ Invalid props
components:
  - id: "header"
    type: "WelcomeHeader"
    props:
      invalidProp: "value"  # Not in interface
      count: 42            # Not in interface

# ✅ Valid props matching interface
components:
  - id: "header"
    type: "WelcomeHeader"
    props:
      title: "Dashboard"         # Required string
      subtitle: "Welcome back"   # Optional string
      showActions: true         # Optional boolean
```

### Layout Configuration Errors

#### Error: `LayoutError: Grid position conflict at [1,1]`
```
Layout validation failed:
Grid position conflict detected
Components 'header' and 'nav' both occupy position [1,1] with spans [12,6]
```

**Root Cause**: Multiple components occupying overlapping grid positions

**Fix**:
```yaml
# ❌ Overlapping positions
components:
  - id: "header"
    position: { col: 1, row: 1, span: 12 }  # Occupies cols 1-12
  
  - id: "nav"
    position: { col: 6, row: 1, span: 8 }   # Overlaps cols 6-12

# ✅ Non-overlapping positions
components:
  - id: "header"
    position: { col: 1, row: 1, span: 12 }  # Full width, row 1
  
  - id: "nav"
    position: { col: 1, row: 2, span: 12 }  # Full width, row 2
```

#### Error: `LayoutError: Column span exceeds grid width`
```
Layout validation failed:
Component 'wide-component' at column 8 with span 6 exceeds grid width of 12
Maximum span at column 8 is 5
```

**Root Cause**: Component span extends beyond the grid boundaries

**Fix**:
```yaml
# ❌ Exceeds grid boundaries
# Grid has 12 columns (1-12)
# Column 8 + span 6 = column 14 (invalid)
components:
  - id: "wide-component"
    position: { col: 8, row: 1, span: 6 }  # 8 + 6 = 14 > 12

# ✅ Within grid boundaries
components:
  - id: "wide-component"
    position: { col: 8, row: 1, span: 5 }  # 8 + 5 = 13 ≤ 12
  
  # Or start earlier:
  - id: "wide-component"
    position: { col: 7, row: 1, span: 6 }  # 7 + 6 = 13 ≤ 12
```

#### Error: `LayoutError: Invalid grid position values`
```
Layout validation failed:
Invalid position values for component 'test':
col: 0 (must be ≥ 1)
row: -1 (must be ≥ 1)
span: 0 (must be ≥ 1)
```

**Root Cause**: Grid position values outside valid ranges

**Fix**:
```yaml
# ❌ Invalid position values
components:
  - id: "test"
    position:
      col: 0     # Must be ≥ 1
      row: -1    # Must be ≥ 1
      span: 0    # Must be ≥ 1

# ✅ Valid position values
components:
  - id: "test"
    position:
      col: 1     # 1 ≤ col ≤ 12
      row: 1     # row ≥ 1
      span: 6    # 1 ≤ span ≤ (13 - col)
```

### Data Configuration Errors

#### Error: `DataError: Invalid API endpoint configuration`
```
Data validation failed:
Invalid API endpoint 'api/invalid-endpoint'
Endpoint must start with '/' or be a full URL
```

**Root Cause**: API endpoint format doesn't match expected pattern

**Fix**:
```yaml
# ❌ Invalid endpoint format
data:
  apiEndpoint: "api/metrics"  # Missing leading slash

# ✅ Valid endpoint formats
data:
  apiEndpoint: "/api/metrics"                    # Relative path
  # OR
  apiEndpoint: "https://api.example.com/metrics" # Full URL
```

#### Error: `DataError: Refresh interval must be positive number`
```
Data validation failed:
Invalid refresh interval: -5000
Refresh interval must be a positive number (milliseconds)
```

**Root Cause**: Refresh interval is not a positive number

**Fix**:
```yaml
# ❌ Invalid refresh interval
data:
  refreshInterval: -5000  # Negative value
  
# ❌ Also invalid
data:
  refreshInterval: 0      # Zero is not positive

# ✅ Valid refresh interval
data:
  refreshInterval: 5000   # 5 seconds in milliseconds
  refreshInterval: 30000  # 30 seconds
  refreshInterval: 60000  # 1 minute
```

#### Error: `DataError: Mock data structure validation failed`
```
Mock data validation failed:
Property 'metrics.totalUsers' must be a number, received string
```

**Root Cause**: Mock data doesn't match expected data structure

**Fix**:
```yaml
# ❌ Wrong data types in mock data
data:
  mockData:
    metrics:
      totalUsers: "1,234"     # String instead of number
      activeUsers: "active"   # String instead of number

# ✅ Correct data types
data:
  mockData:
    metrics:
      totalUsers: 1234        # Number
      activeUsers: 456        # Number
      growthRate: 12.5        # Number (decimal)
```

### Theme Configuration Errors

#### Error: `ThemeError: Invalid color format`
```
Theme validation failed:
Invalid color value '#invalid' for property 'colors.primary'
Expected hex color (#RRGGBB or #RGB), RGB/RGBA, or HSL/HSLA
```

**Root Cause**: Color value doesn't match valid CSS color formats

**Fix**:
```yaml
# ❌ Invalid color formats
theme:
  colors:
    primary: "#invalid"     # Invalid hex
    secondary: "red-ish"    # Not valid CSS
    background: "#12"       # Too short

# ✅ Valid color formats
theme:
  colors:
    primary: "#3b82f6"              # Hex 6-digit
    secondary: "#f00"               # Hex 3-digit
    background: "rgb(255, 255, 255)" # RGB
    text: "rgba(0, 0, 0, 0.8)"     # RGBA
    accent: "hsl(210, 100%, 50%)"   # HSL
```

#### Error: `ThemeError: Font family not available`
```
Theme validation failed:
Font family 'CustomFont' not loaded
Available fonts: Inter, system-ui, sans-serif
```

**Root Cause**: Font family specified is not loaded in the application

**Fix**:
```yaml
# ❌ Font not available
theme:
  typography:
    fontFamily: "CustomFont"  # Not loaded

# ✅ Use available fonts
theme:
  typography:
    fontFamily: "Inter"       # Default loaded font
    # OR
    fontFamily: "system-ui"   # System font
    # OR
    fontFamily: "Inter, system-ui, sans-serif"  # Font stack
```

#### Error: `ThemeError: Invalid spacing value`
```
Theme validation failed:
Invalid spacing value '10px' for property 'spacing.md'
Expected number (will be converted to rem)
```

**Root Cause**: Spacing values should be numbers, not CSS strings

**Fix**:
```yaml
# ❌ CSS units in spacing
theme:
  spacing:
    sm: "8px"     # Should be number
    md: "1rem"    # Should be number
    lg: "2em"     # Should be number

# ✅ Numbers only (converted to rem)
theme:
  spacing:
    sm: 8         # Becomes 0.5rem
    md: 16        # Becomes 1rem
    lg: 32        # Becomes 2rem
```

## 🔧 Validation Tools

### Command Line Validation
```bash
# Validate configuration file
npm run validate:config

# Validate with detailed output
npm run validate:config -- --verbose

# Validate specific sections
npm run validate:config -- --section=components
npm run validate:config -- --section=layout
npm run validate:config -- --section=theme
```

### Programmatic Validation
```typescript
import { validateDashboardConfig } from '../utils/configValidator';

try {
  const result = await validateDashboardConfig('config.yaml');
  if (!result.valid) {
    console.error('Validation errors:', result.errors);
    result.errors.forEach(error => {
      console.error(`- ${error.path}: ${error.message}`);
    });
  }
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

### Schema Reference
```typescript
// Complete schema for reference
interface DashboardConfig {
  page: {
    title: string;                    // Required
    route: string;                    // Required
    description?: string;             // Optional
  };
  
  layout: {
    type: 'grid' | 'flex' | 'custom'; // Required
    columns: number;                  // Required for grid
    gap?: number;                     // Optional (default: 4)
    padding?: number;                 // Optional (default: 6)
  };
  
  components: Array<{
    id: string;                       // Required, must be unique
    type: string;                     // Required, must exist in registry
    position: {                       // Required
      col: number;                    // 1 ≤ col ≤ layout.columns
      row: number;                    // row ≥ 1
      span: number;                   // 1 ≤ span ≤ (layout.columns - col + 1)
    };
    props?: Record<string, any>;      // Optional, must match component interface
  }>;
  
  data?: {
    apiEndpoint?: string;             // Must be valid URL or path
    refreshInterval?: number;         // Must be positive
    mockData?: Record<string, any>;   // Must match expected structure
  };
  
  theme?: {
    colors?: Record<string, string>;  // Must be valid CSS colors
    typography?: {
      fontFamily?: string;            // Must be loaded font
      fontSize?: Record<string, number>;
    };
    spacing?: Record<string, number>; // Numbers only (converted to rem)
  };
}
```

## 🚑 Error Recovery

### Quick Fix Commands
```bash
# Reset to default configuration
cp config.yaml.default config.yaml

# Fix common YAML syntax issues
yamllint config.yaml --fix

# Validate and show detailed errors
npm run validate:config -- --verbose --fix-suggestions
```

### Common Quick Fixes
```bash
# Fix indentation (convert tabs to spaces)
sed -i 's/\t/  /g' config.yaml

# Add missing quotes to string values
# (Manual fix required - check error line numbers)

# Reset theme to defaults
yq eval '.theme = {"colors": {"primary": "#3b82f6"}}' -i config.yaml
```

## 📚 Error Prevention

### Pre-Commit Validation
```bash
# Add to package.json scripts
"scripts": {
  "pre-commit": "npm run validate:config && npm run lint",
  "validate:config": "node scripts/validate-config.js"
}
```

### IDE Integration
```json
// .vscode/settings.json
{
  "yaml.schemas": {
    "./schema/dashboard-config.json": ["**/config.yaml"]
  },
  "yaml.validate": true,
  "yaml.format.enable": true
}
```

### Automation Script Validation
```typescript
// Always validate before applying changes
const validateBeforeChange = async (configPath: string) => {
  const validation = await validateDashboardConfig(configPath);
  if (!validation.valid) {
    throw new Error(`Configuration invalid: ${validation.errors.join(', ')}`);
  }
  return validation;
};
```

## 🔗 Related Documentation

- [Common Issues](./common-issues.md) - General troubleshooting guide
- [Configuration Overview](../configuration/config-overview.md) - Configuration system details
- [Component Catalog](../components/component-catalog.md) - Available components reference
- [Layout Configuration](../configuration/layout-config.md) - Grid system details

---

*Remember: Most validation errors can be prevented by using the automation scripts and following the established configuration patterns. When in doubt, start with a working configuration and make incremental changes.*