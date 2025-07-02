import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Edit3, Star, Archive, Trash2, Users, Settings } from 'lucide-react';
import type { Project } from '../types';
import type { PageTheme } from '../../_shared/runtime/types';

interface ProjectActionsMenuProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onToggleFavorite: (projectId: string) => void;
  onArchive?: (projectId: string) => void;
  onManageTeam?: (project: Project) => void;
  theme: PageTheme;
}

export function ProjectActionsMenu({
  project,
  onEdit,
  onDelete,
  onToggleFavorite,
  onArchive,
  onManageTeam,
  theme
}: ProjectActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="project-actions-menu" style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        className="btn ghost sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{ 
          padding: '0.25rem',
          color: theme.colors.textSecondary 
        }}
        title="Project actions"
      >
        <MoreHorizontal size={14} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="actions-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            backgroundColor: theme.colors.surface,
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 1000,
            minWidth: '180px',
            padding: '0.5rem 0'
          }}
        >
          {/* Edit Project */}
          <button
            className="menu-item"
            onClick={() => handleAction(() => onEdit(project))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: 'none',
              background: 'none',
              color: theme.colors.text,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Edit3 size={14} />
            Edit Project
          </button>

          {/* Toggle Favorite */}
          <button
            className="menu-item"
            onClick={() => handleAction(() => onToggleFavorite(project.id))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: 'none',
              background: 'none',
              color: theme.colors.text,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Star size={14} fill={project.isFavorite ? 'currentColor' : 'none'} />
            {project.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>

          {/* Manage Team (if available) */}
          {onManageTeam && (
            <button
              className="menu-item"
              onClick={() => handleAction(() => onManageTeam(project))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: 'none',
                background: 'none',
                color: theme.colors.text,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Users size={14} />
              Manage Team ({project.teamMembers.length})
            </button>
          )}

          <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '0.5rem 0' }} />

          {/* Archive (if available) */}
          {onArchive && !project.isArchived && (
            <button
              className="menu-item"
              onClick={() => handleAction(() => onArchive(project.id))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: 'none',
                background: 'none',
                color: theme.colors.textSecondary,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Archive size={14} />
              Archive Project
            </button>
          )}

          {/* Delete */}
          <button
            className="menu-item"
            onClick={() => handleAction(() => onDelete(project.id))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: 'none',
              background: 'none',
              color: '#ef4444',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Trash2 size={14} />
            Delete Project
          </button>
        </div>
      )}

      <style jsx>{`
        .menu-item:hover {
          background-color: ${theme.colors.background} !important;
        }
      `}</style>
    </div>
  );
}