/**
 * Features Database Setup Script
 * Initializes the page_features table and sample data in Supabase
 */

import { FeaturesAPI } from '../api/features-api';
import { supabaseClient } from '../../databases/api/supabase';
import { FeatureCreateRequest } from '../types/features';

// Sample features data for all pages
const SAMPLE_FEATURES: FeatureCreateRequest[] = [
  // Dashboard Features
  {
    page_id: 'dashboard',
    name: 'Real-time Activity Feed',
    description: 'Display live activity updates from all dashboard components with WebSocket integration',
    priority: 'high',
    category: 'functionality',
    estimated_hours: 8.0,
    tags: ['realtime', 'websocket', 'activity'],
    metadata: { complexity: 'medium', requires_backend: true }
  },
  {
    page_id: 'dashboard',
    name: 'Dark Mode Toggle',
    description: 'Add comprehensive dark/light theme switching capability with user preference persistence',
    priority: 'medium',
    category: 'ui_component',
    estimated_hours: 4.0,
    tags: ['theme', 'ui', 'accessibility'],
    metadata: { complexity: 'low', affects_all_components: true }
  },
  {
    page_id: 'dashboard',
    name: 'Export Dashboard Data',
    description: 'Allow users to export dashboard data in multiple formats (CSV, JSON, PDF)',
    priority: 'low',
    category: 'functionality',
    estimated_hours: 6.0,
    tags: ['export', 'csv', 'json', 'pdf'],
    metadata: { complexity: 'medium', file_generation: true }
  },
  {
    page_id: 'dashboard',
    name: 'Widget Customization',
    description: 'Enable users to customize, resize, and reorder dashboard widgets with drag-and-drop',
    priority: 'high',
    category: 'ui_component',
    estimated_hours: 12.0,
    tags: ['customization', 'drag-drop', 'widgets'],
    metadata: { complexity: 'high', affects_layout: true }
  },

  // Database Features
  {
    page_id: 'databases',
    name: 'Query Performance Analytics',
    description: 'Track and display query execution times, optimization suggestions, and performance metrics',
    priority: 'high',
    category: 'analytics',
    estimated_hours: 16.0,
    tags: ['performance', 'analytics', 'optimization'],
    metadata: { complexity: 'high', requires_monitoring: true }
  },
  {
    page_id: 'databases',
    name: 'Schema Version Control',
    description: 'Implement database schema versioning, migration tracking, and rollback capabilities',
    priority: 'critical',
    category: 'functionality',
    estimated_hours: 24.0,
    tags: ['schema', 'version-control', 'migration'],
    metadata: { complexity: 'very_high', critical_feature: true }
  },
  {
    page_id: 'databases',
    name: 'Automated Backup Scheduling',
    description: 'Schedule automatic database backups with configurable retention policies and restoration',
    priority: 'high',
    category: 'functionality',
    estimated_hours: 18.0,
    tags: ['backup', 'automation', 'scheduling'],
    metadata: { complexity: 'high', requires_cron: true }
  },
  {
    page_id: 'databases',
    name: 'Visual Query Builder',
    description: 'Drag-and-drop interface for building SQL queries without writing code',
    priority: 'medium',
    category: 'ui_component',
    estimated_hours: 20.0,
    tags: ['query-builder', 'visual', 'sql'],
    metadata: { complexity: 'very_high', visual_component: true }
  },

  // Tasks Features
  {
    page_id: 'tasks',
    name: 'Kanban Board Customization',
    description: 'Allow users to customize kanban columns, workflow states, and board appearance',
    priority: 'medium',
    category: 'ui_component',
    estimated_hours: 10.0,
    tags: ['kanban', 'customization', 'workflow'],
    metadata: { complexity: 'medium', affects_workflow: true }
  },
  {
    page_id: 'tasks',
    name: 'Task Time Tracking',
    description: 'Track time spent on individual tasks with start/stop timers and generate time reports',
    priority: 'high',
    category: 'functionality',
    estimated_hours: 14.0,
    tags: ['time-tracking', 'timers', 'reports'],
    metadata: { complexity: 'medium', requires_timers: true }
  },
  {
    page_id: 'tasks',
    name: 'Team Collaboration Features',
    description: 'Add comments, mentions, real-time collaboration, and notification system',
    priority: 'medium',
    category: 'functionality',
    estimated_hours: 18.0,
    tags: ['collaboration', 'comments', 'mentions', 'notifications'],
    metadata: { complexity: 'high', realtime_required: true }
  },
  {
    page_id: 'tasks',
    name: 'Task Dependencies',
    description: 'Create and manage task dependencies with visual dependency graphs',
    priority: 'low',
    category: 'functionality',
    estimated_hours: 12.0,
    tags: ['dependencies', 'graph', 'workflow'],
    metadata: { complexity: 'high', graph_visualization: true }
  },

  // Page Manager Features
  {
    page_id: 'page-manager',
    name: 'Visual Page Builder',
    description: 'Drag-and-drop interface for building page layouts with component library integration',
    priority: 'critical',
    category: 'ui_component',
    estimated_hours: 40.0,
    tags: ['page-builder', 'visual', 'drag-drop', 'components'],
    metadata: { complexity: 'very_high', core_feature: true }
  },
  {
    page_id: 'page-manager',
    name: 'Component Library Browser',
    description: 'Browse, preview, and search available components before adding to pages',
    priority: 'medium',
    category: 'ui_component',
    estimated_hours: 8.0,
    tags: ['component-library', 'browser', 'preview'],
    metadata: { complexity: 'medium', component_management: true }
  },
  {
    page_id: 'page-manager',
    name: 'Page Template System',
    description: 'Create, save, and manage reusable page templates with variable placeholders',
    priority: 'high',
    category: 'functionality',
    estimated_hours: 12.0,
    tags: ['templates', 'reusable', 'variables'],
    metadata: { complexity: 'medium', template_engine: true }
  },
  {
    page_id: 'page-manager',
    name: 'Page Performance Monitor',
    description: 'Monitor page load times, component rendering performance, and optimization suggestions',
    priority: 'medium',
    category: 'performance',
    estimated_hours: 10.0,
    tags: ['performance', 'monitoring', 'optimization'],
    metadata: { complexity: 'medium', performance_tracking: true }
  }
];

/**
 * Initialize the features database with sample data
 */
export async function setupFeaturesDatabase(): Promise<{
  success: boolean;
  message: string;
  created: number;
  errors: string[];
}> {
  const result = {
    success: false,
    message: '',
    created: 0,
    errors: [] as string[]
  };

  try {
    console.log('🚀 Setting up Features Database...');

    // Check if Supabase is configured
    const { data: tables, error: tablesError } = await supabaseClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'page_features');

    if (tablesError) {
      console.log('📋 Creating page_features table...');
      // Table doesn't exist, we'll try to create it
      // Note: In a real setup, you'd run the SQL migration script
      result.errors.push('Table creation requires manual setup. Please run the SQL migration script.');
    }

    // Try to create sample features
    console.log('📝 Adding sample features...');
    
    for (const feature of SAMPLE_FEATURES) {
      try {
        const response = await FeaturesAPI.createFeature(feature);
        if (response.success) {
          result.created++;
          console.log(`✅ Created feature: ${feature.name}`);
        } else {
          result.errors.push(`Failed to create ${feature.name}: ${response.error}`);
          console.error(`❌ Failed to create ${feature.name}:`, response.error);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Error creating ${feature.name}: ${errorMessage}`);
        console.error(`❌ Error creating ${feature.name}:`, error);
      }
    }

    // Check results
    if (result.created > 0) {
      result.success = true;
      result.message = `Successfully created ${result.created} features. ${result.errors.length > 0 ? `${result.errors.length} errors occurred.` : ''}`;
      console.log(`🎉 Setup complete! Created ${result.created} features.`);
    } else {
      result.message = `No features were created. ${result.errors.length} errors occurred.`;
      console.log('❌ Setup failed. No features were created.');
    }

  } catch (error) {
    result.message = `Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(result.message);
    console.error('💥 Setup error:', error);
  }

  return result;
}

/**
 * Clear all existing features (useful for testing)
 */
export async function clearFeaturesDatabase(): Promise<{
  success: boolean;
  message: string;
  deleted: number;
}> {
  try {
    console.log('🗑️ Clearing features database...');
    
    // Get all features
    const response = await FeaturesAPI.getFeatures();
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch features');
    }

    let deleted = 0;
    for (const feature of response.data) {
      const deleteResponse = await FeaturesAPI.deleteFeature(feature.id);
      if (deleteResponse.success) {
        deleted++;
      }
    }

    console.log(`🧹 Cleared ${deleted} features from database.`);
    
    return {
      success: true,
      message: `Successfully deleted ${deleted} features`,
      deleted
    };
  } catch (error) {
    const message = `Clear failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('💥 Clear error:', error);
    return {
      success: false,
      message,
      deleted: 0
    };
  }
}

/**
 * Get setup status and statistics
 */
export async function getFeaturesSetupStatus(): Promise<{
  isSetup: boolean;
  tableExists: boolean;
  featureCount: number;
  sampleDataExists: boolean;
  recommendations: string[];
}> {
  const status = {
    isSetup: false,
    tableExists: false,
    featureCount: 0,
    sampleDataExists: false,
    recommendations: [] as string[]
  };

  try {
    // Check if we can query features
    const response = await FeaturesAPI.getFeatures();
    
    if (response.success) {
      status.tableExists = true;
      status.featureCount = response.data.length;
      status.sampleDataExists = response.data.length > 0;
      status.isSetup = status.tableExists && status.sampleDataExists;
    } else {
      status.recommendations.push('Features table may not exist. Run SQL migration script.');
    }

    // Add recommendations based on status
    if (!status.tableExists) {
      status.recommendations.push('Create the page_features table using the SQL migration script.');
    }
    
    if (status.tableExists && !status.sampleDataExists) {
      status.recommendations.push('Add sample features data to see the system in action.');
    }
    
    if (status.featureCount < 10) {
      status.recommendations.push('Consider adding more features to better demonstrate the system.');
    }

  } catch (error) {
    status.recommendations.push('Check Supabase configuration and database connectivity.');
    console.error('Status check error:', error);
  }

  return status;
}

// Export setup functions for use in other modules
export const FeaturesDatabaseSetup = {
  setup: setupFeaturesDatabase,
  clear: clearFeaturesDatabase,
  getStatus: getFeaturesSetupStatus
};

export default FeaturesDatabaseSetup;