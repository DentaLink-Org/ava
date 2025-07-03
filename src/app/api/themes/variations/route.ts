import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ThemeVariationRecord } from '@/pages/_shared/types/theme';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parentThemeId = searchParams.get('parentThemeId');
    const pageId = searchParams.get('pageId');

    let query = supabase
      .from('theme_variations')
      .select('*')
      .order('created_at', { ascending: false });

    if (parentThemeId) {
      query = query.eq('parent_theme_id', parentThemeId);
    }

    if (pageId) {
      query = query.eq('page_id', pageId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching theme variations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch theme variations' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/themes/variations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parentThemeId, variation } = body;

    if (!parentThemeId || !variation) {
      return NextResponse.json(
        { error: 'Parent theme ID and variation data are required' },
        { status: 400 }
      );
    }

    // Generate unique name for variation
    const timestamp = Date.now();
    const variationName = `${variation.name || 'variation'}-${timestamp}`;

    const { data, error } = await supabase
      .from('theme_variations')
      .insert({
        parent_theme_id: parentThemeId,
        name: variationName,
        display_name: variation.display_name || variation.name || 'Custom Variation',
        description: variation.description,
        page_id: variation.page_id,
        colors: variation.colors,
        typography: variation.typography,
        spacing: variation.spacing,
        shadows: variation.shadows,
        borders: variation.borders,
        author: variation.author || 'User',
        version: variation.version || '1.0.0'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating theme variation:', error);
      return NextResponse.json(
        { error: 'Failed to create theme variation' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/themes/variations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}