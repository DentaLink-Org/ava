'use client';

import React, { useState } from 'react';

interface IssueFormProps {
  onSubmit: (issueData: { title: string; description: string; tags?: string[] }) => void;
  onCancel: () => void;
  pageId: string;
}

export const IssueForm: React.FC<IssueFormProps> = ({ 
  onSubmit, 
  onCancel, 
  pageId 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        tags: tagsArray.length > 0 ? tagsArray : undefined
      });

      // Reset form
      setTitle('');
      setDescription('');
      setTags('');
    } catch (error) {
      console.error('Error creating issue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="issue-form-container" onKeyDown={handleKeyDown}>
      <div className="issue-form-header">
        <h3>Report New Issue</h3>
        <span className="page-indicator">on {pageId}</span>
      </div>
      
      <form onSubmit={handleSubmit} className="issue-form">
        <div className="form-group">
          <label htmlFor="issue-title">Issue Title *</label>
          <input
            id="issue-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue"
            maxLength={100}
            required
            autoFocus
          />
          <div className="char-count">{title.length}/100</div>
        </div>

        <div className="form-group">
          <label htmlFor="issue-description">Detailed Description *</label>
          <textarea
            id="issue-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail. Include steps to reproduce, expected behavior, and any error messages..."
            rows={4}
            maxLength={1000}
            required
          />
          <div className="char-count">{description.length}/1000</div>
        </div>

        <div className="form-group">
          <label htmlFor="issue-tags">Tags (optional)</label>
          <input
            id="issue-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="bug, ui, performance, api (comma separated)"
            maxLength={200}
          />
          <div className="form-hint">
            Add relevant tags to help categorize this issue
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-cancel"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={!title.trim() || !description.trim() || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Issue'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .issue-form-container {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 8px;
          margin: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .issue-form-header {
          padding: 16px;
          border-bottom: 1px solid var(--color-border, #e5e7eb);
          background: var(--color-surfaceSecondary, #f8fafc);
          border-radius: 8px 8px 0 0;
        }

        .issue-form-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text, #1f2937);
        }

        .page-indicator {
          font-size: 12px;
          color: var(--color-textSecondary, #6b7280);
          font-weight: 400;
        }

        .issue-form {
          padding: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group:last-of-type {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text, #1f2937);
        }

        input, textarea {
          width: 100%;
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 13px;
          font-family: inherit;
          background: var(--color-surface, #ffffff);
          color: var(--color-text, #1f2937);
          transition: border-color 0.2s ease;
          box-sizing: border-box;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: var(--color-primary, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        textarea {
          resize: vertical;
          min-height: 80px;
          line-height: 1.5;
        }

        .char-count {
          text-align: right;
          font-size: 11px;
          color: var(--color-textSecondary, #6b7280);
          margin-top: 4px;
        }

        .form-hint {
          font-size: 11px;
          color: var(--color-textSecondary, #6b7280);
          margin-top: 4px;
        }

        .form-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          padding-top: 8px;
          border-top: 1px solid var(--color-border, #e5e7eb);
        }

        .btn-cancel, .btn-submit {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid;
        }

        .btn-cancel {
          background: transparent;
          border-color: var(--color-border, #e5e7eb);
          color: var(--color-textSecondary, #6b7280);
        }

        .btn-cancel:hover:not(:disabled) {
          background: var(--color-surfaceSecondary, #f8fafc);
          border-color: var(--color-textSecondary, #6b7280);
        }

        .btn-submit {
          background: var(--color-primary, #3b82f6);
          border-color: var(--color-primary, #3b82f6);
          color: white;
        }

        .btn-submit:hover:not(:disabled) {
          background: var(--color-primaryDark, #2563eb);
          border-color: var(--color-primaryDark, #2563eb);
          transform: translateY(-1px);
        }

        .btn-submit:disabled, .btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .issue-form-container {
            margin: 8px;
          }
          
          .issue-form {
            padding: 12px;
          }
          
          .form-actions {
            flex-direction: column-reverse;
          }
          
          .btn-cancel, .btn-submit {
            width: 100%;
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default IssueForm;