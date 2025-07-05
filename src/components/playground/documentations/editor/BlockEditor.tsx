'use client';

import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { DocumentBlock } from '../types';
import { TextBlock } from './blocks/TextBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { ListBlock } from './blocks/ListBlock';
import { ReferenceBlock } from './blocks/ReferenceBlock';
import { TableBlock } from './blocks/TableBlock';
import { ImageBlock } from './blocks/ImageBlock';
import styles from './BlockEditor.module.css';

interface BlockEditorProps {
  block: DocumentBlock;
  onUpdate: (updates: Partial<DocumentBlock>) => void;
  onDelete: () => void;
  onSelect: () => void;
  isSelected: boolean;
  dragHandleProps?: any;
}

export function BlockEditor({
  block,
  onUpdate,
  onDelete,
  onSelect,
  isSelected,
  dragHandleProps,
}: BlockEditorProps) {
  const renderBlockContent = () => {
    const props = {
      block,
      onUpdate,
      isEditing: isSelected,
    };

    switch (block.block_type) {
      case 'text':
        return <TextBlock {...props} />;
      case 'code':
        return <CodeBlock {...props} />;
      case 'heading':
        return <HeadingBlock {...props} />;
      case 'list':
        return <ListBlock {...props} />;
      case 'reference':
        return <ReferenceBlock {...props} />;
      case 'table':
        return <TableBlock {...props} />;
      case 'image':
        return <ImageBlock {...props} />;
      default:
        return <div>Unknown block type: {block.block_type}</div>;
    }
  };

  return (
    <div 
      className={`${styles.blockEditor} ${isSelected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      <div className={styles.blockControls}>
        <div {...dragHandleProps} className={styles.dragHandle}>
          <GripVertical size={20} />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={styles.deleteButton}
          title="Delete block"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className={styles.blockContent}>
        {renderBlockContent()}
      </div>
    </div>
  );
}