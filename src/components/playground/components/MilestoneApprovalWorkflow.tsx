import React, { useState, useCallback, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  User, 
  MessageSquare, 
  Send, 
  Edit, 
  Eye, 
  ArrowRight,
  ArrowUp,
  Settings,
  UserPlus,
  Calendar,
  FileText,
  Bell,
  History
} from 'lucide-react';
import type { 
  Milestone, 
  MilestoneStatus, 
  TeamMember,
  User as UserType
} from '../../milestones/types';

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  projectId?: string;
  organizationId?: string;
  stages: ApprovalStage[];
  settings: WorkflowSettings;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStage {
  id: string;
  name: string;
  description?: string;
  position: number;
  isRequired: boolean;
  approvers: ApprovalApprover[];
  conditions: ApprovalCondition[];
  timeoutDays?: number;
  escalationSettings?: EscalationSettings;
  notificationSettings: StageNotificationSettings;
}

export interface ApprovalApprover {
  id: string;
  type: 'user' | 'role' | 'group';
  approverRef: string; // User ID, role name, or group ID
  isRequired: boolean;
  canDelegate: boolean;
  weight: number; // For weighted approval
}

export interface ApprovalCondition {
  id: string;
  type: 'milestone_status' | 'task_completion' | 'budget_threshold' | 'custom';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
  description: string;
}

export interface EscalationSettings {
  enableEscalation: boolean;
  escalationDays: number;
  escalationApprovers: ApprovalApprover[];
  autoApproveAfterEscalation: boolean;
}

export interface StageNotificationSettings {
  notifyOnRequest: boolean;
  notifyOnApproval: boolean;
  notifyOnRejection: boolean;
  notifyOnEscalation: boolean;
  reminderDays: number[];
  customMessage?: string;
}

export interface WorkflowSettings {
  allowSkipStages: boolean;
  requireAllApprovers: boolean;
  allowDelegation: boolean;
  enableEscalation: boolean;
  autoProgressOnApproval: boolean;
  retryOnRejection: boolean;
  maxRetries: number;
}

export interface MilestoneApprovalRequest {
  id: string;
  milestoneId: string;
  workflowId: string;
  currentStageId: string;
  status: ApprovalRequestStatus;
  requestedBy: string;
  requestedAt: string;
  completedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  submissions: ApprovalSubmission[];
  comments: ApprovalComment[];
  metadata: ApprovalMetadata;
}

export interface ApprovalSubmission {
  id: string;
  stageId: string;
  approverId: string;
  status: ApprovalSubmissionStatus;
  decision: ApprovalDecision;
  comments?: string;
  submittedAt: string;
  delegatedTo?: string;
  delegatedBy?: string;
  attachments: string[];
}

export interface ApprovalComment {
  id: string;
  userId: string;
  content: string;
  type: 'comment' | 'system' | 'escalation';
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  attachments: string[];
}

export interface ApprovalMetadata {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string;
  businessJustification?: string;
  impactAnalysis?: string;
  riskAssessment?: string;
  customFields: Record<string, any>;
}

export type ApprovalRequestStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'escalated' | 'cancelled';
export type ApprovalSubmissionStatus = 'pending' | 'approved' | 'rejected' | 'delegated' | 'timeout';
export type ApprovalDecision = 'approve' | 'reject' | 'request_changes' | 'delegate';

export interface MilestoneApprovalWorkflowProps {
  milestone: Milestone;
  workflows: ApprovalWorkflow[];
  approvalRequests: MilestoneApprovalRequest[];
  teamMembers: TeamMember[];
  users: UserType[];
  currentUser: UserType;
  onRequestApproval: (milestoneId: string, workflowId: string, metadata: ApprovalMetadata) => Promise<void>;
  onSubmitDecision: (requestId: string, stageId: string, decision: ApprovalDecision, comments?: string) => Promise<void>;
  onCancelRequest: (requestId: string) => Promise<void>;
  onEscalateRequest: (requestId: string, stageId: string) => Promise<void>;
  onDelegateApproval: (requestId: string, stageId: string, delegateToUserId: string) => Promise<void>;
  onAddComment: (requestId: string, comment: string) => Promise<void>;
  onCreateWorkflow?: (workflow: Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateWorkflow?: (workflowId: string, updates: Partial<ApprovalWorkflow>) => Promise<void>;
  enableWorkflowManagement?: boolean;
  enableAdvancedFeatures?: boolean;
  className?: string;
}

export const MilestoneApprovalWorkflow: React.FC<MilestoneApprovalWorkflowProps> = ({
  milestone,
  workflows,
  approvalRequests,
  teamMembers,
  users,
  currentUser,
  onRequestApproval,
  onSubmitDecision,
  onCancelRequest,
  onEscalateRequest,
  onDelegateApproval,
  onAddComment,
  onCreateWorkflow,
  onUpdateWorkflow,
  enableWorkflowManagement = false,
  enableAdvancedFeatures = true,
  className = ''
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MilestoneApprovalRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showWorkflowEditor, setShowWorkflowEditor] = useState(false);
  const [decisionType, setDecisionType] = useState<ApprovalDecision>('approve');
  const [decisionComments, setDecisionComments] = useState('');
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const activeRequest = approvalRequests.find(req => 
    req.milestoneId === milestone.id && 
    ['pending', 'in_progress', 'escalated'].includes(req.status)
  );

  const currentUserPendingStages = activeRequest ? 
    activeRequest.submissions.filter(sub => 
      sub.approverId === currentUser.id && 
      sub.status === 'pending'
    ) : [];

  const canRequestApproval = !activeRequest && milestone.status !== 'completed';
  const canSubmitDecision = currentUserPendingStages.length > 0;

  const getStatusIcon = (status: ApprovalRequestStatus) => {
    switch (status) {
      case 'pending':
      case 'in_progress':
        return <Clock className="text-yellow-500" size={20} />;
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      case 'escalated':
        return <ArrowUp className="text-orange-500" size={20} />;
      case 'cancelled':
        return <XCircle className="text-gray-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const getStageStatus = (stage: ApprovalStage, submissions: ApprovalSubmission[]) => {
    const stageSubmissions = submissions.filter(sub => sub.stageId === stage.id);
    
    if (stageSubmissions.length === 0) return 'pending';
    
    const hasRejection = stageSubmissions.some(sub => sub.status === 'rejected');
    if (hasRejection) return 'rejected';
    
    const hasTimeout = stageSubmissions.some(sub => sub.status === 'timeout');
    if (hasTimeout) return 'timeout';
    
    const requiredApprovers = stage.approvers.filter(app => app.isRequired);
    const approvedRequired = stageSubmissions.filter(sub => 
      sub.status === 'approved' && 
      requiredApprovers.some(app => app.approverRef === sub.approverId)
    );
    
    if (approvedRequired.length >= requiredApprovers.length) return 'approved';
    
    return 'in_progress';
  };

  const handleRequestApproval = useCallback(async (workflowId: string, metadata: ApprovalMetadata) => {
    setLoading(true);
    try {
      await onRequestApproval(milestone.id, workflowId, metadata);
      setShowRequestModal(false);
    } catch (error) {
      console.error('Failed to request approval:', error);
    } finally {
      setLoading(false);
    }
  }, [milestone.id, onRequestApproval]);

  const handleSubmitDecision = useCallback(async (decision: ApprovalDecision, comments: string) => {
    if (!activeRequest || currentUserPendingStages.length === 0) return;
    
    setLoading(true);
    try {
      const stageId = currentUserPendingStages[0].stageId;
      await onSubmitDecision(activeRequest.id, stageId, decision, comments);
      setShowDecisionModal(false);
      setDecisionComments('');
    } catch (error) {
      console.error('Failed to submit decision:', error);
    } finally {
      setLoading(false);
    }
  }, [activeRequest, currentUserPendingStages, onSubmitDecision]);

  const handleAddComment = useCallback(async () => {
    if (!activeRequest || !newComment.trim()) return;
    
    try {
      await onAddComment(activeRequest.id, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  }, [activeRequest, newComment, onAddComment]);

  const renderApprovalStage = (stage: ApprovalStage, index: number, isActive: boolean, status: string) => (
    <div key={stage.id} className="flex items-center">
      <div className={`
        flex items-center justify-center w-10 h-10 rounded-full border-2 
        ${status === 'approved' ? 'bg-green-100 border-green-500 text-green-700' : 
          status === 'rejected' ? 'bg-red-100 border-red-500 text-red-700' :
          status === 'timeout' ? 'bg-orange-100 border-orange-500 text-orange-700' :
          isActive ? 'bg-blue-100 border-blue-500 text-blue-700' : 
          'bg-gray-100 border-gray-300 text-gray-500'}
      `}>
        {status === 'approved' ? <CheckCircle size={20} /> :
         status === 'rejected' ? <XCircle size={20} /> :
         status === 'timeout' ? <Clock size={20} /> :
         <span className="text-sm font-semibold">{index + 1}</span>}
      </div>
      
      {index < (activeRequest?.workflowId ? 
        workflows.find(w => w.id === activeRequest.workflowId)?.stages.length || 0 : 0) - 1 && (
        <ArrowRight className="mx-4 text-gray-400" size={20} />
      )}
    </div>
  );

  const renderWorkflowProgress = () => {
    if (!activeRequest) return null;

    const workflow = workflows.find(w => w.id === activeRequest.workflowId);
    if (!workflow) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Approval Progress</h3>
            <p className="text-sm text-gray-600">{workflow.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(activeRequest.status)}
            <span className="text-sm font-medium text-gray-900 capitalize">
              {activeRequest.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex items-center mb-6">
          {workflow.stages.map((stage, index) => {
            const stageStatus = getStageStatus(stage, activeRequest.submissions);
            const isActive = activeRequest.currentStageId === stage.id;
            return renderApprovalStage(stage, index, isActive, stageStatus);
          })}
        </div>

        <div className="space-y-4">
          {workflow.stages.map(stage => {
            const stageSubmissions = activeRequest.submissions.filter(sub => sub.stageId === stage.id);
            const stageStatus = getStageStatus(stage, activeRequest.submissions);
            const isCurrentStage = activeRequest.currentStageId === stage.id;

            return (
              <div 
                key={stage.id}
                className={`p-4 rounded-lg border ${
                  isCurrentStage ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{stage.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                    stageStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    stageStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    stageStatus === 'timeout' ? 'bg-orange-100 text-orange-800' :
                    stageStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {stageStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2">
                  {stage.approvers.map(approver => {
                    const submission = stageSubmissions.find(sub => sub.approverId === approver.approverRef);
                    const user = users.find(u => u.id === approver.approverRef);
                    
                    return (
                      <div key={approver.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <User size={16} className="text-gray-400" />
                          <span className="text-gray-900">{user?.name || approver.approverRef}</span>
                          {approver.isRequired && (
                            <span className="px-1 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        {submission && (
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(submission.status as any)}
                            <span className="text-gray-600">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Milestone Approval</h2>
          <p className="text-gray-600">{milestone.title}</p>
        </div>
        <div className="flex items-center space-x-3">
          {canRequestApproval && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send size={20} />
              <span>Request Approval</span>
            </button>
          )}
          {canSubmitDecision && (
            <button
              onClick={() => setShowDecisionModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle size={20} />
              <span>Submit Decision</span>
            </button>
          )}
          {enableWorkflowManagement && onCreateWorkflow && (
            <button
              onClick={() => setShowWorkflowEditor(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings size={20} />
              <span>Manage Workflows</span>
            </button>
          )}
        </div>
      </div>

      {/* Current Request Progress */}
      {activeRequest && renderWorkflowProgress()}

      {/* Recent Requests History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval History</h3>
        {approvalRequests.length > 0 ? (
          <div className="space-y-4">
            {approvalRequests.slice(0, 5).map(request => {
              const workflow = workflows.find(w => w.id === request.workflowId);
              const requestUser = users.find(u => u.id === request.requestedBy);
              
              return (
                <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-medium text-gray-900">{workflow?.name || 'Unknown Workflow'}</p>
                      <p className="text-sm text-gray-600">
                        Requested by {requestUser?.name} on {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      request.status === 'escalated' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <History size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No approval requests yet</p>
          </div>
        )}
      </div>

      {/* Comments Section */}
      {activeRequest && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Discussion</h3>
          
          <div className="space-y-4 mb-6">
            {activeRequest.comments.map(comment => {
              const user = users.find(u => u.id === comment.userId);
              return (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{user?.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      {comment.type !== 'comment' && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded capitalize">
                          {comment.type}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-600" />
            </div>
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneApprovalWorkflow;