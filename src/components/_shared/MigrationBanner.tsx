import { useState } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface MigrationBannerProps {
  pendingCount: number;
  onRunMigrations: () => Promise<void>;
}

export function MigrationBanner({ pendingCount, onRunMigrations }: MigrationBannerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || pendingCount === 0) {
    return null;
  }

  const handleRunMigrations = async () => {
    setIsRunning(true);
    try {
      await onRunMigrations();
      setIsVisible(false);
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">
              Database Updates Available
            </h3>
            <p className="text-sm text-amber-700">
              {pendingCount} pending migration{pendingCount > 1 ? 's' : ''} found. 
              Click to update your database schema.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunMigrations}
            disabled={isRunning}
            className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running...' : 'Run Migrations'}
          </button>
          
          <button
            onClick={() => setIsVisible(false)}
            className="text-amber-600 hover:text-amber-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}