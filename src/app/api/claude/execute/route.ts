import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

interface ExecuteRequest {
  prompt: string;
  context?: {
    pageId?: string;
    currentPage?: string;
    timestamp?: string;
  };
}

interface ExecuteResponse {
  success: boolean;
  result?: string;
  error?: string;
  executionId?: string;
}

const CLAUDE_CLI_PATH = process.env.CLAUDE_CLI_PATH || '/Users/derakhshani/.claude/local/claude';
const EXECUTION_TIMEOUT = parseInt(process.env.CLAUDE_EXECUTION_TIMEOUT || '300000');
const PROJECT_ROOT = '/Users/derakhshani/Documents/GitHub/AVI-Tech/ava';

export async function POST(request: NextRequest): Promise<NextResponse<ExecuteResponse>> {
  try {
    const body: ExecuteRequest = await request.json();
    
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing prompt' },
        { status: 400 }
      );
    }

    const executionId = Date.now().toString();
    
    // Check if Claude CLI exists
    if (!existsSync(CLAUDE_CLI_PATH)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Claude CLI not found at ${CLAUDE_CLI_PATH}. Please check installation or set CLAUDE_CLI_PATH environment variable.` 
        },
        { status: 500 }
      );
    }
    
    // Build context information for Claude
    const contextInfo = buildContextInfo(body.context);
    const enhancedPrompt = `${contextInfo}\n\nUser Request: ${body.prompt}`;

    // Execute Claude CLI command
    const result = await executeClaudeCLI(enhancedPrompt, executionId);
    
    return NextResponse.json({
      success: true,
      result: result,
      executionId: executionId
    });

  } catch (error) {
    console.error('Error executing Claude CLI:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

function buildContextInfo(context?: ExecuteRequest['context']): string {
  const contextLines = [
    '=== CONTEXT INFORMATION ===',
    `Project: AVA System (Next.js 14 with TypeScript)`,
    `Working Directory: ${PROJECT_ROOT}`,
    `Current Time: ${new Date().toISOString()}`,
  ];

  if (context?.pageId) {
    contextLines.push(`Page ID: ${context.pageId}`);
  }
  
  if (context?.currentPage) {
    contextLines.push(`Current Page: ${context.currentPage}`);
  }

  contextLines.push(
    '',
    'Available Tools: Read, LS, Glob, Grep, Write, Edit, MultiEdit, Bash',
    'Project Structure: Page-centric Next.js app with component registry',
    '=== END CONTEXT ===',
    ''
  );

  return contextLines.join('\n');
}

async function executeClaudeCLI(prompt: string, executionId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      '--print',
      '--output-format', 'text',
      prompt
    ];

    console.log(`[${executionId}] Starting Claude CLI execution with args:`, args);
    
    const claudeProcess = spawn(CLAUDE_CLI_PATH, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: PROJECT_ROOT,
      env: { 
        ...process.env,
        PATH: process.env.PATH
      }
    });

    let stdout = '';
    let stderr = '';
    let isComplete = false;

    // Set up timeout - 5 minutes for complex operations
    const timeout = setTimeout(() => {
      if (!isComplete) {
        console.log(`[${executionId}] Execution timeout (5m), terminating process`);
        isComplete = true;
        claudeProcess.kill('SIGTERM');
        setTimeout(() => claudeProcess.kill('SIGKILL'), 2000);
        reject(new Error('Claude CLI execution timeout (5 minutes)'));
      }
    }, EXECUTION_TIMEOUT);

    // Handle process output
    claudeProcess.stdout?.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      console.log(`[${executionId}] stdout:`, chunk.substring(0, 100) + (chunk.length > 100 ? '...' : ''));
    });

    claudeProcess.stderr?.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      console.log(`[${executionId}] stderr:`, chunk.substring(0, 100) + (chunk.length > 100 ? '...' : ''));
    });

    // Handle process completion
    claudeProcess.on('close', (code) => {
      if (isComplete) return;
      isComplete = true;
      clearTimeout(timeout);
      
      console.log(`[${executionId}] Claude CLI process exited with code ${code}`);
      console.log(`[${executionId}] stdout length: ${stdout.length}, stderr length: ${stderr.length}`);
      
      if (code === 0) {
        const result = stdout.trim() || 'Command executed successfully (no output)';
        resolve(result);
      } else {
        const errorMessage = stderr.trim() || `Process exited with code ${code}`;
        reject(new Error(errorMessage));
      }
    });

    claudeProcess.on('error', (error) => {
      if (isComplete) return;
      isComplete = true;
      clearTimeout(timeout);
      console.error(`[${executionId}] Claude CLI process error:`, error);
      reject(new Error(`Failed to start Claude CLI: ${error.message}`));
    });

    // Handle process exit
    claudeProcess.on('exit', (code, signal) => {
      console.log(`[${executionId}] Process exited with code ${code} and signal ${signal}`);
    });
  });
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    service: 'claude-execute',
    timestamp: new Date().toISOString(),
    claudeCliPath: CLAUDE_CLI_PATH,
    claudeCliExists: existsSync(CLAUDE_CLI_PATH),
    timeout: EXECUTION_TIMEOUT,
    projectRoot: PROJECT_ROOT
  });
}