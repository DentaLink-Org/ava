/**
 * Theme Gallery Header Component
 * Header section for the theme gallery with title, stats, and actions
 */

'use client';

import React from 'react';
import { Palette, RefreshCw, Plus, Info } from 'lucide-react';
import { ThemeGalleryHeaderProps } from '../types';
import { useDatabaseTheme } from '../../_shared/runtime/DatabaseThemeProvider';

export const ThemeGalleryHeader: React.FC<ThemeGalleryHeaderProps> = ({
  title,
  subtitle,
  showStats = true,
  onRefresh,
  onCreateTheme,
  className = ''
}) => {
  const { availableThemes, isLoading } = useDatabaseTheme();

  const systemThemes = availableThemes.filter(theme => theme.category !== 'custom').length;
  const customThemes = availableThemes.filter(theme => theme.category === 'custom').length;

  return (
    <div className={`theme-gallery-header ${className}`}>
      <div className="header-content">
        <div className="header-main">
          <div className="header-icon">
            <Palette size={32} />
          </div>
          <div className="header-text">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
        
        {showStats && (
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{availableThemes.length}</span>
              <span className="stat-label">Total Themes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{systemThemes}</span>
              <span className="stat-label">System</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{customThemes}</span>
              <span className="stat-label">Custom</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="header-actions">
        <button
          className="header-action-btn secondary"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh themes"
        >
          <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
          Refresh
        </button>
        
        <button
          className="header-action-btn primary"
          onClick={onCreateTheme}
          title="Create custom theme"
        >
          <Plus size={16} />
          Create Theme
        </button>
      </div>
    </div>
  );
};