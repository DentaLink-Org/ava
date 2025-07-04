import React, { useState, useCallback, useMemo } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Users, 
  Wrench as Tool, 
  Shield, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  Search, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Target, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Star,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Zap,
  Activity,
  Bell,
  Mail,
  MessageSquare,
  FileText,
  Download,
  Upload,
  Settings,
  RefreshCw,
  History,
  Lightbulb,
  Brain,
  Heart,
  Compass
} from 'lucide-react';
import type { 
  Milestone, 
  MilestoneStatus, 
  TaskPriority,
  Project,
  TeamMember
} from '../../milestones/types';

export interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  type: RiskType;
  severity: RiskSeverity;
  probability: number; // 0-100
  impact: RiskImpact;
  status: RiskStatus;
  priority: RiskPriority;
  identifiedBy: TeamMember;
  identifiedDate: string;
  lastAssessedDate: string;
  targetDate?: string;
  actualDate?: string;
  relatedMilestones: string[];
  relatedTasks: string[];
  affectedAreas: string[];
  triggers: RiskTrigger[];
  mitigation: RiskMitigation;
  contingency: RiskContingency;
  monitoring: RiskMonitoring;
  history: RiskHistoryEntry[];
  tags: string[];
  attachments: RiskAttachment[];
  comments: RiskComment[];
  metrics: RiskMetrics;
  predictions: RiskPrediction[];
}

export interface RiskMitigation {
  strategy: MitigationStrategy;
  actions: MitigationAction[];
  owner: TeamMember;
  budget: number;
  timeline: string;
  progress: number;
  effectiveness: number;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
}

export interface MitigationAction {
  id: string;
  title: string;
  description: string;
  type: 'preventive' | 'corrective' | 'detective';
  priority: TaskPriority;
  assignee: TeamMember;
  dueDate: string;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  effort: number;
  cost: number;
  dependencies: string[];
}

export interface RiskContingency {
  plan: string;
  triggers: string[];
  actions: string[];
  owner: TeamMember;
  budget: number;
  timeline: string;
  approvalRequired: boolean;
  approved: boolean;
  approvedBy?: TeamMember;
  approvedDate?: string;
}

export interface RiskMonitoring {
  frequency: MonitoringFrequency;
  metrics: string[];
  thresholds: RiskThreshold[];
  alerts: RiskAlert[];
  reports: RiskReport[];
  owner: TeamMember;
  nextReview: string;
  lastReview: string;
}

export interface RiskThreshold {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  severity: RiskSeverity;
  action: string;
}

export interface RiskAlert {
  id: string;
  type: 'threshold' | 'schedule' | 'manual';
  message: string;
  severity: RiskSeverity;
  triggered: boolean;
  triggeredDate?: string;
  acknowledgedBy?: TeamMember;
  acknowledgedDate?: string;
}

export interface RiskReport {
  id: string;
  type: 'assessment' | 'progress' | 'closure';
  title: string;
  content: string;
  createdBy: TeamMember;
  createdDate: string;
  recipients: TeamMember[];
  attachments: string[];
}

export interface RiskTrigger {
  id: string;
  type: 'milestone' | 'task' | 'date' | 'metric' | 'external';
  condition: string;
  description: string;
  active: boolean;
  triggered: boolean;
  triggeredDate?: string;
}

export interface RiskHistoryEntry {
  id: string;
  type: 'created' | 'updated' | 'assessed' | 'mitigated' | 'closed' | 'reopened';
  timestamp: string;
  user: TeamMember;
  changes: Record<string, any>;
  comment?: string;
}

export interface RiskComment {
  id: string;
  content: string;
  author: TeamMember;
  timestamp: string;
  type: 'comment' | 'assessment' | 'update' | 'resolution';
  mentions: TeamMember[];
  attachments: string[];
}

export interface RiskAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: TeamMember;
  uploadedDate: string;
}

