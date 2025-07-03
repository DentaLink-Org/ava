/**
 * Theme Variation Modal
 * Modal for saving customized themes as variations
 */

'use client';

import React, { useState } from 'react';
import { X, Save, Info } from 'lucide-react';
import { RuntimeTheme } from '../../_shared/types/theme';

interface ThemeVariationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
  parentTheme: RuntimeTheme | null;
  currentPageId?: string;
}

export const ThemeVariationModal: React.FC<ThemeVariationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  parentTheme,
  currentPageId
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !parentTheme) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for the variation');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(name.trim(), description.trim());
      // Reset form
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save variation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setError(null);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Save Theme Variation</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Info */}
            <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
              <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  Saving variation of "{parentTheme.displayName}"
                </p>
                <p>
                  This will create a new variation that can be applied to any page
                  {currentPageId && ` (currently customizing: ${currentPageId})`}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="variation-name" className="block text-sm font-medium mb-1">
                  Variation Name
                </label>
                <input
                  id="variation-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., High Contrast Orange"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="variation-description" className="block text-sm font-medium mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="variation-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what makes this variation unique..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Variation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};