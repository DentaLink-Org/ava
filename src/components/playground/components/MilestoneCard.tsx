import React from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  TrendingUp, 
  Edit2, 
  Trash2, 
  Archive,
  MoreHorizontal
} from 'lucide-react';
import type { Milestone, TeamMember, MilestoneStatus } from '../../milestones/types';

interface MilestoneCardProps {
  milestone: Milestone;
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

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  assignees = [],
  onEdit,
  onDelete,
  onStatusChange,
  onProgressUpdate,
  showProgress = true,
  showTasks = true,
  showAssignees = true,
  showDueDate = true,
  isDragging = false,
  enableQuickActions = true
}) => {
  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const isOverdue = milestone.dueDate && 
    new Date(milestone.dueDate) < new Date() && 
    milestone.status !== 'completed' && 
    milestone.status !== 'cancelled';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Cycle through statuses
    const statuses: MilestoneStatus[] = ['pending', 'in_progress', 'completed'];
    const currentIndex = statuses.indexOf(milestone.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    onStatusChange(milestone.id, nextStatus);
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Simple progress increment for quick actions
    const newProgress = Math.min(milestone.progress + 25, 100);
    onProgressUpdate(milestone.id, newProgress);
  };

  return (
    <div 
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200
        ${isDragging ? 'rotate-2 shadow-lg' : ''}
        ${isOverdue ? 'border-red-300 bg-red-50' : ''}
      `}
      style={{
        borderLeftColor: milestone.color,
        borderLeftWidth: '4px'
      }}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {milestone.title}
            </h3>
            {milestone.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {milestone.description}
              </p>
            )}
          </div>
          
          {enableQuickActions && (
            <div className="flex items-center space-x-1 ml-3">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(milestone); }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                title="Edit milestone"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(milestone.id); }}
                className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                title="Delete milestone"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Status and Priority */}
        <div className="flex items-center space-x-3 mb-3">
          <button
            onClick={handleStatusClick}
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border transition-colors ${getStatusColor(milestone.status)}`}
            title="Click to change status"
          >
            {milestone.status.replace('_', ' ')}
          </button>
          <span className={`text-sm font-medium ${getPriorityColor(milestone.priority)}`}>
            {milestone.priority} priority
          </span>
          {isOverdue && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
              <Clock className="h-3 w-3 mr-1" />
              Overdue
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="px-4 pb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{milestone.progress}%</span>
          </div>
          <button
            onClick={handleProgressClick}
            className="w-full bg-gray-200 rounded-full h-2 overflow-hidden hover:bg-gray-300 transition-colors"
            title="Click to increase progress"
          >
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${milestone.progress}%` }}
            />
          </button>
        </div>
      )}

      {/* Metadata */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {showDueDate && milestone.dueDate && (
              <div className={`flex items-center ${isOverdue ? 'text-red-600' : ''}`}>
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(milestone.dueDate)}
              </div>
            )}
            
            {showAssignees && milestone.assignedTo.length > 0 && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {milestone.assignedTo.length} assigned
              </div>
            )}
            
            {showTasks && milestone.tasks && (
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-1" />
                {milestone.tasks.length} tasks
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="font-medium">{milestone.progress}%</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {milestone.metadata.tags && milestone.metadata.tags.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-1">
            {milestone.metadata.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
              >
                {tag}
              </span>
            ))}
            {milestone.metadata.tags.length > 3 && (
              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                +{milestone.metadata.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dependencies Indicator */}
      {milestone.dependencies && milestone.dependencies.length > 0 && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
            {milestone.dependencies.length} dependency
            {milestone.dependencies.length !== 1 ? 'ies' : ''}
          </div>
        </div>
      )}
    </div>
  );
};