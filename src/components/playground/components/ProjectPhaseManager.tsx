import React, { useState, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Flag,
  Target,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Move,
  ArrowRight,
  PlayCircle,
  PauseCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import type { 
  Milestone, 
  MilestoneStatus, 
  TaskPriority,
  TeamMember,
  ProjectWithMilestones
} from '../../milestones/types';

export interface ProjectPhase {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  status: PhaseStatus;
  priority: TaskPriority;
  color: string;
  position: number;
  startDate?: string;
  endDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  milestoneIds: string[];
  gateApprovals: PhaseGateApproval[];
  dependencies: PhaseDependency[];
  settings: PhaseSettings;
  metadata: PhaseMetadata;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhaseGateApproval {
  id: string;
  phaseId: string;
  gateName: string;
  description?: string;
  isRequired: boolean;
  approvers: string[];
  status: GateApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  conditions: GateCondition[];
}

export interface GateCondition {
  id: string;
  type: 'milestone_completion' | 'task_completion' | 'budget_threshold' | 'quality_gate' | 'custom';
  description: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'all_completed';
  value: any;
  isMet: boolean;
  lastChecked: string;
}

export interface PhaseDependency {
  id: string;
  phaseId: string;
  dependsOnPhaseId: string;
  dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lagDays: number;
  isOptional: boolean;
}

export interface PhaseSettings {
  autoProgressOnGateApproval: boolean;
  requireAllMilestonesComplete: boolean;
  allowParallelExecution: boolean;
  enableQualityGates: boolean;
  notifyOnPhaseStart: boolean;
  notifyOnPhaseComplete: boolean;
  escalationDays?: number;
}

export interface PhaseMetadata {
  estimatedDuration: number;
  budgetAllocated?: number;
  budgetSpent?: number;
  resourceRequirements: ResourceRequirement[];
  deliverables: string[];
  riskFactors: string[];
  successCriteria: string[];
  stakeholders: string[];
}

export interface ResourceRequirement {
  role: string;
  count: number;
  skillsRequired: string[];
  allocation: number; // percentage
}

export type PhaseStatus = 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'delayed';
export type GateApprovalStatus = 'pending' | 'approved' | 'rejected' | 'not_required';

export interface PhaseProgress {
  id: string;
  phaseId: string;
  completionPercentage: number;
  milestonesCompleted: number;
  totalMilestones: number;
  tasksCompleted: number;
  totalTasks: number;
  isOnTrack: boolean;
  daysRemaining: number;
  estimatedCompletionDate: string;
  calculatedAt: string;
}

export interface ProjectPhaseManagerProps {
  project: ProjectWithMilestones;
  phases: ProjectPhase[];
  milestones: Milestone[];
  teamMembers: TeamMember[];
  phaseProgress: PhaseProgress[];
  onPhaseCreate: (phase: Omit<ProjectPhase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onPhaseUpdate: (phaseId: string, updates: Partial<ProjectPhase>) => Promise<void>;
  onPhaseDelete: (phaseId: string) => Promise<void>;
  onPhaseReorder: (phases: { id: string; position: number }[]) => Promise<void>;
  onMilestoneAssign: (milestoneId: string, phaseId: string | null) => Promise<void>;
  onGateApprovalSubmit: (gateId: string, decision: 'approve' | 'reject', reason?: string) => Promise<void>;
  onPhaseStatusChange: (phaseId: string, status: PhaseStatus) => Promise<void>;
  enableGateApprovals?: boolean;
  enableDependencies?: boolean;
  enableAdvancedFeatures?: boolean;
  className?: string;
}

export const ProjectPhaseManager: React.FC<ProjectPhaseManagerProps> = ({
  project,
  phases,
  milestones,
  teamMembers,
  phaseProgress,
  onPhaseCreate,
  onPhaseUpdate,
  onPhaseDelete,
  onPhaseReorder,
  onMilestoneAssign,
  onGateApprovalSubmit,
  onPhaseStatusChange,
  enableGateApprovals = true,
  enableDependencies = true,
  enableAdvancedFeatures = true,
  className = ''
}) => {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [draggedPhase, setDraggedPhase] = useState<ProjectPhase | null>(null);
  const [draggedMilestone, setDraggedMilestone] = useState<Milestone | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'board' | 'list'>('timeline');
  const [loading, setLoading] = useState(false);

  const sortedPhases = [...phases].sort((a, b) => a.position - b.position);
  
  const unassignedMilestones = milestones.filter(milestone => 
    !phases.some(phase => phase.milestoneIds.includes(milestone.id))
  );

  const phaseProgressMap = useMemo(() => {
    const map = new Map<string, PhaseProgress>();
    phaseProgress.forEach(progress => {
      map.set(progress.phaseId, progress);
    });
    return map;
  }, [phaseProgress]);

  const getPhaseStatus = useCallback((phase: ProjectPhase): PhaseStatus => {
    const progress = phaseProgressMap.get(phase.id);
    if (!progress) return phase.status;

    if (progress.completionPercentage === 100) return 'completed';
    if (progress.completionPercentage > 0) return 'in_progress';
    return 'not_started';
  }, [phaseProgressMap]);

  const getStatusIcon = (status: PhaseStatus) => {
    switch (status) {
      case 'not_started':
        return <Clock className="text-gray-500" size={20} />;
      case 'in_progress':
        return <PlayCircle className="text-blue-500" size={20} />;
      case 'on_hold':
        return <PauseCircle className="text-yellow-500" size={20} />;
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={20} />;
      case 'delayed':
        return <AlertCircle className="text-orange-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: PhaseStatus) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'delayed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePhaseToggle = useCallback((phaseId: string) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseId)) {
        newSet.delete(phaseId);
      } else {
        newSet.add(phaseId);
      }
      return newSet;
    });
  }, []);

  const handleMilestoneDrop = useCallback(async (milestoneId: string, targetPhaseId: string | null) => {
    try {
      await onMilestoneAssign(milestoneId, targetPhaseId);
    } catch (error) {
      console.error('Failed to assign milestone:', error);
    }
  }, [onMilestoneAssign]);

  const handlePhaseStatusChange = useCallback(async (phaseId: string, newStatus: PhaseStatus) => {
    try {
      await onPhaseStatusChange(phaseId, newStatus);
    } catch (error) {
      console.error('Failed to update phase status:', error);
    }
  }, [onPhaseStatusChange]);

  const renderPhaseCard = (phase: ProjectPhase) => {
    const progress = phaseProgressMap.get(phase.id);
    const isExpanded = expandedPhases.has(phase.id);
    const phaseMilestones = milestones.filter(m => phase.milestoneIds.includes(m.id));
    const currentStatus = getPhaseStatus(phase);

    return (
      <div 
        key={phase.id}
        className="bg-white border border-gray-200 rounded-lg shadow-sm"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (draggedMilestone) {
            handleMilestoneDrop(draggedMilestone.id, phase.id);
            setDraggedMilestone(null);
          }
        }}
      >
        {/* Phase Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handlePhaseToggle(phase.id)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: phase.color }}
              />
              <div>
                <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                <p className="text-sm text-gray-600">{phase.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(currentStatus)}`}>
                {currentStatus.replace('_', ' ')}
              </span>
              {getStatusIcon(currentStatus)}
              <button
                onClick={() => {
                  setSelectedPhase(phase);
                  setShowEditModal(true);
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Edit size={16} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {progress && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{progress.completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>{progress.milestonesCompleted}/{progress.totalMilestones} milestones</span>
                <span>{progress.tasksCompleted}/{progress.totalTasks} tasks</span>
              </div>
            </div>
          )}
        </div>

        {/* Phase Content */}
        {isExpanded && (
          <div className="p-4">
            {/* Phase Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>
                  {phase.startDate && phase.endDate ? 
                    `${new Date(phase.startDate).toLocaleDateString()} - ${new Date(phase.endDate).toLocaleDateString()}` :
                    'No dates set'
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users size={16} />
                <span>{phase.metadata.stakeholders?.length || 0} stakeholders</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Target size={16} />
                <span>{phase.metadata.deliverables?.length || 0} deliverables</span>
              </div>
            </div>

            {/* Milestones */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Milestones</h4>
              {phaseMilestones.length > 0 ? (
                <div className="space-y-2">
                  {phaseMilestones.map(milestone => (
                    <div 
                      key={milestone.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      draggable
                      onDragStart={() => setDraggedMilestone(milestone)}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: milestone.color }}
                        />
                        <span className="text-sm font-medium text-gray-900">{milestone.title}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                          milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {milestone.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {milestone.progress}% complete
                        </span>
                        <button
                          onClick={() => handleMilestoneDrop(milestone.id, null)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Remove from phase"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
                  <Target size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">No milestones assigned</p>
                  <p className="text-xs text-gray-500">Drag milestones here to assign</p>
                </div>
              )}
            </div>

            {/* Gate Approvals */}
            {enableGateApprovals && phase.gateApprovals.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Gate Approvals</h4>
                <div className="space-y-2">
                  {phase.gateApprovals.map(gate => (
                    <div key={gate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{gate.gateName}</p>
                        <p className="text-xs text-gray-600">{gate.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        gate.status === 'approved' ? 'bg-green-100 text-green-800' :
                        gate.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        gate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {gate.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phase Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {currentStatus !== 'completed' && (
                  <select
                    value={currentStatus}
                    onChange={(e) => handlePhaseStatusChange(phase.id, e.target.value as PhaseStatus)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="delayed">Delayed</option>
                  </select>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Assign Milestones
                </button>
                <button
                  onClick={() => {
                    setSelectedPhase(phase);
                    setShowEditModal(true);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Edit Phase
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Phases</h2>
          <p className="text-gray-600">{project.name} - Phase Management</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'timeline' ? 'bg-white shadow-sm' : ''
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'board' ? 'bg-white shadow-sm' : ''
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'list' ? 'bg-white shadow-sm' : ''
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Create Phase</span>
          </button>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Flag className="text-blue-500" size={20} />
            <span className="font-medium text-gray-900">Total Phases</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{phases.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="text-green-500" size={20} />
            <span className="font-medium text-gray-900">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {phases.filter(p => getPhaseStatus(p) === 'completed').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <PlayCircle className="text-blue-500" size={20} />
            <span className="font-medium text-gray-900">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {phases.filter(p => getPhaseStatus(p) === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="text-purple-500" size={20} />
            <span className="font-medium text-gray-900">Total Milestones</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{milestones.length}</p>
        </div>
      </div>

      {/* Phases List */}
      <div className="space-y-4">
        {sortedPhases.map(phase => renderPhaseCard(phase))}
      </div>

      {/* Unassigned Milestones */}
      {unassignedMilestones.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Unassigned Milestones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unassignedMilestones.map(milestone => (
              <div 
                key={milestone.id}
                className="p-4 border border-gray-200 rounded-lg cursor-grab hover:border-gray-300 transition-colors"
                draggable
                onDragStart={() => setDraggedMilestone(milestone)}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: milestone.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{milestone.title}</p>
                    <p className="text-sm text-gray-600">{milestone.progress}% complete</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Drag and drop milestones into phases to organize your project structure.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {phases.length === 0 && (
        <div className="text-center py-12">
          <Flag size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No phases created yet</h3>
          <p className="text-gray-600 mb-4">
            Create phases to organize your milestones and track project progress
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Phase
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectPhaseManager;