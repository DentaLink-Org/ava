import { NextRequest, NextResponse } from 'next/server';
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

interface IssuesResponse {
  success: boolean;
  issues?: Issue[];
  error?: string;
}

const PROJECT_ROOT = '/Users/derakhshani/Documents/GitHub/AVI-Tech/ava';

function getIssuesFilePath(pageId: string): string {
  return join(PROJECT_ROOT, 'src', 'pages', pageId, 'issues', 'issues.json');
}

function ensureIssuesDirectory(pageId: string): void {
  const issuesDir = join(PROJECT_ROOT, 'src', 'pages', pageId, 'issues');
  if (!existsSync(issuesDir)) {
    mkdirSync(issuesDir, { recursive: true });
  }
}

function loadIssues(pageId: string): Issue[] {
  try {
    const filePath = getIssuesFilePath(pageId);
    if (!existsSync(filePath)) {
      return [];
    }
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data.issues) ? data.issues : [];
  } catch (error) {
    console.error('Error loading issues:', error);
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

// GET /api/issues?pageId=playground
export async function GET(request: NextRequest): Promise<NextResponse<IssuesResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    if (!pageId) {
      return NextResponse.json(
        { success: false, error: 'pageId parameter is required' },
        { status: 400 }
      );
    }

    const issues = loadIssues(pageId);
    
    return NextResponse.json({
      success: true,
      issues: issues.map(issue => ({
        ...issue,
        createdAt: typeof issue.createdAt === 'string' ? issue.createdAt : new Date(issue.createdAt).toISOString()
      }))
    });

  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// POST /api/issues
export async function POST(request: NextRequest): Promise<NextResponse<IssuesResponse>> {
  try {
    const body = await request.json();
    const { issue } = body;

    if (!issue || !issue.pageId || !issue.title || !issue.description) {
      return NextResponse.json(
        { success: false, error: 'Invalid issue data' },
        { status: 400 }
      );
    }

    const issues = loadIssues(issue.pageId);
    const newIssue: Issue = {
      id: issue.id || Date.now().toString(),
      title: issue.title,
      description: issue.description,
      status: issue.status || 'unchecked',
      pageId: issue.pageId,
      createdAt: issue.createdAt || new Date().toISOString(),
      tags: issue.tags || [],
      planFilePath: issue.planFilePath,
      source: issue.source || 'manual',
      githubIssueNumber: issue.githubIssueNumber,
      githubUrl: issue.githubUrl
    };

    // Check if issue already exists (for updates)
    const existingIndex = issues.findIndex(i => i.id === newIssue.id);
    if (existingIndex >= 0) {
      issues[existingIndex] = newIssue;
    } else {
      issues.unshift(newIssue);
    }

    saveIssues(issue.pageId, issues);

    return NextResponse.json({
      success: true,
      issues: [newIssue]
    });

  } catch (error) {
    console.error('Error creating/updating issue:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/issues
export async function PUT(request: NextRequest): Promise<NextResponse<IssuesResponse>> {
  return POST(request); // Reuse POST logic for updates
}

// Health check
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    service: 'issues-api',
    timestamp: new Date().toISOString(),
    projectRoot: PROJECT_ROOT
  });
}