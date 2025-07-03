/**
 * Theme Selector Component
 * Provides a dropdown/modal for selecting and applying themes to the current page
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown, Settings, Eye } from 'lucide-react';
import { useDatabaseTheme } from '../runtime/DatabaseThemeProvider';
import { RuntimeTheme } from '../types/theme';

interface ThemeSelectorProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showPreview?: boolean;
  position?: 'left' | 'right';
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  size = 'medium',
  showLabel = true,
  showPreview = true,
  position = 'right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<RuntimeTheme | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    currentTheme,
    availableThemes,
    isLoading,
    error,
    applyTheme,
    pageId
  } = useDatabaseTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setPreviewTheme(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeSelect = async (theme: RuntimeTheme) => {
    try {
      await applyTheme(theme.id);
      setIsOpen(false);
      setPreviewTheme(null);
    } catch (error) {
      console.error('Failed to apply theme:', error);
    }
  };

  const handlePreview = (theme: RuntimeTheme) => {
    setPreviewTheme(theme);
  };

  const clearPreview = () => {
    setPreviewTheme(null);
  };

  const displayTheme = previewTheme || currentTheme;

  const sizeClasses = {
    small: 'theme-selector-sm',
    medium: 'theme-selector-md',
    large: 'theme-selector-lg'
  };

  const positionClasses = {
    left: 'dropdown-left',
    right: 'dropdown-right'
  };

  // Don't show error if we have themes (fallback working)
  if (error && availableThemes.length === 0) {
    return (
      <div className={`theme-selector error ${className}`}>
        <div className="theme-selector-error">
          <Palette size={16} />
          <span>Theme Error</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`theme-selector ${sizeClasses[size]} ${className}`}
      ref={dropdownRef}
    >
      <button
        className={`theme-selector-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        title={`Current theme: ${displayTheme?.displayName || 'Loading...'}`}
      >
        <div className="theme-indicator">
          {displayTheme && (
            <div 
              className="theme-color-preview"
              style={{ 
                backgroundColor: displayTheme.cssProperties['--color-primary'] || '#3b82f6'
              }}
            />
          )}
          <Palette size={size === 'small' ? 14 : 16} />
        </div>
        
        {showLabel && (
          <span className="theme-label">
            {isLoading ? 'Loading...' : displayTheme?.displayName || 'Select Theme'}
          </span>
        )}
        
        <ChevronDown 
          size={12} 
          className={`chevron ${isOpen ? 'rotated' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className={`theme-dropdown ${positionClasses[position]}`}>
          <div className="dropdown-header">
            <h4>Select Theme</h4>
            <div className="current-page-indicator">
              for <strong>{pageId}</strong>
            </div>
          </div>

          <div className="theme-list">
            {availableThemes.map((theme) => {
              const isSelected = currentTheme?.id === theme.id;
              const isPreviewing = previewTheme?.id === theme.id;
              
              return (
                <div
                  key={theme.id}
                  className={`theme-option ${isSelected ? 'selected' : ''} ${isPreviewing ? 'previewing' : ''}`}
                  onClick={() => handleThemeSelect(theme)}
                  onMouseEnter={() => showPreview && handlePreview(theme)}
                  onMouseLeave={() => showPreview && clearPreview()}
                >
                  <div className="theme-option-preview">
                    <div className="theme-colors">
                      <div
                        className="color-dot primary"
                        style={{ backgroundColor: theme.cssProperties['--color-primary'] }}
                      />
                      <div
                        className="color-dot secondary"
                        style={{ backgroundColor: theme.cssProperties['--color-secondary'] }}
                      />
                      <div
                        className="color-dot surface"
                        style={{ backgroundColor: theme.cssProperties['--color-surface'] }}
                      />
                    </div>
                    
                    {isSelected && (
                      <div className="selected-indicator">
                        <Check size={12} />
                      </div>
                    )}
                    
                    {showPreview && (
                      <button
                        className="preview-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(theme);
                        }}
                        title="Preview theme"
                      >
                        <Eye size={12} />
                      </button>
                    )}
                  </div>

                  <div className="theme-option-info">
                    <div className="theme-name">{theme.displayName}</div>
                    <div className={`theme-category ${theme.category}`}>
                      {theme.category}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="dropdown-footer">
            <button
              className="btn-secondary small"
              onClick={() => {
                setIsOpen(false);
                // Navigate to theme gallery
                window.location.href = '/themes';
              }}
            >
              <Settings size={12} />
              Theme Gallery
            </button>
          </div>
        </div>
      )}
    </div>
  );
};