// Tasks page type definitions
// Comprehensive TypeScript interfaces for task management functionality

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  position: number; // For ordering within status columns
  estimatedHours?: number;
  actualHours?: number;
  milestoneId?: string; // Link to milestone
  // Enhanced fields from database schema
  storyPoints?: number;
  effortLevel: TaskEffort;
  complexity: TaskComplexity;
  riskLevel: TaskRisk;
  blockedReason?: string;
  progress: number;
  customFields: Record<string, any>;
  metadata: Record<string, any>;
  // Enhanced relationships
  dependencies: TaskDependency[];
  timeEntries: TaskTimeEntry[];
  templates?: TaskTemplate[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isFavorite: boolean;
  teamMembers: string[];
  settings: ProjectSettings;
  stats: ProjectStats;
}

export interface TaskStatus {
  id: string;
  name: string;
  color: string;
  position: number;
  isDefault: boolean;
  isCompleted: boolean;
  projectId?: string; // Can be project-specific or global
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamRole;
  isActive: boolean;
  joinedAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileExtension?: string;
  fileHash?: string;
  uploadedBy: string;
  createdAt: string;
  isPublic: boolean;
  description?: string;
  metadata: Record<string, any>;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  commentType: TaskCommentType;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  editedAt?: string;
  mentions: string[];
  reactions: Record<string, any>;
  metadata: Record<string, any>;
}

export interface ProjectSettings {
  allowComments: boolean;
  allowAttachments: boolean;
  requireDueDates: boolean;
  defaultAssignee?: string;
  customStatuses: TaskStatus[];
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  activeTasks: number;
  completionRate: number;
}

// Enhanced Enums and Union Types
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TeamRole = 'admin' | 'manager' | 'member' | 'viewer';
export type ViewMode = 'board' | 'list' | 'calendar' | 'team';

// Enhanced Task Enums
export enum TaskComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  VERY_COMPLEX = 'very_complex'
}

export enum TaskEffort {
  MINIMAL = 'minimal',
  LIGHT = 'light',
  MODERATE = 'moderate',
  HEAVY = 'heavy',
  INTENSIVE = 'intensive'
}

export enum TaskRisk {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum DependencyType {
  FINISH_TO_START = 'finish_to_start',
  START_TO_START = 'start_to_start',
  FINISH_TO_FINISH = 'finish_to_finish',
  START_TO_FINISH = 'start_to_finish'
}

export enum TaskCommentType {
  COMMENT = 'comment',
  UPDATE = 'update',
  MENTION = 'mention',
  SYSTEM = 'system',
  APPROVAL = 'approval'
}

export enum TaskActivityType {
  WORK = 'work',
  MEETING = 'meeting',
  RESEARCH = 'research',
  TESTING = 'testing',
  DOCUMENTATION = 'documentation',
  REVIEW = 'review'
}

// Enhanced Task Constants
export const TASK_CONSTANTS = {
  // Default values
  DEFAULT_EFFORT_LEVEL: TaskEffort.MODERATE,
  DEFAULT_COMPLEXITY: TaskComplexity.MODERATE,
  DEFAULT_RISK_LEVEL: TaskRisk.LOW,
  DEFAULT_PRIORITY: 'medium' as TaskPriority,
  DEFAULT_PROGRESS: 0,
  DEFAULT_POSITION: 0,
  DEFAULT_STORY_POINTS: 0,
  DEFAULT_ACTIVITY_TYPE: TaskActivityType.WORK,
  DEFAULT_DEPENDENCY_TYPE: DependencyType.FINISH_TO_START,
  DEFAULT_COMMENT_TYPE: TaskCommentType.COMMENT,
  
  // Limits and constraints
  MAX_STORY_POINTS: 100,
  MAX_PROGRESS: 100,
  MIN_PROGRESS: 0,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 10000,
  MAX_TAGS: 20,
  MAX_TAG_LENGTH: 50,
  MAX_FILENAME_LENGTH: 255,
  MAX_HOURS: 9999,
  MIN_HOURS: 0,
  
  // File upload limits
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_ATTACHMENTS_PER_TASK: 10,
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed'
  ],
  
  // Time tracking
  MAX_TIME_ENTRY_DURATION: 24 * 60, // 24 hours in minutes
  MIN_TIME_ENTRY_DURATION: 1, // 1 minute
  
