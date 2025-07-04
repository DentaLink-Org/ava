import React, { useState, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Plus, 
  Filter, 
  Search, 
  Settings, 
  MoreVertical,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowUpDown,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import { useEnhancedTaskData } from '../../tasks/hooks/useEnhancedTaskData';
import { useTaskAnalytics } from '../../tasks/hooks/useTaskAnalytics';
import type { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  TaskFilter, 
  CreateTaskData,
  UpdateTaskData 
} from '../../tasks/types';

interface EnhancedTaskBoardProps {
  projectId?: string;
  milestoneId?: string;
  initialView?: 'board' | 'compact' | 'detailed';
  enableFilters?: boolean;
  enableBulkOperations?: boolean;
  enableRealtime?: boolean;
  showAnalytics?: boolean;
  swimlaneBy?: 'assignee' | 'priority' | 'milestone' | 'none';
}

// Default task statuses for the board
const DEFAULT_STATUSES: TaskStatus[] = [
  { id: 'todo', name: 'To Do', color: '#64748b', position: 0, isDefault: false, isCompleted: false },
  { id: 'in_progress', name: 'In Progress', color: '#3b82f6', position: 1, isDefault: false, isCompleted: false },
  { id: 'review', name: 'Review', color: '#f59e0b', position: 2, isDefault: false, isCompleted: false },
  { id: 'blocked', name: 'Blocked', color: '#ef4444', position: 3, isDefault: false, isCompleted: false },
  { id: 'completed', name: 'Completed', color: '#10b981', position: 4, isDefault: false, isCompleted: true }
];

export const EnhancedTaskBoard: React.FC<EnhancedTaskBoardProps> = ({
  projectId = 'project-1',
  milestoneId,
  initialView = 'board',
  enableFilters = true,
  enableBulkOperations = true,
  enableRealtime = true,
  showAnalytics = true,
  swimlaneBy = 'none'
}) => {
  // State management
  const [view, setView] = useState(initialView);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Data hooks
  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    bulkUpdateTasks,
    filter,
    setFilter,
    clearFilter,
    refetch,
    isConnected,
    lastUpdated
  } = useEnhancedTaskData({
    projectId,
    milestoneId,
    enableRealtime,
    enableBulkOperations,
    enableOptimisticUpdates: true
  });

  const {
    analytics,
    loading: analyticsLoading
  } = useTaskAnalytics({
    projectId,
    milestoneId,
    enableRealtime
  });

  // Filter and organize tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return result;
  }, [tasks, searchTerm]);

  // Group tasks by status for board view
  const tasksByStatus = useMemo(() => {
    const grouped = DEFAULT_STATUSES.reduce((acc, status) => {
      acc[status.id] = filteredTasks.filter(task => 
        typeof task.status === 'string' ? task.status === status.id : task.status.id === status.id
      );
      return acc;
    }, {} as Record<string, Task[]>);
    
    return grouped;
  }, [filteredTasks]);

  // Group tasks by swimlane if enabled
  const tasksBySwimlane = useMemo(() => {
    if (swimlaneBy === 'none') return { 'default': tasksByStatus };

    const swimlanes: Record<string, Record<string, Task[]>> = {};
    
    filteredTasks.forEach(task => {
      let swimlaneKey = 'Unassigned';
      
      switch (swimlaneBy) {
        case 'assignee':
          swimlaneKey = task.assigneeId || 'Unassigned';
          break;
        case 'priority':
          swimlaneKey = task.priority || 'medium';
          break;
        case 'milestone':
          swimlaneKey = task.milestoneId || 'No Milestone';
          break;
      }

      if (!swimlanes[swimlaneKey]) {
        swimlanes[swimlaneKey] = DEFAULT_STATUSES.reduce((acc, status) => {
          acc[status.id] = [];
          return acc;
        }, {} as Record<string, Task[]>);
      }

      const statusId = typeof task.status === 'string' ? task.status : task.status.id;
      if (swimlanes[swimlaneKey][statusId]) {
        swimlanes[swimlaneKey][statusId].push(task);
      }
    });

    return swimlanes;
  }, [filteredTasks, swimlaneBy]);

  // Handle drag and drop
  const handleDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;
    
    // If task moved to different status
    if (source.droppableId !== destination.droppableId) {
      try {
        await moveTask(draggableId, destination.droppableId, destination.index);
      } catch (error) {
        console.error('Failed to move task:', error);
      }
    }
  }, [moveTask]);

  // Handle task selection
  const handleTaskSelect = useCallback((taskId: string, selected: boolean) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  }, []);

  // Handle bulk operations
  const handleBulkStatusUpdate = useCallback(async (newStatus: string) => {
    if (selectedTasks.size === 0) return;

    try {
      await bulkUpdateTasks({
        taskIds: Array.from(selectedTasks),
        updates: { status: { id: newStatus } as TaskStatus }
      });
      setSelectedTasks(new Set());
    } catch (error) {
      console.error('Failed to bulk update tasks:', error);
    }
  }, [selectedTasks, bulkUpdateTasks]);

  // Get priority badge color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get complexity badge color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'very_complex': return 'bg-purple-100 text-purple-800';
      case 'complex': return 'bg-indigo-100 text-indigo-800';
      case 'moderate': return 'bg-blue-100 text-blue-800';
      case 'simple': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Render task card
  const renderTaskCard = (task: Task, index: number) => (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 
            hover:shadow-md transition-shadow duration-200 cursor-pointer
            ${snapshot.isDragging ? 'shadow-lg rotate-3' : ''}
            ${selectedTasks.has(task.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
          `}
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) {
              handleTaskSelect(task.id, !selectedTasks.has(task.id));
            }
          }}
        >
          {/* Task Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              {enableBulkOperations && (
                <input
                  type="checkbox"
                  checked={selectedTasks.has(task.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleTaskSelect(task.id, e.target.checked);
                  }}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTask(task);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Task Metadata */}
          <div className="space-y-2">
            {/* Priority and Complexity */}
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${getComplexityColor(task.complexity)}`}>
                {task.complexity}
              </span>
            </div>

            {/* Progress Bar */}
            {task.progress > 0 && (
              <div className="w-full">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-gray-900">{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Task Info */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                {task.assigneeId && (
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    <span>Assigned</span>
                  </div>
                )}
                
                {task.dueDate && (
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                {task.estimatedHours && (
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{task.estimatedHours}h</span>
                  </div>
                )}
              </div>
              
              {task.blockedReason && (
                <AlertTriangle className="w-3 h-3 text-red-500" />
              )}
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{task.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );

  // Render status column
  const renderStatusColumn = (status: TaskStatus, tasks: Task[], swimlaneKey?: string) => (
    <div key={`${status.id}-${swimlaneKey}`} className="flex-shrink-0 w-80">
      <div className="bg-gray-50 rounded-lg p-4 h-full">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            <h3 className="font-medium text-gray-900">{status.name}</h3>
            <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
              {tasks.length}
            </span>
          </div>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Tasks List */}
        <Droppable droppableId={status.id} type="task">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                min-h-[200px] space-y-3 p-2 rounded-lg transition-colors duration-200
                ${snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : ''}
              `}
            >
              {tasks.map((task, index) => renderTaskCard(task, index))}
              {provided.placeholder}
              
              {tasks.length === 0 && !snapshot.isDraggingOver && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-sm">No tasks</div>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-red-600 text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Tasks</h3>
          <p className="text-sm mb-4">{error.message}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      {showAnalytics && analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.completedTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.inProgressTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Blocked</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.blockedTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.overdueTasks}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Board Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Enhanced Task Board</h2>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            {enableFilters && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Filter Toggle */}
            {enableFilters && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-200' : 'border-gray-300'}`}
              >
                <Filter className="w-4 h-4" />
              </button>
            )}

            {/* View Options */}
            <button
              onClick={() => setView(view === 'board' ? 'compact' : 'board')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>

            {/* Bulk Actions */}
            {enableBulkOperations && selectedTasks.size > 0 && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm text-blue-700">
                  {selectedTasks.size} selected
                </span>
                <button
                  onClick={() => handleBulkStatusUpdate('completed')}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                >
                  Complete
                </button>
                <button
                  onClick={() => setSelectedTasks(new Set())}
                  className="text-xs bg-gray-600 text-white px-2 py-1 rounded"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={refetch}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Task Board */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="p-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex space-x-6 min-w-max">
              {DEFAULT_STATUSES.map(status => 
                renderStatusColumn(status, tasksByStatus[status.id] || [])
              )}
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};