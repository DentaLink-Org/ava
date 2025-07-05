import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  TrendingDown,
  TrendingUp,
  Calendar,
  Target,
  Clock,
  BarChart3,
  LineChart,
  Settings,
  Download,
  Filter,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useTaskAnalytics } from '../../tasks/hooks/useTaskAnalytics';
import { useEnhancedTaskData } from '../../tasks/hooks/useEnhancedTaskData';
import type { 
  TaskAnalytics, 
  Task,
  TaskFilter
} from '../../tasks/types';

interface TaskBurndownChartProps {
  projectId?: string;
  milestoneId?: string;
  sprintId?: string;
  timeframe?: 'sprint' | 'milestone' | 'project' | 'custom';
  showIdealLine?: boolean;
  showVelocityTrend?: boolean;
  showScopeChanges?: boolean;
  enableForecasting?: boolean;
  enableComparison?: boolean;
  chartType?: 'burndown' | 'burnup' | 'both';
  height?: number;
  refreshInterval?: number;
}

interface BurndownDataPoint {
  date: string;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  idealRemaining: number;
  scopeChanges?: number;
  velocity?: number;
  forecast?: number;
}

interface SprintMetrics {
  totalStoryPoints: number;
  completedStoryPoints: number;
  remainingStoryPoints: number;
  velocityTrend: number[];
  averageVelocity: number;
  forecastCompletion: Date | null;
  scopeChangeCount: number;
  burndownRate: number;
}

type ChartMode = 'tasks' | 'story-points' | 'hours';
type ViewMode = 'daily' | 'weekly' | 'sprint-only';

export const TaskBurndownChart: React.FC<TaskBurndownChartProps> = ({
  projectId,
  milestoneId,
  sprintId,
  timeframe = 'sprint',
  showIdealLine = true,
  showVelocityTrend = true,
  showScopeChanges = true,
  enableForecasting = true,
  enableComparison = false,
  chartType = 'burndown',
  height = 500,
  refreshInterval = 60000 // 1 minute
}) => {
  // State management
  const [chartMode, setChartMode] = useState<ChartMode>('tasks');
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [showFilters, setShowFilters] = useState(false);
  const [isRealtime, setIsRealtime] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{
    start: Date;
    end: Date;
  }>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 14); // Default 2 weeks
    return { start, end };
  });

  // Calculate date range based on timeframe
  const dateRange = useMemo(() => {
    return {
      start: selectedTimeRange.start.toISOString(),
      end: selectedTimeRange.end.toISOString()
    };
  }, [selectedTimeRange]);

  // Data hooks
  const {
    analytics,
    loading,
    error,
    refetch
  } = useTaskAnalytics({
    projectId,
    milestoneId,
    dateRange,
    autoRefresh: isRealtime,
    refreshInterval
  });

  const {
    tasks,
    loading: tasksLoading
  } = useEnhancedTaskData({
    projectId,
    milestoneId,
    enableRealtime: isRealtime
  });

  // Process burndown data
  const burndownData = useMemo((): BurndownDataPoint[] => {
    if (!analytics?.burndownData) return [];

    const data: BurndownDataPoint[] = [];
    const totalDays = Math.ceil(
      (selectedTimeRange.end.getTime() - selectedTimeRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );

    analytics.burndownData.forEach((point, index) => {
      const idealRemaining = chartMode === 'tasks' 
        ? Math.max(0, analytics.totalTasks - (analytics.totalTasks / totalDays) * (index + 1))
        : chartMode === 'story-points'
        ? Math.max(0, (analytics.totalTasks * 3) - ((analytics.totalTasks * 3) / totalDays) * (index + 1)) // Assuming avg 3 points per task
        : Math.max(0, (analytics.averageEstimatedHours * analytics.totalTasks) - ((analytics.averageEstimatedHours * analytics.totalTasks) / totalDays) * (index + 1));

      data.push({
        date: point.date,
        totalTasks: point.totalTasks,
        completedTasks: point.completedTasks,
        remainingTasks: point.remainingTasks,
        idealRemaining,
        scopeChanges: 0, // Would be calculated from task history
        velocity: index > 0 ? point.completedTasks - (data[index - 1]?.completedTasks || 0) : point.completedTasks,
        forecast: enableForecasting ? calculateForecast(data, index, totalDays) : undefined
      });
    });

    return data;
  }, [analytics, selectedTimeRange, chartMode, enableForecasting]);

  // Calculate forecast
  const calculateForecast = useCallback((data: BurndownDataPoint[], currentIndex: number, totalDays: number): number => {
    if (currentIndex < 2) return 0;
    
    const recentVelocity = data.slice(Math.max(0, currentIndex - 3), currentIndex + 1)
      .reduce((sum, point) => sum + (point.velocity || 0), 0) / Math.min(4, currentIndex + 1);
    
    const remainingDays = totalDays - currentIndex - 1;
    return Math.max(0, data[currentIndex].remainingTasks - (recentVelocity * remainingDays));
  }, []);

  // Sprint metrics calculation
  const sprintMetrics = useMemo((): SprintMetrics => {
    if (!analytics || !burndownData.length) {
      return {
        totalStoryPoints: 0,
        completedStoryPoints: 0,
        remainingStoryPoints: 0,
        velocityTrend: [],
        averageVelocity: 0,
        forecastCompletion: null,
        scopeChangeCount: 0,
        burndownRate: 0
      };
    }

    const velocityTrend = burndownData.map(point => point.velocity || 0);
    const averageVelocity = velocityTrend.reduce((sum, v) => sum + v, 0) / velocityTrend.length;
    const burndownRate = burndownData.length > 1 
      ? (burndownData[0].remainingTasks - burndownData[burndownData.length - 1].remainingTasks) / burndownData.length
      : 0;

    // Calculate forecast completion date
    const lastPoint = burndownData[burndownData.length - 1];
    let forecastCompletion: Date | null = null;
    
    if (averageVelocity > 0 && lastPoint.remainingTasks > 0) {
      const daysToComplete = Math.ceil(lastPoint.remainingTasks / averageVelocity);
      forecastCompletion = new Date();
      forecastCompletion.setDate(forecastCompletion.getDate() + daysToComplete);
    }

    return {
      totalStoryPoints: analytics.totalTasks * 3, // Mock calculation
      completedStoryPoints: analytics.completedTasks * 3,
      remainingStoryPoints: (analytics.totalTasks - analytics.completedTasks) * 3,
      velocityTrend,
      averageVelocity,
      forecastCompletion,
      scopeChangeCount: 0, // Would be calculated from task history
      burndownRate
    };
  }, [analytics, burndownData]);

  // Chart data for rendering
  const chartData = useMemo(() => {
    if (!burndownData.length) return null;

    const labels = burndownData.map(point => 
      new Date(point.date).toLocaleDateString('en', { 
        month: 'short', 
        day: 'numeric' 
      })
    );

    const datasets = [];

    // Actual burndown line
    datasets.push({
      label: 'Actual Remaining',
      data: burndownData.map(point => {
        switch (chartMode) {
          case 'story-points':
            return point.remainingTasks * 3; // Mock conversion
          case 'hours':
            return point.remainingTasks * 8; // Mock conversion
          default:
            return point.remainingTasks;
        }
      }),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 3,
      fill: chartType === 'burndown',
      tension: 0.1
    });

    // Ideal burndown line
    if (showIdealLine) {
      datasets.push({
        label: 'Ideal Remaining',
        data: burndownData.map(point => {
          switch (chartMode) {
            case 'story-points':
              return point.idealRemaining * 3;
            case 'hours':
              return point.idealRemaining * 8;
            default:
              return point.idealRemaining;
          }
        }),
        borderColor: '#64748b',
        backgroundColor: 'rgba(100, 116, 139, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false
      });
    }

    // Burnup chart (completed work)
    if (chartType === 'burnup' || chartType === 'both') {
      datasets.push({
        label: 'Completed Work',
        data: burndownData.map(point => {
          switch (chartMode) {
            case 'story-points':
              return point.completedTasks * 3;
            case 'hours':
              return point.completedTasks * 8;
            default:
              return point.completedTasks;
          }
        }),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: chartType === 'burnup'
      });
    }

    // Forecast line
    if (enableForecasting) {
      datasets.push({
        label: 'Forecast',
        data: burndownData.map(point => point.forecast || null),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        borderDash: [3, 3],
        fill: false
      });
    }

    return { labels, datasets };
  }, [burndownData, chartMode, chartType, showIdealLine, enableForecasting]);

  // Handle mode changes
  const handleChartModeChange = useCallback((mode: ChartMode) => {
    setChartMode(mode);
  }, []);

  const handleTimeRangeChange = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setSelectedTimeRange({ start, end });
  }, []);

  // Get trend indicator
  const getTrendIndicator = useCallback((current: number, previous: number) => {
    if (current > previous) {
      return <ArrowUp className="w-3 h-3 text-red-500" />;
    } else if (current < previous) {
      return <ArrowDown className="w-3 h-3 text-green-500" />;
    }
    return <Minus className="w-3 h-3 text-gray-500" />;
  }, []);

  // Loading state
  if (loading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading burndown data...</p>
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
          <p className="text-red-700">Failed to load burndown data</p>
          <p className="text-red-600 text-sm">{error.message}</p>
          <button
            onClick={refetch}
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
      {/* Chart Header */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              {chartType === 'burndown' ? 'Burndown' : chartType === 'burnup' ? 'Burnup' : 'Burn'} Chart
            </h3>
            <span className="text-sm text-gray-500">
              ({timeframe === 'sprint' ? 'Sprint' : timeframe === 'milestone' ? 'Milestone' : 'Project'})
            </span>
            {isRealtime && (
              <div className="flex items-center text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Live
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Chart Type Selector */}
            <div className="flex bg-white border rounded-md">
              {(['burndown', 'burnup', 'both'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    // In a real implementation, this would update the prop
                    console.log('Chart type changed:', type);
                  }}
                  className={`px-3 py-1.5 text-sm font-medium capitalize ${
                    chartType === type
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Data Mode Selector */}
            <div className="flex bg-white border rounded-md">
              {(['tasks', 'story-points', 'hours'] as ChartMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleChartModeChange(mode)}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    chartMode === mode
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {mode === 'story-points' ? 'Points' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Time Range Selector */}
            <select
              onChange={(e) => handleTimeRangeChange(Number(e.target.value))}
              className="px-3 py-1.5 border rounded-md text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
            </select>

            {/* Real-time Toggle */}
            <button
              onClick={() => setIsRealtime(!isRealtime)}
              className={`p-2 rounded-md ${
                isRealtime ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}
              title={isRealtime ? 'Disable Real-time' : 'Enable Real-time'}
            >
              {isRealtime ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-md ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title="Chart Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Refresh */}
            <button
              onClick={refetch}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Chart Options */}
        <div className="flex items-center space-x-4 mt-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showIdealLine}
              onChange={(e) => {
                // In a real implementation, this would update the prop
                console.log('Show ideal line:', e.target.checked);
              }}
              className="rounded border-gray-300 text-blue-600 mr-2"
            />
            <span className="text-sm text-gray-700">Ideal Line</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showVelocityTrend}
              onChange={(e) => {
                // In a real implementation, this would update the prop
                console.log('Show velocity trend:', e.target.checked);
              }}
              className="rounded border-gray-300 text-blue-600 mr-2"
            />
            <span className="text-sm text-gray-700">Velocity Trend</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enableForecasting}
              onChange={(e) => {
                // In a real implementation, this would update the prop
                console.log('Enable forecasting:', e.target.checked);
              }}
              className="rounded border-gray-300 text-blue-600 mr-2"
            />
            <span className="text-sm text-gray-700">Forecasting</span>
          </label>

          {showScopeChanges && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showScopeChanges}
                onChange={(e) => {
                  // In a real implementation, this would update the prop
                  console.log('Show scope changes:', e.target.checked);
                }}
                className="rounded border-gray-300 text-blue-600 mr-2"
              />
              <span className="text-sm text-gray-700">Scope Changes</span>
            </label>
          )}
        </div>
      </div>

      {/* Sprint Metrics */}
      <div className="border-b bg-gray-50 p-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {chartMode === 'tasks' ? sprintMetrics.remainingStoryPoints / 3 : 
               chartMode === 'story-points' ? sprintMetrics.remainingStoryPoints :
               sprintMetrics.remainingStoryPoints * 8}
            </div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {chartMode === 'tasks' ? sprintMetrics.completedStoryPoints / 3 : 
               chartMode === 'story-points' ? sprintMetrics.completedStoryPoints :
               sprintMetrics.completedStoryPoints * 8}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {sprintMetrics.averageVelocity.toFixed(1)}
              </span>
              {sprintMetrics.velocityTrend.length > 1 && 
                getTrendIndicator(
                  sprintMetrics.velocityTrend[sprintMetrics.velocityTrend.length - 1],
                  sprintMetrics.velocityTrend[sprintMetrics.velocityTrend.length - 2]
                )
              }
            </div>
            <div className="text-sm text-gray-600">Avg Velocity</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((sprintMetrics.completedStoryPoints / sprintMetrics.totalStoryPoints) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {sprintMetrics.burndownRate.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Burn Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900">
              {sprintMetrics.forecastCompletion 
                ? sprintMetrics.forecastCompletion.toLocaleDateString()
                : 'N/A'
              }
            </div>
            <div className="text-sm text-gray-600">Forecast</div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-4">
        <div 
          className="w-full flex items-center justify-center bg-gray-50 rounded-lg"
          style={{ height: height - 200 }}
        >
          <div className="text-center text-gray-500">
            <LineChart className="w-12 h-12 mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">
              {chartType === 'burndown' ? 'Burndown' : chartType === 'burnup' ? 'Burnup' : 'Burn'} Chart
            </h4>
            <p className="text-sm mb-2">
              Tracking {chartMode} over time for {timeframe}
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                <span>Actual</span>
              </div>
              {showIdealLine && (
                <div className="flex items-center">
                  <div className="w-3 h-1 bg-gray-500 mr-1" style={{ borderTop: '2px dashed #64748b' }}></div>
                  <span>Ideal</span>
                </div>
              )}
              {(chartType === 'burnup' || chartType === 'both') && (
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                  <span>Completed</span>
                </div>
              )}
              {enableForecasting && (
                <div className="flex items-center">
                  <div className="w-3 h-1 bg-yellow-500 mr-1" style={{ borderTop: '2px dashed #f59e0b' }}></div>
                  <span>Forecast</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Interactive chart would be rendered here with Chart.js or similar library
            </p>
          </div>
        </div>
      </div>

      {/* Chart Footer */}
      <div className="border-t bg-gray-50 p-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>
              {burndownData.length} data points
            </span>
            <span>•</span>
            <span>
              Updated: {new Date().toLocaleTimeString()}
            </span>
            {sprintMetrics.scopeChangeCount > 0 && (
              <>
                <span>•</span>
                <span className="text-orange-600">
                  {sprintMetrics.scopeChangeCount} scope changes
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>
              {selectedTimeRange.start.toLocaleDateString()} - {selectedTimeRange.end.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskBurndownChart;