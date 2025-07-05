import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  AlertTriangle,
  TrendingDown,
  Clock,
  BarChart3,
  Filter,
  RefreshCw,
  Settings,
  Download,
  Target,
  Users,
  ArrowRight,
  CircleAlert,
  Workflow,
  Gauge,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Zap,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  TrendingUp,
  MapPin,
  Shuffle,
  PieChart
} from 'lucide-react';
import { useTaskAnalytics } from '../../tasks/hooks/useTaskAnalytics';
import { useEnhancedTaskData } from '../../tasks/hooks/useEnhancedTaskData';
import type { 
  TaskAnalytics, 
  Task,
  TaskFilter,
  TaskStatus
} from '../../tasks/types';

interface TaskBottleneckAnalyzerProps {
  projectId?: string;
  milestoneId?: string;
  teamId?: string;
  timeframe?: 'week' | 'month' | 'quarter' | 'custom';
  enableAutoDetection?: boolean;
  enableSuggestions?: boolean;
  enableRealtime?: boolean;
  showWorkflowView?: boolean;
  showImpactAnalysis?: boolean;
  height?: number;
  refreshInterval?: number;
}

interface BottleneckPoint {
  id: string;
  type: 'status' | 'assignee' | 'dependency' | 'approval' | 'resource';
  name: string;
  location: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: number; // 0-100 scale
  affectedTasks: number;
  averageWaitTime: number;
  maxWaitTime: number;
  throughput: number;
  description: string;
  suggestions: BottleneckSuggestion[];
  trend: 'increasing' | 'decreasing' | 'stable';
  firstDetected: string;
  frequency: number;
}

interface BottleneckSuggestion {
  id: string;
  type: 'process' | 'resource' | 'automation' | 'workflow';
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeToImplement: string;
  priority: number;
}

interface WorkflowStage {
  id: string;
  name: string;
  position: number;
  tasks: number;
  averageTime: number;
  bottleneckScore: number;
  throughput: number;
  efficiency: number;
}

interface FlowMetrics {
  totalThroughput: number;
  averageCycleTime: number;
  leadTime: number;
  flowEfficiency: number;
  waitTime: number;
  activeTime: number;
  blockageRate: number;
  reworkRate: number;
}

type AnalysisView = 'overview' | 'workflow' | 'detailed' | 'suggestions' | 'trends';
type BottleneckFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';

