import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Calendar,
  Clock,
  Target,
  Users,
  Zap,
  Settings,
  RefreshCw,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  LineChart,
  PieChart,
  Calculator,
  Gauge
} from 'lucide-react';
import { useTaskAnalytics } from '../../tasks/hooks/useTaskAnalytics';
import { useEnhancedTaskData } from '../../tasks/hooks/useEnhancedTaskData';
import type { 
  TaskAnalytics, 
  Task,
  TaskFilter
} from '../../tasks/types';

interface TaskVelocityTrackerProps {
  projectId?: string;
  milestoneId?: string;
  sprintId?: string;
  timeframe?: 'sprint' | 'monthly' | 'quarterly' | 'custom';
  teamId?: string;
  assigneeId?: string;
  enableForecasting?: boolean;
  enableComparison?: boolean;
  enableIndividualTracking?: boolean;
  showCapacityPlanning?: boolean;
  height?: number;
  refreshInterval?: number;
}

interface VelocityMetrics {
  currentVelocity: number;
  averageVelocity: number;
  velocityTrend: number[];
  velocityChange: number;
  forecastCompletion: Date | null;
  confidenceLevel: number;
  capacityUtilization: number;
  burnRate: number;
  predictedVelocity: number;
}

interface TeamMemberVelocity {
  assigneeId: string;
  currentVelocity: number;
  averageVelocity: number;
  completedTasks: number;
  completedStoryPoints: number;
  velocityTrend: number[];
  capacityUtilization: number;
  efficiency: number;
  consistencyScore: number;
}

interface VelocityPrediction {
  period: string;
  predictedStoryPoints: number;
  confidenceLevel: number;
  factors: {
    historical: number;
    trend: number;
    capacity: number;
    seasonality: number;
  };
}

type VelocityViewMode = 'team' | 'individual' | 'comparison' | 'forecasting';
type VelocityMetric = 'story-points' | 'tasks' | 'hours';
type TimeGranularity = 'daily' | 'weekly' | 'sprint';

