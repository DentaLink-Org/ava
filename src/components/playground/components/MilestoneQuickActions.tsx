import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, CheckCircle2, Clock, AlertCircle, Archive, Tag, Users, Copy, Trash2, Edit3, ChevronDown, Filter, MoreVertical } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
  dueDate: string;
  assignees: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  progress: number;
}

interface BulkAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: (selectedIds: string[]) => void;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

interface QuickActionGroup {
  label: string;
  actions: BulkAction[];
}

export default function MilestoneQuickActions() {
  const [milestones] = useState<Milestone[]>([
    {
      id: '1',
      title: 'Complete API Integration',
      status: 'in_progress',
      dueDate: '2024-02-15',
      assignees: ['John Doe', 'Jane Smith'],
      priority: 'high',
      tags: ['backend', 'critical-path'],
      progress: 65
    },
    {
      id: '2',
      title: 'Design System Documentation',
      status: 'not_started',
      dueDate: '2024-02-20',
      assignees: ['Alice Johnson'],
      priority: 'medium',
      tags: ['documentation', 'design'],
      progress: 0
    },
    {
      id: '3',
      title: 'User Testing Phase 1',
      status: 'completed',
      dueDate: '2024-02-10',
      assignees: ['Bob Wilson', 'Carol Davis'],
      priority: 'high',
      tags: ['testing', 'user-research'],
      progress: 100
    },
    {
      id: '4',
      title: 'Security Audit',
      status: 'delayed',
      dueDate: '2024-02-12',
      assignees: ['Dave Brown'],
      priority: 'critical',
      tags: ['security', 'compliance'],
      progress: 40
    },
    {
      id: '5',
      title: 'Performance Optimization',
      status: 'blocked',
      dueDate: '2024-02-18',
      assignees: ['Eve Martinez'],
      priority: 'medium',
      tags: ['performance', 'backend'],
      progress: 30
    }
  ]);

  const [selectedMilestones, setSelectedMilestones] = useState<Set<string>>(new Set());
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [operationHistory, setOperationHistory] = useState<Array<{
    id: string;
    action: string;
    milestoneCount: number;
    timestamp: Date;
  }>>([]);

  const handleSelectMilestone = useCallback((id: string) => {
    setSelectedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedMilestones.size === milestones.length) {
      setSelectedMilestones(new Set());
    } else {
      setSelectedMilestones(new Set(milestones.map(m => m.id)));
    }
  }, [selectedMilestones.size, milestones]);

  const addToHistory = useCallback((action: string, count: number) => {
    setOperationHistory(prev => [{
      id: Date.now().toString(),
      action,
      milestoneCount: count,
      timestamp: new Date()
    }, ...prev.slice(0, 9)]);
  }, []);

  const bulkActionGroups: QuickActionGroup[] = useMemo(() => [
    {
      label: 'Status Updates',
      actions: [
        {
          id: 'mark-completed',
          label: 'Mark as Completed',
          icon: CheckCircle2,
          action: (ids) => {
            console.log('Marking as completed:', ids);
            addToHistory('Marked as Completed', ids.length);
            setSelectedMilestones(new Set());
          }
        },
        {
          id: 'mark-in-progress',
          label: 'Mark as In Progress',
          icon: Clock,
          action: (ids) => {
            console.log('Marking as in progress:', ids);
            addToHistory('Marked as In Progress', ids.length);
            setSelectedMilestones(new Set());
          }
        },
        {
          id: 'mark-blocked',
          label: 'Mark as Blocked',
          icon: AlertCircle,
          action: (ids) => {
            console.log('Marking as blocked:', ids);
            addToHistory('Marked as Blocked', ids.length);
            setSelectedMilestones(new Set());
          }
        }
      ]
    },
    {
      label: 'Organization',
      actions: [
        {
          id: 'archive',
          label: 'Archive',
          icon: Archive,
          action: (ids) => {
            console.log('Archiving:', ids);
            addToHistory('Archived', ids.length);
            setSelectedMilestones(new Set());
          },
          requiresConfirmation: true,
          confirmationMessage: 'Are you sure you want to archive these milestones?'
        },
        {
          id: 'add-tags',
          label: 'Add Tags',
          icon: Tag,
          action: (ids) => {
            console.log('Adding tags to:', ids);
            addToHistory('Added Tags', ids.length);
          }
        },
        {
          id: 'assign-team',
          label: 'Assign Team',
          icon: Users,
          action: (ids) => {
            console.log('Assigning team to:', ids);
            addToHistory('Assigned Team', ids.length);
          }
        }
      ]
    },
    {
      label: 'Operations',
      actions: [
        {
          id: 'duplicate',
          label: 'Duplicate',
          icon: Copy,
          action: (ids) => {
            console.log('Duplicating:', ids);
            addToHistory('Duplicated', ids.length);
            setSelectedMilestones(new Set());
          }
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: Trash2,
          action: (ids) => {
            console.log('Deleting:', ids);
            addToHistory('Deleted', ids.length);
            setSelectedMilestones(new Set());
          },
          requiresConfirmation: true,
          confirmationMessage: 'Are you sure you want to delete these milestones? This action cannot be undone.'
        }
      ]
    }
  ], [addToHistory]);

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'blocked':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Milestone['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const executeAction = (action: BulkAction) => {
    if (action.requiresConfirmation) {
      if (window.confirm(action.confirmationMessage || 'Are you sure?')) {
        action.action(Array.from(selectedMilestones));
      }
    } else {
      action.action(Array.from(selectedMilestones));
    }
    setShowActionDropdown(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Milestone Quick Actions</h2>
          <span className="text-sm text-gray-500">
            {selectedMilestones.size} of {milestones.length} selected
          </span>
        </div>

        {/* Bulk Action Bar */}
        {selectedMilestones.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-900">
                  {selectedMilestones.size} milestone{selectedMilestones.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowActionDropdown(!showActionDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                    Quick Actions
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showActionDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      {bulkActionGroups.map((group, groupIndex) => (
                        <div key={groupIndex}>
                          {groupIndex > 0 && <div className="border-t border-gray-200" />}
                          <div className="p-2">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1">
                              {group.label}
                            </div>
                            {group.actions.map((action) => (
                              <button
                                key={action.id}
                                onClick={() => executeAction(action)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                              >
                                <action.icon className="w-4 h-4" />
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedMilestones(new Set())}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Milestones List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* List Header */}
        <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedMilestones.size === milestones.length && milestones.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Select All</span>
            <div className="ml-auto flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Milestone Items */}
        <div className="divide-y divide-gray-200">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                selectedMilestones.has(milestone.id) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedMilestones.has(milestone.id)}
                  onChange={() => handleSelectMilestone(milestone.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(milestone.status)}
                        <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(milestone.priority)}`}>
                          {milestone.priority}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due {milestone.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{milestone.assignees.length} assignee{milestone.assignees.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          <span>{milestone.tags.length} tag{milestone.tags.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">{milestone.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operation History */}
      {operationHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Operations</h3>
          <div className="space-y-2">
            {operationHistory.map((operation) => (
              <div key={operation.id} className="flex items-center justify-between py-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">
                    {operation.action} ({operation.milestoneCount} milestone{operation.milestoneCount !== 1 ? 's' : ''})
                  </span>
                </div>
                <span className="text-gray-500">
                  {operation.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}