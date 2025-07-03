/**
 * Page Theme Assignment API
 * GET /api/themes/pages/[pageId] - Get theme for specific page
 * POST /api/themes/pages/[pageId] - Assign theme to page
 * DELETE /api/themes/pages/[pageId] - Reset page to default theme
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { RuntimeTheme, ThemeRecord, ThemeVariationRecord } from "@/components/_shared/types/theme";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxMjM0NTYsImV4cCI6MTk2MDY5OTQ1Nn0.placeholder';

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
 * Convert theme record to runtime theme
 */
function themeToRuntime(theme: ThemeRecord): RuntimeTheme {
  return {
    id: theme.id,
    name: theme.name,
    displayName: theme.display_name,
    category: theme.category,
    cssProperties: convertToCSS(theme),
    type: 'theme'
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
        theme_variation_id,
        is_variation,
        themes (*),
        theme_variations (*)
      `)
      .eq('page_id', pageId)
      .single();
    
    let runtimeTheme: RuntimeTheme | null = null;
    
    if (assignment) {
      if (assignment.is_variation && assignment.theme_variations && !Array.isArray(assignment.theme_variations)) {
        // Page uses a theme variation
        const variation = assignment.theme_variations as ThemeVariationRecord;
        // Get parent theme category
        const { data: parentTheme } = await supabase
          .from('themes')
          .select('category')
          .eq('id', variation.parent_theme_id)
          .single();
        
        runtimeTheme = variationToRuntime(variation, parentTheme?.category || 'custom');
      } else if (assignment.themes && !Array.isArray(assignment.themes)) {
        // Page uses a regular theme
        const theme = assignment.themes as ThemeRecord;
        runtimeTheme = themeToRuntime(theme);
      }
    }
    
    if (!runtimeTheme) {
      // If no assignment or theme not found, get default theme
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
      
      runtimeTheme = themeToRuntime(defaultTheme);
    }
    
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
    const { themeId, isVariation = false } = await request.json();
    
    if (!themeId) {
      return NextResponse.json(
        { success: false, error: 'Theme ID is required' },
        { status: 400 }
      );
    }
    
    let runtimeTheme: RuntimeTheme;
    let assignmentData: any = { page_id: pageId, is_variation: isVariation };
    
    if (isVariation) {
      // Verify variation exists
      const { data: variation, error: variationError } = await supabase
        .from('theme_variations')
        .select('*')
        .eq('id', themeId)
        .single();
      
      if (variationError || !variation) {
        return NextResponse.json(
          { success: false, error: 'Theme variation not found' },
          { status: 404 }
        );
      }
      
      // Get parent theme category
      const { data: parentTheme } = await supabase
        .from('themes')
        .select('category')
        .eq('id', variation.parent_theme_id)
        .single();
      
      runtimeTheme = variationToRuntime(variation, parentTheme?.category || 'custom');
      assignmentData.theme_variation_id = themeId;
      assignmentData.theme_id = variation.parent_theme_id; // Keep reference to parent theme
    } else {
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
      
      runtimeTheme = themeToRuntime(theme);
      assignmentData.theme_id = themeId;
      assignmentData.theme_variation_id = null; // Clear any existing variation
    }
    
    // Upsert page theme assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('page_theme_assignments')
      .upsert(assignmentData, { onConflict: 'page_id' })
      .select()
      .single();
    
    if (assignmentError) {
      console.error('Error assigning theme:', assignmentError);
      return NextResponse.json(
        { success: false, error: 'Failed to assign theme' },
        { status: 500 }
      );
    }
    
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