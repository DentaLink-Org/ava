import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  TaskAnalytics, 
  TaskFilter, 
  TasksError 
} from '../types';
import { taskAnalytics } from '../api/task-analytics';

/**
 * Task Analytics Hook Configuration
 */
interface UseTaskAnalyticsOptions {
  projectId?: string;
  milestoneId?: string;
  teamMemberIds?: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealtime?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;
  dateRange?: {
    start: string;
    end: string;
  };
  enableTrendAnalysis?: boolean;
  enableForecasting?: boolean;
  enableInsights?: boolean;
}

/**
 * Date Range Preset Options
 */
type DateRangePreset = 'last7days' | 'last30days' | 'last90days' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'lastQuarter' | 'thisYear' | 'custom';

/**
 * Analytics Comparison Data
 */
interface AnalyticsComparison {
  current: TaskAnalytics;
  previous: TaskAnalytics;
  changes: {
    [K in keyof TaskAnalytics]?: {
      value: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
}

/**
 * Trend Analysis Data
 */
interface TrendAnalysis {
  metric: keyof TaskAnalytics;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  confidence: number;
  projection: {
    nextPeriod: number;
    confidence: number;
  };
  seasonality?: {
    detected: boolean;
    pattern?: 'weekly' | 'monthly' | 'quarterly';
  };
}

/**
 * Performance Benchmark Data
 */
interface PerformanceBenchmark {
  metric: string;
  currentValue: number;
  benchmarkValue: number;
  industryAverage?: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  recommendation?: string;
}

/**
 * Analytics Subscription Event
 */
interface AnalyticsEvent {
  type: 'metrics-updated' | 'trend-alert' | 'benchmark-change' | 'insight-generated';
  data: any;
  timestamp: string;
}

/**
 * Task Analytics Hook Return Type
 */
interface UseTaskAnalyticsReturn {
  // Core analytics data
  analytics: TaskAnalytics | null;
  loading: boolean;
  error: TasksError | null;
  
  // Data freshness
  lastUpdated: Date | null;
  isStale: boolean;
  
  // Date range controls
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  setDateRangePreset: (preset: DateRangePreset) => void;
  
  // Filter controls
  filters: TaskFilter;
  setFilters: (filters: Partial<TaskFilter>) => void;
  clearFilters: () => void;
  
  // Data operations
  refetch: () => Promise<void>;
  invalidateCache: () => void;
  
  // Specific analytics functions
  getTeamPerformance: (teamMemberIds?: string[]) => Promise<TaskAnalytics['teamPerformance']>;
  getBurndownData: (projectId?: string, milestoneId?: string) => Promise<TaskAnalytics['burndownData']>;
  getVelocityTrend: (teamMemberIds?: string[], periodType?: 'week' | 'sprint' | 'month') => Promise<TaskAnalytics['velocityData']>;
  
  // Advanced analytics
  getComparison: (compareWith: 'previousPeriod' | 'previousMonth' | 'previousQuarter') => Promise<AnalyticsComparison>;
  getTrendAnalysis: (metrics: (keyof TaskAnalytics)[]) => Promise<TrendAnalysis[]>;
  getPerformanceBenchmarks: () => Promise<PerformanceBenchmark[]>;
  
  // Prediction and forecasting
  predictTaskCompletion: (taskId: string) => Promise<{
    estimatedCompletionDate: string;
    confidence: number;
    factors: string[];
  }>;
  getProductivityInsights: () => Promise<{
    insights: Array<{
      type: 'bottleneck' | 'opportunity' | 'risk' | 'achievement';
      title: string;
      description: string;
      impact: 'low' | 'medium' | 'high';
      actionItems: string[];
    }>;
    recommendations: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      expectedImpact: string;
    }>;
  }>;
  
  // Export functionality
  exportData: (format: 'csv' | 'xlsx' | 'pdf' | 'json', includeCharts?: boolean) => Promise<{
    data: any;
    filename: string;
    mimeType: string;
  }>;
  
  // Real-time subscriptions
  subscribe: (callback: (event: AnalyticsEvent) => void) => () => void;
  
  // Utility functions
  formatMetric: (value: number, type: 'percentage' | 'hours' | 'days' | 'count') => string;
  getMetricTrend: (metric: keyof TaskAnalytics, periods: number) => Promise<Array<{ period: string; value: number }>>;
  calculateGrowthRate: (current: number, previous: number) => number;
}

/**
 * Cache Entry for Analytics Data
 */
interface AnalyticsCacheEntry {
  data: TaskAnalytics;
  timestamp: number;
  filter: TaskFilter;
  dateRange: { start: string; end: string };
  expiry: number;
}

/**
 * Task Analytics Hook Implementation
 * 
 * Provides comprehensive analytics capabilities including:
 * - Real-time metrics calculation and tracking
 * - Trend analysis and forecasting
 * - Performance benchmarking
 * - Team productivity insights
 * - Data export in multiple formats
 * - Intelligent caching and refresh strategies
 */
export function useTaskAnalytics(options: UseTaskAnalyticsOptions = {}): UseTaskAnalyticsReturn {
  const {
    projectId,
    milestoneId,
    teamMemberIds,
    autoRefresh = true,
    refreshInterval = 60000, // 1 minute for analytics
    enableRealtime = true,
    enableCaching = true,
    cacheTimeout = 2 * 60 * 1000, // 2 minutes for analytics cache
    dateRange: initialDateRange,
    enableTrendAnalysis = true,
    enableForecasting = true,
    enableInsights = true
  } = options;

  // Core state
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TasksError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);

  // Filter and date range state
  const [filters, setFiltersState] = useState<TaskFilter>({
    projectId,
    milestoneId
  });
  
  const [dateRange, setDateRangeState] = useState<{ start: string; end: string }>(() => {
    if (initialDateRange) return initialDateRange;
    
    // Default to last 30 days
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  });

  // Cache and subscription refs
  const cacheRef = useRef<Map<string, AnalyticsCacheEntry>>(new Map());
  const subscriptionsRef = useRef<Map<string, (() => void)[]>>(new Map());
  const realtimeListenerRef = useRef<((event: CustomEvent) => void) | null>(null);

  // Helper function to generate cache key
  const getCacheKey = useCallback((filter: TaskFilter, dateRange: { start: string; end: string }): string => {
    return JSON.stringify({
      filter: {
        ...filter,
        projectId: filter.projectId || projectId,
        milestoneId: filter.milestoneId || milestoneId
      },
      dateRange,
      teamMemberIds
    });
  }, [projectId, milestoneId, teamMemberIds]);

  // Helper function to check if cache entry is valid
  const isCacheValid = useCallback((entry: AnalyticsCacheEntry): boolean => {
    return enableCaching && Date.now() < entry.expiry;
  }, [enableCaching]);

  // Core fetch function with caching
  const fetchAnalytics = useCallback(async (
    filterOverride?: TaskFilter,
    dateRangeOverride?: { start: string; end: string },
    fromCache = true
  ): Promise<void> => {
    const currentFilter = { ...filters, ...filterOverride, dateRange: dateRangeOverride || dateRange };
    const currentDateRange = dateRangeOverride || dateRange;
    const cacheKey = getCacheKey(currentFilter, currentDateRange);
    
    try {
      setError(null);
      
      // Check cache first
      if (fromCache && enableCaching) {
        const cachedEntry = cacheRef.current.get(cacheKey);
        if (cachedEntry && isCacheValid(cachedEntry)) {
          setAnalytics(cachedEntry.data);
          setLastUpdated(new Date(cachedEntry.timestamp));
          setIsStale(false);
          setLoading(false);
          return;
        }
      }
      
      // Fetch from API
      const analyticsData = await taskAnalytics.getTaskMetrics(currentFilter);
      
      // Update cache
      if (enableCaching) {
        cacheRef.current.set(cacheKey, {
          data: analyticsData,
          timestamp: Date.now(),
          filter: currentFilter,
          dateRange: currentDateRange,
          expiry: Date.now() + cacheTimeout
        });
      }
      
      // Update state
      setAnalytics(analyticsData);
      setLastUpdated(new Date());
      setIsStale(false);
      
    } catch (err) {
      const analyticsError = err as TasksError;
      setError(analyticsError);
      console.error('Failed to fetch analytics:', analyticsError);
      
      // Try to use stale cache data if available
      if (enableCaching) {
        const cachedEntry = cacheRef.current.get(cacheKey);
        if (cachedEntry) {
          setAnalytics(cachedEntry.data);
          setLastUpdated(new Date(cachedEntry.timestamp));
          setIsStale(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [filters, dateRange, getCacheKey, isCacheValid, enableCaching, cacheTimeout]);

  // Date range management
  const setDateRange = useCallback((range: { start: string; end: string }) => {
    setDateRangeState(range);
  }, []);

  const setDateRangePreset = useCallback((preset: DateRangePreset) => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);

    switch (preset) {
      case 'last7days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last90days':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisQuarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      case 'lastQuarter':
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        start = new Date(now.getFullYear(), lastQuarter * 3, 1);
        end = new Date(now.getFullYear(), (lastQuarter + 1) * 3, 0);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return; // Custom - don't change anything
    }

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  }, [setDateRange]);

  // Filter management
  const setFilters = useCallback((newFilters: Partial<TaskFilter>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({ projectId, milestoneId });
  }, [projectId, milestoneId]);

  // Data management
  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchAnalytics(filters, dateRange, false); // Force fetch, skip cache
  }, [fetchAnalytics, filters, dateRange]);

  const invalidateCache = useCallback(() => {
    cacheRef.current.clear();
    setIsStale(true);
  }, []);

  // Specific analytics functions
  const getTeamPerformance = useCallback(async (teamMemberIds?: string[]): Promise<TaskAnalytics['teamPerformance']> => {
    return taskAnalytics.getTeamPerformance(teamMemberIds, dateRange);
  }, [dateRange]);

  const getBurndownData = useCallback(async (projectId?: string, milestoneId?: string): Promise<TaskAnalytics['burndownData']> => {
    return taskAnalytics.getBurndownData(projectId, milestoneId, dateRange);
  }, [dateRange]);

  const getVelocityTrend = useCallback(async (
    teamMemberIds?: string[], 
    periodType: 'week' | 'sprint' | 'month' = 'week'
  ): Promise<TaskAnalytics['velocityData']> => {
    return taskAnalytics.getVelocityTrend(filters.projectId, teamMemberIds, periodType);
  }, [filters.projectId]);

  // Advanced analytics functions
  const getComparison = useCallback(async (
    compareWith: 'previousPeriod' | 'previousMonth' | 'previousQuarter'
  ): Promise<AnalyticsComparison> => {
    if (!analytics) {
      throw new Error('No current analytics data available for comparison');
    }

    // Calculate comparison date range
    const currentStart = new Date(dateRange.start);
    const currentEnd = new Date(dateRange.end);
    const periodDuration = currentEnd.getTime() - currentStart.getTime();

    let previousStart: Date;
    let previousEnd: Date;

    switch (compareWith) {
      case 'previousPeriod':
        previousEnd = new Date(currentStart.getTime() - 1);
        previousStart = new Date(previousEnd.getTime() - periodDuration);
        break;
      case 'previousMonth':
        previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, currentStart.getDate());
        previousEnd = new Date(currentEnd.getFullYear(), currentEnd.getMonth() - 1, currentEnd.getDate());
        break;
      case 'previousQuarter':
        previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 3, currentStart.getDate());
        previousEnd = new Date(currentEnd.getFullYear(), currentEnd.getMonth() - 3, currentEnd.getDate());
        break;
    }

    const previousDateRange = {
      start: previousStart.toISOString().split('T')[0],
      end: previousEnd.toISOString().split('T')[0]
    };

    const previousAnalytics = await taskAnalytics.getTaskMetrics({
      ...filters,
      dateRange: previousDateRange
    });

    // Calculate changes
    const changes: AnalyticsComparison['changes'] = {};
    
    const compareMetrics = [
      'totalTasks', 'completedTasks', 'completionRate', 'averageCompletionTime',
      'blockedTasks', 'overdueTasks', 'estimationAccuracy'
    ] as const;

    compareMetrics.forEach(metric => {
      const currentValue = analytics[metric] as number;
      const previousValue = previousAnalytics[metric] as number;
      const change = currentValue - previousValue;
      const percentage = previousValue !== 0 ? (change / previousValue) * 100 : 0;
      
      changes[metric] = {
        value: change,
        percentage,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      };
    });

    return {
      current: analytics,
      previous: previousAnalytics,
      changes
    };
  }, [analytics, dateRange, filters]);

  const getTrendAnalysis = useCallback(async (metrics: (keyof TaskAnalytics)[]): Promise<TrendAnalysis[]> => {
    if (!enableTrendAnalysis) {
      throw new Error('Trend analysis is disabled');
    }

    const trends: TrendAnalysis[] = [];
    
    for (const metric of metrics) {
      // Get historical data for trend analysis (simplified implementation)
      const historicalData = await getMetricTrend(metric, 12);
      
      if (historicalData.length < 3) {
        continue; // Need at least 3 data points for trend analysis
      }

      // Simple trend calculation
      const values = historicalData.map(d => d.value);
      const recentValues = values.slice(-3);
      const olderValues = values.slice(0, 3);
      
      const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
      const olderAvg = olderValues.reduce((a, b) => a + b, 0) / olderValues.length;
      
      let trend: TrendAnalysis['trend'];
      const change = recentAvg - olderAvg;
      const changePercent = Math.abs(change / olderAvg) * 100;
      
      if (changePercent < 5) {
        trend = 'stable';
      } else if (change > 0) {
        trend = 'increasing';
      } else {
        trend = 'decreasing';
      }
      
      // Calculate confidence based on data consistency
      const variance = values.reduce((sum, val) => sum + Math.pow(val - recentAvg, 2), 0) / values.length;
      const confidence = Math.max(0, Math.min(100, 100 - (variance / recentAvg) * 100));
      
      // Simple projection for next period
      const projection = {
        nextPeriod: recentAvg + (change * 0.5), // Conservative projection
        confidence: Math.max(30, confidence * 0.8) // Lower confidence for projections
      };

      trends.push({
        metric,
        trend,
        confidence,
        projection
      });
    }

    return trends;
  }, [enableTrendAnalysis]);

  const getPerformanceBenchmarks = useCallback(async (): Promise<PerformanceBenchmark[]> => {
    if (!analytics) {
      return [];
    }

    // Industry benchmarks (these would come from a benchmarking service in production)
    const benchmarks: PerformanceBenchmark[] = [
      {
        metric: 'Completion Rate',
        currentValue: analytics.completionRate,
        benchmarkValue: 85,
        industryAverage: 75,
        performance: analytics.completionRate >= 85 ? 'excellent' : 
                    analytics.completionRate >= 75 ? 'good' : 
                    analytics.completionRate >= 65 ? 'average' : 'poor',
        recommendation: analytics.completionRate < 85 ? 'Focus on removing blockers and improving task planning' : undefined
      },
      {
        metric: 'Estimation Accuracy',
        currentValue: analytics.estimationAccuracy,
        benchmarkValue: 80,
        industryAverage: 70,
        performance: analytics.estimationAccuracy >= 80 ? 'excellent' : 
                    analytics.estimationAccuracy >= 70 ? 'good' : 
                    analytics.estimationAccuracy >= 60 ? 'average' : 'poor',
        recommendation: analytics.estimationAccuracy < 80 ? 'Implement better estimation techniques and historical data analysis' : undefined
      },
      {
        metric: 'Average Completion Time',
        currentValue: analytics.averageCompletionTime,
        benchmarkValue: 5, // 5 days
        industryAverage: 7,
        performance: analytics.averageCompletionTime <= 5 ? 'excellent' : 
                    analytics.averageCompletionTime <= 7 ? 'good' : 
                    analytics.averageCompletionTime <= 10 ? 'average' : 'poor',
        recommendation: analytics.averageCompletionTime > 7 ? 'Review task complexity and resource allocation' : undefined
      }
    ];

    return benchmarks;
  }, [analytics]);

  // Prediction and insights
  const predictTaskCompletion = useCallback(async (taskId: string) => {
    return taskAnalytics.predictTaskCompletion(taskId);
  }, []);

  const getProductivityInsights = useCallback(async () => {
    if (!enableInsights) {
      throw new Error('Productivity insights are disabled');
    }
    return taskAnalytics.getProductivityInsights(filters);
  }, [enableInsights, filters]);

  // Export functionality
  const exportData = useCallback(async (
    format: 'csv' | 'xlsx' | 'pdf' | 'json',
    includeCharts = false
  ) => {
    return taskAnalytics.exportAnalytics({ ...filters, dateRange }, format, includeCharts);
  }, [filters, dateRange]);

  // Real-time subscriptions
  const subscribe = useCallback((callback: (event: AnalyticsEvent) => void): (() => void) => {
    const subscriptionId = Math.random().toString(36).substr(2, 9);
    const currentSubscriptions = subscriptionsRef.current.get('analytics') || [];
    
    const unsubscribe = () => {
      subscriptionsRef.current.set('analytics', 
        currentSubscriptions.filter(sub => sub !== unsubscribe)
      );
    };
    
    currentSubscriptions.push(unsubscribe);
    subscriptionsRef.current.set('analytics', currentSubscriptions);
    
    // In a real implementation, this would connect to a WebSocket or Server-Sent Events
    // For now, we'll just return the unsubscribe function
    return unsubscribe;
  }, []);

  // Utility functions
  const formatMetric = useCallback((value: number, type: 'percentage' | 'hours' | 'days' | 'count'): string => {
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'hours':
        return `${value.toFixed(1)}h`;
      case 'days':
        return `${value.toFixed(1)} days`;
      case 'count':
        return value.toString();
      default:
        return value.toString();
    }
  }, []);

  const getMetricTrend = useCallback(async (
    metric: keyof TaskAnalytics,
    periods: number
  ): Promise<Array<{ period: string; value: number }>> => {
    const trendData = [];
    const endDate = new Date(dateRange.end);
    const periodDuration = new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime();

    for (let i = periods - 1; i >= 0; i--) {
      const periodEnd = new Date(endDate.getTime() - i * periodDuration);
      const periodStart = new Date(periodEnd.getTime() - periodDuration);
      
      const periodDateRange = {
        start: periodStart.toISOString().split('T')[0],
        end: periodEnd.toISOString().split('T')[0]
      };

      try {
        const periodAnalytics = await taskAnalytics.getTaskMetrics({
          ...filters,
          dateRange: periodDateRange
        });

        trendData.push({
          period: periodEnd.toISOString().split('T')[0],
          value: periodAnalytics[metric] as number
        });
      } catch (error) {
        console.error(`Failed to fetch analytics for period ${periodStart.toISOString().split('T')[0]}:`, error);
      }
    }

    return trendData;
  }, [dateRange, filters]);

  const calculateGrowthRate = useCallback((current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }, []);

  // Effects
  
  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Refetch when filters or date range change
  useEffect(() => {
    if (lastUpdated) { // Don't refetch on initial load
      setLoading(true);
      fetchAnalytics();
    }
  }, [filters, dateRange]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!loading) {
        fetchAnalytics(filters, dateRange, false); // Force refresh
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading, filters, dateRange, fetchAnalytics]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealtime) return;

    const handleTaskEvent = (event: CustomEvent) => {
      // Invalidate cache when tasks change
      setIsStale(true);
      
      // Refresh analytics after a short delay to avoid too frequent updates
      setTimeout(() => {
        if (!loading) {
          fetchAnalytics(filters, dateRange, false);
        }
      }, 2000);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('enhanced-task-event', handleTaskEvent as EventListener);
      realtimeListenerRef.current = handleTaskEvent;
      
      return () => {
        window.removeEventListener('enhanced-task-event', handleTaskEvent as EventListener);
        realtimeListenerRef.current = null;
      };
    }
  }, [enableRealtime, loading, filters, dateRange, fetchAnalytics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.clear();
      if (!enableCaching) {
        cacheRef.current.clear();
      }
    };
  }, [enableCaching]);

  return {
    // Core analytics data
    analytics,
    loading,
    error,
    
    // Data freshness
    lastUpdated,
    isStale,
    
    // Date range controls
    dateRange,
    setDateRange,
    setDateRangePreset,
    
    // Filter controls
    filters,
    setFilters,
    clearFilters,
    
    // Data operations
    refetch,
    invalidateCache,
    
    // Specific analytics functions
    getTeamPerformance,
    getBurndownData,
    getVelocityTrend,
    
    // Advanced analytics
    getComparison,
    getTrendAnalysis,
    getPerformanceBenchmarks,
    
    // Prediction and forecasting
    predictTaskCompletion,
    getProductivityInsights,
    
    // Export functionality
    exportData,
    
    // Real-time subscriptions
    subscribe,
    
    // Utility functions
    formatMetric,
    getMetricTrend,
    calculateGrowthRate
  };
}