export interface DocumentTable {
  id: string;
  name: string;
  database_id: string;
  table_name: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, any>;
}

export interface DocumentBlock {
  block_id: string;
  document_id: string;
  block_type: BlockType;
  content: BlockContent;
  order_index: number;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export type BlockType = 'text' | 'code' | 'reference' | 'heading' | 'list' | 'table' | 'image';

export interface BlockContent {
  text?: string;
  code?: CodeBlockContent;
  reference?: ReferenceBlockContent;
  heading?: HeadingBlockContent;
  list?: ListBlockContent;
  table?: TableBlockContent;
  image?: ImageBlockContent;
}

export interface CodeBlockContent {
  language: string;
  code: string;
  filename?: string;
}

export interface ReferenceBlockContent {
  target_doc_id: string;
  target_block_id?: string;
  display_type: 'embed' | 'link' | 'mirror';
  label?: string;
}

export interface HeadingBlockContent {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ListBlockContent {
  type: 'ordered' | 'unordered' | 'checklist';
  items: ListItem[];
}

export interface ListItem {
  text: string;
  checked?: boolean;
  children?: ListItem[];
}

export interface TableBlockContent {
  headers: string[];
  rows: string[][];
}

export interface ImageBlockContent {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface BlockReference {
  id: string;
  source_doc_id: string;
  source_block_id: string;
  target_doc_id: string;
  target_block_id?: string;
  reference_type: ReferenceType;
  created_at: Date;
}

export type ReferenceType = 'embed' | 'link' | 'mirror';

export interface ReferenceCache {
  cache_key: string;
  cached_content: any;
  expires_at: Date;
  created_at: Date;
}

export interface DocumentMetadata {
  doc_id: string;
  doc_name: string;
  database_id: string;
  table_name: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  tags?: string[];
  description?: string;
  is_public?: boolean;
  permissions?: DocumentPermissions;
}

export interface DocumentPermissions {
  owner: string;
  editors: string[];
  viewers: string[];
  public_access: 'none' | 'view' | 'comment' | 'edit';
}

export interface DocumentVersion {
  version_id: string;
  document_id: string;
  version_number: number;
  created_by: string;
  created_at: Date;
  changes: VersionChange[];
  comment?: string;
}

export interface VersionChange {
  block_id: string;
  change_type: 'create' | 'update' | 'delete';
  old_content?: BlockContent;
  new_content?: BlockContent;
}

export interface DocumentSearchResult {
  document_id: string;
  document_name: string;
  block_id: string;
  block_type: BlockType;
  content_preview: string;
  match_score: number;
  highlights: TextHighlight[];
}

export interface TextHighlight {
  start: number;
  end: number;
  type: 'exact' | 'fuzzy';
}

export interface ReferenceGraph {
  nodes: ReferenceNode[];
  edges: ReferenceEdge[];
}

export interface ReferenceNode {
  id: string;
  type: 'document' | 'block';
  label: string;
  metadata?: Record<string, any>;
}

export interface ReferenceEdge {
  source: string;
  target: string;
  type: ReferenceType;
  label?: string;
}

export interface DocumentOperation {
  operation_id: string;
  document_id: string;
  operation_type: 'create' | 'update' | 'delete' | 'reorder';
  block_operations: BlockOperation[];
  user_id: string;
  timestamp: Date;
}

export interface BlockOperation {
  block_id: string;
  operation: 'create' | 'update' | 'delete' | 'move';
  position?: number;
  content?: BlockContent;
  previous_position?: number;
}

export interface CollaborationSession {
  session_id: string;
  document_id: string;
  participants: Participant[];
  started_at: Date;
  ended_at?: Date;
}

export interface Participant {
  user_id: string;
  user_name: string;
  cursor_position?: CursorPosition;
  selection?: Selection;
  is_active: boolean;
  color: string;
}

export interface CursorPosition {
  block_id: string;
  offset: number;
}

export interface Selection {
  start_block_id: string;
  start_offset: number;
  end_block_id: string;
  end_offset: number;
}

export interface DocumentExport {
  format: 'markdown' | 'json' | 'html' | 'pdf';
  include_references: boolean;
  include_metadata: boolean;
  flatten_references: boolean;
}

export interface DocumentImport {
  format: 'markdown' | 'json';
  source: string | File;
  create_references: boolean;
  preserve_ids: boolean;
}

export interface DocumentStats {
  document_id: string;
  total_blocks: number;
  blocks_by_type: Record<BlockType, number>;
  total_references: number;
  incoming_references: number;
  outgoing_references: number;
  total_words: number;
  last_modified: Date;
  collaborators_count: number;
}