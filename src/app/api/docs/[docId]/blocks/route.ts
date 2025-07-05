import { NextRequest, NextResponse } from 'next/server';
import { BlocksClient, documentsClient } from '@/components/playground/documentations/api/supabase-client';
import { DocumentTableInsert } from '@/components/playground/documentations/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { docId: string } }
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

    const searchParams = request.nextUrl.searchParams;
    const blockTypes = searchParams.get('blockTypes')?.split(',');
    const searchTerm = searchParams.get('searchTerm');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const blocks = await blocksClient.listBlocks({
      documentId: params.docId,
      blockTypes,
      searchTerm: searchTerm || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return NextResponse.json({ blocks }, { status: 200 });
  } catch (error) {
    console.error('Error listing blocks:', error);
    return NextResponse.json(
      { error: 'Failed to list blocks' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { docId: string } }
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
    const { block_type, content, order_index, metadata, created_by } = body;

    if (!block_type || !content || order_index === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: block_type, content, order_index' },
        { status: 400 }
      );
    }

    const blockData: DocumentTableInsert = {
      block_type,
      content,
      order_index,
      metadata,
      created_by,
    };

    const block = await blocksClient.createBlock(blockData);

    if (!block) {
      return NextResponse.json(
        { error: 'Failed to create block' },
        { status: 500 }
      );
    }

    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    console.error('Error creating block:', error);
    return NextResponse.json(
      { error: 'Failed to create block' },
      { status: 500 }
    );
  }
}