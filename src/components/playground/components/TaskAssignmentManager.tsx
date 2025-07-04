import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, 
  User, 
  UserPlus, 
  UserMinus,
  Target, 
  Clock, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Activity, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Flag,
  Brain,
  Timer,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  Shuffle,
  Scale,
  Award,
  Star,
  Loader,
  RefreshCw,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import type { 
  Task, 
  TeamMember, 
  Project,
  TaskAssignment,
  TaskAssignmentSuggestion,
  WorkloadBalance,
  TaskAssignmentOptimization,
  TaskPriority,
  TaskComplexity,
  TaskEffort
} from '../../tasks/types';

interface TaskAssignmentManagerProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  projects: Project[];
  currentAssignments?: TaskAssignment[];
  workloadData?: WorkloadBalance[];
  optimizationSuggestions?: TaskAssignmentOptimization;
  projectId?: string;
  enableAutoAssignment?: boolean;
  enableWorkloadBalancing?: boolean;
  enableSkillsMatching?: boolean;
  enableCapacityPlanning?: boolean;
  showAnalytics?: boolean;
  onAssignTask?: (taskId: string, assigneeId: string, reason?: string) => Promise<void>;
  onUnassignTask?: (taskId: string) => Promise<void>;
  onBulkAssign?: (taskIds: string[], assigneeId: string) => Promise<void>;
  onOptimizeAssignments?: (projectId: string) => Promise<TaskAssignmentOptimization>;
  onBalanceWorkload?: () => Promise<void>;
  onRequestSuggestions?: (taskId: string) => Promise<TaskAssignmentSuggestion[]>;
}

interface AssignmentView {
  mode: 'overview' | 'assign' | 'balance' | 'optimize' | 'analytics';
}

interface AssignmentFilters {
  assigneeId?: string;
  priority?: TaskPriority;
  complexity?: TaskComplexity;
  unassignedOnly?: boolean;
  overloadedOnly?: boolean;
  skillsMismatch?: boolean;
}

export const TaskAssignmentManager: React.FC<TaskAssignmentManagerProps> = ({
  tasks,
  teamMembers,
  projects,
  currentAssignments = [],
  workloadData = [],
  optimizationSuggestions,
  projectId,
  enableAutoAssignment = true,
  enableWorkloadBalancing = true,
  enableSkillsMatching = true,
  enableCapacityPlanning = true,
  showAnalytics = true,
  onAssignTask,
  onUnassignTask,
  onBulkAssign,
  onOptimizeAssignments,
  onBalanceWorkload,
  onRequestSuggestions
}) => {
  // State management
  const [currentView, setCurrentView] = useState<AssignmentView['mode']>('overview');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<AssignmentFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, TaskAssignmentSuggestion[]>>({});
  const [loading, setLoading] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (projectId) {
      filtered = filtered.filter(task => task.projectId === projectId);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    if (filters.assigneeId) {
      filtered = filtered.filter(task => task.assigneeId === filters.assigneeId);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.complexity) {
      filtered = filtered.filter(task => task.complexity === filters.complexity);
    }

    if (filters.unassignedOnly) {
      filtered = filtered.filter(task => !task.assigneeId);
    }

    return filtered;
  }, [tasks, projectId, searchQuery, filters]);

  // Calculate workload metrics
  const workloadMetrics = useMemo(() => {
    return teamMembers.map(member => {
      const memberTasks = filteredTasks.filter(task => task.assigneeId === member.id);
      const totalEstimatedHours = memberTasks.reduce((acc, task) => acc + (task.estimatedHours || 0), 0);
      const totalStoryPoints = memberTasks.reduce((acc, task) => acc + (task.storyPoints || 0), 0);
      const totalActualHours = memberTasks.reduce((acc, task) => acc + (task.actualHours || 0), 0);
      
      const completedTasks = memberTasks.filter(task => {
        const isCompleted = typeof task.status === 'string' ? 
          task.status === 'completed' : 
          task.status.isCompleted;
        return isCompleted;
      }).length;

      const overdueTasks = memberTasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const isCompleted = typeof task.status === 'string' ? 
          task.status === 'completed' : 
          task.status.isCompleted;
        return dueDate < today && !isCompleted;
      }).length;

      const highPriorityTasks = memberTasks.filter(task => 
        task.priority === 'high' || task.priority === 'urgent'
      ).length;

      // Calculate capacity based on 40 hours per week
      const weeklyCapacity = 40;
      const utilization = (totalEstimatedHours / weeklyCapacity) * 100;

      // Calculate efficiency
      const efficiency = totalEstimatedHours > 0 ? 
        (totalActualHours / totalEstimatedHours) * 100 : 100;

      // Calculate workload balance score
      const balanceScore = Math.max(0, 100 - Math.abs(utilization - 80)); // Optimal utilization is 80%

      return {
        member,
        totalTasks: memberTasks.length,
        completedTasks,
        totalEstimatedHours,
        totalStoryPoints,
        totalActualHours,
        overdueTasks,
        highPriorityTasks,
        utilization,
        efficiency,
        balanceScore,
        isOverloaded: utilization > 100,
        isUnderloaded: utilization < 50,
        tasks: memberTasks
      };
    });
  }, [teamMembers, filteredTasks]);

  // Get unassigned tasks
  const unassignedTasks = useMemo(() => {
    return filteredTasks.filter(task => !task.assigneeId);
  }, [filteredTasks]);

  // Calculate assignment recommendations
  const assignmentRecommendations = useMemo(() => {
    if (!enableAutoAssignment) return [];
    
    return unassignedTasks.map(task => {
      // Simple scoring algorithm for demonstration
      const recommendations = teamMembers.map(member => {
        const memberWorkload = workloadMetrics.find(w => w.member.id === member.id);
        if (!memberWorkload) return null;

        // Base score factors
        let score = 100;
        
        // Workload factor (prefer less loaded members)
        score -= memberWorkload.utilization * 0.3;
        
        // Skills matching (simplified - would be more complex in real implementation)
        if (task.complexity === 'simple' && memberWorkload.member.role === 'admin') score += 10;
        if (task.complexity === 'complex' && memberWorkload.member.role === 'manager') score += 15;
        
        // Priority factor
        if (task.priority === 'urgent' && memberWorkload.overdueTasks === 0) score += 20;
        
        // Efficiency factor
        score += (memberWorkload.efficiency - 100) * 0.1;

        return {
          member,
          score: Math.max(0, Math.min(100, score)),
          reasons: [
            `Utilization: ${memberWorkload.utilization.toFixed(0)}%`,
            `Efficiency: ${memberWorkload.efficiency.toFixed(0)}%`,
            `Current tasks: ${memberWorkload.totalTasks}`
          ]
        };
      }).filter(Boolean).sort((a, b) => (b?.score || 0) - (a?.score || 0));

      return {
        task,
        recommendations: recommendations.slice(0, 3) // Top 3 recommendations
      };
    });
  }, [unassignedTasks, teamMembers, workloadMetrics, enableAutoAssignment]);

  // Handle task assignment
  const handleAssignTask = useCallback(async (taskId: string, assigneeId: string, reason?: string) => {
    if (!onAssignTask) return;
    
    try {
      setLoading(true);
      await onAssignTask(taskId, assigneeId, reason);
    } catch (error) {
      console.error('Failed to assign task:', error);
    } finally {
      setLoading(false);
    }
  }, [onAssignTask]);

  // Handle bulk assignment
  const handleBulkAssign = useCallback(async () => {
    if (!onBulkAssign || selectedTasks.size === 0 || !selectedAssignee) return;
    
    try {
      setLoading(true);
      await onBulkAssign(Array.from(selectedTasks), selectedAssignee);
      setSelectedTasks(new Set());
      setSelectedAssignee('');
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to bulk assign tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [onBulkAssign, selectedTasks, selectedAssignee]);

  // Handle workload optimization
  const handleOptimizeWorkload = useCallback(async () => {
    if (!onOptimizeAssignments || !projectId) return;
    
    try {
      setLoading(true);
      await onOptimizeAssignments(projectId);
    } catch (error) {
      console.error('Failed to optimize assignments:', error);
    } finally {
      setLoading(false);
    }
  }, [onOptimizeAssignments, projectId]);

  // Handle task selection
  const handleTaskSelect = useCallback((taskId: string, selected: boolean) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  }, []);

  // Get assignee for task
  const getAssignee = useCallback((assigneeId?: string) => {
    if (!assigneeId) return undefined;
    return teamMembers.find(m => m.id === assigneeId);
  }, [teamMembers]);

  // Get priority color
  const getPriorityColor = useCallback((priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Get utilization color
  const getUtilizationColor = useCallback((utilization: number) => {
    if (utilization > 100) return 'text-red-600 bg-red-50';
    if (utilization > 80) return 'text-orange-600 bg-orange-50';
    if (utilization < 50) return 'text-gray-600 bg-gray-50';
    return 'text-green-600 bg-green-50';
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Assignment Manager</h2>
          <p className="text-sm text-gray-600 mt-1">
            Intelligent task assignment with workload balancing and skills matching
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {enableWorkloadBalancing && onBalanceWorkload && (
            <button
              onClick={onBalanceWorkload}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Scale className="w-4 h-4 mr-2" />
              Balance Workload
            </button>
          )}
          
          {enableAutoAssignment && (
            <button
              onClick={handleOptimizeWorkload}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Auto-Optimize
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 text-sm font-medium ${
            currentView === 'overview'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setCurrentView('overview')}
        >
          Overview
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${
            currentView === 'assign'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setCurrentView('assign')}
        >
          Assign Tasks ({unassignedTasks.length})
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${
            currentView === 'balance'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setCurrentView('balance')}
        >
          Workload Balance
        </button>
        {enableAutoAssignment && (
          <button
            className={`px-6 py-3 text-sm font-medium ${
              currentView === 'optimize'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setCurrentView('optimize')}
          >
            Optimization
          </button>
        )}
        {showAnalytics && (
          <button
            className={`px-6 py-3 text-sm font-medium ${
              currentView === 'analytics'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setCurrentView('analytics')}
          >
            Analytics
          </button>
        )}
      </div>

      {/* Overview Tab */}
      {currentView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-semibold text-gray-900">{filteredTasks.length}</p>
                  <p className="text-xs text-gray-500">{unassignedTasks.length} unassigned</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Team Members</p>
                  <p className="text-2xl font-semibold text-gray-900">{teamMembers.length}</p>
                  <p className="text-xs text-gray-500">
                    {workloadMetrics.filter(w => w.isOverloaded).length} overloaded
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {workloadMetrics.length > 0 
                      ? (workloadMetrics.reduce((acc, w) => acc + w.utilization, 0) / workloadMetrics.length).toFixed(0)
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-500">Target: 80%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Balance Score</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {workloadMetrics.length > 0 
                      ? (workloadMetrics.reduce((acc, w) => acc + w.balanceScore, 0) / workloadMetrics.length).toFixed(0)
                      : 0}
                  </p>
                  <p className="text-xs text-gray-500">Out of 100</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Workload Overview */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Team Workload Overview</h3>
              <p className="text-sm text-gray-600 mt-1">Current task distribution and utilization</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workloadMetrics.map((metric) => (
                  <div key={metric.member.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                          {metric.member.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{metric.member.name}</h4>
                          <p className="text-sm text-gray-600">{metric.member.role}</p>
                        </div>
                      </div>
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationColor(metric.utilization)}`}>
                        {metric.utilization.toFixed(0)}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tasks</span>
                        <span className="font-medium">{metric.totalTasks}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Est. Hours</span>
                        <span className="font-medium">{metric.totalEstimatedHours.toFixed(1)}h</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Story Points</span>
                        <span className="font-medium">{metric.totalStoryPoints}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            metric.utilization > 100 ? 'bg-red-500' :
                            metric.utilization > 80 ? 'bg-orange-500' :
                            metric.utilization < 50 ? 'bg-gray-400' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, metric.utilization)}%` }}
                        />
                      </div>
                      
                      {metric.isOverloaded && (
                        <div className="flex items-center text-xs text-red-600 mt-2">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Overloaded
                        </div>
                      )}
                      
                      {metric.isUnderloaded && (
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Underutilized
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Tasks Tab */}
      {currentView === 'assign' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as TaskPriority || undefined }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.unassignedOnly === true}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    unassignedOnly: e.target.checked ? true : undefined 
                  }))}
                  className="w-4 h-4 text-blue-600 rounded mr-2"
                />
                <span className="text-sm text-gray-700">Unassigned only</span>
              </label>
            </div>
            
            {selectedTasks.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedTasks.size} selected</span>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select assignee</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleBulkAssign}
                  disabled={!selectedAssignee || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  Assign
                </button>
              </div>
            )}
          </div>

          {/* Assignment Recommendations */}
          {enableAutoAssignment && assignmentRecommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Assignment Recommendations</h3>
                <p className="text-sm text-gray-600 mt-1">AI-powered suggestions for optimal task assignment</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {assignmentRecommendations.slice(0, 5).map(({ task, recommendations }) => (
                  <div key={task.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {task.estimatedHours && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {task.estimatedHours}h
                            </div>
                          )}
                          {task.storyPoints && (
                            <div className="flex items-center">
                              <Target className="w-3 h-3 mr-1" />
                              {task.storyPoints} pts
                            </div>
                          )}
                          <div className="flex items-center">
                            <Brain className="w-3 h-3 mr-1" />
                            {task.complexity}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 space-y-2">
                        {recommendations.filter(rec => rec !== null).map((rec, index) => (
                          <button
                            key={rec.member.id}
                            onClick={() => handleAssignTask(task.id, rec.member.id, rec.reasons.join(', '))}
                            disabled={loading}
                            className={`flex items-center space-x-3 p-3 rounded-lg border text-left hover:bg-gray-50 transition-colors ${
                              index === 0 ? 'border-green-300 bg-green-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {rec.member.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{rec.member.name}</div>
                              <div className="text-xs text-gray-600">Score: {rec.score.toFixed(0)}</div>
                            </div>
                            {index === 0 && (
                              <Star className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTasks(new Set(filteredTasks.map(t => t.id)));
                          } else {
                            setSelectedTasks(new Set());
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Est. Hours
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task) => {
                    const assignee = getAssignee(task.assigneeId);
                    const isSelected = selectedTasks.has(task.id);

                    return (
                      <tr key={task.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleTaskSelect(task.id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-gray-600 truncate">{task.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {assignee ? (
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                                {assignee.name.charAt(0)}
                              </div>
                              <span className="text-sm text-gray-900">{assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {task.estimatedHours ? `${task.estimatedHours}h` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {!task.assigneeId ? (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssignTask(task.id, e.target.value);
                                  }
                                }}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                defaultValue=""
                              >
                                <option value="">Assign to...</option>
                                {teamMembers.map(member => (
                                  <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                              </select>
                            ) : (
                              <button
                                onClick={() => onUnassignTask?.(task.id)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Unassign
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Workload Balance Tab */}
      {currentView === 'balance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Workload Balance Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">Identify and resolve workload imbalances across the team</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {workloadMetrics.map((metric) => (
                  <div key={metric.member.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-4">
                          {metric.member.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{metric.member.name}</h4>
                          <p className="text-sm text-gray-600">{metric.member.role}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getUtilizationColor(metric.utilization).split(' ')[0]}`}>
                          {metric.utilization.toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600">Utilization</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-semibold text-gray-900">{metric.totalTasks}</div>
                        <div className="text-sm text-gray-600">Total Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-semibold text-gray-900">{metric.totalEstimatedHours.toFixed(0)}h</div>
                        <div className="text-sm text-gray-600">Est. Hours</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-semibold text-gray-900">{metric.totalStoryPoints}</div>
                        <div className="text-sm text-gray-600">Story Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-semibold text-gray-900">{metric.efficiency.toFixed(0)}%</div>
                        <div className="text-sm text-gray-600">Efficiency</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          metric.utilization > 100 ? 'bg-red-500' :
                          metric.utilization > 80 ? 'bg-orange-500' :
                          metric.utilization < 50 ? 'bg-gray-400' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, metric.utilization)}%` }}
                      />
                    </div>
                    
                    {metric.isOverloaded && (
                      <div className="flex items-center text-sm text-red-600 mb-2">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        This team member is overloaded. Consider reassigning some tasks.
                      </div>
                    )}
                    
                    {metric.isUnderloaded && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <TrendingDown className="w-4 h-4 mr-2" />
                        This team member has capacity for additional tasks.
                      </div>
                    )}
                    
                    {metric.overdueTasks > 0 && (
                      <div className="flex items-center text-sm text-orange-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {metric.overdueTasks} overdue task{metric.overdueTasks !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Tab */}
      {currentView === 'optimize' && enableAutoAssignment && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Assignment Optimization</h3>
              <p className="text-sm text-gray-600 mt-1">AI-powered recommendations to optimize task assignments</p>
            </div>
            
            <div className="p-6">
              {optimizationSuggestions ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Optimization Score</h4>
                      <p className="text-sm text-gray-600">Current assignment efficiency</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{optimizationSuggestions.balanceScore.toFixed(0)}</div>
                      <div className="text-sm text-gray-600">out of 100</div>
                    </div>
                  </div>
                  
                  {optimizationSuggestions.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Task Assignment Change</h5>
                          <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                          <div className="text-sm text-gray-500 mt-2">
                            Impact Score: {rec.impact.toFixed(0)}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Handle applying optimization suggestion
                            console.log('Apply optimization:', rec);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No optimization suggestions</h4>
                  <p className="text-sm text-gray-600 mb-4">Your current assignments are already well optimized!</p>
                  <button
                    onClick={handleOptimizeWorkload}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Re-analyze
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {currentView === 'analytics' && showAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Distribution</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Assignment distribution chart would be implemented here</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workload Trends</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Workload trend chart would be implemented here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};