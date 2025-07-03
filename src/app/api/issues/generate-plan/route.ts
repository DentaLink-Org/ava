import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
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
}

interface GeneratePlanRequest {
  issue: Issue;
}

interface GeneratePlanResponse {
  success: boolean;
  planFilePath?: string;
  error?: string;
  executionId?: string;
}

const CLAUDE_CLI_PATH = process.env.CLAUDE_CLI_PATH || '/Users/derakhshani/.claude/local/claude';
const EXECUTION_TIMEOUT = parseInt(process.env.CLAUDE_EXECUTION_TIMEOUT || '300000');
const PROJECT_ROOT = '/Users/derakhshani/Documents/GitHub/AVI-Tech/ava';

function buildInvestigationPrompt(issue: Issue): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                   new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('-')[0];
  
  const contextLines = [
    '=== ISSUE INVESTIGATION REQUEST ===',
    '',
    `**Project**: AVA Dashboard (Next.js 14 with TypeScript)`,
    `**Working Directory**: ${PROJECT_ROOT}`,
    `**Page**: ${issue.pageId}`,
    `**Investigation Time**: ${new Date().toISOString()}`,
    '',
    `**Issue Title**: ${issue.title}`,
    `**Issue Description**: ${issue.description}`,
    `**Tags**: ${issue.tags?.join(', ') || 'None'}`,
    '',
    '=== INVESTIGATION TASK ===',
    '',
    'You are an expert software engineer tasked with investigating this issue and creating a comprehensive resolution plan.',
    '',
    'Please perform the following investigation steps:',
    '',
    '1. **UNDERSTAND THE ISSUE**:',
    '   - Analyze the issue description and identify potential root causes',
    '   - Consider the context of the AVA Dashboard system architecture',
    '   - Identify what components, files, or systems might be involved',
    '',
    '2. **INVESTIGATE THE CODEBASE**:',
    '   - Use available tools (Read, LS, Glob, Grep) to examine relevant files',
    '   - Look at the page-specific code in src/components/' + issue.pageId + '/',
    '   - Check related components, APIs, and configuration files',
    '   - Identify any error patterns, missing dependencies, or configuration issues',
    '',
    '3. **ANALYZE POTENTIAL CAUSES**:',
    '   - List the most likely causes based on your investigation',
    '   - Consider common issues in Next.js, React, TypeScript applications',
    '   - Think about integration problems, configuration issues, or code bugs',
    '',
    '4. **CREATE RESOLUTION PLAN**:',
    '   - Provide step-by-step instructions to fix the issue',
    '   - Include specific file paths, code changes, and configuration updates',
    '   - Mention any tools, commands, or testing procedures needed',
    '   - Make the plan detailed enough for another agent to execute in one shot',
    '',
    '5. **PROVIDE VERIFICATION STEPS**:',
    '   - List how to test that the issue is resolved',
    '   - Include specific commands to run or behaviors to verify',
    '   - Mention any regression testing that should be done',
    '',
    'Please format your response as a detailed markdown document that will be saved as a resolution plan.',
    'The plan should be comprehensive, actionable, and include all necessary context for future reference.',
    '',
    '=== END INVESTIGATION REQUEST ===',
    ''
  ];

  return contextLines.join('\n');
}

async function executeClaudeInvestigation(prompt: string, executionId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      '--print',
      '--output-format', 'text',
      prompt
    ];

    console.log(`[${executionId}] Starting Claude CLI investigation`);
    
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
        console.log(`[${executionId}] Investigation timeout (5m), terminating process`);
        isComplete = true;
        claudeProcess.kill('SIGTERM');
        setTimeout(() => claudeProcess.kill('SIGKILL'), 2000);
        reject(new Error('Claude CLI investigation timeout (5 minutes)'));
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
      
      console.log(`[${executionId}] Claude CLI investigation completed with code ${code}`);
      console.log(`[${executionId}] stdout length: ${stdout.length}, stderr length: ${stderr.length}`);
      
      if (code === 0) {
        const result = stdout.trim() || 'Investigation completed but no output received';
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
  });
}

