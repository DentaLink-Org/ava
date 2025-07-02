/**
 * Main Database Manager Component
 * Provides complete database management with create, edit, schema, and data tabs
 */

'use client';

import React, { useState } from 'react';
import { Database, Plus, Settings, Table, BarChart3, History, RefreshCw } from 'lucide-react';
import { useRealtimeDatabases } from '../hooks/useRealtimeDatabases';
import { DatabaseGrid } from './DatabaseGrid';
import { DatabaseCreator } from './DatabaseCreator';
import { DatabaseEditor } from './DatabaseEditor';
import { FeaturesDatabase } from './FeaturesDatabase';
import { isSupabaseConfigured } from '../api/supabase';
import { PageTheme } from '@/pages/_shared/runtime/types';

export interface DatabaseManagerProps {
  className?: string;
  theme?: PageTheme;
}

type TabView = 'overview' | 'create' | 'edit' | 'features';

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ className = '', theme }) => {
  const [currentTab, setCurrentTab] = useState<TabView>('overview');
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | null>(null);
  
  const { 
    data: databases, 
    isLoading, 
    error, 
    refetch,
    createDatabase,
    deleteDatabase 
  } = useRealtimeDatabases();

  const isConfigured = isSupabaseConfigured();

  // Default theme if none provided
  const defaultTheme: PageTheme = {
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
    },
    spacing: {
      base: 16,
      small: 8,
      large: 24,
    },
  };

  const currentTheme = theme || defaultTheme;

  // Handle database selection for editing
  const handleEditDatabase = (databaseId: string) => {
    setSelectedDatabaseId(databaseId);
    setCurrentTab('edit');
  };

  // Handle successful database creation
  const handleDatabaseCreated = () => {
    setCurrentTab('overview');
    refetch();
  };

  // Handle navigation back to overview
  const handleBackToOverview = () => {
    setCurrentTab('overview');
    setSelectedDatabaseId(null);
  };

  if (!isConfigured) {
    return (
      <div className={`database-manager-container ${className}`}>
        <div className="database-manager-error-card">
          <div className="text-center">
            <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Supabase Configuration Required
            </h3>
              <p className="text-gray-500 mb-6">
              To use the real-time database features, please configure your Supabase credentials in the .env.local file.
            </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-gray-900 mb-2">Setup Instructions:</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Copy .env.local.example to .env.local</li>
                <li>2. Add your Supabase URL and API key</li>
                <li>3. Run the database setup script</li>
                <li>4. Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`database-manager-container ${className}`}>
        <div className="database-manager-error-card error">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Database className="mx-auto h-12 w-12" />
            </div>
              <h3 className="text-lg font-medium text-red-900 mb-2">
              Database Connection Error
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
              <button
              onClick={refetch}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`database-manager-container ${className}`}>
      <div className="database-manager-main-card">
        {/* Header with Navigation */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Database Management
              </h2>
              {currentTab === 'edit' && selectedDatabaseId && (
                <button
                  onClick={handleBackToOverview}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  ← Back to Overview
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {currentTab === 'overview' && (
                <>
                  <button
                    onClick={refetch}
                    disabled={isLoading}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title="Refresh"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setCurrentTab('create')}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create Database
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentTab('overview')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Overview
              </div>
            </button>
            
            <button
              onClick={() => setCurrentTab('create')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create
              </div>
            </button>
            
            <button
              onClick={() => setCurrentTab('features')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'features'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Features Database
              </div>
            </button>
            
            {selectedDatabaseId && (
              <button
                onClick={() => setCurrentTab('edit')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  currentTab === 'edit'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Edit Database
                </div>
              </button>
            )}
          </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {currentTab === 'overview' && (
            <DatabaseGrid
              databases={databases || []}
              isLoading={isLoading}
              theme={currentTheme}
              onEditDatabase={handleEditDatabase}
              onDeleteDatabase={deleteDatabase}
            />
          )}
          
          {currentTab === 'create' && (
            <DatabaseCreator
              onDatabaseCreated={handleDatabaseCreated}
              onCancel={() => setCurrentTab('overview')}
              createDatabase={createDatabase}
            />
          )}
          
          {currentTab === 'features' && (
            <FeaturesDatabase />
          )}
          
          {currentTab === 'edit' && selectedDatabaseId && (
            <DatabaseEditor
              databaseId={selectedDatabaseId}
              onBackToOverview={handleBackToOverview}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager;