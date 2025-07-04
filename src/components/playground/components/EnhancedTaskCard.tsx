import React, { useState, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Users, 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  Circle, 
  MessageSquare,
  Paperclip,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  ArrowRight,
  Timer,
  TrendingUp,
  Target,
  Brain,
  Activity,
  Link2,
  Hash
} from 'lucide-react';
import type { 
  Task, 
  TaskPriority, 
  TaskComplexity, 
  TaskEffort, 
  TaskRisk,
  TeamMember,
  Project 
} from '../../tasks/types';

interface EnhancedTaskCardProps {
  task: Task;
  project?: Project;
  assignee?: TeamMember;
  view?: 'compact' | 'standard' | 'detailed';
  showMetadata?: boolean;
  showProgress?: boolean;
  showDependencies?: boolean;
  showTimeTracking?: boolean;
  showCollaboration?: boolean;
  enableQuickActions?: boolean;
  enableSelection?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: string) => void;
  onPriorityChange?: (taskId: string, priority: TaskPriority) => void;
  onAssigneeChange?: (taskId: string, assigneeId: string) => void;
  onSelect?: (taskId: string, selected: boolean) => void;
  onViewDetails?: (taskId: string) => void;
  onStartTimer?: (taskId: string) => void;
  onStopTimer?: (taskId: string) => void;
}

export const EnhancedTaskCard: React.FC<EnhancedTaskCardProps> = ({
  task,
  project,
  assignee,
  view = 'standard',
  showMetadata = true,
  showProgress = true,
  showDependencies = true,
  showTimeTracking = true,
  showCollaboration = true,
  enableQuickActions = true,
  enableSelection = false,
  isSelected = false,
  isDragging = false,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onSelect,
  onViewDetails,
  onStartTimer,
  onStopTimer
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Get priority styling
  const getPriorityColor = useCallback((priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', accent: '#dc2626' };
      case 'high': return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', accent: '#ea580c' };
      case 'medium': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', accent: '#2563eb' };
      case 'low': return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', accent: '#64748b' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', accent: '#64748b' };
    }
  }, []);

  // Get complexity styling
  const getComplexityColor = useCallback((complexity: TaskComplexity) => {
    switch (complexity) {
      case 'very_complex': return 'bg-purple-100 text-purple-800';
      case 'complex': return 'bg-indigo-100 text-indigo-800';
      case 'moderate': return 'bg-blue-100 text-blue-800';
      case 'simple': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Get effort styling
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

  // Get risk styling
  const getRiskColor = useCallback((risk: TaskRisk) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Handle status toggle
  const handleStatusToggle = useCallback(() => {
    const currentStatus = typeof task.status === 'string' ? task.status : task.status.id;
    const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    onStatusChange?.(task.id, newStatus);
  }, [task.id, task.status, onStatusChange]);

  // Handle timer toggle
  const handleTimerToggle = useCallback(() => {
    if (isTimerRunning) {
      onStopTimer?.(task.id);
      setIsTimerRunning(false);
    } else {
      onStartTimer?.(task.id);
      setIsTimerRunning(true);
    }
  }, [task.id, isTimerRunning, onStartTimer, onStopTimer]);

  // Calculate card styling based on status and priority
  const priorityStyle = getPriorityColor(task.priority);
  const isCompleted = typeof task.status === 'string' ? 
    task.status === 'completed' : 
    task.status.isCompleted;
  const isBlocked = task.blockedReason;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  // Card base classes
  const cardClasses = `
    group relative bg-white rounded-lg border transition-all duration-200 cursor-pointer
    ${isDragging ? 'shadow-lg rotate-1 scale-105' : 'shadow-sm hover:shadow-md'}
    ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
    ${isCompleted ? 'opacity-75' : ''}
    ${isBlocked ? 'border-red-300 bg-red-50' : priorityStyle.border}
    ${isOverdue ? 'border-orange-300 bg-orange-50' : ''}
  `;

  // Render compact view
  if (view === 'compact') {
    return (
      <div className={cardClasses} onClick={() => onViewDetails?.(task.id)}>
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              {enableSelection && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onSelect?.(task.id, e.target.checked);
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusToggle();
                }}
                className="flex-shrink-0"
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              <span className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityStyle.bg} ${priorityStyle.text}`}>
                {task.priority}
              </span>
              {assignee && (
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                  {assignee.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render standard or detailed view
  return (
    <div 
      className={cardClasses}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onViewDetails?.(task.id)}
    >
      {/* Priority accent border */}
      <div 
        className="absolute top-0 left-0 w-full h-1 rounded-t-lg"
        style={{ backgroundColor: priorityStyle.accent }}
      />

      {/* Card Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1">
            {enableSelection && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect?.(task.id, e.target.checked);
                }}
                className="w-4 h-4 text-blue-600 rounded mt-0.5"
              />
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusToggle();
              }}
              className="flex-shrink-0 mt-0.5"
            >
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium mb-1 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h4>
              {task.description && view === 'detailed' && (
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`flex items-center space-x-1 transition-opacity duration-200 ${showActions || enableQuickActions ? 'opacity-100' : 'opacity-0'}`}>
            {showTimeTracking && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTimerToggle();
                }}
                className={`p-1 rounded ${isTimerRunning ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-gray-200`}
                title={isTimerRunning ? 'Stop timer' : 'Start timer'}
              >
                <Timer className="w-4 h-4" />
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                title="Edit task"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metadata Badges */}
        {showMetadata && (
          <div className="flex flex-wrap gap-1 mb-3">
            <span className={`text-xs px-2 py-1 rounded-full border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
              <Flag className="w-3 h-3 inline mr-1" />
              {task.priority}
            </span>
            
            <span className={`text-xs px-2 py-1 rounded ${getComplexityColor(task.complexity)}`}>
              <Brain className="w-3 h-3 inline mr-1" />
              {task.complexity}
            </span>
            
            <span className={`text-xs px-2 py-1 rounded ${getEffortColor(task.effortLevel)}`}>
              <Activity className="w-3 h-3 inline mr-1" />
              {task.effortLevel}
            </span>
            
            {task.riskLevel !== 'low' && (
              <span className={`text-xs px-2 py-1 rounded ${getRiskColor(task.riskLevel)}`}>
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {task.riskLevel}
              </span>
            )}
            
            {task.storyPoints && (
              <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                <Target className="w-3 h-3 inline mr-1" />
                {task.storyPoints} pts
              </span>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {showProgress && task.progress > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900 font-medium">{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Task Information */}
        <div className="space-y-2">
          {/* Time and Assignment Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {assignee && (
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-1">
                    {assignee.name.charAt(0)}
                  </div>
                  <span>{assignee.name}</span>
                </div>
              )}
              
              {task.dueDate && (
                <div className={`flex items-center ${isOverdue ? 'text-red-600' : ''}`}>
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {task.estimatedHours && (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{task.estimatedHours}h est</span>
                </div>
              )}
            </div>
            
            {/* Warning indicators */}
            <div className="flex items-center space-x-1">
              {isBlocked && (
                <AlertTriangle className="w-4 h-4 text-red-500" title={task.blockedReason} />
              )}
              {isOverdue && (
                <Clock className="w-4 h-4 text-orange-500" title="Overdue" />
              )}
            </div>
          </div>

          {/* Dependencies */}
          {showDependencies && task.dependencies && task.dependencies.length > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <Link2 className="w-3 h-3 mr-1" />
              <span>{task.dependencies.length} dependencies</span>
            </div>
          )}

          {/* Collaboration Info */}
          {showCollaboration && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                {task.comments && task.comments.length > 0 && (
                  <div className="flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    <span>{task.comments.length}</span>
                  </div>
                )}
                
                {task.attachments && task.attachments.length > 0 && (
                  <div className="flex items-center">
                    <Paperclip className="w-3 h-3 mr-1" />
                    <span>{task.attachments.length}</span>
                  </div>
                )}
                
                {task.timeEntries && task.timeEntries.length > 0 && (
                  <div className="flex items-center">
                    <Timer className="w-3 h-3 mr-1" />
                    <span>{task.actualHours || 0}h tracked</span>
                  </div>
                )}
              </div>
              
              {project && (
                <div className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate max-w-16">{project.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {task.tags.slice(0, view === 'detailed' ? 5 : 3).map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded flex items-center"
                >
                  <Hash className="w-2 h-2 mr-0.5" />
                  {tag}
                </span>
              ))}
              {task.tags.length > (view === 'detailed' ? 5 : 3) && (
                <span className="text-xs text-gray-500">
                  +{task.tags.length - (view === 'detailed' ? 5 : 3)} more
                </span>
              )}
            </div>
          )}

          {/* Blocked Reason */}
          {isBlocked && view === 'detailed' && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
              <div className="flex items-center text-red-700 font-medium mb-1">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Blocked
              </div>
              <p className="text-red-600">{task.blockedReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer for detailed view */}
      {view === 'detailed' && (
        <div className="px-4 py-2 bg-gray-50 border-t rounded-b-lg">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
              {task.updatedAt !== task.createdAt && (
                <span>• Updated {new Date(task.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(task.id);
              }}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              View details
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};