# CLAUDE.md

This file provides guidance to Claude Code when working with Model Context Protocol (MCP) server development in this repository.

## Repository Overview

This repository is dedicated to creating, testing, and deploying MCP servers for Claude Code Pro CLI integration. The primary goal is to build a comprehensive library of MCP servers that extend Claude Code's capabilities through standardized, discoverable external tools.

## 🚀 Quick Start for Perfect MCP Servers

**For AI agents creating new MCP servers:** Use the [Perfect Server Checklist](docs/quick-reference/perfect-server-checklist.md) for guaranteed working servers on the first try. This checklist contains all critical requirements that commonly cause server failures.

**Key Success Factors:**
- ✅ Use the complete server template from the checklist
- ✅ Include exact `protocolVersion: "2024-11-05"` in initialize response
- ✅ Handle `initialized` notification properly
- ✅ Configure unbuffered I/O at the top of every server

## Project Goals

### Primary Objectives
1. **MCP Server Development**: Create robust, production-ready MCP servers that integrate seamlessly with Claude Code
2. **Protocol Compliance**: Ensure all servers follow JSON-RPC 2.0 and MCP specifications exactly
3. **Testing Framework**: Develop comprehensive testing methodologies for MCP server validation
4. **Documentation Standards**: Maintain clear, actionable documentation for rapid MCP server development
5. **Capability Extension**: Build servers that provide functionality beyond Claude Code's built-in tools

### Success Criteria
- MCP servers register successfully with Claude Code CLI
- Tools are discoverable and executable through natural language queries
- Servers provide reliable, tested functionality
- Integration testing validates end-to-end workflows
- Documentation enables rapid server creation without confusion

## Architecture Patterns

### MCP Server Structure
All MCP servers in this repository follow a standardized pattern:

```
servers/[server-name]/
├── server.py          # Main MCP server implementation
├── requirements.txt   # Python dependencies
├── README.md         # Server-specific documentation
├── TESTING.md        # Testing procedures and results
└── test_integration.py # Automated testing script
```

### Core Implementation Pattern
Every MCP server implements three critical JSON-RPC methods:
1. **`initialize`**: Protocol handshake and capability declaration
2. **`tools/list`**: Tool discovery with proper JSON schemas
3. **`tools/call`**: Tool execution with parameter validation

### Registration Pattern
All servers are registered using the user scope for global availability:
```bash
claude mcp add --scope user [server-name] python3 /full/path/to/server.py
```

## Development Workflow

### 1. Server Creation Process
1. **Directory Setup**: Create structured directory under `servers/[server-name]/`
2. **Core Implementation**: Implement MCP protocol with proper error handling
3. **Tool Definition**: Define tools with comprehensive JSON schemas
4. **Testing**: Run protocol compliance and integration tests
5. **Registration**: Add server to Claude Code with proper scope
6. **Validation**: Test natural language integration

### 2. Quality Standards
- **Protocol Compliance**: All JSON-RPC responses must be valid
- **Error Handling**: Comprehensive exception handling for all failure modes
- **Input Validation**: Sanitize and validate all user inputs
- **Documentation**: Complete README and TESTING files required
- **Testing**: Automated test coverage for all functionality

### 3. Testing Requirements
- **Protocol Tests**: Manual JSON-RPC validation
- **Integration Tests**: Claude Code CLI connectivity
- **Functionality Tests**: Tool execution validation
- **Error Tests**: Invalid input handling verification

## Available Documentation

The `docs/` directory contains comprehensive guides organized by category:

### Quick Reference (`docs/quick-reference/`)
- **mcp-protocol-basics.md**: Essential MCP protocol concepts
- **common-patterns.md**: Reusable code patterns and templates
- **testing-checklist.md**: Step-by-step testing procedures
- **troubleshooting.md**: Common issues and solutions

### Troubleshooting
For common issues and solutions, please refer to the [Troubleshooting Guide](docs/quick-reference/troubleshooting.md).

### Implementation Guides (`docs/implementation/`)
- **server-architecture.md**: MCP server structure and design patterns  
- **json-rpc-implementation.md**: JSON-RPC 2.0 protocol implementation
- **tool-definition.md**: Creating tools with proper schemas
- **error-handling.md**: Comprehensive error handling strategies

### Integration (`docs/integration/`)
- **claude-code-setup.md**: Claude Code CLI configuration
- **registration-guide.md**: Server registration procedures
- **testing-framework.md**: Testing methodologies and automation
- **deployment-patterns.md**: Production deployment strategies

### Examples (`docs/examples/`)
- **simple-server-walkthrough.md**: Step-by-step server creation
- **color-hex-server.md**: Complete example analysis
- **advanced-patterns.md**: Complex server implementations
- **real-world-integrations.md**: Production server examples

## Common Development Commands

### Server Development
```bash
# Create new server directory
mkdir -p servers/[server-name]
cd servers/[server-name]

# Create core files
touch server.py requirements.txt README.md TESTING.md test_integration.py

# Make server executable
chmod +x server.py
```

### Testing Commands
```bash
# Protocol compliance test
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | python3 server.py

# Register with Claude Code
claude mcp add --scope user [server-name] python3 /full/path/to/server.py

# Verify registration
claude mcp list
claude mcp get [server-name]

# Test integration
python3 test_integration.py
```

### Claude Code Testing
```bash
# Start Claude Code and test
claude
/mcp  # Check server connection status
# Use natural language queries to test functionality
```

## File Structure Standards

### Required Files for Each Server
- **server.py**: Main implementation with proper shebang and unbuffered I/O
- **requirements.txt**: Dependencies (use Python stdlib when possible)
- **README.md**: Server purpose, features, and usage instructions
- **TESTING.md**: Testing procedures and validation results
- **test_integration.py**: Automated testing script

### Code Standards
- **Shebang**: All Python files start with `#!/usr/bin/env python3`
- **I/O Configuration**: Unbuffered stdout/stderr for MCP communication
- **Error Handling**: Comprehensive exception handling at all levels
- **Documentation**: Inline comments for complex logic only
- **Type Hints**: Use typing for better code clarity

## Success Examples

### Color-Hex Server
Located in `servers/color-hex-server/`, this server demonstrates:
- ✅ Perfect MCP protocol compliance
- ✅ Two functional tools with proper schemas
- ✅ Comprehensive error handling
- ✅ Complete testing framework
- ✅ Successful Claude Code integration

### Key Success Metrics
- Server registers without errors
- Tools appear in Claude Code tool discovery
- Natural language queries work correctly
- Error conditions are handled gracefully
- All automated tests pass

## Next Development Priorities

1. **API Integration Servers**: Weather, news, database connections
2. **Utility Servers**: File processing, data transformation, calculations
3. **Development Tool Servers**: Git advanced operations, code analysis
4. **Business Logic Servers**: Domain-specific functionality
5. **Multi-Server Orchestration**: Workflow coordination between servers

## Best Practices

- Always use `--scope user` for development servers
- Test protocol compliance before Claude Code integration
- Provide helpful error messages for invalid inputs
- Use absolute paths in server registration
- Document all tools with clear descriptions and examples
- Implement comprehensive logging for debugging
- Follow security best practices for input validation

This repository serves as a comprehensive MCP server development environment with all necessary tools, documentation, and examples for rapid, reliable server creation.