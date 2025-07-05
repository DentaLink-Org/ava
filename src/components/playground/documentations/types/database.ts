import { Database } from '@/lib/database.types';

export type DocumentMetadataRow = Database['public']['Tables']['document_metadata']['Row'];
export type DocumentMetadataInsert = Database['public']['Tables']['document_metadata']['Insert'];
export type DocumentMetadataUpdate = Database['public']['Tables']['document_metadata']['Update'];

export type ReferenceTrackingRow = Database['public']['Tables']['reference_tracking']['Row'];
export type ReferenceTrackingInsert = Database['public']['Tables']['reference_tracking']['Insert'];
export type ReferenceTrackingUpdate = Database['public']['Tables']['reference_tracking']['Update'];

export type ReferenceCacheRow = Database['public']['Tables']['reference_cache']['Row'];
export type ReferenceCacheInsert = Database['public']['Tables']['reference_cache']['Insert'];
export type ReferenceCacheUpdate = Database['public']['Tables']['reference_cache']['Update'];

export interface DocumentTableRow {
  block_id: string;
  block_type: string;
  content: any;
  order_index: number;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface DocumentTableInsert {
  block_id?: string;
  block_type: string;
  content: any;
  order_index: number;
  created_at?: string;
  updated_at?: string;
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