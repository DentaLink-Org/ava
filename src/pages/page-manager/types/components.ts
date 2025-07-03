/**
 * Page Components Type Definitions
 * Defines the structure for page components that can be managed through the database
 */

export interface PageComponent {
  id: string;
  name: string;
  title: string;
  description: string;
  functionality: string;
  status: ComponentStatus;
  priority: ComponentPriority;
  category: ComponentCategory;
  group: ComponentGroup;
  implementation_status: ImplementationStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  estimated_hours?: number;
  actual_hours?: number;
  dependencies?: string[];
  props?: string[];
  features?: string[];
  file_path?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export type ComponentStatus = 'active' | 'inactive' | 'deprecated' | 'planned' | 'draft';
export type ComponentPriority = 'low' | 'medium' | 'high' | 'critical';

export type ComponentCategory = 
  | 'core_task' 
  | 'creation_editing' 
  | 'planning_organization' 
  | 'collaboration' 
  | 'analytics_reporting'
  | 'time_tracking'
  | 'automation_workflow'
  | 'mobile_accessibility'
  | 'integration'
  | 'specialized_views'
  | 'ui_basic'
  | 'data_display'
  | 'navigation'
  | 'form'
  | 'other';

export type ComponentGroup = 
  | 'interactive'
  | 'data'
  | 'navigation'
  | 'layout'
  | 'feedback'
  | 'utility';

export type ImplementationStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'completed' 
  | 'testing' 
  | 'reviewed'
  | 'deployed' 
  | 'needs_review';

export interface ComponentFilter {
  search?: string;
  status?: ComponentStatus[];
  priority?: ComponentPriority[];
  category?: ComponentCategory[];
  group?: ComponentGroup[];
  implementation_status?: ImplementationStatus[];
  created_by?: string;
  sort_by?: 'name' | 'title' | 'created_at' | 'updated_at' | 'priority';
  sort_order?: 'asc' | 'desc';
}

export interface ComponentCreateRequest {
  name: string;
  title: string;
  description: string;
  functionality: string;
  priority: ComponentPriority;
  category: ComponentCategory;
  group: ComponentGroup;
  status?: ComponentStatus;
  estimated_hours?: number;
  dependencies?: string[];
  props?: string[];
  features?: string[];
  file_path?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ComponentUpdateRequest {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  functionality?: string;
  status?: ComponentStatus;
  priority?: ComponentPriority;
  category?: ComponentCategory;
  group?: ComponentGroup;
  implementation_status?: ImplementationStatus;
  estimated_hours?: number;
  actual_hours?: number;
  dependencies?: string[];
  props?: string[];
  features?: string[];
  file_path?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ComponentStats {
  total_components: number;
  by_status: Record<ComponentStatus, number>;
  by_priority: Record<ComponentPriority, number>;
  by_category: Record<ComponentCategory, number>;
  by_group: Record<ComponentGroup, number>;
  by_implementation: Record<ImplementationStatus, number>;
  completion_percentage: number;
  total_estimated_hours: number;
  total_actual_hours: number;
}

export interface ComponentSummary {
  total_components: number;
  completed_components: number;
  in_progress_components: number;
  planned_components: number;
  high_priority_components: number;
  last_updated: string;
}

// Database table schema for Supabase
export interface ComponentsTableSchema {
  id: string; // UUID primary key
  name: string; // Component name (e.g., TaskCardEnhanced)
  title: string; // Human-readable title
  description: string; // Component description
  functionality: string; // What the component does
  status: ComponentStatus; // Component status
  priority: ComponentPriority; // Priority level
  category: ComponentCategory; // Component category
  group: ComponentGroup; // Component group
  implementation_status: ImplementationStatus; // Implementation progress
  created_at: string; // Timestamp
  updated_at: string; // Timestamp
  created_by: string | null; // User identifier
  estimated_hours: number | null; // Time estimate
  actual_hours: number | null; // Actual time spent
  dependencies: string[] | null; // Array of component IDs/names
  props: string[] | null; // Component props list
  features: string[] | null; // Key features list
  file_path: string | null; // Expected file path
  tags: string[] | null; // Component tags
  metadata: Record<string, any> | null; // Additional data
}

// API response types
export interface ComponentApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  metadata?: {
    total: number;
    page: number;
    per_page: number;
  };
}

export interface ComponentBatchOperation {
  action: 'create' | 'update' | 'delete';
  components: PageComponent[];
}

export interface ComponentBatchResult {
  successful: PageComponent[];
  failed: Array<{
    component: Partial<PageComponent>;
    error: string;
  }>;
  total_processed: number;
}

// Component specification for AI agents
export interface ComponentSpecification {
  component: PageComponent;
  technical_requirements: {
    dependencies: string[];
    file_structure: string;
    testing_strategy: string[];
  };
  implementation_notes: string;
  success_criteria: string[];
}