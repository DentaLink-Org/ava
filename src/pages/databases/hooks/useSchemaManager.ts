/**
 * useSchemaManager Hook
 * Manages database schema operations
 */

import { useState, useCallback } from 'react';
import { TableColumn as Column } from '../types';

export interface Schema {
  id: string;
  database_id: string;
  table_name: string;
  columns: Column[];
  created_at: string;
  updated_at: string;
}

export interface SchemaManagerHook {
  schemas: Schema[];
  isLoading: boolean;
  error: Error | null;
  loadSchemas: (databaseId: string) => Promise<void>;
  createSchema: (databaseId: string, schema: Partial<Schema>) => Promise<Schema>;
  updateSchema: (schemaId: string, updates: Partial<Schema>) => Promise<Schema>;
  deleteSchema: (schemaId: string) => Promise<void>;
  addColumn: (schemaId: string, column: Column) => Promise<void>;
  updateColumn: (schemaId: string, columnId: string, updates: Partial<Column>) => Promise<void>;
  deleteColumn: (schemaId: string, columnId: string) => Promise<void>;
}

export const useSchemaManager = (): SchemaManagerHook => {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load schemas for a specific database
  const loadSchemas = useCallback(async (databaseId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock data for demonstration
      const mockSchemas: Schema[] = [
        {
          id: 'schema_1',
          database_id: databaseId,
          table_name: 'users',
          columns: [
            {
              id: 'col_1',
              name: 'id',
              type: 'uuid',
              nullable: false,
              primary_key: true,
              unique: true,
              default_value: 'gen_random_uuid()'
            },
            {
              id: 'col_2',
              name: 'email',
              type: 'text',
              nullable: false,
              primary_key: false,
              unique: true
            },
            {
              id: 'col_3',
              name: 'created_at',
              type: 'timestamp',
              nullable: false,
              primary_key: false,
              unique: false,
              default_value: 'now()'
            }
          ],
          created_at: new Date('2024-01-15').toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'schema_2',
          database_id: databaseId,
          table_name: 'products',
          columns: [
            {
              id: 'col_4',
              name: 'id',
              type: 'bigint',
              nullable: false,
              primary_key: true,
              unique: true
            },
            {
              id: 'col_5',
              name: 'name',
              type: 'text',
              nullable: false,
              primary_key: false,
              unique: false
            },
            {
              id: 'col_6',
              name: 'price',
              type: 'numeric',
              nullable: false,
              primary_key: false,
              unique: false
            }
          ],
          created_at: new Date('2024-02-20').toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setSchemas(mockSchemas);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load schemas'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new schema/table
  const createSchema = useCallback(async (databaseId: string, schema: Partial<Schema>): Promise<Schema> => {
    try {
      const newSchema: Schema = {
        id: `schema_${Date.now()}`,
        database_id: databaseId,
        table_name: schema.table_name || 'new_table',
        columns: schema.columns || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setSchemas(prev => [...prev, newSchema]);
      return newSchema;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create schema');
    }
  }, []);

  // Update schema
  const updateSchema = useCallback(async (schemaId: string, updates: Partial<Schema>): Promise<Schema> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let updatedSchema: Schema | undefined;
      
      setSchemas(prev => prev.map(schema => {
        if (schema.id === schemaId) {
          updatedSchema = {
            ...schema,
            ...updates,
            updated_at: new Date().toISOString()
          };
          return updatedSchema;
        }
        return schema;
      }));
      
      if (!updatedSchema) {
        throw new Error('Schema not found');
      }
      
      return updatedSchema;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update schema');
    }
  }, []);

  // Delete schema
  const deleteSchema = useCallback(async (schemaId: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setSchemas(prev => prev.filter(schema => schema.id !== schemaId));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete schema');
    }
  }, []);

  // Add column to schema
  const addColumn = useCallback(async (schemaId: string, column: Column): Promise<void> => {
    try {
      const schema = schemas.find(s => s.id === schemaId);
      if (!schema) {
        throw new Error('Schema not found');
      }
      
      const updatedColumns = [...schema.columns, column];
      await updateSchema(schemaId, { columns: updatedColumns });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add column');
    }
  }, [schemas, updateSchema]);

  // Update column
  const updateColumn = useCallback(async (schemaId: string, columnId: string, updates: Partial<Column>): Promise<void> => {
    try {
      const schema = schemas.find(s => s.id === schemaId);
      if (!schema) {
        throw new Error('Schema not found');
      }
      
      const updatedColumns = schema.columns.map(col =>
        col.id === columnId ? { ...col, ...updates } : col
      );
      
      await updateSchema(schemaId, { columns: updatedColumns });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update column');
    }
  }, [schemas, updateSchema]);

  // Delete column
  const deleteColumn = useCallback(async (schemaId: string, columnId: string): Promise<void> => {
    try {
      const schema = schemas.find(s => s.id === schemaId);
      if (!schema) {
        throw new Error('Schema not found');
      }
      
      const updatedColumns = schema.columns.filter(col => col.id !== columnId);
      await updateSchema(schemaId, { columns: updatedColumns });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete column');
    }
  }, [schemas, updateSchema]);

  return {
    schemas,
    isLoading,
    error,
    loadSchemas,
    createSchema,
    updateSchema,
    deleteSchema,
    addColumn,
    updateColumn,
    deleteColumn
  };
};