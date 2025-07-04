import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  Target, 
  AlertCircle,
  Plus,
  Loader2
} from 'lucide-react';
import type { 
  CreateMilestoneData, 
  ProjectWithMilestones, 
  TeamMember, 
  Milestone,
  CreateDependencyData,
  TaskPriority
} from '../../milestones/types';

interface MilestoneCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (milestone: CreateMilestoneData) => Promise<void>;
  projects: ProjectWithMilestones[];
  teamMembers: TeamMember[];
  existingMilestones: Milestone[];
  defaultProject?: string;
  defaultDueDate?: string;
}

const initialFormData = {
  projectId: '',
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium' as TaskPriority,
  color: '#3b82f6',
  assignedTo: [] as string[],
  tags: [] as string[],
  estimatedHours: 0,
  budgetAllocated: 0,
  riskLevel: 'medium' as const,
  stakeholders: [] as string[],
  deliverables: [] as string[],
  dependencies: [] as CreateDependencyData[]
};

export const MilestoneCreateModal: React.FC<MilestoneCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects,
  teamMembers,
  existingMilestones,
  defaultProject,
  defaultDueDate
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [currentDeliverable, setCurrentDeliverable] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...initialFormData,
        projectId: defaultProject || '',
        dueDate: defaultDueDate || ''
      });
      setErrors({});
    }
  }, [isOpen, defaultProject, defaultDueDate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Milestone title is required';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project selection is required';
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    if (formData.estimatedHours < 0) {
      newErrors.estimatedHours = 'Estimated hours cannot be negative';
    }

    if (formData.budgetAllocated < 0) {
      newErrors.budgetAllocated = 'Budget cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const milestoneData: CreateMilestoneData = {
        projectId: formData.projectId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        dueDate: formData.dueDate || undefined,
        priority: formData.priority,
        color: formData.color,
        assignedTo: formData.assignedTo,
        metadata: {
          estimatedHours: formData.estimatedHours || undefined,
          budgetAllocated: formData.budgetAllocated || undefined,
          tags: formData.tags,
          riskLevel: formData.riskLevel,
          stakeholders: formData.stakeholders,
          deliverables: formData.deliverables
        },
        dependencies: formData.dependencies.length > 0 ? formData.dependencies : undefined
      };

      await onSubmit(milestoneData);
      onClose();
    } catch (error) {
      console.error('Failed to create milestone:', error);
      setErrors({ submit: 'Failed to create milestone. Please try again.' });
    } finally {
      setIsSubmitting(false);
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

  const addDependency = (dependsOnId: string) => {
    if (!formData.dependencies.find(d => d.dependsOnId === dependsOnId)) {
      setFormData(prev => ({
        ...prev,
        dependencies: [
          ...prev.dependencies,
          {
            milestoneId: '', // Will be set after milestone creation
            dependsOnId,
            dependencyType: 'finish_to_start',
            lagDays: 0
          }
        ]
      }));
    }
  };

  const removeDependency = (dependsOnId: string) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.filter(d => d.dependsOnId !== dependsOnId)
    }));
  };

  if (!isOpen) return null;

  // Filter milestones for current project
  const projectMilestones = existingMilestones.filter(m => 
    m.projectId === formData.projectId && m.status !== 'completed'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Create New Milestone</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

            {/* Project */}
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <select
                id="projectId"
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.projectId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.projectId}
                </p>
              )}
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
                  placeholder="#3b82f6"
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

          {/* Planning Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Estimated Hours */}
            <div>
              <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* Budget */}
            <div>
              <label htmlFor="budgetAllocated" className="block text-sm font-medium text-gray-700 mb-2">
                Budget Allocated
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
                <option value="urgent">Urgent</option>
              </select>
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

          {/* Dependencies */}
          {projectMilestones.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dependencies
              </label>
              <div className="border border-gray-200 rounded-md p-3 max-h-32 overflow-y-auto">
                {projectMilestones.map(milestone => (
                  <label key={milestone.id} className="flex items-center space-x-2 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={formData.dependencies.some(d => d.dependsOnId === milestone.id)}
                      onChange={() => {
                        if (formData.dependencies.some(d => d.dependsOnId === milestone.id)) {
                          removeDependency(milestone.id);
                        } else {
                          addDependency(milestone.id);
                        }
                      }}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{milestone.title}</span>
                  </label>
                ))}
              </div>
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
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
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
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Milestone
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};