export const TaskVelocityTracker: React.FC<TaskVelocityTrackerProps> = ({
  projectId,
  milestoneId,
  sprintId,
  timeframe = 'sprint',
  teamId,
  assigneeId,
  enableForecasting = true,
  enableComparison = true,
  enableIndividualTracking = true,
  showCapacityPlanning = true,
  height = 600,
  refreshInterval = 30000 // 30 seconds
}) => {
  // State management
  const [viewMode, setViewMode] = useState<VelocityViewMode>('team');
  const [velocityMetric, setVelocityMetric] = useState<VelocityMetric>('story-points');
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>('weekly');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isRealtime, setIsRealtime] = useState(true);
  const [forecastPeriods, setForecastPeriods] = useState(6); // 6 periods ahead
  
  // Calculate date range based on timeframe
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    switch (timeframe) {
      case 'sprint':
        start.setDate(start.getDate() - 14); // 2 weeks
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 3); // 3 months
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() - 12); // 12 months
        break;
      default:
        start.setMonth(start.getMonth() - 3);
    }
    
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }, [timeframe]);

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

  // Calculate velocity metrics
  const velocityMetrics = useMemo((): VelocityMetrics => {
    if (!analytics?.velocityData?.length) {
      return {
        currentVelocity: 0,
        averageVelocity: 0,
        velocityTrend: [],
        velocityChange: 0,
        forecastCompletion: null,
        confidenceLevel: 0,
        capacityUtilization: 0,
        burnRate: 0,
        predictedVelocity: 0
      };
    }

    const velocityData = analytics.velocityData;
    const currentVelocity = velocityData[velocityData.length - 1]?.storyPointsCompleted || 0;
    const averageVelocity = velocityData.reduce((sum, v) => sum + v.storyPointsCompleted, 0) / velocityData.length;
    const velocityTrend = velocityData.map(v => v.storyPointsCompleted);
    
    // Calculate velocity change (last period vs average)
    const velocityChange = averageVelocity > 0 ? ((currentVelocity - averageVelocity) / averageVelocity) * 100 : 0;
    
    // Calculate trend-based prediction
    const recentVelocities = velocityTrend.slice(-3);
    const trendSlope = recentVelocities.length > 1 
      ? (recentVelocities[recentVelocities.length - 1] - recentVelocities[0]) / (recentVelocities.length - 1)
      : 0;
    const predictedVelocity = Math.max(0, currentVelocity + trendSlope);
    
    // Calculate confidence level (based on velocity consistency)
    const velocityVariance = velocityTrend.reduce((sum, v) => sum + Math.pow(v - averageVelocity, 2), 0) / velocityTrend.length;
    const velocityStdDev = Math.sqrt(velocityVariance);
    const confidenceLevel = Math.max(0, Math.min(100, 100 - (velocityStdDev / averageVelocity) * 100));
    
    // Mock calculations for other metrics
    const capacityUtilization = Math.min(100, (currentVelocity / (averageVelocity * 1.2)) * 100);
    const burnRate = analytics.averageCompletionTime > 0 ? currentVelocity / analytics.averageCompletionTime : 0;
    
    // Forecast completion (rough calculation)
    let forecastCompletion: Date | null = null;
    if (analytics.totalTasks > analytics.completedTasks && averageVelocity > 0) {
      const remainingTasks = analytics.totalTasks - analytics.completedTasks;
      const estimatedWeeks = remainingTasks / (averageVelocity / 3); // Assuming 3 points per task
      forecastCompletion = new Date();
      forecastCompletion.setDate(forecastCompletion.getDate() + estimatedWeeks * 7);
    }

    return {
      currentVelocity,
      averageVelocity,
      velocityTrend,
      velocityChange,
      forecastCompletion,
      confidenceLevel,
      capacityUtilization,
      burnRate,
      predictedVelocity
    };
  }, [analytics]);

  // Calculate individual team member velocities
  const teamVelocities = useMemo((): TeamMemberVelocity[] => {
    if (!analytics?.teamPerformance || !enableIndividualTracking) return [];

    return analytics.teamPerformance.map(member => {
      // Mock calculations - in real implementation, would use detailed time-series data
      const velocityTrend = Array.from({ length: 6 }, (_, i) => 
        Math.max(0, member.completedTasks * 2 + (Math.random() - 0.5) * 5)
      );
      
      const currentVelocity = velocityTrend[velocityTrend.length - 1];
      const averageVelocity = velocityTrend.reduce((sum, v) => sum + v, 0) / velocityTrend.length;
      
      // Calculate consistency score (inverse of coefficient of variation)
      const variance = velocityTrend.reduce((sum, v) => sum + Math.pow(v - averageVelocity, 2), 0) / velocityTrend.length;
      const stdDev = Math.sqrt(variance);
      const consistencyScore = averageVelocity > 0 ? Math.max(0, 100 - (stdDev / averageVelocity) * 100) : 0;
      
      return {
        assigneeId: member.assigneeId,
        currentVelocity,
        averageVelocity,
        completedTasks: member.completedTasks,
        completedStoryPoints: member.completedTasks * 3, // Mock conversion
        velocityTrend,
        capacityUtilization: Math.min(100, member.completionRate),
        efficiency: member.completionRate,
        consistencyScore
      };
    });
  }, [analytics?.teamPerformance, enableIndividualTracking]);

  // Generate velocity predictions
  const velocityPredictions = useMemo((): VelocityPrediction[] => {
    if (!enableForecasting || !velocityMetrics.velocityTrend.length) return [];

    const predictions: VelocityPrediction[] = [];
    const baseVelocity = velocityMetrics.averageVelocity;
    const trend = velocityMetrics.velocityChange / 100;
    
    for (let i = 1; i <= forecastPeriods; i++) {
      const period = new Date();
      period.setDate(period.getDate() + i * 7); // Weekly periods
      
      const historicalWeight = 0.4;
      const trendWeight = 0.3;
      const capacityWeight = 0.2;
      const seasonalityWeight = 0.1;
      
      const predictedStoryPoints = Math.max(0, 
        baseVelocity * (1 + trend * i * 0.1) * 
        (1 + Math.sin(i * Math.PI / 12) * 0.1) // Seasonal variation
      );
      
      const confidenceLevel = Math.max(30, velocityMetrics.confidenceLevel - i * 5);
      
      predictions.push({
        period: period.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        predictedStoryPoints,
        confidenceLevel,
        factors: {
          historical: historicalWeight,
          trend: trendWeight,
          capacity: capacityWeight,
          seasonality: seasonalityWeight
        }
      });
    }
    
    return predictions;
  }, [enableForecasting, velocityMetrics, forecastPeriods]);

  // Handle view mode changes
  const handleViewModeChange = useCallback((mode: VelocityViewMode) => {
    setViewMode(mode);
  }, []);

  const handleMetricChange = useCallback((metric: VelocityMetric) => {
    setVelocityMetric(metric);
  }, []);

  // Get trend indicator
  const getTrendIndicator = useCallback((change: number) => {
    if (Math.abs(change) < 1) {
      return <Minus className="w-3 h-3 text-gray-500" />;
    } else if (change > 0) {
      return <ArrowUp className="w-3 h-3 text-green-500" />;
    } else {
      return <ArrowDown className="w-3 h-3 text-red-500" />;
    }
  }, []);

  // Format velocity value
  const formatVelocity = useCallback((value: number) => {
    switch (velocityMetric) {
      case 'story-points':
        return `${value.toFixed(1)} pts`;
      case 'tasks':
        return `${Math.round(value)} tasks`;
      case 'hours':
        return `${value.toFixed(1)}h`;
      default:
        return value.toString();
    }
  }, [velocityMetric]);

  // Loading state
  if (loading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading velocity data...</p>
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
          <p className="text-red-700">Failed to load velocity data</p>
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
      {/* Header */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Team Velocity Tracker</h3>
            <span className="text-sm text-gray-500">
              ({timeframe === 'sprint' ? 'Sprint' : timeframe})
            </span>
            {isRealtime && (
              <div className="flex items-center text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Live
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Selector */}
            <div className="flex bg-white border rounded-md">
              {(['team', 'individual', 'comparison', 'forecasting'] as VelocityViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleViewModeChange(mode)}
                  className={`px-3 py-1.5 text-sm font-medium capitalize ${
                    viewMode === mode
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Metric Selector */}
            <div className="flex bg-white border rounded-md">
              {(['story-points', 'tasks', 'hours'] as VelocityMetric[]).map((metric) => (
                <button
                  key={metric}
                  onClick={() => handleMetricChange(metric)}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    velocityMetric === metric
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {metric === 'story-points' ? 'Points' : metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>

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
      </div>

      {/* Velocity Metrics */}
      <div className="border-b bg-gray-50 p-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {formatVelocity(velocityMetrics.currentVelocity)}
              </span>
              {getTrendIndicator(velocityMetrics.velocityChange)}
            </div>
            <div className="text-sm text-gray-600">Current Velocity</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatVelocity(velocityMetrics.averageVelocity)}
            </div>
            <div className="text-sm text-gray-600">Average Velocity</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {velocityMetrics.velocityChange > 0 ? '+' : ''}{velocityMetrics.velocityChange.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Trend</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(velocityMetrics.capacityUtilization)}%
            </div>
            <div className="text-sm text-gray-600">Capacity</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600">
              {Math.round(velocityMetrics.confidenceLevel)}%
            </div>
            <div className="text-sm text-gray-600">Confidence</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900">
              {velocityMetrics.forecastCompletion 
                ? velocityMetrics.forecastCompletion.toLocaleDateString()
                : 'N/A'
              }
            </div>
            <div className="text-sm text-gray-600">ETC</div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'team' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Velocity Chart */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Velocity Trend</h4>
                <TrendingUp className="w-5 h-5 text-gray-500" />
              </div>
              
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <LineChart className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Velocity Trend Chart</p>
                  <p className="text-xs">Interactive chart would be rendered here</p>
                </div>
              </div>
            </div>

            {/* Capacity Utilization */}
            {showCapacityPlanning && (
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Capacity Utilization</h4>
                  <Gauge className="w-5 h-5 text-gray-500" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Sprint</span>
                    <span className="text-sm font-medium">{Math.round(velocityMetrics.capacityUtilization)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${Math.min(100, velocityMetrics.capacityUtilization)}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Planned Capacity</div>
                      <div className="font-medium">{formatVelocity(velocityMetrics.averageVelocity * 1.2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Actual Output</div>
                      <div className="font-medium">{formatVelocity(velocityMetrics.currentVelocity)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'individual' && enableIndividualTracking && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Individual Team Member Velocity</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamVelocities.map((member) => (
                <div key={member.assigneeId} className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {member.assigneeId.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.assigneeId}
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.completedTasks} tasks completed
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Velocity</span>
                      <span className="font-medium">{formatVelocity(member.currentVelocity)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Average Velocity</span>
                      <span className="font-medium">{formatVelocity(member.averageVelocity)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Consistency</span>
                      <span className="font-medium">{Math.round(member.consistencyScore)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacity</span>
                      <span className="font-medium">{Math.round(member.capacityUtilization)}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, member.capacityUtilization)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'forecasting' && enableForecasting && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">Velocity Forecasting</h4>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Forecast periods:</span>
                <select
                  value={forecastPeriods}
                  onChange={(e) => setForecastPeriods(Number(e.target.value))}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value={3}>3 periods</option>
                  <option value={6}>6 periods</option>
                  <option value={9}>9 periods</option>
                  <option value={12}>12 periods</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Forecast Chart */}
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-md font-semibold text-gray-900">Predicted Velocity</h5>
                  <Calculator className="w-5 h-5 text-gray-500" />
                </div>
                
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <LineChart className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Velocity Forecast Chart</p>
                    <p className="text-xs">Predictive chart would be rendered here</p>
                  </div>
                </div>
              </div>

              {/* Forecast Data */}
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-md font-semibold text-gray-900">Forecast Details</h5>
                  <Target className="w-5 h-5 text-gray-500" />
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {velocityPredictions.map((prediction, index) => (
                    <div key={prediction.period} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="text-sm font-medium">{prediction.period}</div>
                        <div className="text-xs text-gray-500">
                          {Math.round(prediction.confidenceLevel)}% confidence
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatVelocity(prediction.predictedStoryPoints)}
                        </div>
                        <div className={`text-xs ${
                          prediction.confidenceLevel > 70 ? 'text-green-600' :
                          prediction.confidenceLevel > 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {prediction.confidenceLevel > 70 ? 'High' :
                           prediction.confidenceLevel > 50 ? 'Medium' : 'Low'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'comparison' && enableComparison && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900">Velocity Comparison</h4>
            
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-md font-semibold text-gray-900">Sprint Comparison</h5>
                <BarChart3 className="w-5 h-5 text-gray-500" />
              </div>
              
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Sprint Comparison Chart</p>
                  <p className="text-xs">Comparative chart would be rendered here</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 p-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Updated: {new Date().toLocaleTimeString()}</span>
            <span>•</span>
            <span>Tracking {teamVelocities.length} team members</span>
            {velocityMetrics.confidenceLevel > 0 && (
              <>
                <span>•</span>
                <span className={`${
                  velocityMetrics.confidenceLevel > 70 ? 'text-green-600' :
                  velocityMetrics.confidenceLevel > 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(velocityMetrics.confidenceLevel)}% confidence
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Velocity: {formatVelocity(velocityMetrics.currentVelocity)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskVelocityTracker;