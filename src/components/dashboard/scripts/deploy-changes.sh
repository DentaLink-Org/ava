#!/bin/bash

# Dashboard Changes Deployment Script
# Validates, tests, and applies dashboard changes safely

set -e

DASHBOARD_DIR="/Users/derakhshani/Documents/GitHub/personal/claude_dashboard/src/pages/dashboard"
CONFIG_FILE="$DASHBOARD_DIR/config.yaml"
BACKUP_DIR="$DASHBOARD_DIR/.backups"
LOG_FILE="$DASHBOARD_DIR/.deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    case $level in
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
        *)
            echo "$message"
            ;;
    esac
}

# Initialize log file
init_log() {
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "=== Dashboard Deploy Started at $(date) ===" >> "$LOG_FILE"
    log "INFO" "Deploy script started"
}

# Validate YAML configuration
validate_yaml() {
    log "INFO" "Validating YAML configuration..."
    
    if ! command -v yq >/dev/null 2>&1; then
        log "WARNING" "yq not found, installing..."
        if command -v npm >/dev/null 2>&1; then
            npm install -g yq
        elif command -v brew >/dev/null 2>&1; then
            brew install yq
        else
            log "ERROR" "Cannot install yq. Please install manually."
            return 1
        fi
    fi
    
    if yq eval '.' "$CONFIG_FILE" >/dev/null 2>&1; then
        log "SUCCESS" "YAML validation passed"
        return 0
    else
        log "ERROR" "YAML validation failed"
        return 1
    fi
}

# Validate configuration schema
validate_schema() {
    log "INFO" "Validating configuration schema..."
    
    # Check required fields
    local required_fields=("page.title" "page.route" "layout.type" "theme.colors" "components")
    
    for field in "${required_fields[@]}"; do
        if ! yq eval ".$field" "$CONFIG_FILE" >/dev/null 2>&1; then
            log "ERROR" "Missing required field: $field"
            return 1
        fi
    done
    
    # Validate layout type
    local layout_type=$(yq eval '.layout.type' "$CONFIG_FILE")
    if [[ ! "$layout_type" =~ ^(grid|flex|custom)$ ]]; then
        log "ERROR" "Invalid layout type: $layout_type"
        return 1
    fi
    
    # Validate components have required fields
    local component_count=$(yq eval '.components | length' "$CONFIG_FILE")
    for ((i=0; i<component_count; i++)); do
        local component_id=$(yq eval ".components[$i].id" "$CONFIG_FILE")
        local component_type=$(yq eval ".components[$i].type" "$CONFIG_FILE")
        
        if [[ "$component_id" == "null" || "$component_type" == "null" ]]; then
            log "ERROR" "Component $i missing id or type"
            return 1
        fi
    done
    
    log "SUCCESS" "Schema validation passed"
    return 0
}

# Check for position conflicts
validate_positions() {
    log "INFO" "Validating component positions..."
    
    # Extract positions and check for conflicts
    local positions=$(yq eval '.components[] | .position | "\(.row),\(.col),\(.span)"' "$CONFIG_FILE")
    local conflicts=0
    
    # This is a simplified check - real implementation would be more complex
    if [[ $(echo "$positions" | sort | uniq -d | wc -l) -gt 0 ]]; then
        log "WARNING" "Potential position conflicts detected"
        conflicts=1
    fi
    
    # Check grid boundaries
    local max_columns=$(yq eval '.layout.columns // 12' "$CONFIG_FILE")
    local component_count=$(yq eval '.components | length' "$CONFIG_FILE")
    
    for ((i=0; i<component_count; i++)); do
        local col=$(yq eval ".components[$i].position.col" "$CONFIG_FILE")
        local span=$(yq eval ".components[$i].position.span" "$CONFIG_FILE")
        
        if [[ $((col + span - 1)) -gt $max_columns ]]; then
            log "ERROR" "Component $i extends beyond grid boundaries"
            return 1
        fi
    done
    
    if [[ $conflicts -eq 0 ]]; then
        log "SUCCESS" "Position validation passed"
    else
        log "WARNING" "Position validation passed with warnings"
    fi
    
    return 0
}

# Test component loading
test_components() {
    log "INFO" "Testing component availability..."
    
    # Check if all referenced components exist
    local components=$(yq eval '.components[].type' "$CONFIG_FILE")
    local component_files_exist=0
    
    while IFS= read -r component_type; do
        local component_file="$DASHBOARD_DIR/components/${component_type}.tsx"
        if [[ ! -f "$component_file" ]]; then
            log "WARNING" "Component file not found: ${component_type}.tsx"
            component_files_exist=1
        fi
    done <<< "$components"
    
    if [[ $component_files_exist -eq 0 ]]; then
        log "SUCCESS" "All component files found"
    else
        log "WARNING" "Some component files missing (components may be registered elsewhere)"
    fi
    
    return 0
}

