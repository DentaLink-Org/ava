/**
 * Root page - renders dashboard directly
 */

'use client';

import React from 'react';
import { PageRenderer } from '../components/_shared/runtime/PageRenderer';
import { PageWrapper } from '../components/_shared/components/PageWrapper';
import { DatabaseThemeProvider } from '../components/_shared/runtime/DatabaseThemeProvider';

export default function RootPage() {
  return (
    <DatabaseThemeProvider pageId="dashboard">
      <PageWrapper pageId="dashboard">
        <PageRenderer pageId="dashboard" />
      </PageWrapper>
    </DatabaseThemeProvider>
  );
}