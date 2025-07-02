/**
 * Real-time database synchronization hook
 * Provides live updates for database lists with automatic subscription management
 */

import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '../api/supabase';
import { Database } from '../types';

export interface UseRealtimeDatabasesResult {
  data: Database[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createDatabase: (database: Omit<Database, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; data?: Database; error?: string }>;
  deleteDatabase: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const useRealtimeDatabases = (): UseRealtimeDatabasesResult => {
  const [data, setData] = useState<Database[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch databases from Supabase
  const fetchDatabases = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: databases, error: fetchError } = await supabaseClient
        .from('user_databases')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching databases:', fetchError);
        setError(fetchError.message);
        setData([]);
      } else {
        // Transform the data to match our Database interface
        const transformedData: Database[] = (databases || []).map(db => ({
          id: db.id,
          title: db.title,
          description: db.description,
          type: db.type as Database['type'],
          status: db.status as Database['status'],
          created_at: db.created_at,
          updated_at: db.updated_at,
          table_count: db.table_count || 0,
          record_count: db.record_count || 0,
          size: db.size || '0 KB',
        }));
        
        setData(transformedData);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new database
  const createDatabase = useCallback(async (
    database: Omit<Database, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; data?: Database; error?: string }> => {
    try {
      const { data: newDatabase, error: createError } = await supabaseClient
        .from('user_databases')
        .insert({
          title: database.title,
          description: database.description,
          type: database.type,
          status: database.status || 'active',
          table_count: 0,
          record_count: 0,
          size_bytes: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating database:', createError);
        return { success: false, error: createError.message };
      }

      const transformedDatabase: Database = {
        id: newDatabase.id,
        title: newDatabase.title,
        description: newDatabase.description,
        type: newDatabase.type,
        status: newDatabase.status,
        created_at: newDatabase.created_at,
        updated_at: newDatabase.updated_at,
        table_count: 0,
        record_count: 0,
        size: '0 B',
      };

      return { success: true, data: transformedDatabase };
    } catch (err) {
      console.error('Error creating database:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }, []);

  // Delete a database
  const deleteDatabase = useCallback(async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: deleteError } = await supabaseClient
        .from('user_databases')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting database:', deleteError);
        return { success: false, error: deleteError.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Error deleting database:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }, []);

  // Set up real-time subscription and initial fetch
  useEffect(() => {
    // Initial fetch
    fetchDatabases();

    // Set up real-time subscription
    const subscription = supabaseClient
      .channel('databases_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_databases'
        },
        (payload) => {
          console.log('Database change detected:', payload);
          // Refetch data when any change occurs
          fetchDatabases();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'database_schemas'
        },
        (payload) => {
          console.log('Schema change detected:', payload);
          // Refetch data when schema changes occur
          fetchDatabases();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchDatabases]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDatabases,
    createDatabase,
    deleteDatabase,
  };
};

// Helper function to format bytes
function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default useRealtimeDatabases;