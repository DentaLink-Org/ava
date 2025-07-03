/**
 * Page Features API Operations
 * Handles CRUD operations for page features using Supabase
 */

import { supabaseClient } from '../../databases/api/supabase';
import { 
  PageFeature, 
  FeatureCreateRequest, 
  FeatureUpdateRequest, 
  FeatureFilter,
  FeatureStats,
  PageFeatureSummary,
  FeatureApiResponse
} from '../types/features';

const FEATURES_TABLE = 'page_features';

export class FeaturesAPI {
  /**
   * Get all features with optional filtering
   */
  static async getFeatures(filter?: FeatureFilter): Promise<FeatureApiResponse<PageFeature[]>> {
    try {
      let query = supabaseClient
        .from(FEATURES_TABLE)
        .select('*');

      // Apply filters
      if (filter?.page_id) {
        query = query.eq('page_id', filter.page_id);
      }

      if (filter?.status && filter.status.length > 0) {
        query = query.in('status', filter.status);
      }

      if (filter?.priority && filter.priority.length > 0) {
        query = query.in('priority', filter.priority);
      }

      if (filter?.category && filter.category.length > 0) {
        query = query.in('category', filter.category);
      }

      if (filter?.implementation_status && filter.implementation_status.length > 0) {
        query = query.in('implementation_status', filter.implementation_status);
      }

      if (filter?.created_by) {
        query = query.eq('created_by', filter.created_by);
      }

      if (filter?.search) {
        query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
      }

      // Apply sorting
      const sortBy = filter?.sort_by || 'created_at';
      const sortOrder = filter?.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query;

      if (error) {
        // Check if it's a table not found error
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.warn('Features table does not exist. Please run the setup script.');
          return {
            data: [],
            success: false,
            error: 'Features table not found. Please run the database setup script to create the page_features table.'
          };
        }
        throw new Error(`Failed to fetch features: ${error.message}`);
      }

      return {
        data: data || [],
        success: true,
        metadata: {
          total: count || data?.length || 0,
          page: 1,
          per_page: data?.length || 0
        }
      };
    } catch (error) {
      console.error('Error fetching features:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get features for a specific page
   */
  static async getPageFeatures(pageId: string): Promise<FeatureApiResponse<PageFeature[]>> {
    return this.getFeatures({ page_id: pageId });
  }

  /**
   * Get a single feature by ID
   */
  static async getFeature(id: string): Promise<FeatureApiResponse<PageFeature | null>> {
    try {
      const { data, error } = await supabaseClient
        .from(FEATURES_TABLE)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch feature: ${error.message}`);
      }

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error fetching feature:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a new feature
   */
  static async createFeature(request: FeatureCreateRequest): Promise<FeatureApiResponse<PageFeature>> {
    try {
      const featureData = {
        ...request,
        status: request.status || 'planned',
        implementation_status: 'not_started',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system' // TODO: Replace with actual user ID when auth is implemented
      };

      const { data, error } = await supabaseClient
        .from(FEATURES_TABLE)
        .insert([featureData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create feature: ${error.message}`);
      }

      return {
        data,
        success: true,
        message: 'Feature created successfully'
      };
    } catch (error) {
      console.error('Error creating feature:', error);
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update an existing feature
   */
  static async updateFeature(request: FeatureUpdateRequest): Promise<FeatureApiResponse<PageFeature>> {
    try {
      const { id, ...updateData } = request;
      const featureData = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from(FEATURES_TABLE)
        .update(featureData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update feature: ${error.message}`);
      }

      return {
        data,
        success: true,
        message: 'Feature updated successfully'
      };
    } catch (error) {
      console.error('Error updating feature:', error);
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete a feature
   */
  static async deleteFeature(id: string): Promise<FeatureApiResponse<boolean>> {
    try {
      const { error } = await supabaseClient
        .from(FEATURES_TABLE)
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete feature: ${error.message}`);
      }

      return {
        data: true,
        success: true,
        message: 'Feature deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting feature:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get feature statistics
   */
  static async getFeatureStats(pageId?: string): Promise<FeatureApiResponse<FeatureStats>> {
    try {
      let query = supabaseClient
        .from(FEATURES_TABLE)
        .select('status, priority, category, implementation_status, estimated_hours, actual_hours');

      if (pageId) {
        query = query.eq('page_id', pageId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch feature stats: ${error.message}`);
      }

      // Calculate statistics
      const stats: FeatureStats = {
        total_features: data?.length || 0,
        by_status: { active: 0, inactive: 0, deprecated: 0, planned: 0 },
        by_priority: { low: 0, medium: 0, high: 0, critical: 0 },
        by_category: { 
          ui_component: 0, functionality: 0, integration: 0, performance: 0, 
          security: 0, accessibility: 0, analytics: 0, other: 0 
        },
        by_implementation: { 
          not_started: 0, in_progress: 0, completed: 0, testing: 0, deployed: 0, needs_review: 0 
        },
        completion_percentage: 0,
        total_estimated_hours: 0,
        total_actual_hours: 0
      };

      if (data) {
        // Count by status, priority, category, implementation
        data.forEach(feature => {
          stats.by_status[feature.status as keyof typeof stats.by_status]++;
          stats.by_priority[feature.priority as keyof typeof stats.by_priority]++;
          stats.by_category[feature.category as keyof typeof stats.by_category]++;
          stats.by_implementation[feature.implementation_status as keyof typeof stats.by_implementation]++;
          
          if (feature.estimated_hours) {
            stats.total_estimated_hours += feature.estimated_hours;
          }
          if (feature.actual_hours) {
            stats.total_actual_hours += feature.actual_hours;
          }
        });

        // Calculate completion percentage
        const completedFeatures = stats.by_implementation.completed + stats.by_implementation.deployed;
        stats.completion_percentage = stats.total_features > 0 
          ? Math.round((completedFeatures / stats.total_features) * 100) 
          : 0;
      }

      return {
        data: stats,
        success: true
      };
    } catch (error) {
      console.error('Error fetching feature stats:', error);
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get page feature summaries
   */
  static async getPageFeatureSummaries(): Promise<FeatureApiResponse<PageFeatureSummary[]>> {
    try {
      // This would typically join with a pages table, but for now we'll group by page_id
      const { data, error } = await supabaseClient
        .from(FEATURES_TABLE)
        .select('page_id, implementation_status, priority, updated_at');

      if (error) {
        throw new Error(`Failed to fetch page feature summaries: ${error.message}`);
      }

      // Group by page_id and calculate summaries
      const summaries: Record<string, PageFeatureSummary> = {};

      data?.forEach(feature => {
        if (!summaries[feature.page_id]) {
          summaries[feature.page_id] = {
            page_id: feature.page_id,
            page_title: `Page ${feature.page_id}`, // TODO: Get actual page title
            feature_count: 0,
            completed_features: 0,
            in_progress_features: 0,
            planned_features: 0,
            high_priority_features: 0,
            last_updated: feature.updated_at
          };
        }

        const summary = summaries[feature.page_id];
        summary.feature_count++;

        if (feature.implementation_status === 'completed' || feature.implementation_status === 'deployed') {
          summary.completed_features++;
        } else if (feature.implementation_status === 'in_progress') {
          summary.in_progress_features++;
        } else if (feature.implementation_status === 'not_started') {
          summary.planned_features++;
        }

        if (feature.priority === 'high' || feature.priority === 'critical') {
          summary.high_priority_features++;
        }

        if (new Date(feature.updated_at) > new Date(summary.last_updated)) {
          summary.last_updated = feature.updated_at;
        }
      });

      return {
        data: Object.values(summaries),
        success: true
      };
    } catch (error) {
      console.error('Error fetching page feature summaries:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Initialize the features table if it doesn't exist
   */
  static async initializeTable(): Promise<boolean> {
    try {
      // Check if table exists and create if not
      // This would typically be done through migrations, but for demo purposes:
      const { error } = await supabaseClient.rpc('create_page_features_table_if_not_exists');
      
      if (error && !error.message.includes('already exists')) {
        console.error('Error initializing features table:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error initializing features table:', error);
      return false;
    }
  }
}

export default FeaturesAPI;