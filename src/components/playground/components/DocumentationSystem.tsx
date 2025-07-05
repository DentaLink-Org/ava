'use client';

import React, { useState } from 'react';
import { FileText, Plus, Database, Search } from 'lucide-react';
import { DocumentEditor } from '../documentations/editor/DocumentEditor';

interface DocumentationSystemProps {
  className?: string;
}

export function DocumentationSystem({ className }: DocumentationSystemProps) {
  const [currentView, setCurrentView] = useState<'list' | 'editor'>('list');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [documents] = useState([
    {
      id: '1',
      name: 'Project Documentation',
      description: 'Main project documentation and overview',
      lastModified: '2024-01-15T10:30:00Z',
      blocks: 25
    },
    {
      id: '2', 
      name: 'API Reference',
      description: 'Complete API documentation with examples',
      lastModified: '2024-01-14T14:20:00Z',
      blocks: 42
    }
  ]);

  const handleCreateDocument = async () => {
    // For now, just show the editor with a mock document
    setSelectedDocumentId('mock-new-doc');
    setCurrentView('editor');
  };

  const handleEditDocument = (docId: string) => {
    setSelectedDocumentId(docId);
    setCurrentView('editor');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedDocumentId(null);
  };

  if (currentView === 'editor' && selectedDocumentId) {
    return (
      <div className={className}>
        <DocumentEditor
          documentId={selectedDocumentId}
          onSave={handleBackToList}
          onCancel={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className={`${className} p-6`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-blue-600" size={28} />
                Documentation System
              </h2>
              <p className="text-gray-600 mt-1">
                Create and manage documents as database tables with dynamic references
              </p>
            </div>
            <button
              onClick={handleCreateDocument}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              New Document
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>All Databases</option>
              <option>Main Database</option>
              <option>Test Database</option>
            </select>
          </div>
        </div>

        {/* Documents List */}
        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first document to start building your knowledge base
              </p>
              <button
                onClick={handleCreateDocument}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Create Document
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleEditDocument(doc.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {doc.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {doc.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Database size={16} />
                          {doc.blocks} blocks
                        </span>
                        <span>
                          Modified {new Date(doc.lastModified).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditDocument(doc.id);
                        }}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Database className="text-blue-600" size={24} />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Database Tables</h4>
              <p className="text-sm text-gray-600">Each document is stored as a database table</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="text-green-600" size={24} />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Dynamic References</h4>
              <p className="text-sm text-gray-600">Link blocks across documents with auto-updates</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Search className="text-purple-600" size={24} />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Powerful Search</h4>
              <p className="text-sm text-gray-600">Search across all documents and blocks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}