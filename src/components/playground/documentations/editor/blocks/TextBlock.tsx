'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DocumentBlock } from '../../types';
import styles from './TextBlock.module.css';

interface TextBlockProps {
  block: DocumentBlock;
  onUpdate: (updates: Partial<DocumentBlock>) => void;
  isEditing: boolean;
}

export function TextBlock({ block, onUpdate, isEditing }: TextBlockProps) {
  const [text, setText] = useState(block.content.text || '');
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(text.length, text.length);
    }
  }, [isEditing]);

  useEffect(() => {
    setText(block.content.text || '');
  }, [block.content.text]);

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const handleBlur = () => {
    if (text !== block.content.text) {
      onUpdate({
        content: {
          ...block.content,
          text: text
        }
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  const autoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  if (isEditing) {
    return (
      <div className={styles.textBlock}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            handleTextChange(e.target.value);
            autoResize(e.target);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Start typing..."
          className={styles.textarea}
          rows={1}
        />
      </div>
    );
  }

  return (
    <div 
      className={`${styles.textBlock} ${styles.readonly}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {text ? (
        <div className={styles.textContent}>
          {text.split('\n').map((line: string, index: number) => (
            <p key={index} className={styles.paragraph}>
              {line || '\u00A0'}
            </p>
          ))}
        </div>
      ) : (
        <div className={styles.placeholder}>
          {isHovered ? 'Click to edit text' : 'Empty text block'}
        </div>
      )}
    </div>
  );
}