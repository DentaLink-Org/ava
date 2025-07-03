'use client';

import React from 'react';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageIcon = (type: string): string => {
    switch (type) {
      case 'user':
        return '👤';
      case 'assistant':
        return '🤖';
      case 'system':
        return 'ℹ️';
      default:
        return '💬';
    }
  };

  return (
    <div className={`chat-message ${message.type}`}>
      <div className="message-header">
        <div className="message-avatar">
          {getMessageIcon(message.type)}
        </div>
        <div className="message-info">
          <span className="message-sender">
            {message.type === 'user' ? 'You' : 
             message.type === 'assistant' ? 'Claude' : 'System'}
          </span>
          <span className="message-time">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
      <div className="message-content">
        {message.content}
      </div>

      <style jsx>{`
        .chat-message {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 90%;
          word-wrap: break-word;
        }

        .chat-message.user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .chat-message.assistant,
        .chat-message.system {
          align-self: flex-start;
          align-items: flex-start;
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--color-textSecondary, #6b7280);
        }

        .message-avatar {
          font-size: 16px;
          line-height: 1;
        }

        .message-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .message-sender {
          font-weight: 500;
        }

        .message-time {
          opacity: 0.7;
        }

        .message-content {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .chat-message.user .message-content {
          background: var(--color-primary, #3b82f6);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .chat-message.assistant .message-content {
          background: var(--color-surfaceSecondary, #f8fafc);
          color: var(--color-text, #1f2937);
          border: 1px solid var(--color-border, #e5e7eb);
          border-bottom-left-radius: 4px;
        }

        .chat-message.system .message-content {
          background: var(--color-warning, #fef3c7);
          color: var(--color-warningText, #92400e);
          border: 1px solid var(--color-warningBorder, #fcd34d);
          text-align: center;
          font-style: italic;
          border-radius: 8px;
        }

        .chat-message.system {
          align-self: center;
          max-width: 100%;
        }

        .chat-message.system .message-header {
          justify-content: center;
        }

        @media (max-width: 768px) {
          .chat-message {
            max-width: 95%;
          }
          
          .message-content {
            font-size: 13px;
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatMessage;