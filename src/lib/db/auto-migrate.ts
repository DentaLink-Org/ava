// Auto-migration utility for checking and running migrations on app startup
// This will be called when the app initializes to ensure database is up to date

let migrationCheckComplete = false;

export async function checkAndRunMigrations() {
  // Only run migration check once per app lifecycle
  if (migrationCheckComplete) {
    return;
  }
  
  try {
    // Check if we're in the browser or server environment
    if (typeof window !== 'undefined') {
      // Client-side: just mark as complete
      migrationCheckComplete = true;
      return;
    }
    
    // Server-side: check for pending migrations
    const response = await fetch('/api/migrate', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn('Migration check failed:', response.statusText);
      return;
    }
    
    const data = await response.json();
    
    if (data.pendingCount > 0) {
      console.log(`Found ${data.pendingCount} pending migrations`);
      
      // Auto-run migrations in development, but be cautious in production
      if (process.env.NODE_ENV === 'development' || process.env.AUTO_MIGRATE === 'true') {
        console.log('Running migrations automatically...');
        
        const migrateResponse = await fetch('/api/migrate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (migrateResponse.ok) {
          const result = await migrateResponse.json();
          console.log('Migration result:', result.message);
        } else {
          console.error('Migration failed:', migrateResponse.statusText);
        }
      } else {
        console.log('Pending migrations found. Run migrations manually in production.');
      }
    }
    
    migrationCheckComplete = true;
  } catch (error) {
    console.error('Migration check error:', error);
  }
}

// Hook for React components to trigger migration check
export function useMigrationCheck() {
  const [migrationStatus, setMigrationStatus] = useState<{
    pending: number;
    total: number;
    loading: boolean;
  }>({
    pending: 0,
    total: 0,
    loading: true
  });
  
  useEffect(() => {
    async function checkMigrations() {
      try {
        const response = await fetch('/api/migrate');
        if (response.ok) {
          const data = await response.json();
          setMigrationStatus({
            pending: data.pendingCount,
            total: data.totalMigrations,
            loading: false
          });
        }
      } catch (error) {
        console.error('Failed to check migrations:', error);
        setMigrationStatus(prev => ({ ...prev, loading: false }));
      }
    }
    
    checkMigrations();
  }, []);
  
  return migrationStatus;
}

// Import React hooks
import { useEffect, useState } from 'react';