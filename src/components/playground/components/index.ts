/**
 * Playground Components Index
 * Exports all playground page components for easy importing
 */

export { PlaygroundContainer } from './PlaygroundContainer';
export { WelcomeHeader } from './WelcomeHeader';
export { DatabaseLinkCard } from './DatabaseLinkCard';
export { TasksLinkCard } from './TasksLinkCard';
export { QuickStartCard } from './QuickStartCard';
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