/**
 * Tasks Page Component Registration
 * Registers all tasks page components with the component registry
 */

import { ComponentRegistry } from '../_shared/runtime/ComponentRegistry';
import {
  PageHeader,
  TaskBoard,
  TaskCard,
  TaskList,
  ProjectSidebar,
  TaskCreateModal,
  TaskEditModal,
  TaskActionsMenu,
  ProjectCreateModal,
  ProjectEditModal,
  ProjectActionsMenu,
  TeamManagementModal
} from './components';

const PAGE_ID = 'tasks';

/**
 * Register all tasks page components
 */
export function registerTasksComponents(registry: ComponentRegistry): void {
  // Register page header
  registry.register(PAGE_ID, 'PageHeader', PageHeader as any);
  
  // Register main components
  registry.register(PAGE_ID, 'TaskBoard', TaskBoard as any);
  registry.register(PAGE_ID, 'TaskCard', TaskCard as any);
  registry.register(PAGE_ID, 'TaskList', TaskList as any);
  registry.register(PAGE_ID, 'ProjectSidebar', ProjectSidebar as any);
  
  // Register modal components
  registry.register(PAGE_ID, 'TaskCreateModal', TaskCreateModal as any);
  registry.register(PAGE_ID, 'TaskEditModal', TaskEditModal as any);
  registry.register(PAGE_ID, 'ProjectCreateModal', ProjectCreateModal as any);
  registry.register(PAGE_ID, 'ProjectEditModal', ProjectEditModal as any);
  registry.register(PAGE_ID, 'TeamManagementModal', TeamManagementModal as any);
  
  // Register menu components
  registry.register(PAGE_ID, 'TaskActionsMenu', TaskActionsMenu as any);
  registry.register(PAGE_ID, 'ProjectActionsMenu', ProjectActionsMenu as any);
  
  console.log(`✅ Registered ${registry.getPageComponents(PAGE_ID)} tasks page components`);
}

/**
 * Get all registered component types for the tasks page
 */
export function getTasksComponentTypes(): string[] {
  return [
    'PageHeader',
    'TaskBoard',
    'TaskCard',
    'TaskList',
    'ProjectSidebar',
    'TaskCreateModal',
    'TaskEditModal',
    'ProjectCreateModal',
    'ProjectEditModal',
    'TeamManagementModal',
    'TaskActionsMenu',
    'ProjectActionsMenu'
  ];
}

/**
 * Validate that all components are properly registered
 */
export function validateTasksComponents(registry: ComponentRegistry): boolean {
  const componentTypes = getTasksComponentTypes();
  const registeredComponents = registry.getPageComponents(PAGE_ID);
  
  for (const componentType of componentTypes) {
    const component = registry.get(PAGE_ID, componentType);
    if (!component) {
      console.error(`❌ Component not registered: ${componentType}`);
      return false;
    }
  }
  
  console.log(`✅ All ${componentTypes.length} tasks page components validated successfully`);
  return true;
}