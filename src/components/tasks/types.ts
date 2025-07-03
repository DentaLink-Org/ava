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
  tags?: string[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  position?: number; // For ordering within status columns
  estimatedHours?: number;
  actualHours?: number;
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
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
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

// Enums and Union Types
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TeamRole = 'admin' | 'manager' | 'member' | 'viewer';
export type ViewMode = 'board' | 'list' | 'calendar' | 'team';

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
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
  status?: string;
  priority?: TaskPriority;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  search?: string;
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

// Hook Return Types
export interface UseTaskManagerReturn {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: string, newPosition: number) => Promise<void>;
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