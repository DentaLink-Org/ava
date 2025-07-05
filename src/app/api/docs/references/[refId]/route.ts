import { NextRequest, NextResponse } from 'next/server';
import { referencesClient } from '@/components/playground/documentations/api/supabase-client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { refId: string } }
) {
  try {
    const success = await referencesClient.deleteReference(params.refId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete reference' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting reference:', error);
    return NextResponse.json(
      { error: 'Failed to delete reference' },
      { status: 500 }
    );
  }
}