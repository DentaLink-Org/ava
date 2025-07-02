/**
 * Data Manager Component
 * Provides complete CRUD operations with real-time synchronization and inline editing
 */

'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRealtimeTableData, TableRecord } from '../hooks/useRealtimeTableData';
import { SchemaWithColumns } from '../hooks/useRealtimeSchemas';

export interface DataManagerProps {
  databaseId: string;
  tableName: string;
  schema?: SchemaWithColumns;
  onTableSelect: (tableName: string) => void;
  availableTables: string[];
}

export const DataManager: React.FC<DataManagerProps> = ({
  databaseId,
  tableName,
  schema,
  onTableSelect,
  availableTables
}) => {
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<TableRecord>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState<TableRecord>({});
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    refetch,
    insertRecord,
    updateRecord,
    deleteRecord,
    setPage,
    setPageSize,
    search,
    sort
  } = useRealtimeTableData(tableName, databaseId, {
    pageSize: 25,
    searchColumns: schema?.columns.map(col => col.name) || [],
    trackHistory: true
  });

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    search(query);
  };

  const handleEdit = (record: TableRecord) => {
    setEditingRecord(record.id);
    setEditingData({ ...record });
  };

  const handleSave = async () => {
    if (!editingRecord) return;

    const result = await updateRecord(editingRecord, editingData);
    
    if (result.success) {
      setEditingRecord(null);
      setEditingData({});
    } else {
      alert(`Failed to update record: ${result.error}`);
    }
  };

  const handleCancel = () => {
    setEditingRecord(null);
    setEditingData({});
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    const result = await deleteRecord(id);
    
    if (!result.success) {
      alert(`Failed to delete record: ${result.error}`);
    }
  };

  const handleAdd = async () => {
    const result = await insertRecord(newRecord);
    
    if (result.success) {
      setShowAddForm(false);
      setNewRecord({});
    } else {
      alert(`Failed to add record: ${result.error}`);
    }
  };

  const initializeNewRecord = () => {
    const record: TableRecord = {};
    
    schema?.columns.forEach(col => {
      if (!col.primary_key) {
        if (col.type === 'INTEGER') {
          record[col.name] = 0;
        } else if (col.type === 'BOOLEAN') {
          record[col.name] = false;
        } else if (col.type === 'DATE') {
          record[col.name] = new Date().toISOString().split('T')[0];
        } else if (col.type === 'TIMESTAMPTZ') {
          record[col.name] = new Date().toISOString();
        } else {
          record[col.name] = '';
        }
      }
    });
    
    setNewRecord(record);
    setShowAddForm(true);
  };

  const formatCellValue = (value: any, columnType: string): string => {
    if (value === null || value === undefined) return '';
    
    if (columnType === 'TIMESTAMPTZ' && value) {
      return new Date(value).toLocaleString();
    }
    
    if (columnType === 'BOOLEAN') {
      return value ? 'true' : 'false';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  const getInputType = (columnType: string): string => {
    switch (columnType) {
      case 'INTEGER':
      case 'DECIMAL':
        return 'number';
      case 'DATE':
        return 'date';
      case 'TIMESTAMPTZ':
        return 'datetime-local';
      case 'BOOLEAN':
        return 'checkbox';
      default:
        return 'text';
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-red-700">Error loading data: {error}</div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">No schema found for table: {tableName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={tableName}
            onChange={(e) => onTableSelect(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {availableTables.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={initializeNewRecord}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Record
          </button>
        </div>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Add New Record</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schema.columns
              .filter(col => !col.primary_key)
              .map(column => (
                <div key={column.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {column.name}
                    {!column.nullable && <span className="text-red-500">*</span>}
                  </label>
                  
                  {column.type === 'BOOLEAN' ? (
                    <input
                      type="checkbox"
                      checked={!!newRecord[column.name]}
                      onChange={(e) => setNewRecord(prev => ({ 
                        ...prev, 
                        [column.name]: e.target.checked 
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type={getInputType(column.type)}
                      value={newRecord[column.name] || ''}
                      onChange={(e) => setNewRecord(prev => ({ 
                        ...prev, 
                        [column.name]: e.target.value 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required={!column.nullable}
                    />
                  )}
                </div>
              ))}
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
              Add Record
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading data...</span>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
          {data && data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {schema.columns.map(column => (
                        <th
                          key={column.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center gap-2">
                            {column.name}
                            {column.primary_key && (
                              <span className="text-xs text-blue-600">(PK)</span>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        {schema.columns.map(column => (
                          <td key={column.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {editingRecord === record.id ? (
                              column.type === 'BOOLEAN' ? (
                                <input
                                  type="checkbox"
                                  checked={!!editingData[column.name]}
                                  onChange={(e) => setEditingData(prev => ({ 
                                    ...prev, 
                                    [column.name]: e.target.checked 
                                  }))}
                                  disabled={column.primary_key}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              ) : (
                                <input
                                  type={getInputType(column.type)}
                                  value={editingData[column.name] || ''}
                                  onChange={(e) => setEditingData(prev => ({ 
                                    ...prev, 
                                    [column.name]: e.target.value 
                                  }))}
                                  disabled={column.primary_key}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              )
                            ) : (
                              <span className={column.primary_key ? 'font-medium text-blue-600' : ''}>
                                {formatCellValue(record[column.name], column.type)}
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingRecord === record.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleSave}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(record)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, totalCount)}
                      </span> of{' '}
                      <span className="font-medium">{totalCount}</span> results
                    </p>
                    
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>
                  
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No records match your search.' : 'No records found in this table.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={initializeNewRecord}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add First Record
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataManager;