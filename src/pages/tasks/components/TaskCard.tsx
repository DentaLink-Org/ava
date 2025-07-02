import React from 'react';
import { MoreVertical, Calendar, User } from 'lucide-react';
import type { Task, Project, TeamMember, TaskPriority } from '../types';
import type { PageTheme } from '../../_shared/runtime/types';

interface TaskCardProps {
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
  theme: PageTheme;
}

export function TaskCard({
  task,
  project,
  assignee,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  showPriority = true,
  showAssignee = true,
  showDueDate = true,
  isDragging = false,
  theme
}: TaskCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, className: 'overdue' };
    if (diffDays <= 2) return { text: `${diffDays}d left`, className: 'due-soon' };
    return { text: date.toLocaleDateString(), className: '' };
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'low': return '#6b7280';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'urgent': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const dueDateInfo = task.dueDate ? formatDate(task.dueDate) : null;

  return (
    <div
      className={`task-card priority-${task.priority} ${isDragging ? 'dragging' : ''}`}
      style={{
        borderLeftColor: getPriorityColor(task.priority),
        backgroundColor: theme.colors.surface,
        color: theme.colors.text
      }}
      onClick={() => onEdit(task)}
    >
      <div className="task-card-header">
        <h4 className="task-title" style={{ color: theme.colors.text }}>
          {task.title}
        </h4>
        <div className="task-actions-menu">
          <button
            className="btn ghost sm"
            onClick={(e) => {
              e.stopPropagation();
              // Show context menu
            }}
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description" style={{ color: theme.colors.textSecondary }}>
          {task.description}
        </p>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map((tag, index) => (
            <span key={index} className="task-tag" style={{ 
              backgroundColor: `${theme.colors.primary}20`,
              color: theme.colors.primary 
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="task-card-footer">
        <div className="task-meta">
          {showAssignee && assignee && (
            <div className="task-assignee">
              <div 
                className="assignee-avatar"
                style={{ backgroundColor: theme.colors.primary }}
                title={assignee.name}
              >
                {assignee.avatar ? (
                  <img src={assignee.avatar} alt={assignee.name} />
                ) : (
                  getInitials(assignee.name)
                )}
              </div>
            </div>
          )}
          
          {showDueDate && task.dueDate && (
            <div className={`task-due-date ${dueDateInfo?.className || ''}`}>
              <Calendar size={12} />
              {dueDateInfo?.text}
            </div>
          )}
        </div>

        {showPriority && (
          <span 
            className={`task-priority-badge ${task.priority}`}
            style={{
              backgroundColor: task.priority === 'urgent' ? getPriorityColor(task.priority) : `${getPriorityColor(task.priority)}20`,
              color: task.priority === 'urgent' ? 'white' : getPriorityColor(task.priority)
            }}
          >
            {task.priority}
          </span>
        )}
      </div>
    </div>
  );
}