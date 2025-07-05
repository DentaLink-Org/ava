'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import { DocumentBlock } from '../../types';

interface CodeBlockProps {
  block: DocumentBlock;
  onUpdate: (updates: Partial<DocumentBlock>) => void;
  isEditing: boolean;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'plain', label: 'Plain Text' }
];

export function CodeBlock({ block, onUpdate, isEditing }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const currentLanguage = block.content.code?.language || 'plain';
  const currentCode = block.content.code?.code || '';

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(120, textarea.scrollHeight) + 'px';
    }
  }, [isEditing, currentCode]);

  const handleLanguageChange = (language: string) => {
    onUpdate({
      content: {
        ...block.content,
        code: {
          language,
          code: block.content.code?.code || '',
          filename: block.content.code?.filename
        }
      }
    });
  };

  const handleCodeChange = (code: string) => {
    onUpdate({
      content: {
        ...block.content,
        code: {
          language: block.content.code?.language || 'plain',
          code,
          filename: block.content.code?.filename
        }
      }
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lineCount = currentCode.split('\n').length;
  const shouldShowLineNumbers = lineCount > 3;
  const isLongCode = lineCount > 10;

  if (isEditing) {
    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* Header with language selector */}
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code size={16} className="text-gray-600" />
            <select
              value={currentLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-gray-500">
            {lineCount} lines
          </div>
        </div>
        
        {/* Code textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={currentCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder={`Enter ${LANGUAGES.find(l => l.value === currentLanguage)?.label || 'code'} here...`}
            className="w-full p-4 font-mono text-sm resize-none border-none outline-none"
            style={{ 
              minHeight: '120px',
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              lineHeight: '1.5'
            }}
            spellCheck={false}
          />
        </div>
      </div>
    );
  }

  // View mode
  const displayCode = isLongCode && !isExpanded 
    ? currentCode.split('\n').slice(0, 10).join('\n') + '\n...'
    : currentCode;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {LANGUAGES.find(l => l.value === currentLanguage)?.label || 'Code'}
          </span>
          {lineCount > 1 && (
            <span className="text-xs text-gray-500">
              {lineCount} lines
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLongCode && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 p-1 rounded"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-600" />
                <span className="text-green-600">Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code display */}
      <div className="relative">
        <pre 
          className="p-4 text-sm overflow-x-auto"
          style={{
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            margin: 0,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
            lineHeight: '1.5'
          }}
        >
          {shouldShowLineNumbers && (
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-800 border-r border-gray-700 flex flex-col text-gray-500 text-xs pt-4">
              {displayCode.split('\n').map((_, index) => (
                <div key={index} className="h-[1.5em] flex items-center justify-end pr-2">
                  {index + 1}
                </div>
              ))}
            </div>
          )}
          <code 
            className={shouldShowLineNumbers ? 'ml-12 block' : 'block'}
          >
            {displayCode || 'Empty code block'}
          </code>
        </pre>
      </div>
    </div>
  );
}