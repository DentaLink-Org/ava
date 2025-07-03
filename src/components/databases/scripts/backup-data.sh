#!/bin/bash

# Database Backup Script
# Creates backups of database data and schema

set -e  # Exit on any error

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAGE_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PAGE_DIR/backups"

# Default values
DATABASE_ID=""
DATABASE_TYPE=""
BACKUP_TYPE="full"
COMPRESSION="gzip"
RETENTION_DAYS=30
OUTPUT_DIR="$BACKUP_DIR"
INCLUDE_SCHEMA=true
INCLUDE_DATA=true

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

Create database backups with various options.

OPTIONS:
    -d, --database-id ID      Database ID (required)
    -t, --type TYPE           Backup type: full, schema, data (default: full)
    -c, --compression METHOD  Compression: gzip, bzip2, none (default: gzip)
    -o, --output DIR          Output directory (default: $BACKUP_DIR)
    -r, --retention DAYS      Retention period in days (default: 30)
    --no-schema               Exclude schema from backup
    --no-data                 Exclude data from backup
    --help                    Show this help message

BACKUP TYPES:
    full    - Complete backup including schema and data
    schema  - Only database schema and structure
    data    - Only table data, no schema

EXAMPLES:
    # Full backup of database
    $0 -d my_app_db

    # Schema-only backup
    $0 -d my_app_db -t schema

    # Data-only backup with bzip2 compression
    $0 -d my_app_db -t data -c bzip2

    # Backup to custom directory
    $0 -d my_app_db -o /custom/backup/path

EOF
}

# Function to create backup directory
ensure_backup_dir() {
    if [[ ! -d "$OUTPUT_DIR" ]]; then
        print_status "Creating backup directory: $OUTPUT_DIR"
        mkdir -p "$OUTPUT_DIR"
    fi
}

# Function to load database configuration
load_database_config() {
    local config_file="$PAGE_DIR/databases/$DATABASE_ID.json"
    
    if [[ ! -f "$config_file" ]]; then
        print_error "Database configuration not found: $config_file"
        exit 1
    fi
    
    # Parse JSON configuration (requires jq or manual parsing)
    if command -v jq &> /dev/null; then
        DATABASE_TYPE=$(jq -r '.type' "$config_file")
        DB_HOST=$(jq -r '.connection.host' "$config_file")
        DB_PORT=$(jq -r '.connection.port' "$config_file")
        DB_NAME=$(jq -r '.connection.database' "$config_file")
        DB_USER=$(jq -r '.connection.username' "$config_file")
    else
        print_warning "jq not found. Using basic JSON parsing."
        DATABASE_TYPE=$(grep '"type"' "$config_file" | cut -d'"' -f4)
        DB_HOST=$(grep '"host"' "$config_file" | cut -d'"' -f4)
        DB_PORT=$(grep '"port"' "$config_file" | cut -d: -f2 | tr -d ' ,')
        DB_NAME=$(grep '"database"' "$config_file" | cut -d'"' -f4)
        DB_USER=$(grep '"username"' "$config_file" | cut -d'"' -f4)
    fi
    
    print_status "Loaded configuration for $DATABASE_TYPE database: $DB_NAME"
}

# Function to get file extension based on compression
get_file_extension() {
    case "$COMPRESSION" in
        gzip) echo ".gz" ;;
        bzip2) echo ".bz2" ;;
        none) echo "" ;;
        *) echo "" ;;
    esac
}

# Function to compress file
compress_file() {
    local file="$1"
    local compressed_file=""
    
    case "$COMPRESSION" in
        gzip)
            compressed_file="${file}.gz"
            print_status "Compressing with gzip..."
            gzip "$file"
            echo "$compressed_file"
            ;;
        bzip2)
            compressed_file="${file}.bz2"
            print_status "Compressing with bzip2..."
            bzip2 "$file"
            echo "$compressed_file"
            ;;
        none)
            echo "$file"
            ;;
        *)
            echo "$file"
            ;;
    esac
}

