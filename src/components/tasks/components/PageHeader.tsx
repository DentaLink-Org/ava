import React from 'react';
import { Plus, FolderPlus } from 'lucide-react';
import type { PageTheme } from '../../_shared/runtime/types';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showActions?: boolean;
  actions?: Array<{
    label: string;
    type: 'primary' | 'secondary';
    action: string;
    icon?: string;
  }>;
  onActionClick?: (action: string) => void;
  theme: PageTheme;
}

export function PageHeader({
  title,
  subtitle,
  showActions = true,
  actions = [],
  onActionClick,
  theme
}: PageHeaderProps) {
  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'plus':
        return Plus;
      case 'folder-plus':
        return FolderPlus;
      default:
        return Plus;
    }
  };

  const handleActionClick = (action: string) => {
    onActionClick?.(action);
  };

  return (
    <div className="tasks-page-header">
      <div className="page-header-content">
        <h1 style={{ color: theme.colors.text }}>{title}</h1>
        {subtitle && (
          <p style={{ color: theme.colors.textSecondary }}>{subtitle}</p>
        )}
      </div>
      
      {showActions && actions.length > 0 && (
        <div className="page-header-actions">
          {actions.map((action, index) => {
            const IconComponent = getIconComponent(action.icon);
            return (
              <button
                key={index}
                className={`header-action-btn ${action.type}`}
                onClick={() => handleActionClick(action.action)}
                style={{
                  backgroundColor: action.type === 'primary' ? theme.colors.primary : theme.colors.surface,
                  color: action.type === 'primary' ? 'white' : theme.colors.text,
                  borderColor: action.type === 'secondary' ? '#e5e7eb' : 'transparent'
                }}
              >
                <IconComponent size={16} />
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}