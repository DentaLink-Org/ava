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
      const response = await fetch('/api/migrate', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        console.log('Migrations completed:', result);
        // Refresh the page to reload with updated schema
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Migration failed:', error);
        alert('Migration failed: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed: ' + error);
    }
  }

  return (
    <>
      {!migrationStatus.loading && migrationStatus.pendingCount > 0 && (
        <MigrationBanner
          pendingCount={migrationStatus.pendingCount}
          onRunMigrations={runMigrations}
        />
      )}
      {children}
    </>
  );
}