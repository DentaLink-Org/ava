/**
 * Types for Page Manager functionality
 */

export interface PageInfo {
  id: string;
  title: string;
  route: string;
  description?: string;
  icon?: string;
  order?: number;
  visible?: boolean;
  category?: string;
  status: 'active' | 'draft' | 'disabled';
  lastModified: string;
  author?: string;
  version?: string;
  componentCount?: number;
  configPath: string;
  componentPath: string;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  preview?: string;
  components: any[];
  layout: any;
  theme?: any;
}

export interface PageCreateRequest {
  id: string;
  title: string;
  route: string;
  description?: string;
  template?: string;
  category?: string;
  visible?: boolean;
  order?: number;
}

export interface PageUpdateRequest {
  id: string;
  title?: string;
  route?: string;
  description?: string;
  visible?: boolean;
  order?: number;
  category?: string;
  config?: any;
}

export interface PageManagerState {
  pages: PageInfo[];
  selectedPage: PageInfo | null;
  editingPage: PageInfo | null;
  loading: boolean;
  error: string | null;
  templates: PageTemplate[];
}

export interface PageEditorProps {
  page: PageInfo | null;
  onSave: (page: PageInfo, config: any) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'clone';
}

export interface PageListProps {
  pages: PageInfo[];
  onSelect: (page: PageInfo) => void;
  onEdit: (page: PageInfo) => void;
  onDelete: (page: PageInfo) => void;
  onDuplicate: (page: PageInfo) => void;
  selectedPage?: PageInfo | null;
}

export interface PageActionsProps {
  onCreatePage: () => void;
  onImportPage: () => void;
  onExportPages: () => void;
  selectedPage?: PageInfo | null;
}