/**
 * Dynamic Route Handler - Main entry point for all page-centric routes
 * Replaces Next.js file-based routing with dynamic page resolution
 * 
 * This single route handler serves all pages through the PageRenderer system
 * enabling complete page-centric architecture with runtime configuration.
 */

'use client';

import React, { useEffect } from 'react';
// Metadata removed - client components don't support generateMetadata
import { notFound } from 'next/navigation';
import { PageRenderer } from '../../pages/_shared/runtime/PageRenderer';
import { PageWrapper } from '../../pages/_shared/components/PageWrapper';
import { DatabaseThemeProvider } from '../../pages/_shared/runtime/DatabaseThemeProvider';

// Valid page IDs that can be rendered
const VALID_PAGES = [
  'dashboard',
  'databases', 
  'tasks',
  'themes',
  'page-manager',
  'playground'
] as const;

type ValidPageId = typeof VALID_PAGES[number];

interface PageProps {
  params: { 
    page?: string[] 
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

/**
 * Route validation and page ID resolution
 */
function resolvePageId(pageParams?: string[]): ValidPageId | null {
  // Default to dashboard if no page specified
  if (!pageParams || pageParams.length === 0) {
    return 'dashboard';
  }

  const pageId = pageParams[0];
  
  // Validate page ID
  if (!VALID_PAGES.includes(pageId as ValidPageId)) {
    return null;
  }

  return pageId as ValidPageId;
}

// Metadata generation removed - not supported in client components

/**
 * Main dynamic page component
 */
export default function DynamicPage({ params, searchParams }: PageProps) {
  const pageId = resolvePageId(params.page);

  // Return 404 for invalid pages
  if (!pageId) {
    console.warn(`Invalid page requested:`, params.page);
    notFound();
  }

  // Set document title dynamically
  useEffect(() => {
    const titleMap = {
      dashboard: 'Dashboard - Claude Admin',
      databases: 'Databases - Claude Admin',
      tasks: 'Tasks - Claude Admin',
      themes: 'Theme Gallery - Claude Admin',
      'page-manager': 'Page Manager - Claude Admin',
      playground: 'Playground - Claude Admin'
    };
    document.title = titleMap[pageId] || 'Claude Admin';
  }, [pageId]);

  // Handle page-specific query parameters
  const pageProps = {
    searchParams: searchParams || {},
    // Add any additional props that pages might need
  };

  return (
    <DatabaseThemeProvider
      pageId={pageId}
      enableAutoRefresh={false}
      onThemeChange={(theme) => {
        console.log(`Theme changed to ${theme.displayName} for page ${pageId}`);
      }}
    >
      <PageWrapper 
        pageId={pageId}
        showNavigation={true}
        showBreadcrumbs={true}
      >
        <PageRenderer
          pageId={pageId}
          onError={(error) => {
            console.error(`Page ${pageId} error:`, error);
            // Could integrate with error reporting service here
          }}
          onLoad={() => {
            console.log(`Page ${pageId} loaded successfully`);
            // Could track page views or analytics here
          }}
        />
      </PageWrapper>
    </DatabaseThemeProvider>
  );
}

// Page configuration removed - not supported in client components