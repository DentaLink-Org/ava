// import { Database } from '@/lib/database.types';

// TODO: Create database.types file when database schema is finalized
// export type DocumentMetadataRow = Database['public']['Tables']['document_metadata']['Row'];
// export type DocumentMetadataInsert = Database['public']['Tables']['document_metadata']['Insert'];
// export type DocumentMetadataUpdate = Database['public']['Tables']['document_metadata']['Update'];

// export type ReferenceTrackingRow = Database['public']['Tables']['reference_tracking']['Row'];
// export type ReferenceTrackingInsert = Database['public']['Tables']['reference_tracking']['Insert'];
// export type ReferenceTrackingUpdate = Database['public']['Tables']['reference_tracking']['Update'];

// export type ReferenceCacheRow = Database['public']['Tables']['reference_cache']['Row'];
// export type ReferenceCacheInsert = Database['public']['Tables']['reference_cache']['Insert'];
// export type ReferenceCacheUpdate = Database['public']['Tables']['reference_cache']['Update'];

// Temporary placeholder types until database schema is available
export interface DocumentMetadataRow {
  id: string;
  doc_name: string;
  database_id: string;
  table_name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface DocumentMetadataInsert extends Partial<DocumentMetadataRow> {
  doc_name: string;
  database_id: string;
  table_name: string;
  created_by: string;
}

export interface DocumentMetadataUpdate extends Partial<DocumentMetadataRow> {}

export interface ReferenceTrackingRow {
  id: string;
  source_doc_id: string;
  source_block_id: string;
  target_doc_id: string;
  target_block_id?: string;
  reference_type: string;
  created_at: string;
}

export interface ReferenceTrackingInsert extends Partial<ReferenceTrackingRow> {
  source_doc_id: string;
  source_block_id: string;
  target_doc_id: string;
  reference_type: string;
}

export interface ReferenceTrackingUpdate extends Partial<ReferenceTrackingRow> {}

export interface ReferenceCacheRow {
  cache_key: string;
  cached_content: any;
  expires_at: string;
  created_at: string;
}

export interface ReferenceCacheInsert extends Partial<ReferenceCacheRow> {
  cache_key: string;
  cached_content: any;
  expires_at: string;
}

export interface ReferenceCacheUpdate extends Partial<ReferenceCacheRow> {}

export interface DocumentTableRow {
  block_id: string;
  block_type: string;
  content: any;
  order_index: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  metadata?: any;
}

export interface DocumentTableInsert {
  block_id?: string;
  block_type: string;
  content: any;
  order_index: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  metadata?: any;
}

export interface DocumentTableUpdate {
  block_type?: string;
  content?: any;
  order_index?: number;
  updated_at?: string;
  metadata?: any;
}

export interface SupabaseDocument {
  metadata: DocumentMetadataRow;
  blocks: DocumentTableRow[];
  references: {
    incoming: ReferenceTrackingRow[];
    outgoing: ReferenceTrackingRow[];
  };
}

export interface CreateDocumentTableParams {
  database_id: string;
  document_id: string;
  table_name: string;
}

export interface DocumentQueryOptions {
  includeBlocks?: boolean;
  includeReferences?: boolean;
  includeMetadata?: boolean;
  blockLimit?: number;
  orderBy?: 'created_at' | 'updated_at' | 'order_index';
  orderDirection?: 'asc' | 'desc';
}

export interface BlockQueryOptions {
  documentId: string;
  blockTypes?: string[];
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface ReferenceQueryOptions {
  documentId?: string;
  blockId?: string;
  referenceType?: string;
  includeIncoming?: boolean;
  includeOutgoing?: boolean;
  depth?: number;
}

export interface BulkOperation<T> {
  inserts?: T[];
  updates?: Array<{ id: string; data: Partial<T> }>;
  deletes?: string[];
}

export interface DocumentSyncStatus {
  document_id: string;
  local_version: number;
  remote_version: number;
  is_synced: boolean;
  last_sync: Date;
  pending_operations: number;
}

export interface DatabaseConnectionInfo {
  id: string;
  name: string;
  type: 'supabase' | 'postgres' | 'mysql';
  connection_string?: string;
  is_connected: boolean;
  last_connected?: Date;
  metadata?: Record<string, any>;
}