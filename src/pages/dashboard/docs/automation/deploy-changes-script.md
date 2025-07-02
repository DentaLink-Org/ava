# Dashboard Deploy Changes Script Guide

## Purpose
This document provides a comprehensive guide to the `deploy-changes.sh` automation script for the Dashboard page. This script validates, tests, and safely deploys dashboard configuration changes with comprehensive error handling, backup creation, and rollback capabilities.

## Overview
The `deploy-changes.sh` script is the final step in the dashboard modification workflow. It performs comprehensive validation of configuration changes, creates backups, tests component availability, and safely applies changes to the dashboard. The script is designed to prevent configuration errors and provides rollback capabilities for error recovery.

## Key Features
- **Multi-layer validation** - YAML syntax, schema, and business logic validation
- **Automatic backup creation** - Timestamped backups before deployment
- **Component testing** - Verifies all referenced components exist
- **Position conflict detection** - Prevents grid layout overlaps
- **Detailed logging** - Comprehensive logs for debugging and auditing
- **Rollback capabilities** - Easy recovery from failed deployments
- **Deployment reporting** - Generates detailed deployment reports

## Script Location and Usage

### File Location
```
src/pages/dashboard/scripts/deploy-changes.sh
```

### Basic Usage
```bash
# Navigate to dashboard directory
cd src/pages/dashboard

# Run full deployment (default)
./scripts/deploy-changes.sh

# Or with explicit deploy command
./scripts/deploy-changes.sh deploy
```

### Available Commands
```bash
# Full deployment with validation and backup
./scripts/deploy-changes.sh deploy

# Validation only (no deployment)
./scripts/deploy-changes.sh validate

# Create backup without deployment
./scripts/deploy-changes.sh backup

# Rollback to previous version
./scripts/deploy-changes.sh rollback

# Test component availability
./scripts/deploy-changes.sh test

# Generate deployment report
./scripts/deploy-changes.sh report

# Show help
./scripts/deploy-changes.sh help
```

## Detailed Command Reference

### 1. Deploy Command (Default)
**Purpose**: Performs complete deployment with all validation and safety checks

**Process Flow**:
1. Initialize logging
2. Validate YAML syntax
3. Validate configuration schema
4. Check component positions for conflicts
5. Create deployment backup
6. Test component availability
7. Check application restart requirements
8. Generate deployment report

**Example**:
```bash
./scripts/deploy-changes.sh deploy
```

**Output**:
```
ℹ️  Deploy script started
ℹ️  Validating YAML configuration...
✅ YAML validation passed
ℹ️  Validating configuration schema...
✅ Schema validation passed
ℹ️  Validating component positions...
✅ Position validation passed
ℹ️  Creating deployment backup...
✅ Backup created: deploy_backup_20250701_143022.yaml
ℹ️  Testing component availability...
✅ All component files found
ℹ️  Checking if application restart is needed...
ℹ️  Next.js dev server detected, changes will auto-reload
ℹ️  Generating deployment report...
✅ Deployment report generated: .deploy-report.txt
✅ Dashboard deployment completed successfully!
```

### 2. Validate Command
**Purpose**: Runs all validation checks without deploying changes

**Validations Performed**:
- YAML syntax validation using `yq`
- Required field presence check
- Layout type validation
- Component ID and type validation
- Position boundary checking
- Grid overlap detection

**Example**:
```bash
./scripts/deploy-changes.sh validate
```

**Use Cases**:
- Pre-deployment testing
- Configuration troubleshooting
- Continuous integration checks

### 3. Backup Command
**Purpose**: Creates a timestamped backup of current configuration

**Backup Details**:
- Location: `/src/pages/dashboard/.backups/`
- Format: `deploy_backup_YYYYMMDD_HHMMSS.yaml`
- Retention: Last 10 backups automatically kept

**Example**:
```bash
./scripts/deploy-changes.sh backup
```

### 4. Rollback Command
**Purpose**: Restores configuration from the most recent backup

**Process**:
1. Identifies latest backup file
2. Replaces current config.yaml with backup
3. Logs rollback operation

**Example**:
```bash
./scripts/deploy-changes.sh rollback
```

