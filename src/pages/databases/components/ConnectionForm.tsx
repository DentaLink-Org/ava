/**
 * ConnectionForm Component
 * Form for creating and editing database connections
 */

import React, { useState } from 'react';
import { Database, Shield, Server, Key, Save, TestTube } from 'lucide-react';
import { PageTheme } from '@/pages/_shared/runtime/types';

export interface ConnectionConfig {
  name: string;
  type: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  connectionString?: string;
  useConnectionString?: boolean;
}

export interface ConnectionFormProps {
  initialConfig?: Partial<ConnectionConfig>;
  theme: PageTheme;
  onSubmit?: (config: ConnectionConfig) => void;
  onCancel?: () => void;
  onTest?: (config: ConnectionConfig) => Promise<boolean>;
}

const DEFAULT_PORTS = {
  postgresql: 5432,
  mysql: 3306,
  mongodb: 27017,
  sqlite: null
};

export const ConnectionForm: React.FC<ConnectionFormProps> = ({
  initialConfig,
  theme,
  onSubmit,
  onCancel,
  onTest
}) => {
  const [config, setConfig] = useState<Partial<ConnectionConfig>>({
    type: 'postgresql',
    ssl: false,
    useConnectionString: false,
    ...initialConfig
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTypeChange = (type: ConnectionConfig['type']) => {
    setConfig({
      ...config,
      type,
      port: DEFAULT_PORTS[type] || config.port
    });
  };

  const handleTest = async () => {
    if (!onTest) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const success = await onTest(config as ConnectionConfig);
      setTestResult({
        success,
        message: success ? 'Connection successful!' : 'Connection failed. Please check your settings.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.name) {
      alert('Please provide a connection name');
      return;
    }

    if (config.useConnectionString && !config.connectionString) {
      alert('Please provide a connection string');
      return;
    }

    if (!config.useConnectionString && (!config.host || !config.database)) {
      alert('Please provide host and database name');
      return;
    }

    if (onSubmit) {
      onSubmit(config as ConnectionConfig);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="connection-form"
      style={{
        '--primary': theme.colors.primary,
        '--secondary': theme.colors.secondary,
        '--background': theme.colors.background,
        '--surface': theme.colors.surface,
        '--text': theme.colors.text,
        '--text-secondary': theme.colors.textSecondary,
        '--spacing-base': `${theme.spacing.base}px`,
        '--spacing-small': `${theme.spacing.small}px`,
        '--spacing-large': `${theme.spacing.large}px`,
      } as React.CSSProperties}
    >
      <div className="form-header">
        <Database className="form-icon" />
        <h2>Database Connection</h2>
      </div>

      <div className="form-section">
        <label className="form-label">
          Connection Name
          <input
            type="text"
            value={config.name || ''}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            placeholder="My Database"
            className="form-input"
            required
          />
        </label>

        <label className="form-label">
          Database Type
          <select
            value={config.type}
            onChange={(e) => handleTypeChange(e.target.value as ConnectionConfig['type'])}
            className="form-select"
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="mongodb">MongoDB</option>
            <option value="sqlite">SQLite</option>
          </select>
        </label>
      </div>

      <div className="form-section">
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={config.useConnectionString || false}
            onChange={(e) => setConfig({ ...config, useConnectionString: e.target.checked })}
          />
          Use connection string
        </label>

        {config.useConnectionString ? (
          <label className="form-label">
            Connection String
            <input
              type="text"
              value={config.connectionString || ''}
              onChange={(e) => setConfig({ ...config, connectionString: e.target.value })}
              placeholder={`${config.type}://username:password@host:port/database`}
              className="form-input monospace"
            />
          </label>
        ) : (
          <>
            <div className="form-row">
              <label className="form-label flex-1">
                <Server className="label-icon" />
                Host
                <input
                  type="text"
                  value={config.host || ''}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  placeholder="localhost"
                  className="form-input"
                />
              </label>

              {config.type !== 'sqlite' && (
                <label className="form-label" style={{ width: '120px' }}>
                  Port
                  <input
                    type="number"
                    value={config.port || DEFAULT_PORTS[config.type!] || ''}
                    onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
                    placeholder={String(DEFAULT_PORTS[config.type!])}
                    className="form-input"
                  />
                </label>
              )}
            </div>

            <label className="form-label">
              <Database className="label-icon" />
              Database Name
              <input
                type="text"
                value={config.database || ''}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
                placeholder={config.type === 'sqlite' ? 'path/to/database.db' : 'database_name'}
                className="form-input"
              />
            </label>

            {config.type !== 'sqlite' && (
              <>
                <label className="form-label">
                  <Key className="label-icon" />
                  Username
                  <input
                    type="text"
                    value={config.username || ''}
                    onChange={(e) => setConfig({ ...config, username: e.target.value })}
                    placeholder="username"
                    className="form-input"
                  />
                </label>

                <label className="form-label">
                  <Shield className="label-icon" />
                  Password
                  <input
                    type="password"
                    value={config.password || ''}
                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                    placeholder="••••••••"
                    className="form-input"
                  />
                </label>

                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={config.ssl || false}
                    onChange={(e) => setConfig({ ...config, ssl: e.target.checked })}
                  />
                  Use SSL
                </label>
              </>
            )}
          </>
        )}
      </div>

      {testResult && (
        <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
          {testResult.message}
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          onClick={handleTest}
          disabled={isTesting}
          className="btn-test"
        >
          <TestTube className="btn-icon" />
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
        
        <div className="form-buttons">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
          )}
          <button type="submit" className="btn-submit">
            <Save className="btn-icon" />
            Save Connection
          </button>
        </div>
      </div>
    </form>
  );
};