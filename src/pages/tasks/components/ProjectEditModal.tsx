import React, { useState, useEffect } from 'react';
import { X, Palette, Users, Trash2 } from 'lucide-react';
import type { Project, TeamMember } from '../types';
import type { PageTheme } from '../../_shared/runtime/types';

interface ProjectEditModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSubmit: (projectId: string, updates: Partial<Project>) => void;
  onDelete: (projectId: string) => void;
  teamMembers: TeamMember[];
  theme: PageTheme;
}

const predefinedColors = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export function ProjectEditModal({
  isOpen,
  project,
  onClose,
  onSubmit,
  onDelete,
  teamMembers,
  theme
}: ProjectEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: predefinedColors[0],
    teamMembers: [] as string[],
    settings: {
      allowComments: true,
      allowAttachments: true,
      requireDueDates: false,
      defaultAssignee: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        color: project.color,
        teamMembers: project.teamMembers,
        settings: {
          allowComments: project.settings.allowComments,
          allowAttachments: project.settings.allowAttachments,
          requireDueDates: project.settings.requireDueDates,
          defaultAssignee: project.settings.defaultAssignee || ''
        }
      });
    }
  }, [project]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (formData.name.length > 50) {
      newErrors.name = 'Project name must be 50 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project || !validateForm()) {
      return;
    }

    const updates: Partial<Project> = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
      teamMembers: formData.teamMembers,
      settings: {
        ...project.settings,
        allowComments: formData.settings.allowComments,
        allowAttachments: formData.settings.allowAttachments,
        requireDueDates: formData.settings.requireDueDates,
        defaultAssignee: formData.settings.defaultAssignee || undefined
      }
    };

    onSubmit(project.id, updates);
    setErrors({});
  };

  const handleDelete = () => {
    if (project) {
      onDelete(project.id);
      setShowDeleteConfirm(false);
    }
  };

  const handleTeamMemberToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(memberId)
        ? prev.teamMembers.filter(id => id !== memberId)
        : [...prev.teamMembers, memberId]
    }));
  };

  if (!isOpen || !project) return null;

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div 
        className="task-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: theme.colors.surface, maxWidth: '500px' }}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title" style={{ color: theme.colors.text }}>
              Edit Project
            </h2>
            <p style={{ 
              color: theme.colors.textSecondary, 
              fontSize: '0.875rem',
              margin: '0.25rem 0 0 0'
            }}>
              Created {new Date(project.createdAt).toLocaleDateString()} • 
              {project.stats.totalTasks} tasks
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn danger sm"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete project"
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
            {/* Project Name */}
            <div className="form-group">
              <label className="form-label" style={{ color: theme.colors.text }}>
                Project Name *
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                maxLength={50}
                style={{ 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: errors.name ? '#ef4444' : '#d1d5db'
                }}
              />
              {errors.name && (
                <div className="form-error">{errors.name}</div>
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

            {/* Color Selection */}
            <div className="form-group">
              <label className="form-label" style={{ color: theme.colors.text }}>
                <Palette size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Project Color
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(5, 1fr)', 
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}>
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: formData.color === color ? `3px solid ${theme.colors.text}` : '2px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 150ms ease'
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Team Members */}
            <div className="form-group">
              <label className="form-label" style={{ color: theme.colors.text }}>
                <Users size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Team Members ({formData.teamMembers.length})
              </label>
              <div style={{ 
                maxHeight: '200px', 
                overflowY: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '0.5rem'
              }}>
                {teamMembers.map(member => (
                  <label
                    key={member.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      borderRadius: '0.25rem',
                      backgroundColor: formData.teamMembers.includes(member.id) 
                        ? `${theme.colors.primary}10` 
                        : 'transparent'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.teamMembers.includes(member.id)}
                      onChange={() => handleTeamMemberToggle(member.id)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <div 
                      className="assignee-avatar"
                      style={{ 
                        backgroundColor: theme.colors.primary,
                        width: '24px',
                        height: '24px',
                        fontSize: '0.75rem'
                      }}
                    >
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} />
                      ) : (
                        member.name.split(' ').map(n => n[0]).join('').toUpperCase()
                      )}
                    </div>
                    <span style={{ color: theme.colors.text }}>{member.name}</span>
                    <span style={{ 
                      color: theme.colors.textSecondary, 
                      fontSize: '0.875rem' 
                    }}>
                      {member.email}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Project Settings */}
            <div className="form-group">
              <label className="form-label" style={{ color: theme.colors.text }}>
                Project Settings
              </label>
              <div style={{ 
                backgroundColor: theme.colors.background,
                padding: '1rem',
                borderRadius: '0.5rem',
                gap: '0.75rem',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.settings.allowComments}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, allowComments: e.target.checked }
                    }))}
                  />
                  <span style={{ color: theme.colors.text }}>Allow task comments</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.settings.allowAttachments}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, allowAttachments: e.target.checked }
                    }))}
                  />
                  <span style={{ color: theme.colors.text }}>Allow file attachments</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.settings.requireDueDates}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, requireDueDates: e.target.checked }
                    }))}
                  />
                  <span style={{ color: theme.colors.text }}>Require due dates for tasks</span>
                </label>

                <div>
                  <label className="form-label" style={{ 
                    color: theme.colors.text,
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem'
                  }}>
                    Default Assignee
                  </label>
                  <select
                    className="form-select"
                    value={formData.settings.defaultAssignee}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, defaultAssignee: e.target.value }
                    }))}
                    style={{ 
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text,
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">No default assignee</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Project Statistics */}
            <div style={{ 
              padding: '1rem',
              backgroundColor: theme.colors.background,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: theme.colors.textSecondary
            }}>
              <h4 style={{ color: theme.colors.text, marginBottom: '0.5rem' }}>Statistics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                <div><strong>Total Tasks:</strong> {project.stats.totalTasks}</div>
                <div><strong>Completed:</strong> {project.stats.completedTasks}</div>
                <div><strong>Active:</strong> {project.stats.activeTasks}</div>
                <div><strong>Overdue:</strong> {project.stats.overdueTasks}</div>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Completion Rate:</strong> {Math.round(project.stats.completionRate * 100)}%
              </div>
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
                <h3 style={{ color: theme.colors.text }}>Delete Project</h3>
              </div>
              <div className="modal-body">
                <p style={{ color: theme.colors.text }}>
                  Are you sure you want to delete "{project.name}"? This will also delete all 
                  {project.stats.totalTasks} tasks in this project. This action cannot be undone.
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
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}