**Safety Note**: Only use rollback when current configuration is broken or needs to be reverted.

### 5. Test Command
**Purpose**: Verifies that all referenced components exist as files

**Checks**:
- Component file existence in `/components/` directory
- TypeScript file extensions (.tsx)
- Reports missing components as warnings

**Example**:
```bash
./scripts/deploy-changes.sh test
```

### 6. Report Command
**Purpose**: Generates detailed deployment report without full deployment

**Report Contents**:
- Configuration summary
- Component listing with positions
- Theme color values
- Grid layout details

**Example**:
```bash
./scripts/deploy-changes.sh report
```

## Validation Details

### YAML Syntax Validation
**Tool**: Uses `yq` for YAML parsing and validation

**Automatic Installation**: Script attempts to install `yq` if not found:
- Via npm: `npm install -g yq`
- Via Homebrew: `brew install yq`

**Validation Process**:
```bash
yq eval '.' "$CONFIG_FILE" >/dev/null 2>&1
```

### Schema Validation
**Required Fields Checked**:
- `page.title` - Page title string
- `page.route` - Page route path
- `layout.type` - Layout type (grid, flex, custom)
- `theme.colors` - Theme color definitions
- `components` - Component array

**Layout Type Validation**:
- Must be one of: `grid`, `flex`, `custom`
- Case-sensitive validation

**Component Validation**:
- Each component must have `id` and `type` fields
- IDs must be unique
- Types must be valid component names

### Position Validation
**Grid Boundary Checking**:
- Validates column + span does not exceed max columns
- Default max columns: 12 (configurable in layout.columns)
- Prevents components from extending beyond grid

**Conflict Detection**:
- Checks for overlapping component positions
- Warns about potential conflicts
- Simplified algorithm for basic conflict detection

**Example Validation Error**:
```
❌ Component quickstart extends beyond grid boundaries
```

## Backup System

### Backup Creation
**Automatic Triggers**:
- Every deployment operation
- Manual backup command
- Before rollback operations

**Backup Naming**:
```
deploy_backup_YYYYMMDD_HHMMSS.yaml
```

**Example**:
```
deploy_backup_20250701_143022.yaml
```

### Backup Management
**Retention Policy**:
- Keeps last 10 backups automatically
- Older backups are automatically removed
- Manual cleanup of excess backups

**Storage Location**:
```
src/pages/dashboard/.backups/
├── deploy_backup_20250701_143022.yaml
├── deploy_backup_20250701_142815.yaml
├── deploy_backup_20250701_141203.yaml
└── ...
```

### Rollback Process
1. **Identify Latest Backup**: Finds most recent backup file
2. **Validate Backup**: Ensures backup file exists and is readable
3. **Replace Configuration**: Copies backup to config.yaml
4. **Log Operation**: Records rollback action with timestamp

## Logging System

### Log File Location
```
src/pages/dashboard/.deploy.log
```

### Log Levels
- **ERROR** (❌): Critical failures that stop deployment
- **WARNING** (⚠️): Non-critical issues that allow deployment to continue
- **SUCCESS** (✅): Successful operations and validations
- **INFO** (ℹ️): General information about process steps

### Log Format
```
[YYYY-MM-DD HH:MM:SS] [LEVEL] Message
```

### Example Log Output
```
[2025-07-01 14:30:22] [INFO] Deploy script started
[2025-07-01 14:30:22] [INFO] Validating YAML configuration...
[2025-07-01 14:30:23] [SUCCESS] YAML validation passed
[2025-07-01 14:30:23] [INFO] Validating configuration schema...
[2025-07-01 14:30:23] [SUCCESS] Schema validation passed
```

### Log Viewing
```bash
# View recent logs
tail -n 50 .deploy.log

# Follow logs in real-time
tail -f .deploy.log

# Search for errors
grep "ERROR" .deploy.log
```

## Deployment Report

### Report Generation
**Automatic**: Generated at end of successful deployments
**Manual**: Can be generated independently with report command

### Report Location
```
src/pages/dashboard/.deploy-report.txt
```