  // Automation limits
  MAX_AUTOMATION_RULES_PER_PROJECT: 50,
  MAX_AUTOMATION_CONDITIONS: 10,
  MAX_AUTOMATION_ACTIONS: 10,
  
  // Comment limits
  MAX_COMMENT_LENGTH: 5000,
  MAX_MENTIONS_PER_COMMENT: 20,
  MAX_COMMENT_THREAD_DEPTH: 10,
  
  // Template limits
  MAX_TEMPLATES_PER_USER: 100,
  MAX_TEMPLATE_DATA_SIZE: 10000, // JSON string length
  
  // Dependencies
  MAX_DEPENDENCIES_PER_TASK: 50,
  MAX_DEPENDENCY_CHAIN_DEPTH: 20
} as const;

// Task Status Constants
export const TASK_STATUS_CONSTANTS = {
  // Default status values
  DEFAULT_STATUS: 'todo',
  COMPLETED_STATUSES: ['completed', 'done', 'finished'],
  IN_PROGRESS_STATUSES: ['in_progress', 'doing', 'active'],
  BLOCKED_STATUSES: ['blocked', 'on_hold', 'waiting'],
  
  // Status colors
  STATUS_COLORS: {
    todo: '#64748b',
    in_progress: '#3b82f6',
    review: '#f59e0b',
    blocked: '#ef4444',
    completed: '#10b981',
    cancelled: '#6b7280'
  },
  
  // Priority colors
  PRIORITY_COLORS: {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    urgent: '#dc2626'
  }
} as const;

// Component Props Interfaces
export interface TaskBoardProps {
  tasks: Task[];
  statuses: TaskStatus[];
  onTaskMove: (taskId: string, newStatus: string, newPosition: number) => void;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  enableDragDrop?: boolean;
  showPriority?: boolean;
  showAssignee?: boolean;
  showDueDate?: boolean;
  enableQuickActions?: boolean;
  statusColumns?: StatusColumn[];
}

export interface TaskCardProps {
  task: Task;
  project?: Project;
  assignee?: TeamMember;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: string) => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
  showPriority?: boolean;
  showAssignee?: boolean;
  showDueDate?: boolean;
  isDragging?: boolean;
}

export interface ProjectSidebarProps {
  projects: Project[];
  selectedProject?: string;
  onProjectSelect: (projectId: string) => void;
  onProjectCreate: () => void;
  onProjectEdit: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
  onProjectToggleFavorite: (projectId: string) => void;
  showFavorites?: boolean;
  showAllProjects?: boolean;
  showSpecialViews?: boolean;
  enableProjectActions?: boolean;
  specialViews?: SpecialView[];
}

export interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableSearch?: boolean;
  enableBulkActions?: boolean;
}

export interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskData) => void;
  projects: Project[];
  teamMembers: TeamMember[];
  statuses: TaskStatus[];
  defaultProject?: string;
  defaultStatus?: string;
}

export interface TaskEditModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmit: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  projects: Project[];
  teamMembers: TeamMember[];
  statuses: TaskStatus[];
}

export interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'stats'>) => void;
  teamMembers: TeamMember[];
}

export interface ProjectEditModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSubmit: (projectId: string, updates: Partial<Project>) => void;
  onDelete: (projectId: string) => void;
  teamMembers: TeamMember[];
}

export interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  onInviteMember: (email: string, role: TeamRole) => void;
  onUpdateMemberRole: (memberId: string, role: TeamRole) => void;
  onRemoveMember: (memberId: string) => void;
}

// Utility Types
export interface StatusColumn {
  id: string;
  label: string;
  color: string;
  tasks?: Task[];
}

export interface SpecialView {
  id: string;
  label: string;
  icon: string;
  filter?: (tasks: Task[]) => Task[];
}

export interface TaskFilter {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  search?: string;
  // Enhanced filter options
  milestoneId?: string;
  createdBy?: string;
  effortLevel?: TaskEffort;
  complexity?: TaskComplexity;
  riskLevel?: TaskRisk;
  storyPoints?: {
    min?: number;
    max?: number;
  };
  estimatedHours?: {
    min?: number;
    max?: number;
  };
  actualHours?: {
    min?: number;
    max?: number;
  };
  progress?: {
    min?: number;
    max?: number;
  };
  isBlocked?: boolean;
  hasDependencies?: boolean;
  hasAttachments?: boolean;
  hasComments?: boolean;
  hasTimeEntries?: boolean;
  customFields?: Record<string, any>;
  // Advanced filtering
  logicalOperator?: 'and' | 'or';
  includeSubtasks?: boolean;
  includeArchived?: boolean;
  sortBy?: keyof Task;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TaskSort {
  field: keyof Task;
  direction: 'asc' | 'desc';
}

// API Response Types
export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
}

export interface TaskStatusesResponse {
  statuses: TaskStatus[];
}

export interface TeamMembersResponse {
  members: TeamMember[];
  total: number;
}

// Enhanced Task API Types
export interface CreateTaskData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  milestoneId?: string;
  assigneeId?: string;
  createdBy: string;
  dueDate?: string;
  estimatedHours?: number;
  storyPoints?: number;
  effortLevel: TaskEffort;
  complexity: TaskComplexity;
  riskLevel: TaskRisk;
  tags: string[];
  customFields: Record<string, any>;
  metadata: Record<string, any>;
  position: number;
  progress: number;
  dependencies: TaskDependency[];
  timeEntries: TaskTimeEntry[];
  templateId?: string;
  parentTaskId?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  milestoneId?: string;
  assigneeId?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  effortLevel?: TaskEffort;
  complexity?: TaskComplexity;
  riskLevel?: TaskRisk;
  blockedReason?: string;
  tags?: string[];
  progress?: number;
  position?: number;
  customFields?: Record<string, any>;
  completedAt?: string;
}

export interface BulkTaskUpdate {
  taskIds: string[];
  updates: UpdateTaskData;
  options?: {
    skipValidation?: boolean;
    updateDependencies?: boolean;
    notifyAssignees?: boolean;
    createHistoryEntry?: boolean;
    continueOnError?: boolean;
  };
}

export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  averageEstimatedHours: number;
  averageActualHours: number;
  estimationAccuracy: number;
  // Time-based analytics
  tasksCreatedThisWeek: number;
  tasksCompletedThisWeek: number;
  tasksCreatedThisMonth: number;
  tasksCompletedThisMonth: number;
  // Priority distribution
  priorityDistribution: Record<TaskPriority, number>;
  // Status distribution
  statusDistribution: Record<string, number>;
  // Effort distribution
  effortDistribution: Record<TaskEffort, number>;
  // Complexity distribution
  complexityDistribution: Record<TaskComplexity, number>;
  // Risk distribution
  riskDistribution: Record<TaskRisk, number>;
  // Team performance
  teamPerformance: {
    assigneeId: string;
    totalTasks: number;
    completedTasks: number;
    averageCompletionTime: number;
    completionRate: number;
  }[];
  // Time tracking
  totalTimeTracked: number;
  billableTimeTracked: number;
  timeByActivity: Record<TaskActivityType, number>;
  // Burndown data
  burndownData: {
    date: string;
    totalTasks: number;
    completedTasks: number;
    remainingTasks: number;
  }[];
  // Velocity data
  velocityData: {
    period: string;
    storyPointsCompleted: number;
    tasksCompleted: number;
  }[];
}

export interface TaskAssignment {
  taskId: string;
  assigneeId: string;
  assignedBy: string;
  assignedAt: string;
  reason?: string;
  skills?: string[];
  workloadScore?: number;
  availabilityScore?: number;
  matchScore?: number;
  autoAssigned?: boolean;
  notificationSent?: boolean;
}

export interface TaskValidationResult {
  isValid: boolean;
  errors: TaskValidationError[];
  warnings: TaskValidationWarning[];
}

export interface TaskValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

export interface TaskValidationWarning {
  field: string;
  code: string;
  message: string;
  value?: any;
}

export interface TaskBatchOperation {
  operation: 'create' | 'update' | 'delete' | 'move' | 'assign';
  tasks: string[] | CreateTaskData[] | UpdateTaskData[];
  options?: {
    skipValidation?: boolean;
    updateDependencies?: boolean;
    notifyAssignees?: boolean;
    createHistoryEntry?: boolean;
    continueOnError?: boolean;
  };
}

export interface TaskBatchResult {
  success: boolean;
  processedCount: number;
  errorCount: number;
  results: {
    taskId: string;
    success: boolean;
    error?: string;
    data?: Task;
  }[];
  summary: {
    totalRequested: number;
    successful: number;
    failed: number;
    skipped: number;
  };
}

// Realtime Event Types
export interface TaskEvent {
  type: 'task-created' | 'task-updated' | 'task-deleted' | 'task-moved';
  taskId: string;
  task?: Task;
  changes?: Partial<Task>;
  userId: string;
  timestamp: string;
}

export interface ProjectEvent {
  type: 'project-created' | 'project-updated' | 'project-deleted';
  projectId: string;
  project?: Project;
  changes?: Partial<Project>;
  userId: string;
  timestamp: string;
}

// Enhanced Hook Return Types
export interface UseTaskManagerReturn {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  createTask: (task: CreateTaskData) => Promise<Task>;
  updateTask: (taskId: string, updates: UpdateTaskData) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: string, newPosition: number) => Promise<void>;
  bulkUpdateTasks: (operation: BulkTaskUpdate) => Promise<TaskBatchResult>;
  validateTask: (task: CreateTaskData | UpdateTaskData) => TaskValidationResult;
  refetch: () => void;
  // Enhanced filtering and search
  filter: TaskFilter;
  setFilter: (filter: Partial<TaskFilter>) => void;
  clearFilter: () => void;
  // Real-time updates
  isConnected: boolean;
  lastUpdated: string;
}

export interface UseTaskAnalyticsReturn {
  analytics: TaskAnalytics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  // Date range controls
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  // Filter controls
  filters: TaskFilter;
  setFilters: (filters: Partial<TaskFilter>) => void;
  // Export functionality
  exportData: (format: 'csv' | 'xlsx' | 'pdf') => Promise<void>;
  // Real-time updates
  subscribe: (callback: (analytics: TaskAnalytics) => void) => () => void;
}

export interface UseTaskAssignmentReturn {
  assignments: TaskAssignment[];
  loading: boolean;
  error: Error | null;
  assignTask: (taskId: string, assigneeId: string, options?: TaskAssignmentOptions) => Promise<TaskAssignment>;
  unassignTask: (taskId: string) => Promise<void>;
  bulkAssign: (taskIds: string[], assigneeId: string) => Promise<TaskBatchResult>;
  suggestAssignee: (taskId: string) => Promise<TaskAssignmentSuggestion[]>;
  getWorkloadBalance: (teamMemberIds: string[]) => Promise<WorkloadBalance[]>;
  optimizeAssignments: (projectId: string) => Promise<TaskAssignmentOptimization>;
  refetch: () => void;
}

export interface UseTaskCollaborationReturn {
  comments: TaskComment[];
  loading: boolean;
  error: Error | null;
  addComment: (taskId: string, content: string, options?: CommentOptions) => Promise<TaskComment>;
  updateComment: (commentId: string, content: string) => Promise<TaskComment>;
  deleteComment: (commentId: string) => Promise<void>;
  mentionUser: (userId: string, commentId: string) => Promise<void>;
  addReaction: (commentId: string, reaction: string) => Promise<void>;
  removeReaction: (commentId: string, reaction: string) => Promise<void>;
  // Real-time collaboration
  typingUsers: string[];
  isTyping: boolean;
  setTyping: (isTyping: boolean) => void;
  subscribe: (callback: (comments: TaskComment[]) => void) => () => void;
}

export interface UseTaskTimeTrackingReturn {
  timeEntries: TaskTimeEntry[];
  loading: boolean;
  error: Error | null;
  startTimer: (taskId: string, description?: string) => Promise<TaskTimeEntry>;
  stopTimer: (entryId: string) => Promise<TaskTimeEntry>;
  addTimeEntry: (entry: Partial<TaskTimeEntry>) => Promise<TaskTimeEntry>;
  updateTimeEntry: (entryId: string, updates: Partial<TaskTimeEntry>) => Promise<TaskTimeEntry>;
  deleteTimeEntry: (entryId: string) => Promise<void>;
  getTotalTime: (taskId: string) => number;
  getBillableTime: (taskId: string) => number;
  getCurrentEntry: () => TaskTimeEntry | null;
  isTracking: boolean;
  refetch: () => void;
}

export interface UseTaskDependenciesReturn {
  dependencies: TaskDependency[];
  loading: boolean;
  error: Error | null;
  addDependency: (taskId: string, dependsOnId: string, type?: DependencyType) => Promise<TaskDependency>;
  removeDependency: (dependencyId: string) => Promise<void>;
  updateDependency: (dependencyId: string, updates: Partial<TaskDependency>) => Promise<TaskDependency>;
  validateDependency: (taskId: string, dependsOnId: string) => Promise<boolean>;
  getCriticalPath: (projectId: string) => Promise<string[]>;
  getBlockedTasks: (taskId: string) => Promise<Task[]>;
  getDependencyChain: (taskId: string) => Promise<TaskDependency[]>;
  refetch: () => void;
}

export interface UseTaskTemplatesReturn {
  templates: TaskTemplate[];
  loading: boolean;
  error: Error | null;
  createTemplate: (template: Partial<TaskTemplate>) => Promise<TaskTemplate>;
  updateTemplate: (templateId: string, updates: Partial<TaskTemplate>) => Promise<TaskTemplate>;
  deleteTemplate: (templateId: string) => Promise<void>;
  applyTemplate: (templateId: string, projectId: string, overrides?: Partial<CreateTaskData>) => Promise<Task>;
  getPublicTemplates: () => Promise<TaskTemplate[]>;
  duplicateTemplate: (templateId: string) => Promise<TaskTemplate>;
  refetch: () => void;
}

export interface UseTaskAutomationReturn {
  automations: TaskAutomation[];
  loading: boolean;
  error: Error | null;
  createAutomation: (automation: Partial<TaskAutomation>) => Promise<TaskAutomation>;
  updateAutomation: (automationId: string, updates: Partial<TaskAutomation>) => Promise<TaskAutomation>;
  deleteAutomation: (automationId: string) => Promise<void>;
  toggleAutomation: (automationId: string, isActive: boolean) => Promise<TaskAutomation>;
  testAutomation: (automationId: string, taskId: string) => Promise<boolean>;
  getExecutionHistory: (automationId: string) => Promise<TaskAutomationExecution[]>;
  refetch: () => void;
}

export interface UseProjectDataReturn {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: Error | null;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'stats'>) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  selectProject: (projectId: string) => void;
  toggleFavorite: (projectId: string) => Promise<void>;
  refetch: () => void;
}

// Configuration Types (for scripts and automation)
export interface TasksPageConfig {
  layout: {
    sidebarWidth: number;
    boardMinHeight: number;
    cardMinHeight: number;
  };
  features: {
    kanbanBoard: boolean;
    listView: boolean;
    calendarView: boolean;
    teamView: boolean;
    realtime: boolean;
  };
  theme: {
    primaryColor: string;
    statusColors: Record<string, string>;
    priorityColors: Record<TaskPriority, string>;
  };
  automation: {
    autoAssignment: boolean;
    dueDate: boolean;
    notifications: boolean;
  };
}

// Form Types
export interface TaskFormData {
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  status: string;
  priority: TaskPriority;
  dueDate: string;
  tags: string[];
  estimatedHours: number;
  milestoneId: string; // Milestone selection
}

export interface ProjectFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  teamMembers: string[];
  settings: Partial<ProjectSettings>;
}

// Error Types
export interface TasksError extends Error {
  code: string;
  details?: Record<string, any>;
}

export interface ValidationError extends TasksError {
  field: string;
  message: string;
}

// Drag and Drop Types (for React Beautiful DnD)
export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
  reason: 'DROP' | 'CANCEL';
}

// Page Component Props
export interface TasksPageProps {
  initialData?: {
    tasks: Task[];
    projects: Project[];
    statuses: TaskStatus[];
    teamMembers: TeamMember[];
  };
  config: TasksPageConfig;
}

// Enhanced Task Relationship Interfaces
export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnId: string;
  dependencyType: DependencyType;
  lagHours: number;
  isBlocking: boolean;
  createdAt: string;
  createdBy?: string;
  notes?: string;
}

