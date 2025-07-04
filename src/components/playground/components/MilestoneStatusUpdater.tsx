import React, { useState, useCallback, useMemo } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Play, 
  Pause, 
  X, 
  AlertTriangle, 
  Edit3, 
  Save, 
  RefreshCw, 
  Zap, 
  Users, 
  Calendar, 
  Target, 
  Activity, 
  Filter, 
  Search, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal, 
  Eye, 
  MessageSquare, 
  Flag, 
  Bookmark, 
  Archive, 
  Trash2, 
  Copy, 
  Link, 
  ExternalLink, 
  Settings, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  Square, 
  Circle, 
  Triangle, 
  Diamond 
} from 'lucide-react';
import type { 
  Milestone, 
  MilestoneStatus, 
  TaskPriority, 
  Project, 
  TeamMember, 
  MilestoneFilter, 
  ValidationResult, 
  MilestoneProgress 
} from '../../milestones/types';

export interface BulkOperation {
  id: string;
  type: BulkOperationType;
  label: string;
  icon: any; // Allow any icon type
  description: string;
  requiresConfirmation: boolean;
  destructive: boolean;
  fields?: BulkOperationField[];
}

export interface BulkOperationField {
  id: string;
  label: string;
  type: 'select' | 'date' | 'text' | 'number' | 'checkbox' | 'multiselect';
  options?: Array<{ value: string; label: string }>;
  required: boolean;
  placeholder?: string;
  validation?: (value: any) => string | null;
}

export interface StatusUpdateRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: StatusCondition[];
  actions: StatusAction[];
  priority: number;
  autoApply: boolean;
  createdBy: string;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface StatusCondition {
  id: string;
  type: StatusConditionType;
  field: string;
  operator: ConditionOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface StatusAction {
  id: string;
  type: StatusActionType;
  field: string;
  value: any;
  delay?: number;
  notification?: NotificationConfig;
  validation?: boolean;
}

export interface NotificationConfig {
  enabled: boolean;
  recipients: string[];
  template: string;
  channels: string[];
}

export interface StatusUpdateSuggestion {
  id: string;
  milestoneId: string;
  suggestedStatus: MilestoneStatus;
  reason: string;
  confidence: number;
  source: SuggestionSource;
  metadata: Record<string, any>;
  createdAt: string;
  applied: boolean;
}

export interface BatchUpdateResult {
  successful: string[];
  failed: Array<{
    milestoneId: string;
    error: string;
    code: string;
  }>;
  totalProcessed: number;
  totalSuccessful: number;
  totalFailed: number;
  processingTime: number;
}

export interface QuickUpdateOption {
  id: string;
  label: string;
  status: MilestoneStatus;
  icon: any; // Allow any icon type
  color: string;
  description: string;
  requiresConfirmation: boolean;
  validTransitions: MilestoneStatus[];
}

export type BulkOperationType = 'status_update' | 'priority_update' | 'assign_users' | 'set_due_date' | 'add_tags' | 'remove_tags' | 'archive' | 'restore' | 'delete' | 'duplicate' | 'move_project' | 'update_progress';
export type StatusConditionType = 'field_value' | 'date_range' | 'progress_threshold' | 'dependency_status' | 'task_completion' | 'custom';
export type StatusActionType = 'set_status' | 'set_priority' | 'notify_users' | 'create_task' | 'update_field' | 'trigger_webhook';
export type ConditionOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'regex' | 'is_null' | 'is_not_null';
export type SuggestionSource = 'ai' | 'rule' | 'dependency' | 'progress' | 'deadline' | 'manual';
export type UpdateMode = 'single' | 'bulk' | 'batch';

export interface MilestoneStatusUpdaterProps {
  milestones: Milestone[];
  projects: Project[];
  teamMembers: TeamMember[];
  rules: StatusUpdateRule[];
  suggestions: StatusUpdateSuggestion[];
  onStatusUpdate: (milestoneId: string, status: MilestoneStatus, notes?: string) => Promise<void>;
  onBulkUpdate: (milestoneIds: string[], operations: Record<string, any>) => Promise<BatchUpdateResult>;
  onRuleCreate: (rule: Omit<StatusUpdateRule, 'id' | 'createdAt' | 'triggerCount'>) => Promise<void>;
  onRuleUpdate: (ruleId: string, updates: Partial<StatusUpdateRule>) => Promise<void>;
  onRuleDelete: (ruleId: string) => Promise<void>;
  onSuggestionApply: (suggestionId: string) => Promise<void>;
  onSuggestionDismiss: (suggestionId: string) => Promise<void>;
  onValidation: (milestoneIds: string[], updates: Record<string, any>) => Promise<ValidationResult>;
  enableBulkOperations?: boolean;
  enableSuggestions?: boolean;
  enableRules?: boolean;
  enableValidation?: boolean;
  showProgressTracking?: boolean;
  showDependencyValidation?: boolean;
  className?: string;
}

export const MilestoneStatusUpdater: React.FC<MilestoneStatusUpdaterProps> = ({
  milestones,
  projects,
  teamMembers,
  rules,
  suggestions,
  onStatusUpdate,
  onBulkUpdate,
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete,
  onSuggestionApply,
  onSuggestionDismiss,
  onValidation,
  enableBulkOperations = true,
  enableSuggestions = true,
  enableRules = true,
  enableValidation = true,
  showProgressTracking = true,
  showDependencyValidation = true,
  className = ''
}) => {
  const [selectedMilestones, setSelectedMilestones] = useState<Set<string>>(new Set());
  const [updateMode, setUpdateMode] = useState<UpdateMode>('single');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MilestoneFilter>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingResults, setProcessingResults] = useState<BatchUpdateResult | null>(null);

  const quickUpdateOptions: QuickUpdateOption[] = useMemo(() => [
    {
      id: 'pending',
      label: 'Set to Pending',
      status: 'pending',
      icon: Clock,
      color: 'bg-gray-100 text-gray-800',
      description: 'Mark milestone as pending',
      requiresConfirmation: false,
      validTransitions: ['in_progress', 'on_hold', 'cancelled']
    },
    {
      id: 'in_progress',
      label: 'Start Progress',
      status: 'in_progress',
      icon: Play,
      color: 'bg-blue-100 text-blue-800',
      description: 'Begin working on milestone',
      requiresConfirmation: false,
      validTransitions: ['pending', 'on_hold']
    },
    {
      id: 'on_hold',
      label: 'Put on Hold',
      status: 'on_hold',
      icon: Pause,
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Temporarily pause milestone',
      requiresConfirmation: true,
      validTransitions: ['pending', 'in_progress']
    },
    {
      id: 'completed',
      label: 'Mark Complete',
      status: 'completed',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800',
      description: 'Complete milestone',
      requiresConfirmation: true,
      validTransitions: ['in_progress']
    },
    {
      id: 'cancelled',
      label: 'Cancel',
      status: 'cancelled',
      icon: X,
      color: 'bg-red-100 text-red-800',
      description: 'Cancel milestone',
      requiresConfirmation: true,
      validTransitions: ['pending', 'in_progress', 'on_hold']
    }
  ], []);

  const bulkOperations: BulkOperation[] = useMemo(() => [
    {
      id: 'status_update',
      type: 'status_update',
      label: 'Update Status',
      icon: RefreshCw,
      description: 'Change status for selected milestones',
      requiresConfirmation: true,
      destructive: false,
      fields: [
        {
          id: 'status',
          label: 'New Status',
          type: 'select',
          options: [
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'on_hold', label: 'On Hold' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' }
          ],
          required: true
        },
        {
          id: 'notes',
          label: 'Update Notes',
          type: 'text',
          required: false,
          placeholder: 'Optional notes about the status change'
        }
      ]
    },
    {
      id: 'priority_update',
      type: 'priority_update',
      label: 'Update Priority',
      icon: Flag,
      description: 'Change priority for selected milestones',
      requiresConfirmation: false,
      destructive: false,
      fields: [
        {
          id: 'priority',
          label: 'New Priority',
          type: 'select',
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' }
          ],
          required: true
        }
      ]
    },
    {
      id: 'assign_users',
      type: 'assign_users',
      label: 'Assign Users',
      icon: Users,
      description: 'Assign team members to selected milestones',
      requiresConfirmation: false,
      destructive: false,
      fields: [
        {
          id: 'users',
          label: 'Team Members',
          type: 'multiselect',
          options: teamMembers.map(member => ({
            value: member.id,
            label: member.name
          })),
          required: true
        },
        {
          id: 'replace',
          label: 'Replace existing assignments',
          type: 'checkbox',
          required: false
        }
      ]
    },
    {
      id: 'set_due_date',
      type: 'set_due_date',
      label: 'Set Due Date',
      icon: Calendar,
      description: 'Set due date for selected milestones',
      requiresConfirmation: false,
      destructive: false,
      fields: [
        {
          id: 'dueDate',
          label: 'Due Date',
          type: 'date',
          required: true
        }
      ]
    },
    {
      id: 'archive',
      type: 'archive',
      label: 'Archive',
      icon: Archive,
      description: 'Archive selected milestones',
      requiresConfirmation: true,
      destructive: true
    },
    {
      id: 'delete',
      type: 'delete',
      label: 'Delete',
      icon: Trash2,
      description: 'Permanently delete selected milestones',
      requiresConfirmation: true,
      destructive: true
    }
  ], [teamMembers]);

  const filteredMilestones = useMemo(() => {
    let filtered = milestones;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(milestone =>
        milestone.title.toLowerCase().includes(query) ||
        milestone.description?.toLowerCase().includes(query) ||
        milestone.metadata.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filters.status) {
      filtered = filtered.filter(milestone => milestone.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(milestone => milestone.priority === filters.priority);
    }

    if (filters.projectId) {
      filtered = filtered.filter(milestone => milestone.projectId === filters.projectId);
    }

    if (filters.assigneeId) {
      filtered = filtered.filter(milestone => milestone.assignedTo.includes(filters.assigneeId!));
    }

    if (filters.overdue) {
      const now = new Date();
      filtered = filtered.filter(milestone => 
        milestone.dueDate && new Date(milestone.dueDate) < now && milestone.status !== 'completed'
      );
    }

    return filtered;
  }, [milestones, searchQuery, filters]);

  const activeSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => !suggestion.applied);
  }, [suggestions]);

  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'pending': return Clock;
      case 'in_progress': return Play;
      case 'on_hold': return Pause;
      case 'completed': return CheckCircle;
      case 'cancelled': return X;
      default: return Clock;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSingleStatusUpdate = async (milestoneId: string, status: MilestoneStatus, notes?: string) => {
    setLoading(true);
    try {
      await onStatusUpdate(milestoneId, status, notes);
    } catch (error) {
      console.error('Failed to update milestone status:', error);
      setError('Failed to update milestone status');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (operations: Record<string, any>) => {
    if (selectedMilestones.size === 0) return;

    setLoading(true);
    try {
      const result = await onBulkUpdate(Array.from(selectedMilestones), operations);
      setProcessingResults(result);
      setSelectedMilestones(new Set());
      setShowBulkModal(false);
    } catch (error) {
      console.error('Failed to perform bulk update:', error);
      setError('Failed to perform bulk update');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMilestone = (milestoneId: string, selected: boolean) => {
    const newSelected = new Set(selectedMilestones);
    if (selected) {
      newSelected.add(milestoneId);
    } else {
      newSelected.delete(milestoneId);
    }
    setSelectedMilestones(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedMilestones(new Set(filteredMilestones.map(m => m.id)));
    } else {
      setSelectedMilestones(new Set());
    }
  };

  const handleApplySuggestion = async (suggestionId: string) => {
    setLoading(true);
    try {
      await onSuggestionApply(suggestionId);
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      setError('Failed to apply suggestion');
    } finally {
      setLoading(false);
    }
  };

  const renderSuggestions = () => {
    if (!enableSuggestions || activeSuggestions.length === 0) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-900">Smart Suggestions</h3>
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showSuggestions ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        
        {showSuggestions && (
          <div className="space-y-3">
            {activeSuggestions.slice(0, 5).map(suggestion => {
              const milestone = milestones.find(m => m.id === suggestion.milestoneId);
              if (!milestone) return null;

              return (
                <div key={suggestion.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                      <p className="text-sm text-gray-600">{suggestion.reason}</p>
                      <span className="text-xs text-blue-600">
                        Suggested: {suggestion.suggestedStatus} ({Math.round(suggestion.confidence)}% confidence)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApplySuggestion(suggestion.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => onSuggestionDismiss(suggestion.id)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderBulkActions = () => {
    if (!enableBulkOperations || selectedMilestones.size === 0) return null;

    return (
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Bulk Actions ({selectedMilestones.size} selected)
          </h3>
          <button
            onClick={() => setSelectedMilestones(new Set())}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {bulkOperations.map(operation => {
            const Icon = operation.icon;
            return (
              <button
                key={operation.id}
                onClick={() => setShowBulkModal(true)}
                className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${
                  operation.destructive
                    ? 'text-red-700 border-red-200 hover:bg-red-50'
                    : 'text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm">{operation.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMilestoneList = () => (
    <div className="space-y-4">
      {filteredMilestones.map(milestone => {
        const project = projects.find(p => p.id === milestone.projectId);
        const StatusIcon = getStatusIcon(milestone.status);
        const isSelected = selectedMilestones.has(milestone.id);
        const assignees = milestone.assignedTo
          .map(id => teamMembers.find(m => m.id === id))
          .filter(Boolean);

        return (
          <div key={milestone.id} className={`bg-white border rounded-lg p-4 ${
            isSelected ? 'ring-2 ring-blue-500' : ''
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {enableBulkOperations && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelectMilestone(milestone.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                )}
                <StatusIcon className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(milestone.status)}`}>
                      {milestone.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(milestone.priority)}`}>
                      {milestone.priority}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>{project?.name || 'Unknown Project'}</span>
                    {milestone.dueDate && (
                      <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                    )}
                    {showProgressTracking && (
                      <span>Progress: {milestone.progress}%</span>
                    )}
                    {assignees.length > 0 && (
                      <span>Assigned: {assignees.map(a => a!.name).join(', ')}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {quickUpdateOptions
                  .filter(option => option.validTransitions.includes(milestone.status))
                  .slice(0, 3)
                  .map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSingleStatusUpdate(milestone.id, option.status)}
                        className={`p-2 rounded-lg border transition-colors ${option.color} hover:opacity-80`}
                        title={option.description}
                      >
                        <Icon size={16} />
                      </button>
                    );
                  })}
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Status Updater</h2>
          <p className="text-gray-600">Quick status updates and bulk operations</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={updateMode}
            onChange={(e) => setUpdateMode(e.target.value as UpdateMode)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="single">Single Updates</option>
            <option value="bulk">Bulk Operations</option>
            <option value="batch">Batch Processing</option>
          </select>
          {enableRules && (
            <button
              onClick={() => setShowRulesModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Settings size={16} />
              <span>Rules</span>
            </button>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {renderSuggestions()}

      {/* Bulk Actions */}
      {renderBulkActions()}

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search milestones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as MilestoneStatus || undefined })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filters.priority || ''}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value as TaskPriority || undefined })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        {enableBulkOperations && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedMilestones.size === filteredMilestones.length && filteredMilestones.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Select All</label>
          </div>
        )}
      </div>

      {/* Milestone List */}
      {renderMilestoneList()}

      {/* Processing Results */}
      {processingResults && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Batch Update Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Processed:</span>
              <span className="font-medium ml-2">{processingResults.totalProcessed}</span>
            </div>
            <div>
              <span className="text-gray-600">Successful:</span>
              <span className="font-medium ml-2 text-green-600">{processingResults.totalSuccessful}</span>
            </div>
            <div>
              <span className="text-gray-600">Failed:</span>
              <span className="font-medium ml-2 text-red-600">{processingResults.totalFailed}</span>
            </div>
            <div>
              <span className="text-gray-600">Processing Time:</span>
              <span className="font-medium ml-2">{processingResults.processingTime}ms</span>
            </div>
          </div>
          {processingResults.failed.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-red-800 mb-2">Failed Updates:</h4>
              <div className="space-y-1">
                {processingResults.failed.map(failure => (
                  <div key={failure.milestoneId} className="text-sm text-red-700">
                    {failure.milestoneId}: {failure.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-900">Processing updates...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneStatusUpdater;