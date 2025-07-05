import { NextRequest, NextResponse } from 'next/server';
import { referencesClient } from '@/components/playground/documentations/api/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document_id } = body;

    const validationResults = await referencesClient.validateReferences(document_id);

    return NextResponse.json({ validation_results: validationResults }, { status: 200 });
  } catch (error) {
    console.error('Error validating references:', error);
    return NextResponse.json(
      { error: 'Failed to validate references' },
      { status: 500 }
    );
  }
}