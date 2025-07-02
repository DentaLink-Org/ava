/**
 * Page Theme Assignment API
 * GET /api/themes/pages/[pageId] - Get theme for specific page
 * POST /api/themes/pages/[pageId] - Assign theme to page
 * DELETE /api/themes/pages/[pageId] - Reset page to default theme
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { RuntimeTheme, ThemeRecord } from '@/pages/_shared/types/theme';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Convert theme record to runtime theme with CSS properties
 */
function themeToRuntime(theme: ThemeRecord): RuntimeTheme {
  const cssProperties: Record<string, string> = {};
  
  // Convert colors to CSS custom properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    cssProperties[`--color-${key}`] = value;
  });
  
  // Convert typography if present
  if (theme.typography) {
    if (theme.typography.fontFamily) {
      cssProperties['--font-family'] = theme.typography.fontFamily;
    }
    if (theme.typography.fontSize) {
      Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
        cssProperties[`--font-size-${key}`] = value;
      });
    }
  }
  
  // Convert spacing if present
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([key, value]) => {
      cssProperties[`--spacing-${key}`] = value;
    });
  }
  
  // Convert shadows if present
  if (theme.shadows) {
    Object.entries(theme.shadows).forEach(([key, value]) => {
      cssProperties[`--shadow-${key}`] = value;
    });
  }
  
  // Convert borders if present
  if (theme.borders) {
    if (theme.borders.radius) {
      Object.entries(theme.borders.radius).forEach(([key, value]) => {
        cssProperties[`--radius-${key}`] = value;
      });
    }
  }
  
  return {
    id: theme.id,
    name: theme.name,
    displayName: theme.display_name,
    category: theme.category,
    cssProperties
  };
}

/**
 * GET /api/themes/pages/[pageId]
 * Get current theme for a specific page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const { pageId } = params;
    
    // First, try to get page-specific theme assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('page_theme_assignments')
      .select(`
        theme_id,
        themes (*)
      `)
      .eq('page_id', pageId)
      .single();
    
    let theme: ThemeRecord | null = null;
    
    if (assignment && assignment.themes && !Array.isArray(assignment.themes)) {
      theme = assignment.themes as ThemeRecord;
    } else {
      // If no assignment, get default theme
      const { data: defaultTheme, error: defaultError } = await supabase
        .from('themes')
        .select('*')
        .eq('is_default', true)
        .single();
      
      if (defaultError) {
        console.error('Error fetching default theme:', defaultError);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch theme' },
          { status: 500 }
        );
      }
      
      theme = defaultTheme;
    }
    
    if (!theme) {
      return NextResponse.json(
        { success: false, error: 'No theme found' },
        { status: 404 }
      );
    }
    
    const runtimeTheme = themeToRuntime(theme);
    
    return NextResponse.json({
      success: true,
      data: runtimeTheme,
      isAssigned: !!assignment
    });
    
  } catch (error) {
    console.error('Page theme fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/themes/pages/[pageId]
 * Assign a theme to a specific page
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const { pageId } = params;
    const { themeId } = await request.json();
    
    if (!themeId) {
      return NextResponse.json(
        { success: false, error: 'Theme ID is required' },
        { status: 400 }
      );
    }
    
    // Verify theme exists
    const { data: theme, error: themeError } = await supabase
      .from('themes')
      .select('*')
      .eq('id', themeId)
      .single();
    
    if (themeError || !theme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }
    
    // Upsert page theme assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('page_theme_assignments')
      .upsert(
        { page_id: pageId, theme_id: themeId },
        { onConflict: 'page_id' }
      )
      .select()
      .single();
    
    if (assignmentError) {
      console.error('Error assigning theme:', assignmentError);
      return NextResponse.json(
        { success: false, error: 'Failed to assign theme' },
        { status: 500 }
      );
    }
    
    const runtimeTheme = themeToRuntime(theme);
    
    return NextResponse.json({
      success: true,
      data: runtimeTheme,
      assignment: assignment
    });
    
  } catch (error) {
    console.error('Theme assignment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/themes/pages/[pageId]
 * Remove theme assignment for a page (reset to default)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const { pageId } = params;
    
    // Delete page theme assignment
    const { error } = await supabase
      .from('page_theme_assignments')
      .delete()
      .eq('page_id', pageId);
    
    if (error) {
      console.error('Error removing theme assignment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to remove theme assignment' },
        { status: 500 }
      );
    }
    
    // Get default theme
    const { data: defaultTheme, error: defaultError } = await supabase
      .from('themes')
      .select('*')
      .eq('is_default', true)
      .single();
    
    if (defaultError) {
      console.error('Error fetching default theme:', defaultError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch default theme' },
        { status: 500 }
      );
    }
    
    const runtimeTheme = themeToRuntime(defaultTheme);
    
    return NextResponse.json({
      success: true,
      data: runtimeTheme,
      message: 'Theme assignment removed, reverted to default'
    });
    
  } catch (error) {
    console.error('Theme assignment removal error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}