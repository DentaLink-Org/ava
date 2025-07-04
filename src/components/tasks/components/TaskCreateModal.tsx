import React, { useState } from 'react';
import { X, Calendar, User, Flag, Tag } from 'lucide-react';
import type { Task, Project, TeamMember, TaskStatus, TaskPriority, CreateTaskData } from '../types';
import { TaskEffort, TaskComplexity, TaskRisk } from '../types';
import type { PageTheme } from '../../_shared/runtime/types';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskData) => void;
  projects: Project[];
  teamMembers: TeamMember[];
  statuses: TaskStatus[];
  defaultProject?: string;
  defaultStatus?: string;
  theme: PageTheme;
}

export function TaskCreateModal({
  isOpen,
  onClose,
  onSubmit,
  projects,
  teamMembers,
  statuses,
  defaultProject,
  defaultStatus,
  theme
}: TaskCreateModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: defaultProject || '',
    assigneeId: '',
    statusId: defaultStatus || statuses.find(s => s.isDefault)?.id || '',
    priority: 'medium' as TaskPriority,
    dueDate: '',
    tags: [] as string[],
    estimatedHours: 0
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    
    if (!validateForm()) {
      return;
    }

    const selectedStatus = statuses.find(s => s.id === formData.statusId);
    if (!selectedStatus) {
      return;
    }

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      projectId: formData.projectId,
      assigneeId: formData.assigneeId || undefined,
      status: selectedStatus,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      tags: formData.tags.length > 0 ? formData.tags : [],
      estimatedHours: formData.estimatedHours > 0 ? formData.estimatedHours : undefined,
      createdBy: 'current-user', // Would come from auth context
      position: 0, // Will be set by the backend
      // Enhanced fields with defaults
      storyPoints: 0,
      effortLevel: TaskEffort.MODERATE,
      complexity: TaskComplexity.MODERATE,
      riskLevel: TaskRisk.LOW,
      customFields: {},
      metadata: {},
      progress: 0,
      dependencies: [],
      timeEntries: []
    };

    onSubmit(taskData);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      projectId: defaultProject || '',
      assigneeId: '',
      statusId: defaultStatus || statuses.find(s => s.isDefault)?.id || '',
      priority: 'medium',
      dueDate: '',
      tags: [],
      estimatedHours: 0
    });
    setTagInput('');
    setErrors({});
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

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'low': return '#6b7280';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'urgent': return '#dc2626';
      default: return '#6b7280';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div 
        className="task-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: theme.colors.text }}>
            Create New Task
          </h2>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            style={{ color: theme.colors.textSecondary }}
          >
            <X size={20} />
          </button>
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
                placeholder="Enter task title..."
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
                placeholder="Enter task description..."
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
                  <option value="">Select a project</option>
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

            {/* Due Date and Estimated Hours Row */}
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
                  placeholder="0"
                  min="0"
                  step="0.5"
                  style={{ 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text
                  }}
                />
              </div>
            </div>

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
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}