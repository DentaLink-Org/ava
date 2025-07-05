import { NextRequest, NextResponse } from 'next/server';
import { documentsClient } from '@/components/playground/documentations/api/supabase-client';
import { DocumentMetadataInsert } from '@/components/playground/documentations/types/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const database_id = searchParams.get('database_id');
    const created_by = searchParams.get('created_by');
    const is_public = searchParams.get('is_public');
    const tags = searchParams.get('tags');

    const filters: any = {};
    if (database_id) filters.database_id = database_id;
    if (created_by) filters.created_by = created_by;
    if (is_public !== null) filters.is_public = is_public === 'true';
    if (tags) filters.tags = tags.split(',');

    const documents = await documentsClient.listDocuments(filters);

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json(
      { error: 'Failed to list documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, database_id, created_by, description, tags, is_public } = body;

    if (!name || !database_id || !created_by) {
      return NextResponse.json(
        { error: 'Missing required fields: name, database_id, created_by' },
        { status: 400 }
      );
    }

    const document = await documentsClient.createDocument({
      name,
      database_id,
      created_by,
      description,
      tags,
      is_public,
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Failed to create document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}