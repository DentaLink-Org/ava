/**
 * Themes API - Main endpoint for theme operations
 * GET /api/themes - Get all themes
 * POST /api/themes - Create new theme
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
    if (theme.typography.fontWeight) {
      Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
        cssProperties[`--font-weight-${key}`] = value;
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
    if (theme.borders.width) {
      Object.entries(theme.borders.width).forEach(([key, value]) => {
        cssProperties[`--border-width-${key}`] = value;
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
 * GET /api/themes
 * Retrieve all themes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includeCustom = searchParams.get('includeCustom') !== 'false';
    
    let query = supabase
      .from('themes')
      .select('*')
      .order('is_default', { ascending: false })
      .order('is_system', { ascending: false })
      .order('created_at', { ascending: true });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (!includeCustom) {
      query = query.eq('is_system', true);
    }
    
    const { data: themes, error } = await query;
    
    if (error) {
      console.error('Error fetching themes:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch themes' },
        { status: 500 }
      );
    }
    
    const runtimeThemes = themes?.map(themeToRuntime) || [];
    
    return NextResponse.json({
      success: true,
      data: runtimeThemes
    });
    
  } catch (error) {
    console.error('Themes API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/themes
 * Create a new theme
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      display_name,
      description,
      category,
      colors,
      typography,
      spacing,
      shadows,
      borders,
      author
    } = body;
    
    // Validate required fields
    if (!name || !display_name || !category || !colors) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Insert new theme
    const { data: theme, error } = await supabase
      .from('themes')
      .insert([{
        name,
        display_name,
        description,
        category,
        colors,
        typography,
        spacing,
        shadows,
        borders,
        author,
        is_system: false,
        is_default: false
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating theme:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create theme' },
        { status: 500 }
      );
    }
    
    const runtimeTheme = themeToRuntime(theme);
    
    return NextResponse.json({
      success: true,
      data: runtimeTheme
    }, { status: 201 });
    
  } catch (error) {
    console.error('Theme creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}