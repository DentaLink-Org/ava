#!/usr/bin/env python3
"""
GitHub MCP Server

An MCP server that provides tools for performing Git and GitHub operations
through the command-line interface.
"""

import os
import sys
import json
import subprocess
from typing import Dict, Any, List, Optional

# Enable unbuffered output for MCP communication
sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 1)
sys.stderr = os.fdopen(sys.stderr.fileno(), 'w', 1)

class GitHubMCPServer:
    """MCP server for GitHub CLI operations"""
    
    def __init__(self):
        self.request_counter = 0
    
    def _send_response(self, result: Dict[str, Any], request_id: Optional[Any] = None):
        """Send a JSON-RPC response"""
        response = {
            "jsonrpc": "2.0",
            "result": result
        }
        if request_id is not None:
            response["id"] = request_id
        
        print(json.dumps(response))
    
    def _send_error(self, code: int, message: str, request_id: Optional[Any] = None):
        """Send a JSON-RPC error response"""
        response = {
            "jsonrpc": "2.0",
            "error": {
                "code": code,
                "message": message
            }
        }
        if request_id is not None:
            response["id"] = request_id
        
        print(json.dumps(response))
    
    def _run_git_command(self, command: List[str], cwd: str) -> Dict[str, Any]:
        """Execute a git command and return the result"""
        try:
            # Ensure the directory exists
            if not os.path.exists(cwd):
                return {
                    "success": False,
                    "error": f"Directory does not exist: {cwd}"
                }
            
            # Run the command
            result = subprocess.run(
                command,
                cwd=cwd,
                capture_output=True,
                text=True,
                check=False
            )
            
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def handle_initialize(self, params: Dict[str, Any], request_id: Any):
        """Handle the initialize request"""
        # Send initialize response
        self._send_response({
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {}
            },
            "serverInfo": {
                "name": "github-mcp-server",
                "version": "1.0.0"
            }
        }, request_id)
    
    def handle_tools_list(self, request_id: Any):
        """Handle the tools/list request"""
        tools = [
            {
                "name": "git_status",
                "description": "Get the current git status of a repository",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "repo_path": {
                            "type": "string",
                            "description": "The absolute path to the git repository"
                        }
                    },
                    "required": ["repo_path"]
                }
            },
            {
                "name": "git_branch",
                "description": "List, create, or delete git branches",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "repo_path": {
                            "type": "string",
                            "description": "The absolute path to the git repository"
                        },
                        "action": {
                            "type": "string",
                            "enum": ["list", "create", "delete", "checkout"],
                            "description": "The branch operation to perform"
                        },
                        "branch_name": {
                            "type": "string",
                            "description": "The name of the branch (required for create, delete, checkout)"
                        }
                    },
                    "required": ["repo_path", "action"]
                }
            },
            {
                "name": "git_commit",
                "description": "Create a git commit with the specified message",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "repo_path": {
                            "type": "string",
                            "description": "The absolute path to the git repository"
                        },
                        "message": {
                            "type": "string",
                            "description": "The commit message"
                        },
                        "add_all": {
                            "type": "boolean",
                            "description": "Whether to add all changed files before committing (git add -A)",
                            "default": False
                        }
                    },
                    "required": ["repo_path", "message"]
                }
            },
            {
                "name": "git_push",
                "description": "Push commits to the remote repository",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "repo_path": {
                            "type": "string",
                            "description": "The absolute path to the git repository"
                        },
                        "branch": {
                            "type": "string",
                            "description": "The branch to push (optional, defaults to current branch)"
                        },
                        "force": {
                            "type": "boolean",
                            "description": "Whether to force push",
                            "default": False
                        }
                    },
                    "required": ["repo_path"]
                }
            },
            {
                "name": "git_pull",
                "description": "Pull changes from the remote repository",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "repo_path": {
                            "type": "string",
                            "description": "The absolute path to the git repository"
                        },
                        "branch": {
                            "type": "string",
                            "description": "The branch to pull (optional, defaults to current branch)"
                        }
                    },
                    "required": ["repo_path"]
                }
            },
            {
                "name": "git_log",
                "description": "Show git commit history",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "repo_path": {
                            "type": "string",
                            "description": "The absolute path to the git repository"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Number of commits to show",
                            "default": 10
                        }
                    },
                    "required": ["repo_path"]
                }
            },
            {
                "name": "git_add",
                "description": "Stage files for commit",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "repo_path": {
                            "type": "string",
                            "description": "The absolute path to the git repository"
                        },
                        "files": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "description": "List of files to add (use ['.'] to add all)"
                        }
                    },
                    "required": ["repo_path", "files"]
                }
            }
        ]
        
        self._send_response({"tools": tools}, request_id)
    
    def handle_tools_call(self, params: Dict[str, Any], request_id: Any):
        """Handle the tools/call request"""
        tool_name = params.get("name")
        arguments = params.get("arguments", {})
        
        if tool_name == "git_status":
            result = self._handle_git_status(arguments)
        elif tool_name == "git_branch":
            result = self._handle_git_branch(arguments)
        elif tool_name == "git_commit":
            result = self._handle_git_commit(arguments)
        elif tool_name == "git_push":
            result = self._handle_git_push(arguments)
        elif tool_name == "git_pull":
            result = self._handle_git_pull(arguments)
        elif tool_name == "git_log":
            result = self._handle_git_log(arguments)
        elif tool_name == "git_add":
            result = self._handle_git_add(arguments)
        else:
            self._send_error(-32601, f"Unknown tool: {tool_name}", request_id)
            return
        
        self._send_response({"content": [{"type": "text", "text": result}]}, request_id)
    
    def _handle_git_status(self, args: Dict[str, Any]) -> str:
        """Handle git status command"""
        repo_path = args.get("repo_path")
        if not repo_path:
            return "Error: repo_path is required"
        
        result = self._run_git_command(["git", "status"], repo_path)
        
        if result["success"]:
            return f"Git status for {repo_path}:\n{result['stdout']}"
        else:
            return f"Error: {result.get('error', result.get('stderr', 'Unknown error'))}"
    
    def _handle_git_branch(self, args: Dict[str, Any]) -> str:
        """Handle git branch operations"""
        repo_path = args.get("repo_path")
        action = args.get("action")
        branch_name = args.get("branch_name")
        
        if not repo_path or not action:
            return "Error: repo_path and action are required"
        
        if action == "list":
            result = self._run_git_command(["git", "branch", "-a"], repo_path)
        elif action == "create":
            if not branch_name:
                return "Error: branch_name is required for create action"
            result = self._run_git_command(["git", "branch", branch_name], repo_path)
        elif action == "delete":
            if not branch_name:
                return "Error: branch_name is required for delete action"
            result = self._run_git_command(["git", "branch", "-d", branch_name], repo_path)
        elif action == "checkout":
            if not branch_name:
                return "Error: branch_name is required for checkout action"
            result = self._run_git_command(["git", "checkout", branch_name], repo_path)
        else:
            return f"Error: Unknown action: {action}"
        
        if result["success"]:
            output = result['stdout'] or f"Successfully performed {action} operation"
            if action == "checkout" and result['stderr']:
                output = result['stderr']  # Git often outputs checkout info to stderr
            return output
        else:
            return f"Error: {result.get('error', result.get('stderr', 'Unknown error'))}"
    
    def _handle_git_commit(self, args: Dict[str, Any]) -> str:
        """Handle git commit command"""
        repo_path = args.get("repo_path")
        message = args.get("message")
        add_all = args.get("add_all", False)
        
        if not repo_path or not message:
            return "Error: repo_path and message are required"
        
        # Add files if requested
        if add_all:
            add_result = self._run_git_command(["git", "add", "-A"], repo_path)
            if not add_result["success"]:
                return f"Error adding files: {add_result.get('error', add_result.get('stderr', 'Unknown error'))}"
        
        # Create commit
        result = self._run_git_command(["git", "commit", "-m", message], repo_path)
        
        if result["success"]:
            return f"Commit created successfully:\n{result['stdout']}"
        else:
            return f"Error: {result.get('error', result.get('stderr', 'Unknown error'))}"
    
    def _handle_git_push(self, args: Dict[str, Any]) -> str:
        """Handle git push command"""
        repo_path = args.get("repo_path")
        branch = args.get("branch")
        force = args.get("force", False)
        
        if not repo_path:
            return "Error: repo_path is required"
        
        cmd = ["git", "push"]
        if force:
            cmd.append("--force")
        if branch:
            cmd.extend(["origin", branch])
        
        result = self._run_git_command(cmd, repo_path)
        
        if result["success"]:
            output = result['stdout'] or result['stderr'] or "Push completed successfully"
            return output
        else:
            return f"Error: {result.get('error', result.get('stderr', 'Unknown error'))}"
    
    def _handle_git_pull(self, args: Dict[str, Any]) -> str:
        """Handle git pull command"""
        repo_path = args.get("repo_path")
        branch = args.get("branch")
        
        if not repo_path:
            return "Error: repo_path is required"
        
        cmd = ["git", "pull"]
        if branch:
            cmd.extend(["origin", branch])
        
        result = self._run_git_command(cmd, repo_path)
        
        if result["success"]:
            return f"Pull completed successfully:\n{result['stdout']}"
        else:
            return f"Error: {result.get('error', result.get('stderr', 'Unknown error'))}"
    
    def _handle_git_log(self, args: Dict[str, Any]) -> str:
        """Handle git log command"""
        repo_path = args.get("repo_path")
        limit = args.get("limit", 10)
        
        if not repo_path:
            return "Error: repo_path is required"
        
        result = self._run_git_command(
            ["git", "log", f"-{limit}", "--oneline", "--decorate", "--graph"],
            repo_path
        )
        
        if result["success"]:
            return f"Git log (last {limit} commits):\n{result['stdout']}"
        else:
            return f"Error: {result.get('error', result.get('stderr', 'Unknown error'))}"
    
    def _handle_git_add(self, args: Dict[str, Any]) -> str:
        """Handle git add command"""
        repo_path = args.get("repo_path")
        files = args.get("files", [])
        
        if not repo_path or not files:
            return "Error: repo_path and files are required"
        
        cmd = ["git", "add"] + files
        result = self._run_git_command(cmd, repo_path)
        
        if result["success"]:
            return f"Files staged successfully: {', '.join(files)}"
        else:
            return f"Error: {result.get('error', result.get('stderr', 'Unknown error'))}"
    
    def run(self):
        """Main server loop"""
        while True:
            try:
                # Read a line from stdin
                line = sys.stdin.readline()
                if not line:
                    break
                
                # Parse the JSON-RPC request
                try:
                    request = json.loads(line)
                except json.JSONDecodeError as e:
                    self._send_error(-32700, f"Parse error: {str(e)}")
                    continue
                
                # Extract request details
                method = request.get("method")
                params = request.get("params", {})
                request_id = request.get("id")
                
                # Handle the request based on method
                if method == "initialize":
                    self.handle_initialize(params, request_id)
                elif method == "initialized":
                    # This is a notification, no response needed
                    pass
                elif method == "tools/list":
                    self.handle_tools_list(request_id)
                elif method == "tools/call":
                    self.handle_tools_call(params, request_id)
                else:
                    if request_id is not None:  # Only send error for requests, not notifications
                        self._send_error(-32601, f"Method not found: {method}", request_id)
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                # Log unexpected errors to stderr
                print(f"Unexpected error: {str(e)}", file=sys.stderr)


def main():
    """Entry point"""
    server = GitHubMCPServer()
    server.run()


if __name__ == "__main__":
    main()