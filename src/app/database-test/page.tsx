'use client';

import React, { useState, useEffect } from 'react';

interface SetupResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

export default function DatabaseTest() {
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'failed'>('testing');

  // Test connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const response = await fetch('/api/database/setup');
      const result = await response.json();
      
      if (result.success) {
        setConnectionStatus('success');
        setSetupResult(result);
      } else {
        setConnectionStatus('failed');
        setSetupResult(result);
      }
    } catch (error) {
      setConnectionStatus('failed');
      setSetupResult({
        success: false,
        message: 'Failed to connect to API',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const runSetup = async (force: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/setup', {
        method: force ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      setSetupResult(result);
      
      if (result.success) {
        setConnectionStatus('success');
      }
    } catch (error) {
      setSetupResult({
        success: false,
        message: 'Setup request failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'testing': return '#f59e0b';
      case 'success': return '#10b981';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'testing': return 'Testing Connection...';
      case 'success': return 'Connected ✅';
      case 'failed': return 'Connection Failed ❌';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{ 
      padding: '32px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          marginBottom: '8px',
          color: '#1e293b'
        }}>
          AVA Database Setup
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#64748b',
          marginBottom: '24px'
        }}>
          Test and configure your Supabase database connection
        </p>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 24px',
          backgroundColor: '#f8fafc',
          border: `2px solid ${getStatusColor(connectionStatus)}`,
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(connectionStatus)
          }} />
          {getStatusText(connectionStatus)}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <button
          onClick={() => runSetup(false)}
          disabled={isLoading}
          style={{
            padding: '16px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {isLoading ? 'Setting up...' : 'Run Database Setup'}
        </button>
        
        <button
          onClick={() => runSetup(true)}
          disabled={isLoading}
          style={{
            padding: '16px 24px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {isLoading ? 'Resetting...' : 'Force Reset & Setup'}
        </button>
        
        <button
          onClick={testConnection}
          disabled={isLoading}
          style={{
            padding: '16px 24px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          Test Connection
        </button>
      </div>

      {setupResult && (
        <div style={{
          backgroundColor: setupResult.success ? '#f0fdf4' : '#fef2f2',
          border: `2px solid ${setupResult.success ? '#10b981' : '#ef4444'}`,
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '16px',
            color: setupResult.success ? '#059669' : '#dc2626'
          }}>
            {setupResult.success ? '✅ Success' : '❌ Error'}
          </h3>
          
          <p style={{ 
            fontSize: '16px', 
            marginBottom: '16px',
            color: setupResult.success ? '#065f46' : '#991b1b'
          }}>
            {setupResult.message}
          </p>

          {setupResult.error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#dc2626' }}>
                Error Details:
              </h4>
              <pre style={{ 
                fontSize: '12px', 
                fontFamily: 'monospace',
                color: '#991b1b',
                whiteSpace: 'pre-wrap',
                margin: 0
              }}>
                {setupResult.error}
              </pre>
            </div>
          )}

          {setupResult.details && (
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                Setup Details:
              </h4>
              
              {setupResult.details.steps && (
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Steps Completed:
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {setupResult.details.steps.map((step: string, index: number) => (
                      <li key={index} style={{ fontSize: '14px', marginBottom: '4px' }}>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {setupResult.details.summary && (
                <div style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e40af' }}>
                    Database Summary:
                  </h5>
                  <div style={{ fontSize: '14px', color: '#1e40af' }}>
                    <div>📊 Themes: {setupResult.details.summary.themes}</div>
                    <div>📋 Tasks: {setupResult.details.summary.tasks}</div>
                    <div>🔗 URL: {setupResult.details.summary.url}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{
        marginTop: '32px',
        padding: '24px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Environment Variables
        </h3>
        <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#4b5563' }}>
          <div>🔐 Using Vercel Supabase Integration</div>
          <div>📡 AVA_NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_AVA_NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</div>
          <div>🔑 AVA_NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_AVA_NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</div>
        </div>
      </div>

      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <p>
          🚀 After successful setup, navigate to{' '}
          <a href="/themes" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            /themes
          </a>{' '}
          to test the application
        </p>
      </div>
    </div>
  );
}