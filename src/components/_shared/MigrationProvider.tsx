'use client';

import { useEffect, useState } from 'react';
import { MigrationBanner } from './MigrationBanner';

interface MigrationStatus {
  pendingCount: number;
  loading: boolean;
  error?: string;
}

export function MigrationProvider({ children }: { children: React.ReactNode }) {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    pendingCount: 0,
    loading: true
  });

  useEffect(() => {
    checkMigrations();
  }, []);

  async function checkMigrations() {
    try {
      // Check the new native schema validation first
      const nativeResponse = await fetch('/api/migrate-native');
      if (nativeResponse.ok) {
        const nativeData = await nativeResponse.json();
        
        // If schema needs migration, prioritize that
        if (!nativeData.success) {
          setMigrationStatus({
            pendingCount: 1, // Show that there's a schema issue
            loading: false
          });
          return;
        }
      }
      
      // Otherwise check the old migration system
      const response = await fetch('/api/migrate');
      if (response.ok) {
        const data = await response.json();
        setMigrationStatus({
          pendingCount: data.pendingCount || 0,
          loading: false
        });
      } else {
        setMigrationStatus({
          pendingCount: 0,
          loading: false,
          error: 'Failed to check migrations'
        });
      }
    } catch (error) {
      console.error('Migration check error:', error);
      setMigrationStatus({
        pendingCount: 0,
        loading: false,
        error: 'Failed to check migrations'
      });
    }
  }

  async function runMigrations() {
    try {
      // Use the new native schema validation
      const response = await fetch('/api/migrate-native', { method: 'POST' });
      const result = await response.json();
      
      if (response.ok && result.success) {
        alert(`Schema validation passed! ${result.message}\nRefreshing page...`);
        window.location.reload();
      } else if (result.sqlCommand) {
        const runManual = confirm(
          `Database schema needs manual fix.\n\n` +
          `Missing: ${result.missingColumn}\n\n` +
          `Copy SQL commands to clipboard?`
        );
        
        if (runManual) {
          try {
            await navigator.clipboard.writeText(result.sqlCommand);
            alert(`SQL commands copied to clipboard!\n\nGo to Supabase Dashboard → SQL Editor and paste the commands.\n\nThen refresh this page.`);
          } catch (err) {
            // Fallback if clipboard API fails
            const textarea = document.createElement('textarea');
            textarea.value = result.sqlCommand;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            alert(`SQL commands copied! Go to Supabase SQL Editor and paste them.`);
          }
        }
      } else {
        alert('Schema validation failed: ' + (result.error || result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed: ' + error);
    }
  }

  return (
    <>
      {!migrationStatus.loading && migrationStatus.pendingCount > 0 && (
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
            🚨 <strong>Database Schema Issue!</strong> Click to get SQL fix for missing columns.
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
            Get SQL Fix
          </button>
          <span style={{ fontSize: '12px', color: '#666' }}>
            Copies complete SQL commands to fix all missing columns
          </span>
        </div>
      )}
      {children}
    </>
  );
}