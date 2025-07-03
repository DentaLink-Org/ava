/**
 * DatabaseStats Component
 * Displays database statistics and metrics
 */

import React from 'react';
import { Database, Table, FileText, TrendingUp } from 'lucide-react';
import { PageTheme } from "@/components/_shared/runtime/types";

export interface DatabaseStatsProps {
  theme: PageTheme;
  metrics?: string[];
  stats?: {
    totalDatabases?: number;
    totalTables?: number;
    totalRecords?: number;
    storageUsed?: string;
    activeConnections?: number;
  };
}

const metricIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  totalDatabases: Database,
  totalTables: Table,
  totalRecords: FileText,
  growth: TrendingUp
};

const metricLabels: Record<string, string> = {
  totalDatabases: 'Databases',
  totalTables: 'Tables',
  totalRecords: 'Records',
  storageUsed: 'Storage',
  activeConnections: 'Connections'
};

export const DatabaseStats: React.FC<DatabaseStatsProps> = ({
  theme,
  metrics = ['totalDatabases', 'totalTables', 'totalRecords'],
  stats = {
    totalDatabases: 5,
    totalTables: 27,
    totalRecords: 152847,
    storageUsed: '2.4 GB',
    activeConnections: 3
  }
}) => {
  const formatValue = (metric: string, value: any): string => {
    if (typeof value === 'number' && metric === 'totalRecords') {
      return value.toLocaleString();
    }
    return String(value || 0);
  };

  return (
    <div 
      className="database-stats"
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
      <h3 className="stats-title">Database Statistics</h3>
      
      <div className="stats-grid">
        {metrics.map((metric) => {
          const Icon = metricIcons[metric] || Database;
          const value = stats[metric as keyof typeof stats];
          const label = metricLabels[metric] || metric;
          
          return (
            <div key={metric} className="stat-item">
              <Icon className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{formatValue(metric, value)}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};