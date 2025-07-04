/**
 * Playground Component Registration
 * Registers all playground components with the global component registry
 */

import { componentRegistry } from '../_shared/runtime/ComponentRegistry';
import {
  PlaygroundContainer,
  WelcomeHeader,
  DatabaseLinkCard,
  TasksLinkCard,
  QuickStartCard,
  KPICards,
  GroupSelector,
  MilestoneBoard,
  MilestoneCard,
  MilestoneCreateModal,
  MilestoneEditModal,
  MilestoneProgressTracker,
  MilestoneDependencyManager,
  TaskMilestoneSelector,
  MilestoneTaskList,
  MilestoneDataProvider
} from './components';
import { ChatBot, IssueTracker } from '../_shared/components';

const PLAYGROUND_PAGE_ID = 'playground';

/**
 * Register all playground components
 */
export const registerPlaygroundComponents = () => {
  // Register all playground-specific components (using any to bypass type checking temporarily)
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'PlaygroundContainer', PlaygroundContainer as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'WelcomeHeader', WelcomeHeader as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'DatabaseLinkCard', DatabaseLinkCard as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'TasksLinkCard', TasksLinkCard as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'QuickStartCard', QuickStartCard as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'KPICards', KPICards as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'GroupSelector', GroupSelector as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'ChatBot', ChatBot as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'IssueTracker', IssueTracker as any);
  
  // Register milestone components
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneBoard', MilestoneBoard as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneCard', MilestoneCard as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneCreateModal', MilestoneCreateModal as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneEditModal', MilestoneEditModal as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneProgressTracker', MilestoneProgressTracker as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneDependencyManager', MilestoneDependencyManager as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'TaskMilestoneSelector', TaskMilestoneSelector as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneTaskList', MilestoneTaskList as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneDataProvider', MilestoneDataProvider as any);
  
  console.log('Playground components registered successfully (including all milestone components)');
};

/**
 * Unregister playground components (for cleanup)
 */
export const unregisterPlaygroundComponents = () => {
  componentRegistry.clear(PLAYGROUND_PAGE_ID);
  console.log('Playground components unregistered');
};

// Auto-register components when this module is imported
registerPlaygroundComponents();