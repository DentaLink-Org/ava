// Milestone management type definitions
// TypeScript interfaces for comprehensive milestone functionality

import type { Task, TaskPriority, TeamMember, Project } from '../tasks/types';

// Core Milestone Types
export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: MilestoneStatus;
  priority: TaskPriority; // Reuse task priority enum
  color: string;
  progress: number; // 0-100 percentage
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo: string[]; // Array of user IDs
  metadata: MilestoneMetadata;
  isArchived: boolean;
  dependencies: MilestoneDependency[];
  tasks: Task[]; // Tasks linked to this milestone
}

export interface MilestoneDependency {
  id: string;
  milestoneId: string;
  dependsOnId: string;
  dependencyType: DependencyType;
  lagDays: number;
  createdAt: string;
  createdBy: string;
}

export interface MilestoneProgress {
  id: string;
  milestoneId: string;
  progressPercentage: number;
  completedTasks: number;
  totalTasks: number;
  notes?: string;
  recordedAt: string;
  recordedBy: string;
  metadata: Record<string, any>;
}

export interface MilestoneComment {
  id: string;
  milestoneId: string;
  userId: string;
  content: string;
  commentType: CommentType;
  parentId?: string; // For threaded comments
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  metadata: Record<string, any>;
}

export interface MilestoneMetadata {
  estimatedHours?: number;
  actualHours?: number;
  budgetAllocated?: number;
  budgetSpent?: number;
  tags?: string[];
  customFields?: Record<string, any>;
  riskLevel?: RiskLevel;
  stakeholders?: string[];
  deliverables?: string[];
}

// Extended Project interface with milestone support
export interface ProjectWithMilestones extends Project {
  milestones: Milestone[];
  milestoneCount: number;
  completedMilestones: number;
  overdueMilestones: number;
  activeMilestones: number;
  milestoneCompletionRate: number;
}

// User interface for milestone management
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

// Extended Task interface with milestone reference
export interface TaskWithMilestone extends Task {
  milestoneId?: string;
  milestone?: Milestone;
}

// Enums and Union Types
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
export type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
export type CommentType = 'comment' | 'update' | 'approval' | 'question';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';
export type MilestoneViewMode = 'timeline' | 'board' | 'list' | 'calendar' | 'gantt';

// Component Props Interfaces
export interface MilestoneBoardProps {
  milestones: Milestone[];
  projects: ProjectWithMilestones[];
  teamMembers: TeamMember[];
  onMilestoneCreate: (milestone: CreateMilestoneData) => void;
  onMilestoneUpdate: (milestoneId: string, updates: Partial<Milestone>) => void;
  onMilestoneDelete: (milestoneId: string) => void;
  onMilestoneMove: (milestoneId: string, newDate: string) => void;
  enableDragDrop?: boolean;
  showProgress?: boolean;
  showDependencies?: boolean;
  viewMode?: MilestoneViewMode;
  timelineRange?: TimelineRange;
}

export interface MilestoneCardProps {
  milestone: Milestone;
  project?: ProjectWithMilestones;
  assignees?: TeamMember[];
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestoneId: string) => void;
  onStatusChange: (milestoneId: string, status: MilestoneStatus) => void;
  onProgressUpdate: (milestoneId: string, progress: number) => void;
  showProgress?: boolean;
  showTasks?: boolean;
  showAssignees?: boolean;
  showDueDate?: boolean;
  isDragging?: boolean;
  enableQuickActions?: boolean;
}

export interface MilestoneCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (milestone: CreateMilestoneData) => void;
  projects: ProjectWithMilestones[];
  teamMembers: TeamMember[];
  existingMilestones: Milestone[];
  defaultProject?: string;
  defaultDueDate?: string;
}

export interface MilestoneEditModalProps {
  isOpen: boolean;
  milestone: Milestone | null;
  onClose: () => void;
  onSubmit: (milestoneId: string, updates: Partial<Milestone>) => void;
  onDelete: (milestoneId: string) => void;
  projects: ProjectWithMilestones[];
  teamMembers: TeamMember[];
  existingMilestones: Milestone[];
  enableArchive?: boolean;
}

export interface MilestoneProgressTrackerProps {
  milestone: Milestone;
  tasks: TaskWithMilestone[];
  onProgressUpdate: (milestoneId: string, progress: number, notes?: string) => void;
  showTaskBreakdown?: boolean;
  showProgressHistory?: boolean;
  enableManualOverride?: boolean;
  realTimeUpdates?: boolean;
}

export interface TaskMilestoneSelectorProps {
  currentMilestoneId?: string;
  projectId: string;
  milestones: Milestone[];
  onMilestoneSelect: (milestoneId: string | null) => void;
  enableCreate?: boolean;
  onMilestoneCreate?: (milestone: CreateMilestoneData) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface MilestoneTaskListProps {
  milestone: Milestone;
  tasks: TaskWithMilestone[];
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskUnlink: (taskId: string) => void;
  showAddTask?: boolean;
  showUnlinkAction?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
}

export interface ProjectRoadmapProps {
  project: ProjectWithMilestones;
  milestones: Milestone[];
  tasks: TaskWithMilestone[];
  timelineRange: TimelineRange;
  onTimelineChange: (range: TimelineRange) => void;
  onMilestoneUpdate: (milestoneId: string, updates: Partial<Milestone>) => void;
  onDependencyCreate: (dependency: CreateDependencyData) => void;
  onDependencyDelete: (dependencyId: string) => void;
  showCriticalPath?: boolean;
  showResourceAllocation?: boolean;
  enableZoom?: boolean;
  exportFormats?: ExportFormat[];
}

export interface GanttChartProps {
  milestones: Milestone[];
  tasks: TaskWithMilestone[];
  dependencies: MilestoneDependency[];
  timelineRange: TimelineRange;
  onItemMove: (itemId: string, newStartDate: string, newEndDate?: string) => void;
  onDependencyCreate: (fromId: string, toId: string, type: DependencyType) => void;
  onDependencyDelete: (dependencyId: string) => void;
  showCriticalPath?: boolean;
  showBaseline?: boolean;
  enableCollaboration?: boolean;
  zoomLevel?: ZoomLevel;
}

export interface MilestoneDependencyManagerProps {
  milestones: Milestone[];
  dependencies: MilestoneDependency[];
  onDependencyCreate: (dependency: CreateDependencyData) => void;
  onDependencyUpdate: (dependencyId: string, updates: Partial<MilestoneDependency>) => void;
  onDependencyDelete: (dependencyId: string) => void;
  onValidate: (dependencies: MilestoneDependency[]) => ValidationResult;
  showGraph?: boolean;
  showImpactAnalysis?: boolean;
  enableBulkOperations?: boolean;
}

// Data Provider Props
export interface MilestoneDataProviderProps {
  children: React.ReactNode;
  projectId?: string;
  enableRealtime?: boolean;
  enableCaching?: boolean;
}

// Utility Interfaces
export interface TimelineRange {
  start: string;
  end: string;
  granularity: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface MilestoneFilter {
  projectId?: string;
  status?: MilestoneStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dateRange?: TimelineRange;
  tags?: string[];
  search?: string;
  overdue?: boolean;
  completedOnly?: boolean;
  includeArchived?: boolean;
}

export interface MilestoneSort {
  field: keyof Milestone;
  direction: 'asc' | 'desc';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export type ZoomLevel = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type ExportFormat = 'png' | 'pdf' | 'svg' | 'json' | 'csv' | 'ms-project';

// Form Data Types
export interface CreateMilestoneData {
  projectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  color: string;
  assignedTo: string[];
  metadata?: Partial<MilestoneMetadata>;
  dependencies?: CreateDependencyData[];
}

export interface UpdateMilestoneData {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: MilestoneStatus;
  priority?: TaskPriority;
  color?: string;
  assignedTo?: string[];
  metadata?: Partial<MilestoneMetadata>;
  isArchived?: boolean;
  completedAt?: string;
  progress?: number;
}

export interface CreateDependencyData {
  milestoneId: string;
  dependsOnId: string;
  dependencyType: DependencyType;
  lagDays?: number;
}

export interface MilestoneFormData {
  title: string;
  description: string;
  projectId: string;
  dueDate: string;
  priority: TaskPriority;
  color: string;
  assignedTo: string[];
  tags: string[];
  estimatedHours: number;
  budgetAllocated: number;
  riskLevel: RiskLevel;
  stakeholders: string[];
  deliverables: string[];
}

// API Response Types
export interface MilestonesResponse {
  milestones: Milestone[];
  total: number;
  page?: number;
  limit?: number;
}

export interface MilestoneResponse {
  milestone: Milestone;
}

export interface MilestoneProgressResponse {
  progress: MilestoneProgress[];
  total: number;
}

export interface MilestoneDependenciesResponse {
  dependencies: MilestoneDependency[];
  total: number;
}

export interface ProjectMilestonesResponse {
  project: ProjectWithMilestones;
  milestones: Milestone[];
  stats: MilestoneStats;
}

export interface MilestoneStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  upcoming: number;
  averageProgress: number;
}

// Real-time Event Types
export interface MilestoneEvent {
  type: 'milestone-created' | 'milestone-updated' | 'milestone-deleted' | 'milestone-completed' | 'progress-updated';
  milestoneId: string;
  milestone?: Milestone;
  changes?: Partial<Milestone>;
  userId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DependencyEvent {
  type: 'dependency-created' | 'dependency-updated' | 'dependency-deleted';
  dependencyId: string;
  dependency?: MilestoneDependency;
  milestoneId: string;
  dependsOnId: string;
  userId: string;
  timestamp: string;
}

// Hook Return Types
export interface UseMilestoneDataReturn {
  milestones: Milestone[];
  loading: boolean;
  error: Error | null;
  createMilestone: (milestone: CreateMilestoneData) => Promise<Milestone>;
  updateMilestone: (milestoneId: string, updates: UpdateMilestoneData) => Promise<Milestone>;
  deleteMilestone: (milestoneId: string) => Promise<void>;
  calculateProgress: (milestoneId: string) => Promise<number>;
  refetch: () => void;
  archiveMilestone: (milestoneId: string) => Promise<void>;
  restoreMilestone: (milestoneId: string) => Promise<void>;
  completedMilestones: Milestone[];
  activeMilestones: Milestone[];
  overdueMilestones: Milestone[];
  upcomingMilestones: Milestone[];
  averageProgress: number;
  stats: MilestoneStats;
}

export interface UseMilestoneProgressReturn {
  progress: MilestoneProgress[];
  currentProgress: number;
  loading: boolean;
  error: Error | null;
  updateProgress: (milestoneId: string, progress: number, notes?: string) => Promise<void>;
  getProgressHistory: (milestoneId: string) => MilestoneProgress[];
  getProgressTrend: (milestoneId: string) => ProgressTrend;
  refetch: () => void;
}

export interface UseMilestoneDependenciesReturn {
  dependencies: MilestoneDependency[];
  loading: boolean;
  error: Error | null;
  createDependency: (dependency: CreateDependencyData) => Promise<MilestoneDependency>;
  deleteDependency: (dependencyId: string) => Promise<void>;
  validateDependencies: (dependencies: MilestoneDependency[]) => Promise<ValidationResult>;
  getCriticalPath: (milestoneIds: string[]) => Promise<Milestone[]>;
  getDependencyGraph: (milestoneId: string) => Promise<DependencyGraph>;
  refetch: () => void;
  checkForCycle: (fromId: string, toId: string) => Promise<boolean>;
  validateCurrentDependencies: () => Promise<ValidationResult>;
  getDependenciesForMilestone: (milestoneId: string) => MilestoneDependency[];
  getDependentMilestones: (milestoneId: string) => MilestoneDependency[];
  validationResult: ValidationResult | null;
  isValid: boolean;
  validationErrors: ValidationError[];
  validationWarnings: ValidationWarning[];
}

export interface ProgressTrend {
  trend: 'increasing' | 'decreasing' | 'stable';
  velocity: number; // Progress per day
  estimatedCompletion: string;
  confidence: number; // 0-100
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  criticalPath: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'milestone' | 'task';
  status: MilestoneStatus;
  progress: number;
  dueDate?: string;
  isOverdue: boolean;
  isCritical: boolean;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: DependencyType;
  lagDays: number;
  isCritical: boolean;
}

// Configuration Types
export interface MilestonesPageConfig {
  layout: {
    sidebarWidth: number;
    timelineHeight: number;
    cardMinHeight: number;
    ganttRowHeight: number;
  };
  features: {
    timeline: boolean;
    ganttChart: boolean;
    dependencyManagement: boolean;
    progressTracking: boolean;
    realtime: boolean;
    collaboration: boolean;
    notifications: boolean;
    export: boolean;
  };
  theme: {
    primaryColor: string;
    statusColors: Record<MilestoneStatus, string>;
    priorityColors: Record<TaskPriority, string>;
    dependencyColors: Record<DependencyType, string>;
  };
  automation: {
    autoProgressCalculation: boolean;
    dependencyValidation: boolean;
    deadlineNotifications: boolean;
    statusUpdates: boolean;
  };
  permissions: {
    canCreateMilestones: boolean;
    canEditMilestones: boolean;
    canDeleteMilestones: boolean;
    canManageDependencies: boolean;
    canExportData: boolean;
  };
}

// Error Types
export interface MilestoneError extends Error {
  code: string;
  details?: Record<string, any>;
  field?: string;
}

export interface DependencyError extends MilestoneError {
  dependencyId?: string;
  circularPath?: string[];
}

// Page Component Props
export interface MilestonesPageProps {
  initialData?: {
    milestones: Milestone[];
    projects: ProjectWithMilestones[];
    teamMembers: TeamMember[];
    dependencies: MilestoneDependency[];
  };
  config: MilestonesPageConfig;
}

// Context Types
export interface MilestoneContextValue {
  milestones: Milestone[];
  projects: ProjectWithMilestones[];
  dependencies: MilestoneDependency[];
  selectedMilestone: Milestone | null;
  loading: boolean;
  error: Error | null;
  createMilestone: (milestone: CreateMilestoneData) => Promise<Milestone>;
  updateMilestone: (milestoneId: string, updates: UpdateMilestoneData) => Promise<Milestone>;
  deleteMilestone: (milestoneId: string) => Promise<void>;
  selectMilestone: (milestoneId: string | null) => void;
  refetch: () => void;
}

// Analytics and Reporting Types
export interface MilestoneAnalytics {
  completionRate: number;
  averageTimeToComplete: number;
  overdueRate: number;
  velocityTrend: VelocityData[];
  riskDistribution: RiskDistribution;
  resourceUtilization: ResourceUtilization[];
  predictiveInsights: PredictiveInsight[];
}

export interface VelocityData {
  date: string;
  completed: number;
  planned: number;
  velocity: number;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface ResourceUtilization {
  userId: string;
  userName: string;
  allocatedHours: number;
  actualHours: number;
  utilizationRate: number;
  overallocation: boolean;
}

export interface PredictiveInsight {
  type: 'risk' | 'opportunity' | 'delay' | 'resource_conflict';
  message: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  suggestedAction?: string;
}