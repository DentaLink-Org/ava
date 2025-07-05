import { createClient } from '@supabase/supabase-js';
import type { 
  DocumentMetadata, 
  DocumentBlock, 
  BlockReference,
  ReferenceCache,
  DocumentOperation,
  DocumentVersion
} from '../types';
import type {
  DocumentMetadataRow,
  DocumentMetadataInsert,
  DocumentMetadataUpdate,
  ReferenceTrackingRow,
  ReferenceTrackingInsert,
  ReferenceCacheRow,
  DocumentTableRow,
  DocumentTableInsert,
  DocumentQueryOptions,
  BlockQueryOptions,
  ReferenceQueryOptions
} from '../types/database';

const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.AVA_NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class DocumentsClient {
  async createDocument(data: {
    name: string;
    database_id: string;
    created_by: string;
    description?: string;
    tags?: string[];
    is_public?: boolean;
  }): Promise<DocumentMetadata | null> {
    try {
      // First, insert metadata
      const { data: metadata, error: metadataError } = await supabase
        .from('document_metadata')
        .insert({
          doc_name: data.name,
          database_id: data.database_id,
          table_name: '', // Will be set by create_document_table function
          created_by: data.created_by,
          description: data.description,
          tags: data.tags || [],
          is_public: data.is_public || false,
        } as DocumentMetadataInsert)
        .select()
        .single();

      if (metadataError) throw metadataError;

      // Create the document table
      const { error: tableError } = await supabase.rpc('create_document_table', {
        p_database_id: data.database_id,
        p_document_id: metadata.doc_id,
        p_table_name: data.name,
      });

      if (tableError) {
        // Rollback metadata if table creation fails
        await supabase.from('document_metadata').delete().eq('doc_id', metadata.doc_id);
        throw tableError;
      }

      // Fetch updated metadata with table name
      const { data: updatedMetadata } = await supabase
        .from('document_metadata')
        .select()
        .eq('doc_id', metadata.doc_id)
        .single();

      return updatedMetadata as DocumentMetadata;
    } catch (error) {
      console.error('Error creating document:', error);
      return null;
    }
  }

  async getDocument(documentId: string, options?: DocumentQueryOptions): Promise<{
    metadata: DocumentMetadata;
    blocks?: DocumentBlock[];
    references?: {
      incoming: BlockReference[];
      outgoing: BlockReference[];
    };
  } | null> {
    try {
      // Get metadata
      const { data: metadata, error: metadataError } = await supabase
        .from('document_metadata')
        .select()
        .eq('doc_id', documentId)
        .single();

      if (metadataError || !metadata) return null;

      const result: any = { metadata };

      // Get blocks if requested
      if (options?.includeBlocks !== false && metadata.table_name) {
        const { data: blocks } = await supabase
          .from(metadata.table_name)
          .select()
          .order(options?.orderBy || 'order_index', { ascending: options?.orderDirection !== 'desc' })
          .limit(options?.blockLimit || 1000);

        result.blocks = blocks || [];
      }

      // Get references if requested
      if (options?.includeReferences) {
        const [incoming, outgoing] = await Promise.all([
          supabase
            .from('reference_tracking')
            .select()
            .eq('target_doc_id', documentId),
          supabase
            .from('reference_tracking')
            .select()
            .eq('source_doc_id', documentId),
        ]);

        result.references = {
          incoming: incoming.data || [],
          outgoing: outgoing.data || [],
        };
      }

      return result;
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  async updateDocument(
    documentId: string,
    updates: Partial<DocumentMetadataUpdate>
  ): Promise<DocumentMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('document_metadata')
        .update(updates)
        .eq('doc_id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data as DocumentMetadata;
    } catch (error) {
      console.error('Error updating document:', error);
      return null;
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('drop_document_table', {
        p_document_id: documentId,
      });

      return !error;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  async listDocuments(filters?: {
    database_id?: string;
    created_by?: string;
    is_public?: boolean;
    tags?: string[];
  }): Promise<DocumentMetadata[]> {
    try {
      let query = supabase.from('document_metadata').select();

      if (filters?.database_id) {
        query = query.eq('database_id', filters.database_id);
      }
      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by);
      }
      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;
      return data as DocumentMetadata[];
    } catch (error) {
      console.error('Error listing documents:', error);
      return [];
    }
  }

  async duplicateDocument(
    sourceDocId: string,
    newName: string,
    createdBy: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('copy_document', {
        p_source_doc_id: sourceDocId,
        p_new_name: newName,
        p_created_by: createdBy,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error duplicating document:', error);
      return null;
    }
  }

  async getDocumentStats(documentId: string) {
    try {
      const { data, error } = await supabase.rpc('get_document_stats', {
        p_document_id: documentId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting document stats:', error);
      return null;
    }
  }
}

export class BlocksClient {
  constructor(private tableName: string) {}

  async createBlock(block: DocumentTableInsert): Promise<DocumentBlock | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(block)
        .select()
        .single();

      if (error) throw error;
      return data as DocumentBlock;
    } catch (error) {
      console.error('Error creating block:', error);
      return null;
    }
  }

  async getBlock(blockId: string): Promise<DocumentBlock | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select()
        .eq('block_id', blockId)
        .single();

      if (error) throw error;
      return data as DocumentBlock;
    } catch (error) {
      console.error('Error getting block:', error);
      return null;
    }
  }

  async updateBlock(
    blockId: string,
    updates: Partial<DocumentTableInsert>
  ): Promise<DocumentBlock | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('block_id', blockId)
        .select()
        .single();

      if (error) throw error;
      return data as DocumentBlock;
    } catch (error) {
      console.error('Error updating block:', error);
      return null;
    }
  }

  async deleteBlock(blockId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('block_id', blockId);

      return !error;
    } catch (error) {
      console.error('Error deleting block:', error);
      return false;
    }
  }

  async listBlocks(options?: BlockQueryOptions): Promise<DocumentBlock[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select()
        .order('order_index');

      if (options?.blockTypes && options.blockTypes.length > 0) {
        query = query.in('block_type', options.blockTypes);
      }

      if (options?.searchTerm) {
        query = query.ilike('content', `%${options.searchTerm}%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DocumentBlock[];
    } catch (error) {
      console.error('Error listing blocks:', error);
      return [];
    }
  }

  async reorderBlocks(blockIds: string[], newPositions: number[]): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('reorder_blocks', {
        p_document_id: '', // Will need to pass this
        p_block_ids: blockIds,
        p_new_positions: newPositions,
      });

      return !error;
    } catch (error) {
      console.error('Error reordering blocks:', error);
      return false;
    }
  }
}

export class ReferencesClient {
  async createReference(reference: ReferenceTrackingInsert): Promise<BlockReference | null> {
    try {
      const { data, error } = await supabase
        .from('reference_tracking')
        .insert(reference)
        .select()
        .single();

      if (error) throw error;

      // Invalidate cache for affected documents
      await this.invalidateCache(reference.source_doc_id, reference.target_doc_id);

      return data as BlockReference;
    } catch (error) {
      console.error('Error creating reference:', error);
      return null;
    }
  }

  async deleteReference(referenceId: string): Promise<boolean> {
    try {
      // Get reference details for cache invalidation
      const { data: ref } = await supabase
        .from('reference_tracking')
        .select('source_doc_id, target_doc_id')
        .eq('id', referenceId)
        .single();

      const { error } = await supabase
        .from('reference_tracking')
        .delete()
        .eq('id', referenceId);

      if (!error && ref) {
        await this.invalidateCache(ref.source_doc_id, ref.target_doc_id);
      }

      return !error;
    } catch (error) {
      console.error('Error deleting reference:', error);
      return false;
    }
  }

  async getReferences(options: ReferenceQueryOptions): Promise<BlockReference[]> {
    try {
      let query = supabase.from('reference_tracking').select();

      if (options.documentId) {
        if (options.includeIncoming && options.includeOutgoing) {
          query = query.or(`source_doc_id.eq.${options.documentId},target_doc_id.eq.${options.documentId}`);
        } else if (options.includeIncoming) {
          query = query.eq('target_doc_id', options.documentId);
        } else if (options.includeOutgoing) {
          query = query.eq('source_doc_id', options.documentId);
        }
      }

      if (options.blockId) {
        query = query.or(`source_block_id.eq.${options.blockId},target_block_id.eq.${options.blockId}`);
      }

      if (options.referenceType) {
        query = query.eq('reference_type', options.referenceType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BlockReference[];
    } catch (error) {
      console.error('Error getting references:', error);
      return [];
    }
  }

  async validateReferences(documentId?: string) {
    try {
      const { data, error } = await supabase.rpc('validate_references', {
        p_document_id: documentId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error validating references:', error);
      return [];
    }
  }

  private async invalidateCache(sourceDocId: string, targetDocId: string) {
    try {
      await supabase
        .from('reference_cache')
        .delete()
        .or(`source_doc_id.eq.${sourceDocId},target_doc_id.eq.${targetDocId}`);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  async getCachedReference(cacheKey: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('reference_cache')
        .select('cached_content')
        .eq('cache_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) return null;
      return data.cached_content;
    } catch (error) {
      console.error('Error getting cached reference:', error);
      return null;
    }
  }

  async setCachedReference(
    cacheKey: string,
    content: any,
    sourceDocId: string,
    targetDocId: string,
    ttlMinutes: number = 15
  ): Promise<boolean> {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

      const { error } = await supabase
        .from('reference_cache')
        .upsert({
          cache_key: cacheKey,
          cached_content: content,
          source_doc_id: sourceDocId,
          target_doc_id: targetDocId,
          expires_at: expiresAt.toISOString(),
        });

      return !error;
    } catch (error) {
      console.error('Error setting cached reference:', error);
      return false;
    }
  }
}

// Export client instances
export const documentsClient = new DocumentsClient();
export const referencesClient = new ReferencesClient();