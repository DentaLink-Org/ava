// Milestone hooks exports
// Central export file for all milestone-related React hooks

export { useMilestoneData } from './useMilestoneData';
export { useMilestoneProgress } from './useMilestoneProgress';
export { useMilestoneDependencies } from './useMilestoneDependencies';

// Re-export hook types for convenience
export type { 
  UseMilestoneDataReturn,
  UseMilestoneProgressReturn,
  UseMilestoneDependenciesReturn 
} from '../types';