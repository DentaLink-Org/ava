import React, { useState, useCallback, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Flag, 
  Tag, 
  Clock, 
  Target, 
  Brain, 
  Activity, 
  AlertTriangle,
  Users,
  Save,
  Plus,
  ChevronDown,
  ChevronUp,
  Info,
  BookOpen,
  Link2,
  Upload,
  CheckCircle
} from 'lucide-react';
import type { 
  CreateTaskData, 
  Project, 
  TeamMember, 
  TaskStatus, 
  TaskPriority,
  TaskTemplate,
  TaskDependency
} from '../../tasks/types';
import { DependencyType } from '../../tasks/types';
import { 
  TaskComplexity,
  TaskEffort,
  TaskRisk
} from '../../tasks/types';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskData) => Promise<void>;
  projects: Project[];
  teamMembers: TeamMember[];
  statuses: TaskStatus[];
  templates?: TaskTemplate[];
  availableTasks?: { id: string; title: string }[];
  defaultProject?: string;
  defaultMilestone?: string;
  defaultStatus?: string;
  enableAdvanced?: boolean;
  enableTemplates?: boolean;
  enableDependencies?: boolean;
  enableTimeTracking?: boolean;
  enableCustomFields?: boolean;
}

interface FormData {
  // Basic fields
  title: string;
  description: string;
  projectId: string;
  milestoneId: string;
  assigneeId: string;
  statusId: string;
  priority: TaskPriority;
  dueDate: string;
  tags: string[];
  
  // Enhanced fields
  estimatedHours: number;
  storyPoints: number;
  effortLevel: TaskEffort;
  complexity: TaskComplexity;
  riskLevel: TaskRisk;
  
  // Advanced fields
  templateId: string;
  dependencies: TaskDependency[];
  customFields: Record<string, any>;
  metadata: Record<string, any>;
  
  // Flags
  createAsTemplate: boolean;
  templateName: string;
  templateCategory: string;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects,
  teamMembers,
  statuses,
  templates = [],
  availableTasks = [],
  defaultProject,
  defaultMilestone,
  defaultStatus,
  enableAdvanced = true,
  enableTemplates = true,
  enableDependencies = true,
  enableTimeTracking = true,
  enableCustomFields = true
}) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'dependencies' | 'template'>('basic');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    projectId: defaultProject || '',
    milestoneId: defaultMilestone || '',
    assigneeId: '',
    statusId: defaultStatus || statuses.find(s => s.isDefault)?.id || '',
    priority: 'medium',
    dueDate: '',
    tags: [],
    estimatedHours: 0,
    storyPoints: 0,
    effortLevel: TaskEffort.MODERATE,
    complexity: TaskComplexity.MODERATE,
    riskLevel: TaskRisk.LOW,
    templateId: '',
    dependencies: [],
    customFields: {},
    metadata: {},
    createAsTemplate: false,
    templateName: '',
    templateCategory: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    warnings: string[];
  }>({ isValid: true, warnings: [] });

  // Real-time validation
  useEffect(() => {
    validateForm();
  }, [formData]);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const warnings: string[] = [];

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    if (!formData.statusId) {
      newErrors.statusId = 'Status is required';
    }

    // Validation warnings
    if (formData.estimatedHours > 100) {
      warnings.push('Estimated hours seem very high. Consider breaking down the task.');
    }

    if (formData.storyPoints > 20) {
      warnings.push('Story points are quite high. Consider smaller tasks.');
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      if (dueDate < today) {
        warnings.push('Due date is in the past.');
      }
    }

    if (formData.riskLevel === 'critical' || formData.riskLevel === 'high') {
      warnings.push('High risk task - consider risk mitigation strategies.');
    }

    if (formData.dependencies.length > 5) {
      warnings.push('Too many dependencies might create bottlenecks.');
    }

    // Template validation
    if (formData.createAsTemplate) {
      if (!formData.templateName.trim()) {
        newErrors.templateName = 'Template name is required';
      }
      if (!formData.templateCategory.trim()) {
        newErrors.templateCategory = 'Template category is required';
      }
    }

    setErrors(newErrors);
    setValidationResult({
      isValid: Object.keys(newErrors).length === 0,
      warnings
    });

    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const selectedStatus = statuses.find(s => s.id === formData.statusId);
      if (!selectedStatus) {
        throw new Error('Invalid status selected');
      }

      const taskData: CreateTaskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: selectedStatus,
        priority: formData.priority,
        projectId: formData.projectId,
        milestoneId: formData.milestoneId || undefined,
        assigneeId: formData.assigneeId || undefined,
        createdBy: 'current-user', // Would come from auth context
        dueDate: formData.dueDate || undefined,
        estimatedHours: formData.estimatedHours > 0 ? formData.estimatedHours : undefined,
        storyPoints: formData.storyPoints,
        effortLevel: formData.effortLevel,
        complexity: formData.complexity,
        riskLevel: formData.riskLevel,
        tags: formData.tags,
        customFields: formData.customFields,
        metadata: formData.metadata,
        position: 0,
        progress: 0,
        dependencies: formData.dependencies,
        timeEntries: [],
        templateId: formData.templateId || undefined
      };

      await onSubmit(taskData);
      
      // Reset form
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      setErrors({ submit: 'Failed to create task. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      projectId: defaultProject || '',
      milestoneId: defaultMilestone || '',
      assigneeId: '',
      statusId: defaultStatus || statuses.find(s => s.isDefault)?.id || '',
      priority: 'medium',
      dueDate: '',
      tags: [],
      estimatedHours: 0,
      storyPoints: 0,
      effortLevel: TaskEffort.MODERATE,
      complexity: TaskComplexity.MODERATE,
      riskLevel: TaskRisk.LOW,
      templateId: '',
      dependencies: [],
      customFields: {},
      metadata: {},
      createAsTemplate: false,
      templateName: '',
      templateCategory: ''
    });
    setTagInput('');
    setErrors({});
    setActiveTab('basic');
    setShowAdvanced(false);
  }, [defaultProject, defaultMilestone, defaultStatus, statuses]);

  // Apply template
  const applyTemplate = useCallback((template: TaskTemplate) => {
    const templateData = template.templateData as Partial<FormData>;
    
    setFormData(prev => ({
      ...prev,
      title: templateData.title || '',
      description: templateData.description || '',
      priority: templateData.priority || template.defaultPriority,
      estimatedHours: template.defaultEstimatedHours || 0,
      tags: template.defaultTags || [],
      effortLevel: templateData.effortLevel || TaskEffort.MODERATE,
      complexity: templateData.complexity || TaskComplexity.MODERATE,
      riskLevel: templateData.riskLevel || TaskRisk.LOW,
      storyPoints: templateData.storyPoints || 0,
      assigneeId: template.defaultAssigneeId || '',
      projectId: template.defaultProjectId || prev.projectId,
      customFields: templateData.customFields || {},
      templateId: template.id
    }));
  }, []);

  // Handle tag operations
  const handleTagAdd = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag) && formData.tags.length < 20) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  const handleTagRemove = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // Handle dependency operations
  const addDependency = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      dependencies: [
        ...prev.dependencies,
        {
          id: `temp-${Date.now()}`,
          taskId: '',
          dependsOnId: '',
          dependencyType: DependencyType.FINISH_TO_START,
          lagHours: 0,
          isBlocking: true,
          createdAt: new Date().toISOString(),
          notes: ''
        }
      ]
    }));
  }, []);

  const updateDependency = useCallback((index: number, updates: Partial<TaskDependency>) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.map((dep, i) => 
        i === index ? { ...dep, ...updates } : dep
      )
    }));
  }, []);

  const removeDependency = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.filter((_, i) => i !== index)
    }));
  }, []);

  // Style helpers
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'border-red-300 bg-red-50';
      case 'high': return 'border-orange-300 bg-orange-50';
      case 'medium': return 'border-blue-300 bg-blue-50';
      case 'low': return 'border-gray-300 bg-gray-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a comprehensive task with advanced features and metadata
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'basic'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          {enableAdvanced && (
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'advanced'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('advanced')}
            >
              Advanced
            </button>
          )}
          {enableDependencies && (
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'dependencies'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('dependencies')}
            >
              Dependencies
            </button>
          )}
          {enableTemplates && templates.length > 0 && (
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'template'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('template')}
            >
              Templates
            </button>
          )}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="h-full">
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter a clear, descriptive task title..."
                    maxLength={200}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.title.length}/200 characters
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Provide detailed information about the task, requirements, and acceptance criteria..."
                  />
                </div>

                {/* Project and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project *
                    </label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                      <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.statusId}
                      onChange={(e) => setFormData(prev => ({ ...prev, statusId: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.statusId ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      {statuses.map(status => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                    {errors.statusId && (
                      <p className="mt-1 text-sm text-red-600">{errors.statusId}</p>
                    )}
                  </div>
                </div>

                {/* Assignee and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Assignee
                    </label>
                    <select
                      value={formData.assigneeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Flag className="w-4 h-4 inline mr-1" />
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getPriorityColor(formData.priority)}`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Due Date and Estimated Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.5"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagAdd}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type a tag and press Enter..."
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleTagRemove(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.tags.length}/20 tags
                  </p>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && enableAdvanced && (
              <div className="space-y-6">
                {/* Story Points and Complexity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Target className="w-4 h-4 inline mr-1" />
                      Story Points
                    </label>
                    <input
                      type="number"
                      value={formData.storyPoints}
                      onChange={(e) => setFormData(prev => ({ ...prev, storyPoints: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Agile estimation points (Fibonacci scale recommended)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Brain className="w-4 h-4 inline mr-1" />
                      Complexity
                    </label>
                    <select
                      value={formData.complexity}
                      onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value as TaskComplexity }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="simple">Simple</option>
                      <option value="moderate">Moderate</option>
                      <option value="complex">Complex</option>
                      <option value="very_complex">Very Complex</option>
                    </select>
                  </div>
                </div>

                {/* Effort and Risk */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Activity className="w-4 h-4 inline mr-1" />
                      Effort Level
                    </label>
                    <select
                      value={formData.effortLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, effortLevel: e.target.value as TaskEffort }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="minimal">Minimal</option>
                      <option value="light">Light</option>
                      <option value="moderate">Moderate</option>
                      <option value="heavy">Heavy</option>
                      <option value="intensive">Intensive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Risk Level
                    </label>
                    <select
                      value={formData.riskLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, riskLevel: e.target.value as TaskRisk }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Save as Template */}
                {enableTemplates && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="checkbox"
                        id="createAsTemplate"
                        checked={formData.createAsTemplate}
                        onChange={(e) => setFormData(prev => ({ ...prev, createAsTemplate: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor="createAsTemplate" className="text-sm font-medium text-gray-700">
                        Save as Template
                      </label>
                    </div>
                    
                    {formData.createAsTemplate && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Template Name *
                          </label>
                          <input
                            type="text"
                            value={formData.templateName}
                            onChange={(e) => setFormData(prev => ({ ...prev, templateName: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg text-sm ${
                              errors.templateName ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="My Task Template"
                          />
                          {errors.templateName && (
                            <p className="mt-1 text-xs text-red-600">{errors.templateName}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Category *
                          </label>
                          <input
                            type="text"
                            value={formData.templateCategory}
                            onChange={(e) => setFormData(prev => ({ ...prev, templateCategory: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg text-sm ${
                              errors.templateCategory ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Development, Design, etc."
                          />
                          {errors.templateCategory && (
                            <p className="mt-1 text-xs text-red-600">{errors.templateCategory}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Dependencies Tab */}
            {activeTab === 'dependencies' && enableDependencies && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Task Dependencies</h3>
                    <p className="text-sm text-gray-600">
                      Define relationships between this task and other tasks
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addDependency}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Dependency
                  </button>
                </div>

                {formData.dependencies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Link2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No dependencies defined</p>
                    <p className="text-sm">Add dependencies to establish task relationships</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.dependencies.map((dependency, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Depends On Task
                            </label>
                            <select
                              value={dependency.dependsOnId}
                              onChange={(e) => updateDependency(index, { dependsOnId: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            >
                              <option value="">Select a task</option>
                              {availableTasks.map(task => (
                                <option key={task.id} value={task.id}>
                                  {task.title}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Relationship Type
                            </label>
                            <select
                              value={dependency.dependencyType}
                              onChange={(e) => updateDependency(index, { dependencyType: e.target.value as DependencyType })}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            >
                              <option value="finish_to_start">Finish to Start</option>
                              <option value="start_to_start">Start to Start</option>
                              <option value="finish_to_finish">Finish to Finish</option>
                              <option value="start_to_finish">Start to Finish</option>
                            </select>
                          </div>

                          <div className="flex items-end space-x-2">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Lag (hours)
                              </label>
                              <input
                                type="number"
                                value={dependency.lagHours}
                                onChange={(e) => updateDependency(index, { lagHours: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                min="0"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDependency(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={dependency.notes || ''}
                            onChange={(e) => updateDependency(index, { notes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            placeholder="Optional notes about this dependency..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'template' && enableTemplates && templates.length > 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Task Templates</h3>
                  <p className="text-sm text-gray-600">
                    Choose from pre-defined templates to quickly create tasks
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.templateId === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => applyTemplate(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {template.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              Used {template.usageCount} times
                            </span>
                          </div>
                        </div>
                        {formData.templateId === template.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Warnings */}
            {validationResult.warnings.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Warnings</h4>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Info className="w-4 h-4" />
              <span>
                {validationResult.isValid ? 'Ready to create' : 'Please fix errors before creating'}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!validationResult.isValid || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Task
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};