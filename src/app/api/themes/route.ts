/**
 * Themes API - Main endpoint for theme operations
 * GET /api/themes - Get all themes
 * POST /api/themes - Create new theme
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ThemeRecord, RuntimeTheme, ThemeVariationRecord, ThemeVariationSummary } from "@/components/_shared/types/theme";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Convert theme properties to CSS custom properties
 */
function convertToCSS(theme: ThemeRecord | ThemeVariationRecord): Record<string, string> {
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
  
  return cssProperties;
}

/**
 * Convert theme record to runtime theme with CSS properties
 */
function themeToRuntime(theme: ThemeRecord, variations?: ThemeVariationSummary[]): RuntimeTheme {
  return {
    id: theme.id,
    name: theme.name,
    displayName: theme.display_name,
    category: theme.category,
    cssProperties: convertToCSS(theme),
    type: 'theme',
    variations
  };
}

/**
 * Convert theme variation to runtime theme
 */
function variationToRuntime(variation: ThemeVariationRecord, parentCategory: string): RuntimeTheme {
  return {
    id: variation.id,
    name: variation.name,
    displayName: variation.display_name,
    category: parentCategory as any,
    cssProperties: convertToCSS(variation),
    type: 'variation',
    parentThemeId: variation.parent_theme_id
  };
}

/**
 * GET /api/themes
 * Retrieve all themes with their variations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includeCustom = searchParams.get('includeCustom') !== 'false';
    const includeVariations = searchParams.get('includeVariations') !== 'false';
    
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
    
    // Fetch variations if requested
    let variationsMap: Map<string, ThemeVariationSummary[]> = new Map();
    if (includeVariations && themes && themes.length > 0) {
      const themeIds = themes.map(t => t.id);
      const { data: variations, error: variationsError } = await supabase
        .from('theme_variations')
        .select('id, parent_theme_id, name, display_name, page_id, created_at, variation_depth')
        .in('parent_theme_id', themeIds)
        .order('created_at', { ascending: false });
      
      if (!variationsError && variations) {
        variations.forEach((v: any) => {
          const summary: ThemeVariationSummary = {
            id: v.id,
            name: v.name,
            displayName: v.display_name,
            pageId: v.page_id,
            createdAt: v.created_at,
            variationDepth: v.variation_depth
          };
          
          if (!variationsMap.has(v.parent_theme_id)) {
            variationsMap.set(v.parent_theme_id, []);
          }
          variationsMap.get(v.parent_theme_id)!.push(summary);
        });
      }
    }
    
    const runtimeThemes = themes?.map(theme => 
      themeToRuntime(theme, variationsMap.get(theme.id))
    ) || [];
    
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