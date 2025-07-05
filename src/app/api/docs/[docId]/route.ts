import { NextRequest, NextResponse } from 'next/server';
import { documentsClient } from '@/components/playground/documentations/api/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeBlocks = searchParams.get('includeBlocks') !== 'false';
    const includeReferences = searchParams.get('includeReferences') === 'true';
    const blockLimit = searchParams.get('blockLimit');
    const orderBy = searchParams.get('orderBy') as any;
    const orderDirection = searchParams.get('orderDirection') as any;

    const document = await documentsClient.getDocument(params.docId, {
      includeBlocks,
      includeReferences,
      blockLimit: blockLimit ? parseInt(blockLimit) : undefined,
      orderBy,
      orderDirection,
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ document }, { status: 200 });
  } catch (error) {
    console.error('Error getting document:', error);
    return NextResponse.json(
      { error: 'Failed to get document' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    const body = await request.json();
    const { doc_name, description, tags, is_public, permissions, metadata } = body;

    const updates: any = {};
    if (doc_name !== undefined) updates.doc_name = doc_name;
    if (description !== undefined) updates.description = description;
    if (tags !== undefined) updates.tags = tags;
    if (is_public !== undefined) updates.is_public = is_public;
    if (permissions !== undefined) updates.permissions = permissions;
    if (metadata !== undefined) updates.metadata = metadata;

    const document = await documentsClient.updateDocument(params.docId, updates);

    if (!document) {
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ document }, { status: 200 });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    const success = await documentsClient.deleteDocument(params.docId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}