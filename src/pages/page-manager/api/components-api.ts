/**
 * Page Components API Operations
 * Handles CRUD operations for page components using Supabase
 */

import express from 'express';
import { supabaseClient } from '../../databases/api/supabase';
import { 
  PageComponent, 
  ComponentCreateRequest, 
  ComponentUpdateRequest, 
  ComponentFilter,
  ComponentStats,
  ComponentSummary,
  ComponentApiResponse
} from '../types/components';

const COMPONENTS_TABLE = 'page_components';
const router = express.Router();

export class ComponentsAPI {
  /**
   * Get all components with optional filtering
   */
  static async getComponents(filter?: ComponentFilter): Promise<ComponentApiResponse<PageComponent[]>> {
    try {
      let query = supabaseClient
        .from(COMPONENTS_TABLE)
        .select('*');

      // Apply filters
      if (filter?.status && filter.status.length > 0) {
        query = query.in('status', filter.status);
      }

      if (filter?.priority && filter.priority.length > 0) {
        query = query.in('priority', filter.priority);
      }

      if (filter?.category && filter.category.length > 0) {
        query = query.in('category', filter.category);
      }

      if (filter?.group && filter.group.length > 0) {
        query = query.in('group', filter.group);
      }

      if (filter?.implementation_status && filter.implementation_status.length > 0) {
        query = query.in('implementation_status', filter.implementation_status);
      }

      if (filter?.created_by) {
        query = query.eq('created_by', filter.created_by);
      }

      if (filter?.search) {
        query = query.or(`name.ilike.%${filter.search}%,title.ilike.%${filter.search}%,description.ilike.%${filter.search}%,functionality.ilike.%${filter.search}%`);
      }

      // Apply sorting
      const sortBy = filter?.sort_by || 'created_at';
      const sortOrder = filter?.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query;

      if (error) {
        // Check if it's a table not found error
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.warn('Components table does not exist. Please run the setup script.');
          return {
            data: [],
            success: false,
            error: 'Components table not found. Please run the database setup script to create the page_components table.'
          };
        }
        throw new Error(`Failed to fetch components: ${error.message}`);
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
      console.error('Error fetching components:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get a single component by ID
   */
  static async getComponent(id: string): Promise<ComponentApiResponse<PageComponent | null>> {
    try {
      const { data, error } = await supabaseClient
        .from(COMPONENTS_TABLE)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch component: ${error.message}`);
      }

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error fetching component:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get component by name
   */
  static async getComponentByName(name: string): Promise<ComponentApiResponse<PageComponent | null>> {
    try {
      const { data, error } = await supabaseClient
        .from(COMPONENTS_TABLE)
        .select('*')
        .eq('name', name)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return {
            data: null,
            success: true
          };
        }
        throw new Error(`Failed to fetch component: ${error.message}`);
      }

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error fetching component by name:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a new component
   */
  static async createComponent(request: ComponentCreateRequest): Promise<ComponentApiResponse<PageComponent>> {
    try {
      const componentData = {
        ...request,
        status: request.status || 'planned',
        implementation_status: 'not_started',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system' // TODO: Replace with actual user ID when auth is implemented
      };

      const { data, error } = await supabaseClient
        .from(COMPONENTS_TABLE)
        .insert([componentData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create component: ${error.message}`);
      }

      return {
        data,
        success: true,
        message: 'Component created successfully'
      };
    } catch (error) {
      console.error('Error creating component:', error);
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update an existing component
   */
  static async updateComponent(request: ComponentUpdateRequest): Promise<ComponentApiResponse<PageComponent>> {
    try {
      const { id, ...updateData } = request;
      const componentData = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from(COMPONENTS_TABLE)
        .update(componentData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update component: ${error.message}`);
      }

      return {
        data,
        success: true,
        message: 'Component updated successfully'
      };
    } catch (error) {
      console.error('Error updating component:', error);
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete a component
   */
  static async deleteComponent(id: string): Promise<ComponentApiResponse<boolean>> {
    try {
      const { error } = await supabaseClient
        .from(COMPONENTS_TABLE)
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete component: ${error.message}`);
      }

      return {
        data: true,
        success: true,
        message: 'Component deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting component:', error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get component statistics
   */
  static async getComponentStats(): Promise<ComponentApiResponse<ComponentStats>> {
    try {
      const { data, error } = await supabaseClient
        .from(COMPONENTS_TABLE)
        .select('status, priority, category, group, implementation_status, estimated_hours, actual_hours');

      if (error) {
        throw new Error(`Failed to fetch component stats: ${error.message}`);
      }

      // Calculate statistics
      const stats: ComponentStats = {
        total_components: data?.length || 0,
        by_status: { active: 0, inactive: 0, deprecated: 0, planned: 0, draft: 0 },
        by_priority: { low: 0, medium: 0, high: 0, critical: 0 },
        by_category: { 
          core_task: 0, creation_editing: 0, planning_organization: 0, collaboration: 0,
          analytics_reporting: 0, time_tracking: 0, automation_workflow: 0, mobile_accessibility: 0,
          integration: 0, specialized_views: 0, ui_basic: 0, data_display: 0, navigation: 0,
          form: 0, other: 0
        },
        by_group: { interactive: 0, data: 0, navigation: 0, layout: 0, feedback: 0, utility: 0 },
        by_implementation: { 
          not_started: 0, in_progress: 0, completed: 0, testing: 0, reviewed: 0, deployed: 0, needs_review: 0 
        },
        completion_percentage: 0,
        total_estimated_hours: 0,
        total_actual_hours: 0
      };

      if (data) {
        // Count by status, priority, category, group, implementation
        data.forEach(component => {
          stats.by_status[component.status as keyof typeof stats.by_status]++;
          stats.by_priority[component.priority as keyof typeof stats.by_priority]++;
          stats.by_category[component.category as keyof typeof stats.by_category]++;
          stats.by_group[component.group as keyof typeof stats.by_group]++;
          stats.by_implementation[component.implementation_status as keyof typeof stats.by_implementation]++;
          
          if (component.estimated_hours) {
            stats.total_estimated_hours += component.estimated_hours;
          }
          if (component.actual_hours) {
            stats.total_actual_hours += component.actual_hours;
          }
        });

        // Calculate completion percentage
        const completedComponents = stats.by_implementation.completed + stats.by_implementation.deployed;
        stats.completion_percentage = stats.total_components > 0 
          ? Math.round((completedComponents / stats.total_components) * 100) 
          : 0;
      }

      return {
        data: stats,
        success: true
      };
    } catch (error) {
      console.error('Error fetching component stats:', error);
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get component summary
   */
  static async getComponentSummary(): Promise<ComponentApiResponse<ComponentSummary>> {
    try {
      const { data, error } = await supabaseClient
        .from(COMPONENTS_TABLE)
        .select('implementation_status, priority, updated_at');

      if (error) {
        throw new Error(`Failed to fetch component summary: ${error.message}`);
      }

      const summary: ComponentSummary = {
        total_components: data?.length || 0,
        completed_components: 0,
        in_progress_components: 0,
        planned_components: 0,
        high_priority_components: 0,
        last_updated: new Date().toISOString()
      };

      if (data && data.length > 0) {
        // Find the latest update date
        let latestUpdate = data[0].updated_at;

        data.forEach(component => {
          if (component.implementation_status === 'completed' || component.implementation_status === 'deployed') {
            summary.completed_components++;
          } else if (component.implementation_status === 'in_progress') {
            summary.in_progress_components++;
          } else if (component.implementation_status === 'not_started') {
            summary.planned_components++;
          }

          if (component.priority === 'high' || component.priority === 'critical') {
            summary.high_priority_components++;
          }

          if (new Date(component.updated_at) > new Date(latestUpdate)) {
            latestUpdate = component.updated_at;
          }
        });

        summary.last_updated = latestUpdate;
      }

      return {
        data: summary,
        success: true
      };
    } catch (error) {
      console.error('Error fetching component summary:', error);
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get components by category
   */
  static async getComponentsByCategory(category: string): Promise<ComponentApiResponse<PageComponent[]>> {
    return this.getComponents({ category: [category as any] });
  }

  /**
   * Get components by group
   */
  static async getComponentsByGroup(group: string): Promise<ComponentApiResponse<PageComponent[]>> {
    return this.getComponents({ group: [group as any] });
  }

  /**
   * Search components by text
   */
  static async searchComponents(searchTerm: string): Promise<ComponentApiResponse<PageComponent[]>> {
    return this.getComponents({ search: searchTerm });
  }

  /**
   * Initialize the components table if it doesn't exist
   */
  static async initializeTable(): Promise<boolean> {
    try {
      // Check if table exists and create if not
      // This would typically be done through migrations, but for demo purposes:
      const { error } = await supabaseClient.rpc('create_page_components_table_if_not_exists');
      
      if (error && !error.message.includes('already exists')) {
        console.error('Error initializing components table:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error initializing components table:', error);
      return false;
    }
  }
}

// Express.js routes
router.get('/', async (req, res) => {
  try {
    const filter = req.query;
    const result = await ComponentsAPI.getComponents(filter);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await ComponentsAPI.getComponent(req.params.id);
    if (result.success) {
      if (result.data) {
        res.json(result.data);
      } else {
        res.status(404).json({ error: 'Component not found' });
      }
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await ComponentsAPI.createComponent(req.body);
    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body, id: req.params.id };
    const result = await ComponentsAPI.updateComponent(updateData);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await ComponentsAPI.deleteComponent(req.params.id);
    if (result.success) {
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const result = await ComponentsAPI.getComponentStats();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats/overview', async (req, res) => {
  try {
    const result = await ComponentsAPI.getComponentSummary();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/by-name/:name', async (req, res) => {
  try {
    const result = await ComponentsAPI.getComponentByName(req.params.name);
    if (result.success) {
      if (result.data) {
        res.json(result.data);
      } else {
        res.status(404).json({ error: 'Component not found' });
      }
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/by-category/:category', async (req, res) => {
  try {
    const result = await ComponentsAPI.getComponentsByCategory(req.params.category);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/by-group/:group', async (req, res) => {
  try {
    const result = await ComponentsAPI.getComponentsByGroup(req.params.group);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/search/:searchTerm', async (req, res) => {
  try {
    const result = await ComponentsAPI.searchComponents(req.params.searchTerm);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/initialize', async (req, res) => {
  try {
    const result = await ComponentsAPI.initializeTable();
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

export default ComponentsAPI;