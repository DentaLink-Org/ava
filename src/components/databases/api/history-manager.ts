/**
 * Database history and version control manager
 * Handles snapshots, change tracking, and rollback capabilities
 */

import { supabaseClient } from './supabase';

export interface DatabaseSnapshot {
  id: string;
  database_id: string;
  snapshot_data: any;
  snapshot_type: 'manual' | 'auto' | 'checkpoint';
  description?: string;
  created_by: string;
  created_at: string;
  size_bytes?: number;
}

export interface DatabaseChange {
  id: string;
  database_id: string;
  change_type: 
    | 'schema_add' 
    | 'schema_delete' 
    | 'schema_update' 
    | 'data_insert' 
    | 'data_update' 
    | 'data_delete'
    | 'table_create'
    | 'table_drop'
    | 'column_add'
    | 'column_drop'
    | 'column_modify';
  table_name?: string;
  record_id?: string;
  changes: any;
  previous_values?: any;
  batch_id?: string;
  created_by: string;
  created_at: string;
}

export interface CreateSnapshotOptions {
  type?: 'manual' | 'auto' | 'checkpoint';
  description?: string;
  created_by?: string;
}

export interface RecordChangeOptions {
  batch_id?: string;
  created_by?: string;
}

export class HistoryManager {
  /**
   * Create a snapshot of the current database state
   */
  static async createSnapshot(
    databaseId: string,
    options: CreateSnapshotOptions = {}
  ): Promise<{ success: boolean; snapshot_id?: string; error?: string }> {
    try {
      const currentState = await this.getCurrentDatabaseState(databaseId);
      
      if (!currentState) {
        return { success: false, error: 'Failed to capture current database state' };
      }
      
      const { data, error } = await supabaseClient
        .from('database_snapshots')
        .insert({
          database_id: databaseId,
          snapshot_data: currentState,
          snapshot_type: options.type || 'manual',
          description: options.description || `${options.type || 'manual'} snapshot`,
          created_by: options.created_by || 'system',
          size_bytes: JSON.stringify(currentState).length
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating snapshot:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, snapshot_id: data.id };
      
    } catch (err) {
      console.error('Error creating snapshot:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Record a change in the database
   */
  static async recordChange(
    databaseId: string,
    changeType: DatabaseChange['change_type'],
    changes: any,
    options: RecordChangeOptions & {
      table_name?: string;
      record_id?: string;
      previous_values?: any;
    } = {}
  ): Promise<{ success: boolean; change_id?: string; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('database_changes')
        .insert({
          database_id: databaseId,
          change_type: changeType,
          table_name: options.table_name,
          record_id: options.record_id,
          changes,
          previous_values: options.previous_values,
          batch_id: options.batch_id || `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_by: options.created_by || 'user'
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error recording change:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, change_id: data.id };
      
    } catch (err) {
      console.error('Error recording change:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Get all snapshots for a database
   */
  static async getSnapshots(
    databaseId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ success: boolean; snapshots?: DatabaseSnapshot[]; error?: string }> {
    try {
      let query = supabaseClient
        .from('database_snapshots')
        .select('*')
        .eq('database_id', databaseId)
        .order('created_at', { ascending: false });
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching snapshots:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, snapshots: data };
      
    } catch (err) {
      console.error('Error fetching snapshots:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Get change history for a database
   */
  static async getChangeHistory(
    databaseId: string,
    options: { 
      limit?: number; 
      offset?: number;
      change_type?: DatabaseChange['change_type'];
      table_name?: string;
    } = {}
  ): Promise<{ success: boolean; changes?: DatabaseChange[]; error?: string }> {
    try {
      let query = supabaseClient
        .from('database_changes')
        .select('*')
        .eq('database_id', databaseId)
        .order('created_at', { ascending: false });
      
      if (options.change_type) {
        query = query.eq('change_type', options.change_type);
      }
      
      if (options.table_name) {
        query = query.eq('table_name', options.table_name);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching change history:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, changes: data };
      
    } catch (err) {
      console.error('Error fetching change history:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Restore database from a snapshot
   */
  static async restoreFromSnapshot(
    snapshotId: string,
    options: { created_by?: string } = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the snapshot data
      const { data: snapshot, error: snapshotError } = await supabaseClient
        .from('database_snapshots')
        .select('*')
        .eq('id', snapshotId)
        .single();
      
      if (snapshotError) {
        return { success: false, error: snapshotError.message };
      }
      
      if (!snapshot) {
        return { success: false, error: 'Snapshot not found' };
      }
      
      // Create a backup snapshot before restore
      await this.createSnapshot(snapshot.database_id, {
        type: 'auto',
        description: `Auto backup before restore from ${snapshotId}`,
        created_by: options.created_by
      });
      
      // TODO: Implement actual restoration logic
      // This would involve:
      // 1. Dropping existing tables for this database
      // 2. Recreating tables from snapshot schema
      // 3. Restoring data from snapshot
      // 4. Recording the restore operation
      
      await this.recordChange(
        snapshot.database_id,
        'schema_update',
        { action: 'restore_from_snapshot', snapshot_id: snapshotId },
        { created_by: options.created_by }
      );
      
      console.log('Snapshot restore completed (placeholder implementation)');
      return { success: true };
      
    } catch (err) {
      console.error('Error restoring from snapshot:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Clean up old snapshots based on retention policy
   */
  static async cleanupOldSnapshots(
    databaseId: string,
    retentionDays: number = 30
  ): Promise<{ success: boolean; deleted_count?: number; error?: string }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const { data, error } = await supabaseClient
        .from('database_snapshots')
        .delete()
        .eq('database_id', databaseId)
        .eq('snapshot_type', 'auto') // Only delete auto snapshots
        .lt('created_at', cutoffDate.toISOString())
        .select('id');
      
      if (error) {
        console.error('Error cleaning up snapshots:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, deleted_count: data?.length || 0 };
      
    } catch (err) {
      console.error('Error cleaning up snapshots:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Get the current state of a database for snapshotting
   */
  private static async getCurrentDatabaseState(databaseId: string): Promise<any | null> {
    try {
      // Get database info
      const { data: database, error: dbError } = await supabaseClient
        .from('user_databases')
        .select('*')
        .eq('id', databaseId)
        .single();
      
      if (dbError || !database) {
        console.error('Error fetching database:', dbError);
        return null;
      }
      
      // Get schemas
      const { data: schemas, error: schemasError } = await supabaseClient
        .from('database_schemas')
        .select('*')
        .eq('database_id', databaseId);
      
      if (schemasError) {
        console.error('Error fetching schemas:', schemasError);
        return null;
      }
      
      // Get columns for all schemas
      const schemaIds = (schemas || []).map(s => s.id);
      let columns = [];
      
      if (schemaIds.length > 0) {
        const { data: columnsData, error: columnsError } = await supabaseClient
          .from('schema_columns')
          .select('*')
          .in('schema_id', schemaIds);
        
        if (columnsError) {
          console.error('Error fetching columns:', columnsError);
          return null;
        }
        
        columns = columnsData || [];
      }
      
      // Get dynamic tables
      const { data: dynamicTables, error: tablesError } = await supabaseClient
        .from('dynamic_tables')
        .select('*')
        .eq('database_id', databaseId);
      
      if (tablesError) {
        console.error('Error fetching dynamic tables:', tablesError);
      }
      
      return {
        database,
        schemas: schemas || [],
        columns,
        dynamic_tables: dynamicTables || [],
        snapshot_timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
    } catch (err) {
      console.error('Error getting current database state:', err);
      return null;
    }
  }
}

export default HistoryManager;