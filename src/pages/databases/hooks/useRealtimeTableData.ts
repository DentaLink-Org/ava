/**
 * Real-time table data synchronization hook
 * Provides live updates for table data with full CRUD operations and inline editing
 */

import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '../api/supabase';
import { HistoryManager } from '../api/history-manager';

export interface TableRecord {
  [key: string]: any;
}

export interface UseRealtimeTableDataResult {
  data: TableRecord[] | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  refetch: () => Promise<void>;
  insertRecord: (record: Omit<TableRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
  updateRecord: (id: string, updates: Partial<TableRecord>) => Promise<{ success: boolean; error?: string }>;
  deleteRecord: (id: string) => Promise<{ success: boolean; error?: string }>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  search: (query: string) => void;
  sort: (column: string, direction: 'asc' | 'desc') => void;
}

export interface UseRealtimeTableDataOptions {
  pageSize?: number;
  searchColumns?: string[];
  trackHistory?: boolean;
}

export const useRealtimeTableData = (
  tableName: string,
  databaseId?: string,
  options: UseRealtimeTableDataOptions = {}
): UseRealtimeTableDataResult => {
  const [data, setData] = useState<TableRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(options.pageSize || 25);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sanitize table name for PostgreSQL
  const sanitizeTableName = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^[0-9]/, '_$&')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 63);
  }, []);

  const sanitizedTableName = sanitizeTableName(tableName);

  // Fetch table data with pagination, search, and sorting
  const fetchData = useCallback(async () => {
    if (!tableName) {
      setData([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Build the query
      let query = supabaseClient
        .from(sanitizedTableName)
        .select('*', { count: 'exact' });

      // Apply search if provided
      if (searchQuery && options.searchColumns && options.searchColumns.length > 0) {
        const searchConditions = options.searchColumns
          .map(col => `${col}.ilike.%${searchQuery}%`)
          .join(',');
        query = query.or(searchConditions);
      }

      // Apply sorting
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: records, error: fetchError, count } = await query;

      if (fetchError) {
        console.error('Error fetching table data:', fetchError);
        setError(fetchError.message);
        setData([]);
        setTotalCount(0);
      } else {
        setData(records || []);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error('Fetch table data failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [tableName, sanitizedTableName, currentPage, pageSize, searchQuery, sortColumn, sortDirection, options.searchColumns]);

  // Insert a new record
  const insertRecord = useCallback(async (
    record: Omit<TableRecord, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: newRecord, error: insertError } = await supabaseClient
        .from(sanitizedTableName)
        .insert(record)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting record:', insertError);
        return { success: false, error: insertError.message };
      }

      // Record the change for history tracking
      if (options.trackHistory && databaseId) {
        await HistoryManager.recordChange(
          databaseId,
          'data_insert',
          newRecord,
          {
            table_name: tableName,
            record_id: newRecord.id
          }
        );
      }

      return { success: true };
    } catch (err) {
      console.error('Error inserting record:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }, [sanitizedTableName, tableName, databaseId, options.trackHistory]);

  // Update an existing record
  const updateRecord = useCallback(async (
    id: string,
    updates: Partial<TableRecord>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get the current record for history tracking
      let currentRecord = null;
      if (options.trackHistory && databaseId) {
        const { data } = await supabaseClient
          .from(sanitizedTableName)
          .select('*')
          .eq('id', id)
          .single();
        currentRecord = data;
      }

      const { data: updatedRecord, error: updateError } = await supabaseClient
        .from(sanitizedTableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating record:', updateError);
        return { success: false, error: updateError.message };
      }

      // Record the change for history tracking
      if (options.trackHistory && databaseId && currentRecord) {
        await HistoryManager.recordChange(
          databaseId,
          'data_update',
          updates,
          {
            table_name: tableName,
            record_id: id,
            previous_values: currentRecord
          }
        );
      }

      return { success: true };
    } catch (err) {
      console.error('Error updating record:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }, [sanitizedTableName, tableName, databaseId, options.trackHistory]);

  // Delete a record
  const deleteRecord = useCallback(async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get the record for history tracking
      let deletedRecord = null;
      if (options.trackHistory && databaseId) {
        const { data } = await supabaseClient
          .from(sanitizedTableName)
          .select('*')
          .eq('id', id)
          .single();
        deletedRecord = data;
      }

      const { error: deleteError } = await supabaseClient
        .from(sanitizedTableName)
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting record:', deleteError);
        return { success: false, error: deleteError.message };
      }

      // Record the change for history tracking
      if (options.trackHistory && databaseId && deletedRecord) {
        await HistoryManager.recordChange(
          databaseId,
          'data_delete',
          { deleted: true },
          {
            table_name: tableName,
            record_id: id,
            previous_values: deletedRecord
          }
        );
      }

      return { success: true };
    } catch (err) {
      console.error('Error deleting record:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }, [sanitizedTableName, tableName, databaseId, options.trackHistory]);

  // Pagination controls
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  // Search functionality
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Sort functionality
  const sort = useCallback((column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  // Set up real-time subscription and initial fetch
  useEffect(() => {
    fetchData();

    if (!tableName) return;

    // Set up real-time subscription for the specific table
    const subscription = supabaseClient
      .channel(`table_${sanitizedTableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: sanitizedTableName
        },
        (payload) => {
          console.log(`Table ${tableName} change detected:`, payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName, sanitizedTableName, fetchData]);

  // Refetch when dependencies change
  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchQuery, sortColumn, sortDirection]);

  return {
    data,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    refetch: fetchData,
    insertRecord,
    updateRecord,
    deleteRecord,
    setPage,
    setPageSize,
    search,
    sort,
  };
};

export default useRealtimeTableData;