# Function to backup PostgreSQL database
backup_postgresql() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$OUTPUT_DIR/${DATABASE_ID}_${BACKUP_TYPE}_${timestamp}.sql"
    
    print_status "Creating PostgreSQL backup..."
    
    # Set password from environment or prompt
    if [[ -z "$PGPASSWORD" ]]; then
        echo -n "Enter PostgreSQL password for user $DB_USER: "
        read -s PGPASSWORD
        echo
        export PGPASSWORD
    fi
    
    case "$BACKUP_TYPE" in
        full)
            pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
                --verbose --no-password > "$backup_file"
            ;;
        schema)
            pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
                --schema-only --verbose --no-password > "$backup_file"
            ;;
        data)
            pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
                --data-only --verbose --no-password > "$backup_file"
            ;;
    esac
    
    if [[ $? -eq 0 ]]; then
        local final_file=$(compress_file "$backup_file")
        print_success "PostgreSQL backup completed: $final_file"
        echo "$final_file"
    else
        print_error "PostgreSQL backup failed"
        rm -f "$backup_file"
        exit 1
    fi
}

# Function to backup MySQL database
backup_mysql() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$OUTPUT_DIR/${DATABASE_ID}_${BACKUP_TYPE}_${timestamp}.sql"
    
    print_status "Creating MySQL backup..."
    
    # Prompt for password if not set
    if [[ -z "$MYSQL_PWD" ]]; then
        echo -n "Enter MySQL password for user $DB_USER: "
        read -s MYSQL_PWD
        echo
        export MYSQL_PWD
    fi
    
    local mysql_opts="-h $DB_HOST -P $DB_PORT -u $DB_USER"
    
    case "$BACKUP_TYPE" in
        full)
            mysqldump $mysql_opts --routines --triggers --single-transaction "$DB_NAME" > "$backup_file"
            ;;
        schema)
            mysqldump $mysql_opts --no-data --routines --triggers "$DB_NAME" > "$backup_file"
            ;;
        data)
            mysqldump $mysql_opts --no-create-info --single-transaction "$DB_NAME" > "$backup_file"
            ;;
    esac
    
    if [[ $? -eq 0 ]]; then
        local final_file=$(compress_file "$backup_file")
        print_success "MySQL backup completed: $final_file"
        echo "$final_file"
    else
        print_error "MySQL backup failed"
        rm -f "$backup_file"
        exit 1
    fi
}

# Function to backup SQLite database
backup_sqlite() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$OUTPUT_DIR/${DATABASE_ID}_${BACKUP_TYPE}_${timestamp}.db"
    
    print_status "Creating SQLite backup..."
    
    case "$BACKUP_TYPE" in
        full)
            cp "$DB_NAME" "$backup_file"
            ;;
        schema)
            sqlite3 "$DB_NAME" ".schema" > "${backup_file}.sql"
            backup_file="${backup_file}.sql"
            ;;
        data)
            sqlite3 "$DB_NAME" ".dump" | grep -v "CREATE" > "${backup_file}.sql"
            backup_file="${backup_file}.sql"
            ;;
    esac
    
    if [[ $? -eq 0 ]]; then
        local final_file=$(compress_file "$backup_file")
        print_success "SQLite backup completed: $final_file"
        echo "$final_file"
    else
        print_error "SQLite backup failed"
        rm -f "$backup_file"
        exit 1
    fi
}

