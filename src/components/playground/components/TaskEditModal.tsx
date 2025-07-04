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
  CheckCircle,
  Trash2,
  Archive,
  Copy,
  History,
  MessageSquare,
  Paperclip,
  Timer,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import type { 
  Task,
  UpdateTaskData, 
  Project, 
  TeamMember, 
  TaskStatus, 
  TaskPriority,
  TaskComplexity,
  TaskEffort,
  TaskRisk,
  TaskTemplate,
  TaskDependency,
  DependencyType,
  TaskHistory,
  TaskComment,
  TaskAttachment,
  TaskTimeEntry
} from '../../tasks/types';

interface TaskEditModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdate: (taskId: string, updates: UpdateTaskData) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onArchive?: (taskId: string) => Promise<void>;
  onDuplicate?: (task: Task) => Promise<void>;
  projects: Project[];
  teamMembers: TeamMember[];
  statuses: TaskStatus[];
  templates?: TaskTemplate[];
  availableTasks?: { id: string; title: string }[];
  taskHistory?: TaskHistory[];
  enableAdvanced?: boolean;
  enableDependencies?: boolean;
  enableTimeTracking?: boolean;
  enableComments?: boolean;
  enableAttachments?: boolean;
  enableWorkflow?: boolean;
  showHistory?: boolean;
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
  actualHours: number;
  storyPoints: number;
  effortLevel: TaskEffort;
  complexity: TaskComplexity;
  riskLevel: TaskRisk;
  progress: number;
  blockedReason: string;
  
  // Advanced fields
  dependencies: TaskDependency[];
  customFields: Record<string, any>;
  metadata: Record<string, any>;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  task,
  onClose,
  onUpdate,
  onDelete,
  onArchive,
  onDuplicate,
  projects,
  teamMembers,
  statuses,
  templates = [],
  availableTasks = [],
  taskHistory = [],
  enableAdvanced = true,
  enableDependencies = true,
  enableTimeTracking = true,
  enableComments = true,
  enableAttachments = true,
  enableWorkflow = true,
  showHistory = true
}) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'advanced' | 'dependencies' | 'comments' | 'history' | 'workflow'>('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    warnings: string[];
  }>({ isValid: true, warnings: [] });

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      const statusId = typeof task.status === 'string' ? task.status : task.status.id;
      
      const initialData: FormData = {
        title: task.title,
        description: task.description || '',
        projectId: task.projectId,
        milestoneId: task.milestoneId || '',
        assigneeId: task.assigneeId || '',
        statusId,
        priority: task.priority,
        dueDate: task.dueDate || '',
        tags: task.tags || [],
        estimatedHours: task.estimatedHours || 0,
        actualHours: task.actualHours || 0,
        storyPoints: task.storyPoints || 0,
        effortLevel: task.effortLevel,
        complexity: task.complexity,
        riskLevel: task.riskLevel,
        progress: task.progress || 0,
        blockedReason: task.blockedReason || '',
        dependencies: task.dependencies || [],
        customFields: task.customFields || {},
        metadata: task.metadata || {}
      };
      
      setFormData(initialData);
      setOriginalData(initialData);
      setHasChanges(false);
    } else {
      setFormData(null);
      setOriginalData(null);
      setHasChanges(false);
    }
  }, [task]);

  // Track changes
  useEffect(() => {
    if (formData && originalData) {
      const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  // Real-time validation
  useEffect(() => {
    if (formData) {
      validateForm();
    }
  }, [formData]);

  // Form validation
  const validateForm = useCallback(() => {
    if (!formData) return false;
    
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

    // Progress validation
    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }

    // Time validation
    if (formData.actualHours < 0) {
      newErrors.actualHours = 'Actual hours cannot be negative';
    }

    if (formData.estimatedHours > 0 && formData.actualHours > formData.estimatedHours * 2) {
      warnings.push('Actual hours significantly exceed estimate');
    }

    // Validation warnings
    if (formData.estimatedHours > 100) {
      warnings.push('Estimated hours seem very high');
    }

    if (formData.storyPoints > 20) {
      warnings.push('Story points are quite high');
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      if (dueDate < today && formData.progress < 100) {
        warnings.push('Task is overdue');
      }
    }

    if (formData.blockedReason && !formData.blockedReason.trim()) {
      setFormData(prev => prev ? { ...prev, blockedReason: '' } : null);
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
    
    if (!task || !formData || !validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const selectedStatus = statuses.find(s => s.id === formData.statusId);
      if (!selectedStatus) {
        throw new Error('Invalid status selected');
      }

      // Prepare update data with only changed fields
      const updates: UpdateTaskData = {};
      
      if (formData.title !== originalData?.title) updates.title = formData.title.trim();
      if (formData.description !== originalData?.description) updates.description = formData.description.trim() || undefined;
      if (formData.projectId !== originalData?.projectId) updates.projectId = formData.projectId;
      if (formData.milestoneId !== originalData?.milestoneId) updates.milestoneId = formData.milestoneId || undefined;
      if (formData.assigneeId !== originalData?.assigneeId) updates.assigneeId = formData.assigneeId || undefined;
      if (formData.statusId !== originalData?.statusId) updates.status = selectedStatus;
      if (formData.priority !== originalData?.priority) updates.priority = formData.priority;
      if (formData.dueDate !== originalData?.dueDate) updates.dueDate = formData.dueDate || undefined;
      if (JSON.stringify(formData.tags) !== JSON.stringify(originalData?.tags)) updates.tags = formData.tags;
      if (formData.estimatedHours !== originalData?.estimatedHours) updates.estimatedHours = formData.estimatedHours > 0 ? formData.estimatedHours : undefined;
      if (formData.actualHours !== originalData?.actualHours) updates.actualHours = formData.actualHours;
      if (formData.storyPoints !== originalData?.storyPoints) updates.storyPoints = formData.storyPoints;
      if (formData.effortLevel !== originalData?.effortLevel) updates.effortLevel = formData.effortLevel;
      if (formData.complexity !== originalData?.complexity) updates.complexity = formData.complexity;
      if (formData.riskLevel !== originalData?.riskLevel) updates.riskLevel = formData.riskLevel;
      if (formData.progress !== originalData?.progress) updates.progress = formData.progress;
      if (formData.blockedReason !== originalData?.blockedReason) updates.blockedReason = formData.blockedReason || undefined;

      // Handle completion
      if (selectedStatus.isCompleted && !task.completedAt) {
        updates.completedAt = new Date().toISOString();
        updates.progress = 100;
      } else if (!selectedStatus.isCompleted && task.completedAt) {
        updates.completedAt = undefined;
      }

      await onUpdate(task.id, updates);
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
      setErrors({ submit: 'Failed to update task. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle task deletion
  const handleDelete = async () => {
    if (!task) return;
    
    setLoading(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
      setErrors({ delete: 'Failed to delete task. Please try again.' });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle task duplication
  const handleDuplicate = async () => {
    if (!task || !onDuplicate) return;
    
    try {
      await onDuplicate(task);
      onClose();
    } catch (error) {
      console.error('Failed to duplicate task:', error);
    }
  };

  // Handle revert changes
  const handleRevert = () => {
    if (originalData) {
      setFormData({ ...originalData });
    }
  };

  // Handle tag operations
  const handleTagAdd = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() && formData) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag) && formData.tags.length < 20) {
        setFormData(prev => prev ? ({
          ...prev,
          tags: [...prev.tags, newTag]
        }) : null);
      }
      setTagInput('');
    }
  }, [tagInput, formData]);

  const handleTagRemove = useCallback((tagToRemove: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }) : null);
  }, []);

  // Dependency operations
  const addDependency = useCallback(() => {
    setFormData(prev => prev ? ({
      ...prev,
      dependencies: [
        ...prev.dependencies,
        {
          id: `temp-${Date.now()}`,
          taskId: task?.id || '',
          dependsOnId: '',
          dependencyType: 'finish_to_start',
          lagHours: 0,
          isBlocking: true,
          createdAt: new Date().toISOString(),
          notes: ''
        }
      ]
    }) : null);
  }, [task?.id]);

  const updateDependency = useCallback((index: number, updates: Partial<TaskDependency>) => {
    setFormData(prev => prev ? ({
      ...prev,
      dependencies: prev.dependencies.map((dep, i) => 
        i === index ? { ...dep, ...updates } : dep
      )
    }) : null);
  }, []);

  const removeDependency = useCallback((index: number) => {
    setFormData(prev => prev ? ({
      ...prev,
      dependencies: prev.dependencies.filter((_, i) => i !== index)
    }) : null);
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

  const getStatusColor = (status: TaskStatus) => {
    return status.color || '#64748b';
  };

  if (!isOpen || !task || !formData) return null;

  const assignee = teamMembers.find(m => m.id === task.assigneeId);
  const project = projects.find(p => p.id === task.projectId);
  const currentStatus = statuses.find(s => s.id === formData.statusId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusColor(currentStatus!) }}
              />
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                Edit Task
              </h2>
              {hasChanges && (
                <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Unsaved changes
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1 truncate">
              {task.title}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              {project && (
                <div className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </div>
              )}
              {assignee && (
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {assignee.name}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Created {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {onDuplicate && (
              <button
                onClick={handleDuplicate}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Duplicate task"
              >
                <Copy className="w-5 h-5" />
              </button>
            )}
            
            {hasChanges && (
              <button
                onClick={handleRevert}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Revert changes"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
              title="Delete task"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          {enableAdvanced && (
            <button
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
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
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'dependencies'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('dependencies')}
            >
              Dependencies ({formData.dependencies.length})
            </button>
          )}
          {enableComments && (
            <button
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'comments'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('comments')}
            >
              Comments ({task.comments?.length || 0})
            </button>
          )}
          {showHistory && (
            <button
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
          )}
          {enableWorkflow && (
            <button
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'workflow'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('workflow')}
            >
              Workflow
            </button>
          )}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="h-full">
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
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
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Provide detailed information about the task..."
                  />
                </div>

                {/* Status and Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.statusId}
                      onChange={(e) => setFormData(prev => prev ? ({ ...prev, statusId: e.target.value }) : null)}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Progress (%)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) => setFormData(prev => prev ? ({ ...prev, progress: Number(e.target.value) }) : null)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>0%</span>
                        <span className="font-medium">{formData.progress}%</span>
                        <span>100%</span>
                      </div>
                    </div>
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
                      onChange={(e) => setFormData(prev => prev ? ({ ...prev, assigneeId: e.target.value }) : null)}
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
                      onChange={(e) => setFormData(prev => prev ? ({ ...prev, priority: e.target.value as TaskPriority }) : null)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getPriorityColor(formData.priority)}`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Due Date and Time Tracking */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => prev ? ({ ...prev, dueDate: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      onChange={(e) => setFormData(prev => prev ? ({ ...prev, estimatedHours: Number(e.target.value) }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Timer className="w-4 h-4 inline mr-1" />
                      Actual Hours
                    </label>
                    <input
                      type="number"
                      value={formData.actualHours}
                      onChange={(e) => setFormData(prev => prev ? ({ ...prev, actualHours: Number(e.target.value) }) : null)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.actualHours ? 'border-red-300' : 'border-gray-300'
                      }`}
                      min="0"
                      step="0.1"
                    />
                    {errors.actualHours && (
                      <p className="mt-1 text-sm text-red-600">{errors.actualHours}</p>
                    )}
                  </div>
                </div>

                {/* Blocked Reason */}
                {formData.riskLevel === 'high' || formData.riskLevel === 'critical' || formData.blockedReason ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Blocked Reason / Risk Notes
                    </label>
                    <textarea
                      value={formData.blockedReason}
                      onChange={(e) => setFormData(prev => prev ? ({ ...prev, blockedReason: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Describe any blockers or risk mitigation notes..."
                    />
                  </div>
                ) : null}

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
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && enableAdvanced && (
              <div className="space-y-6">
                {/* Story Points and Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Target className="w-4 h-4 inline mr-1" />
                      Story Points
                    </label>
                    <input
                      type="number"
                      value={formData.storyPoints}
                      onChange={(e) => setFormData(prev => prev ? ({ ...prev, storyPoints: Number(e.target.value) }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Brain className="w-4 h-4 inline mr-1" />
                      Complexity
                    </label>
                    <select
                      value={formData.complexity}
                      onChange={(e) => setFormData(prev => prev ? ({ ...prev, complexity: e.target.value as TaskComplexity }) : null)}
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
                      onChange={(e) => setFormData(prev => prev ? ({ ...prev, effortLevel: e.target.value as TaskEffort }) : null)}
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
                      onChange={(e) => setFormData(prev => prev ? ({ ...prev, riskLevel: e.target.value as TaskRisk }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Dependencies Tab */}
            {activeTab === 'dependencies' && enableDependencies && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Task Dependencies</h3>
                    <p className="text-sm text-gray-600">
                      Manage relationships between this task and other tasks
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
                              Type
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && enableComments && (
              <div className="space-y-6">
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Comments system will be implemented in TaskCommentsSystem component</p>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && showHistory && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Change History</h3>
                  <p className="text-sm text-gray-600">
                    Track all changes made to this task
                  </p>
                </div>
                
                {taskHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No history available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {taskHistory.map((entry, index) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{entry.action}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {Object.keys(entry.changes).join(', ')} updated
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Workflow Tab */}
            {activeTab === 'workflow' && enableWorkflow && (
              <div className="space-y-6">
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Workflow automation features coming soon</p>
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
                {hasChanges 
                  ? validationResult.isValid 
                    ? 'Ready to save changes' 
                    : 'Please fix errors before saving'
                  : 'No changes made'
                }
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
                disabled={!hasChanges || !validationResult.isValid || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">Delete Task</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this task? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};