/**
 * Database Editor Component
 * Provides complete database editing with schema and data management tabs
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Database, Table, BarChart3, History, Settings, AlertCircle } from 'lucide-react';
import { useRealtimeSchemas } from '../hooks/useRealtimeSchemas';
import { useRealtimeDatabases } from '../hooks/useRealtimeDatabases';
import { SchemaEditor } from './SchemaEditor';
import { DataManager } from './DataManager';
import { DatabaseInfo } from './DatabaseInfo';

export interface DatabaseEditorProps {
  databaseId: string;
  onBackToOverview: () => void;
}

type EditorTab = 'info' | 'schema' | 'data' | 'history';

export const DatabaseEditor: React.FC<DatabaseEditorProps> = ({
  databaseId,
  onBackToOverview
}) => {
  const [currentTab, setCurrentTab] = useState<EditorTab>('info');
  const [selectedTableName, setSelectedTableName] = useState<string | null>(null);
  
  const { data: databases } = useRealtimeDatabases();
  const {
    schemas,
    isLoading: schemasLoading,
    error: schemasError,
    createTable,
    deleteTable,
    addColumn,
    updateColumn,
    deleteColumn
  } = useRealtimeSchemas(databaseId);

  const currentDatabase = databases?.find(db => db.id === databaseId);

  // Auto-select first table when schemas load
  useEffect(() => {
    if (schemas && schemas.length > 0 && !selectedTableName) {
      setSelectedTableName(schemas[0].table_name);
    }
  }, [schemas, selectedTableName]);

  // Handle table selection change
  const handleTableSelect = (tableName: string) => {
    setSelectedTableName(tableName);
    if (currentTab === 'data') {
      // Stay on data tab but switch table
      setCurrentTab('data');
    }
  };

  if (!currentDatabase) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">Database not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Database Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Database className="h-6 w-6" />
          <h2 className="text-xl font-semibold">{currentDatabase.title}</h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            currentDatabase.status === 'active' 
              ? 'bg-green-500 bg-opacity-20 text-green-100' 
              : 'bg-yellow-500 bg-opacity-20 text-yellow-100'
          }`}>
            {currentDatabase.status}
          </span>
        </div>
        {currentDatabase.description && (
          <p className="text-blue-100">{currentDatabase.description}</p>
        )}
        <div className="mt-3 flex items-center gap-6 text-sm text-blue-100">
          <span>{currentDatabase.table_count} tables</span>
          <span>{currentDatabase.record_count} records</span>
          <span>{currentDatabase.size}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setCurrentTab('info')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              currentTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="h-4 w-4" />
            Database Info
          </button>
          
          <button
            onClick={() => setCurrentTab('schema')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              currentTab === 'schema'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Table className="h-4 w-4" />
            Schema Editor
            {schemas && schemas.length > 0 && (
              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {schemas.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setCurrentTab('data')}
            disabled={!selectedTableName}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              currentTab === 'data'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${!selectedTableName ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <BarChart3 className="h-4 w-4" />
            Data Manager
            {selectedTableName && (
              <span className="text-xs text-gray-500">({selectedTableName})</span>
            )}
          </button>
          
          <button
            onClick={() => setCurrentTab('history')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              currentTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <History className="h-4 w-4" />
            History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {currentTab === 'info' && (
          <DatabaseInfo
            database={currentDatabase}
            schemas={schemas || []}
            onBackToOverview={onBackToOverview}
          />
        )}

        {currentTab === 'schema' && (
          <SchemaEditor
            databaseId={databaseId}
            schemas={schemas || []}
            isLoading={schemasLoading}
            error={schemasError}
            onCreateTable={createTable}
            onDeleteTable={deleteTable}
            onAddColumn={addColumn}
            onUpdateColumn={updateColumn}
            onDeleteColumn={deleteColumn}
            onTableSelect={handleTableSelect}
            selectedTableName={selectedTableName}
          />
        )}

        {currentTab === 'data' && selectedTableName && (
          <DataManager
            databaseId={databaseId}
            tableName={selectedTableName}
            schema={schemas?.find(s => s.table_name === selectedTableName)}
            onTableSelect={handleTableSelect}
            availableTables={schemas?.map(s => s.table_name) || []}
          />
        )}

        {currentTab === 'history' && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              History & Version Control
            </h3>
            <p className="text-gray-500">
              History tracking and version control features will be implemented here.
              This will show database snapshots, change logs, and rollback capabilities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseEditor;