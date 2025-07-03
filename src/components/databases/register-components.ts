/**
 * Database Page Component Registration
 * Registers all database-specific components with the ComponentRegistry
 */

import { ComponentRegistry } from "@/components/_shared/runtime";
import {
  DatabaseCard,
  SchemaEditor,
  ConnectionForm,
  PageHeader,
  DatabaseGrid,
  ConnectionStatus,
  DatabaseStats,
  RecentActivity,
  DatabaseManager,
  DatabaseCreator,
  DatabaseEditor,
  DatabaseInfo,
  DataManager
} from './components';

// Register all database page components
export function registerDatabaseComponents(registry: ComponentRegistry) {
  const pageId = 'databases';
  
  // Core database components (using any to bypass type checking temporarily)
  registry.register(pageId, 'DatabaseCard', DatabaseCard as any);
  registry.register(pageId, 'SchemaEditor', SchemaEditor as any);
  registry.register(pageId, 'ConnectionForm', ConnectionForm as any);
  
  // Page layout components
  registry.register(pageId, 'PageHeader', PageHeader as any);
  registry.register(pageId, 'DatabaseGrid', DatabaseGrid as any);
  
  // Dashboard widget components
  registry.register(pageId, 'ConnectionStatus', ConnectionStatus as any);
  registry.register(pageId, 'DatabaseStats', DatabaseStats as any);
  registry.register(pageId, 'RecentActivity', RecentActivity as any);
  
  // Real-time database management components
  registry.register(pageId, 'DatabaseManager', DatabaseManager as any);
  registry.register(pageId, 'DatabaseCreator', DatabaseCreator as any);
  registry.register(pageId, 'DatabaseEditor', DatabaseEditor as any);
  registry.register(pageId, 'DatabaseInfo', DatabaseInfo as any);
  registry.register(pageId, 'DataManager', DataManager as any);
  
  console.log('✅ Database page components registered');
}

// Auto-register components if registry is available
if (typeof window !== 'undefined' && (window as any).__componentRegistry) {
  registerDatabaseComponents((window as any).__componentRegistry);
} else if (typeof window !== 'undefined') {
  // Wait for registry to be available
  const checkRegistry = setInterval(() => {
    if ((window as any).__componentRegistry) {
      registerDatabaseComponents((window as any).__componentRegistry);
      clearInterval(checkRegistry);
    }
  }, 100);
}