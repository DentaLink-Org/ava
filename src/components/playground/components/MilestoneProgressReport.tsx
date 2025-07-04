import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Clock, 
  Users, 
  Target,
  Download,
  RefreshCw,
  Filter,
  Settings,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap
} from 'lucide-react';
import { useMilestoneData } from '../../milestones';
import type { Milestone, MilestoneStatus } from '../../milestones/types';

interface MilestoneProgressReportProps {
  projectId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  showHistoricalData?: boolean;
  enableExport?: boolean;
  enableRealtime?: boolean;
  reportType?: 'summary' | 'detailed' | 'executive';
  comparisonMode?: 'none' | 'previous_period' | 'target';
  onExportReport?: (data: any, format: 'pdf' | 'excel' | 'csv') => void;
  className?: string;
}

interface ProgressMetrics {
  totalMilestones: number;
  completedMilestones: number;
  overdueMilestones: number;
  onTrackMilestones: number;
  avgProgress: number;
  velocityTrend: number;
  estimatedCompletion: Date | null;
  riskScore: number;
}

interface TeamPerformance {
  memberId: string;
  memberName: string;
  assignedMilestones: number;
  completedMilestones: number;
  avgCompletionTime: number;
  efficiency: number;
}

interface TrendData {
  date: string;
  completed: number;
  inProgress: number;
  pending: number;
  velocity: number;
}

export const MilestoneProgressReport: React.FC<MilestoneProgressReportProps> = ({
  projectId = 'project-1',
  timeRange = '30d',
  showHistoricalData = true,
  enableExport = true,
  enableRealtime = true,
  reportType = 'detailed',
  comparisonMode = 'previous_period',
  onExportReport,
  className = ''
}) => {
  const { milestones, loading, error } = useMilestoneData({ 
    projectId,
    enableRealtime 
  });

  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [refreshing, setRefreshing] = useState(false);

  // Calculate time range for analysis
  const getTimeRangeStart = () => {
    const now = new Date();
    switch (timeRange) {
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  };

  // Calculate progress metrics
  const progressMetrics = useMemo((): ProgressMetrics => {
    const now = new Date();
    const timeRangeStart = getTimeRangeStart();
    
    const relevantMilestones = milestones.filter(m => 
      new Date(m.createdAt) >= timeRangeStart && !m.isArchived
    );

    const totalMilestones = relevantMilestones.length;
    const completedMilestones = relevantMilestones.filter(m => m.status === 'completed').length;
    const overdueMilestones = relevantMilestones.filter(m => 
      m.dueDate && new Date(m.dueDate) < now && m.status !== 'completed'
    ).length;
    const onTrackMilestones = relevantMilestones.filter(m => 
      m.status === 'in_progress' && (!m.dueDate || new Date(m.dueDate) >= now)
    ).length;

    const avgProgress = totalMilestones > 0 ? 
      relevantMilestones.reduce((sum, m) => sum + m.progress, 0) / totalMilestones : 0;

    // Calculate velocity trend (milestones completed per week)
    const completedInTimeRange = relevantMilestones.filter(m => 
      m.status === 'completed' && m.completedAt && 
      new Date(m.completedAt) >= timeRangeStart
    );
    const weeksInRange = Math.ceil((now.getTime() - timeRangeStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const velocityTrend = completedInTimeRange.length / Math.max(weeksInRange, 1);

    // Estimate completion date based on current velocity
    const remainingMilestones = totalMilestones - completedMilestones;
    const estimatedCompletion = velocityTrend > 0 ? 
      new Date(now.getTime() + (remainingMilestones / velocityTrend) * 7 * 24 * 60 * 60 * 1000) : null;

    // Calculate risk score (0-100, higher = more risk)
    const riskFactors = [
      overdueMilestones / Math.max(totalMilestones, 1) * 40, // Overdue weight
      (100 - avgProgress) / 100 * 30, // Low progress weight
      velocityTrend < 1 ? 30 : 0 // Low velocity weight
    ];
    const riskScore = Math.min(100, riskFactors.reduce((sum, factor) => sum + factor, 0));

    return {
      totalMilestones,
      completedMilestones,
      overdueMilestones,
      onTrackMilestones,
      avgProgress,
      velocityTrend,
      estimatedCompletion,
      riskScore
    };
  }, [milestones, timeRange]);

  // Generate trend data for charts
  const trendData = useMemo((): TrendData[] => {
    const data: TrendData[] = [];
    const now = new Date();
    const timeRangeStart = getTimeRangeStart();
    const daysDiff = Math.ceil((now.getTime() - timeRangeStart.getTime()) / (24 * 60 * 60 * 1000));
    
    for (let i = daysDiff; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const milestonesOnDate = milestones.filter(m => {
        const createdAt = new Date(m.createdAt);
        return createdAt <= date && !m.isArchived;
      });
      
      const completed = milestonesOnDate.filter(m => 
        m.status === 'completed' && m.completedAt && new Date(m.completedAt) <= date
      ).length;
      
      const inProgress = milestonesOnDate.filter(m => m.status === 'in_progress').length;
      const pending = milestonesOnDate.filter(m => m.status === 'pending').length;
      
      // Calculate velocity (7-day rolling average)
      const weekStart = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
      const completedInWeek = milestones.filter(m => 
        m.status === 'completed' && m.completedAt &&
        new Date(m.completedAt) >= weekStart && new Date(m.completedAt) <= date
      ).length;
      
      data.push({
        date: dateStr,
        completed,
        inProgress,
        pending,
        velocity: completedInWeek
      });
    }
    
    return data;
  }, [milestones, timeRange]);

  // Calculate team performance
  const teamPerformance = useMemo((): TeamPerformance[] => {
    const memberMap = new Map<string, TeamPerformance>();
    
    milestones.forEach(milestone => {
      milestone.assignedTo?.forEach(memberId => {
        if (!memberMap.has(memberId)) {
          memberMap.set(memberId, {
            memberId,
            memberName: `Team Member ${memberId.slice(-4)}`, // Mock name
            assignedMilestones: 0,
            completedMilestones: 0,
            avgCompletionTime: 0,
            efficiency: 0
          });
        }
        
        const member = memberMap.get(memberId)!;
        member.assignedMilestones++;
        
        if (milestone.status === 'completed') {
          member.completedMilestones++;
        }
      });
    });
    
    // Calculate efficiency and completion time
    memberMap.forEach((member, memberId) => {
      member.efficiency = member.assignedMilestones > 0 ? 
        (member.completedMilestones / member.assignedMilestones) * 100 : 0;
      
      // Mock completion time calculation
      member.avgCompletionTime = 5 + Math.random() * 10; // 5-15 days average
    });
    
    return Array.from(memberMap.values()).sort((a, b) => b.efficiency - a.efficiency);
  }, [milestones]);

  // Handle data refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Handle export
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    const exportData = {
      reportType,
      timeRange,
      generatedAt: new Date().toISOString(),
      metrics: progressMetrics,
      trendData,
      teamPerformance,
      milestones: milestones.map(m => ({
        id: m.id,
        title: m.title,
        status: m.status,
        progress: m.progress,
        dueDate: m.dueDate,
        completedAt: m.completedAt
      }))
    };
    
    if (onExportReport) {
      onExportReport(exportData, format);
    } else {
      // Default export as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `milestone-progress-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Get status color
  const getStatusColor = (value: number, type: 'progress' | 'risk') => {
    if (type === 'progress') {
      if (value >= 80) return 'text-green-600';
      if (value >= 50) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value <= 30) return 'text-green-600';
      if (value <= 60) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-red-600">
          <h3 className="font-semibold mb-2">Error Loading Progress Report</h3>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Milestone Progress Report</h2>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">{timeRange.toUpperCase()} Analysis</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Time Range Selector */}
            <select 
              className="text-sm border border-gray-300 rounded px-3 py-1"
              value={timeRange}
              onChange={(e) => window.location.reload()} // Simplified for demo
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Export Dropdown */}
            {enableExport && (
              <div className="relative">
                <select 
                  className="text-sm border border-gray-300 rounded px-3 py-1"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleExport(e.target.value as 'pdf' | 'excel' | 'csv');
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Export</option>
                  <option value="pdf">Export PDF</option>
                  <option value="excel">Export Excel</option>
                  <option value="csv">Export CSV</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Progress */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Progress</p>
              <p className={`text-2xl font-bold ${getStatusColor(progressMetrics.avgProgress, 'progress')}`}>
                {Math.round(progressMetrics.avgProgress)}%
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-2">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            {progressMetrics.completedMilestones} of {progressMetrics.totalMilestones} completed
          </p>
        </div>

        {/* Velocity */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Velocity</p>
              <p className="text-2xl font-bold text-green-600">
                {progressMetrics.velocityTrend.toFixed(1)}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-2">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">milestones/week</p>
        </div>

        {/* Risk Score */}
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Risk Score</p>
              <p className={`text-2xl font-bold ${getStatusColor(progressMetrics.riskScore, 'risk')}`}>
                {Math.round(progressMetrics.riskScore)}
              </p>
            </div>
            <div className="bg-amber-100 rounded-full p-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2">
            {progressMetrics.overdueMilestones} overdue
          </p>
        </div>

        {/* Estimated Completion */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Est. Completion</p>
              <p className="text-lg font-bold text-purple-600">
                {progressMetrics.estimatedCompletion ? 
                  progressMetrics.estimatedCompletion.toLocaleDateString() : 'N/A'
                }
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-2">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2">based on current velocity</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Progress Trends</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-sm rounded ${chartType === 'line' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm rounded ${chartType === 'bar' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
            >
              Bar
            </button>
          </div>
        </div>

        {/* Simplified Chart Representation */}
        <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Chart visualization would be rendered here</p>
            <p className="text-xs">Showing {trendData.length} data points over {timeRange}</p>
          </div>
        </div>
      </div>

      {/* Team Performance Section */}
      {reportType === 'detailed' && teamPerformance.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
          <div className="space-y-3">
            {teamPerformance.slice(0, 5).map((member) => (
              <div key={member.memberId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.memberName}</p>
                    <p className="text-sm text-gray-600">
                      {member.completedMilestones}/{member.assignedMilestones} milestones
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${getStatusColor(member.efficiency, 'progress')}`}>
                    {Math.round(member.efficiency)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {member.avgCompletionTime.toFixed(1)}d avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Insights */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Strong Progress</p>
              <p className="text-sm text-gray-600">
                {progressMetrics.completedMilestones} milestones completed with {Math.round(progressMetrics.avgProgress)}% average progress
              </p>
            </div>
          </div>
          
          {progressMetrics.overdueMilestones > 0 && (
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Attention Needed</p>
                <p className="text-sm text-gray-600">
                  {progressMetrics.overdueMilestones} milestones are overdue and require immediate attention
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestoneProgressReport;