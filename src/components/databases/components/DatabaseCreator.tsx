/**
 * Database Creator Component
 * Provides interface for creating new databases with initial schema
 */

'use client';

import React, { useState } from 'react';
import { Database, Plus, X, Save, AlertCircle } from 'lucide-react';
import { Database as DatabaseType } from '../types';
import { ColumnDefinition } from '../api/table-creator';

export interface DatabaseCreatorProps {
  onDatabaseCreated: () => void;
  onCancel: () => void;
  createDatabase: (database: Omit<DatabaseType, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; data?: DatabaseType; error?: string }>;
}

interface InitialTable {
  name: string;
  columns: ColumnDefinition[];
}

export const DatabaseCreator: React.FC<DatabaseCreatorProps> = ({
  onDatabaseCreated,
  onCancel,
  createDatabase
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'custom' as DatabaseType['type'],
  });
  
  const [createInitialTable, setCreateInitialTable] = useState(false);
  const [initialTable, setInitialTable] = useState<InitialTable>({
    name: 'items',
    columns: [
      {
        column_name: 'id',
        data_type: 'TEXT',
        is_primary_key: true,
        is_nullable: false,
      },
      {
        column_name: 'name',
        data_type: 'TEXT',
        is_primary_key: false,
        is_nullable: false,
      },
      {
        column_name: 'description',
        data_type: 'TEXT',
        is_primary_key: false,
        is_nullable: true,
      }
    ]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Database title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newDatabase = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        status: 'active' as DatabaseType['status'],
        table_count: 0,
        record_count: 0,
        size: '0 B',
      };

      const result = await createDatabase(newDatabase);

      if (result.success) {
        onDatabaseCreated();
      } else {
        setError(result.error || 'Failed to create database');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addColumn = () => {
    setInitialTable(prev => ({
      ...prev,
      columns: [
        ...prev.columns,
        {
          column_name: '',
          data_type: 'TEXT',
          is_primary_key: false,
          is_nullable: true,
        }
      ]
    }));
  };

  const removeColumn = (index: number) => {
    setInitialTable(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index)
    }));
  };

  const updateColumn = (index: number, updates: Partial<ColumnDefinition>) => {
    setInitialTable(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => 
        i === index ? { ...col, ...updates } : col
      )
    }));
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Database</h3>
        <p className="text-gray-600">
          Create a new database to store and manage your data with real-time synchronization.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Database Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Database Name *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Customer Database"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Database Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as DatabaseType['type'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="custom">Custom</option>
                <option value="template">Template</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description of what this database will store..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Initial Table Setup */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Initial Table Setup</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={createInitialTable}
                onChange={(e) => setCreateInitialTable(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Create initial table</span>
            </label>
          </div>

          {createInitialTable && (
            <div className="space-y-4">
              <div>
                <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-1">
                  Table Name
                </label>
                <input
                  id="tableName"
                  type="text"
                  value={initialTable.name}
                  onChange={(e) => setInitialTable(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., customers, products, tasks"
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Columns
                  </label>
                  <button
                    type="button"
                    onClick={addColumn}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Column
                  </button>
                </div>

                <div className="space-y-2">
                  {initialTable.columns.map((column, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-white rounded border">
                      <input
                        type="text"
                        value={column.column_name}
                        onChange={(e) => updateColumn(index, { column_name: e.target.value })}
                        placeholder="Column name"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      
                      <select
                        value={column.data_type}
                        onChange={(e) => updateColumn(index, { data_type: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="TEXT">Text</option>
                        <option value="INTEGER">Integer</option>
                        <option value="DECIMAL">Decimal</option>
                        <option value="BOOLEAN">Boolean</option>
                        <option value="DATE">Date</option>
                        <option value="TIMESTAMPTZ">Timestamp</option>
                        <option value="JSONB">JSON</option>
                      </select>
                      
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={column.is_primary_key}
                          onChange={(e) => updateColumn(index, { is_primary_key: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        PK
                      </label>
                      
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={!column.is_nullable}
                          onChange={(e) => updateColumn(index, { is_nullable: !e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Required
                      </label>
                      
                      {initialTable.columns.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColumn(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Database
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DatabaseCreator;