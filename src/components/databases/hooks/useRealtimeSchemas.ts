/**
 * Real-time schema synchronization hook
 * Provides live updates for database schemas and columns with full CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '../api/supabase';
import { TableCreator, ColumnDefinition } from '../api/table-creator';
import { HistoryManager } from '../api/history-manager';
import { DatabaseSchema, TableColumn } from '../types';

export interface SchemaWithColumns extends DatabaseSchema {
  columns: TableColumn[];
}

export interface UseRealtimeSchemasResult {
  schemas: SchemaWithColumns[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTable: (databaseId: string, tableName: string, columns: ColumnDefinition[]) => Promise<{ success: boolean; error?: string }>;
  deleteTable: (schemaId: string, tableName: string) => Promise<{ success: boolean; error?: string }>;
  addColumn: (schemaId: string, column: ColumnDefinition) => Promise<{ success: boolean; error?: string }>;
  updateColumn: (columnId: string, updates: Partial<TableColumn>) => Promise<{ success: boolean; error?: string }>;
  deleteColumn: (columnId: string, tableName: string) => Promise<{ success: boolean; error?: string }>;
}

export const useRealtimeSchemas = (databaseId: string): UseRealtimeSchemasResult => {
  const [schemas, setSchemas] = useState<SchemaWithColumns[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch schemas with their columns
  const fetchSchemas = useCallback(async () => {
    if (!databaseId) {
      setSchemas([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch schemas
      const { data: schemasData, error: schemasError } = await supabaseClient
        .from('database_schemas')
        .select('*')
        .eq('database_id', databaseId)
        .order('created_at', { ascending: true });

      if (schemasError) {
        console.error('Error fetching schemas:', schemasError);
        setError(schemasError.message);
        setSchemas([]);
        return;
      }

      // Fetch columns for all schemas
      const schemaIds = (schemasData || []).map(s => s.id);
      let columnsData = [];

      if (schemaIds.length > 0) {
        const { data: columns, error: columnsError } = await supabaseClient
          .from('schema_columns')
          .select('*')
          .in('schema_id', schemaIds)
          .order('column_order', { ascending: true });

        if (columnsError) {
          console.error('Error fetching columns:', columnsError);
          setError(columnsError.message);
          setSchemas([]);
          return;
        }

        columnsData = columns || [];
      }

      // Combine schemas with their columns
      const schemasWithColumns: SchemaWithColumns[] = (schemasData || []).map(schema => ({
        id: schema.id,
        database_id: schema.database_id,
        table_name: schema.table_name,
        columns: columnsData
          .filter(col => col.schema_id === schema.id)
          .map(col => ({
            id: col.id,
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable,
            primary_key: col.is_primary_key,
            unique: col.is_unique,
            default_value: col.default_value,
            comment: col.comment,
            references: col.references_table ? {
              table: col.references_table,
              column: col.references_column,
              on_delete: col.on_delete,
              on_update: col.on_update,
            } : undefined,
          })),
        created_at: schema.created_at,
        updated_at: schema.updated_at,
      }));

      setSchemas(schemasWithColumns);
    } catch (err) {
      console.error('Fetch schemas failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSchemas([]);
    } finally {
      setIsLoading(false);
    }
  }, [databaseId]);

  // Create a new table with columns
  const createTable = useCallback(async (
    databaseId: string,
    tableName: string,
    columns: ColumnDefinition[]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create the physical table
      const tableResult = await TableCreator.createTable(tableName, columns);
      
      if (!tableResult.success) {
        return { success: false, error: tableResult.error };
      }

      // Record in our schema tracking
      const { data: schema, error: schemaError } = await supabaseClient
        .from('database_schemas')
        .insert({
          database_id: databaseId,
          table_name: tableName,
          display_name: tableName,
          schema_name: 'public', // Add the required schema_name
          column_count: columns.length,
          record_count: 0
        })
        .select()
        .single();

      if (schemaError) {
        console.error('Error creating schema record:', schemaError);
        return { success: false, error: schemaError.message };
      }

      // Insert column records
      const columnRecords = columns.map((col, index) => ({
        schema_id: schema.id,
        column_name: col.column_name,
        data_type: col.data_type,
        is_nullable: col.is_nullable || false,
        is_primary_key: col.is_primary_key || false,
        is_unique: col.is_unique || false,
        default_value: col.default_value,
        column_order: index,
        max_length: col.max_length,
        references_table: col.references_table,
        references_column: col.references_column,
        on_delete: col.on_delete,
        on_update: col.on_update,
        comment: col.comment,
      }));

      const { error: columnsError } = await supabaseClient
        .from('schema_columns')
        .insert(columnRecords);

      if (columnsError) {
        console.error('Error creating column records:', columnsError);
        return { success: false, error: columnsError.message };
      }

      // Record the change
      await HistoryManager.recordChange(
        databaseId,
        'table_create',
        { table_name: tableName, columns },
        { table_name: tableName }
      );

      // Force immediate refresh to ensure UI updates
      await fetchSchemas();

      return { success: true };
    } catch (err) {
      console.error('Error creating table:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }, []);

  // Delete a table
  const deleteTable = useCallback(async (
    schemaId: string,
    tableName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Drop the physical table
      const dropResult = await TableCreator.dropTable(tableName);
      
      if (!dropResult.success) {
        return { success: false, error: dropResult.error };
      }

      // Delete the schema record (columns will be cascade deleted)
      const { error: deleteError } = await supabaseClient
        .from('database_schemas')
        .delete()
        .eq('id', schemaId);

      if (deleteError) {
        console.error('Error deleting schema record:', deleteError);
        return { success: false, error: deleteError.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Error deleting table:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }, []);

  // Add a column to an existing table
  const addColumn = useCallback(async (
    schemaId: string,
    column: ColumnDefinition
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get the table name first
      const { data: schema, error: schemaError } = await supabaseClient
        .from('database_schemas')
        .select('table_name')
        .eq('id', schemaId)
        .single();

      if (schemaError || !schema) {
        return { success: false, error: 'Schema not found' };
      }

      // Add the physical column
      const addResult = await TableCreator.addColumn(schema.table_name, column);
      
      if (!addResult.success) {
        return { success: false, error: addResult.error };
      }

      // Get the next column order
      const { data: existingColumns } = await supabaseClient
        .from('schema_columns')
        .select('column_order')
        .eq('schema_id', schemaId)
        .order('column_order', { ascending: false })
        .limit(1);

      const nextOrder = (existingColumns?.[0]?.column_order || 0) + 1;

      // Insert column record
      const { error: insertError } = await supabaseClient
        .from('schema_columns')
        .insert({
          schema_id: schemaId,
          column_name: column.column_name,
          data_type: column.data_type,
          is_nullable: column.is_nullable || false,
          is_primary_key: column.is_primary_key || false,
          is_unique: column.is_unique || false,
          default_value: column.default_value,
          column_order: nextOrder,
          max_length: column.max_length,
          references_table: column.references_table,
          references_column: column.references_column,
          on_delete: column.on_delete,
          on_update: column.on_update,
          comment: column.comment,
        });

      if (insertError) {
        console.error('Error creating column record:', insertError);
        return { success: false, error: insertError.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Error adding column:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }, []);

  // Update a column
  const updateColumn = useCallback(async (
    columnId: string,
    updates: Partial<TableColumn>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: updateError } = await supabaseClient
        .from('schema_columns')
        .update({
          column_name: updates.name,
          data_type: updates.type,
          is_nullable: updates.nullable,
          is_primary_key: updates.primary_key,
          is_unique: updates.unique,
          default_value: updates.default_value,
          comment: updates.comment,
        })
        .eq('id', columnId);

      if (updateError) {
        console.error('Error updating column:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Error updating column:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }, []);

  // Delete a column
  const deleteColumn = useCallback(async (
    columnId: string,
    tableName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get column name first
      const { data: column, error: columnError } = await supabaseClient
        .from('schema_columns')
        .select('column_name')
        .eq('id', columnId)
        .single();

      if (columnError || !column) {
        return { success: false, error: 'Column not found' };
      }

      // Drop the physical column
      const dropResult = await TableCreator.dropColumn(tableName, column.column_name);
      
      if (!dropResult.success) {
        return { success: false, error: dropResult.error };
      }

      // Delete the column record
      const { error: deleteError } = await supabaseClient
        .from('schema_columns')
        .delete()
        .eq('id', columnId);

      if (deleteError) {
        console.error('Error deleting column record:', deleteError);
        return { success: false, error: deleteError.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Error deleting column:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }, []);

  // Set up real-time subscription and initial fetch
  useEffect(() => {
    fetchSchemas();

    if (!databaseId) return;

    // Set up real-time subscription
    const subscription = supabaseClient
      .channel(`schemas_${databaseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'database_schemas',
          filter: `database_id=eq.${databaseId}`
        },
        (payload) => {
          console.log('Schema change detected:', payload);
          fetchSchemas();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schema_columns'
        },
        (payload) => {
          console.log('Column change detected:', payload);
          fetchSchemas();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [databaseId, fetchSchemas]);

  return {
    schemas,
    isLoading,
    error,
    refetch: fetchSchemas,
    createTable,
    deleteTable,
    addColumn,
    updateColumn,
    deleteColumn,
  };
};

export default useRealtimeSchemas;