'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Save, Loader2 } from 'lucide-react';
import { DocumentBlock, BlockType, DocumentMetadata } from '../types';
import { BlockEditor } from './BlockEditor';
import { BlockToolbar } from './BlockToolbar';
import styles from './DocumentEditor.module.css';

interface DocumentEditorProps {
  documentId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export function DocumentEditor({ documentId, onSave, onCancel }: DocumentEditorProps) {
  const [document, setDocument] = useState<DocumentMetadata | null>(null);
  const [blocks, setBlocks] = useState<DocumentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Fetch document and blocks
  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/docs/${documentId}?includeBlocks=true`);
      if (!response.ok) throw new Error('Failed to fetch document');
      
      const data = await response.json();
      setDocument(data.document.metadata);
      setBlocks(data.document.blocks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order indices
    const updatedItems = items.map((item, index) => ({
      ...item,
      order_index: index,
    }));

    setBlocks(updatedItems);

    // Save new order to backend
    try {
      const response = await fetch(`/api/docs/${documentId}/blocks/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          block_ids: updatedItems.map(b => b.block_id),
          new_positions: updatedItems.map((_, index) => index),
        }),
      });

      if (!response.ok) throw new Error('Failed to reorder blocks');
    } catch (err) {
      setError('Failed to save block order');
      // Revert on error
      fetchDocument();
    }
  };

  const handleBlockUpdate = async (blockId: string, updates: Partial<DocumentBlock>) => {
    try {
      const response = await fetch(`/api/docs/${documentId}/blocks/${blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update block');

      const { block } = await response.json();
      setBlocks(prev => prev.map(b => b.block_id === blockId ? { ...b, ...block } : b));
    } catch (err) {
      setError('Failed to update block');
    }
  };

  const handleBlockDelete = async (blockId: string) => {
    try {
      const response = await fetch(`/api/docs/${documentId}/blocks/${blockId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete block');

      setBlocks(prev => prev.filter(b => b.block_id !== blockId));
    } catch (err) {
      setError('Failed to delete block');
    }
  };

  const handleAddBlock = async (type: BlockType, afterBlockId?: string) => {
    const afterIndex = afterBlockId 
      ? blocks.findIndex(b => b.block_id === afterBlockId) 
      : blocks.length - 1;
    
    const newOrderIndex = afterIndex + 1;

    // Create default content based on type
    const defaultContent = {
      text: { text: '' },
      code: { language: 'javascript', code: '' },
      heading: { level: 2, text: '' },
      list: { type: 'unordered', items: [{ text: '' }] },
      reference: { target_doc_id: '', display_type: 'link' },
      table: { headers: ['Column 1', 'Column 2'], rows: [['', '']] },
      image: { url: '', alt: '' },
    };

    try {
      const response = await fetch(`/api/docs/${documentId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          block_type: type,
          content: defaultContent[type],
          order_index: newOrderIndex,
        }),
      });

      if (!response.ok) throw new Error('Failed to create block');

      const { block } = await response.json();
      
      // Update order indices for blocks after the new one
      const updatedBlocks = blocks.map(b => 
        b.order_index >= newOrderIndex 
          ? { ...b, order_index: b.order_index + 1 }
          : b
      );

      setBlocks([...updatedBlocks, block].sort((a, b) => a.order_index - b.order_index));
      setSelectedBlockId(block.block_id);
    } catch (err) {
      setError('Failed to add block');
    }
  };

  const handleSaveDocument = async () => {
    setSaving(true);
    try {
      // Document metadata is auto-saved on block changes
      if (onSave) onSave();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" />
        <span>Loading document...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <span>Error: {error}</span>
        <button onClick={fetchDocument}>Retry</button>
      </div>
    );
  }

  if (!document) {
    return <div>Document not found</div>;
  }

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <h1 className={styles.title}>{document.doc_name}</h1>
        <div className={styles.actions}>
          <button 
            onClick={handleSaveDocument} 
            disabled={saving}
            className={styles.saveButton}
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            Save
          </button>
          {onCancel && (
            <button onClick={onCancel} className={styles.cancelButton}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="blocks">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className={styles.blocksList}
            >
              {blocks.length === 0 && (
                <div className={styles.emptyState}>
                  <p>No blocks yet. Add your first block to get started.</p>
                  <BlockToolbar onAddBlock={(type) => handleAddBlock(type)} />
                </div>
              )}

              {blocks.map((block, index) => (
                <Draggable 
                  key={block.block_id} 
                  draggableId={block.block_id} 
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${styles.blockWrapper} ${
                        snapshot.isDragging ? styles.dragging : ''
                      } ${selectedBlockId === block.block_id ? styles.selected : ''}`}
                    >
                      <BlockEditor
                        block={block}
                        onUpdate={(updates) => handleBlockUpdate(block.block_id, updates)}
                        onDelete={() => handleBlockDelete(block.block_id)}
                        onSelect={() => setSelectedBlockId(block.block_id)}
                        isSelected={selectedBlockId === block.block_id}
                        dragHandleProps={provided.dragHandleProps}
                      />
                      {selectedBlockId === block.block_id && (
                        <div className={styles.blockActions}>
                          <button
                            onClick={() => handleAddBlock('text', block.block_id)}
                            className={styles.addBlockButton}
                            title="Add block after this one"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {blocks.length > 0 && (
        <div className={styles.bottomToolbar}>
          <BlockToolbar onAddBlock={(type) => handleAddBlock(type)} />
        </div>
      )}
    </div>
  );
}