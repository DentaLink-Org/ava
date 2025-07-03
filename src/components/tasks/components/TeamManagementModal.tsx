import React, { useState } from 'react';
import { X, UserPlus, Mail, Crown, Shield, Eye, Trash2 } from 'lucide-react';
import type { TeamMember, TeamRole } from '../types';
import type { PageTheme } from '../../_shared/runtime/types';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  onInviteMember: (email: string, role: TeamRole) => void;
  onUpdateMemberRole: (memberId: string, role: TeamRole) => void;
  onRemoveMember: (memberId: string) => void;
  theme: PageTheme;
}

export function TeamManagementModal({
  isOpen,
  onClose,
  teamMembers,
  onInviteMember,
  onUpdateMemberRole,
  onRemoveMember,
  theme
}: TeamManagementModalProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');
  const [inviteError, setInviteError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      setInviteError('Email is required');
      return;
    }

    if (!validateEmail(inviteEmail)) {
      setInviteError('Please enter a valid email address');
      return;
    }

    if (teamMembers.some(member => member.email.toLowerCase() === inviteEmail.toLowerCase())) {
      setInviteError('This person is already a team member');
      return;
    }

    onInviteMember(inviteEmail.trim(), inviteRole);
    setInviteEmail('');
    setInviteRole('member');
    setInviteError('');
  };

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case 'admin': return Crown;
      case 'manager': return Shield;
      case 'member': return Eye;
      case 'viewer': return Eye;
      default: return Eye;
    }
  };

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case 'admin': return '#dc2626';
      case 'manager': return '#f59e0b';
      case 'member': return '#3b82f6';
      case 'viewer': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getRoleDescription = (role: TeamRole) => {
    switch (role) {
      case 'admin': return 'Full access to all features and settings';
      case 'manager': return 'Can manage tasks, projects, and team members';
      case 'member': return 'Can create and edit tasks, limited project access';
      case 'viewer': return 'Read-only access to tasks and projects';
      default: return '';
    }
  };

  if (!isOpen) return null;

  const activeMembers = teamMembers.filter(member => member.isActive);
  const adminCount = activeMembers.filter(member => member.role === 'admin').length;

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div 
        className="task-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: theme.colors.surface, maxWidth: '600px' }}
      >
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: theme.colors.text }}>
            Team Management
          </h2>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            style={{ color: theme.colors.textSecondary }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Invite New Member */}
          <div className="form-group">
            <label className="form-label" style={{ color: theme.colors.text }}>
              <UserPlus size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Invite Team Member
            </label>
            <form onSubmit={handleInvite} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                className="form-input"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  setInviteError('');
                }}
                placeholder="Enter email address..."
                style={{ 
                  flex: 1,
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: inviteError ? '#ef4444' : '#d1d5db'
                }}
              />
              <select
                className="form-select"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                style={{ 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  minWidth: '120px'
                }}
              >
                <option value="viewer">Viewer</option>
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                className="btn primary"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <Mail size={16} />
                Invite
              </button>
            </form>
            {inviteError && (
              <div className="form-error">{inviteError}</div>
            )}
          </div>

          {/* Role Descriptions */}
          <div style={{ 
            backgroundColor: theme.colors.background,
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ color: theme.colors.text, marginBottom: '0.75rem', fontSize: '0.875rem' }}>
              Role Permissions
            </h4>
            <div style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, lineHeight: '1.5' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: getRoleColor('admin') }}>Admin:</strong> {getRoleDescription('admin')}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: getRoleColor('manager') }}>Manager:</strong> {getRoleDescription('manager')}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: getRoleColor('member') }}>Member:</strong> {getRoleDescription('member')}
              </div>
              <div>
                <strong style={{ color: getRoleColor('viewer') }}>Viewer:</strong> {getRoleDescription('viewer')}
              </div>
            </div>
          </div>

          {/* Team Members List */}
          <div className="form-group">
            <label className="form-label" style={{ color: theme.colors.text }}>
              Team Members ({activeMembers.length})
            </label>
            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem'
            }}>
              {activeMembers.map(member => {
                const RoleIcon = getRoleIcon(member.role);
                const isOnlyAdmin = member.role === 'admin' && adminCount === 1;
                
                return (
                  <div
                    key={member.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderBottom: '1px solid #f3f4f6'
                    }}
                  >
                    {/* Avatar */}
                    <div 
                      className="assignee-avatar"
                      style={{ 
                        backgroundColor: theme.colors.primary,
                        width: '32px',
                        height: '32px',
                        fontSize: '0.875rem'
                      }}
                    >
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} />
                      ) : (
                        member.name.split(' ').map(n => n[0]).join('').toUpperCase()
                      )}
                    </div>

                    {/* Member Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: theme.colors.text,
                        fontWeight: '500',
                        fontSize: '0.875rem'
                      }}>
                        {member.name}
                      </div>
                      <div style={{ 
                        color: theme.colors.textSecondary,
                        fontSize: '0.75rem'
                      }}>
                        {member.email}
                      </div>
                      <div style={{ 
                        color: theme.colors.textSecondary,
                        fontSize: '0.75rem'
                      }}>
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Role */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <select
                        value={member.role}
                        onChange={(e) => onUpdateMemberRole(member.id, e.target.value as TeamRole)}
                        disabled={isOnlyAdmin}
                        className="form-select"
                        style={{ 
                          backgroundColor: theme.colors.background,
                          color: theme.colors.text,
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          minWidth: '100px'
                        }}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="member">Member</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>

                      <div 
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: getRoleColor(member.role),
                          fontSize: '0.75rem'
                        }}
                        title={getRoleDescription(member.role)}
                      >
                        <RoleIcon size={12} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <button
                        className="btn ghost sm"
                        onClick={() => onRemoveMember(member.id)}
                        disabled={isOnlyAdmin}
                        title={isOnlyAdmin ? 'Cannot remove the only admin' : 'Remove member'}
                        style={{ 
                          color: isOnlyAdmin ? theme.colors.textSecondary : '#ef4444',
                          opacity: isOnlyAdmin ? 0.5 : 1
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warning for Last Admin */}
          {adminCount === 1 && (
            <div style={{ 
              backgroundColor: '#fef3c7',
              color: '#d97706',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Shield size={16} />
              <span>
                At least one admin is required. The last admin cannot be removed or have their role changed.
              </span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn secondary"
            onClick={onClose}
            style={{ 
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: '#d1d5db'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}