import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, Clock, AlertCircle } from 'lucide-react';
import { useMilestoneProgress } from '../../milestones';

interface MilestoneProgressTrackerProps {
  milestoneId?: string;
}

export const MilestoneProgressTracker: React.FC<MilestoneProgressTrackerProps> = ({ 
  milestoneId = 'milestone-1' 
}) => {
  const { 
    currentProgress, 
    trend, 
    recentProgress, 
    progressStats,
    loading, 
    error,
    updateProgress,
    isComplete,
    isOverdue 
  } = useMilestoneProgress({ milestoneId });

  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuickUpdate = async (increment: number) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const newProgress = Math.max(0, Math.min(100, currentProgress + increment));
      await updateProgress(milestoneId, newProgress, `Quick update: ${increment > 0 ? '+' : ''}${increment}%`);
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getTrendIcon = (trendType: string) => {
    switch (trendType) {
      case 'increasing': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'decreasing': return <TrendingDown className="h-5 w-5 text-red-600" />;
      default: return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendColor = (trendType: string) => {
    switch (trendType) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600">
          <h3 className="font-semibold mb-2">Error Loading Progress</h3>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Progress Tracker</h2>
          <div className="flex items-center space-x-2">
            {isComplete && (
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Complete
              </span>
            )}
            {isOverdue && (
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                <AlertCircle className="h-3 w-3 mr-1" />
                At Risk
              </span>
            )}
          </div>
        </div>

        {/* Main Progress Display */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - currentProgress / 100)}`}
                className={`transition-all duration-500 ${
                  isComplete ? 'text-green-600' : 'text-blue-600'
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{currentProgress}%</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Current Progress</h3>
            {trend && (
              <div className="flex items-center justify-center space-x-2">
                {getTrendIcon(trend.trend)}
                <span className={`text-sm font-medium ${getTrendColor(trend.trend)}`}>
                  {trend.velocity > 0 ? '+' : ''}{trend.velocity}% per day
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center space-x-2 mb-6">
          <button
            onClick={() => handleQuickUpdate(-10)}
            disabled={isUpdating || currentProgress <= 0}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            -10%
          </button>
          <button
            onClick={() => handleQuickUpdate(-5)}
            disabled={isUpdating || currentProgress <= 0}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            -5%
          </button>
          <button
            onClick={() => handleQuickUpdate(5)}
            disabled={isUpdating || currentProgress >= 100}
            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
          >
            +5%
          </button>
          <button
            onClick={() => handleQuickUpdate(10)}
            disabled={isUpdating || currentProgress >= 100}
            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
          >
            +10%
          </button>
        </div>

        {/* Progress Stats */}
        {progressStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">Weekly Change</p>
              <p className={`text-lg font-semibold ${
                progressStats.weeklyVelocity >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {progressStats.weeklyVelocity > 0 ? '+' : ''}{progressStats.weeklyVelocity}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Average</p>
              <p className="text-lg font-semibold text-gray-900">{progressStats.average}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Best Day</p>
              <p className="text-lg font-semibold text-gray-900">{progressStats.max}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Records</p>
              <p className="text-lg font-semibold text-gray-900">{progressStats.totalRecords}</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Progress History */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Progress</h3>
        </div>

        {recentProgress.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No progress history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProgress.map((record) => (
              <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {record.progressPercentage}% complete
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(record.recordedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {record.notes && (
                    <p className="text-xs text-gray-600 mt-1">{record.notes}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {record.completedTasks}/{record.totalTasks} tasks completed
                  </div>
                </div>
                <div className="ml-4 w-24">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${record.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trend Analysis */}
      {trend && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getTrendIcon(trend.trend)}
              </div>
              <p className="text-sm text-gray-600">Trend</p>
              <p className={`font-semibold ${getTrendColor(trend.trend)}`}>
                {trend.trend.charAt(0).toUpperCase() + trend.trend.slice(1)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Estimated Completion</p>
              <p className="font-semibold text-gray-900">
                {trend.estimatedCompletion === 'unknown' || trend.estimatedCompletion === 'insufficient-data' 
                  ? 'Unknown' 
                  : new Date(trend.estimatedCompletion).toLocaleDateString()
                }
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Confidence</p>
              <p className="font-semibold text-gray-900">{trend.confidence}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};