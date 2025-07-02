import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Flag, Tag, Trash2 } from 'lucide-react';
import type { Task, Project, TeamMember, TaskStatus, TaskPriority } from '../types';
import type { PageTheme } from '../../_shared/runtime/types';

interface TaskEditModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmit: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  projects: Project[];
  teamMembers: TeamMember[];
  statuses: TaskStatus[];
  theme: PageTheme;
}

export function TaskEditModal({
  isOpen,
  task,
  onClose,
  onSubmit,
  onDelete,
  projects,
  teamMembers,
  statuses,
  theme
}: TaskEditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assigneeId: '',
    statusId: '',
    priority: 'medium' as TaskPriority,
    dueDate: '',
    tags: [] as string[],
    estimatedHours: 0,
    actualHours: 0
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        projectId: task.projectId,
        assigneeId: task.assigneeId || '',
        statusId: task.status.id,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', // Format for date input
        tags: task.tags || [],
        estimatedHours: task.estimatedHours || 0,
        actualHours: task.actualHours || 0
      });
    }
  }, [task]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    if (!formData.statusId) {
      newErrors.statusId = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task || !validateForm()) {
      return;
    }

    const selectedStatus = statuses.find(s => s.id === formData.statusId);
    if (!selectedStatus) {
      return;
    }

    const updates: Partial<Task> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      projectId: formData.projectId,
      assigneeId: formData.assigneeId || undefined,
      status: selectedStatus,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      estimatedHours: formData.estimatedHours > 0 ? formData.estimatedHours : undefined,
      actualHours: formData.actualHours > 0 ? formData.actualHours : undefined
    };

    onSubmit(task.id, updates);
    setErrors({});
  };

  const handleDelete = () => {
    if (task) {
      onDelete(task.id);
      setShowDeleteConfirm(false);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen || !task) return null;

  const project = projects.find(p => p.id === task.projectId);
  const assignee = teamMembers.find(m => m.id === task.assigneeId);

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div 
        className="task-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title" style={{ color: theme.colors.text }}>
              Edit Task
            </h2>
            <p style={{ 
              color: theme.colors.textSecondary, 
              fontSize: '0.875rem',
              margin: '0.25rem 0 0 0'
            }}>
              {project?.name} • Created {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn danger sm"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
            <button 
              className="modal-close-btn"
              onClick={onClose}
              style={{ color: theme.colors.textSecondary }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Task Title */}
            <div className="form-group">
              <label className="form-label" style={{ color: theme.colors.text }}>
                Task Title *
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                style={{ 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: errors.title ? '#ef4444' : '#d1d5db'
                }}
              />
              {errors.title && (
                <div className="form-error">{errors.title}</div>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" style={{ color: theme.colors.text }}>
                Description
              </label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                style={{ 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text
                }}
              />
            </div>

            {/* Project and Status Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ color: theme.colors.text }}>
                  Project *
                </label>
                <select
                  className="form-select"
                  value={formData.projectId}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                  style={{ 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: errors.projectId ? '#ef4444' : '#d1d5db'
                  }}
                >
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <div className="form-error">{errors.projectId}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: theme.colors.text }}>
                  Status *
                </label>
                <select
                  className="form-select"
                  value={formData.statusId}
                  onChange={(e) => setFormData(prev => ({ ...prev, statusId: e.target.value }))}
                  style={{ 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: errors.statusId ? '#ef4444' : '#d1d5db'
                  }}
                >
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
                {errors.statusId && (
                  <div className="form-error">{errors.statusId}</div>
                )}
              </div>
            </div>

            {/* Assignee and Priority Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ color: theme.colors.text }}>
                  <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Assignee
                </label>
                <select
                  className="form-select"
                  value={formData.assigneeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                  style={{ 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text
                  }}
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: theme.colors.text }}>
                  <Flag size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Priority
                </label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                  style={{ 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Due Date and Hours Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ color: theme.colors.text }}>
                  <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Due Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  style={{ 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: theme.colors.text }}>
                  Estimated Hours
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: Number(e.target.value) }))}
                  min="0"
                  step="0.5"
                  style={{ 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text
                  }}
                />
              </div>
            </div>

            {/* Actual Hours (if task has been started) */}
            {task.actualHours !== undefined && (
              <div className="form-group">
                <label className="form-label" style={{ color: theme.colors.text }}>
                  Actual Hours
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.actualHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualHours: Number(e.target.value) }))}
                  min="0"
                  step="0.5"
                  style={{ 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text
                  }}
                />
              </div>
            )}

            {/* Tags */}
            <div className="form-group">
              <label className="form-label" style={{ color: theme.colors.text }}>
                <Tag size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Tags
              </label>
              <input
                type="text"
                className="form-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagAdd}
                placeholder="Type a tag and press Enter..."
                style={{ 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text
                }}
              />
              {formData.tags.length > 0 && (
                <div className="task-tags" style={{ marginTop: '0.5rem' }}>
                  {formData.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="task-tag"
                      style={{ 
                        backgroundColor: `${theme.colors.primary}20`,
                        color: theme.colors.primary,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'inherit',
                          cursor: 'pointer',
                          padding: '0',
                          fontSize: '0.75rem'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Task Metadata */}
            <div style={{ 
              padding: '1rem',
              backgroundColor: theme.colors.background,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: theme.colors.textSecondary
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Created:</strong> {new Date(task.createdAt).toLocaleString()}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Updated:</strong> {new Date(task.updatedAt).toLocaleString()}
              </div>
              {task.completedAt && (
                <div>
                  <strong>Completed:</strong> {new Date(task.completedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn secondary"
              onClick={onClose}
              style={{ 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: '#d1d5db'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary"
              style={{ backgroundColor: theme.colors.primary }}
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="task-modal-overlay">
            <div 
              className="task-modal"
              style={{ 
                backgroundColor: theme.colors.surface,
                maxWidth: '400px'
              }}
            >
              <div className="modal-header">
                <h3 style={{ color: theme.colors.text }}>Delete Task</h3>
              </div>
              <div className="modal-body">
                <p style={{ color: theme.colors.text }}>
                  Are you sure you want to delete "{task.title}"? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: '#d1d5db'
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn danger"
                  onClick={handleDelete}
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}