# Function to backup MongoDB database
backup_mongodb() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="$OUTPUT_DIR/${DATABASE_ID}_${BACKUP_TYPE}_${timestamp}"
    
    print_status "Creating MongoDB backup..."
    
    mkdir -p "$backup_dir"
    
    case "$BACKUP_TYPE" in
        full)
            mongodump --host "$DB_HOST:$DB_PORT" --db "$DB_NAME" --out "$backup_dir"
            ;;
        schema)
            # MongoDB doesn't have explicit schema, but we can export collection info
            mongo "$DB_HOST:$DB_PORT/$DB_NAME" --eval "db.runCommand('listCollections')" > "$backup_dir/schema.json"
            ;;
        data)
            mongodump --host "$DB_HOST:$DB_PORT" --db "$DB_NAME" --out "$backup_dir"
            ;;
    esac
    
    if [[ $? -eq 0 ]]; then
        # Create tar archive
        local archive_file="$backup_dir.tar"
        tar -cf "$archive_file" -C "$OUTPUT_DIR" "$(basename "$backup_dir")"
        rm -rf "$backup_dir"
        
        local final_file=$(compress_file "$archive_file")
        print_success "MongoDB backup completed: $final_file"
        echo "$final_file"
    else
        print_error "MongoDB backup failed"
        rm -rf "$backup_dir"
        exit 1
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    print_status "Cleaning up backups older than $RETENTION_DAYS days..."
    
    find "$OUTPUT_DIR" -name "${DATABASE_ID}_*" -mtime +$RETENTION_DAYS -type f -exec rm -f {} \;
    
    local removed_count=$(find "$OUTPUT_DIR" -name "${DATABASE_ID}_*" -mtime +$RETENTION_DAYS -type f | wc -l)
    if [[ $removed_count -gt 0 ]]; then
        print_success "Removed $removed_count old backup files"
    else
        print_status "No old backups to remove"
    fi
}

# Function to create backup metadata
create_backup_metadata() {
    local backup_file="$1"
    local metadata_file="${backup_file}.meta"
    local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null || echo "unknown")
    
    cat > "$metadata_file" << EOF
{
  "database_id": "$DATABASE_ID",
  "database_type": "$DATABASE_TYPE",
  "backup_type": "$BACKUP_TYPE",
  "compression": "$COMPRESSION",
  "file_size": $file_size,
  "created_at": "$(date -Iseconds)",
  "checksum": "$(shasum -a 256 "$backup_file" | cut -d' ' -f1)",
  "database_config": {
    "host": "$DB_HOST",
    "port": "$DB_PORT",
    "database": "$DB_NAME"
  }
}
EOF
    
    print_status "Created backup metadata: $metadata_file"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--database-id)
            DATABASE_ID="$2"
            shift 2
            ;;
        -t|--type)
            BACKUP_TYPE="$2"
            shift 2
            ;;
        -c|--compression)
            COMPRESSION="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -r|--retention)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        --no-schema)
            INCLUDE_SCHEMA=false
            shift
            ;;
        --no-data)
            INCLUDE_DATA=false
            shift
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
if [[ -z "$DATABASE_ID" ]]; then
    print_error "Database ID is required. Use -d or --database-id to specify."
    show_usage
    exit 1
fi

# Validate backup type
case "$BACKUP_TYPE" in
    full|schema|data) ;;
    *)
        print_error "Invalid backup type. Supported types: full, schema, data"
        exit 1
        ;;
esac

# Validate compression method
case "$COMPRESSION" in
    gzip|bzip2|none) ;;
    *)
        print_error "Invalid compression method. Supported methods: gzip, bzip2, none"
        exit 1
        ;;
esac

# Main execution
print_status "Starting database backup process..."
print_status "Database ID: $DATABASE_ID"
print_status "Backup Type: $BACKUP_TYPE"
print_status "Compression: $COMPRESSION"
print_status "Output Directory: $OUTPUT_DIR"

# Ensure backup directory exists
ensure_backup_dir

# Load database configuration
load_database_config

# Perform backup based on database type
backup_file=""
case "$DATABASE_TYPE" in
    postgresql)
        backup_file=$(backup_postgresql)
        ;;
    mysql)
        backup_file=$(backup_mysql)
        ;;
    sqlite)
        backup_file=$(backup_sqlite)
        ;;
    mongodb)
        backup_file=$(backup_mongodb)
        ;;
    *)
        print_error "Unsupported database type: $DATABASE_TYPE"
        exit 1
        ;;
esac

# Create backup metadata
if [[ -n "$backup_file" && -f "$backup_file" ]]; then
    create_backup_metadata "$backup_file"
    
    # Get final file size
    local final_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null || echo "unknown")
    
    print_success "Backup completed successfully!"
    print_status "Backup file: $backup_file"
    print_status "File size: $final_size bytes"
    
    # Cleanup old backups
    cleanup_old_backups
    
    print_success "Database backup process completed successfully!"
else
    print_error "Backup process failed - no backup file created"
    exit 1
fi

exit 0