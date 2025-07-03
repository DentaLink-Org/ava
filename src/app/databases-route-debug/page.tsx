'use client';

import React, { useState, useEffect } from 'react';
import { PageRenderer } from '@/components/_shared/runtime/PageRenderer';
import { PageWrapper } from '@/components/_shared/components/PageWrapper';

export default function DatabasesRouteDebug() {
  const [configLoaded, setConfigLoaded] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [componentRegistered, setComponentRegistered] = useState(false);

  useEffect(() => {
    // Check if config can be loaded
    fetch('/api/pages/databases/config')
      .then(res => res.json())
      .then(data => {
        console.log('Config loaded:', data);
        setConfigLoaded(true);
      })
      .catch(err => {
        console.error('Config error:', err);
        setConfigError(err.message);
      });

    // Check component registry
    if (typeof window !== 'undefined' && (window as any).__componentRegistry) {
      const registry = (window as any).__componentRegistry;
      const dbComponents = registry.getComponents('databases');
      console.log('Registered database components:', dbComponents);
      setComponentRegistered(Object.keys(dbComponents || {}).length > 0);
    }
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Databases Route Debug</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Debug Info:</h2>
        <ul>
          <li>Config loaded: {configLoaded ? '✅' : '❌'}</li>
          <li>Config error: {configError || 'None'}</li>
          <li>Components registered: {componentRegistered ? '✅' : '❌'}</li>
        </ul>
      </div>

      <hr style={{ margin: '20px 0' }} />

      <h2>Testing PageRenderer directly:</h2>
      <div style={{ border: '2px solid blue', padding: '20px', marginTop: '10px' }}>
        <PageRenderer
          pageId="databases"
          onError={(error) => {
            console.error('PageRenderer error:', error);
            alert(`PageRenderer error: ${error.message}`);
          }}
          onLoad={() => {
            console.log('PageRenderer loaded successfully');
          }}
        />
      </div>

      <hr style={{ margin: '20px 0' }} />

      <h2>Testing with PageWrapper:</h2>
      <div style={{ border: '2px solid green', padding: '20px', marginTop: '10px' }}>
        <PageWrapper 
          pageId="databases"
          showNavigation={true}
          showBreadcrumbs={true}
        >
          <PageRenderer
            pageId="databases"
            onError={(error) => {
              console.error('PageRenderer with wrapper error:', error);
              alert(`PageRenderer with wrapper error: ${error.message}`);
            }}
            onLoad={() => {
              console.log('PageRenderer with wrapper loaded successfully');
            }}
          />
        </PageWrapper>
      </div>
    </div>
  );
}