/**
 * Supabase client configuration for real-time database operations
 * Isolated within the databases page architecture
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables - Try client-side first, then fetch from API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let configPromise: Promise<any> | null = null;
let supabaseClientInstance: any = null;

// Fetch configuration from API if not available on client-side
async function fetchSupabaseConfig() {
  if (configPromise) return configPromise;
  
  configPromise = fetch('/api/config/supabase')
    .then(res => res.json())
    .then(config => {
      if (config.configured) {
        return {
          url: config.url,
          anonKey: config.anonKey
        };
      }
      throw new Error('Supabase not configured');
    })
    .catch(error => {
      console.warn('Failed to fetch Supabase config:', error);
      return null;
    });
  
  return configPromise;
}

// Get or create Supabase client
async function getSupabaseClient() {
  if (supabaseClientInstance) return supabaseClientInstance;
  
  let url = supabaseUrl;
  let key = supabaseAnonKey;
  
  // If not available on client-side, fetch from API
  if (!url || !key) {
    const config = await fetchSupabaseConfig();
    if (config) {
      url = config.url;
      key = config.anonKey;
    }
  }
  
  if (!url || !key) {
    throw new Error('Supabase configuration not available');
  }
  
  supabaseClientInstance = createClient(url, key, {
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
  });

  return supabaseClientInstance;
}

// Create a simple client for immediate use (fallback)
const fallbackClient = createClient(
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

// Export the client getter function
export { getSupabaseClient };

// Export fallback client for immediate use
export const supabaseClient = fallbackClient;
export default fallbackClient;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = async (): Promise<boolean> => {
  try {
    // First check if we have client-side env vars
    if (supabaseUrl && supabaseAnonKey && supabaseAnonKey !== 'dummy-key') {
      return true;
    }
    
    // If not, try to fetch from API
    const config = await fetchSupabaseConfig();
    return !!(config && config.url && config.anonKey);
  } catch (error) {
    return false;
  }
};

// Database configuration helper
export const getSupabaseConfig = async () => {
  if (supabaseUrl && supabaseAnonKey) {
    return { url: supabaseUrl, anonKey: supabaseAnonKey };
  }
  
  return await fetchSupabaseConfig();
};