export interface TaskTimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  description?: string;
  isBillable: boolean;
  hourlyRate?: number;
  activityType: TaskActivityType;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  templateData: Record<string, any>;
  defaultAssigneeId?: string;
  defaultProjectId?: string;
  defaultEstimatedHours?: number;
  defaultPriority: TaskPriority;
  defaultTags: string[];
  isPublic: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  metadata: Record<string, any>;
}

export interface TaskStatusConfig {
  id: string;
  projectId?: string;
  statusName: string;
  displayName: string;
  color: string;
  description?: string;
  position: number;
  isDefault: boolean;
  isCompleted: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canTransitionTo: string[];
  metadata: Record<string, any>;
}

export interface TaskAutomation {
  id: string;
  projectId?: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: TaskAutomationTrigger;
  conditions: TaskAutomationCondition[];
  actions: TaskAutomationAction[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  runCount: number;
  metadata: Record<string, any>;
}

export interface TaskAutomationTrigger {
  event: 'task_created' | 'task_updated' | 'task_completed' | 'task_assigned' | 'due_date_approaching';
  conditions?: Record<string, any>;
}

export interface TaskAutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface TaskAutomationAction {
  type: 'update_field' | 'assign_task' | 'create_comment' | 'send_notification' | 'create_subtask';
  parameters: Record<string, any>;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId?: string;
  action: string;
  changes: Record<string, any>;
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  timestamp: string;
  metadata: Record<string, any>;
}

// Hook Configuration Types
export interface TaskAssignmentOptions {
  reason?: string;
  notifyAssignee?: boolean;
  transferWorkload?: boolean;
  autoReassignDependencies?: boolean;
  skills?: string[];
}

export interface TaskAssignmentSuggestion {
  userId: string;
  matchScore: number;
  reasons: string[];
  workloadScore: number;
  availabilityScore: number;
  skillsMatchScore: number;
  currentTasks: number;
  estimatedCapacity: number;
}

export interface WorkloadBalance {
  userId: string;
  currentTasks: number;
  totalEstimatedHours: number;
  capacity: number;
  utilization: number;
  availability: number;
  skills: string[];
  upcomingTasks: Task[];
}

export interface TaskAssignmentOptimization {
  recommendations: {
    taskId: string;
    currentAssignee?: string;
    suggestedAssignee: string;
    reason: string;
    impact: number;
  }[];
  balanceScore: number;
  estimatedImprovement: number;
}

export interface CommentOptions {
  commentType?: TaskCommentType;
  parentId?: string;
  mentions?: string[];
  isPrivate?: boolean;
  attachments?: File[];
}

export interface TaskAutomationExecution {
  id: string;
  automationId: string;
  taskId: string;
  triggeredAt: string;
  completedAt?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  actionsExecuted: number;
  metadata: Record<string, any>;
}

// Type Guards for Runtime Validation
export interface TaskTypeGuards {
  isValidTask: (obj: any) => obj is Task;
  isValidTaskDependency: (obj: any) => obj is TaskDependency;
  isValidTaskComment: (obj: any) => obj is TaskComment;
  isValidTaskAttachment: (obj: any) => obj is TaskAttachment;
  isValidTaskTimeEntry: (obj: any) => obj is TaskTimeEntry;
  isValidTaskTemplate: (obj: any) => obj is TaskTemplate;
  isValidTaskAutomation: (obj: any) => obj is TaskAutomation;
  isTaskCompleted: (task: Task) => boolean;
  isTaskOverdue: (task: Task) => boolean;
  isTaskBlocked: (task: Task) => boolean;
  canUserEditTask: (task: Task, userId: string) => boolean;
  canUserDeleteTask: (task: Task, userId: string) => boolean;
}

// Error Types for Hook Operations
export interface TaskOperationError extends Error {
  code: 'VALIDATION_ERROR' | 'PERMISSION_ERROR' | 'DEPENDENCY_ERROR' | 'NETWORK_ERROR' | 'SERVER_ERROR';
  field?: string;
  taskId?: string;
  details?: Record<string, any>;
}

export interface TaskSubscriptionError extends Error {
  code: 'CONNECTION_ERROR' | 'AUTHENTICATION_ERROR' | 'SUBSCRIPTION_ERROR';
  retryable: boolean;
  retryAfter?: number;
}