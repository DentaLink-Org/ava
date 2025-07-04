import React, { useState, useCallback, useMemo } from 'react';
import { 
  Users, 
  User, 
  UserPlus, 
  UserMinus, 
  UserCheck, 
  UserX, 
  Crown, 
  Shield, 
  Eye, 
  Edit3, 
  Settings, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Target, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Star, 
  Award, 
  Briefcase, 
  Code, 
  Palette, 
  Database, 
  Server, 
  Zap, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Plus, 
  Minus, 
  X, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink, 
  Mail, 
  Phone, 
  MessageSquare, 
  Bell, 
  Volume2, 
  Shuffle, 
  RotateCcw, 
  Save, 
  RefreshCw, 
  Download, 
  Upload, 
  Copy, 
  Share, 
  BookOpen, 
  GraduationCap, 
  Layers, 
  Grid, 
  List, 
  Map
} from 'lucide-react';
import type { 
  Milestone, 
  TeamMember, 
  Project, 
  TaskPriority, 
  MilestoneStatus, 
  UserRole 
} from '../../milestones/types';

export interface TeamMemberExtended extends TeamMember {
  skills: Skill[];
  availability: Availability;
  workload: Workload;
  performance: Performance;
  preferences: MemberPreferences;
  certifications: Certification[];
  experience: Experience;
  timezone: string;
  costPerHour: number;
  department: string;
  manager?: string;
  directReports: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  verified: boolean;
  verifiedBy?: string;
  verifiedDate?: string;
  yearsExperience: number;
  lastUsed?: string;
  endorsements: number;
}

export interface Availability {
  status: AvailabilityStatus;
  capacity: number; // 0-100 percentage
  hoursPerWeek: number;
  unavailableDates: UnavailableDate[];
  workingHours: WorkingHours;
  timeOff: TimeOffPeriod[];
  overbooked: boolean;
  nextAvailable?: string;
}

export interface UnavailableDate {
  start: string;
  end: string;
  reason: string;
  type: 'vacation' | 'sick' | 'training' | 'meeting' | 'other';
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  available: boolean;
  startTime: string;
  endTime: string;
  breaks: BreakPeriod[];
}

export interface BreakPeriod {
  startTime: string;
  endTime: string;
  description: string;
}

export interface TimeOffPeriod {
  id: string;
  start: string;
  end: string;
  type: TimeOffType;
  status: 'pending' | 'approved' | 'denied';
  reason?: string;
}

export interface Workload {
  currentProjects: number;
  currentMilestones: number;
  currentTasks: number;
  totalHours: number;
  utilizationRate: number; // 0-100 percentage
  burnoutRisk: RiskLevel;
  efficiency: number; // 0-100 percentage
  overallocation: boolean;
  recommendations: WorkloadRecommendation[];
}

export interface WorkloadRecommendation {
  type: 'reduce' | 'redistribute' | 'reschedule' | 'delegate';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
}

export interface Performance {
  completionRate: number; // 0-100 percentage
  qualityScore: number; // 0-100 percentage
  timeliness: number; // 0-100 percentage
  collaborationScore: number; // 0-100 percentage
  innovationScore: number; // 0-100 percentage
  overallRating: number; // 0-5 stars
  recentTrend: 'improving' | 'declining' | 'stable';
  strengths: string[];
  areasForImprovement: string[];
  goals: PerformanceGoal[];
}

export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  deadline: string;
  status: 'on_track' | 'behind' | 'ahead' | 'completed';
}

export interface MemberPreferences {
  preferredWorkTypes: WorkType[];
  avoidWorkTypes: WorkType[];
  preferredCollaborators: string[];
  communicationStyle: CommunicationStyle;
  learningGoals: string[];
  careerInterests: string[];
  workEnvironment: WorkEnvironmentPreference;
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  level: string;
  obtainedDate: string;
  expiryDate?: string;
  verified: boolean;
  credentialId?: string;
  skills: string[];
}

export interface Experience {
  totalYears: number;
  relevantYears: number;
  previousRoles: PreviousRole[];
  education: Education[];
  projects: ProjectExperience[];
}

export interface PreviousRole {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface Education {
  id: string;
  degree: string;
  field: string;
  institution: string;
  graduationDate: string;
  gpa?: number;
  honors?: string[];
}

export interface ProjectExperience {
  id: string;
  name: string;
  role: string;
  duration: string;
  technologies: string[];
  outcomes: string[];
  teamSize: number;
}

export interface AssignmentRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  conditions: AssignmentCondition[];
  actions: AssignmentAction[];
  exceptions: AssignmentException[];
  effectiveness: number;
  createdBy: string;
  createdDate: string;
  lastUsed?: string;
  useCount: number;
}

export interface AssignmentCondition {
  id: string;
  type: ConditionType;
  field: string;
  operator: string;
  value: any;
  weight: number; // 0-100 for scoring
}

export interface AssignmentAction {
  id: string;
  type: ActionType;
  target: string;
  value: any;
  priority: number;
}

export interface AssignmentException {
  id: string;
  memberId: string;
  milestoneId?: string;
  projectId?: string;
  reason: string;
  startDate: string;
  endDate?: string;
  temporary: boolean;
}

export interface AssignmentSuggestion {
  id: string;
  milestoneId: string;
  suggestedMembers: MemberSuggestion[];
  reasoning: string;
  confidence: number;
  alternatives: AlternativeSuggestion[];
  riskFactors: RiskFactor[];
  benefits: string[];
  estimatedOutcome: OutcomeEstimate;
}

export interface MemberSuggestion {
  memberId: string;
  member: TeamMemberExtended;
  score: number;
  reasons: string[];
  fit: FitAnalysis;
  availability: AvailabilityAnalysis;
  workload: WorkloadAnalysis;
  skills: SkillMatch[];
}

export interface AlternativeSuggestion {
  option: string;
  description: string;
  pros: string[];
  cons: string[];
  effort: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface RiskFactor {
  type: 'availability' | 'skill_gap' | 'workload' | 'communication' | 'experience';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
  impact: string;
}

export interface FitAnalysis {
  skillMatch: number; // 0-100
  experienceMatch: number; // 0-100
  preferenceMatch: number; // 0-100
  culturalFit: number; // 0-100
  overallFit: number; // 0-100
}

export interface AvailabilityAnalysis {
  currentCapacity: number; // 0-100
  timeToStart: number; // days
  sustainabilityRisk: 'low' | 'medium' | 'high';
  conflictingCommitments: string[];
}

export interface WorkloadAnalysis {
  currentUtilization: number; // 0-100
  projectedUtilization: number; // 0-100
  burnoutRisk: 'low' | 'medium' | 'high';
  optimalCapacity: boolean;
}

export interface SkillMatch {
  skillId: string;
  skillName: string;
  required: boolean;
  memberLevel: SkillLevel;
  requiredLevel: SkillLevel;
  gap: number; // negative = exceeds, positive = needs improvement
  development: SkillDevelopment;
}

export interface SkillDevelopment {
  timeToAcquire: number; // hours
  trainingResources: TrainingResource[];
  mentors: string[];
  estimatedCost: number;
}

export interface TrainingResource {
  id: string;
  name: string;
  type: 'course' | 'certification' | 'workshop' | 'mentoring' | 'book' | 'video';
  provider: string;
  duration: number; // hours
  cost: number;
  rating: number; // 0-5
  difficulty: SkillLevel;
}

export interface OutcomeEstimate {
  successProbability: number; // 0-100
  estimatedCompletion: string;
  qualityScore: number; // 0-100
  riskScore: number; // 0-100
  innovationPotential: number; // 0-100
  learningValue: number; // 0-100
}

export interface Assignment {
  id: string;
  milestoneId: string;
  memberId: string;
  role: AssignmentRole;
  responsibility: ResponsibilityLevel;
  startDate: string;
  endDate?: string;
  estimatedHours: number;
  actualHours?: number;
  status: AssignmentStatus;
  notes?: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface BulkAssignmentOperation {
  type: BulkAssignmentType;
  milestoneIds: string[];
  memberIds: string[];
  role?: AssignmentRole;
  responsibility?: ResponsibilityLevel;
  replaceExisting: boolean;
  applyRules: boolean;
  validateWorkload: boolean;
}

export interface AssignmentConflict {
  type: ConflictType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedMembers: string[];
  affectedMilestones: string[];
  suggestions: ConflictResolution[];
}

export interface ConflictResolution {
  action: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  effectiveness: number; // 0-100
  sideEffects: string[];
}

export type SkillCategory = 'technical' | 'leadership' | 'design' | 'communication' | 'analytical' | 'creative' | 'domain_specific';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type AvailabilityStatus = 'available' | 'busy' | 'overbooked' | 'unavailable' | 'partial';
export type TimeOffType = 'vacation' | 'sick' | 'personal' | 'training' | 'conference' | 'other';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type WorkType = 'development' | 'design' | 'research' | 'planning' | 'testing' | 'documentation' | 'review' | 'meeting' | 'training';
export type CommunicationStyle = 'direct' | 'collaborative' | 'analytical' | 'supportive' | 'expressive';
export type WorkEnvironmentPreference = 'individual' | 'small_team' | 'large_team' | 'cross_functional' | 'independent';
export type ConditionType = 'skill_required' | 'availability' | 'workload' | 'experience' | 'preference' | 'department' | 'role' | 'performance';
export type ActionType = 'assign' | 'recommend' | 'avoid' | 'require_approval' | 'notify' | 'escalate';
export type AssignmentRole = 'owner' | 'contributor' | 'reviewer' | 'advisor' | 'stakeholder';
export type ResponsibilityLevel = 'primary' | 'secondary' | 'supporting' | 'observing';
export type AssignmentStatus = 'proposed' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type BulkAssignmentType = 'assign' | 'unassign' | 'change_role' | 'change_responsibility' | 'transfer';
export type ConflictType = 'schedule' | 'workload' | 'skill_gap' | 'preference' | 'availability' | 'dependency';
export type ViewMode = 'matrix' | 'cards' | 'list' | 'timeline' | 'workload' | 'skills';

export interface TeamMilestoneAssignmentProps {
  milestones: Milestone[];
  teamMembers: TeamMemberExtended[];
  projects: Project[];
  assignments: Assignment[];
  rules: AssignmentRule[];
  suggestions: AssignmentSuggestion[];
  conflicts: AssignmentConflict[];
  onAssign: (assignment: Omit<Assignment, 'id' | 'createdDate' | 'lastModified'>) => Promise<void>;
  onUnassign: (assignmentId: string) => Promise<void>;
  onBulkAssign: (operation: BulkAssignmentOperation) => Promise<void>;
  onRuleCreate: (rule: Omit<AssignmentRule, 'id' | 'createdDate' | 'useCount'>) => Promise<void>;
  onRuleUpdate: (ruleId: string, updates: Partial<AssignmentRule>) => Promise<void>;
  onSuggestionApply: (suggestionId: string, memberIds: string[]) => Promise<void>;
  onConflictResolve: (conflictId: string, resolution: ConflictResolution) => Promise<void>;
  onWorkloadAnalysis: (memberIds: string[]) => Promise<WorkloadAnalysis[]>;
  onSkillGapAnalysis: (milestoneId: string) => Promise<SkillMatch[]>;
  enableSuggestions?: boolean;
  enableRules?: boolean;
  enableConflictDetection?: boolean;
  enableWorkloadManagement?: boolean;
  showSkillMatching?: boolean;
  showPerformanceMetrics?: boolean;
  className?: string;
}

export const TeamMilestoneAssignment: React.FC<TeamMilestoneAssignmentProps> = ({
  milestones,
  teamMembers,
  projects,
  assignments,
  rules,
  suggestions,
  conflicts,
  onAssign,
  onUnassign,
  onBulkAssign,
  onRuleCreate,
  onRuleUpdate,
  onSuggestionApply,
  onConflictResolve,
  onWorkloadAnalysis,
  onSkillGapAnalysis,
  enableSuggestions = true,
  enableRules = true,
  enableConflictDetection = true,
  enableWorkloadManagement = true,
  showSkillMatching = true,
  showPerformanceMetrics = true,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [selectedMilestones, setSelectedMilestones] = useState<Set<string>>(new Set());
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(true);
  const [showConflictsPanel, setShowConflictsPanel] = useState(true);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    skills: [] as string[],
    availability: [] as AvailabilityStatus[],
    department: [] as string[],
    role: [] as UserRole[],
    workload: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredMilestones = useMemo(() => {
    let filtered = milestones;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(milestone =>
        milestone.title.toLowerCase().includes(query) ||
        milestone.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [milestones, searchQuery]);

  const filteredMembers = useMemo(() => {
    let filtered = teamMembers;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query)
      );
    }

    if (filters.skills.length > 0) {
      filtered = filtered.filter(member =>
        filters.skills.some(skill =>
          member.skills.some(memberSkill =>
            memberSkill.name.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    if (filters.availability.length > 0) {
      filtered = filtered.filter(member =>
        filters.availability.includes(member.availability.status)
      );
    }

    if (filters.department.length > 0) {
      filtered = filtered.filter(member =>
        filters.department.includes(member.department)
      );
    }

    if (filters.role.length > 0) {
      filtered = filtered.filter(member =>
        filters.role.includes(member.role)
      );
    }

    return filtered;
  }, [teamMembers, searchQuery, filters]);

  const assignmentMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, Assignment | null>> = {};
    
    filteredMilestones.forEach(milestone => {
      matrix[milestone.id] = {};
      filteredMembers.forEach(member => {
        const assignment = assignments.find(a => 
          a.milestoneId === milestone.id && a.memberId === member.id
        );
        matrix[milestone.id][member.id] = assignment || null;
      });
    });

    return matrix;
  }, [filteredMilestones, filteredMembers, assignments]);

  const getAvailabilityColor = (availability: Availability) => {
    switch (availability.status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'overbooked': return 'bg-red-100 text-red-800';
      case 'unavailable': return 'bg-gray-100 text-gray-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkloadColor = (workload: Workload) => {
    if (workload.utilizationRate >= 90) return 'bg-red-100 text-red-800';
    if (workload.utilizationRate >= 75) return 'bg-yellow-100 text-yellow-800';
    if (workload.utilizationRate >= 50) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getSkillLevelColor = (level: SkillLevel) => {
    switch (level) {
      case 'beginner': return 'bg-gray-100 text-gray-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-green-100 text-green-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return Crown;
      case 'manager': return Shield;
      case 'member': return User;
      case 'viewer': return Eye;
      default: return User;
    }
  };

  const handleAssignment = async (milestoneId: string, memberId: string, role: AssignmentRole = 'contributor') => {
    setLoading(true);
    try {
      await onAssign({
        milestoneId,
        memberId,
        role,
        responsibility: 'primary',
        startDate: new Date().toISOString(),
        estimatedHours: 40,
        status: 'proposed',
        createdBy: 'current-user' // This would come from auth context
      });
    } catch (error) {
      console.error('Failed to assign member:', error);
      setError('Failed to assign team member');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignment = async (assignmentId: string) => {
    setLoading(true);
    try {
      await onUnassign(assignmentId);
    } catch (error) {
      console.error('Failed to unassign member:', error);
      setError('Failed to unassign team member');
    } finally {
      setLoading(false);
    }
  };

  const renderMatrixView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-900">
              Milestone
            </th>
            {filteredMembers.map(member => {
              const RoleIcon = getRoleIcon(member.role);
              return (
                <th key={member.id} className="px-3 py-3 text-center">
                  <div className="flex flex-col items-center space-y-1">
                    <div className="flex items-center space-x-1">
                      <RoleIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 truncate max-w-24">
                        {member.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getAvailabilityColor(member.availability)}`}>
                        {member.availability.capacity}%
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getWorkloadColor(member.workload)}`}>
                        {member.workload.utilizationRate}%
                      </span>
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredMilestones.map(milestone => {
            const project = projects.find(p => p.id === milestone.projectId);
            return (
              <tr key={milestone.id} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white px-4 py-3 border-r">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedMilestones.has(milestone.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedMilestones);
                        if (e.target.checked) {
                          newSelected.add(milestone.id);
                        } else {
                          newSelected.delete(milestone.id);
                        }
                        setSelectedMilestones(newSelected);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{milestone.title}</h3>
                      <div className="text-xs text-gray-500">
                        {project?.name} • {milestone.status} • {milestone.priority}
                      </div>
                      {milestone.dueDate && (
                        <div className="text-xs text-gray-500">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                {filteredMembers.map(member => {
                  const assignment = assignmentMatrix[milestone.id]?.[member.id];
                  return (
                    <td key={member.id} className="px-3 py-3 text-center">
                      {assignment ? (
                        <div className="flex flex-col items-center space-y-1">
                          <button
                            onClick={() => handleUnassignment(assignment.id)}
                            className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                            title={`${assignment.role} - ${assignment.responsibility}`}
                          >
                            <UserCheck size={14} />
                          </button>
                          <span className="text-xs text-gray-600 capitalize">
                            {assignment.role}
                          </span>
                          {assignment.estimatedHours && (
                            <span className="text-xs text-gray-500">
                              {assignment.estimatedHours}h
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAssignment(milestone.id, member.id)}
                          className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                          title="Assign to milestone"
                        >
                          <UserPlus size={14} />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderSuggestionsPanel = () => {
    if (!enableSuggestions || !showSuggestionsPanel || suggestions.length === 0) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-900">Assignment Suggestions</h3>
          <button
            onClick={() => setShowSuggestionsPanel(!showSuggestionsPanel)}
            className="text-blue-600 hover:text-blue-800"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          {suggestions.slice(0, 3).map(suggestion => {
            const milestone = milestones.find(m => m.id === suggestion.milestoneId);
            if (!milestone) return null;

            return (
              <div key={suggestion.id} className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                  <span className="text-sm text-blue-600">
                    {Math.round(suggestion.confidence)}% confidence
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{suggestion.reasoning}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {suggestion.suggestedMembers.slice(0, 3).map(memberSuggestion => {
                      const member = teamMembers.find(m => m.id === memberSuggestion.memberId);
                      if (!member) return null;
                      return (
                        <div key={member.id} className="flex items-center space-x-1">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={12} />
                          </div>
                          <span className="text-xs text-gray-600">{member.name}</span>
                          <span className="text-xs text-blue-600">({memberSuggestion.score}%)</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSuggestionApply(suggestion.id, suggestion.suggestedMembers.map(s => s.memberId))}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Apply
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderConflictsPanel = () => {
    if (!enableConflictDetection || !showConflictsPanel || conflicts.length === 0) return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-red-900">Assignment Conflicts</h3>
          <button
            onClick={() => setShowConflictsPanel(!showConflictsPanel)}
            className="text-red-600 hover:text-red-800"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          {conflicts.slice(0, 3).map(conflict => (
            <div key={conflict.type} className="bg-white p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <h4 className="font-medium text-gray-900 capitalize">{conflict.type.replace('_', ' ')}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    conflict.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    conflict.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    conflict.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {conflict.severity}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{conflict.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Affects {conflict.affectedMembers.length} members, {conflict.affectedMilestones.length} milestones
                </div>
                <div className="flex items-center space-x-2">
                  {conflict.suggestions.slice(0, 2).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => onConflictResolve(conflict.type, suggestion)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      {suggestion.action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Assignment</h2>
          <p className="text-gray-600">Assign team members to milestones with role-based responsibilities</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('matrix')}
              className={`p-2 rounded-lg ${
                viewMode === 'matrix' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg ${
                viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => setViewMode('workload')}
              className={`p-2 rounded-lg ${
                viewMode === 'workload' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={20} />
            </button>
          </div>
          <button
            onClick={() => setShowBulkModal(true)}
            disabled={selectedMilestones.size === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Users size={16} />
            <span>Bulk Assign</span>
          </button>
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

      {/* Suggestions Panel */}
      {renderSuggestionsPanel()}

      {/* Conflicts Panel */}
      {renderConflictsPanel()}

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search milestones and team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          onChange={(e) => setFilters({ ...filters, availability: e.target.value ? [e.target.value as AvailabilityStatus] : [] })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Availability</option>
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="overbooked">Overbooked</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <select
          onChange={(e) => setFilters({ ...filters, department: e.target.value ? [e.target.value] : [] })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Departments</option>
          <option value="engineering">Engineering</option>
          <option value="design">Design</option>
          <option value="product">Product</option>
          <option value="marketing">Marketing</option>
        </select>
      </div>

      {/* Main Content */}
      {viewMode === 'matrix' && renderMatrixView()}

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
            <span className="text-gray-900">Processing assignment...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMilestoneAssignment;