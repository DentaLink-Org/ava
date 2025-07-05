import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/components/playground/documentations/api/supabase-client';

export async function PUT(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    const body = await request.json();
    const { block_ids, new_positions } = body;

    if (!block_ids || !new_positions || block_ids.length !== new_positions.length) {
      return NextResponse.json(
        { error: 'Invalid request: block_ids and new_positions must be arrays of equal length' },
        { status: 400 }
      );
    }

    const { error } = await supabase.rpc('reorder_blocks', {
      p_document_id: params.docId,
      p_block_ids: block_ids,
      p_new_positions: new_positions,
    });

    if (error) {
      console.error('Error reordering blocks:', error);
      return NextResponse.json(
        { error: 'Failed to reorder blocks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error reordering blocks:', error);
    return NextResponse.json(
      { error: 'Failed to reorder blocks' },
      { status: 500 }
    );
  }
}