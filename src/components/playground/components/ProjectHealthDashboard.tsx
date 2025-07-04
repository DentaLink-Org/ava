import React, { useState, useMemo } from 'react';
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Target,
  DollarSign,
  Calendar,
  Zap,
  Shield,
  BarChart3,
  PieChart,
  Settings,
  RefreshCw,
  Download,
  Bell,
  ChevronRight,
  Info
} from 'lucide-react';
import { useMilestoneData } from '../../milestones';
import type { Milestone, MilestoneStatus } from '../../milestones/types';

interface ProjectHealthDashboardProps {
  projectId?: string;
  showAlerts?: boolean;
  showTrends?: boolean;
  showTeamMetrics?: boolean;
  showBudgetMetrics?: boolean;
  enableRealtime?: boolean;
  enableNotifications?: boolean;
  refreshInterval?: number; // in seconds
  alertThresholds?: {
    riskScore: number;
    velocityMin: number;
    budgetThreshold: number;
  };
  onAlert?: (alert: HealthAlert) => void;
  onDrillDown?: (metric: string, data: any) => void;
  className?: string;
}

interface HealthMetrics {
  overallHealth: number; // 0-100 score
  onTimeDelivery: number; // percentage
  budgetHealth: number; // percentage
  teamEfficiency: number; // percentage
  riskLevel: 'low' | 'medium' | 'high';
  qualityScore: number; // 0-100
  stakeholderSatisfaction: number; // 0-100
  velocityTrend: 'increasing' | 'stable' | 'decreasing';
}

interface HealthAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  actionRequired: boolean;
  relatedMilestone?: string;
}

interface KPIWidget {
  id: string;
  title: string;
  value: number | string;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
  unit?: string;
  target?: number;
  status: 'good' | 'warning' | 'critical';
}

export const ProjectHealthDashboard: React.FC<ProjectHealthDashboardProps> = ({
  projectId = 'project-1',
  showAlerts = true,
  showTrends = true,
  showTeamMetrics = true,
  showBudgetMetrics = true,
  enableRealtime = true,
  enableNotifications = true,
  refreshInterval = 30,
  alertThresholds = {
    riskScore: 70,
    velocityMin: 0.5,
    budgetThreshold: 90
  },
  onAlert,
  onDrillDown,
  className = ''
}) => {
  const { milestones, loading, error } = useMilestoneData({ 
    projectId,
    enableRealtime 
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Calculate health metrics
  const healthMetrics = useMemo((): HealthMetrics => {
    const now = new Date();
    const activeMilestones = milestones.filter(m => !m.isArchived);
    const completedMilestones = activeMilestones.filter(m => m.status === 'completed');
    const overdueMilestones = activeMilestones.filter(m => 
      m.dueDate && new Date(m.dueDate) < now && m.status !== 'completed'
    );

    // Overall health calculation (weighted score)
    const completionRate = activeMilestones.length > 0 ? completedMilestones.length / activeMilestones.length : 1;
    const overdueRate = activeMilestones.length > 0 ? overdueMilestones.length / activeMilestones.length : 0;
    const avgProgress = activeMilestones.length > 0 ? 
      activeMilestones.reduce((sum, m) => sum + m.progress, 0) / activeMilestones.length : 100;
    
    const overallHealth = Math.round(
      (completionRate * 40) + // 40% weight on completion
      ((100 - overdueRate * 100) * 0.3) + // 30% weight on avoiding overdue
      (avgProgress * 0.3) // 30% weight on progress
    );

    // On-time delivery calculation
    const onTimeDelivery = completedMilestones.length > 0 ? 
      (completedMilestones.filter(m => 
        !m.dueDate || !m.completedAt || new Date(m.completedAt) <= new Date(m.dueDate)
      ).length / completedMilestones.length) * 100 : 100;

    // Mock calculations for demo purposes
    const budgetHealth = 85; // Would be calculated from actual budget data
    const teamEfficiency = Math.round(completionRate * 100);
    const qualityScore = 92; // Would be calculated from quality metrics
    const stakeholderSatisfaction = 88; // Would come from feedback data

    // Risk level determination
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (overdueRate > 0.3 || overallHealth < 60) riskLevel = 'high';
    else if (overdueRate > 0.15 || overallHealth < 80) riskLevel = 'medium';

    // Velocity trend (mock calculation)
    const velocityTrend: 'increasing' | 'stable' | 'decreasing' = 
      completionRate > 0.8 ? 'increasing' : completionRate > 0.6 ? 'stable' : 'decreasing';

    return {
      overallHealth,
      onTimeDelivery,
      budgetHealth,
      teamEfficiency,
      riskLevel,
      qualityScore,
      stakeholderSatisfaction,
      velocityTrend
    };
  }, [milestones]);

  // Generate health alerts
  const healthAlerts = useMemo((): HealthAlert[] => {
    const alerts: HealthAlert[] = [];
    const now = new Date();

    // Check for overdue milestones
    const overdueMilestones = milestones.filter(m => 
      m.dueDate && new Date(m.dueDate) < now && m.status !== 'completed'
    );

    if (overdueMilestones.length > 0) {
      alerts.push({
        id: `overdue-${overdueMilestones.length}`,
        type: 'critical',
        title: 'Overdue Milestones',
        message: `${overdueMilestones.length} milestone(s) are past due and require immediate attention`,
        timestamp: now,
        actionRequired: true
      });
    }

    // Check velocity
    const completedLastWeek = milestones.filter(m => 
      m.status === 'completed' && m.completedAt &&
      new Date(m.completedAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    if (completedLastWeek < alertThresholds.velocityMin) {
      alerts.push({
        id: 'low-velocity',
        type: 'warning',
        title: 'Low Velocity Alert',
        message: 'Milestone completion velocity is below target. Consider reviewing resource allocation.',
        timestamp: now,
        actionRequired: true
      });
    }

    // Check budget health
    if (showBudgetMetrics && healthMetrics.budgetHealth > alertThresholds.budgetThreshold) {
      alerts.push({
        id: 'budget-warning',
        type: 'warning',
        title: 'Budget Alert',
        message: `Project is at ${healthMetrics.budgetHealth}% of budget. Review spending.`,
        timestamp: now,
        actionRequired: true
      });
    }

    // Check overall health
    if (healthMetrics.overallHealth < alertThresholds.riskScore) {
      alerts.push({
        id: 'health-critical',
        type: 'critical',
        title: 'Project Health Critical',
        message: 'Overall project health is below acceptable threshold. Immediate intervention required.',
        timestamp: now,
        actionRequired: true
      });
    }

    return alerts.filter(alert => !dismissedAlerts.has(alert.id));
  }, [milestones, healthMetrics, alertThresholds, dismissedAlerts, showBudgetMetrics]);

  // Configure KPI widgets
  const kpiWidgets = useMemo((): KPIWidget[] => [
    {
      id: 'overall-health',
      title: 'Overall Health',
      value: healthMetrics.overallHealth,
      icon: Activity,
      color: 'blue',
      unit: '%',
      target: 85,
      status: healthMetrics.overallHealth >= 85 ? 'good' : healthMetrics.overallHealth >= 70 ? 'warning' : 'critical',
      trend: 5,
      trendDirection: 'up'
    },
    {
      id: 'on-time-delivery',
      title: 'On-Time Delivery',
      value: Math.round(healthMetrics.onTimeDelivery),
      icon: Target,
      color: 'green',
      unit: '%',
      target: 90,
      status: healthMetrics.onTimeDelivery >= 90 ? 'good' : healthMetrics.onTimeDelivery >= 75 ? 'warning' : 'critical',
      trend: 2,
      trendDirection: 'up'
    },
    {
      id: 'team-efficiency',
      title: 'Team Efficiency',
      value: healthMetrics.teamEfficiency,
      icon: Users,
      color: 'purple',
      unit: '%',
      target: 80,
      status: healthMetrics.teamEfficiency >= 80 ? 'good' : healthMetrics.teamEfficiency >= 65 ? 'warning' : 'critical',
      trend: -1,
      trendDirection: 'down'
    },
    ...(showBudgetMetrics ? [{
      id: 'budget-health',
      title: 'Budget Health',
      value: healthMetrics.budgetHealth,
      icon: DollarSign,
      color: 'amber',
      unit: '%',
      target: 100,
      status: (healthMetrics.budgetHealth <= 90 ? 'good' : healthMetrics.budgetHealth <= 95 ? 'warning' : 'critical') as 'good' | 'warning' | 'critical',
      trend: 3,
      trendDirection: 'up' as const
    }] : []),
    {
      id: 'quality-score',
      title: 'Quality Score',
      value: healthMetrics.qualityScore,
      icon: Shield,
      color: 'indigo',
      unit: '%',
      target: 95,
      status: (healthMetrics.qualityScore >= 90 ? 'good' : healthMetrics.qualityScore >= 80 ? 'warning' : 'critical') as 'good' | 'warning' | 'critical',
      trend: 1,
      trendDirection: 'stable'
    },
    {
      id: 'stakeholder-satisfaction',
      title: 'Stakeholder Satisfaction',
      value: healthMetrics.stakeholderSatisfaction,
      icon: CheckCircle,
      color: 'emerald',
      unit: '%',
      target: 85,
      status: (healthMetrics.stakeholderSatisfaction >= 85 ? 'good' : healthMetrics.stakeholderSatisfaction >= 70 ? 'warning' : 'critical') as 'good' | 'warning' | 'critical',
      trend: 4,
      trendDirection: 'up'
    }
  ], [healthMetrics, showBudgetMetrics]);

  // Get status colors
  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getAlertColor = (type: 'info' | 'warning' | 'critical') => {
    switch (type) {
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'warning': return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'critical': return 'border-red-200 bg-red-50 text-red-800';
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Handle alert dismissal
  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set(Array.from(prev).concat(alertId)));
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
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
          <h3 className="font-semibold mb-2">Error Loading Project Health Dashboard</h3>
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
            <h2 className="text-xl font-semibold text-gray-900">Project Health Dashboard</h2>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              healthMetrics.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
              healthMetrics.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800' :
              'bg-red-100 text-red-800'
            }`}>
              <Activity className="w-4 h-4 mr-1" />
              {healthMetrics.riskLevel.toUpperCase()} RISK
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Time Range Selector */}
            <select 
              className="text-sm border border-gray-300 rounded px-3 py-1"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded"
              title="Dashboard Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {showAlerts && healthAlerts.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Active Alerts ({healthAlerts.length})
          </h3>
          <div className="space-y-3">
            {healthAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm mt-1">{alert.message}</p>
                    <p className="text-xs mt-2 opacity-75">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {alert.actionRequired && (
                      <button
                        onClick={() => onDrillDown?.(alert.type, alert)}
                        className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75"
                      >
                        Action
                      </button>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Widgets */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiWidgets.map((widget) => (
            <div
              key={widget.id}
              className={`rounded-lg border p-4 cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(widget.status)}`}
              onClick={() => onDrillDown?.(widget.id, widget)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <widget.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{widget.title}</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">
                      {widget.value}{widget.unit}
                    </span>
                    {widget.target && (
                      <span className="text-sm opacity-60">
                        / {widget.target}{widget.unit}
                      </span>
                    )}
                  </div>
                  {showTrends && widget.trend !== undefined && (
                    <div className="flex items-center space-x-1 mt-1">
                      {widget.trendDirection === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                      {widget.trendDirection === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                      {widget.trendDirection === 'stable' && <div className="w-3 h-px bg-gray-400" />}
                      <span className="text-xs opacity-60">
                        {widget.trend > 0 ? '+' : ''}{widget.trend}% vs last period
                      </span>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Insights */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Strengths
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {healthMetrics.onTimeDelivery >= 90 && (
                <li>• Excellent on-time delivery performance</li>
              )}
              {healthMetrics.qualityScore >= 90 && (
                <li>• High quality standards maintained</li>
              )}
              {healthMetrics.stakeholderSatisfaction >= 85 && (
                <li>• Strong stakeholder satisfaction</li>
              )}
              {healthMetrics.velocityTrend === 'increasing' && (
                <li>• Positive velocity trend</li>
              )}
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
              Areas for Improvement
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {healthMetrics.overallHealth < 80 && (
                <li>• Overall project health needs attention</li>
              )}
              {healthMetrics.teamEfficiency < 80 && (
                <li>• Team efficiency could be improved</li>
              )}
              {healthMetrics.riskLevel !== 'low' && (
                <li>• Risk mitigation strategies needed</li>
              )}
              {healthMetrics.velocityTrend === 'decreasing' && (
                <li>• Velocity declining, review blockers</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHealthDashboard;