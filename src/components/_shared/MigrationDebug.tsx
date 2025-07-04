'use client';

import { useEffect, useState } from 'react';

export function MigrationDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  async function checkMigrationStatus() {
    try {
      console.log('🔍 Checking schema status...');
      const response = await fetch('/api/migrate-native');
      console.log('📡 Schema check response:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Schema data:', data);
        setDebugInfo(data);
      } else {
        const errorText = await response.text();
        console.error('❌ Schema check error:', errorText);
        setDebugInfo({ error: `API Error: ${response.status} - ${errorText}` });
      }
    } catch (error) {
      console.error('❌ Schema check failed:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  }

  async function runMigrations() {
    try {
      console.log('🚀 Running native schema validation...');
      const response = await fetch('/api/migrate-native', { method: 'POST' });
      const result = await response.json();
      console.log('✅ Schema validation result:', result);
      
      if (response.ok && result.success) {
        alert(`Schema validation passed! ${result.message}\nRefreshing page...`);
        window.location.reload();
      } else if (result.sqlCommand) {
        const runManual = confirm(
          `Automated migration not possible.\n\n` +
          `Missing: ${result.missingColumn}\n\n` +
          `Would you like to copy the SQL command to run manually in Supabase?`
        );
        
        if (runManual) {
          navigator.clipboard.writeText(result.sqlCommand);
          alert(`SQL command copied to clipboard!\n\nGo to Supabase SQL Editor and paste:\n${result.sqlCommand}`);
        }
      } else {
        alert('Schema validation failed: ' + (result.error || result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Schema validation failed:', error);
      alert('Schema validation failed: ' + error);
    }
  }

  if (loading) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        background: '#e3f2fd', 
        padding: '8px', 
        textAlign: 'center',
        zIndex: 9999,
        fontSize: '14px'
      }}>
        🔍 Checking for database migrations...
      </div>
    );
  }

  if (debugInfo?.error) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        background: '#ffebee', 
        padding: '8px', 
        textAlign: 'center',
        zIndex: 9999,
        fontSize: '14px'
      }}>
        ❌ Migration check failed: {debugInfo.error}
      </div>
    );
  }

  if (debugInfo?.needsMigration) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        background: '#fff3e0', 
        padding: '12px', 
        textAlign: 'center',
        zIndex: 9999,
        borderBottom: '2px solid #ff9800'
      }}>
        <div style={{ marginBottom: '8px' }}>
          🚨 <strong>Database Schema Issue!</strong> {debugInfo.message || 'Schema validation failed'}
        </div>
        <button 
          onClick={runMigrations}
          style={{
            background: '#ff9800',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '8px'
          }}
        >
          Check Schema
        </button>
        <span style={{ fontSize: '12px', color: '#666' }}>
          This will fix the "category column not found" error
        </span>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      background: '#e8f5e8', 
      padding: '4px', 
      textAlign: 'center',
      zIndex: 9999,
      fontSize: '12px',
      color: '#2e7d32'
    }}>
      ✅ Database schema is complete
    </div>
  );
}