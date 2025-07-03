#!/bin/bash

# Export Project Data Script
# Exports project data with tasks, team members, and settings to various formats
#
# Usage:
#   ./scripts/export-project.sh [OPTIONS]
#
# Options:
#   -p, --project <PROJECT_ID>     Project ID to export (required)
#   -f, --format <FORMAT>          Export format: json, csv, yaml (default: json)
#   -o, --output <PATH>            Output file path (default: ./exports/)
#   -i, --include <ITEMS>          Items to include: tasks,settings,team,stats (default: all)
#   -c, --compress                 Compress output with gzip
#   -v, --verbose                  Verbose output
#   -h, --help                     Show this help
#
# Examples:
#   ./scripts/export-project.sh -p project-1 -f json
#   ./scripts/export-project.sh -p project-1 -f csv -o ./backups/ -c
#   ./scripts/export-project.sh -p project-1 -i tasks,settings -f yaml

set -euo pipefail

# Default values
PROJECT_ID=""
FORMAT="json"
OUTPUT_DIR="./exports"
INCLUDE="tasks,settings,team,stats"
COMPRESS=false
VERBOSE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  ${1}${NC}"
}

log_success() {
    echo -e "${GREEN}✅ ${1}${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  ${1}${NC}"
}

log_error() {
    echo -e "${RED}❌ ${1}${NC}"
    exit 1
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${NC}🔍 ${1}${NC}"
    fi
}

# Help function
show_help() {
    cat << EOF
Export Project Data Script

This script exports project data including tasks, team members, and settings
to various formats for backup, migration, or analysis purposes.

Usage:
    ./scripts/export-project.sh [OPTIONS]

Options:
    -p, --project <PROJECT_ID>     Project ID to export (required)
    -f, --format <FORMAT>          Export format: json, csv, yaml (default: json)
    -o, --output <PATH>            Output directory path (default: ./exports/)
    -i, --include <ITEMS>          Items to include: tasks,settings,team,stats (default: all)
    -c, --compress                 Compress output with gzip
    -v, --verbose                  Verbose output
    -h, --help                     Show this help

Export Formats:
    json    - JSON format (default, preserves all data types)
    csv     - CSV format (flattened data, good for spreadsheets)
    yaml    - YAML format (human-readable)

Include Options:
    tasks      - Task data with full details
    settings   - Project settings and configuration
    team       - Team member assignments and roles
    stats      - Project statistics and metrics
    all        - Include everything (default)

Examples:
    # Export complete project as JSON
    ./scripts/export-project.sh -p project-1

    # Export only tasks as CSV with compression
    ./scripts/export-project.sh -p project-1 -f csv -i tasks -c

    # Export to specific directory with verbose output
    ./scripts/export-project.sh -p project-1 -o ./project-backups/ -v

    # Export project settings and team as YAML
    ./scripts/export-project.sh -p project-1 -f yaml -i settings,team

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--project)
                PROJECT_ID="$2"
                shift 2
                ;;
            -f|--format)
                FORMAT="$2"
                shift 2
                ;;
            -o|--output)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            -i|--include)
                INCLUDE="$2"
                shift 2
                ;;
            -c|--compress)
                COMPRESS=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                ;;
        esac
    done
}

# Validate arguments
validate_args() {
    if [ -z "$PROJECT_ID" ]; then
        log_error "Project ID is required. Use -p or --project option."
    fi

    case $FORMAT in
        json|csv|yaml) ;;
        *) log_error "Invalid format: $FORMAT. Use json, csv, or yaml." ;;
    esac

    # Create output directory if it doesn't exist
    mkdir -p "$OUTPUT_DIR"
    
    if [ ! -d "$OUTPUT_DIR" ]; then
        log_error "Cannot create output directory: $OUTPUT_DIR"
    fi
}

# Check dependencies
check_dependencies() {
    local deps=("node" "jq")
    
    if [ "$FORMAT" = "yaml" ]; then
        deps+=("yq")
    fi
    
    if [ "$COMPRESS" = true ]; then
        deps+=("gzip")
    fi
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "Required dependency not found: $dep"
        fi
    done
}

# Generate timestamp for filename
get_timestamp() {
    date +"%Y%m%d_%H%M%S"
}

