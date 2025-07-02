/**
 * Theme API Test Endpoint
 * Simple endpoint to test theme system without database
 */

import { NextRequest, NextResponse } from 'next/server';
import { RuntimeTheme } from '@/pages/_shared/types/theme';

// Mock themes for testing
const mockThemes: RuntimeTheme[] = [
  {
    id: 'default-light',
    name: 'default-light',
    displayName: 'Default Light',
    category: 'light',
    cssProperties: {
      '--color-primary': '#3b82f6',
      '--color-secondary': '#1d4ed8',
      '--color-background': '#ffffff',
      '--color-surface': '#f9fafb',
      '--color-text': '#111827',
      '--color-text-secondary': '#6b7280',
      '--color-success': '#10b981',
      '--color-warning': '#f59e0b',
      '--color-error': '#ef4444',
      '--color-info': '#3b82f6',
      '--color-border': '#e5e7eb',
      '--font-family': 'Inter, system-ui, sans-serif',
      '--spacing-base': '1rem',
      '--shadow-base': '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }
  },
  {
    id: 'dashboard-orange',
    name: 'dashboard-orange',
    displayName: 'Dashboard Orange',
    category: 'colorful',
    cssProperties: {
      '--color-primary': '#f97316',
      '--color-secondary': '#ea580c',
      '--color-background': '#fafafa',
      '--color-surface': '#ffffff',
      '--color-text': '#111827',
      '--color-text-secondary': '#6b7280',
      '--color-success': '#10b981',
      '--color-warning': '#f59e0b',
      '--color-error': '#ef4444',
      '--color-info': '#3b82f6',
      '--color-border': '#e5e7eb',
      '--font-family': 'Inter, system-ui, sans-serif',
      '--spacing-base': '1rem',
      '--shadow-base': '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }
  },
  {
    id: 'tasks-purple',
    name: 'tasks-purple',
    displayName: 'Tasks Purple',
    category: 'colorful',
    cssProperties: {
      '--color-primary': '#8b5cf6',
      '--color-secondary': '#7c3aed',
      '--color-background': '#fafafa',
      '--color-surface': '#ffffff',
      '--color-text': '#1f2937',
      '--color-text-secondary': '#6b7280',
      '--color-success': '#10b981',
      '--color-warning': '#f59e0b',
      '--color-error': '#ef4444',
      '--color-info': '#3b82f6',
      '--color-border': '#e5e7eb',
      '--font-family': 'Inter, system-ui, sans-serif',
      '--spacing-base': '1rem',
      '--shadow-base': '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }
  },
  {
    id: 'dark-slate',
    name: 'dark-slate',
    displayName: 'Dark Slate',
    category: 'dark',
    cssProperties: {
      '--color-primary': '#6366f1',
      '--color-secondary': '#4f46e5',
      '--color-background': '#0f172a',
      '--color-surface': '#1e293b',
      '--color-text': '#f1f5f9',
      '--color-text-secondary': '#94a3b8',
      '--color-success': '#22c55e',
      '--color-warning': '#eab308',
      '--color-error': '#ef4444',
      '--color-info': '#3b82f6',
      '--color-border': '#334155',
      '--font-family': 'Inter, system-ui, sans-serif',
      '--spacing-base': '1rem',
      '--shadow-base': '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }
  }
];

/**
 * GET /api/themes/test
 * Return mock themes for testing
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: mockThemes
  });
}

/**
 * POST /api/themes/test
 * Apply mock theme (for testing)
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get('pageId') || 'dashboard';
  const { themeId } = await request.json();

  const theme = mockThemes.find(t => t.id === themeId);
  
  if (!theme) {
    return NextResponse.json({
      success: false,
      error: 'Theme not found'
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: theme,
    message: `Applied ${theme.displayName} to ${pageId}`
  });
}