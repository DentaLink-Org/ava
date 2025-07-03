/**
 * Theme Customizer Component
 * Allows users to create and edit custom themes
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Palette, Plus, Settings, Save, RefreshCw, Trash2 } from 'lucide-react';
import { useDatabaseTheme } from '../../_shared/runtime/DatabaseThemeProvider';

export interface ThemeCustomizerProps {
  allowCustomThemes?: boolean;
  showAdvancedOptions?: boolean;
  className?: string;
}

interface ColorInput {
  key: string;
  label: string;
  value: string;
  category: 'primary' | 'secondary' | 'neutral';
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  allowCustomThemes = true,
  showAdvancedOptions = false,
  className = ''
}) => {
  const { currentTheme, availableThemes, isLoading } = useDatabaseTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [customTheme, setCustomTheme] = useState<Record<string, string>>({});
  const [themeName, setThemeName] = useState('');

  // Default color inputs based on common theme properties
  const colorInputs: ColorInput[] = [
    { key: '--color-primary', label: 'Primary', value: '#3b82f6', category: 'primary' },
    { key: '--color-secondary', label: 'Secondary', value: '#6366f1', category: 'primary' },
    { key: '--color-accent', label: 'Accent', value: '#f59e0b', category: 'primary' },
    { key: '--color-background', label: 'Background', value: '#ffffff', category: 'neutral' },
    { key: '--color-surface', label: 'Surface', value: '#f8fafc', category: 'neutral' },
    { key: '--color-text', label: 'Text', value: '#1f2937', category: 'neutral' },
    { key: '--color-text-secondary', label: 'Secondary Text', value: '#6b7280', category: 'neutral' },
    { key: '--color-border', label: 'Border', value: '#e5e7eb', category: 'neutral' },
  ];

  // Initialize custom theme from current theme
  const initializeCustomTheme = useCallback(() => {
    if (currentTheme) {
      const colors: Record<string, string> = {};
      colorInputs.forEach(input => {
        colors[input.key] = currentTheme.cssProperties[input.key] || input.value;
      });
      setCustomTheme(colors);
      setThemeName(`${currentTheme.displayName} (Custom)`);
    } else {
      // Use default values
      const colors: Record<string, string> = {};
      colorInputs.forEach(input => {
        colors[input.key] = input.value;
      });
      setCustomTheme(colors);
      setThemeName('Custom Theme');
    }
  }, [currentTheme]);

  const handleColorChange = (key: string, value: string) => {
    setCustomTheme(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStartEditing = () => {
    initializeCustomTheme();
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setCustomTheme({});
    setThemeName('');
  };

  const handleSaveTheme = async () => {
    // For now, just show a message since we're working with test data
    console.log('Custom theme would be saved:', { name: themeName, colors: customTheme });
    alert(`Custom theme "${themeName}" would be saved to database`);
    setIsEditing(false);
  };

  const handleResetToDefault = () => {
    initializeCustomTheme();
  };

  if (!allowCustomThemes) {
    return (
      <div className={`theme-customizer disabled ${className}`}>
        <div className="customizer-disabled">
          <Settings size={48} />
          <h3>Theme Customization</h3>
          <p>Custom theme creation is currently disabled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`theme-customizer ${className}`}>
      <div className="customizer-header">
        <div className="header-info">
          <Palette size={24} />
          <div>
            <h3>Theme Customizer</h3>
            <p>Create and edit custom themes</p>
          </div>
        </div>
        
        {!isEditing ? (
          <button
            className="btn-primary"
            onClick={handleStartEditing}
            disabled={isLoading}
          >
            <Plus size={16} />
            Create Custom Theme
          </button>
        ) : (
          <div className="editor-actions">
            <button
              className="btn-secondary"
              onClick={handleCancelEditing}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSaveTheme}
            >
              <Save size={16} />
              Save Theme
            </button>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="theme-editor">
          <div className="editor-form">
            <div className="form-group">
              <label htmlFor="theme-name">Theme Name</label>
              <input
                id="theme-name"
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="Enter theme name"
              />
            </div>

            <div className="color-groups">
              {['primary', 'secondary', 'neutral'].map(category => (
                <div key={category} className="color-group">
                  <h4>{category.charAt(0).toUpperCase() + category.slice(1)} Colors</h4>
                  <div className="color-inputs">
                    {colorInputs
                      .filter(input => input.category === category)
                      .map(input => (
                        <div key={input.key} className="color-input">
                          <label htmlFor={input.key}>{input.label}</label>
                          <div className="color-input-wrapper">
                            <input
                              id={input.key}
                              type="color"
                              value={customTheme[input.key] || input.value}
                              onChange={(e) => handleColorChange(input.key, e.target.value)}
                            />
                            <input
                              type="text"
                              value={customTheme[input.key] || input.value}
                              onChange={(e) => handleColorChange(input.key, e.target.value)}
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="editor-tools">
              <button
                className="btn-secondary"
                onClick={handleResetToDefault}
              >
                <RefreshCw size={16} />
                Reset to Current Theme
              </button>
            </div>

            {showAdvancedOptions && (
              <div className="advanced-options">
                <h4>Advanced Options</h4>
                <div className="advanced-controls">
                  <div className="form-group">
                    <label htmlFor="theme-category">Category</label>
                    <select id="theme-category">
                      <option value="custom">Custom</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="colorful">Colorful</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="theme-author">Author</label>
                    <input
                      id="theme-author"
                      type="text"
                      placeholder="Your name"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="theme-preview">
            <h4>Preview</h4>
            <div 
              className="preview-area"
              style={{
                backgroundColor: customTheme['--color-background'],
                color: customTheme['--color-text'],
                border: `2px solid ${customTheme['--color-border']}`
              }}
            >
              <div 
                className="preview-header"
                style={{ backgroundColor: customTheme['--color-surface'] }}
              >
                <h5 style={{ color: customTheme['--color-primary'] }}>
                  Theme Preview
                </h5>
                <p style={{ color: customTheme['--color-text-secondary'] }}>
                  This is how your theme will look
                </p>
              </div>
              
              <div className="preview-content">
                <button 
                  style={{ 
                    backgroundColor: customTheme['--color-primary'],
                    color: '#ffffff'
                  }}
                  className="preview-btn"
                >
                  Primary Button
                </button>
                <button 
                  style={{ 
                    backgroundColor: customTheme['--color-secondary'],
                    color: '#ffffff'
                  }}
                  className="preview-btn"
                >
                  Secondary Button
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .theme-customizer {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 12px;
          padding: 24px;
          margin: 16px 0;
        }

        .customizer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-info h3 {
          margin: 0;
          color: var(--color-text, #1f2937);
        }

        .header-info p {
          margin: 4px 0 0 0;
          color: var(--color-text-secondary, #6b7280);
          font-size: 14px;
        }

        .editor-actions {
          display: flex;
          gap: 12px;
        }

        .theme-editor {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
        }

        .color-groups {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .color-group h4 {
          margin: 0 0 12px 0;
          color: var(--color-text, #1f2937);
          font-size: 16px;
        }

        .color-inputs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .color-input {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .color-input label {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text, #1f2937);
        }

        .color-input-wrapper {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .color-input-wrapper input[type="color"] {
          width: 40px;
          height: 32px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .color-input-wrapper input[type="text"] {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 6px;
          font-family: monospace;
          font-size: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text, #1f2937);
        }

        .form-group input,
        .form-group select {
          padding: 8px 12px;
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 6px;
          font-size: 14px;
        }

        .theme-preview {
          position: sticky;
          top: 20px;
        }

        .theme-preview h4 {
          margin: 0 0 16px 0;
          color: var(--color-text, #1f2937);
        }

        .preview-area {
          border-radius: 8px;
          padding: 16px;
          min-height: 200px;
        }

        .preview-header {
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .preview-header h5 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }

        .preview-header p {
          margin: 0;
          font-size: 14px;
        }

        .preview-content {
          display: flex;
          gap: 12px;
        }

        .preview-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-primary,
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: var(--color-primary, #3b82f6);
          color: white;
        }

        .btn-secondary {
          background: var(--color-surface, #f8fafc);
          color: var(--color-text, #1f2937);
          border: 1px solid var(--color-border, #e5e7eb);
        }

        .customizer-disabled {
          text-align: center;
          padding: 48px 24px;
          color: var(--color-text-secondary, #6b7280);
        }

        .customizer-disabled h3 {
          margin: 16px 0 8px 0;
          color: var(--color-text, #1f2937);
        }

        @media (max-width: 768px) {
          .theme-editor {
            grid-template-columns: 1fr;
          }
          
          .color-inputs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};