### Report Contents
**Configuration Summary**:
- Page title and route
- Layout type and grid columns
- Total component count

**Component Details**:
- Component ID and type
- Grid position (row, column)
- Span information

**Theme Information**:
- Color definitions
- Typography settings (if configured)

### Example Report
```
Dashboard Deployment Report
==========================
Date: Mon Jul  1 14:30:25 PDT 2025
Config File: /Users/.../dashboard/config.yaml

Configuration Summary:
- Page Title: Dashboard
- Layout Type: grid
- Grid Columns: 12
- Component Count: 6

Components:
- welcome (WelcomeHeader) at row 1, col 1
- quickstart (QuickStartCard) at row 2, col 1
- database-link (DatabaseLinkCard) at row 2, col 5
- tasks-link (TasksLinkCard) at row 2, col 9
- kpi-cards (KPICards) at row 3, col 1
- main-content (DashboardContainer) at row 4, col 1

Theme Colors:
- primary: #3b82f6
- secondary: #64748b
- accent: #8b5cf6
- background: #ffffff
- text: #1e293b

Deployment Status: SUCCESS
```

## Application Integration

### Next.js Server Detection
**Development Mode**: Auto-detects Next.js dev server (`next dev`)
- Changes reload automatically
- No manual restart required

**Production Mode**: Detects production server (`next start`)
- Manual restart may be required
- Warning displayed to user

**No Server**: No active Next.js process detected
- Information logged for user awareness

### Process Detection Commands
```bash
# Check for development server
pgrep -f "next dev"

# Check for production server
pgrep -f "next start"
```

## Error Handling and Recovery

### Common Error Scenarios

#### 1. YAML Syntax Errors
**Error**: Malformed YAML in config.yaml
**Detection**: yq parsing failure
**Recovery**: Fix YAML syntax or rollback to previous version

**Example Error**:
```
❌ YAML validation failed
```

#### 2. Missing Required Fields
**Error**: Configuration missing required schema fields
**Detection**: Schema validation
**Recovery**: Add missing fields or restore from backup

**Example Error**:
```
❌ Missing required field: page.title
```

#### 3. Invalid Layout Type
**Error**: Layout type not in allowed values
**Detection**: Schema validation
**Recovery**: Set layout.type to 'grid', 'flex', or 'custom'

**Example Error**:
```
❌ Invalid layout type: invalid-layout
```

#### 4. Grid Boundary Violations
**Error**: Component extends beyond grid boundaries
**Detection**: Position validation
**Recovery**: Adjust component position or span

**Example Error**:
```
❌ Component quickstart extends beyond grid boundaries
```

#### 5. Missing Component Files
**Error**: Referenced component file doesn't exist
**Detection**: Component testing
**Result**: Warning (deployment continues)

**Example Warning**:
```
⚠️  Component file not found: CustomComponent.tsx
```

### Recovery Procedures

#### Immediate Rollback
```bash
# Quick rollback to previous working configuration
./scripts/deploy-changes.sh rollback
```

#### Manual Configuration Fix
1. Check error messages in log output
2. Edit config.yaml to fix issues
3. Run validation before deployment:
```bash
./scripts/deploy-changes.sh validate
```

#### Backup Restoration
```bash
# List available backups
ls -la .backups/

# Manually restore specific backup
cp .backups/deploy_backup_YYYYMMDD_HHMMSS.yaml config.yaml
```

## Best Practices for AI Agents

### Pre-Deployment Checklist
1. **Always validate first**: Run validation before deployment
2. **Check current state**: Review existing configuration
3. **Understand changes**: Know what modifications are being deployed
4. **Have rollback plan**: Be prepared to rollback if needed

### Safe Deployment Workflow
```bash
# 1. Validate configuration
./scripts/deploy-changes.sh validate

# 2. Create explicit backup (optional, but recommended)
./scripts/deploy-changes.sh backup

# 3. Deploy changes
./scripts/deploy-changes.sh deploy

# 4. Verify deployment success
./scripts/deploy-changes.sh report
```

