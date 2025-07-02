#!/usr/bin/env python3
"""
Integration test for the GitHub MCP Server

This script tests the GitHub MCP server's protocol compliance and functionality.
"""

import json
import subprocess
import sys
import os
import time
from pathlib import Path

def send_request(process, request):
    """Send a JSON-RPC request to the server"""
    request_str = json.dumps(request) + '\n'
    process.stdin.write(request_str)
    process.stdin.flush()
    
    # Read response
    response_line = process.stdout.readline()
    if response_line:
        return json.loads(response_line)
    return None

def test_initialize(process):
    """Test the initialize method"""
    print("Testing initialize...")
    
    request = {
        "jsonrpc": "2.0",
        "method": "initialize",
        "params": {
            "capabilities": {}
        },
        "id": 1
    }
    
    response = send_request(process, request)
    
    if response and "result" in response:
        result = response["result"]
        if "protocolVersion" in result and "serverInfo" in result:
            print("✅ Initialize successful")
            print(f"   Protocol Version: {result.get('protocolVersion')}")
            print(f"   Server: {result.get('serverInfo', {}).get('name')} v{result.get('serverInfo', {}).get('version')}")
            print(f"   Capabilities: {result.get('capabilities', {})}")
            return True
    else:
        print("❌ Initialize failed")
        print(f"   Response: {response}")
        return False

def test_tools_list(process):
    """Test the tools/list method"""
    print("\nTesting tools/list...")
    
    request = {
        "jsonrpc": "2.0",
        "method": "tools/list",
        "params": {},
        "id": 2
    }
    
    response = send_request(process, request)
    
    if response and "result" in response and "tools" in response["result"]:
        tools = response["result"]["tools"]
        print(f"✅ Tools list successful - found {len(tools)} tools:")
        for tool in tools:
            print(f"   - {tool['name']}: {tool['description']}")
        return True
    else:
        print("❌ Tools list failed")
        print(f"   Response: {response}")
        return False

def test_git_status(process, repo_path):
    """Test the git_status tool"""
    print(f"\nTesting git_status on {repo_path}...")
    
    request = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "git_status",
            "arguments": {
                "repo_path": repo_path
            }
        },
        "id": 3
    }
    
    response = send_request(process, request)
    
    if response and "result" in response:
        content = response["result"]["content"][0]["text"]
        print("✅ Git status successful")
        print(f"   Output: {content[:100]}...")
        return True
    else:
        print("❌ Git status failed")
        print(f"   Response: {response}")
        return False

def test_git_branch_operations(process, repo_path):
    """Test git branch operations"""
    print(f"\nTesting git branch operations...")
    
    # First, list current branches
    print("  1. Listing branches...")
    request = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "git_branch",
            "arguments": {
                "repo_path": repo_path,
                "action": "list"
            }
        },
        "id": 4
    }
    
    response = send_request(process, request)
    if response and "result" in response:
        print("  ✅ Branch list successful")
    else:
        print("  ❌ Branch list failed")
        return False
    
    # Create a test branch
    print("  2. Creating 'dev' branch...")
    request = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "git_branch",
            "arguments": {
                "repo_path": repo_path,
                "action": "create",
                "branch_name": "dev"
            }
        },
        "id": 5
    }
    
    response = send_request(process, request)
    if response and "result" in response:
        print("  ✅ Branch creation successful")
    else:
        print("  ❌ Branch creation failed")
        print(f"     Response: {response}")
        return False
    
    # Checkout the new branch
    print("  3. Checking out 'dev' branch...")
    request = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "git_branch",
            "arguments": {
                "repo_path": repo_path,
                "action": "checkout",
                "branch_name": "dev"
            }
        },
        "id": 6
    }
    
    response = send_request(process, request)
    if response and "result" in response:
        print("  ✅ Branch checkout successful")
        return True
    else:
        print("  ❌ Branch checkout failed")
        return False

def test_git_commit(process, repo_path):
    """Test git commit functionality"""
    print(f"\nTesting git commit...")
    
    # Create a test file
    test_file = Path(repo_path) / "test_mcp_server.txt"
    test_file.write_text(f"Test file created at {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Commit with add_all
    request = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "git_commit",
            "arguments": {
                "repo_path": repo_path,
                "message": "Test commit from MCP server",
                "add_all": True
            }
        },
        "id": 7
    }
    
    response = send_request(process, request)
    
    if response and "result" in response:
        content = response["result"]["content"][0]["text"]
        if "Commit created successfully" in content or "nothing to commit" in content:
            print("✅ Git commit successful")
            print(f"   Output: {content[:100]}...")
            return True
    
    print("❌ Git commit failed")
    print(f"   Response: {response}")
    return False

def main():
    """Run integration tests"""
    # Get the server path
    server_path = Path(__file__).parent / "server.py"
    
    # Test repository path
    repo_path = "/Users/derakhshani/Documents/GitHub/personal/ava"
    
    print(f"Starting GitHub MCP Server integration tests...")
    print(f"Server path: {server_path}")
    print(f"Test repository: {repo_path}")
    print("-" * 50)
    
    # Check if test repository exists
    if not os.path.exists(repo_path):
        print(f"❌ Test repository not found: {repo_path}")
        sys.exit(1)
    
    # Start the server process
    try:
        process = subprocess.Popen(
            [sys.executable, str(server_path)],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        
        # Run tests
        all_passed = True
        
        if not test_initialize(process):
            all_passed = False
        
        if not test_tools_list(process):
            all_passed = False
        
        if not test_git_status(process, repo_path):
            all_passed = False
        
        if not test_git_branch_operations(process, repo_path):
            all_passed = False
        
        if not test_git_commit(process, repo_path):
            all_passed = False
        
        # Clean up
        process.terminate()
        process.wait()
        
        print("\n" + "=" * 50)
        if all_passed:
            print("✅ All tests passed!")
        else:
            print("❌ Some tests failed!")
            sys.exit(1)
        
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()