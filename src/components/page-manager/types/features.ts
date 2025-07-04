/**
 * Page Features Type Definitions
 * Defines the structure for page features that can be managed through the database
 */

export interface PageFeature {
  id: string;
  page_id: string;
  name: string;
  description: string;
  status: FeatureStatus;
  priority: FeaturePriority;
  category: FeatureCategory;
  implementation_status: ImplementationStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  estimated_hours?: number;
  actual_hours?: number;
  dependencies?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export type FeatureStatus = 'active' | 'inactive' | 'deprecated' | 'planned';
export type FeaturePriority = 'low' | 'medium' | 'high' | 'critical';
export type FeatureCategory = 
  | 'ui_component' 
  | 'functionality' 
  | 'integration' 
  | 'performance' 
  | 'security' 
  | 'accessibility' 
  | 'analytics' 
  | 'other';

export type ImplementationStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'completed' 
  | 'testing' 
  | 'deployed' 
  | 'needs_review';

export interface FeatureFilter {
  search?: string;
  page_id?: string;
  status?: FeatureStatus[];
  priority?: FeaturePriority[];
  category?: FeatureCategory[];
  implementation_status?: ImplementationStatus[];
  created_by?: string;
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'priority';
  sort_order?: 'asc' | 'desc';
}

export interface FeatureCreateRequest {
  page_id: string;
  name: string;
  description: string;
  priority: FeaturePriority;
  category: FeatureCategory;
  status?: FeatureStatus;
  estimated_hours?: number;
  dependencies?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface FeatureUpdateRequest {
  id: string;
  name?: string;
  description?: string;
  status?: FeatureStatus;
  priority?: FeaturePriority;
  category?: FeatureCategory;
  implementation_status?: ImplementationStatus;
  estimated_hours?: number;
  actual_hours?: number;
  dependencies?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface FeatureStats {
  total_features: number;
  by_status: Record<FeatureStatus, number>;
  by_priority: Record<FeaturePriority, number>;
  by_category: Record<FeatureCategory, number>;
  by_implementation: Record<ImplementationStatus, number>;
  completion_percentage: number;
  total_estimated_hours: number;
  total_actual_hours: number;
}

export interface PageFeatureSummary {
  page_id: string;
  page_title: string;
  feature_count: number;
  completed_features: number;
  in_progress_features: number;
  planned_features: number;
  high_priority_features: number;
  last_updated: string;
}

// Database table schema for Supabase
export interface FeaturesTableSchema {
  id: string; // UUID primary key
  page_id: string; // References pages table
  name: string; // Feature name
  description: string; // Feature description
  status: FeatureStatus; // Feature status
  priority: FeaturePriority; // Priority level
  category: FeatureCategory; // Feature category
  implementation_status: ImplementationStatus; // Implementation progress
  created_at: string; // Timestamp
  updated_at: string; // Timestamp
  created_by: string | null; // User identifier
  estimated_hours: number | null; // Time estimate
  actual_hours: number | null; // Actual time spent
  dependencies: string[] | null; // Array of feature IDs
  tags: string[] | null; // Feature tags
  metadata: Record<string, any> | null; // Additional data
}

// API response types
export interface FeatureApiResponse<T> {
  data: T | null;
  success: boolean;
  message?: string;
  error?: string;
  metadata?: {
    total: number;
    page: number;
    per_page: number;
  };
}

export interface FeatureBatchOperation {
  action: 'create' | 'update' | 'delete';
  features: PageFeature[];
}

export interface FeatureBatchResult {
  successful: PageFeature[];
  failed: Array<{
    feature: Partial<PageFeature>;
    error: string;
  }>;
  total_processed: number;
}