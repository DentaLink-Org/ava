/**
 * ConnectionStatus Component
 * Displays database connection status and health
 */

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Server } from 'lucide-react';
import { PageTheme } from '@/pages/_shared/runtime/types';

export interface ConnectionStatusProps {
  theme: PageTheme;
  showDetails?: boolean;
  refreshInterval?: number;
  onRefresh?: () => Promise<ConnectionHealth>;
}

interface ConnectionHealth {
  connected: boolean;
  latency?: number;
  database?: string;
  version?: string;
  lastChecked: Date;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  theme,
  showDetails = false,
  refreshInterval = 30,
  onRefresh
}) => {
  const [health, setHealth] = useState<ConnectionHealth>({
    connected: true,
    latency: 23,
    database: 'supabase',
    version: '14.5',
    lastChecked: new Date()
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkConnection = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        const newHealth = await onRefresh();
        setHealth(newHealth);
      } else {
        // Mock refresh for demonstration
        setHealth({
          ...health,
          latency: Math.floor(Math.random() * 50) + 10,
          lastChecked: new Date()
        });
      }
    } catch (error) {
      setHealth({
        connected: false,
        lastChecked: new Date()
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(checkConnection, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  return (
    <div 
      className="connection-status"
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
      <div className="status-header">
        <h3 className="status-title">Connection Status</h3>
        <button
          onClick={checkConnection}
          disabled={isRefreshing}
          className="refresh-btn"
          title="Refresh connection status"
        >
          <RefreshCw className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`} />
        </button>
      </div>

      <div className={`status-indicator ${health.connected ? 'connected' : 'disconnected'}`}>
        {health.connected ? (
          <>
            <Wifi className="status-icon" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="status-icon" />
            <span>Disconnected</span>
          </>
        )}
      </div>

      {showDetails && health.connected && (
        <div className="status-details">
          <div className="detail-item">
            <Server className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Database</span>
              <span className="detail-value">{health.database || 'Unknown'}</span>
            </div>
          </div>
          
          {health.latency !== undefined && (
            <div className="detail-item">
              <span className="detail-label">Latency</span>
              <span className="detail-value">{health.latency}ms</span>
            </div>
          )}
          
          {health.version && (
            <div className="detail-item">
              <span className="detail-label">Version</span>
              <span className="detail-value">{health.version}</span>
            </div>
          )}
        </div>
      )}

      <div className="last-checked">
        Last checked: {health.lastChecked.toLocaleTimeString()}
      </div>
    </div>
  );
};