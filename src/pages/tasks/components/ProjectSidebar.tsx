import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  Star, 
  User, 
  BarChart, 
  Plus, 
  MoreHorizontal,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import type { Project, SpecialView } from '../types';
import type { PageTheme } from '../../_shared/runtime/types';

interface ProjectSidebarProps {
  projects: Project[];
  selectedProject?: string;
  onProjectSelect: (projectId: string) => void;
  onProjectCreate: () => void;
  onProjectEdit: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
  onProjectToggleFavorite: (projectId: string) => void;
  showFavorites?: boolean;
  showAllProjects?: boolean;
  showSpecialViews?: boolean;
  enableProjectActions?: boolean;
  specialViews?: SpecialView[];
  theme: PageTheme;
}

export function ProjectSidebar({
  projects,
  selectedProject,
  onProjectSelect,
  onProjectCreate,
  onProjectEdit,
  onProjectDelete,
  onProjectToggleFavorite,
  showFavorites = true,
  showAllProjects = true,
  showSpecialViews = true,
  enableProjectActions = true,
  specialViews = [],
  theme
}: ProjectSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    special: true,
    favorites: true,
    projects: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'folder': return Folder;
      case 'user': return User;
      case 'bar-chart': return BarChart;
      default: return Folder;
    }
  };

  const defaultSpecialViews: SpecialView[] = [
    {
      id: 'all-projects',
      label: 'All Projects',
      icon: 'folder'
    },
    {
      id: 'assigned-to-me',
      label: 'Assigned to Me',
      icon: 'user'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'bar-chart'
    }
  ];

  const viewsToShow = specialViews.length > 0 ? specialViews : defaultSpecialViews;
  const favoriteProjects = projects.filter(p => p.isFavorite && !p.isArchived);
  const regularProjects = projects.filter(p => !p.isFavorite && !p.isArchived);

  const renderSidebarItem = (
    id: string,
    label: string,
    icon: React.ReactNode,
    count?: number,
    color?: string,
    isActive?: boolean,
    onClick?: () => void
  ) => (
    <div
      className={`sidebar-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{
        backgroundColor: isActive ? theme.colors.primary : 'transparent',
        color: isActive ? 'white' : theme.colors.text
      }}
    >
      {color && (
        <div 
          className="project-color-indicator" 
          style={{ backgroundColor: color }}
        />
      )}
      <div className="sidebar-item-icon">{icon}</div>
      <span className="sidebar-item-label">{label}</span>
      {count !== undefined && (
        <span 
          className="sidebar-item-count"
          style={{
            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb',
            color: isActive ? 'white' : theme.colors.textSecondary
          }}
        >
          {count}
        </span>
      )}
    </div>
  );

  const renderProjectItem = (project: Project) => {
    const isSelected = selectedProject === project.id;
    const taskCount = project.stats.activeTasks;
    
    return (
      <div key={project.id} className="project-item">
        {renderSidebarItem(
          project.id,
          project.name,
          project.isFavorite ? <Star size={16} fill="currentColor" /> : <Folder size={16} />,
          taskCount,
          project.color,
          isSelected,
          () => onProjectSelect(project.id)
        )}
        
        {enableProjectActions && (
          <div className="project-actions">
            <button
              className="btn ghost sm"
              onClick={(e) => {
                e.stopPropagation();
                onProjectToggleFavorite(project.id);
              }}
              title={project.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={12} fill={project.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              className="btn ghost sm"
              onClick={(e) => {
                e.stopPropagation();
                onProjectEdit(project);
              }}
              title="Project options"
            >
              <MoreHorizontal size={12} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="project-sidebar" style={{ backgroundColor: theme.colors.surface }}>
      {/* Special Views Section */}
      {showSpecialViews && (
        <div className="sidebar-section">
          <div 
            className="sidebar-section-header"
            onClick={() => toggleSection('special')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {expandedSections.special ? (
              <ChevronDown size={12} color={theme.colors.textSecondary} />
            ) : (
              <ChevronRight size={12} color={theme.colors.textSecondary} />
            )}
            <h3 className="sidebar-section-title" style={{ color: theme.colors.textSecondary }}>
              Views
            </h3>
          </div>
          
          {expandedSections.special && (
            <div className="sidebar-items">
              {viewsToShow.map(view => {
                const IconComponent = getIconComponent(view.icon);
                const isActive = selectedProject === view.id;
                
                return renderSidebarItem(
                  view.id,
                  view.label,
                  <IconComponent size={16} />,
                  undefined,
                  undefined,
                  isActive,
                  () => onProjectSelect(view.id)
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Favorites Section */}
      {showFavorites && favoriteProjects.length > 0 && (
        <div className="sidebar-section">
          <div 
            className="sidebar-section-header"
            onClick={() => toggleSection('favorites')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {expandedSections.favorites ? (
              <ChevronDown size={12} color={theme.colors.textSecondary} />
            ) : (
              <ChevronRight size={12} color={theme.colors.textSecondary} />
            )}
            <h3 className="sidebar-section-title" style={{ color: theme.colors.textSecondary }}>
              Favorites
            </h3>
          </div>
          
          {expandedSections.favorites && (
            <div className="sidebar-items">
              {favoriteProjects.map(renderProjectItem)}
            </div>
          )}
        </div>
      )}

      {/* Projects Section */}
      {showAllProjects && (
        <div className="sidebar-section">
          <div 
            className="sidebar-section-header"
            onClick={() => toggleSection('projects')}
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {expandedSections.projects ? (
                <ChevronDown size={12} color={theme.colors.textSecondary} />
              ) : (
                <ChevronRight size={12} color={theme.colors.textSecondary} />
              )}
              <h3 className="sidebar-section-title" style={{ color: theme.colors.textSecondary }}>
                Projects ({projects.length})
              </h3>
            </div>
            
            <button
              className="btn ghost sm"
              onClick={(e) => {
                e.stopPropagation();
                onProjectCreate();
              }}
              title="Create new project"
            >
              <Plus size={12} />
            </button>
          </div>
          
          {expandedSections.projects && (
            <div className="sidebar-items">
              {regularProjects.map(renderProjectItem)}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="empty-state">
          <FolderOpen className="empty-state-icon" color={theme.colors.textSecondary} />
          <h4 className="empty-state-title" style={{ color: theme.colors.text }}>
            No Projects Yet
          </h4>
          <p className="empty-state-description" style={{ color: theme.colors.textSecondary }}>
            Create your first project to start organizing tasks
          </p>
          <button
            className="btn primary"
            onClick={onProjectCreate}
            style={{ backgroundColor: theme.colors.primary }}
          >
            <Plus size={16} />
            Create Project
          </button>
        </div>
      )}
    </div>
  );
}