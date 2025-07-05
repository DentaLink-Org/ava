import { NextRequest, NextResponse } from 'next/server';
import { BlocksClient, documentsClient } from '@/components/playground/documentations/api/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { docId: string; blockId: string } }
) {
  try {
    // Get document metadata to find table name
    const document = await documentsClient.getDocument(params.docId, {
      includeBlocks: false,
      includeReferences: false,
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const blocksClient = new BlocksClient(document.metadata.table_name);
    const block = await blocksClient.getBlock(params.blockId);

    if (!block) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ block }, { status: 200 });
  } catch (error) {
    console.error('Error getting block:', error);
    return NextResponse.json(
      { error: 'Failed to get block' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { docId: string; blockId: string } }
) {
  try {
    // Get document metadata to find table name
    const document = await documentsClient.getDocument(params.docId, {
      includeBlocks: false,
      includeReferences: false,
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const blocksClient = new BlocksClient(document.metadata.table_name);
    const body = await request.json();
    const { block_type, content, order_index, metadata } = body;

    const updates: any = {};
    if (block_type !== undefined) updates.block_type = block_type;
    if (content !== undefined) updates.content = content;
    if (order_index !== undefined) updates.order_index = order_index;
    if (metadata !== undefined) updates.metadata = metadata;

    const block = await blocksClient.updateBlock(params.blockId, updates);

    if (!block) {
      return NextResponse.json(
        { error: 'Failed to update block' },
        { status: 500 }
      );
    }

    return NextResponse.json({ block }, { status: 200 });
  } catch (error) {
    console.error('Error updating block:', error);
    return NextResponse.json(
      { error: 'Failed to update block' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { docId: string; blockId: string } }
) {
  try {
    // Get document metadata to find table name
    const document = await documentsClient.getDocument(params.docId, {
      includeBlocks: false,
      includeReferences: false,
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const blocksClient = new BlocksClient(document.metadata.table_name);
    const success = await blocksClient.deleteBlock(params.blockId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete block' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting block:', error);
    return NextResponse.json(
      { error: 'Failed to delete block' },
      { status: 500 }
    );
  }
}