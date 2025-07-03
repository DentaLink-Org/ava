'use client';

import React, { useState, useEffect } from 'react';

interface HealthData {
  message: string;
  status: string;
  environment?: any;
  availableEndpoints?: string[];
  error?: string;
}

export default function DebugPage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseSetup = async () => {
    try {
      const response = await fetch('/api/database/setup');
      const data = await response.json();
      alert(JSON.stringify(data, null, 2));
    } catch (err) {
      alert('Database setup failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Loading debug info...</h1>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ marginBottom: '20px' }}>🔧 AVA Debug Panel</h1>
      
      <div style={{ 
        marginBottom: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        <button 
          onClick={checkHealth}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Refresh Health Check
        </button>
        
        <button 
          onClick={testDatabaseSetup}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Database Setup
        </button>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '5px',
          marginBottom: '20px',
          color: '#dc2626'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {healthData && (
        <div style={{
          backgroundColor: healthData.status === 'healthy' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${healthData.status === 'healthy' ? '#bbf7d0' : '#fca5a5'}`,
          borderRadius: '5px',
          padding: '20px'
        }}>
          <h2 style={{ 
            color: healthData.status === 'healthy' ? '#059669' : '#dc2626',
            marginTop: 0 
          }}>
            Status: {healthData.status === 'healthy' ? '✅ HEALTHY' : '❌ UNHEALTHY'}
          </h2>
          
          <h3>Message:</h3>
          <p>{healthData.message}</p>

          {healthData.error && (
            <div>
              <h3>Error:</h3>
              <pre style={{ 
                backgroundColor: '#f3f4f6',
                padding: '10px',
                borderRadius: '3px',
                overflow: 'auto'
              }}>
                {healthData.error}
              </pre>
            </div>
          )}

          {healthData.environment && (
            <div>
              <h3>Environment Info:</h3>
              <pre style={{ 
                backgroundColor: '#f3f4f6',
                padding: '15px',
                borderRadius: '5px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {JSON.stringify(healthData.environment, null, 2)}
              </pre>
            </div>
          )}

          {healthData.availableEndpoints && (
            <div>
              <h3>Available API Endpoints:</h3>
              <ul>
                {healthData.availableEndpoints.map((endpoint, index) => (
                  <li key={index}>
                    <a 
                      href={endpoint} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#3b82f6' }}
                    >
                      {endpoint}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '5px'
      }}>
        <h3>Quick Tests:</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a 
            href="/api/health" 
            target="_blank"
            style={{
              padding: '10px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '3px',
              textAlign: 'center'
            }}
          >
            Test /api/health
          </a>
          
          <a 
            href="/api/database/setup" 
            target="_blank"
            style={{
              padding: '10px',
              backgroundColor: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '3px',
              textAlign: 'center'
            }}
          >
            Test /api/database/setup
          </a>
          
          <a 
            href="/database-test" 
            target="_blank"
            style={{
              padding: '10px',
              backgroundColor: '#f59e0b',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '3px',
              textAlign: 'center'
            }}
          >
            Open Database Test Page
          </a>
        </div>
      </div>

      <div style={{
        marginTop: '20px',
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        <p>🔍 This debug page helps identify deployment and configuration issues</p>
        <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Unknown'}</p>
      </div>
    </div>
  );
}