/**
 * Database Info Component
 * Displays database information, statistics, and management options
 */

'use client';

import React from 'react';
import { Database, Table, BarChart3, Clock, ArrowLeft, Settings, Trash2 } from 'lucide-react';
import { Database as DatabaseType } from '../types';
import { SchemaWithColumns } from '../hooks/useRealtimeSchemas';

export interface DatabaseInfoProps {
  database: DatabaseType;
  schemas: SchemaWithColumns[];
  onBackToOverview: () => void;
}

export const DatabaseInfo: React.FC<DatabaseInfoProps> = ({
  database,
  schemas,
  onBackToOverview
}) => {
  const totalColumns = schemas.reduce((sum, schema) => sum + schema.columns.length, 0);
  const totalTables = schemas.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBackToOverview}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </button>
      </div>

      {/* Database Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{database.title}</h3>
              <p className="text-gray-600">{database.description || 'No description provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              database.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {database.status}
            </span>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Table className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Tables</p>
                <p className="text-2xl font-bold text-gray-900">{totalTables}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Columns</p>
                <p className="text-2xl font-bold text-gray-900">{totalColumns}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Records</p>
                <p className="text-2xl font-bold text-gray-900">{database.record_count}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Size</p>
                <p className="text-2xl font-bold text-gray-900">{database.size}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Database Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Database ID</label>
              <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                {database.id}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <p className="text-sm text-gray-600 capitalize">{database.type}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {formatDate(database.created_at)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {formatDate(database.updated_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Tables Overview</h4>
        
        {schemas.length === 0 ? (
          <div className="text-center py-8">
            <Table className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              No tables have been created yet. Switch to the Schema Editor tab to create your first table.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {schemas.map((schema) => (
              <div key={schema.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Table className="h-5 w-5 text-gray-600" />
                  <div>
                    <h5 className="font-medium text-gray-900">{schema.table_name}</h5>
                    <p className="text-sm text-gray-600">
                      {schema.columns.length} columns
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Created {formatDate(schema.created_at)}
                  </div>
                  
                  <div className="flex gap-2">
                    {schema.columns.slice(0, 3).map((column) => (
                      <span
                        key={column.id}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {column.name}
                      </span>
                    ))}
                    {schema.columns.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{schema.columns.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Management Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Database Management</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-gray-600" />
              <div>
                <h5 className="font-medium text-gray-900">Database Settings</h5>
                <p className="text-sm text-gray-600">Modify database configuration and properties</p>
              </div>
            </div>
            <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
              Configure
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-gray-600" />
              <div>
                <h5 className="font-medium text-gray-900">Export Database</h5>
                <p className="text-sm text-gray-600">Download database schema and data</p>
              </div>
            </div>
            <button className="px-4 py-2 text-green-600 border border-green-600 rounded hover:bg-green-50">
              Export
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-red-600" />
              <div>
                <h5 className="font-medium text-red-900">Delete Database</h5>
                <p className="text-sm text-red-600">Permanently remove this database and all its data</p>
              </div>
            </div>
            <button className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-100">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseInfo;