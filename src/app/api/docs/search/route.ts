import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/components/playground/documentations/api/supabase-client';
import { DocumentSearchResult } from '@/components/playground/documentations/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const database_id = searchParams.get('database_id');
    const block_types = searchParams.get('block_types')?.split(',');
    const limit = searchParams.get('limit') || '20';

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // First, get all documents (optionally filtered by database)
    let documentsQuery = supabase
      .from('document_metadata')
      .select('doc_id, doc_name, table_name');

    if (database_id) {
      documentsQuery = documentsQuery.eq('database_id', database_id);
    }

    const { data: documents, error: docsError } = await documentsQuery;

    if (docsError) {
      throw docsError;
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    // Search across all document tables
    const searchResults: DocumentSearchResult[] = [];
    
    for (const doc of documents) {
      if (!doc.table_name) continue;

      try {
        // Build query for this document's table
        let tableQuery = supabase
          .from(doc.table_name)
          .select('block_id, block_type, content, order_index')
          .ilike('content', `%${query}%`)
          .limit(parseInt(limit));

        if (block_types && block_types.length > 0) {
          tableQuery = tableQuery.in('block_type', block_types);
        }

        const { data: blocks, error: blocksError } = await tableQuery;

        if (blocksError) {
          console.error(`Error searching in ${doc.table_name}:`, blocksError);
          continue;
        }

        if (blocks) {
          // Convert blocks to search results
          blocks.forEach((block: any) => {
            const contentText = extractTextFromContent(block.content);
            const highlights = findHighlights(contentText, query);

            searchResults.push({
              document_id: doc.doc_id,
              document_name: doc.doc_name,
              block_id: block.block_id,
              block_type: block.block_type,
              content_preview: getPreview(contentText, query, 150),
              match_score: calculateMatchScore(contentText, query),
              highlights,
            });
          });
        }
      } catch (error) {
        console.error(`Error searching document ${doc.doc_id}:`, error);
      }
    }

    // Sort by match score
    searchResults.sort((a, b) => b.match_score - a.match_score);

    // Limit total results
    const finalResults = searchResults.slice(0, parseInt(limit));

    return NextResponse.json({ results: finalResults }, { status: 200 });
  } catch (error) {
    console.error('Error searching documents:', error);
    return NextResponse.json(
      { error: 'Failed to search documents' },
      { status: 500 }
    );
  }
}

function extractTextFromContent(content: any): string {
  if (typeof content === 'string') return content;
  if (content.text) return content.text;
  if (content.code) return content.code;
  if (content.heading) return content.heading.text;
  if (content.list) {
    return content.list.items.map((item: any) => item.text).join(' ');
  }
  if (content.table) {
    return content.table.rows.flat().join(' ');
  }
  return JSON.stringify(content);
}

function findHighlights(text: string, query: string): any[] {
  const highlights = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let index = 0;

  while ((index = lowerText.indexOf(lowerQuery, index)) !== -1) {
    highlights.push({
      start: index,
      end: index + query.length,
      type: 'exact',
    });
    index += query.length;
  }

  return highlights;
}

function getPreview(text: string, query: string, maxLength: number): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + query.length + 50);
  let preview = text.slice(start, end);

  if (start > 0) preview = '...' + preview;
  if (end < text.length) preview = preview + '...';

  return preview;
}

function calculateMatchScore(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const exactMatches = (lowerText.match(new RegExp(lowerQuery, 'g')) || []).length;
  const wordMatches = lowerQuery.split(' ').filter(word => 
    lowerText.includes(word.toLowerCase())
  ).length;

  return exactMatches * 10 + wordMatches * 5;
}