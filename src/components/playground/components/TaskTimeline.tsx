import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Download,
  Settings,
  Play,
  Pause,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertTriangle,
  CheckCircle,
  Circle,
  Hash
} from 'lucide-react';
import { useEnhancedTaskData } from '../../tasks/hooks/useEnhancedTaskData';
import { useTaskAnalytics } from '../../tasks/hooks/useTaskAnalytics';
import type { 
  Task, 
  TaskFilter, 
  TaskDependency,
  TaskStatus,
  TaskPriority,
  DependencyType
} from '../../tasks/types';

interface TaskTimelineProps {
  projectId?: string;
  milestoneId?: string;
  enableFilters?: boolean;
  enableDependencies?: boolean;
  enableCriticalPath?: boolean;
  enableResourceView?: boolean;
  enableMilestones?: boolean;
  showBaseline?: boolean;
  timeScale?: 'days' | 'weeks' | 'months';
  height?: number;
}

interface TimelineTask extends Task {
  startDate: Date;
  endDate: Date;
  position: number;
  dependencies: TaskDependency[];
  criticalPath: boolean;
  slack: number;
}

interface TimelineColumn {
  date: Date;
  label: string;
  isToday: boolean;
  isWeekend: boolean;
  isMilestone: boolean;
}

type ViewMode = 'timeline' | 'gantt' | 'resource' | 'dependencies';
type ZoomLevel = 'day' | 'week' | 'month' | 'quarter';

export const TaskTimeline: React.FC<TaskTimelineProps> = ({
  projectId,
  milestoneId,
  enableFilters = true,
  enableDependencies = true,
  enableCriticalPath = true,
  enableResourceView = true,
  enableMilestones = true,
  showBaseline = false,
  timeScale = 'weeks',
  height = 600
}) => {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('gantt');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [columnWidth, setColumnWidth] = useState(120);
  const [taskHeight, setTaskHeight] = useState(32);
  const [showCriticalPath, setShowCriticalPath] = useState(enableCriticalPath);
  const [showDependencies, setShowDependencies] = useState(enableDependencies);
  
  // Refs for timeline management
  const timelineRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  
  // Date range management
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    const end = new Date(today);
    end.setDate(end.getDate() + 90);
    return { start, end };
  });

  // Data hooks
  const {
    tasks,
    loading,
    error,
    updateTask,
    filter,
    setFilter
  } = useEnhancedTaskData({
    projectId,
    milestoneId,
    enableRealtime: true,
    enableCaching: true
  });

  const {
    analytics
  } = useTaskAnalytics({
    projectId,
    milestoneId,
    dateRange: {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString()
    }
  });

  // Transform tasks for timeline display
  const timelineTasks = useMemo((): TimelineTask[] => {
    return tasks.map((task, index) => {
      // Calculate start and end dates
      const startDate = task.dueDate ? new Date(task.dueDate) : new Date();
      const endDate = new Date(startDate);
      if (task.estimatedHours) {
        endDate.setDate(endDate.getDate() + Math.ceil(task.estimatedHours / 8));
      } else {
        endDate.setDate(endDate.getDate() + 1);
      }

      return {
        ...task,
        startDate,
        endDate,
        position: index,
        dependencies: task.dependencies || [],
        criticalPath: false, // Will be calculated
        slack: 0 // Will be calculated
      };
    });
  }, [tasks]);

  // Generate timeline columns
  const timelineColumns = useMemo((): TimelineColumn[] => {
    const columns: TimelineColumn[] = [];
    const current = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const today = new Date();

    while (current <= end) {
      const isToday = current.toDateString() === today.toDateString();
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;
      
      let label = '';
      switch (zoomLevel) {
        case 'day':
          label = current.getDate().toString();
          break;
        case 'week':
          label = `W${getWeekNumber(current)}`;
          break;
        case 'month':
          label = current.toLocaleDateString('en', { month: 'short' });
          break;
        case 'quarter':
          label = `Q${Math.ceil((current.getMonth() + 1) / 3)}`;
          break;
      }

      columns.push({
        date: new Date(current),
        label,
        isToday,
        isWeekend,
        isMilestone: false // Will be enhanced with milestone data
      });

      // Advance date based on zoom level
      switch (zoomLevel) {
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'quarter':
          current.setMonth(current.getMonth() + 3);
          break;
      }
    }

    return columns;
  }, [dateRange, zoomLevel]);

  // Calculate task positioning
  const getTaskPosition = useCallback((task: TimelineTask) => {
    const startIndex = timelineColumns.findIndex(
      col => col.date >= task.startDate
    );
    const endIndex = timelineColumns.findIndex(
      col => col.date >= task.endDate
    );
    
    return {
      left: Math.max(0, startIndex) * columnWidth,
      width: Math.max(columnWidth, (endIndex - startIndex) * columnWidth),
      top: task.position * (taskHeight + 4) + 4
    };
  }, [timelineColumns, columnWidth, taskHeight]);

  // Task status colors
  const getTaskColor = useCallback((task: Task) => {
    const statusColors = {
      'todo': '#64748b',
      'in_progress': '#3b82f6',
      'review': '#f59e0b',
      'blocked': '#ef4444',
      'completed': '#10b981'
    };
    
    if (typeof task.status === 'string') {
      return statusColors[task.status as keyof typeof statusColors] || '#64748b';
    }
    
    return '#64748b';
  }, []);

  // Priority indicator
  const getPriorityIndicator = useCallback((priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case 'high':
        return <Circle className="w-3 h-3 text-orange-500 fill-current" />;
      case 'medium':
        return <Circle className="w-3 h-3 text-yellow-500 fill-current" />;
      case 'low':
        return <Circle className="w-3 h-3 text-green-500 fill-current" />;
      default:
        return <Circle className="w-3 h-3 text-gray-400" />;
    }
  }, []);

  // Status indicator
  const getStatusIndicator = useCallback((status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'in_progress':
        return <Play className="w-3 h-3 text-blue-500" />;
      case 'blocked':
        return <Pause className="w-3 h-3 text-red-500" />;
      default:
        return <Circle className="w-3 h-3 text-gray-400" />;
    }
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setColumnWidth(prev => Math.min(prev * 1.5, 300));
  }, []);

  const handleZoomOut = useCallback(() => {
    setColumnWidth(prev => Math.max(prev / 1.5, 60));
  }, []);

  // Task drag handling
  const handleTaskDragStart = useCallback((taskId: string) => {
    setDraggedTask(taskId);
  }, []);

  const handleTaskDragEnd = useCallback(async (taskId: string, newStartDate: Date) => {
    setDraggedTask(null);
    
    try {
      await updateTask(taskId, {
        dueDate: newStartDate.toISOString()
      });
    } catch (error) {
      console.error('Failed to update task date:', error);
    }
  }, [updateTask]);

  // Scroll synchronization
  const handleTimelineScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    setScrollPosition(scrollLeft);
    
    if (headerRef.current) {
      headerRef.current.scrollLeft = scrollLeft;
    }
  }, []);

  // Filter handling
  const handleFilterChange = useCallback((newFilter: Partial<TaskFilter>) => {
    setFilter(newFilter);
  }, [setFilter]);

  // Helper function to get week number
  function getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Export functionality
  const handleExport = useCallback(async (format: 'png' | 'pdf' | 'csv') => {
    // Implementation would depend on chosen export library
    console.log(`Exporting timeline as ${format}`);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">Failed to load timeline data</p>
          <p className="text-red-600 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm" style={{ height }}>
      {/* Timeline Header */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Task Timeline</h3>
            <span className="text-sm text-gray-500">
              ({timelineTasks.length} tasks)
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Selector */}
            <div className="flex bg-white border rounded-md">
              {(['timeline', 'gantt', 'resource', 'dependencies'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-sm font-medium capitalize ${
                    viewMode === mode
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-white border rounded-md">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-gray-50"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-gray-50"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Time Scale Selector */}
            <select
              value={zoomLevel}
              onChange={(e) => setZoomLevel(e.target.value as ZoomLevel)}
              className="px-3 py-1.5 border rounded-md text-sm"
            >
              <option value="day">Days</option>
              <option value="week">Weeks</option>
              <option value="month">Months</option>
              <option value="quarter">Quarters</option>
            </select>

            {/* Filter Toggle */}
            {enableFilters && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-md ${
                  showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
                title="Toggle Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
            )}

            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => handleExport('png')}
                className="p-2 hover:bg-gray-100 rounded-md"
                title="Export Timeline"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Settings */}
            <button
              className="p-2 hover:bg-gray-100 rounded-md"
              title="Timeline Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline Options */}
        <div className="flex items-center space-x-4 mt-3">
          {enableCriticalPath && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showCriticalPath}
                onChange={(e) => setShowCriticalPath(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 mr-2"
              />
              <span className="text-sm text-gray-700">Critical Path</span>
            </label>
          )}
          
          {enableDependencies && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showDependencies}
                onChange={(e) => setShowDependencies(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 mr-2"
              />
              <span className="text-sm text-gray-700">Dependencies</span>
            </label>
          )}

          {showBaseline && (
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 mr-2"
              />
              <span className="text-sm text-gray-700">Show Baseline</span>
            </label>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-b bg-gray-50 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={typeof filter.status === 'string' ? filter.status : (filter.status?.id || '')}
                onChange={(e) => handleFilterChange({ status: e.target.value as any })}
                className="w-full px-3 py-1.5 border rounded-md text-sm"
              >
                <option value="">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filter.priority || ''}
                onChange={(e) => handleFilterChange({ priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-1.5 border rounded-md text-sm"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <select
                value={filter.assigneeId || ''}
                onChange={(e) => handleFilterChange({ assigneeId: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-md text-sm"
              >
                <option value="">All Assignees</option>
                {/* Add assignee options from team members */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search tasks..."
                value={filter.search || ''}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Timeline Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task List Sidebar */}
        <div className="w-80 border-r bg-gray-50 overflow-y-auto" ref={taskListRef}>
          <div className="sticky top-0 bg-gray-100 border-b p-3">
            <h4 className="font-medium text-gray-900">Tasks</h4>
          </div>
          
          <div className="p-2">
            {timelineTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center p-2 rounded-md hover:bg-white border mb-1 cursor-pointer"
                style={{ height: taskHeight }}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getStatusIndicator(typeof task.status === 'string' ? task.status : 'todo')}
                  {getPriorityIndicator(task.priority)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </p>
                    {task.assigneeId && (
                      <div className="flex items-center mt-1">
                        <Users className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">
                          {task.assigneeId}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {task.estimatedHours && `${task.estimatedHours}h`}
                    </div>
                    {task.progress > 0 && (
                      <div className="text-xs text-blue-600">
                        {task.progress}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Timeline Header */}
          <div
            ref={headerRef}
            className="border-b bg-white overflow-x-auto"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div
              className="flex"
              style={{ width: timelineColumns.length * columnWidth }}
            >
              {timelineColumns.map((column, index) => (
                <div
                  key={index}
                  className={`border-r last:border-r-0 px-2 py-3 ${
                    column.isToday ? 'bg-blue-50 border-blue-200' : ''
                  } ${column.isWeekend ? 'bg-gray-50' : ''}`}
                  style={{ width: columnWidth, minWidth: columnWidth }}
                >
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-900">
                      {column.label}
                    </div>
                    {zoomLevel === 'day' && (
                      <div className="text-xs text-gray-500">
                        {column.date.toLocaleDateString('en', { weekday: 'short' })}
                      </div>
                    )}
                  </div>
                  
                  {column.isToday && (
                    <div className="absolute top-0 bottom-0 w-0.5 bg-blue-500 left-1/2 transform -translate-x-1/2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Body */}
          <div
            ref={timelineRef}
            className="flex-1 overflow-auto relative"
            onScroll={handleTimelineScroll}
          >
            <div
              className="relative"
              style={{
                width: timelineColumns.length * columnWidth,
                height: timelineTasks.length * (taskHeight + 4) + 20
              }}
            >
              {/* Timeline Grid Lines */}
              {timelineColumns.map((column, index) => (
                <div
                  key={index}
                  className={`absolute top-0 bottom-0 border-r ${
                    column.isToday ? 'border-blue-300' : 'border-gray-200'
                  }`}
                  style={{
                    left: index * columnWidth,
                    width: columnWidth
                  }}
                />
              ))}

              {/* Task Bars */}
              {timelineTasks.map((task) => {
                const position = getTaskPosition(task);
                const color = getTaskColor(task);
                
                return (
                  <div
                    key={task.id}
                    className={`absolute rounded cursor-pointer group shadow-sm ${
                      selectedTasks.includes(task.id) ? 'ring-2 ring-blue-500' : ''
                    } ${
                      showCriticalPath && task.criticalPath ? 'ring-2 ring-red-500' : ''
                    }`}
                    style={{
                      left: position.left,
                      top: position.top,
                      width: position.width,
                      height: taskHeight - 2,
                      backgroundColor: color + '20',
                      borderLeft: `4px solid ${color}`
                    }}
                    onClick={() => {
                      if (selectedTasks.includes(task.id)) {
                        setSelectedTasks(prev => prev.filter(id => id !== task.id));
                      } else {
                        setSelectedTasks(prev => [...prev, task.id]);
                      }
                    }}
                    draggable
                    onDragStart={() => handleTaskDragStart(task.id)}
                  >
                    <div className="flex items-center h-full px-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">
                          {task.title}
                        </div>
                      </div>
                      
                      {task.progress > 0 && (
                        <div className="ml-2">
                          <div
                            className="h-1 bg-gray-200 rounded-full overflow-hidden"
                            style={{ width: 30 }}
                          >
                            <div
                              className="h-full bg-current rounded-full"
                              style={{
                                width: `${task.progress}%`,
                                backgroundColor: color
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Task Tooltip */}
                    <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 z-10">
                      <div className="bg-gray-900 text-white text-xs rounded-md p-2 whitespace-nowrap">
                        <div className="font-medium">{task.title}</div>
                        <div>Priority: {task.priority}</div>
                        <div>Progress: {task.progress}%</div>
                        {task.estimatedHours && (
                          <div>Duration: {task.estimatedHours}h</div>
                        )}
                        {task.assigneeId && (
                          <div>Assigned: {task.assigneeId}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Dependency Lines */}
              {showDependencies && timelineTasks.map((task) => 
                task.dependencies.map((dep) => {
                  const fromTask = timelineTasks.find(t => t.id === dep.dependsOnId);
                  if (!fromTask) return null;

                  const fromPos = getTaskPosition(fromTask);
                  const toPos = getTaskPosition(task);

                  return (
                    <svg
                      key={`${dep.taskId}-${dep.dependsOnId}`}
                      className="absolute pointer-events-none"
                      style={{
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill="#64748b"
                          />
                        </marker>
                      </defs>
                      <line
                        x1={fromPos.left + fromPos.width}
                        y1={fromPos.top + taskHeight / 2}
                        x2={toPos.left}
                        y2={toPos.top + taskHeight / 2}
                        stroke="#64748b"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    </svg>
                  );
                })
              )}

              {/* Today Line */}
              {timelineColumns.some(col => col.isToday) && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10 pointer-events-none"
                  style={{
                    left: timelineColumns.findIndex(col => col.isToday) * columnWidth + columnWidth / 2
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Footer */}
      <div className="border-t bg-gray-50 p-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Total Tasks: {timelineTasks.length}</span>
            {selectedTasks.length > 0 && (
              <span>Selected: {selectedTasks.length}</span>
            )}
            {analytics && (
              <>
                <span>Completed: {analytics.completedTasks}</span>
                <span>In Progress: {analytics.inProgressTasks}</span>
                <span>Overdue: {analytics.overdueTasks}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>
              {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTimeline;