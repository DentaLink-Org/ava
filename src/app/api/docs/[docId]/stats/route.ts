import { NextRequest, NextResponse } from 'next/server';
import { documentsClient } from '@/components/playground/documentations/api/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    const stats = await documentsClient.getDocumentStats(params.docId);

    if (!stats) {
      return NextResponse.json(
        { error: 'Failed to get document statistics' },
        { status: 500 }
      );
    }

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('Error getting document stats:', error);
    return NextResponse.json(
      { error: 'Failed to get document statistics' },
      { status: 500 }
    );
  }
}