/**
 * RecentActivity Component
 * Shows recent database activity and operations
 */

import React from 'react';
import { Clock, Database, Plus, Edit, Trash2, Table } from 'lucide-react';
import { PageTheme } from '@/pages/_shared/runtime/types';

export interface Activity {
  id: string;
  type: 'create' | 'update' | 'delete' | 'schema_change';
  target: string;
  targetType: 'database' | 'table' | 'column';
  timestamp: Date;
  user?: string;
}

export interface RecentActivityProps {
  theme: PageTheme;
  activities?: Activity[];
  limit?: number;
  showTimestamps?: boolean;
}

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  schema_change: Table
};

const targetIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  database: Database,
  table: Table,
  column: Table
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  theme,
  activities = [
    {
      id: '1',
      type: 'create',
      target: 'users',
      targetType: 'table',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      user: 'admin'
    },
    {
      id: '2',
      type: 'update',
      target: 'products',
      targetType: 'database',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      user: 'admin'
    },
    {
      id: '3',
      type: 'schema_change',
      target: 'orders',
      targetType: 'table',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      user: 'admin'
    }
  ],
  limit = 5,
  showTimestamps = true
}) => {
  const recentActivities = activities.slice(0, limit);

  const getActivityDescription = (activity: Activity): string => {
    const action = activity.type.replace('_', ' ');
    return `${action} ${activity.targetType} "${activity.target}"`;
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div 
      className="recent-activity"
      style={{
        '--primary': theme.colors.primary,
        '--secondary': theme.colors.secondary,
        '--surface': theme.colors.surface,
        '--text': theme.colors.text,
        '--text-secondary': theme.colors.textSecondary,
        '--spacing-base': `${theme.spacing.base}px`,
        '--spacing-small': `${theme.spacing.small}px`,
      } as React.CSSProperties}
    >
      <h3 className="activity-title">Recent Activity</h3>
      
      {recentActivities.length === 0 ? (
        <div className="no-activity">
          <Clock className="no-activity-icon" />
          <p>No recent activity</p>
        </div>
      ) : (
        <div className="activity-list">
          {recentActivities.map((activity) => {
            const ActivityIcon = activityIcons[activity.type] || Clock;
            const TargetIcon = targetIcons[activity.targetType] || Database;
            
            return (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon-wrapper">
                  <ActivityIcon className={`activity-icon ${activity.type}`} />
                </div>
                
                <div className="activity-content">
                  <div className="activity-description">
                    <TargetIcon className="target-icon" />
                    <span>{getActivityDescription(activity)}</span>
                  </div>
                  
                  <div className="activity-meta">
                    {activity.user && (
                      <span className="activity-user">by {activity.user}</span>
                    )}
                    {showTimestamps && (
                      <span className="activity-time">
                        {getRelativeTime(activity.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};