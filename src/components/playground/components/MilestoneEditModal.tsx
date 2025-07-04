import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  Target, 
  AlertCircle,
  Save,
  Loader2,
  Archive,
  RotateCcw,
  Trash2,
  Clock,
  History
} from 'lucide-react';
import type { 
  Milestone,
  UpdateMilestoneData,
  ProjectWithMilestones, 
  TeamMember,
  MilestoneStatus,
  TaskPriority
} from '../../milestones/types';

interface MilestoneEditModalProps {
  isOpen: boolean;
  milestone: Milestone | null;
  onClose: () => void;
  onSubmit: (milestoneId: string, updates: UpdateMilestoneData) => Promise<void>;
  onDelete: (milestoneId: string) => Promise<void>;
  projects: ProjectWithMilestones[];
  teamMembers: TeamMember[];
  existingMilestones: Milestone[];
  enableArchive?: boolean;
}

interface FormData {
  title: string;
  description: string;
  dueDate: string;
  status: MilestoneStatus;
  priority: TaskPriority;
  color: string;
  assignedTo: string[];
  tags: string[];
  estimatedHours: number;
  actualHours: number;
  budgetAllocated: number;
  budgetSpent: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  stakeholders: string[];
  deliverables: string[];
  isArchived: boolean;
}

export const MilestoneEditModal: React.FC<MilestoneEditModalProps> = ({
  isOpen,
  milestone,
  onClose,
  onSubmit,
  onDelete,
  projects,
  teamMembers,
  existingMilestones,
  enableArchive = true
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    dueDate: '',
    status: 'pending',
    priority: 'medium',
    color: '#3b82f6',
    assignedTo: [],
    tags: [],
    estimatedHours: 0,
    actualHours: 0,
    budgetAllocated: 0,
    budgetSpent: 0,
    riskLevel: 'medium',
    stakeholders: [],
    deliverables: [],
    isArchived: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [currentDeliverable, setCurrentDeliverable] = useState('');

  // Reset form when milestone changes
  useEffect(() => {
    if (milestone) {
      setFormData({
        title: milestone.title,
        description: milestone.description || '',
        dueDate: milestone.dueDate ? milestone.dueDate.slice(0, 16) : '', // Convert to datetime-local format
        status: milestone.status,
        priority: milestone.priority,
        color: milestone.color,
        assignedTo: milestone.assignedTo || [],
        tags: milestone.metadata.tags || [],
        estimatedHours: milestone.metadata.estimatedHours || 0,
        actualHours: milestone.metadata.actualHours || 0,
        budgetAllocated: milestone.metadata.budgetAllocated || 0,
        budgetSpent: milestone.metadata.budgetSpent || 0,
        riskLevel: milestone.metadata.riskLevel || 'medium',
        stakeholders: milestone.metadata.stakeholders || [],
        deliverables: milestone.metadata.deliverables || [],
        isArchived: milestone.isArchived
      });
      setErrors({});
      setHasChanges(false);
      setShowDeleteConfirm(false);
    }
  }, [milestone]);

  // Track changes
  useEffect(() => {
    if (!milestone) return;
    
    const originalData = {
      title: milestone.title,
      description: milestone.description || '',
      dueDate: milestone.dueDate ? milestone.dueDate.slice(0, 16) : '',
      status: milestone.status,
      priority: milestone.priority,
      color: milestone.color,
      assignedTo: milestone.assignedTo || [],
      tags: milestone.metadata.tags || [],
      estimatedHours: milestone.metadata.estimatedHours || 0,
      actualHours: milestone.metadata.actualHours || 0,
      budgetAllocated: milestone.metadata.budgetAllocated || 0,
      budgetSpent: milestone.metadata.budgetSpent || 0,
      riskLevel: milestone.metadata.riskLevel || 'medium',
      stakeholders: milestone.metadata.stakeholders || [],
      deliverables: milestone.metadata.deliverables || [],
      isArchived: milestone.isArchived
    };

    const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [formData, milestone]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Milestone title is required';
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date() && formData.status !== 'completed') {
      newErrors.dueDate = 'Due date cannot be in the past for non-completed milestones';
    }

    if (formData.estimatedHours < 0) {
      newErrors.estimatedHours = 'Estimated hours cannot be negative';
    }

    if (formData.actualHours < 0) {
      newErrors.actualHours = 'Actual hours cannot be negative';
    }

    if (formData.budgetAllocated < 0) {
      newErrors.budgetAllocated = 'Budget allocated cannot be negative';
    }

    if (formData.budgetSpent < 0) {
      newErrors.budgetSpent = 'Budget spent cannot be negative';
    }

    if (formData.budgetSpent > formData.budgetAllocated && formData.budgetAllocated > 0) {
      newErrors.budgetSpent = 'Budget spent cannot exceed allocated budget';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!milestone || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updates: UpdateMilestoneData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        dueDate: formData.dueDate || undefined,
        status: formData.status,
        priority: formData.priority,
        color: formData.color,
        assignedTo: formData.assignedTo,
        isArchived: formData.isArchived,
        metadata: {
          estimatedHours: formData.estimatedHours || undefined,
          actualHours: formData.actualHours || undefined,
          budgetAllocated: formData.budgetAllocated || undefined,
          budgetSpent: formData.budgetSpent || undefined,
          tags: formData.tags,
          riskLevel: formData.riskLevel,
          stakeholders: formData.stakeholders,
          deliverables: formData.deliverables
        }
      };

      // Set completion timestamp if status changed to completed
      if (formData.status === 'completed' && milestone.status !== 'completed') {
        updates.completedAt = new Date().toISOString();
        updates.progress = 100;
      } else if (formData.status !== 'completed' && milestone.status === 'completed') {
        updates.completedAt = undefined;
      }

      await onSubmit(milestone.id, updates);
      onClose();
    } catch (error) {
      console.error('Failed to update milestone:', error);
      setErrors({ submit: 'Failed to update milestone. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!milestone) return;
    
    setIsDeleting(true);
    try {
      await onDelete(milestone.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete milestone:', error);
      setErrors({ delete: 'Failed to delete milestone. Please try again.' });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(currentTag.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, currentTag.trim()]
        }));
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addDeliverable = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentDeliverable.trim()) {
      e.preventDefault();
      if (!formData.deliverables.includes(currentDeliverable.trim())) {
        setFormData(prev => ({
          ...prev,
          deliverables: [...prev.deliverables, currentDeliverable.trim()]
        }));
      }
      setCurrentDeliverable('');
    }
  };

  const removeDeliverable = (deliverableToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter(d => d !== deliverableToRemove)
    }));
  };

  const toggleAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter(id => id !== userId)
        : [...prev.assignedTo, userId]
    }));
  };

  const isOverdue = milestone?.dueDate && 
    new Date(milestone.dueDate) < new Date() && 
    milestone.status !== 'completed' && 
    milestone.status !== 'cancelled';

  const budgetUtilization = formData.budgetAllocated > 0 
    ? (formData.budgetSpent / formData.budgetAllocated) * 100
    : 0;

  if (!isOpen || !milestone) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Milestone</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm text-gray-500">
                  Created {new Date(milestone.createdAt).toLocaleDateString()}
                </span>
                {milestone.completedAt && (
                  <span className="text-sm text-green-600">
                    Completed {new Date(milestone.completedAt).toLocaleDateString()}
                  </span>
                )}
                {isOverdue && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    <Clock className="h-3 w-3 mr-1" />
                    Overdue
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Indicator */}
          {hasChanges && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                You have unsaved changes
              </p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Milestone Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter milestone title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as MilestoneStatus }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="datetime-local"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dueDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.dueDate}
                </p>
              )}
            </div>

            {/* Color */}
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the milestone objectives and deliverables"
            />
          </div>

          {/* Progress and Time Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Tracking
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="estimatedHours" className="block text-xs text-gray-500 mb-1">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    id="estimatedHours"
                    min="0"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="actualHours" className="block text-xs text-gray-500 mb-1">
                    Actual Hours
                  </label>
                  <input
                    type="number"
                    id="actualHours"
                    min="0"
                    value={formData.actualHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, actualHours: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Tracking
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="budgetAllocated" className="block text-xs text-gray-500 mb-1">
                    Allocated
                  </label>
                  <input
                    type="number"
                    id="budgetAllocated"
                    min="0"
                    value={formData.budgetAllocated}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetAllocated: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="budgetSpent" className="block text-xs text-gray-500 mb-1">
                    Spent
                  </label>
                  <input
                    type="number"
                    id="budgetSpent"
                    min="0"
                    value={formData.budgetSpent}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetSpent: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.budgetSpent ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
              {formData.budgetAllocated > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Budget Utilization</span>
                    <span>{budgetUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        budgetUtilization > 100 ? 'bg-red-600' : 
                        budgetUtilization > 80 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {errors.budgetSpent && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.budgetSpent}
                </p>
              )}
            </div>
          </div>

          {/* Risk Level */}
          <div>
            <label htmlFor="riskLevel" className="block text-sm font-medium text-gray-700 mb-2">
              Risk Level
            </label>
            <select
              id="riskLevel"
              value={formData.riskLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, riskLevel: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Team Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Team Members
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
              {teamMembers.map(member => (
                <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.assignedTo.includes(member.id)}
                    onChange={() => toggleAssignee(member.id)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{member.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={addTag}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add tags (press Enter)"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <label htmlFor="deliverables" className="block text-sm font-medium text-gray-700 mb-2">
              Deliverables
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={currentDeliverable}
                onChange={(e) => setCurrentDeliverable(e.target.value)}
                onKeyDown={addDeliverable}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add deliverable (press Enter)"
              />
              {formData.deliverables.length > 0 && (
                <div className="space-y-1">
                  {formData.deliverables.map((deliverable, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded border cursor-pointer"
                      onClick={() => removeDeliverable(deliverable)}
                    >
                      <span className="text-sm text-gray-700">{deliverable}</span>
                      <X className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Archive Toggle */}
          {enableArchive && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isArchived"
                checked={formData.isArchived}
                onChange={(e) => setFormData(prev => ({ ...prev, isArchived: e.target.checked }))}
                className="text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isArchived" className="text-sm font-medium text-gray-700">
                Archive this milestone
              </label>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            {/* Destructive Actions */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>

            {/* Primary Actions */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !hasChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Milestone</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete "{milestone.title}"? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};