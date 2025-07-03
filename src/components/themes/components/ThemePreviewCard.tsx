/**
 * Theme Preview Card Component
 * Displays a theme with preview, information, and action buttons
 */

'use client';

import React from 'react';
import { 
  Eye, 
  Check, 
  Download, 
  Edit3, 
  Trash2, 
  Star,
  Palette,
  Loader
} from 'lucide-react';
import { ThemePreviewCardProps } from '../types';

export const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({
  theme,
  isSelected = false,
  isApplied = false,
  isLoading = false,
  size = 'medium',
  showInfo = true,
  showActions = true,
  onSelect,
  onApply,
  onPreview,
  onEdit,
  className = ''
}) => {
  const cardClasses = [
    'theme-preview-card',
    `size-${size}`,
    isSelected ? 'selected' : '',
    isApplied ? 'applied' : '',
    isLoading ? 'loading' : '',
    className
  ].filter(Boolean).join(' ');

  // Generate preview colors from theme
  const previewColors = [
    theme.cssProperties['--color-primary'] || '#3b82f6',
    theme.cssProperties['--color-secondary'] || '#1d4ed8',
    theme.cssProperties['--color-background'] || '#ffffff',
    theme.cssProperties['--color-surface'] || '#f9fafb',
    theme.cssProperties['--color-text'] || '#111827'
  ];

  const handleCardClick = () => {
    if (!isLoading && onSelect) {
      onSelect();
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoading && onApply) {
      onApply();
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoading && onPreview) {
      onPreview();
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoading && onEdit) {
      onEdit();
    }
  };

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <Loader size={20} className="spinning" />
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div className="selection-indicator">
          <Check size={16} />
        </div>
      )}

      {/* Applied indicator */}
      {isApplied && (
        <div className="applied-indicator">
          <Star size={14} />
          <span>Applied</span>
        </div>
      )}

      {/* Theme preview */}
      <div className="theme-preview">
        <div className="preview-header" style={{ 
          backgroundColor: previewColors[2],
          borderColor: theme.cssProperties['--color-border'] || '#e5e7eb'
        }}>
          <div className="preview-title" style={{ 
            color: previewColors[4] 
          }}>
            Sample Page
          </div>
          <div className="preview-actions">
            <div className="preview-dot" style={{ backgroundColor: previewColors[0] }}></div>
            <div className="preview-dot" style={{ backgroundColor: previewColors[1] }}></div>
            <div className="preview-dot" style={{ backgroundColor: previewColors[4] }}></div>
          </div>
        </div>
        
        <div className="preview-content" style={{ 
          backgroundColor: previewColors[3] 
        }}>
          <div className="preview-card" style={{ 
            backgroundColor: previewColors[2],
            borderColor: theme.cssProperties['--color-border'] || '#e5e7eb'
          }}>
            <div className="preview-card-header" style={{ 
              backgroundColor: previewColors[0] 
            }}></div>
            <div className="preview-card-content">
              <div className="preview-text" style={{ 
                backgroundColor: previewColors[4] 
              }}></div>
              <div className="preview-text secondary" style={{ 
                backgroundColor: theme.cssProperties['--color-textSecondary'] || '#6b7280' 
              }}></div>
            </div>
          </div>
          
          <div className="preview-button" style={{ 
            backgroundColor: previewColors[0] 
          }}></div>
        </div>
      </div>

      {/* Theme information */}
      {showInfo && (
        <div className="theme-info">
          <div className="theme-header">
            <h4 className="theme-name">{theme.displayName}</h4>
            <span className={`theme-category ${theme.category}`}>
              {theme.category}
            </span>
          </div>
          
          <div className="theme-colors">
            {previewColors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="color-swatch"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Theme actions */}
      {showActions && (
        <div className="theme-actions">
          <button
            className="action-btn secondary"
            onClick={handlePreviewClick}
            disabled={isLoading}
            title="Preview theme"
          >
            <Eye size={14} />
          </button>
          
          <button
            className="action-btn primary"
            onClick={handleApplyClick}
            disabled={isLoading}
            title="Apply theme"
          >
            <Download size={14} />
            Apply
          </button>
          
          {theme.category === 'custom' && (
            <button
              className="action-btn ghost"
              onClick={handleEditClick}
              disabled={isLoading}
              title="Edit theme"
            >
              <Edit3 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};