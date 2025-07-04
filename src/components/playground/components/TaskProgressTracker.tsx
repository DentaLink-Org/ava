import React, { useState, useMemo, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Activity, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Users,
  Flag,
  Brain,
  Timer,
  Play,
  Pause,
  Square,
  RotateCcw,
  Download,
  Filter,
  Settings,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus
} from 'lucide-react';
import type { 
  Task, 
  Project, 
  TeamMember, 
  TaskAnalytics,
  TaskPriority,
  TaskComplexity,
  TaskEffort,
  TaskRisk
} from '../../tasks/types';

interface TaskProgressTrackerProps {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
  analytics?: TaskAnalytics;
  projectId?: string;
  milestoneId?: string;
  enableRealtime?: boolean;
  enableFilters?: boolean;
  enableExport?: boolean;
  showPredictions?: boolean;
  showTeamMetrics?: boolean;
  showBurndown?: boolean;
  showVelocity?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  onDateRangeChange?: (range: { start: string; end: string }) => void;
  onExport?: (format: 'csv' | 'xlsx' | 'pdf') => Promise<void>;
}

interface ProgressMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  estimationAccuracy: number;
  totalTimeTracked: number;
  totalEstimatedHours: number;
  totalActualHours: number;
}

interface TrendData {
  date: string;
  completed: number;
  created: number;
  remaining: number;
  velocity: number;
}

export const TaskProgressTracker: React.FC<TaskProgressTrackerProps> = ({
  tasks,
  projects,
  teamMembers,
  analytics,
  projectId,
  milestoneId,
  enableRealtime = true,
  enableFilters = true,
  enableExport = true,
  showPredictions = true,
  showTeamMetrics = true,
  showBurndown = true,
  showVelocity = true,
  dateRange,
  onDateRangeChange,
  onExport
}) => {
  // State management
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'team' | 'burndown' | 'velocity'>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'custom'>('month');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [filterBy, setFilterBy] = useState<{
    priority?: TaskPriority;
    assignee?: string;
    project?: string;
    complexity?: TaskComplexity;
  }>({});

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (projectId) {
      filtered = filtered.filter(task => task.projectId === projectId);
    }

    if (milestoneId) {
      filtered = filtered.filter(task => task.milestoneId === milestoneId);
    }

    if (filterBy.priority) {
      filtered = filtered.filter(task => task.priority === filterBy.priority);
    }

    if (filterBy.assignee) {
      filtered = filtered.filter(task => task.assigneeId === filterBy.assignee);
    }

    if (filterBy.project) {
      filtered = filtered.filter(task => task.projectId === filterBy.project);
    }

    if (filterBy.complexity) {
      filtered = filtered.filter(task => task.complexity === filterBy.complexity);
    }

    // Apply date range filter
    if (dateRange) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= start && taskDate <= end;
      });
    }

    return filtered;
  }, [tasks, projectId, milestoneId, filterBy, dateRange]);

  // Calculate progress metrics
  const metrics = useMemo((): ProgressMetrics => {
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(task => {
      const isCompleted = typeof task.status === 'string' ? 
        task.status === 'completed' : 
        task.status.isCompleted;
      return isCompleted;
    }).length;
    
    const inProgressTasks = filteredTasks.filter(task => {
      const status = typeof task.status === 'string' ? task.status : task.status.id;
      return status === 'in_progress' || status === 'review';
    }).length;
    
    const blockedTasks = filteredTasks.filter(task => !!task.blockedReason).length;
    
    const overdueTasks = filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const isCompleted = typeof task.status === 'string' ? 
        task.status === 'completed' : 
        task.status.isCompleted;
      return dueDate < today && !isCompleted;
    }).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate average completion time
    const completedTasksWithDates = filteredTasks.filter(task => {
      const isCompleted = typeof task.status === 'string' ? 
        task.status === 'completed' : 
        task.status.isCompleted;
      return isCompleted && task.completedAt && task.createdAt;
    });

    const averageCompletionTime = completedTasksWithDates.length > 0 
      ? completedTasksWithDates.reduce((acc, task) => {
          const created = new Date(task.createdAt);
          const completed = new Date(task.completedAt!);
          const days = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          return acc + days;
        }, 0) / completedTasksWithDates.length
      : 0;

    // Calculate estimation accuracy
    const tasksWithEstimates = filteredTasks.filter(task => 
      task.estimatedHours && task.actualHours && task.actualHours > 0
    );
    
    const estimationAccuracy = tasksWithEstimates.length > 0
      ? tasksWithEstimates.reduce((acc, task) => {
          const accuracy = Math.min(task.estimatedHours! / task.actualHours!, task.actualHours! / task.estimatedHours!) * 100;
          return acc + accuracy;
        }, 0) / tasksWithEstimates.length
      : 0;

    // Calculate time metrics
    const totalEstimatedHours = filteredTasks.reduce((acc, task) => acc + (task.estimatedHours || 0), 0);
    const totalActualHours = filteredTasks.reduce((acc, task) => acc + (task.actualHours || 0), 0);
    const totalTimeTracked = filteredTasks.reduce((acc, task) => {
      return acc + (task.timeEntries?.reduce((sum, entry) => sum + (entry.durationMinutes || 0), 0) || 0);
    }, 0) / 60; // Convert minutes to hours

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      overdueTasks,
      completionRate,
      averageCompletionTime,
      estimationAccuracy,
      totalTimeTracked,
      totalEstimatedHours,
      totalActualHours
    };
  }, [filteredTasks]);

  // Generate trend data for charts
  const trendData = useMemo((): TrendData[] => {
    if (!dateRange) return [];

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const data: TrendData[] = [];
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const tasksCreatedByDate = filteredTasks.filter(task => 
        task.createdAt.startsWith(dateStr)
      ).length;
      
      const tasksCompletedByDate = filteredTasks.filter(task => 
        task.completedAt && task.completedAt.startsWith(dateStr)
      ).length;
      
      const remainingTasks = filteredTasks.filter(task => {
        const taskCreated = new Date(task.createdAt);
        const isCompleted = typeof task.status === 'string' ? 
          task.status === 'completed' : 
          task.status.isCompleted;
        return taskCreated <= date && (!isCompleted || (task.completedAt && new Date(task.completedAt) > date));
      }).length;

      // Calculate velocity (story points completed per day)
      const velocityData = filteredTasks.filter(task => 
        task.completedAt && task.completedAt.startsWith(dateStr) && task.storyPoints
      ).reduce((acc, task) => acc + (task.storyPoints || 0), 0);

      data.push({
        date: dateStr,
        completed: tasksCompletedByDate,
        created: tasksCreatedByDate,
        remaining: remainingTasks,
        velocity: velocityData
      });
    }
    
    return data;
  }, [filteredTasks, dateRange]);

  // Team performance metrics
  const teamMetrics = useMemo(() => {
    return teamMembers.map(member => {
      const memberTasks = filteredTasks.filter(task => task.assigneeId === member.id);
      const completedTasks = memberTasks.filter(task => {
        const isCompleted = typeof task.status === 'string' ? 
          task.status === 'completed' : 
          task.status.isCompleted;
        return isCompleted;
      });
      
      const totalStoryPoints = memberTasks.reduce((acc, task) => acc + (task.storyPoints || 0), 0);
      const completedStoryPoints = completedTasks.reduce((acc, task) => acc + (task.storyPoints || 0), 0);
      const totalHours = memberTasks.reduce((acc, task) => acc + (task.actualHours || 0), 0);
      
      const averageTaskTime = completedTasks.length > 0 
        ? completedTasks.reduce((acc, task) => {
            if (!task.completedAt || !task.createdAt) return acc;
            const created = new Date(task.createdAt);
            const completed = new Date(task.completedAt);
            const days = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            return acc + days;
          }, 0) / completedTasks.length
        : 0;

      return {
        member,
        totalTasks: memberTasks.length,
        completedTasks: completedTasks.length,
        completionRate: memberTasks.length > 0 ? (completedTasks.length / memberTasks.length) * 100 : 0,
        totalStoryPoints,
        completedStoryPoints,
        totalHours,
        averageTaskTime,
        productivity: totalHours > 0 ? completedStoryPoints / totalHours : 0
      };
    }).filter(metric => metric.totalTasks > 0);
  }, [teamMembers, filteredTasks]);

  // Handle export
  const handleExport = useCallback(async (format: 'csv' | 'xlsx' | 'pdf') => {
    if (!onExport) return;
    
    try {
      await onExport(format);
    } catch (error) {
      console.error('Failed to export:', error);
    }
  }, [onExport]);

  // Render metric card
  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, trend?: number, subtitle?: string) => (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              {icon}
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span className="text-sm font-medium">{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Progress Tracker</h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time progress tracking and analytics for enhanced task management
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Timeframe selector */}
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="custom">Custom Range</option>
          </select>

          {enableFilters && (
            <button
              onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Advanced metrics"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {enableExport && (
            <div className="relative">
              <button
                onClick={() => handleExport('xlsx')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 text-sm font-medium ${
            selectedView === 'overview'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedView('overview')}
        >
          Overview
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${
            selectedView === 'trends'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedView('trends')}
        >
          Trends
        </button>
        {showTeamMetrics && (
          <button
            className={`px-6 py-3 text-sm font-medium ${
              selectedView === 'team'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedView('team')}
          >
            Team Performance
          </button>
        )}
        {showBurndown && (
          <button
            className={`px-6 py-3 text-sm font-medium ${
              selectedView === 'burndown'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedView('burndown')}
          >
            Burndown
          </button>
        )}
        {showVelocity && (
          <button
            className={`px-6 py-3 text-sm font-medium ${
              selectedView === 'velocity'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedView('velocity')}
          >
            Velocity
          </button>
        )}
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {renderMetricCard(
              'Total Tasks',
              metrics.totalTasks,
              <Target className="w-6 h-6 text-blue-600" />,
              undefined,
              `${metrics.completedTasks} completed`
            )}
            
            {renderMetricCard(
              'Completion Rate',
              `${metrics.completionRate.toFixed(1)}%`,
              <CheckCircle className="w-6 h-6 text-green-600" />,
              undefined,
              `${metrics.completedTasks}/${metrics.totalTasks} tasks`
            )}
            
            {renderMetricCard(
              'In Progress',
              metrics.inProgressTasks,
              <Activity className="w-6 h-6 text-blue-600" />,
              undefined,
              'Active tasks'
            )}
            
            {renderMetricCard(
              'Blocked Tasks',
              metrics.blockedTasks,
              <AlertTriangle className="w-6 h-6 text-red-600" />,
              undefined,
              metrics.blockedTasks > 0 ? 'Needs attention' : 'All clear'
            )}
          </div>

          {/* Progress Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Donut Chart */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
              <div className="flex items-center justify-center h-64">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#10b981"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${metrics.completionRate * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {metrics.completionRate.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Complete</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="text-lg font-semibold text-green-600">{metrics.completedTasks}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Remaining</div>
                  <div className="text-lg font-semibold text-gray-600">
                    {metrics.totalTasks - metrics.completedTasks}
                  </div>
                </div>
              </div>
            </div>

            {/* Time Metrics */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Estimated Hours</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {metrics.totalEstimatedHours.toFixed(1)}h
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Timer className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Actual Hours</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {metrics.totalActualHours.toFixed(1)}h
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm text-gray-600">Time Tracked</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {metrics.totalTimeTracked.toFixed(1)}h
                  </span>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estimation Accuracy</span>
                    <span className={`text-lg font-semibold ${
                      metrics.estimationAccuracy >= 80 ? 'text-green-600' : 
                      metrics.estimationAccuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {metrics.estimationAccuracy.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Completion Time</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {metrics.averageCompletionTime.toFixed(1)} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Metrics */}
          {showAdvancedMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderMetricCard(
                'Overdue Tasks',
                metrics.overdueTasks,
                <Calendar className="w-6 h-6 text-red-600" />,
                undefined,
                metrics.overdueTasks > 0 ? 'Requires attention' : 'On track'
              )}
              
              {renderMetricCard(
                'Avg Task Duration',
                `${metrics.averageCompletionTime.toFixed(1)} days`,
                <Clock className="w-6 h-6 text-blue-600" />
              )}
              
              {renderMetricCard(
                'Estimation Accuracy',
                `${metrics.estimationAccuracy.toFixed(1)}%`,
                <Target className="w-6 h-6 text-purple-600" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {selectedView === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Creation vs Completion Trends</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Trend chart visualization would be implemented here</p>
                <p className="text-sm mt-2">Integration with chart library (Chart.js, Recharts, etc.)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Performance Tab */}
      {selectedView === 'team' && showTeamMetrics && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Team Performance Metrics</h3>
              <p className="text-sm text-gray-600 mt-1">Individual contributor performance and productivity</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Story Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours Tracked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Task Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Productivity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamMetrics.map((metric, index) => (
                    <tr key={metric.member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                            {metric.member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{metric.member.name}</div>
                            <div className="text-sm text-gray-500">{metric.member.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {metric.completedTasks}/{metric.totalTasks}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${metric.completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900">{metric.completionRate.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.completedStoryPoints}/{metric.totalStoryPoints}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.totalHours.toFixed(1)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.averageTaskTime.toFixed(1)} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          metric.productivity >= 1 ? 'bg-green-100 text-green-800' :
                          metric.productivity >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {metric.productivity.toFixed(2)} pts/hr
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Burndown Tab */}
      {selectedView === 'burndown' && showBurndown && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Burndown Chart</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Burndown chart visualization would be implemented here</p>
                <p className="text-sm mt-2">Shows task completion progress over time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Velocity Tab */}
      {selectedView === 'velocity' && showVelocity && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Velocity</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Velocity chart visualization would be implemented here</p>
                <p className="text-sm mt-2">Shows story points completed per time period</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time indicator */}
      {enableRealtime && (
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time data • Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};