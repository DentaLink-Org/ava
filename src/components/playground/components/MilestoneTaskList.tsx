import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Calendar,
  User,
  Tag,
  Clock,
  AlertTriangle,
  Link,
  Unlink,
  Edit2,
  Trash2
} from 'lucide-react';
import type { 
  Milestone, 
  TaskWithMilestone
} from '../../milestones/types';

// Mock Task interface (simplified version)
interface Task {
  id: string;
  title: string;
  description?: string;
  status: {
    id: string;
    name: string;
    isCompleted: boolean;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  assigneeId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface MilestoneTaskListProps {
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
  teamMembers?: Array<{ id: string; name: string; avatarUrl?: string }>;
}

type SortField = 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export const MilestoneTaskList: React.FC<MilestoneTaskListProps> = ({
  milestone,
  tasks,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onTaskUnlink,
  showAddTask = true,
  showUnlinkAction = false,
  enableSorting = true,
  enableFiltering = true,
  teamMembers = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'completed' && !task.status.isCompleted) return false;
        if (statusFilter === 'active' && task.status.isCompleted) return false;
        if (statusFilter !== 'completed' && statusFilter !== 'active' && task.status.id !== statusFilter) return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Assignee filter
      if (assigneeFilter !== 'all' && task.assigneeId !== assigneeFilter) return false;

      return true;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status.isCompleted ? 1 : 0;
          bValue = b.status.isCompleted ? 1 : 0;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask = {
      title: newTaskTitle.trim(),
      status: {
        id: 'todo',
        name: 'To Do',
        isCompleted: false
      },
      priority: 'medium' as const,
      assigneeId: undefined,
      tags: [],
      description: ''
    };

    onTaskCreate(newTask);
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  const toggleTaskStatus = (task: TaskWithMilestone) => {
    const newStatus = task.status.isCompleted 
      ? { id: 'todo', name: 'To Do', isCompleted: false }
      : { id: 'done', name: 'Done', isCompleted: true };
    
    onTaskUpdate(task.id, { status: newStatus });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isTaskOverdue = (task: TaskWithMilestone) => {
    return task.dueDate && 
      new Date(task.dueDate) < new Date() && 
      !task.status.isCompleted;
  };

  const getTaskAssignee = (assigneeId?: string) => {
    return teamMembers.find(member => member.id === assigneeId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const completedTasks = tasks.filter(task => task.status.isCompleted).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
            <span className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded">
              {completedTasks}/{totalTasks}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              {completionPercentage}% complete
            </div>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        {enableFiltering && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search tasks..."
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {teamMembers.length > 0 && (
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Assignees</option>
                  <option value="">Unassigned</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sort Header */}
      {enableSorting && filteredAndSortedTasks.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4 text-sm">
            <button
              onClick={() => handleSort('title')}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
            >
              <span>Title</span>
              {sortField === 'title' && (
                sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={() => handleSort('status')}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
            >
              <span>Status</span>
              {sortField === 'status' && (
                sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={() => handleSort('priority')}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
            >
              <span>Priority</span>
              {sortField === 'priority' && (
                sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={() => handleSort('dueDate')}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
            >
              <span>Due Date</span>
              {sortField === 'dueDate' && (
                sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="divide-y divide-gray-200">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-sm">
              {tasks.length === 0
                ? "No tasks have been added to this milestone yet."
                : "No tasks match your current filters."
              }
            </p>
            {showAddTask && tasks.length === 0 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              >
                Add your first task
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedTasks.map((task) => {
            const isOverdue = isTaskOverdue(task);
            const assignee = getTaskAssignee(task.assigneeId);

            return (
              <div 
                key={task.id} 
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  task.status.isCompleted ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Status Toggle */}
                  <button
                    onClick={() => toggleTaskStatus(task)}
                    className="mt-0.5 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {task.status.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium ${
                          task.status.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h4>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 mt-2">
                          {/* Priority */}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>

                          {/* Due Date */}
                          {task.dueDate && (
                            <div className={`flex items-center text-xs ${
                              isOverdue ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(task.dueDate)}
                              {isOverdue && <AlertTriangle className="h-3 w-3 ml-1" />}
                            </div>
                          )}

                          {/* Assignee */}
                          {assignee && (
                            <div className="flex items-center text-xs text-gray-500">
                              <User className="h-3 w-3 mr-1" />
                              {assignee.name}
                            </div>
                          )}

                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Tag className="h-3 w-3 mr-1" />
                              {task.tags.slice(0, 2).join(', ')}
                              {task.tags.length > 2 && ` +${task.tags.length - 2}`}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-3">
                        <button
                          onClick={() => onTaskUpdate(task.id, {})}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                          title="Edit task"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        
                        {showUnlinkAction && (
                          <button
                            onClick={() => onTaskUnlink(task.id)}
                            className="p-1 text-gray-400 hover:text-orange-600 rounded-md hover:bg-gray-100"
                            title="Unlink from milestone"
                          >
                            <Unlink className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => onTaskDelete(task.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                          title="Delete task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add task to milestone</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Add new task</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTask();
                    } else if (e.key === 'Escape') {
                      setShowAddForm(false);
                      setNewTaskTitle('');
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter task title"
                  autoFocus
                />
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTaskTitle('');
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};