import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { variationId: string } }
) {
  try {
    const { variationId } = params;

    const { data, error } = await supabase
      .from('theme_variations')
      .select('*')
      .eq('id', variationId)
      .single();

    if (error) {
      console.error('Error fetching theme variation:', error);
      return NextResponse.json(
        { error: 'Theme variation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/themes/variations/[variationId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { variationId: string } }
) {
  try {
    const { variationId } = params;
    const updates = await request.json();

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.parent_theme_id;
    delete updates.created_at;
    delete updates.lineage_path;
    delete updates.variation_depth;

    const { data, error } = await supabase
      .from('theme_variations')
      .update(updates)
      .eq('id', variationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating theme variation:', error);
      return NextResponse.json(
        { error: 'Failed to update theme variation' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/themes/variations/[variationId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { variationId: string } }
) {
  try {
    const { variationId } = params;

    const { error } = await supabase
      .from('theme_variations')
      .delete()
      .eq('id', variationId);

    if (error) {
      console.error('Error deleting theme variation:', error);
      return NextResponse.json(
        { error: 'Failed to delete theme variation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/themes/variations/[variationId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}