function generatePlanFileName(issue: Issue): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                   new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].substring(0, 6);
  const sanitizedTitle = issue.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  
  return `${timestamp}_${issue.pageId}_${sanitizedTitle}.md`;
}

function savePlanFile(issue: Issue, planContent: string): string {
  const fileName = generatePlanFileName(issue);
  const issuesDir = join(PROJECT_ROOT, 'src', 'pages', issue.pageId, 'issues');
  
  // Ensure directory exists
  if (!existsSync(issuesDir)) {
    mkdirSync(issuesDir, { recursive: true });
  }
  
  const filePath = join(issuesDir, fileName);
  const relativePath = `src/components/${issue.pageId}/issues/${fileName}`;
  
  // Create comprehensive plan document
  const planDocument = `# Issue Investigation Plan

**Issue ID**: ${issue.id}  
**Page**: ${issue.pageId}  
**Generated**: ${new Date().toISOString()}  
**Status**: Investigation Complete

## Issue Summary

**Title**: ${issue.title}

**Description**: ${issue.description}

**Tags**: ${issue.tags?.join(', ') || 'None'}

---

## Investigation Results

${planContent}

---

## Implementation Notes

This plan was generated by Claude CLI investigation and should be executed by a software engineering agent.

**File Location**: \`${relativePath}\`  
**Next Steps**: Follow the resolution plan above to implement the fix.

## Status Tracking

- [ ] Plan Generated ✅
- [ ] Investigation Reviewed
- [ ] Implementation Started
- [ ] Solution Tested
- [ ] Issue Resolved

---

*Generated by AVA Dashboard Issue Tracker*
`;

  writeFileSync(filePath, planDocument, 'utf-8');
  console.log(`Plan saved to: ${filePath}`);
  
  return relativePath;
}

function updateIssueStatus(issue: Issue, planFilePath: string): void {
  try {
    const issuesFilePath = join(PROJECT_ROOT, 'src', 'pages', issue.pageId, 'issues', 'issues.json');
    
    let issues = [];
    if (existsSync(issuesFilePath)) {
      const content = readFileSync(issuesFilePath, 'utf-8');
      const data = JSON.parse(content);
      issues = Array.isArray(data.issues) ? data.issues : [];
    }
    
    // Update the specific issue
    const issueIndex = issues.findIndex((i: Issue) => i.id === issue.id);
    if (issueIndex >= 0) {
      issues[issueIndex] = {
        ...issues[issueIndex],
        status: 'planned',
        planFilePath
      };
      
      const data = {
        issues,
        lastUpdated: new Date().toISOString(),
        pageId: issue.pageId
      };
      
      writeFileSync(issuesFilePath, JSON.stringify(data, null, 2));
      console.log(`Issue ${issue.id} status updated to 'planned'`);
    }
  } catch (error) {
    console.error('Error updating issue status:', error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<GeneratePlanResponse>> {
  try {
    const body: GeneratePlanRequest = await request.json();
    
    if (!body.issue || !body.issue.id || !body.issue.pageId) {
      return NextResponse.json(
        { success: false, error: 'Invalid issue data' },
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
    
    // Build investigation prompt
    const investigationPrompt = buildInvestigationPrompt(body.issue);

    // Execute Claude CLI investigation
    console.log(`[${executionId}] Starting investigation for issue: ${body.issue.title}`);
    const investigationResult = await executeClaudeInvestigation(investigationPrompt, executionId);
    
    // Save plan file
    const planFilePath = savePlanFile(body.issue, investigationResult);
    
    // Update issue status
    updateIssueStatus(body.issue, planFilePath);
    
    return NextResponse.json({
      success: true,
      planFilePath,
      executionId
    });

  } catch (error) {
    console.error('Error generating investigation plan:', error);
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
    service: 'issue-plan-generator',
    timestamp: new Date().toISOString(),
    claudeCliPath: CLAUDE_CLI_PATH,
    claudeCliExists: existsSync(CLAUDE_CLI_PATH),
    timeout: EXECUTION_TIMEOUT,
    projectRoot: PROJECT_ROOT
  });
}