#!/bin/bash

# GitHub MCP Server Wrapper Script
# This script provides better error handling and logging

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_SCRIPT="$SCRIPT_DIR/server.py"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 not found in PATH" >&2
    exit 1
fi

# Check if server script exists
if [ ! -f "$SERVER_SCRIPT" ]; then
    echo "Error: Server script not found at $SERVER_SCRIPT" >&2
    exit 1
fi

# Check if server script is executable
if [ ! -x "$SERVER_SCRIPT" ]; then
    chmod +x "$SERVER_SCRIPT"
fi

# Run the server with error handling
exec python3 "$SERVER_SCRIPT" 2>&1