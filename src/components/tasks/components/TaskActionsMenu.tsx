import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit3, Copy, Archive, Trash2, Move, Flag } from 'lucide-react';
import type { Task, TaskPriority } from '../types';
import type { PageTheme } from '../../_shared/runtime/types';

interface TaskActionsMenuProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (task: Task) => void;
  onArchive?: (taskId: string) => void;
  onMove?: (taskId: string, newStatus: string) => void;
  onPriorityChange?: (taskId: string, priority: TaskPriority) => void;
  statuses?: Array<{ id: string; name: string; color: string }>;
  theme: PageTheme;
}

export function TaskActionsMenu({
  task,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onMove,
  onPriorityChange,
  statuses = [],
  theme
}: TaskActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);
  const [showPrioritySubmenu, setShowPrioritySubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowMoveSubmenu(false);
        setShowPrioritySubmenu(false);
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
    setShowMoveSubmenu(false);
    setShowPrioritySubmenu(false);
  };

  const priorities: Array<{ value: TaskPriority; label: string; color: string }> = [
    { value: 'low', label: 'Low', color: '#6b7280' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' },
    { value: 'urgent', label: 'Urgent', color: '#dc2626' }
  ];

  const filteredStatuses = statuses.filter(status => status.id !== task.status.id);

  return (
    <div className="task-actions-menu" style={{ position: 'relative' }}>
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
        title="Task actions"
      >
        <MoreVertical size={14} />
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
            minWidth: '160px',
            padding: '0.5rem 0'
          }}
        >
          {/* Edit */}
          <button
            className="menu-item"
            onClick={() => handleAction(() => onEdit(task))}
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
            Edit Task
          </button>

          {/* Duplicate */}
          <button
            className="menu-item"
            onClick={() => handleAction(() => onDuplicate(task))}
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
            <Copy size={14} />
            Duplicate
          </button>

          {/* Move to Status (if statuses provided and onMove available) */}
          {onMove && filteredStatuses.length > 0 && (
            <div 
              className="menu-item submenu"
              style={{ position: 'relative' }}
              onMouseEnter={() => setShowMoveSubmenu(true)}
              onMouseLeave={() => setShowMoveSubmenu(false)}
            >
              <button
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
                <Move size={14} />
                Move to...
              </button>
              
              {showMoveSubmenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '100%',
                    backgroundColor: theme.colors.surface,
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    minWidth: '140px',
                    padding: '0.5rem 0'
                  }}
                >
                  {filteredStatuses.map(status => (
                    <button
                      key={status.id}
                      className="menu-item"
                      onClick={() => handleAction(() => onMove(task.id, status.id))}
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
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: status.color
                        }}
                      />
                      {status.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Change Priority (if onPriorityChange available) */}
          {onPriorityChange && (
            <div 
              className="menu-item submenu"
              style={{ position: 'relative' }}
              onMouseEnter={() => setShowPrioritySubmenu(true)}
              onMouseLeave={() => setShowPrioritySubmenu(false)}
            >
              <button
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
                <Flag size={14} />
                Priority...
              </button>
              
              {showPrioritySubmenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '100%',
                    backgroundColor: theme.colors.surface,
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    minWidth: '120px',
                    padding: '0.5rem 0'
                  }}
                >
                  {priorities.map(priority => (
                    <button
                      key={priority.value}
                      className="menu-item"
                      onClick={() => handleAction(() => onPriorityChange(task.id, priority.value))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: 'none',
                        background: 'none',
                        color: priority.value === task.priority ? priority.color : theme.colors.text,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: priority.value === task.priority ? '600' : 'normal'
                      }}
                    >
                      <Flag size={12} fill={priority.value === task.priority ? 'currentColor' : 'none'} />
                      {priority.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '0.5rem 0' }} />

          {/* Archive (if available) */}
          {onArchive && (
            <button
              className="menu-item"
              onClick={() => handleAction(() => onArchive(task.id))}
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
              Archive
            </button>
          )}

          {/* Delete */}
          <button
            className="menu-item"
            onClick={() => handleAction(() => onDelete(task.id))}
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
            Delete
          </button>
        </div>
      )}

      <style jsx>{`
        .menu-item:hover {
          background-color: ${theme.colors.background} !important;
        }
        .submenu:hover > div {
          display: block;
        }
      `}</style>
    </div>
  );
}