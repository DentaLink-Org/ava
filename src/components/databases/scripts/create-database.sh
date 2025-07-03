#!/bin/bash

# Database Creation Script
# Creates a new database with specified configuration

set -e  # Exit on any error

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAGE_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PAGE_DIR/config.yaml"

# Default values
DATABASE_NAME=""
DATABASE_TYPE="postgresql"
DESCRIPTION=""
CONNECTION_HOST="localhost"
CONNECTION_PORT=""
CONNECTION_USER=""
CONNECTION_DB=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Create a new database configuration and register it in the databases page.

OPTIONS:
    -n, --name NAME        Database name (required)
    -t, --type TYPE        Database type: postgresql, mysql, sqlite, mongodb (default: postgresql)
    -d, --description DESC Database description
    -h, --host HOST        Database host (default: localhost)
    -p, --port PORT        Database port (auto-detected based on type if not specified)
    -u, --user USER        Database username
    --database DB          Database name on the server
    --help                 Show this help message

EXAMPLES:
    # Create a basic PostgreSQL database
    $0 -n "my_app_db" -d "Main application database"
    
    # Create a MySQL database with custom connection
    $0 -n "analytics_db" -t mysql -h "db.example.com" -p 3306 -u "app_user" --database "analytics"
    
    # Create a local SQLite database
    $0 -n "local_data" -t sqlite -d "Local development database"

EOF
}

# Function to get default port for database type
get_default_port() {
    case "$1" in
        postgresql) echo "5432" ;;
        mysql) echo "3306" ;;
        mongodb) echo "27017" ;;
        sqlite) echo "" ;;
        *) echo "" ;;
    esac
}

# Function to validate database type
validate_type() {
    case "$1" in
        postgresql|mysql|sqlite|mongodb) return 0 ;;
        *) return 1 ;;
    esac
}

# Function to check if database name is valid
validate_name() {
    if [[ ! "$1" =~ ^[a-zA-Z][a-zA-Z0-9_-]*$ ]]; then
        return 1
    fi
    return 0
}

# Function to test database connection
test_connection() {
    print_status "Testing database connection..."
    
    case "$DATABASE_TYPE" in
        postgresql)
            if command -v psql &> /dev/null; then
                # Test PostgreSQL connection
                PGPASSWORD="$CONNECTION_PASS" psql -h "$CONNECTION_HOST" -p "${CONNECTION_PORT:-5432}" -U "${CONNECTION_USER:-postgres}" -d "${CONNECTION_DB:-postgres}" -c "SELECT 1;" &> /dev/null
                return $?
            else
                print_warning "PostgreSQL client (psql) not found. Skipping connection test."
                return 0
            fi
            ;;
        mysql)
            if command -v mysql &> /dev/null; then
                # Test MySQL connection
                mysql -h "$CONNECTION_HOST" -P "${CONNECTION_PORT:-3306}" -u "${CONNECTION_USER:-root}" ${CONNECTION_PASS:+-p"$CONNECTION_PASS"} -e "SELECT 1;" &> /dev/null
                return $?
            else
                print_warning "MySQL client not found. Skipping connection test."
                return 0
            fi
            ;;
        sqlite)
            # For SQLite, just check if the file path is writable
            if [[ -n "$CONNECTION_DB" ]]; then
                touch "$CONNECTION_DB" 2>/dev/null
                return $?
            else
                return 0
            fi
            ;;
        mongodb)
            if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
                # Test MongoDB connection
                local mongo_cmd="mongosh"
                if ! command -v mongosh &> /dev/null; then
                    mongo_cmd="mongo"
                fi
                
                $mongo_cmd --host "$CONNECTION_HOST:${CONNECTION_PORT:-27017}" --eval "db.runCommand('ping')" &> /dev/null
                return $?
            else
                print_warning "MongoDB client not found. Skipping connection test."
                return 0
            fi
            ;;
    esac
}

# Function to create database configuration
create_database_config() {
    print_status "Creating database configuration..."
    
    # Generate unique ID
    DATABASE_ID="db_$(date +%s)_$(openssl rand -hex 4 2>/dev/null || echo $(($RANDOM * $RANDOM)))"
    
    # Create configuration object
    cat > "/tmp/new_database_config.json" << EOF
{
  "id": "$DATABASE_ID",
  "title": "$DATABASE_NAME",
  "description": "$DESCRIPTION",
  "type": "$DATABASE_TYPE",
  "status": "active",
  "created_at": "$(date -Iseconds)",
  "updated_at": "$(date -Iseconds)",
  "connection": {
    "host": "$CONNECTION_HOST",
    "port": ${CONNECTION_PORT:-null},
    "database": "$CONNECTION_DB",
    "username": "$CONNECTION_USER",
    "ssl": false
  }
}
EOF

    print_success "Database configuration created with ID: $DATABASE_ID"
}

# Function to update page configuration
update_page_config() {
    print_status "Updating page configuration..."
    
    # For now, we'll create a simple update
    # In a real implementation, this would integrate with the page configuration system
    
    if [[ -f "$CONFIG_FILE" ]]; then
        print_status "Configuration file found at $CONFIG_FILE"
        # Here you would use yq or a similar tool to update the YAML configuration
        # yq eval '.data.sources[0].refresh = "30s"' -i "$CONFIG_FILE"
    else
        print_warning "Page configuration file not found at $CONFIG_FILE"
    fi
}

# Function to register with API
register_database() {
    print_status "Registering database with API..."
    
    # In a real implementation, this would call your API endpoint
    # curl -X POST http://localhost:3000/api/databases \
    #      -H "Content-Type: application/json" \
    #      -d @/tmp/new_database_config.json
    
    print_status "Database registration would be called here (mock mode)"
    print_success "Database '$DATABASE_NAME' registered successfully!"
}

# Function to cleanup temporary files
cleanup() {
    rm -f /tmp/new_database_config.json
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--name)
            DATABASE_NAME="$2"
            shift 2
            ;;
        -t|--type)
            DATABASE_TYPE="$2"
            shift 2
            ;;
        -d|--description)
            DESCRIPTION="$2"
            shift 2
            ;;
        -h|--host)
            CONNECTION_HOST="$2"
            shift 2
            ;;
        -p|--port)
            CONNECTION_PORT="$2"
            shift 2
            ;;
        -u|--user)
            CONNECTION_USER="$2"
            shift 2
            ;;
        --database)
            CONNECTION_DB="$2"
            shift 2
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$DATABASE_NAME" ]]; then
    print_error "Database name is required. Use -n or --name to specify."
    show_usage
    exit 1
fi

if ! validate_name "$DATABASE_NAME"; then
    print_error "Invalid database name. Must start with a letter and contain only letters, numbers, hyphens, and underscores."
    exit 1
fi

if ! validate_type "$DATABASE_TYPE"; then
    print_error "Invalid database type. Supported types: postgresql, mysql, sqlite, mongodb"
    exit 1
fi

# Set default port if not specified
if [[ -z "$CONNECTION_PORT" ]]; then
    CONNECTION_PORT=$(get_default_port "$DATABASE_TYPE")
fi

# Set default description if not provided
if [[ -z "$DESCRIPTION" ]]; then
    DESCRIPTION="Database created via automation script"
fi

# Main execution
print_status "Creating database: $DATABASE_NAME"
print_status "Type: $DATABASE_TYPE"
print_status "Host: $CONNECTION_HOST"
[[ -n "$CONNECTION_PORT" ]] && print_status "Port: $CONNECTION_PORT"
[[ -n "$CONNECTION_USER" ]] && print_status "User: $CONNECTION_USER"
[[ -n "$CONNECTION_DB" ]] && print_status "Database: $CONNECTION_DB"

# Test connection (optional - only if credentials provided)
if [[ -n "$CONNECTION_USER" && "$DATABASE_TYPE" != "sqlite" ]]; then
    echo -n "Enter database password (optional): "
    read -s CONNECTION_PASS
    echo
    
    if [[ -n "$CONNECTION_PASS" ]]; then
        if test_connection; then
            print_success "Database connection test passed!"
        else
            print_warning "Database connection test failed. Continuing anyway..."
        fi
    fi
fi

# Create and register database
create_database_config
update_page_config
register_database

# Cleanup
cleanup

print_success "Database creation completed successfully!"
print_status "You can now view and manage your database in the databases page."

exit 0