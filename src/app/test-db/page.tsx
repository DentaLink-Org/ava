'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TestDB() {
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('user_databases')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          setError(error.message);
          console.error('Supabase error:', error);
        } else {
          setDatabases(data || []);
          console.log('Fetched databases:', data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Database Connection Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Supabase URL:</strong> {supabaseUrl}<br />
        <strong>Status:</strong> {loading ? 'Loading...' : error ? 'Error' : 'Connected'}
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <h2>Databases ({databases.length})</h2>
      
      {databases.length === 0 ? (
        <p>No databases found. Make sure you ran the SQL setup script.</p>
      ) : (
        <ul>
          {databases.map((db) => (
            <li key={db.id}>
              <strong>{db.title}</strong> - {db.type} ({db.status})
              <br />
              <small>ID: {db.id}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}