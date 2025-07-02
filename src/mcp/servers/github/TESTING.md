# GitHub MCP Server Testing Guide

This document outlines the testing procedures for the GitHub MCP server.

## Quick Test

Run the automated integration test:

```bash
cd src/mcp/servers/github
python3 test_integration.py
```

## Manual Testing

### 1. Protocol Compliance Test

Test basic MCP protocol compliance:

```bash
# Start the server
python3 server.py

# In another terminal, send test requests:
echo '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}' | python3 server.py
```

### 2. Tools Discovery Test

```bash
echo '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":2}' | python3 server.py
```

### 3. Git Operations Test

Test with a real repository:

```bash
# Git status
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"git_status","arguments":{"repo_path":"/path/to/repo"}},"id":3}' | python3 server.py

# Create branch
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"git_branch","arguments":{"repo_path":"/path/to/repo","action":"create","branch_name":"test-branch"}},"id":4}' | python3 server.py
```

## Claude Integration Testing

After registering the server:

```bash
claude mcp add --scope user github python3 /full/path/to/server.py
```

Test in Claude:

1. Start a new Claude session
2. Check MCP connection: `/mcp`
3. Test natural language commands:
   - "Check the git status of /Users/derakhshani/Documents/GitHub/personal/ava"
   - "Create a new branch called 'feature-test' in /Users/derakhshani/Documents/GitHub/personal/ava"
   - "Commit all changes with message 'Updated documentation' in /Users/derakhshani/Documents/GitHub/personal/ava"

## Expected Results

### Successful Test Output

```
Testing initialize...
✅ Initialize successful
   Capabilities: {'tools': {}}

Testing tools/list...
✅ Tools list successful - found 7 tools:
   - git_status: Get the current git status of a repository
   - git_branch: List, create, or delete git branches
   - git_commit: Create a git commit with the specified message
   - git_push: Push commits to the remote repository
   - git_pull: Pull changes from the remote repository
   - git_log: Show git commit history
   - git_add: Stage files for commit

Testing git_status on /path/to/repo...
✅ Git status successful
   Output: Git status for /path/to/repo...

Testing git branch operations...
  1. Listing branches...
  ✅ Branch list successful
  2. Creating 'dev' branch...
  ✅ Branch creation successful
  3. Checking out 'dev' branch...
  ✅ Branch checkout successful

Testing git commit...
✅ Git commit successful
   Output: Commit created successfully...

==================================================
✅ All tests passed!
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure the server.py file is executable: `chmod +x server.py`
   - Check repository permissions

2. **Git Command Not Found**
   - Ensure git is installed: `which git`
   - Check PATH environment variable

3. **Repository Not Found**
   - Verify the repository path exists
   - Use absolute paths, not relative paths

4. **MCP Connection Failed**
   - Restart Claude: `claude` (new session)
   - Check server registration: `claude mcp list`
   - Re-register if needed

### Debug Mode

To see detailed error output:

```bash
# Run server with stderr visible
python3 server.py 2>server_errors.log

# In another terminal, tail the error log
tail -f server_errors.log
```

## Test Coverage

The integration test covers:
- [x] Protocol initialization
- [x] Tool discovery
- [x] Git status operations
- [x] Branch management (list, create, checkout)
- [x] Commit operations
- [x] Error handling
- [x] Repository validation

## Performance Notes

- Server startup: < 100ms
- Tool execution: Depends on git operation (typically < 500ms)
- Memory usage: Minimal (< 10MB)
- No external dependencies required