# Create deployment backup
create_backup() {
    log "INFO" "Creating deployment backup..."
    
    mkdir -p "$BACKUP_DIR"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$BACKUP_DIR/deploy_backup_$timestamp.yaml"
    
    cp "$CONFIG_FILE" "$backup_file"
    log "SUCCESS" "Backup created: deploy_backup_$timestamp.yaml"
    
    # Keep only last 10 backups
    cd "$BACKUP_DIR"
    ls -t deploy_backup_*.yaml | tail -n +11 | xargs -r rm
    log "INFO" "Cleaned old backups (keeping last 10)"
}

# Restart application (if needed)
restart_app() {
    log "INFO" "Checking if application restart is needed..."
    
    # Check if Next.js dev server is running
    if pgrep -f "next dev" >/dev/null; then
        log "INFO" "Next.js dev server detected, changes will auto-reload"
    elif pgrep -f "next start" >/dev/null; then
        log "WARNING" "Production Next.js server detected"
        log "INFO" "Manual restart may be required for changes to take effect"
    else
        log "INFO" "No Next.js server detected"
    fi
    
    return 0
}

# Generate deployment report
generate_report() {
    log "INFO" "Generating deployment report..."
    
    local report_file="$DASHBOARD_DIR/.deploy-report.txt"
    
    cat > "$report_file" << EOF
Dashboard Deployment Report
==========================
Date: $(date)
Config File: $CONFIG_FILE

Configuration Summary:
- Page Title: $(yq eval '.page.title' "$CONFIG_FILE")
- Layout Type: $(yq eval '.layout.type' "$CONFIG_FILE")
- Grid Columns: $(yq eval '.layout.columns // 12' "$CONFIG_FILE")
- Component Count: $(yq eval '.components | length' "$CONFIG_FILE")

Components:
$(yq eval '.components[] | "- \(.id) (\(.type)) at row \(.position.row), col \(.position.col)"' "$CONFIG_FILE")

Theme Colors:
$(yq eval '.theme.colors | to_entries[] | "- \(.key): \(.value)"' "$CONFIG_FILE")

Deployment Status: SUCCESS
EOF

    log "SUCCESS" "Deployment report generated: .deploy-report.txt"
}

# Rollback to previous version
rollback() {
    log "INFO" "Rolling back to previous version..."
    
    local latest_backup=$(ls -t "$BACKUP_DIR"/deploy_backup_*.yaml 2>/dev/null | head -n 1)
    
    if [[ -z "$latest_backup" ]]; then
        log "ERROR" "No backup found for rollback"
        return 1
    fi
    
    cp "$latest_backup" "$CONFIG_FILE"
    log "SUCCESS" "Rolled back to: $(basename "$latest_backup")"
    
    return 0
}

# Main deployment function
deploy() {
    log "INFO" "Starting dashboard deployment process..."
    
    # Pre-deployment validations
    if ! validate_yaml; then
        log "ERROR" "YAML validation failed, aborting deployment"
        return 1
    fi
    
    if ! validate_schema; then
        log "ERROR" "Schema validation failed, aborting deployment"
        return 1
    fi
    
    if ! validate_positions; then
        log "ERROR" "Position validation failed, aborting deployment"
        return 1
    fi
    
    # Create backup before deployment
    create_backup
    
    # Test components
    test_components
    
    # Application restart (if needed)
    restart_app
    
    # Generate report
    generate_report
    
    log "SUCCESS" "Dashboard deployment completed successfully!"
    log "INFO" "View deployment report: cat $DASHBOARD_DIR/.deploy-report.txt"
    
    return 0
}

# Command line interface
case "${1:-deploy}" in
    "deploy")
        init_log
        deploy
        ;;
    "validate")
        init_log
        log "INFO" "Running validation only..."
        validate_yaml && validate_schema && validate_positions
        ;;
    "backup")
        init_log
        create_backup
        ;;
    "rollback")
        init_log
        rollback
        ;;
    "test")
        init_log
        test_components
        ;;
    "report")
        generate_report
        ;;
    "help"|"--help"|"-h")
        echo "Dashboard Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy     Run full deployment (default)"
        echo "  validate   Run validation checks only"
        echo "  backup     Create configuration backup"
        echo "  rollback   Rollback to previous version"
        echo "  test       Test component availability"
        echo "  report     Generate deployment report"
        echo "  help       Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 deploy     # Full deployment"
        echo "  $0 validate   # Validation only"
        echo "  $0 rollback   # Emergency rollback"
        ;;
    *)
        log "ERROR" "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac