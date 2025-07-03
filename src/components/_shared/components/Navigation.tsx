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
          <div className="logo-container">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <path d="M16 2L28 8v16L16 30 4 24V8L16 2z" fill="url(#logoGradient)" />
                <path d="M16 8L24 12v8L16 24 8 20v-8L16 8z" fill="white" fillOpacity="0.2" />
                <circle cx="16" cy="16" r="3" fill="white" />
              </svg>
            </div>
            <div className="logo-text">
              <h1>AVA</h1>
              <span className="logo-tagline">AI Platform</span>
            </div>
          </div>
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
                <div className="navigation-text">
                  <span className="navigation-label">{item.title}</span>
                </div>
                {isActive && <div className="navigation-indicator" />}
              </div>
            </Link>
          );
        })}
      </div>
      
      <style jsx>{`
        .navigation {
          /* AI Startup Design Variables - Completely Isolated */
          --nav-primary: #3b82f6 !important;
          --nav-primary-hover: #2563eb !important;
          --nav-primary-light: #dbeafe !important;
          --nav-accent: #8b5cf6 !important;
          --nav-surface: #ffffff !important;
          --nav-surface-elevated: #fafbfc !important;
          --nav-surface-hover: #f8fafc !important;
          --nav-border: #e2e8f0 !important;
          --nav-text: #0f172a !important;
          --nav-text-secondary: #475569 !important;
          --nav-text-muted: #64748b !important;
          --nav-spacing: 0.75rem !important;
          --nav-radius: 12px !important;
          --nav-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
          --nav-shadow-hover: 0 4px 12px -2px rgba(0, 0, 0, 0.1) !important;
          --nav-shadow-elevated: 0 8px 25px -8px rgba(0, 0, 0, 0.2) !important;
          --nav-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          --nav-glow: 0 0 20px rgba(59, 130, 246, 0.15) !important;
          
          /* Main Navigation Container - Force Isolation */
          display: flex !important;
          flex-direction: column !important;
          background: #ffffff !important;
          border-right: 1px solid #e2e8f0 !important;
          min-height: 100vh !important;
          width: 280px !important;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          padding: 0 !important;
          margin: 0 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', 'Helvetica Neue', sans-serif !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          line-height: 1.5 !important;
          backdrop-filter: blur(20px) saturate(180%);
          position: relative;
          overflow: hidden;
          color: #0f172a !important;
          /* Reset any inherited styles */
          text-decoration: none !important;
          text-transform: none !important;
          letter-spacing: normal !important;
        }
        
        .navigation::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--nav-primary), transparent);
          opacity: 0.3;
        }
        
        .navigation::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.02) 0%, transparent 70%);
          pointer-events: none;
        }
        
        .navigation-compact {
          width: 80px !important;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .navigation-header {
          padding: 2rem 1.5rem 1.5rem;
          border-bottom: 1px solid var(--nav-border) !important;
          position: relative;
          background: linear-gradient(135deg, var(--nav-surface) 0%, var(--nav-surface-elevated) 100%) !important;
        }
        
        .navigation-logo {
          text-decoration: none;
          color: var(--nav-text) !important;
          transition: var(--nav-transition);
          display: block;
        }
        
        .navigation-logo:hover {
          transform: translateY(-1px);
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          font-family: inherit !important;
        }
        
        .logo-icon {
          position: relative;
          width: 32px;
          height: 32px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
          transition: var(--nav-transition);
        }
        
        .navigation-logo:hover .logo-icon {
          transform: scale(1.05) rotate(2deg);
          filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3));
        }
        
        .logo-text {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        
        .logo-text h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--nav-text) !important;
          letter-spacing: -0.02em;
          font-family: inherit !important;
          /* Removed gradient for better compatibility */
        }
        
        .logo-tagline {
          font-size: 0.6875rem;
          font-weight: 500;
          color: var(--nav-text-muted) !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: -0.125rem;
          font-family: inherit !important;
        }
        
        .navigation-compact .logo-text {
          display: none !important;
        }
        
        .navigation-compact .logo-container {
          justify-content: center !important;
        }
        
        .navigation-items {
          flex: 1;
          padding: 1.5rem 0;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--nav-border) transparent;
        }
        
        .navigation-items::-webkit-scrollbar {
          width: 4px;
        }
        
        .navigation-items::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .navigation-items::-webkit-scrollbar-thumb {
          background: var(--nav-border);
          border-radius: 2px;
        }
        
        .navigation-item {
          display: block !important;
          padding: 0 !important;
          margin: 0.375rem 1rem !important;
          border-radius: 12px !important;
          text-decoration: none !important;
          color: #475569 !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          font-family: inherit !important;
          border: 1px solid transparent !important;
          overflow: hidden !important;
          line-height: 1.5 !important;
          letter-spacing: normal !important;
          text-transform: none !important;
        }
        
        .navigation-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 0;
          background: linear-gradient(135deg, var(--nav-primary), var(--nav-accent)) !important;
          transition: var(--nav-transition);
          border-radius: 0 6px 6px 0;
        }
        
        .navigation-item:hover {
          background: var(--nav-surface-hover) !important;
          color: var(--nav-text) !important;
          border-color: var(--nav-primary-light) !important;
          transform: translateX(2px);
          box-shadow: var(--nav-shadow-hover) !important;
        }
        
        .navigation-item:hover::before {
          width: 3px;
        }
        
        .navigation-item:hover .navigation-icon {
          opacity: 1;
          transform: scale(1.1);
        }
        
        .navigation-item.active {
          background: linear-gradient(135deg, var(--nav-primary-light), rgba(59, 130, 246, 0.08)) !important;
          color: var(--nav-primary) !important;
          border-color: var(--nav-primary) !important;
          font-weight: 600;
          box-shadow: var(--nav-shadow-elevated), var(--nav-glow) !important;
        }
        
        .navigation-item.active::before {
          width: 3px;
        }
        
        .navigation-item.active .navigation-icon {
          opacity: 1;
          transform: scale(1.1);
        }
        
        .navigation-item-content {
          display: flex !important;
          align-items: center !important;
          padding: 0.875rem 1rem !important;
          gap: 0.875rem !important;
          position: relative !important;
          font-size: 14px !important;
          font-family: inherit !important;
          font-weight: inherit !important;
        }
        
        .navigation-compact .navigation-item-content {
          justify-content: center !important;
          padding: 0.875rem 0.5rem !important;
        }
        
        .navigation-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          opacity: 0.8;
          transition: var(--nav-transition);
          position: relative;
        }
        
        .navigation-text {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .navigation-label {
          font-weight: 500 !important;
          font-size: 14px !important;
          letter-spacing: -0.01em !important;
          line-height: 1.2 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', 'Helvetica Neue', sans-serif !important;
          color: inherit !important;
          text-decoration: none !important;
          text-transform: none !important;
        }
        
        .navigation-compact .navigation-text {
          display: none !important;
        }
        
        .navigation-indicator {
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, var(--nav-primary), var(--nav-accent)) !important;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 6px rgba(59, 130, 246, 0.6) !important;
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        /* Removed badge styles for cleaner design */
        
        .navigation-loading {
          width: 280px;
          min-height: 100vh;
          background: var(--nav-surface);
          border-right: 1px solid var(--nav-border);
          padding: 1.5rem;
        }
        
        .loading-skeleton {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .skeleton-item {
          height: 48px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          border-radius: var(--nav-radius);
          animation: shimmer 1.5s infinite;
          position: relative;
        }
        
        .skeleton-item::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 1rem;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
          .navigation {
            --nav-primary: #60a5fa !important;
            --nav-primary-hover: #3b82f6 !important;
            --nav-primary-light: #1e3a8a !important;
            --nav-accent: #a78bfa !important;
            --nav-surface: #0f172a !important;
            --nav-surface-elevated: #1e293b !important;
            --nav-surface-hover: #334155 !important;
            --nav-border: #334155 !important;
            --nav-text: #f1f5f9 !important;
            --nav-text-secondary: #cbd5e1 !important;
            --nav-text-muted: #94a3b8 !important;
            --nav-glow: 0 0 20px rgba(96, 165, 250, 0.2) !important;
          }
          
          .navigation-header {
            background: linear-gradient(135deg, var(--nav-surface) 0%, var(--nav-surface-elevated) 100%) !important;
          }
          
          .skeleton-item {
            background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%) !important;
          }
          
          .skeleton-item::after {
            background: #475569 !important;
          }
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .navigation {
            width: 100%;
            min-height: auto;
            border-right: none;
            border-bottom: 1px solid var(--nav-border);
          }
          
          .navigation-header {
            padding: 1rem 1.5rem;
          }
          
          .navigation-items {
            display: flex;
            overflow-x: auto;
            padding: 0.75rem;
            gap: 0.5rem;
          }
          
          .navigation-item {
            flex-shrink: 0;
            margin: 0;
            white-space: nowrap;
            border-radius: 24px;
          }
          
          .navigation-item-content {
            padding: 0.5rem 1rem;
          }
          
          .navigation-item::before {
            display: none;
          }
          
          .navigation-item:hover {
            transform: none;
          }
          
          /* Removed badge display in mobile */
        }
        
        /* Accessibility */
        .navigation-item:focus-visible {
          outline: 2px solid var(--nav-primary);
          outline-offset: 2px;
        }
        
        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .navigation-item,
          .navigation-icon,
          .navigation-logo,
          .logo-icon,
          .navigation-indicator,
          .badge-status {
            transition: none;
            animation: none;
          }
          
          .skeleton-item {
            animation: none;
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

// Helper function to get badge content for navigation items (removed badges)
const getItemBadge = (itemId: string): React.ReactNode => {
  // Removed all badges for cleaner design
  return null;
};

const NavigationIcon: React.FC<NavigationIconProps> = ({ name, size = 20 }) => {
  const getIconPath = (iconName: string): string => {
    switch (iconName) {
      case 'dashboard':
        return 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z';
      case 'database':
        return 'M12 3C8.5 3 5.73 4.58 5.73 6.5v11c0 1.92 2.77 3.5 6.27 3.5s6.27-1.58 6.27-3.5v-11C18.27 4.58 15.5 3 12 3zm0 2c2.5 0 4.27.84 4.27 1.5S14.5 8 12 8s-4.27-.84-4.27-1.5S9.5 5 12 5zm0 14c-2.5 0-4.27-.84-4.27-1.5v-1.64c1.1.68 2.63 1.14 4.27 1.14s3.17-.46 4.27-1.14v1.64c0 .66-1.77 1.5-4.27 1.5z';
      case 'tasks':
        return 'M3 5h2V3c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2h2c1.1 0 2 .9 2 2v13c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2zm6 0h6V3H9v2zm-4 6l1.41 1.41L9 9.83l6.59 6.59L17 15l-8-8z';
      case 'playground':
        return 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z';
      default:
        return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
    }
  };

  if (!name) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '6px', 
          background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} 
      >
        <div style={{ width: '60%', height: '60%', background: '#94a3b8', borderRadius: '2px' }} />
      </div>
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }}
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