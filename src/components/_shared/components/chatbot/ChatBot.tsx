'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatBotProps {
  className?: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Hello! I\'m Claude, your AI assistant. I can help you with coding tasks, file operations, and system administration. What would you like to work on?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/claude/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: content,
          context: {
            pageId: 'playground',
            currentPage: window.location.pathname,
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.result || 'I received your message but couldn\'t generate a response.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className={`chatbot-container ${isOpen ? 'open' : 'closed'} ${className}`}>
        <div className="chatbot-header" onClick={toggleChat}>
          <div className="chatbot-title">
            <div className="chatbot-avatar">🤖</div>
            <span>Claude Assistant</span>
          </div>
          <button className="chatbot-toggle">
            {isOpen ? '−' : '+'}
          </button>
        </div>
        
        {isOpen && (
          <div className="chatbot-content">
            <div className="chatbot-messages">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="loading-indicator">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        )}
      </div>

      <style jsx>{`
        .chatbot-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 400px;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          font-family: var(--font-family, 'Inter, system-ui, sans-serif');
          transition: all 0.3s ease;
        }

        .chatbot-container.closed {
          height: 60px;
        }

        .chatbot-container.open {
          height: 500px;
        }

        .chatbot-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--color-primary, #3b82f6);
          color: white;
          border-radius: 12px 12px 0 0;
          cursor: pointer;
          user-select: none;
        }

        .chatbot-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
        }

        .chatbot-avatar {
          font-size: 20px;
        }

        .chatbot-toggle {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .chatbot-content {
          display: flex;
          flex-direction: column;
          height: 440px;
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .loading-indicator {
          display: flex;
          justify-content: flex-start;
          padding: 8px 12px;
        }

        .loading-dots {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .loading-dots span {
          width: 6px;
          height: 6px;
          background: var(--color-textSecondary, #6b7280);
          border-radius: 50%;
          animation: loading-bounce 1.4s infinite ease-in-out both;
        }

        .loading-dots span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .loading-dots span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes loading-bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        @media (max-width: 768px) {
          .chatbot-container {
            width: calc(100vw - 40px);
            right: 20px;
            left: 20px;
          }
          
          .chatbot-container.open {
            height: 70vh;
            max-height: 500px;
          }
          
          .chatbot-content {
            height: calc(70vh - 60px);
            max-height: 440px;
          }
        }
      `}</style>
    </>
  );
};

export default ChatBot;