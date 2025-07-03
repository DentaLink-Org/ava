/**
 * Enhanced Theme Preview Card Component
 * Displays a theme with variations support
 */

'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  Check, 
  Download, 
  Edit3, 
  Trash2, 
  Star,
  Palette,
  Loader,
  ChevronDown,
  ChevronUp,
  Copy,
  Plus
} from 'lucide-react';
import { RuntimeTheme, ThemeVariationSummary } from '../../_shared/types/theme';

interface ThemePreviewCardEnhancedProps {
  theme: RuntimeTheme;
  isSelected?: boolean;
  isApplied?: boolean;
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
  showInfo?: boolean;
  showActions?: boolean;
  showVariations?: boolean;
  onSelect?: () => void;
  onApply?: () => void;
  onPreview?: () => void;
  onEdit?: () => void;
  onCreateVariation?: () => void;
  onSelectVariation?: (variationId: string) => void;
  className?: string;
}

export const ThemePreviewCardEnhanced: React.FC<ThemePreviewCardEnhancedProps> = ({
  theme,
  isSelected = false,
  isApplied = false,
  isLoading = false,
  size = 'medium',
  showInfo = true,
  showActions = true,
  showVariations = true,
  onSelect,
  onApply,
  onPreview,
  onEdit,
  onCreateVariation,
  onSelectVariation,
  className = ''
}) => {
  const [showingVariations, setShowingVariations] = useState(false);
  
  const cardClasses = [
    'theme-preview-card-enhanced',
    `size-${size}`,
    isSelected ? 'selected' : '',
    isApplied ? 'applied' : '',
    isLoading ? 'loading' : '',
    theme.type === 'variation' ? 'is-variation' : '',
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

  const handleCreateVariationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoading && onCreateVariation) {
      onCreateVariation();
    }
  };

  const handleToggleVariations = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowingVariations(!showingVariations);
  };

  const hasVariations = theme.variations && theme.variations.length > 0;

  return (
    <div className={cardClasses}>
      <div className="card-main" onClick={handleCardClick}>
        {/* Loading overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <Loader size={20} className="animate-spin" />
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

        {/* Variation indicator */}
        {theme.type === 'variation' && (
          <div className="variation-indicator">
            <Copy size={14} />
            <span>Variation</span>
          </div>
        )}

        {/* Color preview */}
        <div className="color-preview">
          {previewColors.slice(0, 4).map((color, index) => (
            <div 
              key={index}
              className="color-swatch"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Theme info */}
        {showInfo && (
          <div className="theme-info">
            <h3 className="theme-name">{theme.displayName}</h3>
            <p className="theme-category">{theme.category}</p>
            {hasVariations && (
              <p className="variations-count">
                {theme.variations!.length} variation{theme.variations!.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="theme-actions">
            {onPreview && (
              <button 
                className="action-btn preview" 
                onClick={handlePreviewClick}
                title="Preview theme"
              >
                <Eye size={16} />
              </button>
            )}
            
            {onEdit && theme.type !== 'variation' && (
              <button 
                className="action-btn edit" 
                onClick={handleEditClick}
                title="Edit theme"
              >
                <Edit3 size={16} />
              </button>
            )}

            {onCreateVariation && theme.type !== 'variation' && (
              <button 
                className="action-btn create-variation" 
                onClick={handleCreateVariationClick}
                title="Create variation"
              >
                <Plus size={16} />
              </button>
            )}
            
            {onApply && (
              <button 
                className="action-btn apply primary" 
                onClick={handleApplyClick}
                title="Apply theme"
              >
                <Palette size={16} />
                <span>Apply</span>
              </button>
            )}

            {hasVariations && showVariations && (
              <button 
                className="action-btn toggle-variations" 
                onClick={handleToggleVariations}
                title={showingVariations ? 'Hide variations' : 'Show variations'}
              >
                {showingVariations ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Variations list */}
      {hasVariations && showVariations && showingVariations && (
        <div className="variations-list">
          {theme.variations!.map((variation) => (
            <div 
              key={variation.id}
              className="variation-item"
              onClick={() => onSelectVariation?.(variation.id)}
            >
              <div className="variation-info">
                <span className="variation-name">{variation.displayName}</span>
                {variation.pageId && (
                  <span className="variation-page">for {variation.pageId}</span>
                )}
              </div>
              <button 
                className="variation-apply"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVariation?.(variation.id);
                }}
              >
                <Palette size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};