/**
 * Theme Grid Component
 * Displays themes in a responsive grid layout with filtering and search
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { ThemeGridProps } from '../types';
import { ThemePreviewCard } from './ThemePreviewCard';
import { useDatabaseTheme } from '../../_shared/runtime/DatabaseThemeProvider';

export const ThemeGrid: React.FC<ThemeGridProps> = ({
  themes,
  selectedThemeId,
  selectedPageId,
  columns = 3,
  showPreview = true,
  enableQuickApply = true,
  onThemeSelect,
  onThemeApply,
  onThemePreview,
  className = ''
}) => {
  const { availableThemes, applyTheme, isLoading } = useDatabaseTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loadingThemes, setLoadingThemes] = useState<Set<string>>(new Set());

  // Use provided themes or fall back to available themes
  const displayThemes = themes || availableThemes;

  // Filter and search themes
  const filteredThemes = useMemo(() => {
    let filtered = displayThemes;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(theme => theme.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(theme => 
        theme.displayName.toLowerCase().includes(query) ||
        theme.name.toLowerCase().includes(query) ||
        theme.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [displayThemes, selectedCategory, searchQuery]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(displayThemes.map(theme => theme.category))];
    return cats;
  }, [displayThemes]);

  const handleThemeSelect = (themeId: string) => {
    onThemeSelect?.(themeId);
  };

  const handleThemeApply = async (themeId: string) => {
    if (!selectedPageId || !enableQuickApply) return;

    setLoadingThemes(prev => new Set(prev).add(themeId));
    
    try {
      await applyTheme(themeId);
      onThemeApply?.(themeId, selectedPageId);
    } catch (error) {
      console.error('Failed to apply theme:', error);
    } finally {
      setLoadingThemes(prev => {
        const next = new Set(prev);
        next.delete(themeId);
        return next;
      });
    }
  };

  const handleThemePreview = (themeId: string) => {
    onThemePreview?.(themeId);
  };

  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`
  };

  return (
    <div className={`theme-grid-container ${className}`}>
      {/* Controls */}
      <div className="theme-grid-controls">
        <div className="controls-left">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-dropdown">
            <Filter size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : 
                   category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="controls-right">
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Grid size={16} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>
          
          <div className="theme-count">
            {filteredThemes.length} theme{filteredThemes.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Selected page indicator */}
      {selectedPageId && enableQuickApply && (
        <div className="selected-page-indicator">
          <span>Applying themes to: <strong>{selectedPageId}</strong></span>
        </div>
      )}

      {/* Theme grid */}
      <div className={`theme-grid ${viewMode}`} style={gridStyle}>
        {filteredThemes.map(theme => (
          <ThemePreviewCard
            key={theme.id}
            theme={theme}
            isSelected={selectedThemeId === theme.id}
            isLoading={loadingThemes.has(theme.id)}
            size={viewMode === 'list' ? 'small' : 'medium'}
            showInfo={true}
            showActions={true}
            onSelect={() => handleThemeSelect(theme.id)}
            onApply={enableQuickApply ? () => handleThemeApply(theme.id) : undefined}
            onPreview={showPreview ? () => handleThemePreview(theme.id) : undefined}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredThemes.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={48} />
          </div>
          <h3>No themes found</h3>
          <p>
            {searchQuery.trim() 
              ? `No themes match "${searchQuery}"`
              : 'No themes available in this category'
            }
          </p>
          {searchQuery.trim() && (
            <button
              className="btn secondary"
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && filteredThemes.length === 0 && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading themes...</p>
        </div>
      )}
    </div>
  );
};