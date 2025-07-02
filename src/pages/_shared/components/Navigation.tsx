/**
 * Navigation Component - Dynamic navigation for page-centric architecture
 * Uses route registry to build navigation automatically
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { routeUtils, navigationHelpers } from '../utils/route-utils';

// Fallback types for build stability
type RouteMetadata = {
  id: string;
  path: string;
  title: string;
  description?: string;
  icon?: string;
  order?: number;
  visible?: boolean;
  requiresAuth?: boolean;
  roles?: string[];
  category?: string;
};

interface NavigationProps {
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
  showIcons?: boolean;
}

/**
 * Main Navigation Component
 */
export const Navigation: React.FC<NavigationProps> = ({
  className = '',
  style,
  compact = false,
  showIcons = true
}) => {
  const [navigationItems, setNavigationItems] = useState<RouteMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Load navigation items
  useEffect(() => {
    const loadNavigation = async () => {
      try {
        const items = navigationHelpers.getSidebarItems();
        setNavigationItems(items);
      } catch (error) {
        console.error('Failed to load navigation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNavigation();
  }, []);

  // Get current route ID from pathname
  const currentRouteId = routeUtils.resolveRouteFromPath(pathname || '');

  if (loading) {
    return (
      <div className={`navigation-loading ${className}`} style={style}>
        <div className="loading-skeleton">
          <div className="skeleton-item"></div>
          <div className="skeleton-item"></div>
          <div className="skeleton-item"></div>
        </div>
      </div>
    );
  }

  return (
    <nav className={`navigation ${compact ? 'navigation-compact' : ''} ${className}`} style={style}>
      <div className="navigation-header">
        <Link href="/" className="navigation-logo">
          <h1>Claude Admin</h1>
        </Link>
      </div>
      
      <div className="navigation-items">
        {navigationItems.map((item) => {
          const isActive = navigationHelpers.isActiveRoute(item.id, currentRouteId || '');
          const icon = showIcons ? navigationHelpers.getRouteIcon(item.id) : null;
          
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`navigation-item ${isActive ? 'active' : ''}`}
            >
              <div className="navigation-item-content">
                {icon && (
                  <div className="navigation-icon">
                    <NavigationIcon name={icon} />
                  </div>
                )}
                <span className="navigation-label">{item.title}</span>
                {item.description && !compact && (
                  <span className="navigation-description">{item.description}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      
      <style jsx>{`
        .navigation {
          display: flex;
          flex-direction: column;
          background: var(--color-surface);
          border-right: 1px solid var(--color-border);
          min-height: 100vh;
          width: 280px;
          padding: 0;
          font-family: var(--font-family, 'Inter, system-ui, sans-serif');
        }
        
        .navigation-compact {
          width: 80px;
        }
        
        .navigation-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--color-border);
        }
        
        .navigation-logo {
          text-decoration: none;
          color: var(--color-text);
        }
        
        .navigation-logo h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .navigation-compact .navigation-logo h1 {
          display: none;
        }
        
        .navigation-items {
          flex: 1;
          padding: 1rem 0;
        }
        
        .navigation-item {
          display: block;
          padding: 0.75rem 1.5rem;
          margin: 0.25rem 0.75rem;
          border-radius: 8px;
          text-decoration: none;
          color: var(--color-textSecondary);
          transition: all 0.2s ease;
        }
        
        .navigation-item:hover {
          background: var(--color-hover);
          color: var(--color-text);
        }
        
        .navigation-item.active {
          background: var(--color-primary);
          color: white;
        }
        
        .navigation-item-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .navigation-compact .navigation-item-content {
          justify-content: center;
        }
        
        .navigation-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
        
        .navigation-label {
          font-weight: 500;
          font-size: 0.875rem;
        }
        
        .navigation-compact .navigation-label {
          display: none;
        }
        
        .navigation-description {
          font-size: 0.75rem;
          opacity: 0.8;
          display: block;
          margin-top: 0.25rem;
        }
        
        .navigation-loading {
          width: 280px;
          min-height: 100vh;
          background: var(--color-surface);
          border-right: 1px solid var(--color-border);
          padding: 1.5rem;
        }
        
        .loading-skeleton {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .skeleton-item {
          height: 40px;
          background: #f3f4f6;
          border-radius: 8px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @media (max-width: 768px) {
          .navigation {
            width: 100%;
            min-height: auto;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .navigation-items {
            display: flex;
            overflow-x: auto;
            padding: 0.5rem;
          }
          
          .navigation-item {
            flex-shrink: 0;
            margin: 0 0.25rem;
            white-space: nowrap;
          }
        }
      `}</style>
    </nav>
  );
};

/**
 * Simple icon component for navigation
 */
interface NavigationIconProps {
  name: string | null;
  size?: number;
}

const NavigationIcon: React.FC<NavigationIconProps> = ({ name, size = 20 }) => {
  const getIconPath = (iconName: string): string => {
    switch (iconName) {
      case 'dashboard':
        return 'M3 7V3a1 1 0 011-1h2a1 1 0 011 1v4h6V3a1 1 0 011-1h2a1 1 0 011 1v4h2a1 1 0 011 1v2a1 1 0 01-1 1h-2v6a1 1 0 01-1 1h-2a1 1 0 01-1-1V11H8v6a1 1 0 01-1 1H5a1 1 0 01-1-1V11H2a1 1 0 01-1-1V8a1 1 0 011-1h1z';
      case 'database':
        return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
      case 'tasks':
        return 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z';
      default:
        return 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
    }
  };

  if (!name) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%', 
          background: '#d1d5db' 
        }} 
      />
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d={getIconPath(name)} />
    </svg>
  );
};

/**
 * Breadcrumb Component
 */
interface BreadcrumbProps {
  routeId: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  routeId,
  className = '',
  style
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<RouteMetadata[]>([]);

  useEffect(() => {
    const items = navigationHelpers.getBreadcrumbItems(routeId);
    setBreadcrumbs(items);
  }, [routeId]);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className={`breadcrumb ${className}`} style={style}>
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link href="/" className="breadcrumb-link">
            Home
          </Link>
        </li>
        {breadcrumbs.map((item, index) => (
          <li key={item.id} className="breadcrumb-item">
            <span className="breadcrumb-separator">/</span>
            {index === breadcrumbs.length - 1 ? (
              <span className="breadcrumb-current">{item.title}</span>
            ) : (
              <Link href={item.path} className="breadcrumb-link">
                {item.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
      
      <style jsx>{`
        .breadcrumb {
          padding: 1rem 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .breadcrumb-list {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 0.5rem;
        }
        
        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .breadcrumb-link {
          color: #6b7280;
          text-decoration: none;
          font-size: 0.875rem;
        }
        
        .breadcrumb-link:hover {
          color: #374151;
        }
        
        .breadcrumb-current {
          color: #111827;
          font-weight: 500;
          font-size: 0.875rem;
        }
        
        .breadcrumb-separator {
          color: #d1d5db;
          font-size: 0.875rem;
        }
      `}</style>
    </nav>
  );
};