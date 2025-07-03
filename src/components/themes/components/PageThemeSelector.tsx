/**
 * Page Theme Selector Component
 * Allows users to select which page to customize and shows current theme assignments
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, Database, CheckSquare, Palette, Check } from 'lucide-react';
import { PageThemeSelectorProps, PageInfo } from '../types';
import { useDatabaseTheme } from '../../_shared/runtime/DatabaseThemeProvider';
import { useThemeManager } from '../../_shared/hooks/useThemeManager';

const pageIcons = {
  dashboard: Monitor,
  databases: Database,
  tasks: CheckSquare
};

export const PageThemeSelector: React.FC<PageThemeSelectorProps> = ({
  pages,
  selectedPageId,
  onPageSelect,
  onThemeChange,
  className = ''
}) => {
  const [pageThemes, setPageThemes] = useState<Record<string, string>>({});
  const { getPageTheme } = useThemeManager();
  const { availableThemes } = useDatabaseTheme();

  // Load current theme for each page
  useEffect(() => {
    const loadPageThemes = async () => {
      const themes: Record<string, string> = {};
      
      for (const page of pages) {
        try {
          const theme = await getPageTheme(page.id);
          themes[page.id] = theme.id;
        } catch (error) {
          console.error(`Failed to load theme for page ${page.id}:`, error);
        }
      }
      
      setPageThemes(themes);
    };

    loadPageThemes();
  }, [pages, getPageTheme]);

  const handlePageSelect = (pageId: string) => {
    onPageSelect?.(pageId);
  };

  const getThemeName = (themeId: string): string => {
    const theme = availableThemes.find(t => t.id === themeId);
    return theme?.displayName || 'Unknown Theme';
  };

  const getThemeCategory = (themeId: string): string => {
    const theme = availableThemes.find(t => t.id === themeId);
    return theme?.category || 'unknown';
  };

  return (
    <div className={`page-theme-selector ${className}`}>
      <div className="selector-header">
        <h3>Select Page to Customize</h3>
        <p>Choose which page you want to apply themes to</p>
      </div>
      
      <div className="page-grid">
        {pages.map((page) => {
          const IconComponent = pageIcons[page.id as keyof typeof pageIcons] || Monitor;
          const isSelected = selectedPageId === page.id;
          const currentThemeId = pageThemes[page.id];
          const themeName = currentThemeId ? getThemeName(currentThemeId) : 'Default';
          const themeCategory = currentThemeId ? getThemeCategory(currentThemeId) : 'default';
          
          return (
            <div
              key={page.id}
              className={`page-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handlePageSelect(page.id)}
            >
              <div className="page-card-header">
                <div className="page-icon">
                  <IconComponent size={24} />
                </div>
                {isSelected && (
                  <div className="selected-indicator">
                    <Check size={16} />
                  </div>
                )}
              </div>
              
              <div className="page-card-content">
                <h4>{page.name}</h4>
                <p>{page.description}</p>
              </div>
              
              <div className="page-card-footer">
                <div className="current-theme">
                  <div className="theme-indicator">
                    <Palette size={14} />
                  </div>
                  <div className="theme-info">
                    <span className="theme-name">{themeName}</span>
                    <span className={`theme-category ${themeCategory}`}>
                      {themeCategory}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};