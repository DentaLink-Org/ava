/**
 * PageHeader Component
 * Header section for the databases page with title and actions
 */

import React from 'react';
import { Plus, Database, RefreshCw } from 'lucide-react';
import { PageTheme } from '@/pages/_shared/runtime/types';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  theme: PageTheme;
  actions?: Array<{
    label: string;
    icon?: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    action: string;
  }>;
  onAction?: (action: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Plus,
  Database,
  RefreshCw
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  theme,
  actions = [],
  onAction
}) => {
  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
  };

  const getVariantClass = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'ghost':
        return 'btn-ghost';
      default:
        return 'btn-primary';
    }
  };

  return (
    <div 
      className="page-header"
      style={{
        '--primary': theme.colors.primary,
        '--secondary': theme.colors.secondary,
        '--background': theme.colors.background,
        '--surface': theme.colors.surface,
        '--text': theme.colors.text,
        '--text-secondary': theme.colors.textSecondary,
        '--spacing-base': `${theme.spacing.base}px`,
        '--spacing-small': `${theme.spacing.small}px`,
        '--spacing-large': `${theme.spacing.large}px`,
      } as React.CSSProperties}
    >
      <div className="header-content">
        <div className="header-text">
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
        
        {actions.length > 0 && (
          <div className="header-actions">
            {actions.map((action, index) => {
              const Icon = action.icon ? iconMap[action.icon] : null;
              return (
                <button
                  key={index}
                  onClick={() => handleAction(action.action)}
                  className={`header-action-btn ${getVariantClass(action.variant)}`}
                >
                  {Icon && <Icon className="action-icon" />}
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};