/**
 * Supabase client configuration for real-time database operations
 * Isolated within the databases page architecture
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables - these should be set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Database features will not work.');
}

// Create Supabase client with real-time configuration
export const supabaseClient = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'dummy-key',
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    db: {
      schema: 'public',
    },
  }
);

export default supabaseClient;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseAnonKey !== 'dummy-key');
};

// Database configuration helper
export const getDatabaseConfig = () => ({
  configured: isSupabaseConfigured(),
  url: supabaseUrl,
  hasRealtime: true,
  features: {
    dynamicTables: true,
    realTimeSync: true,
    versionControl: true,
    schemaEditor: true,
  },
});