export const TaskBottleneckAnalyzer: React.FC<TaskBottleneckAnalyzerProps> = ({
  projectId,
  milestoneId,
  teamId,
  timeframe = 'month',
  enableAutoDetection = true,
  enableSuggestions = true,
  enableRealtime = true,
  showWorkflowView = true,
  showImpactAnalysis = true,
  height = 700,
  refreshInterval = 60000 // 1 minute
}) => {
  // State management
  const [analysisView, setAnalysisView] = useState<AnalysisView>('overview');
  const [bottleneckFilter, setBottleneckFilter] = useState<BottleneckFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isRealtime, setIsRealtime] = useState(enableRealtime);
  const [selectedBottleneck, setSelectedBottleneck] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Calculate date range
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    switch (timeframe) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
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

  // Analyze bottlenecks
  const bottleneckAnalysis = useMemo(() => {
    if (!analytics || !tasks) return { bottlenecks: [], flowMetrics: null, workflowStages: [] };

    const bottlenecks: BottleneckPoint[] = [];
    
    // Analyze status-based bottlenecks
    if (analytics.statusDistribution) {
      Object.entries(analytics.statusDistribution).forEach(([status, count]) => {
        const statusTasks = tasks.filter(task => typeof task.status === 'string' ? task.status === status : task.status.id === status);
        const avgWaitTime = statusTasks.reduce((sum, task) => {
          const waitTime = task.updatedAt ? 
            (new Date().getTime() - new Date(task.updatedAt).getTime()) / (1000 * 60 * 60 * 24) : 0;
          return sum + waitTime;
        }, 0) / (statusTasks.length || 1);
        
        // Detect bottleneck if average wait time > 3 days or too many tasks in one status
        const totalTasks = analytics.totalTasks;
        const bottleneckScore = ((count / totalTasks) * 100) + (avgWaitTime * 10);
        
        if (bottleneckScore > 40 || avgWaitTime > 3) {
          let severity: 'critical' | 'high' | 'medium' | 'low' = 'low';
          if (bottleneckScore > 80) severity = 'critical';
          else if (bottleneckScore > 60) severity = 'high';
          else if (bottleneckScore > 40) severity = 'medium';
          
          bottlenecks.push({
            id: `status-${status}`,
            type: 'status',
            name: `${status} Status`,
            location: `Task Status: ${status}`,
            severity,
            impact: Math.min(100, bottleneckScore),
            affectedTasks: count,
            averageWaitTime: avgWaitTime,
            maxWaitTime: Math.max(...statusTasks.map(task => {
              return task.updatedAt ? 
                (new Date().getTime() - new Date(task.updatedAt).getTime()) / (1000 * 60 * 60 * 24) : 0;
            })),
            throughput: count / 7, // Tasks per day (mock)
            description: `Tasks are accumulating in ${status} status with average wait time of ${avgWaitTime.toFixed(1)} days`,
            suggestions: [
              {
                id: 'status-review',
                type: 'process',
                title: 'Review Process',
                description: `Streamline the ${status} process to reduce wait times`,
                effort: 'medium',
                impact: 'high',
                timeToImplement: '1-2 weeks',
                priority: severity === 'critical' ? 90 : severity === 'high' ? 70 : 50
              },
              {
                id: 'status-automation',
                type: 'automation',
                title: 'Automate Transitions',
                description: `Add automated transitions from ${status} when conditions are met`,
                effort: 'high',
                impact: 'medium',
                timeToImplement: '2-4 weeks',
                priority: 60
              }
            ],
            trend: avgWaitTime > 5 ? 'increasing' : avgWaitTime < 2 ? 'decreasing' : 'stable',
            firstDetected: new Date(Date.now() - avgWaitTime * 24 * 60 * 60 * 1000).toISOString(),
            frequency: count
          });
        }
      });
    }

    // Analyze assignee-based bottlenecks
    if (analytics.teamPerformance) {
      analytics.teamPerformance.forEach(member => {
        const memberTasks = tasks.filter(task => task.assigneeId === member.assigneeId);
        const overdueTasks = memberTasks.filter(task => 
          task.dueDate && new Date(task.dueDate) < new Date()
        ).length;
        
        // Detect bottleneck if completion rate is low or many overdue tasks
        const bottleneckScore = (100 - member.completionRate) + (overdueTasks * 20);
        
        if (bottleneckScore > 30 || overdueTasks > 2) {
          let severity: 'critical' | 'high' | 'medium' | 'low' = 'low';
          if (bottleneckScore > 70) severity = 'critical';
          else if (bottleneckScore > 50) severity = 'high';
          else if (bottleneckScore > 30) severity = 'medium';
          
          bottlenecks.push({
            id: `assignee-${member.assigneeId}`,
            type: 'assignee',
            name: member.assigneeId,
            location: `Team Member: ${member.assigneeId}`,
            severity,
            impact: Math.min(100, bottleneckScore),
            affectedTasks: member.totalTasks,
            averageWaitTime: analytics.averageCompletionTime,
            maxWaitTime: analytics.averageCompletionTime * 2,
            throughput: member.completedTasks / 7,
            description: `Team member has ${member.completionRate.toFixed(1)}% completion rate with ${overdueTasks} overdue tasks`,
            suggestions: [
              {
                id: 'workload-balance',
                type: 'resource',
                title: 'Rebalance Workload',
                description: 'Redistribute tasks to balance team workload',
                effort: 'low',
                impact: 'medium',
                timeToImplement: 'Immediate',
                priority: 80
              },
              {
                id: 'training-support',
                type: 'resource',
                title: 'Provide Training',
                description: 'Offer additional training or support to improve efficiency',
                effort: 'medium',
                impact: 'high',
                timeToImplement: '1-2 weeks',
                priority: 70
              }
            ],
            trend: member.completionRate < 70 ? 'increasing' : 'stable',
            firstDetected: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            frequency: member.totalTasks
          });
        }
      });
    }

    // Analyze dependency-based bottlenecks
    const blockedTasks = tasks.filter(task => 
      (typeof task.status === 'string' ? task.status === 'blocked' : task.status.id === 'blocked') || 
      task.blockedReason ||
      (task.dependencies && task.dependencies.length > 0)
    );
    
    if (blockedTasks.length > 0) {
      const avgBlockTime = blockedTasks.reduce((sum, task) => {
        return sum + (task.updatedAt ? 
          (new Date().getTime() - new Date(task.updatedAt).getTime()) / (1000 * 60 * 60 * 24) : 0);
      }, 0) / blockedTasks.length;
      
      const bottleneckScore = (blockedTasks.length / tasks.length) * 100 + avgBlockTime * 15;
      
      if (bottleneckScore > 20) {
        let severity: 'critical' | 'high' | 'medium' | 'low' = 'low';
        if (bottleneckScore > 60) severity = 'critical';
        else if (bottleneckScore > 40) severity = 'high';
        else if (bottleneckScore > 20) severity = 'medium';
        
        bottlenecks.push({
          id: 'dependency-bottleneck',
          type: 'dependency',
          name: 'Dependency Conflicts',
          location: 'Task Dependencies',
          severity,
          impact: Math.min(100, bottleneckScore),
          affectedTasks: blockedTasks.length,
          averageWaitTime: avgBlockTime,
          maxWaitTime: Math.max(...blockedTasks.map(task => {
            return task.updatedAt ? 
              (new Date().getTime() - new Date(task.updatedAt).getTime()) / (1000 * 60 * 60 * 24) : 0;
          })),
          throughput: 0, // Blocked tasks have zero throughput
          description: `${blockedTasks.length} tasks are blocked by dependencies with average block time of ${avgBlockTime.toFixed(1)} days`,
          suggestions: [
            {
              id: 'dependency-review',
              type: 'process',
              title: 'Review Dependencies',
              description: 'Analyze and resolve blocking dependencies',
              effort: 'medium',
              impact: 'high',
              timeToImplement: '1 week',
              priority: 85
            },
            {
              id: 'parallel-work',
              type: 'workflow',
              title: 'Enable Parallel Work',
              description: 'Restructure tasks to allow parallel execution',
              effort: 'high',
              impact: 'high',
              timeToImplement: '2-3 weeks',
              priority: 75
            }
          ],
          trend: blockedTasks.length > 5 ? 'increasing' : 'stable',
          firstDetected: new Date(Date.now() - avgBlockTime * 24 * 60 * 60 * 1000).toISOString(),
          frequency: blockedTasks.length
        });
      }
    }

    // Calculate flow metrics
    const flowMetrics: FlowMetrics = {
      totalThroughput: analytics.completedTasks / 7, // Tasks per day
      averageCycleTime: analytics.averageCompletionTime,
      leadTime: analytics.averageCompletionTime * 1.2, // Mock lead time
      flowEfficiency: Math.max(0, 100 - bottlenecks.reduce((sum, b) => sum + b.impact, 0) / bottlenecks.length),
      waitTime: bottlenecks.reduce((sum, b) => sum + b.averageWaitTime, 0) / (bottlenecks.length || 1),
      activeTime: analytics.averageCompletionTime * 0.6, // Mock active time
      blockageRate: (blockedTasks.length / tasks.length) * 100,
      reworkRate: 5 // Mock rework rate
    };

    // Create workflow stages
    const workflowStages: WorkflowStage[] = [
      {
        id: 'todo',
        name: 'To Do',
        position: 1,
        tasks: analytics.statusDistribution?.['todo'] || 0,
        averageTime: 1,
        bottleneckScore: bottlenecks.find(b => b.id === 'status-todo')?.impact || 0,
        throughput: (analytics.statusDistribution?.['todo'] || 0) / 7,
        efficiency: 85
      },
      {
        id: 'in_progress',
        name: 'In Progress',
        position: 2,
        tasks: analytics.statusDistribution?.['in_progress'] || analytics.inProgressTasks,
        averageTime: analytics.averageCompletionTime * 0.8,
        bottleneckScore: bottlenecks.find(b => b.id === 'status-in_progress')?.impact || 0,
        throughput: analytics.inProgressTasks / 7,
        efficiency: 70
      },
      {
        id: 'review',
        name: 'Review',
        position: 3,
        tasks: analytics.statusDistribution?.['review'] || 0,
        averageTime: 2,
        bottleneckScore: bottlenecks.find(b => b.id === 'status-review')?.impact || 0,
        throughput: (analytics.statusDistribution?.['review'] || 0) / 7,
        efficiency: 60
      },
      {
        id: 'completed',
        name: 'Completed',
        position: 4,
        tasks: analytics.completedTasks,
        averageTime: 0,
        bottleneckScore: 0,
        throughput: analytics.completedTasks / 7,
        efficiency: 100
      }
    ];

    return { bottlenecks, flowMetrics, workflowStages };
  }, [analytics, tasks]);

  // Filter bottlenecks
  const filteredBottlenecks = useMemo(() => {
    let filtered = bottleneckAnalysis.bottlenecks;
    
    if (bottleneckFilter !== 'all') {
      filtered = filtered.filter(b => b.severity === bottleneckFilter);
    }
    
    return filtered.sort((a, b) => b.impact - a.impact);
  }, [bottleneckAnalysis.bottlenecks, bottleneckFilter]);

  // Get severity color
  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  // Get trend indicator
  const getTrendIndicator = useCallback((trend: string) => {
    switch (trend) {
      case 'increasing':
        return <ArrowUp className="w-3 h-3 text-red-500" />;
      case 'decreasing':
        return <ArrowDown className="w-3 h-3 text-green-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-500" />;
    }
  }, []);

  // Handle view changes
  const handleViewChange = useCallback((view: AnalysisView) => {
    setAnalysisView(view);
  }, []);

  // Handle bottleneck selection
  const handleBottleneckSelect = useCallback((bottleneckId: string) => {
    setSelectedBottleneck(bottleneckId === selectedBottleneck ? null : bottleneckId);
  }, [selectedBottleneck]);

  // Loading state
  if (loading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Analyzing bottlenecks...</p>
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
          <p className="text-red-700">Failed to load bottleneck data</p>
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
            <AlertTriangle className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Bottleneck Analyzer</h3>
            <span className="text-sm text-gray-500">
              ({timeframe})
            </span>
            {isRealtime && (
              <div className="flex items-center text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Live Analysis
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Selector */}
            <div className="flex bg-white border rounded-md">
              {(['overview', 'workflow', 'detailed', 'suggestions'] as AnalysisView[]).map((view) => (
                <button
                  key={view}
                  onClick={() => handleViewChange(view)}
                  className={`px-3 py-1.5 text-sm font-medium capitalize ${
                    analysisView === view
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* Severity Filter */}
            <select
              value={bottleneckFilter}
              onChange={(e) => setBottleneckFilter(e.target.value as BottleneckFilter)}
              className="px-3 py-1.5 border rounded-md text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Auto Detection Toggle */}
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={enableAutoDetection}
                onChange={(e) => {
                  // In a real implementation, this would update the prop
                  console.log('Auto detection:', e.target.checked);
                }}
                className="rounded border-gray-300 text-blue-600 mr-2"
              />
              <span>Auto-detect</span>
            </label>

            {/* Refresh */}
            <button
              onClick={refetch}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50"
              title="Refresh Analysis"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="border-b bg-gray-50 p-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredBottlenecks.filter(b => b.severity === 'critical').length}
            </div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {filteredBottlenecks.filter(b => b.severity === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {bottleneckAnalysis.flowMetrics?.flowEfficiency.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-gray-600">Flow Efficiency</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {bottleneckAnalysis.flowMetrics?.totalThroughput.toFixed(1) || 0}
            </div>
            <div className="text-sm text-gray-600">Throughput/day</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {bottleneckAnalysis.flowMetrics?.averageCycleTime.toFixed(1) || 0}d
            </div>
            <div className="text-sm text-gray-600">Cycle Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600">
              {bottleneckAnalysis.flowMetrics?.blockageRate.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-gray-600">Blockage Rate</div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {analysisView === 'overview' && (
          <div className="space-y-6">
            {/* Top Bottlenecks */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Bottlenecks</h4>
              <div className="space-y-3">
                {filteredBottlenecks.slice(0, 5).map((bottleneck) => (
                  <div
                    key={bottleneck.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedBottleneck === bottleneck.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleBottleneckSelect(bottleneck.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(bottleneck.severity)}`}>
                          {bottleneck.severity.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{bottleneck.name}</div>
                          <div className="text-sm text-gray-600">{bottleneck.location}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{bottleneck.affectedTasks}</div>
                          <div className="text-gray-500">Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{bottleneck.averageWaitTime.toFixed(1)}d</div>
                          <div className="text-gray-500">Avg Wait</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center">
                            <span className="font-medium mr-1">{Math.round(bottleneck.impact)}%</span>
                            {getTrendIndicator(bottleneck.trend)}
                          </div>
                          <div className="text-gray-500">Impact</div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedBottleneck === bottleneck.id && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-700 mb-3">{bottleneck.description}</p>
                        <div className="space-y-2">
                          <h6 className="text-sm font-medium text-gray-900">Suggested Actions:</h6>
                          {bottleneck.suggestions.slice(0, 2).map((suggestion) => (
                            <div key={suggestion.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{suggestion.title}</span>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  suggestion.impact === 'high' ? 'bg-green-100 text-green-700' :
                                  suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {suggestion.impact} impact
                                </span>
                                <span className="text-gray-500">{suggestion.timeToImplement}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {filteredBottlenecks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>No significant bottlenecks detected</p>
                  <p className="text-sm">Your workflow is running smoothly!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {analysisView === 'workflow' && showWorkflowView && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900">Workflow Analysis</h4>
            
            {/* Workflow Stages */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {bottleneckAnalysis.workflowStages.map((stage, index) => (
                <div key={stage.id} className="relative">
                  <div className={`p-4 border rounded-lg ${
                    stage.bottleneckScore > 50 ? 'border-red-200 bg-red-50' :
                    stage.bottleneckScore > 30 ? 'border-yellow-200 bg-yellow-50' :
                    'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{stage.name}</h5>
                      {stage.bottleneckScore > 30 && (
                        <AlertTriangle className={`w-4 h-4 ${
                          stage.bottleneckScore > 50 ? 'text-red-500' : 'text-yellow-500'
                        }`} />
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tasks:</span>
                        <span className="font-medium">{stage.tasks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Time:</span>
                        <span className="font-medium">{stage.averageTime.toFixed(1)}d</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Throughput:</span>
                        <span className="font-medium">{stage.throughput.toFixed(1)}/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Efficiency:</span>
                        <span className="font-medium">{stage.efficiency}%</span>
                      </div>
                    </div>
                    
                    {stage.bottleneckScore > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              stage.bottleneckScore > 50 ? 'bg-red-500' :
                              stage.bottleneckScore > 30 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, stage.bottleneckScore)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Bottleneck Score: {Math.round(stage.bottleneckScore)}%
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {index < bottleneckAnalysis.workflowStages.length - 1 && (
                    <ArrowRight className="absolute top-1/2 -right-6 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
            
            {/* Flow Metrics */}
            <div className="bg-white border rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-4">Flow Metrics</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {bottleneckAnalysis.flowMetrics?.leadTime.toFixed(1)}d
                  </div>
                  <div className="text-sm text-gray-600">Lead Time</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {bottleneckAnalysis.flowMetrics?.activeTime.toFixed(1)}d
                  </div>
                  <div className="text-sm text-gray-600">Active Time</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {bottleneckAnalysis.flowMetrics?.waitTime.toFixed(1)}d
                  </div>
                  <div className="text-sm text-gray-600">Wait Time</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {bottleneckAnalysis.flowMetrics?.reworkRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Rework Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {analysisView === 'suggestions' && enableSuggestions && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900">Optimization Suggestions</h4>
            
            <div className="space-y-4">
              {filteredBottlenecks.flatMap(bottleneck => 
                bottleneck.suggestions.map(suggestion => ({
                  ...suggestion,
                  bottleneckName: bottleneck.name,
                  bottleneckSeverity: bottleneck.severity
                }))
              )
              .sort((a, b) => b.priority - a.priority)
              .slice(0, 10)
              .map((suggestion) => (
                <div key={`${suggestion.bottleneckName}-${suggestion.id}`} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          suggestion.type === 'automation' ? 'bg-purple-100 text-purple-700' :
                          suggestion.type === 'process' ? 'bg-blue-100 text-blue-700' :
                          suggestion.type === 'resource' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {suggestion.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{suggestion.description}</p>
                      <div className="text-xs text-gray-500">
                        Related to: {suggestion.bottleneckName}
                      </div>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          suggestion.impact === 'high' ? 'bg-green-100 text-green-700' :
                          suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {suggestion.impact} impact
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          suggestion.effort === 'low' ? 'bg-green-100 text-green-700' :
                          suggestion.effort === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {suggestion.effort} effort
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{suggestion.timeToImplement}</div>
                      <div className="text-xs font-medium text-gray-700 mt-1">
                        Priority: {suggestion.priority}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 p-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Last analyzed: {new Date().toLocaleTimeString()}</span>
            <span>•</span>
            <span>{filteredBottlenecks.length} bottlenecks detected</span>
            {bottleneckAnalysis.flowMetrics && (
              <>
                <span>•</span>
                <span>Flow efficiency: {Math.round(bottleneckAnalysis.flowMetrics.flowEfficiency)}%</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Workflow className="w-4 h-4" />
            <span>Workflow optimization active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskBottleneckAnalyzer;