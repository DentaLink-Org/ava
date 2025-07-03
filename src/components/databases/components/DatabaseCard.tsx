/**
 * DatabaseCard Component
 * Displays a single database card with management actions
 */

import React, { useState } from 'react';
import { Database, Trash2, Edit, ExternalLink } from 'lucide-react';
import { PageTheme } from "@/components/_shared/runtime/types";

export interface DatabaseCardProps {
  database: {
    id: string;
    title: string;
    description?: string;
    created_at: string;
    updated_at: string;
    table_count?: number;
    record_count?: number;
  };
  theme: PageTheme;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onOpen?: (id: string) => void;
}

export const DatabaseCard: React.FC<DatabaseCardProps> = ({
  database,
  theme,
  onEdit,
  onDelete,
  onOpen
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete the database "${database.title}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      if (onDelete) {
        await onDelete(database.id);
      }
    } catch (error) {
      console.error('Error deleting database:', error);
      alert('Failed to delete database. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(database.id);
    }
  };

  const handleOpen = () => {
    if (onOpen) {
      onOpen(database.id);
    }
  };

  return (
    <div 
      className="database-card"
      onClick={handleOpen}
      style={{
        '--color-primary': theme.colors.primary,
        '--color-secondary': theme.colors.secondary,
        '--color-background': theme.colors.background,
        '--color-surface': theme.colors.surface,
        '--color-text': theme.colors.text,
        '--color-textSecondary': theme.colors.textSecondary,
        '--color-border': '#e5e7eb', // Add default border color
        '--color-hover': 'rgba(0, 0, 0, 0.05)', // Add default hover color
        '--spacing-base': theme.spacing.base,
        '--spacing-small': theme.spacing.small || theme.spacing.base / 2,
        '--spacing-large': theme.spacing.large || theme.spacing.base * 1.5,
      } as React.CSSProperties}
    >
      <div className="database-card-header">
        <Database className="database-card-icon" />
        <div className="database-card-actions">
          <button
            onClick={handleEdit}
            className="database-card-action-btn edit"
            title="Edit database"
          >
            <Edit className="action-icon" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="database-card-action-btn delete"
            title="Delete database"
          >
            <Trash2 className="action-icon" />
          </button>
        </div>
      </div>

      <div className="database-card-body">
        <h3 className="database-card-title">{database.title}</h3>
        {database.description && (
          <p className="database-card-description">{database.description}</p>
        )}
      </div>

      <div className="database-card-stats">
        {database.table_count !== undefined && (
          <div className="stat-item">
            <span className="stat-value">{database.table_count}</span>
            <span className="stat-label">Tables</span>
          </div>
        )}
        {database.record_count !== undefined && (
          <div className="stat-item">
            <span className="stat-value">{database.record_count.toLocaleString()}</span>
            <span className="stat-label">Records</span>
          </div>
        )}
      </div>

      <div className="database-card-footer">
        <span className="database-card-date">
          Updated {new Date(database.updated_at).toLocaleDateString()}
        </span>
        <ExternalLink className="open-icon" />
      </div>
    </div>
  );
};