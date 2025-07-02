import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'unchecked' | 'planning' | 'planned';
  pageId: string;
  createdAt: string;
  planFilePath?: string;
  tags?: string[];
  source?: 'manual' | 'github';
  githubIssueNumber?: number;
  githubUrl?: string;
}

interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: string;
  created_at: string;
  html_url: string;
  labels: Array<{ name: string }>;
}

interface SyncRequest {
  pageId: string;
}

interface SyncResponse {
  success: boolean;
  syncedCount?: number;
  error?: string;
  executionId?: string;
}

const CLAUDE_CLI_PATH = process.env.CLAUDE_CLI_PATH || '/Users/derakhshani/.claude/local/claude';
const EXECUTION_TIMEOUT = parseInt(process.env.CLAUDE_EXECUTION_TIMEOUT || '300000');
const PROJECT_ROOT = '/Users/derakhshani/Documents/GitHub/AVI-Tech/ava';

function buildGitHubSyncPrompt(): string {
  const contextLines = [
    '=== GITHUB ISSUES SYNC REQUEST ===',
    '',
    `**Project**: AVA Dashboard (Next.js 14 with TypeScript)`,
    `**Working Directory**: ${PROJECT_ROOT}`,
    `**Sync Time**: ${new Date().toISOString()}`,
    '',
    '=== TASK ===',
    '',
    'You need to fetch all open issues from the GitHub repository using the GitHub CLI.',
    '',
    'Please execute the following steps:',
    '',
    '1. **Check GitHub CLI availability**:',
    '   - Use `gh --version` to verify GitHub CLI is installed',
    '   - If not available, return an error message',
    '',
    '2. **Authenticate and check repository**:',
    '   - Use `gh auth status` to check authentication',
    '   - Use `gh repo view` to get current repository information',
    '',
    '3. **Fetch open issues**:',
    '   - Use `gh issue list --state open --json number,title,body,createdAt,url,labels`',
    '   - This will return a JSON array of open issues',
    '',
    '4. **Format the response**:',
    '   - Return the JSON data exactly as received from GitHub CLI',
    '   - If there are no issues, return an empty array []',
    '   - If there are errors, clearly indicate what went wrong',
    '',
    'IMPORTANT: Your response should be ONLY the JSON data from the gh issue list command, nothing else.',
    'Do not add any explanatory text, just return the raw JSON array.',
    '',
    '=== END SYNC REQUEST ===',
    ''
  ];

  return contextLines.join('\n');
}

async function executeGitHubSync(executionId: string): Promise<GitHubIssue[]> {
  return new Promise((resolve, reject) => {
    const prompt = buildGitHubSyncPrompt();
    const args = [
      '--print',
      '--output-format', 'text',
      prompt
    ];

    console.log(`[${executionId}] Starting GitHub sync via Claude CLI`);
    
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

    // Set up timeout
    const timeout = setTimeout(() => {
      if (!isComplete) {
        console.log(`[${executionId}] GitHub sync timeout (5m), terminating process`);
        isComplete = true;
        claudeProcess.kill('SIGTERM');
        setTimeout(() => claudeProcess.kill('SIGKILL'), 2000);
        reject(new Error('GitHub sync timeout (5 minutes)'));
      }
    }, EXECUTION_TIMEOUT);

    // Handle process output
    claudeProcess.stdout?.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      console.log(`[${executionId}] stdout chunk received: ${chunk.length} chars`);
    });

    claudeProcess.stderr?.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      console.log(`[${executionId}] stderr:`, chunk.substring(0, 200) + (chunk.length > 200 ? '...' : ''));
    });

    // Handle process completion
    claudeProcess.on('close', (code) => {
      if (isComplete) return;
      isComplete = true;
      clearTimeout(timeout);
      
      console.log(`[${executionId}] GitHub sync completed with code ${code}`);
      console.log(`[${executionId}] stdout length: ${stdout.length}`);
      
      if (code === 0) {
        try {
          // Try to parse the JSON response
          const output = stdout.trim();
          console.log(`[${executionId}] Raw output:`, output.substring(0, 500) + '...');
          
          // Look for JSON array in the output
          const jsonMatch = output.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[0]);
            if (Array.isArray(jsonData)) {
              resolve(jsonData);
            } else {
              reject(new Error('Invalid response format: expected array'));
            }
          } else {
            // If no JSON found, check if it's an empty response or error
            if (output.includes('no issues') || output.includes('No issues') || output.trim() === '[]') {
              resolve([]);
            } else {
              reject(new Error(`No valid JSON found in response: ${output.substring(0, 200)}`));
            }
          }
        } catch (error) {
          console.error(`[${executionId}] JSON parse error:`, error);
          reject(new Error(`Failed to parse GitHub response: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
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
  });
}

function getIssuesFilePath(pageId: string): string {
  return join(PROJECT_ROOT, 'src', 'pages', pageId, 'issues', 'issues.json');
}

function ensureIssuesDirectory(pageId: string): void {
  const issuesDir = join(PROJECT_ROOT, 'src', 'pages', pageId, 'issues');
  if (!existsSync(issuesDir)) {
    mkdirSync(issuesDir, { recursive: true });
  }
}

function loadExistingIssues(pageId: string): Issue[] {
  try {
    const filePath = getIssuesFilePath(pageId);
    if (!existsSync(filePath)) {
      return [];
    }
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data.issues) ? data.issues : [];
  } catch (error) {
    console.error('Error loading existing issues:', error);
    return [];
  }
}

function saveIssues(pageId: string, issues: Issue[]): void {
  try {
    ensureIssuesDirectory(pageId);
    const filePath = getIssuesFilePath(pageId);
    const data = {
      issues,
      lastUpdated: new Date().toISOString(),
      pageId
    };
    writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving issues:', error);
    throw new Error('Failed to save issues');
  }
}

function convertGitHubIssueToIssue(githubIssue: GitHubIssue, pageId: string): Issue {
  return {
    id: `github-${githubIssue.number}`,
    title: githubIssue.title,
    description: githubIssue.body || 'No description provided',
    status: 'unchecked',
    pageId,
    createdAt: githubIssue.created_at,
    tags: githubIssue.labels?.map(label => label.name) || [],
    source: 'github',
    githubIssueNumber: githubIssue.number,
    githubUrl: githubIssue.html_url
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<SyncResponse>> {
  try {
    const body: SyncRequest = await request.json();
    
    if (!body.pageId) {
      return NextResponse.json(
        { success: false, error: 'pageId is required' },
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
    
    console.log(`[${executionId}] Starting GitHub sync for page: ${body.pageId}`);
    
    // Execute GitHub sync
    const githubIssues = await executeGitHubSync(executionId);
    
    console.log(`[${executionId}] Retrieved ${githubIssues.length} issues from GitHub`);
    
    // Load existing issues
    const existingIssues = loadExistingIssues(body.pageId);
    
    // Filter out issues that are already synced
    const existingGitHubIds = new Set(
      existingIssues
        .filter(issue => issue.source === 'github')
        .map(issue => issue.id)
    );
    
    const newGitHubIssues = githubIssues.filter(
      githubIssue => !existingGitHubIds.has(`github-${githubIssue.number}`)
    );
    
    console.log(`[${executionId}] Found ${newGitHubIssues.length} new issues to sync`);
    
    // Convert GitHub issues to our Issue format
    const newIssues = newGitHubIssues.map(githubIssue => 
      convertGitHubIssueToIssue(githubIssue, body.pageId)
    );
    
    // Combine with existing issues (new issues first)
    const allIssues = [...newIssues, ...existingIssues];
    
    // Save updated issues
    saveIssues(body.pageId, allIssues);
    
    return NextResponse.json({
      success: true,
      syncedCount: newIssues.length,
      executionId
    });

  } catch (error) {
    console.error('Error syncing GitHub issues:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    service: 'github-sync',
    timestamp: new Date().toISOString(),
    claudeCliPath: CLAUDE_CLI_PATH,
    claudeCliExists: existsSync(CLAUDE_CLI_PATH),
    timeout: EXECUTION_TIMEOUT,
    projectRoot: PROJECT_ROOT
  });
}