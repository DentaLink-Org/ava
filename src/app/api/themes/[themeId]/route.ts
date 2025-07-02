/**
 * Theme Detail API - Individual theme operations
 * GET /api/themes/[themeId] - Get specific theme
 * PUT /api/themes/[themeId] - Update theme
 * DELETE /api/themes/[themeId] - Delete theme
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ThemeRecord, RuntimeTheme } from '@/pages/_shared/types/theme';

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
 * GET /api/themes/[themeId]
 * Get specific theme by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { themeId: string } }
) {
  try {
    const { themeId } = params;
    
    const { data: theme, error } = await supabase
      .from('themes')
      .select('*')
      .eq('id', themeId)
      .single();
    
    if (error || !theme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }
    
    const runtimeTheme = themeToRuntime(theme);
    
    return NextResponse.json({
      success: true,
      data: runtimeTheme
    });
    
  } catch (error) {
    console.error('Theme fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/themes/[themeId]
 * Update existing theme
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { themeId: string } }
) {
  try {
    const { themeId } = params;
    const updates = await request.json();
    
    // Check if theme exists and is not system theme
    const { data: existingTheme, error: fetchError } = await supabase
      .from('themes')
      .select('is_system')
      .eq('id', themeId)
      .single();
    
    if (fetchError || !existingTheme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }
    
    if (existingTheme.is_system) {
      return NextResponse.json(
        { success: false, error: 'Cannot modify system themes' },
        { status: 403 }
      );
    }
    
    // Update theme
    const { data: theme, error } = await supabase
      .from('themes')
      .update(updates)
      .eq('id', themeId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating theme:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update theme' },
        { status: 500 }
      );
    }
    
    const runtimeTheme = themeToRuntime(theme);
    
    return NextResponse.json({
      success: true,
      data: runtimeTheme
    });
    
  } catch (error) {
    console.error('Theme update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/themes/[themeId]
 * Delete theme
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { themeId: string } }
) {
  try {
    const { themeId } = params;
    
    // Check if theme exists and is not system theme
    const { data: existingTheme, error: fetchError } = await supabase
      .from('themes')
      .select('is_system, is_default')
      .eq('id', themeId)
      .single();
    
    if (fetchError || !existingTheme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }
    
    if (existingTheme.is_system || existingTheme.is_default) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete system or default themes' },
        { status: 403 }
      );
    }
    
    // Delete theme
    const { error } = await supabase
      .from('themes')
      .delete()
      .eq('id', themeId);
    
    if (error) {
      console.error('Error deleting theme:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete theme' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Theme deleted successfully'
    });
    
  } catch (error) {
    console.error('Theme deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}