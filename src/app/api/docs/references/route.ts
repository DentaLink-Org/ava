import { NextRequest, NextResponse } from 'next/server';
import { referencesClient } from '@/components/playground/documentations/api/supabase-client';
import { ReferenceTrackingInsert } from '@/components/playground/documentations/types/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('documentId');
    const blockId = searchParams.get('blockId');
    const referenceType = searchParams.get('referenceType');
    const includeIncoming = searchParams.get('includeIncoming') !== 'false';
    const includeOutgoing = searchParams.get('includeOutgoing') !== 'false';

    const references = await referencesClient.getReferences({
      documentId: documentId || undefined,
      blockId: blockId || undefined,
      referenceType: referenceType || undefined,
      includeIncoming,
      includeOutgoing,
    });

    return NextResponse.json({ references }, { status: 200 });
  } catch (error) {
    console.error('Error getting references:', error);
    return NextResponse.json(
      { error: 'Failed to get references' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      source_doc_id,
      source_block_id,
      target_doc_id,
      target_block_id,
      reference_type,
      created_by,
      metadata,
    } = body;

    if (!source_doc_id || !source_block_id || !target_doc_id || !reference_type || !created_by) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: source_doc_id, source_block_id, target_doc_id, reference_type, created_by' 
        },
        { status: 400 }
      );
    }

    const referenceData: ReferenceTrackingInsert = {
      source_doc_id,
      source_block_id,
      target_doc_id,
      target_block_id,
      reference_type,
    };

    const reference = await referencesClient.createReference(referenceData);

    if (!reference) {
      return NextResponse.json(
        { error: 'Failed to create reference' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reference }, { status: 201 });
  } catch (error) {
    console.error('Error creating reference:', error);
    return NextResponse.json(
      { error: 'Failed to create reference' },
      { status: 500 }
    );
  }
}