### Troubleshooting Steps
1. **Check logs**: Review .deploy.log for detailed error information
2. **Validate configuration**: Run validate command to identify issues
3. **Test components**: Verify all referenced components exist
4. **Check syntax**: Ensure YAML is properly formatted
5. **Rollback if needed**: Use rollback command for quick recovery

### Component Testing
```bash
# Test component availability before deployment
./scripts/deploy-changes.sh test
```

### Monitoring Deployment Success
```bash
# Check deployment logs
tail -n 20 .deploy.log

# View deployment report
cat .deploy-report.txt

# Verify configuration is valid
./scripts/deploy-changes.sh validate
```

## Integration with Other Scripts

### Workflow Integration
The deploy-changes.sh script is typically the final step in dashboard modification workflows:

1. **add-component.ts** → Modify configuration → **deploy-changes.sh**
2. **change-theme.ts** → Update theme → **deploy-changes.sh**
3. **update-layout.sh** → Adjust layout → **deploy-changes.sh**

### Script Dependencies
- **yq**: YAML processing tool (auto-installed if missing)
- **bash**: Shell environment (standard on Unix systems)
- **basic Unix tools**: ls, tail, grep, date, mkdir

### File Dependencies
- **config.yaml**: Main configuration file (required)
- **.backups/**: Backup directory (created if missing)
- **.deploy.log**: Log file (created if missing)

## Advanced Usage

### Batch Operations
**Multiple validations**:
```bash
# Validate configuration after each change
./scripts/deploy-changes.sh validate && \
echo "Config valid" || echo "Config invalid"
```

**Conditional deployment**:
```bash
# Deploy only if validation passes
./scripts/deploy-changes.sh validate && \
./scripts/deploy-changes.sh deploy
```

### Custom Validation Scripts
**Integration with CI/CD**:
```bash
# Exit with error code if validation fails
if ! ./scripts/deploy-changes.sh validate; then
    echo "Deployment blocked by validation failure"
    exit 1
fi
```

### Backup Management
**Manual backup cleanup**:
```bash
# Remove backups older than 7 days
find .backups/ -name "deploy_backup_*.yaml" -mtime +7 -delete
```

**Backup verification**:
```bash
# Verify backup integrity
for backup in .backups/deploy_backup_*.yaml; do
    if yq eval '.' "$backup" >/dev/null 2>&1; then
        echo "✅ $backup is valid"
    else
        echo "❌ $backup is corrupted"
    fi
done
```

## Configuration Examples

### Successful Deployment Configuration
```yaml
page:
  title: "Dashboard"
  route: "/dashboard"

layout:
  type: "grid"
  columns: 12
  gap: "1rem"
  padding: "1rem"

theme:
  colors:
    primary: "#3b82f6"
    secondary: "#64748b"
    accent: "#8b5cf6"
    background: "#ffffff"
    text: "#1e293b"

components:
  - id: "welcome"
    type: "WelcomeHeader"
    position:
      row: 1
      col: 1
      span: 12
  - id: "quickstart"
    type: "QuickStartCard"
    position:
      row: 2
      col: 1
      span: 4
```

### Common Configuration Errors

#### Missing Required Fields
```yaml
# ❌ Missing page.title
page:
  route: "/dashboard"
layout:
  type: "grid"
# Missing theme.colors and components
```

#### Invalid Layout Type
```yaml
page:
  title: "Dashboard"
  route: "/dashboard"
layout:
  type: "invalid-layout"  # ❌ Invalid type
```

#### Grid Boundary Violation
```yaml
layout:
  columns: 12
components:
  - id: "wide-component"
    type: "WideComponent"
    position:
      col: 10
      span: 5  # ❌ 10 + 5 - 1 = 14 > 12 columns
```

## Summary
The `deploy-changes.sh` script provides a comprehensive, safe deployment system for dashboard configuration changes. Its multi-layer validation, automatic backup creation, and detailed logging make it an essential tool for AI agents working with the dashboard system. By following the validation-first approach and utilizing the rollback capabilities, agents can confidently deploy changes while maintaining system stability and recoverability.

The script's integration with the broader automation ecosystem makes it the perfect final step in any dashboard modification workflow, ensuring that all changes are properly validated, backed up, and safely applied to the dashboard system.