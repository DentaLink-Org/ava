/**
 * Root Layout - Minimal layout for page-centric architecture
 * This layout provides only the essential structure needed for all pages
 */

import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import '../pages/dashboard/styles.css';
import '../pages/databases/styles.css';
import '../pages/tasks/styles.css';
import '../pages/themes/styles.css';
import '../pages/_shared/components/ThemeSelector.css';

export const metadata: Metadata = {
  title: 'Claude Admin Dashboard',
  description: 'Page-centric admin dashboard with complete isolation',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/* Minimal root layout - pages handle their own layout completely */}
        {children}
      </body>
    </html>
  );
}