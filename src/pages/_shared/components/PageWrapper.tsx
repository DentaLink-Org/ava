/**
 * Page Wrapper Component - Provides navigation and layout for page-centric architecture
 * Replaces the old global layout system with a flexible page-level wrapper
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Navigation, Breadcrumb } from './Navigation';
import { ThemeSelector } from './ThemeSelector';

interface PageWrapperProps {
  pageId: string;
  children: React.ReactNode;
  showNavigation?: boolean;
  showBreadcrumbs?: boolean;
  navigationCompact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  pageId,
  children,
  showNavigation = true,
  showBreadcrumbs = true,
  navigationCompact = false,
  className = '',
  style
}) => {
  // Use localStorage to persist navigation collapse state across pages
  const [isNavigationCollapsed, setIsNavigationCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('navigation-collapsed');
      return saved !== null ? JSON.parse(saved) : navigationCompact;
    }
    return navigationCompact;
  });

  const toggleNavigation = () => {
    const newState = !isNavigationCollapsed;
    setIsNavigationCollapsed(newState);
    // Persist state to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('navigation-collapsed', JSON.stringify(newState));
    }
  };

  // Sync with localStorage changes (in case of multiple tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('navigation-collapsed');
        if (saved !== null) {
          setIsNavigationCollapsed(JSON.parse(saved));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className={`page-wrapper ${className}`} style={style}>
      {showNavigation && (
        <aside className="page-navigation">
          <Navigation 
            compact={isNavigationCollapsed}
            showIcons={true}
          />
          <button 
            className="navigation-toggle"
            onClick={toggleNavigation}
            aria-label={isNavigationCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            <ToggleIcon collapsed={isNavigationCollapsed} />
          </button>
        </aside>
      )}
      
      <main className={`page-main ${showNavigation ? 'with-navigation' : ''}`}>
        {showBreadcrumbs && (
          <header className="page-header">
            <div className="page-header-content">
              <Breadcrumb routeId={pageId} />
              <ThemeSelector size="small" showLabel={false} />
            </div>
          </header>
        )}
        
        <div className="page-content">
          {children}
        </div>
      </main>
      
      <style jsx>{`
        .page-wrapper {
          display: flex;
          min-height: 100vh;
          background: var(--color-background);
        }
        
        .page-navigation {
          position: relative;
          flex-shrink: 0;
          /* Isolate navigation from page styles */
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', 'Helvetica Neue', sans-serif !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
        }
        
        .navigation-toggle {
          position: absolute;
          top: 1rem;
          right: -12px;
          width: 24px;
          height: 24px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s ease;
        }
        
        .navigation-toggle:hover {
          background: var(--color-hover);
        }
        
        .page-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0; /* Prevent flex overflow */
        }
        
        .page-main.with-navigation {
          margin-left: 0;
        }
        
        .page-header {
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          padding: 0 2rem;
        }
        
        .page-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 60px;
        }
        
        .page-content {
          flex: 1;
          padding: 0;
          overflow: hidden;
        }
        
        @media (max-width: 768px) {
          .page-wrapper {
            flex-direction: column;
          }
          
          .page-navigation {
            order: 2;
          }
          
          .page-main {
            order: 1;
            margin-left: 0;
          }
          
          .navigation-toggle {
            display: none;
          }
          
          .page-header {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Toggle icon component
 */
interface ToggleIconProps {
  collapsed: boolean;
}

const ToggleIcon: React.FC<ToggleIconProps> = ({ collapsed }) => {
  return (
    <svg 
      width="12" 
      height="12" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      style={{ 
        transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease'
      }}
    >
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
};

/**
 * Simple page layout component for pages that don't need full navigation
 */
interface SimplePageLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SimplePageLayout: React.FC<SimplePageLayoutProps> = ({
  children,
  title,
  className = '',
  style
}) => {
  return (
    <div className={`simple-page-layout ${className}`} style={style}>
      {title && (
        <header className="simple-page-header">
          <h1>{title}</h1>
        </header>
      )}
      
      <main className="simple-page-content">
        {children}
      </main>
      
      <style jsx>{`
        .simple-page-layout {
          min-height: 100vh;
          background: var(--color-background);
          padding: 2rem;
        }
        
        .simple-page-header {
          margin-bottom: 2rem;
        }
        
        .simple-page-header h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text);
        }
        
        .simple-page-content {
          background: var(--color-surface);
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
          .simple-page-layout {
            padding: 1rem;
          }
          
          .simple-page-content {
            padding: 1rem;
          }
          
          .simple-page-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};