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