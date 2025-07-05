'use client';

import React, { useState, useEffect } from 'react';
import { Link2, ExternalLink, Eye, Search, FileText, X } from 'lucide-react';
import { DocumentBlock } from '../../types';

interface ReferenceBlockProps {
  block: DocumentBlock;
  onUpdate: (updates: Partial<DocumentBlock>) => void;
  isEditing: boolean;
}

interface Document {
  doc_id: string;
  doc_name: string;
  description?: string;
  blocks?: number;
  lastModified?: string;
}

interface Block {
  block_id: string;
  block_type: string;
  content: any;
  order_index: number;
}

const DISPLAY_TYPES = [
  { value: 'link' as const, label: 'Link', description: 'Simple clickable link' },
  { value: 'embed' as const, label: 'Embed', description: 'Show content inline' },
  { value: 'mirror' as const, label: 'Mirror', description: 'Live synced content' }
];

export function ReferenceBlock({ block, onUpdate, isEditing }: ReferenceBlockProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [referencedContent, setReferencedContent] = useState<string>('');

  const ref = block.content.reference;
  const displayType = ref?.display_type || 'link';
  const targetDocId = ref?.target_doc_id;
  const targetBlockId = ref?.target_block_id;

  useEffect(() => {
    if (isEditing && showPicker) {
      fetchDocuments();
    }
  }, [isEditing, showPicker]);

  useEffect(() => {
    if (selectedDocument && showPicker) {
      fetchBlocks(selectedDocument);
    }
  }, [selectedDocument, showPicker]);

  // Fetch referenced content for display
  useEffect(() => {
    if (targetDocId && !isEditing) {
      fetchReferencedContent();
    }
  }, [targetDocId, targetBlockId, isEditing]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/docs');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async (docId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/docs/${docId}/blocks`);
      if (response.ok) {
        const data = await response.json();
        setBlocks(data.blocks || []);
      }
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferencedContent = async () => {
    if (!targetDocId) return;
    
    try {
      const url = targetBlockId 
        ? `/api/docs/${targetDocId}/blocks/${targetBlockId}`
        : `/api/docs/${targetDocId}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        if (targetBlockId) {
          // Get specific block content
          const content = getBlockPreview(data.block);
          setReferencedContent(content);
        } else {
          // Get document title
          setReferencedContent(data.document?.metadata?.doc_name || 'Untitled Document');
        }
      }
    } catch (error) {
      console.error('Failed to fetch referenced content:', error);
      setReferencedContent('Content unavailable');
    }
  };

  const getBlockPreview = (block: Block): string => {
    switch (block.block_type) {
      case 'text':
        return block.content.text?.substring(0, 100) + '...' || 'Empty text block';
      case 'heading':
        return block.content.heading?.text || 'Empty heading';
      case 'code':
        return `Code (${block.content.code?.language || 'plain'})`;
      case 'list':
        const items = block.content.list?.items || [];
        return `List with ${items.length} items`;
      default:
        return `${block.block_type} block`;
    }
  };

  const handleReferenceSelect = (docId: string, blockId?: string) => {
    const selectedDoc = documents.find(doc => doc.doc_id === docId);
    
    onUpdate({
      content: {
        ...block.content,
        reference: {
          ...ref,
          target_doc_id: docId,
          target_block_id: blockId,
          label: selectedDoc?.doc_name || 'Referenced Document',
          display_type: displayType
        }
      }
    });
    
    setShowPicker(false);
    setSelectedDocument(null);
    setBlocks([]);
  };

  const handleDisplayTypeChange = (newType: 'embed' | 'link' | 'mirror') => {
    onUpdate({
      content: {
        ...block.content,
        reference: {
          target_doc_id: ref?.target_doc_id || '',
          target_block_id: ref?.target_block_id,
          display_type: newType,
          label: ref?.label
        }
      }
    });
  };

  const filteredDocuments = documents.filter(doc =>
    doc.doc_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isEditing) {
    return (
      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Link2 size={16} className="text-blue-600" />
            <span className="font-medium text-blue-800">Reference Block</span>
          </div>
          <button
            onClick={() => setShowPicker(true)}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Choose Reference
          </button>
        </div>

        {/* Display Type Selector */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Display Type</label>
          <div className="flex gap-2">
            {DISPLAY_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => handleDisplayTypeChange(type.value)}
                className={`px-3 py-2 text-sm rounded border ${
                  displayType === type.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                title={type.description}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Reference Display */}
        {targetDocId ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText size={14} />
            <span>References: {ref?.label || targetDocId}</span>
            {targetBlockId && <span className="text-gray-400">→ Specific block</span>}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">No reference selected</div>
        )}

        {/* Reference Picker Modal */}
        {showPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[600px] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Select Reference</h3>
                <button
                  onClick={() => setShowPicker(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Documents List */}
                <div className="w-1/2 border-r flex flex-col">
                  <div className="p-4 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : filteredDocuments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No documents found</div>
                    ) : (
                      <div className="space-y-1">
                        {filteredDocuments.map(doc => (
                          <div
                            key={doc.doc_id}
                            className={`p-3 rounded-lg cursor-pointer border ${
                              selectedDocument === doc.doc_id
                                ? 'bg-blue-50 border-blue-200'
                                : 'hover:bg-gray-50 border-transparent'
                            }`}
                            onClick={() => setSelectedDocument(doc.doc_id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{doc.doc_name}</h4>
                                {doc.description && (
                                  <p className="text-sm text-gray-600 truncate">{doc.description}</p>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReferenceSelect(doc.doc_id);
                                }}
                                className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                              >
                                Select Document
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Blocks List */}
                <div className="w-1/2 flex flex-col">
                  <div className="p-4 border-b">
                    <h4 className="font-medium text-gray-900">
                      {selectedDocument ? 'Document Blocks' : 'Select a document to see blocks'}
                    </h4>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2">
                    {selectedDocument && blocks.length > 0 ? (
                      <div className="space-y-1">
                        {blocks.map(block => (
                          <div
                            key={block.block_id}
                            className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200"
                            onClick={() => handleReferenceSelect(selectedDocument, block.block_id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {block.block_type}
                                  </span>
                                  <span className="text-xs text-gray-500">#{block.order_index + 1}</span>
                                </div>
                                <p className="text-sm text-gray-700 truncate">
                                  {getBlockPreview(block)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : selectedDocument ? (
                      <div className="text-center py-8 text-gray-500">No blocks in this document</div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">Select a document first</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // View mode
  if (!targetDocId) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center gap-2 text-gray-500">
          <Link2 size={16} />
          <span className="italic">No reference set</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${
      displayType === 'embed' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between p-3 bg-white border-b">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-blue-600" />
          <span className="font-medium text-blue-800">
            {ref?.label || 'Referenced Content'}
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {displayType}
          </span>
        </div>
        <button
          className="text-gray-400 hover:text-gray-600"
          title="View reference"
        >
          <ExternalLink size={16} />
        </button>
      </div>
      
      {displayType === 'embed' && (
        <div className="p-4">
          {referencedContent ? (
            <div className="text-gray-700">
              {referencedContent}
            </div>
          ) : (
            <div className="text-gray-500 italic">Loading referenced content...</div>
          )}
        </div>
      )}
    </div>
  );
}