export interface RiskMetrics {
  riskScore: number;
  impactScore: number;
  probabilityScore: number;
  mitigationEffectiveness: number;
  costImpact: number;
  scheduleImpact: number;
  qualityImpact: number;
  teamMoraleImpact: number;
  customerImpact: number;
}

export interface RiskPrediction {
  id: string;
  type: 'probability' | 'impact' | 'timeline' | 'cost';
  value: number;
  confidence: number;
  model: string;
  factors: string[];
  createdDate: string;
  validUntil: string;
}

export interface RiskMatrix {
  lowLow: ProjectRisk[];
  lowMedium: ProjectRisk[];
  lowHigh: ProjectRisk[];
  mediumLow: ProjectRisk[];
  mediumMedium: ProjectRisk[];
  mediumHigh: ProjectRisk[];
  highLow: ProjectRisk[];
  highMedium: ProjectRisk[];
  highHigh: ProjectRisk[];
}

export type RiskCategory = 'schedule' | 'budget' | 'scope' | 'quality' | 'resource' | 'technical' | 'external' | 'stakeholder' | 'legal' | 'security';
export type RiskType = 'known' | 'unknown' | 'emerging' | 'secondary' | 'residual';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskImpact = 'minimal' | 'minor' | 'moderate' | 'major' | 'catastrophic';
export type RiskStatus = 'identified' | 'assessed' | 'mitigated' | 'monitored' | 'closed' | 'accepted';
export type RiskPriority = 'low' | 'medium' | 'high' | 'critical';
export type MitigationStrategy = 'avoid' | 'transfer' | 'mitigate' | 'accept' | 'monitor';
export type MonitoringFrequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'ad-hoc';
export type ViewMode = 'dashboard' | 'matrix' | 'list' | 'timeline' | 'reports';
export type FilterType = 'category' | 'severity' | 'status' | 'priority' | 'owner' | 'milestone';

export interface ProjectRiskTrackerProps {
  project: Project;
  milestones: Milestone[];
  teamMembers: TeamMember[];
  risks: ProjectRisk[];
  onRiskCreate: (risk: Partial<ProjectRisk>) => Promise<void>;
  onRiskUpdate: (riskId: string, updates: Partial<ProjectRisk>) => Promise<void>;
  onRiskDelete: (riskId: string) => Promise<void>;
  onRiskAssess: (riskId: string, assessment: Partial<ProjectRisk>) => Promise<void>;
  onMitigationCreate: (riskId: string, mitigation: Partial<RiskMitigation>) => Promise<void>;
  onMitigationUpdate: (riskId: string, mitigationId: string, updates: Partial<RiskMitigation>) => Promise<void>;
  onAlertCreate: (riskId: string, alert: Partial<RiskAlert>) => Promise<void>;
  onReportGenerate: (type: string, risks: string[]) => Promise<void>;
  onExport: (format: 'json' | 'csv' | 'pdf') => Promise<void>;
  onImport: (data: string) => Promise<void>;
  enablePredictiveAnalytics?: boolean;
  enableAutomatedMonitoring?: boolean;
  enableNotifications?: boolean;
  className?: string;
}

export const ProjectRiskTracker: React.FC<ProjectRiskTrackerProps> = ({
  project,
  milestones,
  teamMembers,
  risks,
  onRiskCreate,
  onRiskUpdate,
  onRiskDelete,
  onRiskAssess,
  onMitigationCreate,
  onMitigationUpdate,
  onAlertCreate,
  onReportGenerate,
  onExport,
  onImport,
  enablePredictiveAnalytics = true,
  enableAutomatedMonitoring = true,
  enableNotifications = true,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedRisk, setSelectedRisk] = useState<ProjectRisk | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<Record<FilterType, string[]>>({
    category: [],
    severity: [],
    status: [],
    priority: [],
    owner: [],
    milestone: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof ProjectRisk>('severity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredRisks = useMemo(() => {
    let filtered = risks;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(risk =>
        risk.title.toLowerCase().includes(query) ||
        risk.description.toLowerCase().includes(query) ||
        risk.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filters
    Object.entries(filters).forEach(([filterType, values]) => {
      if (values.length > 0) {
        switch (filterType as FilterType) {
          case 'category':
            filtered = filtered.filter(risk => values.includes(risk.category));
            break;
          case 'severity':
            filtered = filtered.filter(risk => values.includes(risk.severity));
            break;
          case 'status':
            filtered = filtered.filter(risk => values.includes(risk.status));
            break;
          case 'priority':
            filtered = filtered.filter(risk => values.includes(risk.priority));
            break;
          case 'owner':
            filtered = filtered.filter(risk => values.includes(risk.mitigation.owner.id));
            break;
          case 'milestone':
            filtered = filtered.filter(risk => risk.relatedMilestones.some(m => values.includes(m)));
            break;
        }
      }
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }, [risks, searchQuery, filters, sortBy, sortOrder]);

  const riskMatrix = useMemo(() => {
    const matrix: RiskMatrix = {
      lowLow: [], lowMedium: [], lowHigh: [],
      mediumLow: [], mediumMedium: [], mediumHigh: [],
      highLow: [], highMedium: [], highHigh: []
    };

    filteredRisks.forEach(risk => {
      const probability = risk.probability <= 30 ? 'low' : risk.probability <= 70 ? 'medium' : 'high';
      const impact = risk.impact === 'minimal' || risk.impact === 'minor' ? 'low' : 
                    risk.impact === 'moderate' ? 'medium' : 'high';
      
      const key = `${probability}${impact.charAt(0).toUpperCase() + impact.slice(1)}` as keyof RiskMatrix;
      matrix[key].push(risk);
    });

    return matrix;
  }, [filteredRisks]);

  const riskMetrics = useMemo(() => {
    const total = filteredRisks.length;
    const byCategory = filteredRisks.reduce((acc, risk) => {
      acc[risk.category] = (acc[risk.category] || 0) + 1;
      return acc;
    }, {} as Record<RiskCategory, number>);
    
    const bySeverity = filteredRisks.reduce((acc, risk) => {
      acc[risk.severity] = (acc[risk.severity] || 0) + 1;
      return acc;
    }, {} as Record<RiskSeverity, number>);

    const byStatus = filteredRisks.reduce((acc, risk) => {
      acc[risk.status] = (acc[risk.status] || 0) + 1;
      return acc;
    }, {} as Record<RiskStatus, number>);

    const avgRiskScore = filteredRisks.reduce((sum, risk) => sum + risk.metrics.riskScore, 0) / total || 0;
    const avgProbability = filteredRisks.reduce((sum, risk) => sum + risk.probability, 0) / total || 0;
    const avgImpact = filteredRisks.reduce((sum, risk) => sum + risk.metrics.impactScore, 0) / total || 0;

    return {
      total,
      byCategory,
      bySeverity,
      byStatus,
      avgRiskScore,
      avgProbability,
      avgImpact
    };
  }, [filteredRisks]);

  const getSeverityColor = (severity: RiskSeverity) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: RiskStatus) => {
    switch (status) {
      case 'identified': return 'bg-blue-100 text-blue-800';
      case 'assessed': return 'bg-purple-100 text-purple-800';
      case 'mitigated': return 'bg-green-100 text-green-800';
      case 'monitored': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'accepted': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: RiskCategory) => {
    switch (category) {
      case 'schedule': return Clock;
      case 'budget': return DollarSign;
      case 'resource': return Users;
      case 'technical': return Tool;
      case 'security': return Shield;
      default: return AlertTriangle;
    }
  };

  const handleCreateRisk = async (riskData: Partial<ProjectRisk>) => {
    setLoading(true);
    try {
      await onRiskCreate(riskData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create risk:', error);
      setError('Failed to create risk');
    } finally {
      setLoading(false);
    }
  };

  const handleRiskUpdate = async (riskId: string, updates: Partial<ProjectRisk>) => {
    setLoading(true);
    try {
      await onRiskUpdate(riskId, updates);
    } catch (error) {
      console.error('Failed to update risk:', error);
      setError('Failed to update risk');
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Risk Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Risks</p>
              <p className="text-2xl font-bold text-gray-900">{riskMetrics.total}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Risk Score</p>
              <p className="text-2xl font-bold text-gray-900">{riskMetrics.avgRiskScore.toFixed(1)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Risks</p>
              <p className="text-2xl font-bold text-red-600">{riskMetrics.bySeverity.critical || 0}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Risks</p>
              <p className="text-2xl font-bold text-yellow-600">
                {(riskMetrics.byStatus.identified || 0) + (riskMetrics.byStatus.assessed || 0)}
              </p>
            </div>
            <Activity className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Risk Matrix */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Matrix</h3>
        <div className="grid grid-cols-4 gap-2">
          {/* Header */}
          <div></div>
          <div className="text-center font-medium text-sm text-gray-600">Low Impact</div>
          <div className="text-center font-medium text-sm text-gray-600">Medium Impact</div>
          <div className="text-center font-medium text-sm text-gray-600">High Impact</div>
          
          {/* High Probability */}
          <div className="text-center font-medium text-sm text-gray-600 py-2">High Probability</div>
          <div className="bg-yellow-100 border border-yellow-200 p-3 rounded h-24 overflow-y-auto">
            {riskMatrix.highLow.map(risk => (
              <div key={risk.id} className="text-xs p-1 bg-yellow-200 rounded mb-1 cursor-pointer truncate"
                   onClick={() => setSelectedRisk(risk)}>
                {risk.title}
              </div>
            ))}
          </div>
          <div className="bg-orange-100 border border-orange-200 p-3 rounded h-24 overflow-y-auto">
            {riskMatrix.highMedium.map(risk => (
              <div key={risk.id} className="text-xs p-1 bg-orange-200 rounded mb-1 cursor-pointer truncate"
                   onClick={() => setSelectedRisk(risk)}>
                {risk.title}
              </div>
            ))}
          </div>
          <div className="bg-red-100 border border-red-200 p-3 rounded h-24 overflow-y-auto">
            {riskMatrix.highHigh.map(risk => (
              <div key={risk.id} className="text-xs p-1 bg-red-200 rounded mb-1 cursor-pointer truncate"
                   onClick={() => setSelectedRisk(risk)}>
                {risk.title}
              </div>
            ))}
          </div>
          
          {/* Medium Probability */}
          <div className="text-center font-medium text-sm text-gray-600 py-2">Medium Probability</div>
          <div className="bg-green-100 border border-green-200 p-3 rounded h-24 overflow-y-auto">
            {riskMatrix.mediumLow.map(risk => (
              <div key={risk.id} className="text-xs p-1 bg-green-200 rounded mb-1 cursor-pointer truncate"
                   onClick={() => setSelectedRisk(risk)}>
                {risk.title}
              </div>
            ))}
          </div>
          <div className="bg-yellow-100 border border-yellow-200 p-3 rounded h-24 overflow-y-auto">
            {riskMatrix.mediumMedium.map(risk => (
              <div key={risk.id} className="text-xs p-1 bg-yellow-200 rounded mb-1 cursor-pointer truncate"
                   onClick={() => setSelectedRisk(risk)}>
                {risk.title}
              </div>
            ))}
          </div>
          <div className="bg-orange-100 border border-orange-200 p-3 rounded h-24 overflow-y-auto">
            {riskMatrix.mediumHigh.map(risk => (
              <div key={risk.id} className="text-xs p-1 bg-orange-200 rounded mb-1 cursor-pointer truncate"
                   onClick={() => setSelectedRisk(risk)}>
                {risk.title}
              </div>
            ))}
          </div>
          
          {/* Low Probability */}
          <div className="text-center font-medium text-sm text-gray-600 py-2">Low Probability</div>
          <div className="bg-green-100 border border-green-200 p-3 rounded h-24 overflow-y-auto">
            {riskMatrix.lowLow.map(risk => (
              <div key={risk.id} className="text-xs p-1 bg-green-200 rounded mb-1 cursor-pointer truncate"
                   onClick={() => setSelectedRisk(risk)}>
                {risk.title}
              </div>
            ))}
          </div>
          <div className="bg-green-100 border border-green-200 p-3 rounded h-24 overflow-y-auto">
            {riskMatrix.lowMedium.map(risk => (
              <div key={risk.id} className="text-xs p-1 bg-green-200 rounded mb-1 cursor-pointer truncate"
                   onClick={() => setSelectedRisk(risk)}>
                {risk.title}
              </div>
            ))}
          </div>
          <div className="bg-yellow-100 border border-yellow-200 p-3 rounded h-24 overflow-y-auto">
            {riskMatrix.lowHigh.map(risk => (
              <div key={risk.id} className="text-xs p-1 bg-yellow-200 rounded mb-1 cursor-pointer truncate"
                   onClick={() => setSelectedRisk(risk)}>
                {risk.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Risks */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Risks</h3>
        <div className="space-y-3">
          {filteredRisks.slice(0, 5).map(risk => {
            const CategoryIcon = getCategoryIcon(risk.category);
            return (
              <div key={risk.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                   onClick={() => setSelectedRisk(risk)}>
                <CategoryIcon className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{risk.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(risk.severity)}`}>
                        {risk.severity}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(risk.status)}`}>
                        {risk.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{risk.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderRiskList = () => (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Risk List</h3>
      </div>
      <div className="divide-y">
        {filteredRisks.map(risk => {
          const CategoryIcon = getCategoryIcon(risk.category);
          return (
            <div key={risk.id} className="p-4 hover:bg-gray-50 cursor-pointer"
                 onClick={() => setSelectedRisk(risk)}>
              <div className="flex items-start space-x-3">
                <CategoryIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{risk.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(risk.severity)}`}>
                        {risk.severity}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(risk.status)}`}>
                        {risk.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Probability: {risk.probability}%</span>
                    <span>Impact: {risk.impact}</span>
                    <span>Score: {risk.metrics.riskScore}</span>
                    <span>Owner: {risk.mitigation.owner.name}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderViewContent = () => {
    switch (viewMode) {
      case 'dashboard':
        return renderDashboard();
      case 'matrix':
        return renderDashboard(); // Matrix is part of dashboard
      case 'list':
        return renderRiskList();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Risk Tracker</h2>
          <p className="text-gray-600">Identify, assess, and mitigate project risks</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`p-2 rounded-lg ${
                viewMode === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`p-2 rounded-lg ${
                viewMode === 'matrix' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <PieChart size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText size={20} />
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Risk</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search risks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className={`p-2 rounded-lg ${
            showFilterPanel ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Filter size={20} />
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as keyof ProjectRisk)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="severity">Sort by Severity</option>
          <option value="probability">Sort by Probability</option>
          <option value="status">Sort by Status</option>
          <option value="identifiedDate">Sort by Date</option>
        </select>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <div className="space-y-2">
                {['low', 'medium', 'high', 'critical'].map(severity => (
                  <label key={severity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.severity.includes(severity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, severity: [...prev.severity, severity] }));
                        } else {
                          setFilters(prev => ({ ...prev, severity: prev.severity.filter(s => s !== severity) }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600 capitalize">{severity}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-2">
                {['identified', 'assessed', 'mitigated', 'monitored', 'closed'].map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, status: [...prev.status, status] }));
                        } else {
                          setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== status) }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="space-y-2">
                {['schedule', 'budget', 'resource', 'technical', 'external'].map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, category: [...prev.category, category] }));
                        } else {
                          setFilters(prev => ({ ...prev, category: prev.category.filter(c => c !== category) }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600 capitalize">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Content */}
      {renderViewContent()}

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
              <XCircle size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectRiskTracker;