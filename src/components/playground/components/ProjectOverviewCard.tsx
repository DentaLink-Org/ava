import React, { useState } from 'react';
import { Calendar, Users, CheckCircle2, Clock, AlertCircle, TrendingUp, TrendingDown, Minus, MoreVertical, ExternalLink, Star, Activity } from 'lucide-react';

interface ProjectMetrics {
  completedTasks: number;
  totalTasks: number;
  onSchedule: boolean;
  teamSize: number;
  budget: {
    spent: number;
    total: number;
  };
  healthScore: number;
  lastUpdated: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'on_track' | 'at_risk' | 'delayed' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string;
  progress: number;
  manager: string;
  metrics: ProjectMetrics;
  tags: string[];
  isFavorite?: boolean;
}

export default function ProjectOverviewCard() {
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'E-commerce Platform Redesign',
      description: 'Complete overhaul of the customer-facing e-commerce platform with modern UI/UX',
      status: 'on_track',
      priority: 'high',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      progress: 65,
      manager: 'Sarah Johnson',
      metrics: {
        completedTasks: 45,
        totalTasks: 68,
        onSchedule: true,
        teamSize: 12,
        budget: {
          spent: 125000,
          total: 200000
        },
        healthScore: 85,
        lastUpdated: '2 hours ago'
      },
      tags: ['frontend', 'ux', 'customer-facing'],
      isFavorite: true
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Native iOS and Android apps for the main product offering',
      status: 'at_risk',
      priority: 'critical',
      startDate: '2024-02-01',
      endDate: '2024-05-15',
      progress: 40,
      manager: 'Mike Chen',
      metrics: {
        completedTasks: 28,
        totalTasks: 70,
        onSchedule: false,
        teamSize: 8,
        budget: {
          spent: 95000,
          total: 150000
        },
        healthScore: 60,
        lastUpdated: '5 hours ago'
      },
      tags: ['mobile', 'ios', 'android']
    },
    {
      id: '3',
      name: 'Data Analytics Dashboard',
      description: 'Real-time analytics dashboard for business intelligence',
      status: 'on_track',
      priority: 'medium',
      startDate: '2024-01-20',
      endDate: '2024-04-30',
      progress: 80,
      manager: 'Emily Davis',
      metrics: {
        completedTasks: 52,
        totalTasks: 65,
        onSchedule: true,
        teamSize: 6,
        budget: {
          spent: 70000,
          total: 100000
        },
        healthScore: 90,
        lastUpdated: '1 hour ago'
      },
      tags: ['analytics', 'dashboard', 'data']
    },
    {
      id: '4',
      name: 'Security Infrastructure Upgrade',
      description: 'Comprehensive security overhaul including new authentication system',
      status: 'delayed',
      priority: 'critical',
      startDate: '2024-01-10',
      endDate: '2024-03-31',
      progress: 35,
      manager: 'David Wilson',
      metrics: {
        completedTasks: 18,
        totalTasks: 50,
        onSchedule: false,
        teamSize: 5,
        budget: {
          spent: 60000,
          total: 80000
        },
        healthScore: 45,
        lastUpdated: '30 minutes ago'
      },
      tags: ['security', 'infrastructure', 'backend']
    }
  ]);

  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'on_track':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'at_risk':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'delayed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case 'on_track':
        return 'On Track';
      case 'at_risk':
        return 'At Risk';
      case 'delayed':
        return 'Delayed';
      case 'completed':
        return 'Completed';
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'delayed':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-gray-400';
    }
  };

  const getHealthTrend = (score: number) => {
    if (score >= 80) return { icon: TrendingUp, color: 'text-green-500' };
    if (score >= 60) return { icon: Minus, color: 'text-yellow-500' };
    return { icon: TrendingDown, color: 'text-red-500' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
        <p className="text-gray-600 mt-1">Quick overview of all active projects</p>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => {
          const healthTrend = getHealthTrend(project.metrics.healthScore);
          const HealthIcon = healthTrend.icon;
          const daysLeft = calculateDaysLeft(project.endDate);
          const isExpanded = expandedCard === project.id;

          return (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      {project.isFavorite && (
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      )}
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`} />
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    {getStatusLabel(project.status)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {project.metrics.lastUpdated}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-semibold text-gray-900">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Tasks</span>
                      <CheckCircle2 className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {project.metrics.completedTasks}/{project.metrics.totalTasks}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((project.metrics.completedTasks / project.metrics.totalTasks) * 100)}% complete
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Budget</span>
                      <Activity className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {Math.round((project.metrics.budget.spent / project.metrics.budget.total) * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(project.metrics.budget.spent)} used
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{project.metrics.teamSize} members</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Health</span>
                    <div className="flex items-center gap-1">
                      <HealthIcon className={`w-4 h-4 ${healthTrend.color}`} />
                      <span className="font-semibold text-gray-900">{project.metrics.healthScore}</span>
                    </div>
                  </div>
                </div>

                {/* Expandable Details */}
                <button
                  onClick={() => setExpandedCard(isExpanded ? null : project.id)}
                  className="mt-4 w-full text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1"
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Project Manager</span>
                      <span className="font-medium text-gray-900">{project.manager}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium text-gray-900">
                        {project.startDate} - {project.endDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(project.metrics.budget.spent)} / {formatCurrency(project.metrics.budget.total)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
                    View Details
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Update Status
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Open Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}