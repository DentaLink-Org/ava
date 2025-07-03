'use client';

import { DatabaseManager } from "@/components/databases/components/DatabaseManager";

export default function DatabasesDebugPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Databases Debug Page</h1>
      <p>This page directly renders the DatabaseManager component.</p>
      
      <div style={{ marginTop: '20px' }}>
        <DatabaseManager />
      </div>
    </div>
  );
}