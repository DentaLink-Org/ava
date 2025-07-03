/**
 * DatabaseGrid Component
 * Displays database cards in a responsive grid layout with real-time updates
 */

'use client';

import React from 'react';
import { Database, Plus, Server } from 'lucide-react';
import { Database as DatabaseType } from '../types';
import { DatabaseCard } from './DatabaseCard';
import { PageTheme } from "@/components/_shared/runtime/types";

export interface DatabaseGridProps {
  databases: DatabaseType[];
  isLoading: boolean;
  theme: PageTheme;
  onEditDatabase: (databaseId: string) => void;
  onDeleteDatabase: (databaseId: string) => Promise<{ success: boolean; error?: string }>;
}

export const DatabaseGrid: React.FC<DatabaseGridProps> = ({
  databases,
  isLoading,
  theme,
  onEditDatabase,
  onDeleteDatabase
}) => {

  if (isLoading) {
    return (
      <div className="database-grid-loading">
        <div className="loading-icon">
          <Database />
        </div>
        <span style={{ color: 'var(--color-textSecondary)' }}>Loading databases...</span>
      </div>
    );
  }

  if (databases.length === 0) {
    return (
      <div className="database-grid-empty">
        <Database className="empty-icon" />
        <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--color-text)' }}>No Databases Found</h3>
        <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--color-textSecondary)' }}>
          Get started by creating your first database to store and manage your data with real-time synchronization.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="header-action-btn btn-primary">
            <Plus className="h-5 w-5" />
            Create Your First Database
          </button>
          <button className="header-action-btn btn-ghost">
            <Server className="h-5 w-5" />
            Import Existing Database
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="database-grid" style={{ '--columns': 4, '--gap': '1.5rem' } as React.CSSProperties}>
      {databases.map((database) => (
        <DatabaseCard
          key={database.id}
          database={database}
          theme={theme}
          onEdit={onEditDatabase}
          onDelete={async (id) => {
            const result = await onDeleteDatabase(id);
            if (!result.success) {
              alert(`Failed to delete database: ${result.error}`);
            }
          }}
          onOpen={onEditDatabase}
        />
      ))}
    </div>
  );
};