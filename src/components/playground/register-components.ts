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
  MilestoneDataProvider,
  ProjectRoadmap,
  MilestoneCalendar,
  MilestoneProgressReport,
  ProjectHealthDashboard,
  MilestoneNavigationSidebar,
  ProjectTemplateManager,
  MilestoneApprovalWorkflow,
  ProjectPhaseManager,
  MilestoneCommentSystem,
  MilestoneTimelineEditor,
  ProjectRiskTracker,
  MilestoneNotifications,
  MilestoneStatusUpdater,
  TeamMilestoneAssignment,
  MilestoneSearchFilter,
  MilestoneQuickActions,
  ProjectOverviewCard,
  MilestoneEventManager,
  MilestoneValidationService,
  EnhancedTaskBoard,
  EnhancedTaskCard,
  TaskCreateModal,
  TaskEditModal,
  EnhancedTaskListView,
  TaskProgressTracker,
  TaskAssignmentManager,
  TaskDependencyManager,
  TaskCommentsSystem,
  TaskTimeline,
  TaskAnalyticsDashboard,
  TaskBurndownChart,
  TaskVelocityTracker,
  TaskBottleneckAnalyzer,
  // VPS Components
  VpsDemo,
  VpsJobSubmitter,
  VpsProgressTracker,
  VpsJobHistory
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
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'ProjectRoadmap', ProjectRoadmap as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneCalendar', MilestoneCalendar as any);
  
  // Register Phase 2 enhanced visualization components
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneProgressReport', MilestoneProgressReport as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'ProjectHealthDashboard', ProjectHealthDashboard as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneNavigationSidebar', MilestoneNavigationSidebar as any);
  
  // Register Phase 3 advanced workflow components
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'ProjectTemplateManager', ProjectTemplateManager as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneApprovalWorkflow', MilestoneApprovalWorkflow as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'ProjectPhaseManager', ProjectPhaseManager as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneCommentSystem', MilestoneCommentSystem as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneTimelineEditor', MilestoneTimelineEditor as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'ProjectRiskTracker', ProjectRiskTracker as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneNotifications', MilestoneNotifications as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneStatusUpdater', MilestoneStatusUpdater as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'TeamMilestoneAssignment', TeamMilestoneAssignment as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneSearchFilter', MilestoneSearchFilter as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneQuickActions', MilestoneQuickActions as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'ProjectOverviewCard', ProjectOverviewCard as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneEventManager', MilestoneEventManager as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'MilestoneValidationService', MilestoneValidationService as any);
  
  // Register enhanced task management components
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'EnhancedTaskBoard', EnhancedTaskBoard as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'EnhancedTaskCard', EnhancedTaskCard as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'TaskCreateModal', TaskCreateModal as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'TaskEditModal', TaskEditModal as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'EnhancedTaskListView', EnhancedTaskListView as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'TaskProgressTracker', TaskProgressTracker as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'TaskAssignmentManager', TaskAssignmentManager as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'TaskDependencyManager', TaskDependencyManager as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'TaskCommentsSystem', TaskCommentsSystem as any);
  
  // Register Phase 2: Advanced Task Features - Visualization & Analytics
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'TaskTimeline', TaskTimeline as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'TaskAnalyticsDashboard', TaskAnalyticsDashboard as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'TaskBurndownChart', TaskBurndownChart as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'TaskVelocityTracker', TaskVelocityTracker as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'TaskBottleneckAnalyzer', TaskBottleneckAnalyzer as any);
  
  // Register VPS components
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'VpsDemo', VpsDemo as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'VpsJobSubmitter', VpsJobSubmitter as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'VpsProgressTracker', VpsProgressTracker as any);
  componentRegistry.register(PLAYGROUND_PAGE_ID, 'VpsJobHistory', VpsJobHistory as any);
  
  console.log('Playground components registered successfully (including all milestone, enhanced task, and VPS components)');
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