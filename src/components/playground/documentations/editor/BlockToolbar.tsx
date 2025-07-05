'use client';

import React from 'react';
import { 
  Type, 
  Code, 
  Heading, 
  List, 
  Link2, 
  Table, 
  Image,
  Plus
} from 'lucide-react';
import { BlockType } from '../types';
import styles from './BlockToolbar.module.css';

interface BlockToolbarProps {
  onAddBlock: (type: BlockType) => void;
}

export function BlockToolbar({ onAddBlock }: BlockToolbarProps) {
  const blockTypes: Array<{ type: BlockType; icon: React.ReactNode; label: string }> = [
    { type: 'text', icon: <Type size={20} />, label: 'Text' },
    { type: 'heading', icon: <Heading size={20} />, label: 'Heading' },
    { type: 'code', icon: <Code size={20} />, label: 'Code' },
    { type: 'list', icon: <List size={20} />, label: 'List' },
    { type: 'reference', icon: <Link2 size={20} />, label: 'Reference' },
    { type: 'table', icon: <Table size={20} />, label: 'Table' },
    { type: 'image', icon: <Image size={20} />, label: 'Image' },
  ];

  return (
    <div className={styles.toolbar}>
      <div className={styles.label}>
        <Plus size={16} />
        Add Block:
      </div>
      <div className={styles.buttons}>
        {blockTypes.map(({ type, icon, label }) => (
          <button
            key={type}
            onClick={() => onAddBlock(type)}
            className={styles.blockButton}
            title={`Add ${label} block`}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}