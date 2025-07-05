/**
 * Playground Components Index
 * Exports all playground page components for easy importing
 */

export { PlaygroundContainer } from './PlaygroundContainer';
export { WelcomeHeader } from './WelcomeHeader';
export { DatabaseLinkCard } from './DatabaseLinkCard';
export { TasksLinkCard } from './TasksLinkCard';
export { QuickStartCard } from './QuickStartCard';

// VPS Components
export { VpsDemo } from './VpsDemo';
export { VpsJobSubmitter } from './VpsJobSubmitter';
export { VpsProgressTracker } from './VpsProgressTracker';
export { VpsJobHistory } from './VpsJobHistory';
export { KPICards } from './KPICards';
export { GroupSelector } from './GroupSelector';
export { PlaygroundPageRenderer } from './PlaygroundPageRenderer';

// Milestone components
export { MilestoneBoard } from './MilestoneBoard';
export { MilestoneCard } from './MilestoneCard';
export { MilestoneCreateModal } from './MilestoneCreateModal';
export { MilestoneEditModal } from './MilestoneEditModal';
export { MilestoneProgressTracker } from './MilestoneProgressTracker';
export { MilestoneDependencyManager } from './MilestoneDependencyManager';
export { TaskMilestoneSelector } from './TaskMilestoneSelector';
export { MilestoneTaskList } from './MilestoneTaskList';
export { MilestoneDataProvider, useMilestoneContext, MilestoneErrorBoundary } from './MilestoneDataProvider';
export { default as ProjectRoadmap } from './ProjectRoadmap';
export { default as MilestoneCalendar } from './MilestoneCalendar';

// Phase 2 enhanced visualization components
export { default as MilestoneProgressReport } from './MilestoneProgressReport';
export { default as ProjectHealthDashboard } from './ProjectHealthDashboard';
export { default as MilestoneNavigationSidebar } from './MilestoneNavigationSidebar';

// Phase 3 advanced workflow components
export { default as ProjectTemplateManager } from './ProjectTemplateManager';
export { default as MilestoneApprovalWorkflow } from './MilestoneApprovalWorkflow';
export { default as ProjectPhaseManager } from './ProjectPhaseManager';
export { default as MilestoneCommentSystem } from './MilestoneCommentSystem';
export { default as MilestoneTimelineEditor } from './MilestoneTimelineEditor';
export { default as ProjectRiskTracker } from './ProjectRiskTracker';
export { default as MilestoneNotifications } from './MilestoneNotifications';
export { default as MilestoneStatusUpdater } from './MilestoneStatusUpdater';
export { default as TeamMilestoneAssignment } from './TeamMilestoneAssignment';
export { default as MilestoneSearchFilter } from './MilestoneSearchFilter';
export { default as MilestoneQuickActions } from './MilestoneQuickActions';
export { default as ProjectOverviewCard } from './ProjectOverviewCard';
export { default as MilestoneEventManager } from './MilestoneEventManager';
export { default as MilestoneValidationService } from './MilestoneValidationService';

// Enhanced Task Management Components
export { EnhancedTaskBoard } from './EnhancedTaskBoard';
export { EnhancedTaskCard } from './EnhancedTaskCard';
export { TaskCreateModal } from './TaskCreateModal';
export { TaskEditModal } from './TaskEditModal';
export { EnhancedTaskListView } from './EnhancedTaskListView';
export { TaskProgressTracker } from './TaskProgressTracker';
export { TaskAssignmentManager } from './TaskAssignmentManager';
export { TaskDependencyManager } from './TaskDependencyManager';
export { TaskCommentsSystem } from './TaskCommentsSystem';

// Phase 2: Advanced Task Features - Visualization & Analytics
export { default as TaskTimeline } from './TaskTimeline';
export { default as TaskAnalyticsDashboard } from './TaskAnalyticsDashboard';
export { default as TaskBurndownChart } from './TaskBurndownChart';
export { default as TaskVelocityTracker } from './TaskVelocityTracker';
export { default as TaskBottleneckAnalyzer } from './TaskBottleneckAnalyzer';

// Re-export types for convenience
export type {
  WelcomeHeaderProps,
  DatabaseLinkCardProps,
  TasksLinkCardProps,
  QuickStartCardProps,
  KPICardsProps,
  KPIMetric,
  GroupSelectorProps
} from '../types';