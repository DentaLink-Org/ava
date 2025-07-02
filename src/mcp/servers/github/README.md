# GitHub MCP Server

An MCP server that provides tools for performing Git and GitHub operations through the command-line interface.

## Important: Branch Policy

**All git operations should be performed on the `dev` branch.** This repository uses `dev` as the primary development branch for all commits, pushes, and pulls.

## Features

The GitHub MCP server provides the following tools:

- **git_status**: Get the current git status of a repository
- **git_branch**: List, create, delete, or checkout git branches
- **git_commit**: Create a git commit with a specified message
- **git_push**: Push commits to the remote repository
- **git_pull**: Pull changes from the remote repository
- **git_log**: Show git commit history
- **git_add**: Stage files for commit

## Installation

1. Ensure Python 3.6+ is installed
2. No additional dependencies required (uses standard library only)

## Registration

Register the server globally with Claude:

```bash
claude mcp add --scope user github python3 /Users/derakhshani/Documents/GitHub/personal/claude_dashboard/src/mcp/servers/github/server.py
```

## Usage Examples

Once registered, you can use natural language with Claude to perform Git operations:

- "Check the git status of my project at /path/to/repo"
- "Create a new branch called 'feature-xyz' in /path/to/repo"
- "Commit all changes with message 'Fixed bug in authentication' in /path/to/repo"
- "Push the dev branch to origin"
- "Show me the last 5 commits"

**Note**: All commits and pushes should be made to the `dev` branch, which is the primary development branch for this repository.

## Tool Details

### git_status
```json
{
  "repo_path": "/path/to/repository"
}
```

### git_branch
```json
{
  "repo_path": "/path/to/repository",
  "action": "create|delete|checkout|list",
  "branch_name": "branch-name"  // Required for create, delete, checkout
}
```

### git_commit
```json
{
  "repo_path": "/path/to/repository",
  "message": "Your commit message",
  "add_all": true  // Optional: automatically stage all changes
}
```

### git_push
```json
{
  "repo_path": "/path/to/repository",
  "branch": "branch-name",  // Optional: defaults to current branch
  "force": false  // Optional: force push
}
```

### git_pull
```json
{
  "repo_path": "/path/to/repository",
  "branch": "branch-name"  // Optional: defaults to current branch
}
```

### git_log
```json
{
  "repo_path": "/path/to/repository",
  "limit": 10  // Optional: number of commits to show
}
```

### git_add
```json
{
  "repo_path": "/path/to/repository",
  "files": ["file1.txt", "file2.js"]  // Use ["."] to add all
}
```

## Testing

See TESTING.md for comprehensive testing procedures and validation steps.