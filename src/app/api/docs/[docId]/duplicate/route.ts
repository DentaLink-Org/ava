import { NextRequest, NextResponse } from 'next/server';
import { documentsClient } from '@/components/playground/documentations/api/supabase-client';

export async function POST(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    const body = await request.json();
    const { new_name, created_by } = body;

    if (!new_name || !created_by) {
      return NextResponse.json(
        { error: 'Missing required fields: new_name, created_by' },
        { status: 400 }
      );
    }

    const newDocId = await documentsClient.duplicateDocument(
      params.docId,
      new_name,
      created_by
    );

    if (!newDocId) {
      return NextResponse.json(
        { error: 'Failed to duplicate document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ document_id: newDocId }, { status: 201 });
  } catch (error) {
    console.error('Error duplicating document:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate document' },
      { status: 500 }
    );
  }
}