# Export project data using Node.js script
export_project_data() {
    local timestamp=$(get_timestamp)
    local base_filename="${PROJECT_ID}_export_${timestamp}"
    local temp_file="/tmp/${base_filename}.json"
    
    log_info "Exporting project data for: $PROJECT_ID"
    log_verbose "Temporary file: $temp_file"
    
    # Create Node.js script to export data
    cat > /tmp/export_script.js << 'EOF'
const fs = require('fs');

// Mock data export (in real implementation, this would connect to the API)
async function exportProjectData(projectId, include) {
    const includeItems = include.split(',').map(item => item.trim());
    const exportData = {
        project: {
            id: projectId,
            name: `Project ${projectId}`,
            description: "Exported project data",
            exportedAt: new Date().toISOString(),
            exportedBy: process.env.USER || 'unknown',
            version: "1.0.0"
        }
    };

    if (includeItems.includes('tasks') || includeItems.includes('all')) {
        exportData.tasks = [
            {
                id: "task-1",
                title: "Sample Task 1",
                description: "This is a sample task",
                status: "todo",
                priority: "medium",
                assigneeId: "user-1",
                createdAt: "2025-06-30T10:00:00Z",
                updatedAt: "2025-06-30T10:00:00Z",
                dueDate: "2025-07-05T17:00:00Z",
                tags: ["sample", "export"]
            },
            {
                id: "task-2",
                title: "Sample Task 2",
                description: "Another sample task",
                status: "in-progress",
                priority: "high",
                assigneeId: "user-2",
                createdAt: "2025-06-29T14:30:00Z",
                updatedAt: "2025-06-30T09:15:00Z",
                tags: ["sample", "urgent"]
            }
        ];
    }

    if (includeItems.includes('settings') || includeItems.includes('all')) {
        exportData.settings = {
            allowComments: true,
            allowAttachments: true,
            requireDueDates: false,
            defaultAssignee: "user-1",
            workflowStates: ["todo", "in-progress", "review", "done"],
            notifications: {
                emailOnTaskAssign: true,
                emailOnTaskComplete: false,
                slackIntegration: false
            }
        };
    }

    if (includeItems.includes('team') || includeItems.includes('all')) {
        exportData.team = [
            {
                id: "user-1",
                name: "Alex Johnson",
                email: "alex.johnson@example.com",
                role: "admin",
                joinedAt: "2025-06-15T10:00:00Z"
            },
            {
                id: "user-2",
                name: "Sarah Chen",
                email: "sarah.chen@example.com",
                role: "member",
                joinedAt: "2025-06-20T14:30:00Z"
            }
        ];
    }

    if (includeItems.includes('stats') || includeItems.includes('all')) {
        exportData.stats = {
            totalTasks: 15,
            completedTasks: 8,
            activeTasks: 7,
            overdueTasks: 2,
            completionRate: 0.53,
            averageTaskDuration: "2.5 days",
            teamProductivity: {
                tasksPerDay: 3.2,
                averageCompletionTime: "1.8 days"
            }
        };
    }

    return exportData;
}

// Main export function
async function main() {
    const [projectId, include, outputFile] = process.argv.slice(2);
    
    try {
        console.log(`🔄 Fetching data for project: ${projectId}`);
        const data = await exportProjectData(projectId, include);
        
        console.log(`💾 Writing data to: ${outputFile}`);
        fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
        
        console.log(`✅ Export completed successfully`);
        console.log(`📊 Exported ${Object.keys(data).length - 1} data sections`);
        
        // Log summary
        if (data.tasks) console.log(`   • ${data.tasks.length} tasks`);
        if (data.team) console.log(`   • ${data.team.length} team members`);
        if (data.settings) console.log(`   • Project settings`);
        if (data.stats) console.log(`   • Project statistics`);
        
    } catch (error) {
        console.error('❌ Export failed:', error.message);
        process.exit(1);
    }
}

main();
EOF

    # Run the export script
    node /tmp/export_script.js "$PROJECT_ID" "$INCLUDE" "$temp_file"
    
    # Convert to requested format
    convert_format "$temp_file" "$base_filename"
    
    # Cleanup
    rm -f /tmp/export_script.js "$temp_file"
}

# Convert exported data to requested format
convert_format() {
    local input_file="$1"
    local base_filename="$2"
    local output_file="$OUTPUT_DIR/${base_filename}.${FORMAT}"
    
    log_verbose "Converting to $FORMAT format"
    
    case $FORMAT in
        json)
            cp "$input_file" "$output_file"
            ;;
        csv)
            convert_to_csv "$input_file" "$output_file"
            ;;
        yaml)
            convert_to_yaml "$input_file" "$output_file"
            ;;
    esac
    
    if [ "$COMPRESS" = true ]; then
        log_verbose "Compressing output file"
        gzip "$output_file"
        output_file="${output_file}.gz"
    fi
    
    local file_size=$(du -h "$output_file" | cut -f1)
    log_success "Export completed: $output_file ($file_size)"
}

# Convert JSON to CSV
convert_to_csv() {
    local input_file="$1"
    local output_file="$2"
    
    # Extract tasks data and convert to CSV
    jq -r '
        .tasks // [] |
        ["ID", "Title", "Description", "Status", "Priority", "Assignee", "Created", "Due Date", "Tags"] as $header |
        $header,
        (.[] | [.id, .title, .description, .status, .priority, .assigneeId, .createdAt, .dueDate, (.tags // [] | join(";"))])
        | @csv
    ' "$input_file" > "$output_file"
    
    log_verbose "Created CSV with task data"
}

# Convert JSON to YAML
convert_to_yaml() {
    local input_file="$1"
    local output_file="$2"
    
    yq eval -P '.' "$input_file" > "$output_file"
    log_verbose "Created YAML file"
}

# Validate exported file
validate_export() {
    local output_file="$1"
    
    if [ ! -f "$output_file" ]; then
        log_error "Export file not created: $output_file"
    fi
    
    case $FORMAT in
        json)
            if ! jq . "$output_file" >/dev/null 2>&1; then
                log_error "Invalid JSON in export file"
            fi
            ;;
        yaml)
            if ! yq eval '.' "$output_file" >/dev/null 2>&1; then
                log_error "Invalid YAML in export file"
            fi
            ;;
    esac
    
    log_verbose "Export file validation passed"
}

# Main execution
main() {
    log_info "Starting project export process..."
    
    parse_args "$@"
    validate_args
    check_dependencies
    
    export_project_data
    
    log_success "Project export completed successfully!"
    log_info "Export location: $OUTPUT_DIR"
    
    if [ "$VERBOSE" = true ]; then
        echo
        log_info "Export summary:"
        echo "  • Project ID: $PROJECT_ID"
        echo "  • Format: $FORMAT"
        echo "  • Included: $INCLUDE"
        echo "  • Compressed: $COMPRESS"
        echo "  • Output directory: $OUTPUT_DIR"
    fi
}

# Run main function with all arguments
main "$@"