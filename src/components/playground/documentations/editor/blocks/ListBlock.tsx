'use client';

import React, { useState, useRef, useEffect } from 'react';
import { List, ListOrdered, Check, Square, Plus, Minus, GripVertical } from 'lucide-react';
import { DocumentBlock } from '../../types';

interface ListBlockProps {
  block: DocumentBlock;
  onUpdate: (updates: Partial<DocumentBlock>) => void;
  isEditing: boolean;
}

type ListType = 'unordered' | 'ordered' | 'checklist';

interface ListItem {
  text: string;
  checked?: boolean;
}

const LIST_TYPES = [
  { value: 'unordered' as ListType, label: 'Bullet List', icon: List },
  { value: 'ordered' as ListType, label: 'Numbered List', icon: ListOrdered },
  { value: 'checklist' as ListType, label: 'Checklist', icon: Check }
];

export function ListBlock({ block, onUpdate, isEditing }: ListBlockProps) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const listContent = block.content.list;
  const items: ListItem[] = listContent?.items || [{ text: '' }];
  const listType: ListType = listContent?.type || 'unordered';
  
  const currentTypeConfig = LIST_TYPES.find(t => t.value === listType) || LIST_TYPES[0];

  const handleTypeChange = (newType: ListType) => {
    onUpdate({
      content: {
        ...block.content,
        list: {
          ...listContent,
          type: newType,
          items: items.map(item => ({
            ...item,
            checked: newType === 'checklist' ? (item.checked ?? false) : undefined
          }))
        }
      }
    });
    setShowTypeSelector(false);
  };

  const handleItemChange = (index: number, text: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], text };
    
    onUpdate({
      content: {
        ...block.content,
        list: {
          ...listContent,
          type: listType,
          items: newItems
        }
      }
    });
  };

  const handleItemCheck = (index: number, checked: boolean) => {
    if (listType !== 'checklist') return;
    
    const newItems = [...items];
    newItems[index] = { ...newItems[index], checked };
    
    onUpdate({
      content: {
        ...block.content,
        list: {
          ...listContent,
          type: listType,
          items: newItems
        }
      }
    });
  };

  const handleAddItem = (afterIndex: number) => {
    const newItems = [...items];
    newItems.splice(afterIndex + 1, 0, { 
      text: '', 
      checked: listType === 'checklist' ? false : undefined 
    });
    
    onUpdate({
      content: {
        ...block.content,
        list: {
          ...listContent,
          type: listType,
          items: newItems
        }
      }
    });

    // Focus the new item
    setTimeout(() => {
      const inputs = document.querySelectorAll(`[data-list-item="${block.block_id}"]`);
      const newInput = inputs[afterIndex + 1] as HTMLInputElement;
      if (newInput) newInput.focus();
    }, 50);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    
    const newItems = items.filter((_, i) => i !== index);
    
    onUpdate({
      content: {
        ...block.content,
        list: {
          ...listContent,
          type: listType,
          items: newItems
        }
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddItem(index);
    } else if (e.key === 'Backspace' && items[index].text === '' && items.length > 1) {
      e.preventDefault();
      handleRemoveItem(index);
      // Focus previous item
      setTimeout(() => {
        const inputs = document.querySelectorAll(`[data-list-item="${block.block_id}"]`);
        const prevInput = inputs[Math.max(0, index - 1)] as HTMLInputElement;
        if (prevInput) prevInput.focus();
      }, 50);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    
    onUpdate({
      content: {
        ...block.content,
        list: {
          ...listContent,
          type: listType,
          items: newItems
        }
      }
    });
    
    setDraggedIndex(null);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        {/* List type selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowTypeSelector(!showTypeSelector)}
              className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
            >
              <currentTypeConfig.icon size={14} />
              <span>{currentTypeConfig.label}</span>
            </button>
            
            {showTypeSelector && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {LIST_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => handleTypeChange(type.value)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2 ${
                      type.value === listType ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <type.icon size={16} />
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {items.length} items
          </span>
        </div>

        {/* List items */}
        <div className="space-y-1">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 group"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              {/* Drag handle */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical size={14} className="text-gray-400" />
              </div>

              {/* List marker/checkbox */}
              <div className="flex-shrink-0 w-6 flex justify-center">
                {listType === 'checklist' ? (
                  <button
                    onClick={() => handleItemCheck(index, !item.checked)}
                    className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400"
                  >
                    {item.checked && <Check size={12} className="text-blue-600" />}
                  </button>
                ) : listType === 'ordered' ? (
                  <span className="text-sm text-gray-600 w-4 text-center">
                    {index + 1}.
                  </span>
                ) : (
                  <span className="text-gray-600">•</span>
                )}
              </div>

              {/* Item input */}
              <input
                type="text"
                value={item.text}
                onChange={(e) => handleItemChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder="List item..."
                className="flex-1 border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
                data-list-item={block.block_id}
              />

              {/* Remove button */}
              <button
                onClick={() => handleRemoveItem(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                disabled={items.length <= 1}
              >
                <Minus size={14} className="text-gray-400" />
              </button>
            </div>
          ))}
        </div>

        {/* Add item button */}
        <button
          onClick={() => handleAddItem(items.length - 1)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100"
        >
          <Plus size={14} />
          Add item
        </button>
      </div>
    );
  }

  // View mode
  const ListTag = listType === 'ordered' ? 'ol' : 'ul';
  
  return (
    <div className="py-1">
      {listType === 'checklist' ? (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-4 h-4 border border-gray-300 rounded flex items-center justify-center ${
                item.checked ? 'bg-blue-50 border-blue-600' : ''
              }`}>
                {item.checked && <Check size={12} className="text-blue-600" />}
              </div>
              <span className={`text-gray-900 ${item.checked ? 'line-through text-gray-500' : ''}`}>
                {item.text || 'Empty item'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <ListTag className={`${listType === 'ordered' ? 'list-decimal' : 'list-disc'} list-inside space-y-1`}>
          {items.map((item, index) => (
            <li key={index} className="text-gray-900">
              {item.text || 'Empty item'}
            </li>
          ))}
        </ListTag>
      )}
    </div>
  );
}