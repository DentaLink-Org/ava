'use client';

import React, { useState, useMemo } from 'react';
import { 
  TrendingDown,
  BarChart3,
  Calendar,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertTriangle
} from 'lucide-react';

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
  velocity?: number;
}

const TaskBurndownChart: React.FC<TaskBurndownChartProps> = ({
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
  refreshInterval = 60000
}) => {
  // Mock data for demonstration
  const mockBurndownData: BurndownDataPoint[] = useMemo(() => [
    { date: '2025-07-01', totalTasks: 50, completedTasks: 0, remainingTasks: 50, idealRemaining: 50, velocity: 0 },
    { date: '2025-07-02', totalTasks: 50, completedTasks: 5, remainingTasks: 45, idealRemaining: 46, velocity: 5 },
    { date: '2025-07-03', totalTasks: 50, completedTasks: 12, remainingTasks: 38, idealRemaining: 42, velocity: 7 },
    { date: '2025-07-04', totalTasks: 50, completedTasks: 18, remainingTasks: 32, idealRemaining: 38, velocity: 6 },
    { date: '2025-07-05', totalTasks: 50, completedTasks: 25, remainingTasks: 25, idealRemaining: 34, velocity: 7 },
    { date: '2025-07-06', totalTasks: 50, completedTasks: 30, remainingTasks: 20, idealRemaining: 30, velocity: 5 },
    { date: '2025-07-07', totalTasks: 50, completedTasks: 38, remainingTasks: 12, idealRemaining: 26, velocity: 8 }
  ], []);

  const metrics = useMemo(() => {
    const lastPoint = mockBurndownData[mockBurndownData.length - 1];
    const firstPoint = mockBurndownData[0];
    const totalVelocity = mockBurndownData.reduce((sum, point) => sum + (point.velocity || 0), 0);
    const avgVelocity = totalVelocity / mockBurndownData.length;
    const progress = ((lastPoint.completedTasks / lastPoint.totalTasks) * 100);
    
    return {
      totalTasks: lastPoint.totalTasks,
      completedTasks: lastPoint.completedTasks,
      remainingTasks: lastPoint.remainingTasks,
      avgVelocity: avgVelocity.toFixed(1),
      progress: progress.toFixed(0),
      burnRate: (firstPoint.remainingTasks - lastPoint.remainingTasks) / mockBurndownData.length
    };
  }, [mockBurndownData]);

  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowUp className="w-3 h-3 text-green-500" />;
    } else if (current < previous) {
      return <ArrowDown className="w-3 h-3 text-red-500" />;
    }
    return <Minus className="w-3 h-3 text-gray-500" />;
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm" style={{ height }}>
      {/* Header */}
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
            <div className="flex items-center text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Demo Mode
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="border-b bg-gray-50 p-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{metrics.remainingTasks}</div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.completedTasks}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{metrics.avgVelocity}</span>
              {getTrendIndicator(7, 5)}
            </div>
            <div className="text-sm text-gray-600">Avg Velocity</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.progress}%</div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.burnRate.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Burn Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900">Jul 15, 2025</div>
            <div className="text-sm text-gray-600">Forecast</div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-4">
        <div 
          className="w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
          style={{ height: height - 200 }}
        >
          <div className="text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-medium mb-2">Burndown Chart Visualization</h4>
            <p className="text-sm mb-4">
              Displaying {chartType} chart for {timeframe} with {mockBurndownData.length} data points
            </p>
            
            {/* Mock chart legend */}
            <div className="flex items-center justify-center space-x-6 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-3 bg-red-500 rounded mr-2"></div>
                <span>Actual ({metrics.remainingTasks} remaining)</span>
              </div>
              {showIdealLine && (
                <div className="flex items-center">
                  <div className="w-4 h-1 border-t-2 border-dashed border-gray-500 mr-2"></div>
                  <span>Ideal Line</span>
                </div>
              )}
              <div className="flex items-center">
                <div className="w-4 h-3 bg-green-500 rounded mr-2"></div>
                <span>Completed ({metrics.completedTasks})</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-400">
              <p>This is a placeholder for the actual chart visualization.</p>
              <p>In production, this would render with Chart.js, D3, or similar library.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 p-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>{mockBurndownData.length} data points</span>
            <span>•</span>
            <span>Updated: {new Date().toLocaleTimeString()}</span>
            <span>•</span>
            <span className="text-blue-600">Demo data</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Jul 1 - Jul 7, 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskBurndownChart;