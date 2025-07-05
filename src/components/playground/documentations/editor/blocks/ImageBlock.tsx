'use client';

import React from 'react';
import { Image } from 'lucide-react';
import { DocumentBlock } from '../../types';

interface ImageBlockProps {
  block: DocumentBlock;
  onUpdate: (updates: Partial<DocumentBlock>) => void;
  isEditing: boolean;
}

export function ImageBlock({ block, onUpdate, isEditing }: ImageBlockProps) {
  const image = block.content.image;
  
  if (!image?.url) {
    return (
      <div style={{ 
        padding: '2rem', 
        backgroundColor: '#f9fafb',
        border: '2px dashed #d1d5db',
        borderRadius: '0.375rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <Image size={48} style={{ margin: '0 auto 1rem' }} />
        <div>No image URL set</div>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '0.5rem' }}>
      <img 
        src={image.url} 
        alt={image.alt || 'Image'}
        style={{ 
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '0.375rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      />
      {image.caption && (
        <div style={{ 
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: '#6b7280',
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          {image.caption}
        </div>
      )}
    </div>
  );
}