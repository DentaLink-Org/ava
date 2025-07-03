/**
 * Main Page Renderer - Core component that renders pages from configuration
 * Brings together configuration parsing, component registry, and theme system
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  PageConfig, 
  ComponentConfig, 
  PageComponent, 
  PageRendererProps, 
  PageRendererState, 
  ComponentError,
  ConfigurationError
} from './types';
// ConfigParser removed - using API endpoint for config loading
import { componentRegistry } from './ComponentRegistry';
import { ThemeProvider, defaultTheme } from './ThemeProvider';
import { DatabaseThemeProvider } from './DatabaseThemeProvider';

// Import component registrations to ensure they're loaded
import '../../dashboard/register-components';
import '../../databases/register-components';
import '../../tasks/register-components';
import '../../themes/register-components';
import '../../page-manager/register-components';
import '../../playground/register-components';

/**
 * Error Boundary for safe component rendering
 */
class ComponentErrorBoundary extends React.Component<
  { 
    componentId: string; 
    children: React.ReactNode; 
    onError: (error: Error, componentId: string) => void;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Component error in ${this.props.componentId}:`, error, errorInfo);
    this.props.onError(error, this.props.componentId);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="component-error-fallback"
          style={{
            padding: '16px',
            border: '2px dashed #ef4444',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            textAlign: 'center'
          }}
        >
          <h3>Component Error</h3>
          <p>Component "{this.props.componentId}" failed to render</p>
          <details style={{ marginTop: '8px', textAlign: 'left' }}>
            <summary>Error Details</summary>
            <pre style={{ fontSize: '12px', marginTop: '8px' }}>
              {this.state.error?.message}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main Page Renderer Component
 */
export const PageRenderer: React.FC<PageRendererProps> = ({
  pageId,
  config: externalConfig,
  onError,
  onLoad
}) => {
  const [state, setState] = useState<PageRendererState>({
    config: null,
    loading: true,
    error: null,
    components: {}
  });

  const configLoadedRef = useRef(false);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load configuration
  const loadConfig = useCallback(async () => {
    if (configLoadedRef.current && !externalConfig) {
      return; // Already loaded
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let config: PageConfig;

      if (externalConfig) {
        // Use provided configuration
        config = externalConfig;
      } else {
        // Load configuration from API endpoint instead of file system
        const response = await fetch(`/api/pages/${pageId}/config`);
        if (!response.ok) {
          throw new Error(`Failed to load configuration: ${response.statusText}`);
        }
        config = await response.json();
      }

      // Validate configuration (client-side validation only)
      if (!config || typeof config !== 'object') {
        throw new ConfigurationError('Invalid configuration received');
      }

      // Load components for this page
      const pageComponents = componentRegistry.getPageComponents(pageId);

      if (mountedRef.current) {
        setState({
          config,
          loading: false,
          error: null,
          components: pageComponents
        });
        configLoadedRef.current = true;
        onLoad?.();
      }
    } catch (error) {
      console.error(`Failed to load page configuration for '${pageId}':`, error);
      const configError = error instanceof Error ? error : new Error('Unknown configuration error');
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: configError
        }));
        onError?.(configError);
      }
    }
  }, [pageId, externalConfig, onError, onLoad]);

  // Load configuration on mount and pageId change
  useEffect(() => {
    configLoadedRef.current = false;
    loadConfig();
  }, [loadConfig]);

  // Handle component errors
  const handleComponentError = useCallback((error: Error, componentId: string) => {
    console.error(`Component error in ${componentId}:`, error);
    const componentError = new ComponentError(
      `Component '${componentId}' failed to render: ${error.message}`,
      componentId,
      state.components[componentId]?.name || 'unknown'
    );
    onError?.(componentError);
  }, [onError, state.components]);

  // Render component from configuration
  const renderComponent = useCallback((componentConfig: ComponentConfig): React.ReactNode => {
    const { id, type, position, props, style, className } = componentConfig;
    
    try {
      // Get component from registry
      const Component = componentRegistry.get(pageId, type);
      
      if (!Component) {
        console.warn(`Component type '${type}' not found for page '${pageId}'. Rendering fallback.`);
        return (
          <div
            key={id}
            className={`component-fallback ${className || ''}`}
            style={{
              // Use grid positioning for grid layout, flex order for flex layout
              ...(state.config?.layout.type === 'grid' ? {
                gridColumn: `${position.col} / span ${position.span}`,
                gridRow: position.rowSpan ? `${position.row} / span ${position.rowSpan}` : position.row,
              } : {
                order: (position as any).order || position.row || 0,
              }),
              padding: '16px',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              textAlign: 'center',
              color: '#6b7280',
              ...style
            }}
          >
            <div>Component Not Found</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              Type: {type}
            </div>
          </div>
        );
      }

      // Render component with error boundary
      return (
        <ComponentErrorBoundary
          key={id}
          componentId={id}
          onError={handleComponentError}
        >
          <div
            className={`component-wrapper ${className || ''}`}
            style={{
              // Use grid positioning for grid layout, flex order for flex layout
              ...(state.config?.layout.type === 'grid' ? {
                gridColumn: `${position.col} / span ${position.span}`,
                gridRow: position.rowSpan ? `${position.row} / span ${position.rowSpan}` : position.row,
              } : {
                order: (position as any).order || position.row || 0,
              }),
              ...style
            }}
          >
            <Component 
              {...props} 
              componentId={id}
              pageId={pageId}
              theme={state.config?.theme || {
                colors: { primary: '#f97316', background: '#f3f4f6', text: '#111827' },
                spacing: { base: 4, small: 2, large: 8 }
              }}
            />
          </div>
        </ComponentErrorBoundary>
      );
    } catch (error) {
      console.error(`Error rendering component '${id}':`, error);
      return (
        <div
          key={id}
          className="component-error"
          style={{
            // Use grid positioning for grid layout, flex order for flex layout
            ...(state.config?.layout.type === 'grid' ? {
              gridColumn: `${position.col} / span ${position.span}`,
              gridRow: position.rowSpan ? `${position.row} / span ${position.rowSpan}` : position.row,
            } : {
              order: (position as any).order || position.row || 0,
            }),
            padding: '16px',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            textAlign: 'center'
          }}
        >
          <div>Render Error</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Component: {id} ({type})
          </div>
        </div>
      );
    }
  }, [pageId, state.config?.theme, handleComponentError]);

  // Generate grid styles based on layout configuration
  const gridStyles = useMemo((): React.CSSProperties => {
    if (!state.config) return {};

    const { layout } = state.config;
    
    const styles: React.CSSProperties = {
      display: 'grid',
      gap: `${layout.gap}px`,
      padding: `${layout.padding}px`,
      minHeight: '100vh'
    };

    switch (layout.type) {
      case 'grid':
        styles.gridTemplateColumns = `repeat(${layout.columns || 12}, 1fr)`;
        if (layout.rows) {
          styles.gridTemplateRows = `repeat(${layout.rows}, auto)`;
        }
        break;
      
      case 'flex':
        styles.display = 'flex';
        styles.flexDirection = 'column';
        styles.gap = `${layout.gap}px`;
        break;
      
      case 'custom':
        // Custom layout - let components handle their own positioning
        styles.position = 'relative';
        break;
    }

    return styles;
  }, [state.config]);

  // Loading state
  if (state.loading) {
    return (
      <div 
        className="page-loading"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontSize: '18px',
          color: '#6b7280'
        }}
      >
        <div>Loading page {pageId}...</div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div 
        className="page-error"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '32px',
          textAlign: 'center'
        }}
      >
        <div style={{
          backgroundColor: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%'
        }}>
          <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>
            Page Load Error
          </h1>
          <p style={{ color: '#7f1d1d', marginBottom: '16px' }}>
            Failed to load page "{pageId}"
          </p>
          <details style={{ textAlign: 'left', marginTop: '16px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Error Details
            </summary>
            <pre style={{ 
              fontSize: '14px', 
              marginTop: '8px', 
              backgroundColor: '#f3f4f6',
              padding: '12px',
              borderRadius: '6px',
              overflow: 'auto'
            }}>
              {state.error.message}
            </pre>
          </details>
          <button
            onClick={loadConfig}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No configuration loaded
  if (!state.config) {
    return (
      <div 
        className="page-no-config"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontSize: '18px',
          color: '#6b7280'
        }}
      >
        <div>No configuration found for page {pageId}</div>
      </div>
    );
  }

  // Render page content (DatabaseThemeProvider is now higher up in the hierarchy)
  return (
    <div 
      className={`page-renderer page-${pageId}`}
      data-page-id={pageId}
      style={gridStyles}
    >
      {state.config.components.map(renderComponent)}
    </div>
  );
};

// Export convenience hooks for page rendering
export const usePageRenderer = (pageId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback((error: Error) => {
    setIsLoading(false);
    setError(error);
  }, []);

  return {
    isLoading,
    error,
    handleLoad,
    handleError,
    PageRenderer: useCallback(
      (props: Omit<PageRendererProps, 'pageId' | 'onLoad' | 'onError'>) => (
        <PageRenderer
          {...props}
          pageId={pageId}
          onLoad={handleLoad}
          onError={handleError}
        />
      ),
      [pageId, handleLoad, handleError]
    )
  };
};

// Export utility for rendering pages with minimal setup
export const renderPage = (
  pageId: string, 
  config?: PageConfig,
  container?: HTMLElement
): React.ReactElement => {
  return (
    <PageRenderer
      pageId={pageId}
      config={config}
      onError={(error) => console.error(`Page ${pageId} error:`, error)}
      onLoad={() => console.log(`Page ${pageId} loaded successfully`)}
    />
  );
};