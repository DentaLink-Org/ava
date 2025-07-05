'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Hash, Type } from 'lucide-react';
import { DocumentBlock } from '../../types';

interface HeadingBlockProps {
  block: DocumentBlock;
  onUpdate: (updates: Partial<DocumentBlock>) => void;
  isEditing: boolean;
}

const HEADING_LEVELS = [
  { value: 1, label: 'H1', style: 'text-3xl font-bold' },
  { value: 2, label: 'H2', style: 'text-2xl font-bold' },
  { value: 3, label: 'H3', style: 'text-xl font-semibold' },
  { value: 4, label: 'H4', style: 'text-lg font-semibold' },
  { value: 5, label: 'H5', style: 'text-base font-medium' },
  { value: 6, label: 'H6', style: 'text-sm font-medium' }
];

export function HeadingBlock({ block, onUpdate, isEditing }: HeadingBlockProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  
  const level = block.content.heading?.level || 2;
  const text = block.content.heading?.text || '';
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleTextChange = (newText: string) => {
    onUpdate({
      content: {
        ...block.content,
        heading: {
          ...block.content.heading,
          text: newText
        }
      }
    });
  };

  const handleLevelChange = (newLevel: number) => {
    onUpdate({
      content: {
        ...block.content,
        heading: {
          ...block.content.heading,
          level: newLevel
        }
      }
    });
    setShowLevelSelector(false);
  };

  // Generate anchor ID from text for linking
  const anchorId = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const currentHeadingConfig = HEADING_LEVELS.find(h => h.value === level) || HEADING_LEVELS[1];
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  if (isEditing) {
    return (
      <div className="group relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <button
              onClick={() => setShowLevelSelector(!showLevelSelector)}
              className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
            >
              <Hash size={14} />
              <span>{currentHeadingConfig.label}</span>
            </button>
            
            {showLevelSelector && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {HEADING_LEVELS.map(headingLevel => (
                  <button
                    key={headingLevel.value}
                    onClick={() => handleLevelChange(headingLevel.value)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                      headingLevel.value === level ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{headingLevel.label}</span>
                      <span className={`text-xs ${headingLevel.style}`}>
                        Preview
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {anchorId && `#${anchorId}`}
          </div>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={`Enter ${currentHeadingConfig.label} heading...`}
          className={`w-full border-none outline-none bg-transparent ${currentHeadingConfig.style} text-gray-900 placeholder-gray-400`}
          style={{ resize: 'none' }}
        />
      </div>
    );
  }

  // View mode
  return (
    <div className="group relative">
      <HeadingTag 
        id={anchorId}
        className={`${currentHeadingConfig.style} text-gray-900 scroll-mt-4`}
      >
        {text || (
          <span className="text-gray-400 italic">Empty heading</span>
        )}
        {anchorId && (
          <a
            href={`#${anchorId}`}
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
            title="Link to heading"
          >
            <Hash size={16} className="inline" />
          </a>
        )}
      </HeadingTag>
    </div>
  );
}