/**
 * Schema Editor Component
 * Provides interface for managing tables and columns with real-time updates
 */

'use client';

import React, { useState } from 'react';
import { Plus, Table, Columns, Edit2, Trash2, Key, AlertCircle, Check, X } from 'lucide-react';
import { SchemaWithColumns } from '../hooks/useRealtimeSchemas';
import { ColumnDefinition } from '../api/table-creator';

export interface SchemaEditorProps {
  databaseId: string;
  schemas: SchemaWithColumns[];
  isLoading: boolean;
  error: string | null;
  selectedTableName: string | null;
  onCreateTable: (databaseId: string, tableName: string, columns: ColumnDefinition[]) => Promise<{ success: boolean; error?: string }>;
  onDeleteTable: (schemaId: string, tableName: string) => Promise<{ success: boolean; error?: string }>;
  onAddColumn: (schemaId: string, column: ColumnDefinition) => Promise<{ success: boolean; error?: string }>;
  onUpdateColumn: (columnId: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  onDeleteColumn: (columnId: string, tableName: string) => Promise<{ success: boolean; error?: string }>;
  onTableSelect: (tableName: string) => void;
}

interface NewTable {
  name: string;
  columns: ColumnDefinition[];
}

export const SchemaEditor: React.FC<SchemaEditorProps> = ({
  databaseId,
  schemas,
  isLoading,
  error,
  selectedTableName,
  onCreateTable,
  onDeleteTable,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  onTableSelect
}) => {
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const [newTable, setNewTable] = useState<NewTable>({
    name: '',
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
      }
    ]
  });

  const [newColumn, setNewColumn] = useState<ColumnDefinition>({
    column_name: '',
    data_type: 'TEXT',
    is_primary_key: false,
    is_nullable: true,
  });

  const handleCreateTable = async () => {
    if (!newTable.name.trim()) {
      setOperationError('Table name is required');
      return;
    }

    setIsSubmitting(true);
    setOperationError(null);

    try {
      const result = await onCreateTable(databaseId, newTable.name, newTable.columns);
      
      if (result.success) {
        setShowCreateTable(false);
        setNewTable({
          name: '',
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
            }
          ]
        });
        onTableSelect(newTable.name);
      } else {
        setOperationError(result.error || 'Failed to create table');
      }
    } catch (err) {
      setOperationError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTable = async (schema: SchemaWithColumns) => {
    if (!confirm(`Are you sure you want to delete table "${schema.table_name}"? This action cannot be undone.`)) {
      return;
    }

    setIsSubmitting(true);
    setOperationError(null);

    try {
      const result = await onDeleteTable(schema.id, schema.table_name);
      
      if (!result.success) {
        setOperationError(result.error || 'Failed to delete table');
      }
    } catch (err) {
      setOperationError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddColumn = async (schemaId: string) => {
    if (!newColumn.column_name.trim()) {
      setOperationError('Column name is required');
      return;
    }

    setIsSubmitting(true);
    setOperationError(null);

    try {
      const result = await onAddColumn(schemaId, newColumn);
      
      if (result.success) {
        setShowAddColumn(null);
        setNewColumn({
          column_name: '',
          data_type: 'TEXT',
          is_primary_key: false,
          is_nullable: true,
        });
      } else {
        setOperationError(result.error || 'Failed to add column');
      }
    } catch (err) {
      setOperationError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteColumn = async (columnId: string, tableName: string) => {
    if (!confirm(`Are you sure you want to delete this column? This action cannot be undone.`)) {
      return;
    }

    setIsSubmitting(true);
    setOperationError(null);

    try {
      const result = await onDeleteColumn(columnId, tableName);
      
      if (!result.success) {
        setOperationError(result.error || 'Failed to delete column');
      }
    } catch (err) {
      setOperationError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTableColumn = () => {
    setNewTable(prev => ({
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

  const removeTableColumn = (index: number) => {
    setNewTable(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index)
    }));
  };

  const updateTableColumn = (index: number, updates: Partial<ColumnDefinition>) => {
    setNewTable(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => 
        i === index ? { ...col, ...updates } : col
      )
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading schema...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Database Schema</h3>
        <button
          onClick={() => setShowCreateTable(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Table
        </button>
      </div>

      {operationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-700">{operationError}</span>
          </div>
        </div>
      )}

      {/* Create Table Modal */}
      {showCreateTable && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Create New Table</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Name
              </label>
              <input
                type="text"
                value={newTable.name}
                onChange={(e) => setNewTable(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., customers, products, orders"
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Columns
                </label>
                <button
                  type="button"
                  onClick={addTableColumn}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Column
                </button>
              </div>

              <div className="space-y-2">
                {newTable.columns.map((column, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                    <input
                      type="text"
                      value={column.column_name}
                      onChange={(e) => updateTableColumn(index, { column_name: e.target.value })}
                      placeholder="Column name"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    
                    <select
                      value={column.data_type}
                      onChange={(e) => updateTableColumn(index, { data_type: e.target.value })}
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
                        onChange={(e) => updateTableColumn(index, { is_primary_key: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      PK
                    </label>
                    
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={!column.is_nullable}
                        onChange={(e) => updateTableColumn(index, { is_nullable: !e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Required
                    </label>
                    
                    {newTable.columns.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTableColumn(index)}
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

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => setShowCreateTable(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTable}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Check className="h-4 w-4" />
              )}
              Create Table
            </button>
          </div>
        </div>
      )}

      {/* Tables List */}
      {schemas.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Table className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tables Found</h3>
          <p className="text-gray-500 mb-4">
            Create your first table to start building your database schema.
          </p>
          <button
            onClick={() => setShowCreateTable(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create First Table
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {schemas.map((schema) => (
            <div
              key={schema.id}
              className={`bg-white border rounded-lg p-6 ${
                selectedTableName === schema.table_name 
                  ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => onTableSelect(schema.table_name)}
                >
                  <Table className="h-5 w-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900">{schema.table_name}</h4>
                  <span className="text-sm text-gray-500">
                    {schema.columns.length} columns
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddColumn(schema.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Add Column
                  </button>
                  <button
                    onClick={() => handleDeleteTable(schema)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete Table
                  </button>
                </div>
              </div>

              {/* Columns */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Column</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Type</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Constraints</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schema.columns.map((column) => (
                      <tr key={column.id} className="border-b border-gray-100">
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{column.name}</span>
                            {column.primary_key && (
                              <Key className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                        </td>
                        <td className="py-2">
                          <span className="text-sm text-gray-600">{column.type}</span>
                        </td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            {!column.nullable && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                                NOT NULL
                              </span>
                            )}
                            {column.unique && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                UNIQUE
                              </span>
                            )}
                            {column.default_value && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                DEFAULT
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => handleDeleteColumn(column.id, schema.table_name)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Column Form */}
              {showAddColumn === schema.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                  <h5 className="font-medium text-gray-900 mb-3">Add New Column</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={newColumn.column_name}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, column_name: e.target.value }))}
                      placeholder="Column name"
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    
                    <select
                      value={newColumn.data_type}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, data_type: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="TEXT">Text</option>
                      <option value="INTEGER">Integer</option>
                      <option value="DECIMAL">Decimal</option>
                      <option value="BOOLEAN">Boolean</option>
                      <option value="DATE">Date</option>
                      <option value="TIMESTAMPTZ">Timestamp</option>
                      <option value="JSONB">JSON</option>
                    </select>
                    
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={newColumn.is_primary_key}
                          onChange={(e) => setNewColumn(prev => ({ ...prev, is_primary_key: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        PK
                      </label>
                      
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={!newColumn.is_nullable}
                          onChange={(e) => setNewColumn(prev => ({ ...prev, is_nullable: !e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Required
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddColumn(schema.id)}
                        disabled={isSubmitting}
                        className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddColumn(null)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemaEditor;