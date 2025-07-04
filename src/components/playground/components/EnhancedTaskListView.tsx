import React, { useState, useMemo, useCallback, useRef } from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  MoreVertical,
  Calendar,
  User,
  Flag,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Brain,
  Activity,
  AlertTriangle,
  MessageSquare,
  Paperclip,
  Link2,
  Hash,
  Download,
  Upload,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Archive,
  RotateCcw,
  Settings,
  Columns,
  Grid,
  List,
  BarChart3,
  FileText,
  Timer,
  TrendingUp,
  Users,
  Plus,
  X
} from 'lucide-react';
import type { 
  Task, 
  Project, 
  TeamMember, 
  TaskFilter, 
  TaskSort, 
  TaskPriority,
  TaskComplexity,
  TaskEffort,
  TaskRisk,
  UpdateTaskData
} from '../../tasks/types';

interface EnhancedTaskListViewProps {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
  loading?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableSearch?: boolean;
  enableBulkActions?: boolean;
  enableColumnCustomization?: boolean;
  enableVirtualScrolling?: boolean;
  enableInlineEditing?: boolean;
  enableExport?: boolean;
  defaultPageSize?: number;
  onTaskCreate?: () => void;
  onTaskUpdate?: (taskId: string, updates: UpdateTaskData) => Promise<void>;
  onTaskDelete?: (taskId: string) => Promise<void>;
  onTaskView?: (taskId: string) => void;
  onTaskEdit?: (task: Task) => void;
  onBulkAction?: (taskIds: string[], action: string) => Promise<void>;
  onExport?: (format: 'csv' | 'xlsx' | 'pdf') => Promise<void>;
}

interface ColumnConfig {
  key: string;
  label: string;
  width: number;
  sortable: boolean;
  visible: boolean;
  required?: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'status', label: 'Status', width: 80, sortable: false, visible: true, required: true },
  { key: 'title', label: 'Task', width: 300, sortable: true, visible: true, required: true },
  { key: 'priority', label: 'Priority', width: 100, sortable: true, visible: true },
  { key: 'assignee', label: 'Assignee', width: 150, sortable: true, visible: true },
  { key: 'project', label: 'Project', width: 150, sortable: true, visible: true },
  { key: 'dueDate', label: 'Due Date', width: 120, sortable: true, visible: true },
  { key: 'progress', label: 'Progress', width: 100, sortable: true, visible: true },
  { key: 'complexity', label: 'Complexity', width: 120, sortable: true, visible: false },
  { key: 'effort', label: 'Effort', width: 100, sortable: true, visible: false },
  { key: 'risk', label: 'Risk', width: 100, sortable: true, visible: false },
  { key: 'storyPoints', label: 'Points', width: 80, sortable: true, visible: false },
  { key: 'estimatedHours', label: 'Est. Hours', width: 100, sortable: true, visible: false },
  { key: 'actualHours', label: 'Act. Hours', width: 100, sortable: true, visible: false },
  { key: 'comments', label: 'Comments', width: 80, sortable: false, visible: false },
  { key: 'attachments', label: 'Files', width: 80, sortable: false, visible: false },
  { key: 'dependencies', label: 'Deps', width: 80, sortable: false, visible: false },
  { key: 'createdAt', label: 'Created', width: 120, sortable: true, visible: false },
  { key: 'updatedAt', label: 'Updated', width: 120, sortable: true, visible: false },
  { key: 'actions', label: 'Actions', width: 80, sortable: false, visible: true, required: true }
];

export const EnhancedTaskListView: React.FC<EnhancedTaskListViewProps> = ({
  tasks,
  projects,
  teamMembers,
  loading = false,
  enableSorting = true,
  enableFiltering = true,
  enableSearch = true,
  enableBulkActions = true,
  enableColumnCustomization = true,
  enableVirtualScrolling = false,
  enableInlineEditing = false,
  enableExport = true,
  defaultPageSize = 50,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onTaskView,
  onTaskEdit,
  onBulkAction,
  onExport
}) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TaskFilter>({});
  const [sort, setSort] = useState<TaskSort>({ field: 'updatedAt', direction: 'desc' });
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'compact' | 'detailed'>('list');

  const tableRef = useRef<HTMLDivElement>(null);

  // Memoized filtered and sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        task.id.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filter.projectId) {
      filtered = filtered.filter(task => task.projectId === filter.projectId);
    }
    if (filter.assigneeId) {
      filtered = filtered.filter(task => task.assigneeId === filter.assigneeId);
    }
    if (filter.status) {
      const statusId = typeof filter.status === 'string' ? filter.status : filter.status.id;
      filtered = filtered.filter(task => {
        const taskStatusId = typeof task.status === 'string' ? task.status : task.status.id;
        return taskStatusId === statusId;
      });
    }
    if (filter.priority) {
      filtered = filtered.filter(task => task.priority === filter.priority);
    }
    if (filter.complexity) {
      filtered = filtered.filter(task => task.complexity === filter.complexity);
    }
    if (filter.effortLevel) {
      filtered = filtered.filter(task => task.effortLevel === filter.effortLevel);
    }
    if (filter.riskLevel) {
      filtered = filtered.filter(task => task.riskLevel === filter.riskLevel);
    }
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(task => 
        filter.tags!.some(tag => task.tags?.includes(tag))
      );
    }
    if (filter.milestoneId) {
      filtered = filtered.filter(task => task.milestoneId === filter.milestoneId);
    }
    if (filter.isBlocked !== undefined) {
      filtered = filtered.filter(task => !!task.blockedReason === filter.isBlocked);
    }
    if (filter.hasComments !== undefined) {
      filtered = filtered.filter(task => 
        (task.comments && task.comments.length > 0) === filter.hasComments
      );
    }
    if (filter.hasAttachments !== undefined) {
      filtered = filtered.filter(task => 
        (task.attachments && task.attachments.length > 0) === filter.hasAttachments
      );
    }
    if (filter.hasDependencies !== undefined) {
      filtered = filtered.filter(task => 
        (task.dependencies && task.dependencies.length > 0) === filter.hasDependencies
      );
    }

    // Apply date range filter
    if (filter.dateRange) {
      const start = new Date(filter.dateRange.start);
      const end = new Date(filter.dateRange.end);
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= start && dueDate <= end;
      });
    }

    // Apply progress filter
    if (filter.progress) {
      filtered = filtered.filter(task => {
        const progress = task.progress || 0;
        return progress >= (filter.progress!.min || 0) && 
               progress <= (filter.progress!.max || 100);
      });
    }

    // Apply sorting
    if (enableSorting && sort) {
      filtered.sort((a, b) => {
        let aValue: any = a[sort.field as keyof Task];
        let bValue: any = b[sort.field as keyof Task];
        
        // Handle special sorting fields
        if (sort.field === 'assignee' as any) {
          const aAssignee = teamMembers.find(m => m.id === a.assigneeId);
          const bAssignee = teamMembers.find(m => m.id === b.assigneeId);
          aValue = aAssignee?.name || '';
          bValue = bAssignee?.name || '';
        } else if (sort.field === 'project' as any) {
          const aProject = projects.find(p => p.id === a.projectId);
          const bProject = projects.find(p => p.id === b.projectId);
          aValue = aProject?.name || '';
          bValue = bProject?.name || '';
        } else if (sort.field === 'status') {
          aValue = typeof a.status === 'string' ? a.status : a.status.name;
          bValue = typeof b.status === 'string' ? b.status : b.status.name;
        }
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [tasks, searchQuery, filter, sort, enableSorting, teamMembers, projects]);

  // Paginated tasks
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedTasks.slice(startIndex, endIndex);
  }, [filteredAndSortedTasks, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedTasks.length / pageSize);
  const visibleColumns = columns.filter(col => col.visible);

  // Helper functions
  const getProject = useCallback((projectId: string) => {
    return projects.find(p => p.id === projectId);
  }, [projects]);

  const getAssignee = useCallback((assigneeId?: string) => {
    if (!assigneeId) return undefined;
    return teamMembers.find(m => m.id === assigneeId);
  }, [teamMembers]);

  const getPriorityColor = useCallback((priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getComplexityColor = useCallback((complexity: TaskComplexity) => {
    switch (complexity) {
      case 'very_complex': return 'bg-purple-100 text-purple-800';
      case 'complex': return 'bg-indigo-100 text-indigo-800';
      case 'moderate': return 'bg-blue-100 text-blue-800';
      case 'simple': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getEffortColor = useCallback((effort: TaskEffort) => {
    switch (effort) {
      case 'intensive': return 'bg-red-100 text-red-800';
      case 'heavy': return 'bg-orange-100 text-orange-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'light': return 'bg-blue-100 text-blue-800';
      case 'minimal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getRiskColor = useCallback((risk: TaskRisk) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const isOverdue = useCallback((task: Task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const isCompleted = typeof task.status === 'string' ? 
      task.status === 'completed' : 
      task.status.isCompleted;
    return dueDate < today && !isCompleted;
  }, []);

  // Event handlers
  const handleSort = useCallback((field: keyof Task) => {
    if (!enableSorting) return;
    
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, [enableSorting]);

  const handleTaskToggle = useCallback((taskId: string, checked: boolean) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(paginatedTasks.map(t => t.id)));
    } else {
      setSelectedTasks(new Set());
    }
  }, [paginatedTasks]);

  const handleTaskComplete = useCallback(async (task: Task) => {
    if (!onTaskUpdate) return;
    
    const isCompleted = typeof task.status === 'string' ? 
      task.status === 'completed' : 
      task.status.isCompleted;
    
    try {
      await onTaskUpdate(task.id, {
        status: isCompleted ? 
          { id: 'todo', name: 'To Do', color: '#64748b', position: 0, isDefault: false, isCompleted: false } :
          { id: 'completed', name: 'Completed', color: '#10b981', position: 4, isDefault: false, isCompleted: true },
        progress: isCompleted ? undefined : 100,
        completedAt: isCompleted ? undefined : new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  }, [onTaskUpdate]);

  const handleBulkAction = useCallback(async (action: string) => {
    if (!onBulkAction || selectedTasks.size === 0) return;
    
    try {
      await onBulkAction(Array.from(selectedTasks), action);
      setSelectedTasks(new Set());
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  }, [onBulkAction, selectedTasks]);

  const handleColumnToggle = useCallback((columnKey: string) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  }, []);

  const handleExport = useCallback(async (format: 'csv' | 'xlsx' | 'pdf') => {
    if (!onExport) return;
    
    try {
      await onExport(format);
    } catch (error) {
      console.error('Failed to export:', error);
    }
  }, [onExport]);

  // Render cell content
  const renderCell = useCallback((task: Task, column: ColumnConfig) => {
    const isEditing = editingCell?.taskId === task.id && editingCell?.field === column.key;
    
    switch (column.key) {
      case 'status':
        const isCompleted = typeof task.status === 'string' ? 
          task.status === 'completed' : 
          task.status.isCompleted;
        return (
          <button
            onClick={() => handleTaskComplete(task)}
            className="flex items-center justify-center w-6 h-6"
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        );

      case 'title':
        return (
          <div className="min-w-0">
            <div 
              className={`font-medium truncate ${
                typeof task.status === 'string' ? 
                  task.status === 'completed' : 
                  task.status.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {task.title}
            </div>
            {task.description && viewMode === 'detailed' && (
              <div className="text-sm text-gray-600 truncate mt-1">
                {task.description}
              </div>
            )}
            {task.tags && task.tags.length > 0 && viewMode !== 'compact' && (
              <div className="flex flex-wrap gap-1 mt-1">
                {task.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                  >
                    <Hash className="w-2 h-2 mr-0.5" />
                    {tag}
                  </span>
                ))}
                {task.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
                )}
              </div>
            )}
            {task.blockedReason && (
              <div className="flex items-center mt-1">
                <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />
                <span className="text-xs text-red-600">Blocked</span>
              </div>
            )}
          </div>
        );

      case 'priority':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            <Flag className="w-3 h-3 mr-1" />
            {task.priority}
          </span>
        );

      case 'assignee':
        const assignee = getAssignee(task.assigneeId);
        return assignee ? (
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
              {assignee.name.charAt(0)}
            </div>
            <span className="text-sm text-gray-900 truncate">{assignee.name}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Unassigned</span>
        );

      case 'project':
        const project = getProject(task.projectId);
        return project ? (
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: project.color }}
            />
            <span className="text-sm text-gray-900 truncate">{project.name}</span>
          </div>
        ) : null;

      case 'dueDate':
        return task.dueDate ? (
          <div className={`flex items-center text-sm ${isOverdue(task) ? 'text-red-600' : 'text-gray-600'}`}>
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(task.dueDate)}
          </div>
        ) : null;

      case 'progress':
        return task.progress !== undefined ? (
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span>{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        ) : null;

      case 'complexity':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getComplexityColor(task.complexity)}`}>
            <Brain className="w-3 h-3 mr-1" />
            {task.complexity}
          </span>
        );

      case 'effort':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEffortColor(task.effortLevel)}`}>
            <Activity className="w-3 h-3 mr-1" />
            {task.effortLevel}
          </span>
        );

      case 'risk':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getRiskColor(task.riskLevel)}`}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            {task.riskLevel}
          </span>
        );

      case 'storyPoints':
        return task.storyPoints ? (
          <div className="flex items-center text-sm text-gray-600">
            <Target className="w-3 h-3 mr-1" />
            {task.storyPoints}
          </div>
        ) : null;

      case 'estimatedHours':
        return task.estimatedHours ? (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-3 h-3 mr-1" />
            {task.estimatedHours}h
          </div>
        ) : null;

      case 'actualHours':
        return task.actualHours ? (
          <div className="flex items-center text-sm text-gray-600">
            <Timer className="w-3 h-3 mr-1" />
            {task.actualHours}h
          </div>
        ) : null;

      case 'comments':
        return task.comments && task.comments.length > 0 ? (
          <div className="flex items-center text-sm text-gray-600">
            <MessageSquare className="w-3 h-3 mr-1" />
            {task.comments.length}
          </div>
        ) : null;

      case 'attachments':
        return task.attachments && task.attachments.length > 0 ? (
          <div className="flex items-center text-sm text-gray-600">
            <Paperclip className="w-3 h-3 mr-1" />
            {task.attachments.length}
          </div>
        ) : null;

      case 'dependencies':
        return task.dependencies && task.dependencies.length > 0 ? (
          <div className="flex items-center text-sm text-gray-600">
            <Link2 className="w-3 h-3 mr-1" />
            {task.dependencies.length}
          </div>
        ) : null;

      case 'createdAt':
        return (
          <span className="text-sm text-gray-600">
            {formatDate(task.createdAt)}
          </span>
        );

      case 'updatedAt':
        return (
          <span className="text-sm text-gray-600">
            {formatDate(task.updatedAt)}
          </span>
        );

      case 'actions':
        return (
          <div className="flex items-center space-x-1">
            {onTaskView && (
              <button
                onClick={() => onTaskView(task.id)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="View task"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onTaskEdit && (
              <button
                onClick={() => onTaskEdit(task)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Edit task"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        );

      default:
        return null;
    }
  }, [
    editingCell, 
    handleTaskComplete, 
    viewMode, 
    getPriorityColor, 
    getComplexityColor, 
    getEffortColor, 
    getRiskColor, 
    getAssignee, 
    getProject, 
    formatDate, 
    isOverdue,
    onTaskView,
    onTaskEdit
  ]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Enhanced Task List</h2>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive task management with advanced filtering and sorting
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {onTaskCreate && (
              <button
                onClick={onTaskCreate}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            {/* Search */}
            {enableSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Filter Toggle */}
            {enableFiltering && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-200' : 'border-gray-300'}`}
              >
                <Filter className="w-4 h-4" />
              </button>
            )}

            {/* View Mode */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('compact')}
                className={`p-2 ${viewMode === 'compact' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                title="Compact view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                title="List view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`p-2 ${viewMode === 'detailed' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                title="Detailed view"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Column Configuration */}
            {enableColumnCustomization && (
              <button
                onClick={() => setShowColumnConfig(!showColumnConfig)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Configure columns"
              >
                <Columns className="w-4 h-4" />
              </button>
            )}

            {/* Export */}
            {enableExport && (
              <div className="relative">
                <button
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title="Export"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Bulk Actions */}
            {enableBulkActions && selectedTasks.size > 0 && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm text-blue-700">
                  {selectedTasks.size} selected
                </span>
                <button
                  onClick={() => handleBulkAction('complete')}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                >
                  Complete
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedTasks(new Set())}
                  className="text-xs bg-gray-600 text-white px-2 py-1 rounded"
                >
                  Clear
                </button>
              </div>
            )}

            <span className="text-sm text-gray-500">
              {filteredAndSortedTasks.length} tasks
            </span>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && enableFiltering && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filter.projectId || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, projectId: e.target.value || undefined }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>

              <select
                value={filter.assigneeId || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, assigneeId: e.target.value || undefined }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Assignees</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>

              <select
                value={filter.priority || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value as TaskPriority || undefined }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              <select
                value={filter.complexity || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, complexity: e.target.value as TaskComplexity || undefined }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Complexity</option>
                <option value="simple">Simple</option>
                <option value="moderate">Moderate</option>
                <option value="complex">Complex</option>
                <option value="very_complex">Very Complex</option>
              </select>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filter.isBlocked === true}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      isBlocked: e.target.checked ? true : undefined 
                    }))}
                    className="w-4 h-4 text-blue-600 rounded mr-2"
                  />
                  <span className="text-sm text-gray-700">Blocked only</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filter.hasComments === true}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      hasComments: e.target.checked ? true : undefined 
                    }))}
                    className="w-4 h-4 text-blue-600 rounded mr-2"
                  />
                  <span className="text-sm text-gray-700">Has comments</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filter.hasDependencies === true}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      hasDependencies: e.target.checked ? true : undefined 
                    }))}
                    className="w-4 h-4 text-blue-600 rounded mr-2"
                  />
                  <span className="text-sm text-gray-700">Has dependencies</span>
                </label>
              </div>

              <button
                onClick={() => setFilter({})}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto" ref={tableRef}>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {enableBulkActions && (
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTasks.size === paginatedTasks.length && paginatedTasks.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </th>
              )}
              {visibleColumns.map(column => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable && enableSorting ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key as keyof Task)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && enableSorting && sort.field === column.key && (
                      sort.direction === 'asc' ? 
                        <SortAsc className="w-4 h-4" /> : 
                        <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTasks.map((task) => {
              const isSelected = selectedTasks.has(task.id);
              const isCompleted = typeof task.status === 'string' ? 
                task.status === 'completed' : 
                task.status.isCompleted;

              return (
                <tr 
                  key={task.id} 
                  className={`hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50' : ''
                  } ${
                    isCompleted ? 'opacity-75' : ''
                  } ${
                    isOverdue(task) ? 'bg-red-50' : ''
                  }`}
                >
                  {enableBulkActions && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleTaskToggle(task.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>
                  )}
                  {visibleColumns.map(column => (
                    <td 
                      key={column.key} 
                      className="px-4 py-3 text-sm"
                      style={{ width: column.width }}
                    >
                      {renderCell(task, column)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredAndSortedTasks.length === 0 && (
          <div className="text-center py-12">
            <Flag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery || Object.keys(filter).length > 0 
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAndSortedTasks.length)} of {filteredAndSortedTasks.length} tasks
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (page > totalPages) return null;
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Column Configuration Sidebar */}
      {showColumnConfig && enableColumnCustomization && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl border-l border-gray-200 z-40">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Configure Columns</h3>
            <button
              onClick={() => setShowColumnConfig(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-2">
            {columns.map(column => (
              <label key={column.key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={column.visible}
                  onChange={() => !column.required && handleColumnToggle(column.key)}
                  disabled={column.required}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className={`text-sm ${column.required ? 'text-gray-400' : 'text-gray-900'}`}>
                  {column.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};