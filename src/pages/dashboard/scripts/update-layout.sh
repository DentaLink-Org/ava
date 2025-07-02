#!/bin/bash

# Dashboard Layout Update Script
# Modifies the dashboard page layout configuration

set -e

DASHBOARD_CONFIG="/Users/derakhshani/Documents/GitHub/personal/claude_dashboard/src/pages/dashboard/config.yaml"
BACKUP_DIR="/Users/derakhshani/Documents/GitHub/personal/claude_dashboard/src/pages/dashboard/.backups"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Function to backup current config
backup_config() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    cp "$DASHBOARD_CONFIG" "$BACKUP_DIR/config_backup_$timestamp.yaml"
    echo "✅ Config backed up to: config_backup_$timestamp.yaml"
}

# Function to validate YAML
validate_yaml() {
    if command -v yq >/dev/null 2>&1; then
        yq eval '.' "$DASHBOARD_CONFIG" >/dev/null
        echo "✅ YAML validation passed"
    else
        echo "⚠️  yq not found - skipping YAML validation"
    fi
}

# Function to update grid columns
update_columns() {
    local columns=$1
    if [[ $columns -lt 1 || $columns -gt 24 ]]; then
        echo "❌ Error: Columns must be between 1 and 24"
        exit 1
    fi
    
    backup_config
    
    # Use sed to update columns in YAML
    sed -i.tmp "s/columns: [0-9]*/columns: $columns/" "$DASHBOARD_CONFIG"
    rm "$DASHBOARD_CONFIG.tmp"
    
    validate_yaml
    echo "✅ Updated grid columns to: $columns"
}

# Function to update gap
update_gap() {
    local gap=$1
    if [[ $gap -lt 0 || $gap -gt 20 ]]; then
        echo "❌ Error: Gap must be between 0 and 20"
        exit 1
    fi
    
    backup_config
    
    sed -i.tmp "s/gap: [0-9]*/gap: $gap/" "$DASHBOARD_CONFIG"
    rm "$DASHBOARD_CONFIG.tmp"
    
    validate_yaml
    echo "✅ Updated grid gap to: $gap"
}

# Function to update padding
update_padding() {
    local padding=$1
    if [[ $padding -lt 0 || $padding -gt 20 ]]; then
        echo "❌ Error: Padding must be between 0 and 20"
        exit 1
    fi
    
    backup_config
    
    sed -i.tmp "s/padding: [0-9]*/padding: $padding/" "$DASHBOARD_CONFIG"
    rm "$DASHBOARD_CONFIG.tmp"
    
    validate_yaml
    echo "✅ Updated padding to: $padding"
}

# Function to update layout type
update_layout_type() {
    local layout_type=$1
    if [[ ! "$layout_type" =~ ^(grid|flex|custom)$ ]]; then
        echo "❌ Error: Layout type must be 'grid', 'flex', or 'custom'"
        exit 1
    fi
    
    backup_config
    
    sed -i.tmp "s/type: \"[^\"]*\"/type: \"$layout_type\"/" "$DASHBOARD_CONFIG"
    rm "$DASHBOARD_CONFIG.tmp"
    
    validate_yaml
    echo "✅ Updated layout type to: $layout_type"
}

# Main script logic
case "$1" in
    "columns")
        update_columns "$2"
        ;;
    "gap")
        update_gap "$2"
        ;;
    "padding")
        update_padding "$2"
        ;;
    "type")
        update_layout_type "$2"
        ;;
    "backup")
        backup_config
        ;;
    "validate")
        validate_yaml
        ;;
    *)
        echo "Dashboard Layout Update Script"
        echo ""
        echo "Usage: $0 <command> [value]"
        echo ""
        echo "Commands:"
        echo "  columns <1-24>     Update grid columns"
        echo "  gap <0-20>         Update grid gap"
        echo "  padding <0-20>     Update padding"
        echo "  type <grid|flex|custom>  Update layout type"
        echo "  backup             Create config backup"
        echo "  validate           Validate current config"
        echo ""
        echo "Examples:"
        echo "  $0 columns 16      # Set 16 columns"
        echo "  $0 gap 6           # Set gap to 6"
        echo "  $0 padding 8       # Set padding to 8"
        echo "  $0 type flex       # Change to flex layout"
        exit 1
        ;;
esac

echo "🎉 Dashboard layout update complete!"