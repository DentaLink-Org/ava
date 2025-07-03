import React, { useState, useMemo } from 'react';
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
  Circle
} from 'lucide-react';
import type { Task, Project, TeamMember, TaskFilter, TaskSort } from '../types';
import type { PageTheme } from '../../_shared/runtime/types';

interface TaskListProps {
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
  theme: PageTheme;
}

export function TaskList({
  tasks,
  projects,
  teamMembers,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  enableSorting = true,
  enableFiltering = true,
  enableSearch = true,
  enableBulkActions = false,
  theme
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TaskFilter>({});
  const [sort, setSort] = useState<TaskSort>({ field: 'createdAt', direction: 'desc' });
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // Memoized filtered and sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags?.some(tag => tag.toLowerCase().includes(query))
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
      filtered = filtered.filter(task => task.status.id === filter.status);
    }
    if (filter.priority) {
      filtered = filtered.filter(task => task.priority === filter.priority);
    }
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(task => 
        filter.tags!.some(tag => task.tags?.includes(tag))
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

    // Apply sorting
    if (enableSorting) {
      filtered.sort((a, b) => {
        const aValue = a[sort.field];
        const bValue = b[sort.field];
        
        if (aValue === bValue) return 0;
        
        const comparison = (aValue || '') < (bValue || '') ? -1 : 1;
        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [tasks, searchQuery, filter, sort, enableSorting]);

  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const getAssignee = (assigneeId?: string) => {
    if (!assigneeId) return undefined;
    return teamMembers.find(m => m.id === assigneeId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#6b7280';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'urgent': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleSort = (field: keyof Task) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleTaskToggle = (taskId: string, checked: boolean) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  const handleTaskComplete = (task: Task) => {
    const isCompleted = task.status.isCompleted;
    const completedStatus = task.status; // Would need to find actual completed status
    onTaskUpdate(task.id, {
      status: completedStatus,
      completedAt: isCompleted ? undefined : new Date().toISOString()
    });
  };

  return (
    <div className="task-list" style={{ backgroundColor: theme.colors.surface }}>
      {/* List Header */}
      <div className="list-header">
        <div className="list-controls">
          {enableSearch && (
            <div className="search-box">
              <Search size={16} color={theme.colors.textSecondary} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ 
                  paddingLeft: '2.5rem',
                  backgroundColor: theme.colors.background,
                  borderColor: '#d1d5db',
                  color: theme.colors.text
                }}
              />
            </div>
          )}

          {enableFiltering && (
            <div className="filter-controls">
              <select
                value={filter.projectId || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, projectId: e.target.value || undefined }))}
                className="form-select"
                style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}
              >
                <option value="">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>

              <select
                value={filter.priority || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value as any || undefined }))}
                className="form-select"
                style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              <select
                value={filter.assigneeId || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, assigneeId: e.target.value || undefined }))}
                className="form-select"
                style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}
              >
                <option value="">All Assignees</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="list-actions">
          <span className="task-count" style={{ color: theme.colors.textSecondary }}>
            {filteredAndSortedTasks.length} tasks
          </span>
          {selectedTasks.size > 0 && enableBulkActions && (
            <span style={{ color: theme.colors.primary }}>
              {selectedTasks.size} selected
            </span>
          )}
        </div>
      </div>

      {/* List Table */}
      <div className="list-table-container">
        <table className="list-table">
          <thead>
            <tr>
              {enableBulkActions && (
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selectedTasks.size === filteredAndSortedTasks.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTasks(new Set(filteredAndSortedTasks.map(t => t.id)));
                      } else {
                        setSelectedTasks(new Set());
                      }
                    }}
                  />
                </th>
              )}
              <th style={{ width: 40 }}>Status</th>
              <th 
                className={enableSorting ? 'sortable' : ''}
                onClick={() => enableSorting && handleSort('title')}
              >
                Task
                {enableSorting && sort.field === 'title' && (
                  sort.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                )}
              </th>
              <th>Project</th>
              <th>Assignee</th>
              <th 
                className={enableSorting ? 'sortable' : ''}
                onClick={() => enableSorting && handleSort('priority')}
              >
                Priority
                {enableSorting && sort.field === 'priority' && (
                  sort.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                )}
              </th>
              <th 
                className={enableSorting ? 'sortable' : ''}
                onClick={() => enableSorting && handleSort('dueDate')}
              >
                Due Date
                {enableSorting && sort.field === 'dueDate' && (
                  sort.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                )}
              </th>
              <th style={{ width: 40 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTasks.map(task => {
              const project = getProject(task.projectId);
              const assignee = getAssignee(task.assigneeId);
              const isSelected = selectedTasks.has(task.id);
              const isCompleted = task.status.isCompleted;

              return (
                <tr 
                  key={task.id} 
                  className={`list-row ${isSelected ? 'selected' : ''} ${isCompleted ? 'completed' : ''}`}
                  style={{ 
                    backgroundColor: isSelected ? `${theme.colors.primary}10` : 'transparent',
                    opacity: isCompleted ? 0.7 : 1
                  }}
                >
                  {enableBulkActions && (
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleTaskToggle(task.id, e.target.checked)}
                      />
                    </td>
                  )}
                  <td>
                    <button
                      className="status-toggle"
                      onClick={() => handleTaskComplete(task)}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={16} color="#22c55e" />
                      ) : (
                        <Circle size={16} color={theme.colors.textSecondary} />
                      )}
                    </button>
                  </td>
                  <td>
                    <div className="task-cell">
                      <div className="task-title" style={{ color: theme.colors.text }}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="task-description" style={{ color: theme.colors.textSecondary }}>
                          {task.description}
                        </div>
                      )}
                      {task.tags && task.tags.length > 0 && (
                        <div className="task-tags">
                          {task.tags.slice(0, 3).map((tag, index) => (
                            <span 
                              key={index} 
                              className="task-tag"
                              style={{ 
                                backgroundColor: `${theme.colors.primary}20`,
                                color: theme.colors.primary 
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 3 && (
                            <span style={{ color: theme.colors.textSecondary }}>
                              +{task.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {project && (
                      <div className="project-cell">
                        <div 
                          className="project-color-indicator"
                          style={{ backgroundColor: project.color }}
                        />
                        <span style={{ color: theme.colors.text }}>{project.name}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {assignee && (
                      <div className="assignee-cell">
                        <div 
                          className="assignee-avatar"
                          style={{ backgroundColor: theme.colors.primary }}
                        >
                          {assignee.avatar ? (
                            <img src={assignee.avatar} alt={assignee.name} />
                          ) : (
                            assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()
                          )}
                        </div>
                        <span style={{ color: theme.colors.text }}>{assignee.name}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <span 
                      className={`priority-badge ${task.priority}`}
                      style={{
                        backgroundColor: `${getPriorityColor(task.priority)}20`,
                        color: getPriorityColor(task.priority),
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    {task.dueDate && (
                      <div className="due-date-cell" style={{ color: theme.colors.textSecondary }}>
                        <Calendar size={14} />
                        {formatDate(task.dueDate)}
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn ghost sm"
                      onClick={() => onTaskUpdate(task.id, {})}
                      title="Task options"
                    >
                      <MoreVertical size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredAndSortedTasks.length === 0 && (
          <div className="empty-state">
            <Flag className="empty-state-icon" color={theme.colors.textSecondary} />
            <h4 className="empty-state-title" style={{ color: theme.colors.text }}>
              No tasks found
            </h4>
            <p className="empty-state-description" style={{ color: theme.colors.textSecondary }}>
              {searchQuery || Object.keys(filter).length > 0 
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}