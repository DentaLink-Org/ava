import React, { useState } from 'react';
import { X, Folder, Palette, Users } from 'lucide-react';
import type { Project, TeamMember, ProjectSettings } from '../types';
import type { PageTheme } from '../../_shared/runtime/types';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'stats'>) => void;
  teamMembers: TeamMember[];
  theme: PageTheme;
}

const predefinedColors = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

const projectIcons = [
  'folder', 'star', 'heart', 'bookmark', 'flag', 'target', 'zap', 'trending-up', 
  'briefcase', 'code', 'database', 'globe', 'shield', 'rocket'
];

export function ProjectCreateModal({
  isOpen,
  onClose,
  onSubmit,
  teamMembers,
  theme
}: ProjectCreateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: predefinedColors[0],
    icon: 'folder',
    teamMembers: [] as string[],
    settings: {
      allowComments: true,
      allowAttachments: true,
      requireDueDates: false,
      defaultAssignee: '',
      customStatuses: []
    } as ProjectSettings
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    
    if (!validateForm()) {
      return;
    }

    const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'stats'> = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
      icon: formData.icon,
      ownerId: 'current-user', // Would come from auth context
      isArchived: false,
      isFavorite: false,
      teamMembers: formData.teamMembers,
      settings: formData.settings
    };

    onSubmit(projectData);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      color: predefinedColors[0],
      icon: 'folder',
      teamMembers: [],
      settings: {
        allowComments: true,
        allowAttachments: true,
        requireDueDates: false,
        defaultAssignee: '',
        customStatuses: []
      }
    });
    setErrors({});
  };

  const handleTeamMemberToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(memberId)
        ? prev.teamMembers.filter(id => id !== memberId)
        : [...prev.teamMembers, memberId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div 
        className="task-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: theme.colors.surface, maxWidth: '500px' }}
      >
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: theme.colors.text }}>
            Create New Project
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
                placeholder="Enter project name..."
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
                placeholder="Enter project description..."
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

            {/* Icon Selection */}
            <div className="form-group">
              <label className="form-label" style={{ color: theme.colors.text }}>
                Project Icon
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}>
                {projectIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '0.5rem',
                      backgroundColor: formData.icon === icon ? formData.color : theme.colors.background,
                      color: formData.icon === icon ? 'white' : theme.colors.text,
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 150ms ease'
                    }}
                    title={icon}
                  >
                    <Folder size={16} />
                  </button>
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
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}