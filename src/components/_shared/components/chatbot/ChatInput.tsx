'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false,
  placeholder = "Type your message..." 
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && !disabled) {
      onSendMessage(trimmedInput);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="chat-input"
          rows={1}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className="send-button"
          type="button"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22,2 15,22 11,13 2,9" />
          </svg>
        </button>
      </div>
      <div className="chat-input-hint">
        Press Enter to send, Shift + Enter for new line
      </div>

      <style jsx>{`
        .chat-input-container {
          padding: 16px;
          border-top: 1px solid var(--color-border, #e5e7eb);
          background: var(--color-surface, #ffffff);
          border-radius: 0 0 12px 12px;
        }

        .chat-input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          background: var(--color-surfaceSecondary, #f8fafc);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 8px;
          padding: 8px;
          transition: border-color 0.2s ease;
        }

        .chat-input-wrapper:focus-within {
          border-color: var(--color-primary, #3b82f6);
        }

        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.5;
          color: var(--color-text, #1f2937);
          min-height: 40px;
          max-height: 120px;
          padding: 8px 0;
        }

        .chat-input::placeholder {
          color: var(--color-textSecondary, #6b7280);
        }

        .chat-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .send-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: var(--color-primary, #3b82f6);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          background: var(--color-primaryDark, #2563eb);
          transform: translateY(-1px);
        }

        .send-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .send-button:disabled {
          background: var(--color-textSecondary, #6b7280);
          cursor: not-allowed;
          transform: none;
        }

        .chat-input-hint {
          margin-top: 6px;
          font-size: 11px;
          color: var(--color-textSecondary, #6b7280);
          text-align: center;
        }

        @media (max-width: 768px) {
          .chat-input-container {
            padding: 12px;
          }
          
          .chat-input {
            font-size: 16px; /* Prevents zoom on iOS */
          }
          
          .chat-input-hint {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatInput;