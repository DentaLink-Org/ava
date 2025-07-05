import React, { useState, useCallback, useMemo } from 'react';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  Settings,
  RefreshCw,
  Eye,
  PieChart,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus
} from 'lucide-react';
import { useTaskAnalytics } from '../../tasks/hooks/useTaskAnalytics';
import { useEnhancedTaskData } from '../../tasks/hooks/useEnhancedTaskData';
import type { 
  TaskAnalytics, 
  TaskFilter, 
  Task,
  TaskPriority,
  TaskComplexity,
  TaskEffort,
  TaskRisk
} from '../../tasks/types';

interface TaskAnalyticsDashboardProps {
  projectId?: string;
  milestoneId?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  enableFilters?: boolean;
  enableExport?: boolean;
  enableRealtime?: boolean;
  showComparisonMetrics?: boolean;
  customDateRange?: {
    start: string;
    end: string;
  };
  height?: number;
}

interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  previousValue?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'percentage' | 'duration' | 'currency';
  icon: React.ReactNode;
  color: string;
  description?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

type DashboardView = 'overview' | 'performance' | 'team' | 'trends' | 'custom';

export const TaskAnalyticsDashboard: React.FC<TaskAnalyticsDashboardProps> = ({
  projectId,
  milestoneId,
  timeRange = 'month',
  enableFilters = true,
  enableExport = true,
  enableRealtime = true,
  showComparisonMetrics = true,
  customDateRange,
  height = 800
}) => {
  // State management
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'total-tasks',
    'completion-rate',
    'avg-completion-time',
    'team-performance'
  ]);
  const [customFilters, setCustomFilters] = useState<TaskFilter>({});
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  const [isAutoRefresh, setIsAutoRefresh] = useState(enableRealtime);

  // Calculate date range
  const dateRange = useMemo(() => {
    if (customDateRange) {
      return customDateRange;
    }

    const end = new Date();
    const start = new Date();

    switch (timeRange) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
    }

    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }, [timeRange, customDateRange]);

  // Data hooks
  const {
    analytics,
    loading,
    error,
    refetch,
    exportData
  } = useTaskAnalytics({
    projectId,
    milestoneId,
    dateRange,
    autoRefresh: isAutoRefresh,
    refreshInterval
  });

  const {
    tasks,
    filter,
    setFilter
  } = useEnhancedTaskData({
    projectId,
    milestoneId,
    enableRealtime: enableRealtime
  });

  // Calculate metric cards
  const metricCards = useMemo((): MetricCard[] => {
    if (!analytics) return [];

    const cards: MetricCard[] = [
      {
        id: 'total-tasks',
        title: 'Total Tasks',
        value: analytics.totalTasks,
        previousValue: analytics.totalTasks - analytics.tasksCreatedThisWeek,
        change: analytics.tasksCreatedThisWeek,
        changeType: analytics.tasksCreatedThisWeek > 0 ? 'increase' : 'neutral',
        format: 'number',
        icon: <Target className="w-5 h-5" />,
        color: '#3b82f6',
        description: 'Total number of tasks in the system'
      },
      {
        id: 'completion-rate',
        title: 'Completion Rate',
        value: analytics.completionRate,
        previousValue: Math.max(0, analytics.completionRate - 5), // Mock previous value
        change: 5, // Mock change
        changeType: 'increase',
        format: 'percentage',
        icon: <CheckCircle className="w-5 h-5" />,
        color: '#10b981',
        description: 'Percentage of completed tasks'
      },
      {
        id: 'avg-completion-time',
        title: 'Avg Completion Time',
        value: analytics.averageCompletionTime,
        previousValue: analytics.averageCompletionTime + 0.5,
        change: -0.5,
        changeType: 'decrease',
        format: 'duration',
        icon: <Clock className="w-5 h-5" />,
        color: '#f59e0b',
        description: 'Average time to complete tasks'
      },
      {
        id: 'team-performance',
        title: 'Team Performance',
        value: analytics.teamPerformance?.length || 0,
        previousValue: (analytics.teamPerformance?.length || 0) - 1,
        change: 1,
        changeType: 'increase',
        format: 'number',
        icon: <Users className="w-5 h-5" />,
        color: '#8b5cf6',
        description: 'Number of active team members'
      },
      {
        id: 'overdue-tasks',
        title: 'Overdue Tasks',
        value: analytics.overdueTasks,
        previousValue: analytics.overdueTasks + 2,
        change: -2,
        changeType: 'decrease',
        format: 'number',
        icon: <AlertTriangle className="w-5 h-5" />,
        color: '#ef4444',
        description: 'Tasks past their due date'
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        value: analytics.inProgressTasks,
        previousValue: analytics.inProgressTasks - 3,
        change: 3,
        changeType: 'increase',
        format: 'number',
        icon: <Activity className="w-5 h-5" />,
        color: '#06b6d4',
        description: 'Tasks currently being worked on'
      },
      {
        id: 'estimation-accuracy',
        title: 'Estimation Accuracy',
        value: analytics.estimationAccuracy,
        previousValue: analytics.estimationAccuracy - 10,
        change: 10,
        changeType: 'increase',
        format: 'percentage',
        icon: <Zap className="w-5 h-5" />,
        color: '#84cc16',
        description: 'Accuracy of time estimations'
      },
      {
        id: 'blocked-tasks',
        title: 'Blocked Tasks',
        value: analytics.blockedTasks,
        previousValue: analytics.blockedTasks + 1,
        change: -1,
        changeType: 'decrease',
        format: 'number',
        icon: <Minus className="w-5 h-5" />,
        color: '#f97316',
        description: 'Tasks that are currently blocked'
      }
    ];

    return cards.filter(card => selectedMetrics.includes(card.id));
  }, [analytics, selectedMetrics]);

  // Format values for display
  const formatValue = useCallback((value: number | string, format: MetricCard['format']) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return `${Math.round(value)}%`;
      case 'duration':
        return `${value.toFixed(1)} days`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  }, []);

  // Format change indicator
  const formatChange = useCallback((change: number, format: MetricCard['format']) => {
    const prefix = change > 0 ? '+' : '';
    switch (format) {
      case 'percentage':
        return `${prefix}${change}%`;
      case 'duration':
        return `${prefix}${change.toFixed(1)}d`;
      case 'currency':
        return `${prefix}$${Math.abs(change).toLocaleString()}`;
      case 'number':
      default:
        return `${prefix}${change}`;
    }
  }, []);

  // Get change icon
  const getChangeIcon = useCallback((changeType: MetricCard['changeType']) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpRight className="w-3 h-3 text-green-500" />;
      case 'decrease':
        return <ArrowDownRight className="w-3 h-3 text-red-500" />;
      case 'neutral':
      default:
        return <Minus className="w-3 h-3 text-gray-500" />;
    }
  }, []);

  // Chart data calculations
  const chartData = useMemo(() => {
    if (!analytics) return null;

    const burndownData: ChartData = {
      labels: analytics.burndownData?.map(d => 
        new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
      ) || [],
      datasets: [
        {
          label: 'Remaining Tasks',
          data: analytics.burndownData?.map(d => d.remainingTasks) || [],
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f620',
          borderWidth: 2
        },
        {
          label: 'Completed Tasks',
          data: analytics.burndownData?.map(d => d.completedTasks) || [],
          borderColor: '#10b981',
          backgroundColor: '#10b98120',
          borderWidth: 2
        }
      ]
    };

    const velocityData: ChartData = {
      labels: analytics.velocityData?.map(d => d.period) || [],
      datasets: [
        {
          label: 'Story Points',
          data: analytics.velocityData?.map(d => d.storyPointsCompleted) || [],
          backgroundColor: '#8b5cf6',
          borderColor: '#8b5cf6',
          borderWidth: 1
        },
        {
          label: 'Tasks Completed',
          data: analytics.velocityData?.map(d => d.tasksCompleted) || [],
          backgroundColor: '#06b6d4',
          borderColor: '#06b6d4',
          borderWidth: 1
        }
      ]
    };

    const priorityDistribution = analytics.priorityDistribution || {};
    const priorityData: ChartData = {
      labels: Object.keys(priorityDistribution),
      datasets: [
        {
          label: 'Priority Distribution',
          data: Object.values(priorityDistribution),
          backgroundColor: [
            '#ef4444', // urgent
            '#f59e0b', // high
            '#10b981', // medium
            '#6b7280'  // low
          ]
        }
      ]
    };

    return {
      burndown: burndownData,
      velocity: velocityData,
      priority: priorityData
    };
  }, [analytics]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<TaskFilter>) => {
    setCustomFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Handle export
  const handleExport = useCallback(async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      await exportData(format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [exportData]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Loading state
  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">Failed to load analytics</p>
          <p className="text-red-600 text-sm">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm" style={{ height }}>
      {/* Dashboard Header */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Task Analytics Dashboard</h3>
            {loading && (
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Selector */}
            <div className="flex bg-white border rounded-md">
              {(['overview', 'performance', 'team', 'trends'] as DashboardView[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-3 py-1.5 text-sm font-medium capitalize ${
                    currentView === view
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => {
                // Note: In a real implementation, this would trigger a prop change
                console.log('Time range changed:', e.target.value);
              }}
              className="px-3 py-1.5 border rounded-md text-sm"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>

            {/* Auto Refresh Toggle */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAutoRefresh}
                onChange={(e) => setIsAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 mr-2"
              />
              <span className="text-sm text-gray-700">Auto-refresh</span>
            </label>

            {/* Filter Toggle */}
            {enableFilters && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-md ${
                  showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
                title="Toggle Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
            )}

            {/* Export Menu */}
            {enableExport && (
              <div className="relative">
                <button
                  onClick={() => handleExport('csv')}
                  className="p-2 hover:bg-gray-100 rounded-md"
                  title="Export Data"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Settings */}
            <button
              className="p-2 hover:bg-gray-100 rounded-md"
              title="Dashboard Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Selection */}
        <div className="flex items-center space-x-2 mt-3">
          <span className="text-sm text-gray-600">Show metrics:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'total-tasks', label: 'Total Tasks' },
              { id: 'completion-rate', label: 'Completion Rate' },
              { id: 'avg-completion-time', label: 'Avg Time' },
              { id: 'team-performance', label: 'Team' },
              { id: 'overdue-tasks', label: 'Overdue' },
              { id: 'in-progress', label: 'In Progress' },
              { id: 'estimation-accuracy', label: 'Accuracy' },
              { id: 'blocked-tasks', label: 'Blocked' }
            ].map((metric) => (
              <label key={metric.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(metric.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMetrics(prev => [...prev, metric.id]);
                    } else {
                      setSelectedMetrics(prev => prev.filter(id => id !== metric.id));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 mr-1"
                />
                <span className="text-xs text-gray-700">{metric.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-b bg-gray-50 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={customFilters.priority || ''}
                onChange={(e) => handleFilterChange({ priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-1.5 border rounded-md text-sm"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <select
                value={customFilters.assigneeId || ''}
                onChange={(e) => handleFilterChange({ assigneeId: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-md text-sm"
              >
                <option value="">All Assignees</option>
                {/* Add assignee options from analytics data */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complexity
              </label>
              <select
                value={customFilters.complexity || ''}
                onChange={(e) => handleFilterChange({ complexity: e.target.value as TaskComplexity })}
                className="w-full px-3 py-1.5 border rounded-md text-sm"
              >
                <option value="">All Complexities</option>
                <option value="simple">Simple</option>
                <option value="moderate">Moderate</option>
                <option value="complex">Complex</option>
                <option value="very_complex">Very Complex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={typeof customFilters.status === 'string' ? customFilters.status : ''}
                onChange={(e) => handleFilterChange({ status: e.target.value as any })}
                className="w-full px-3 py-1.5 border rounded-md text-sm"
              >
                <option value="">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {metricCards.map((card) => (
            <div
              key={card.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: card.color + '20', color: card.color }}
                >
                  {card.icon}
                </div>
                {showComparisonMetrics && card.change !== undefined && (
                  <div className="flex items-center text-xs">
                    {getChangeIcon(card.changeType)}
                    <span className={`ml-1 ${
                      card.changeType === 'increase' ? 'text-green-600' :
                      card.changeType === 'decrease' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {formatChange(card.change, card.format)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mb-1">
                <div className="text-2xl font-bold text-gray-900">
                  {formatValue(card.value, card.format)}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {card.title}
                </div>
              </div>
              
              {card.description && (
                <div className="text-xs text-gray-500">
                  {card.description}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Burndown Chart */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Task Burndown</h4>
              <TrendingDown className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Burndown Chart</p>
                <p className="text-xs">Interactive chart would be rendered here</p>
              </div>
            </div>
          </div>

          {/* Velocity Chart */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Team Velocity</h4>
              <TrendingUp className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Velocity Chart</p>
                <p className="text-xs">Interactive chart would be rendered here</p>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Priority Distribution</h4>
              <PieChart className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <PieChart className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Priority Distribution</p>
                <p className="text-xs">Pie chart would be rendered here</p>
              </div>
            </div>
          </div>

          {/* Team Performance */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Team Performance</h4>
              <Users className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="space-y-3">
              {analytics?.teamPerformance?.slice(0, 5).map((member, index) => (
                <div key={member.assigneeId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                      {member.assigneeId.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {member.assigneeId}
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.totalTasks} tasks
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {Math.round(member.completionRate)}%
                    </div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${member.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-8">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No team performance data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Footer */}
      <div className="border-t bg-gray-50 p-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Last updated: {new Date().toLocaleString()}</span>
            {analytics && (
              <>
                <span>•</span>
                <span>Data range: {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>
              {analytics ? `${analytics.totalTasks} total tasks analyzed` : 'No data'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAnalyticsDashboard;