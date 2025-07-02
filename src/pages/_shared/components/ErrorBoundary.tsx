/**
 * Error Boundary Components - Comprehensive error handling for page-centric architecture
 * Provides graceful error recovery and user feedback
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';

// Error types
export class PageError extends Error {
  constructor(
    message: string,
    public pageId?: string,
    public componentId?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'PageError';
  }
}

export class ConfigurationError extends Error {
  constructor(
    message: string,
    public configPath?: string,
    public validationErrors?: string[]
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class ComponentError extends Error {
  constructor(
    message: string,
    public componentId: string,
    public componentType: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ComponentError';
  }
}

// Error boundary props and state
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Main Error Boundary Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId?: NodeJS.Timeout;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Report to error tracking service
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  delayedReset = (delay: number = 100) => {
    this.resetTimeoutId = setTimeout(this.resetErrorBoundary, delay);
  };

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    // This would integrate with error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };
    
    console.error('Error Report:', errorReport);
    // TODO: Send to error tracking service
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetErrorBoundary={this.resetErrorBoundary}
          errorId={this.state.errorId}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback Component
 */
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetErrorBoundary: () => void;
  errorId: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetErrorBoundary,
  errorId
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  
  const getErrorType = (error: Error | null): string => {
    if (!error) return 'Unknown Error';
    
    if (error instanceof PageError) return 'Page Error';
    if (error instanceof ConfigurationError) return 'Configuration Error';
    if (error instanceof ComponentError) return 'Component Error';
    
    return error.name || 'Application Error';
  };

  const getErrorIcon = (error: Error | null): string => {
    if (error instanceof ConfigurationError) return '⚙️';
    if (error instanceof ComponentError) return '🧩';
    if (error instanceof PageError) return '📄';
    return '⚠️';
  };

  return (
    <div className="error-fallback">
      <div className="error-content">
        <div className="error-icon">
          {getErrorIcon(error)}
        </div>
        
        <h1 className="error-title">
          {getErrorType(error)}
        </h1>
        
        <p className="error-message">
          {error?.message || 'An unexpected error occurred'}
        </p>
        
        <div className="error-actions">
          <button 
            onClick={resetErrorBoundary}
            className="retry-button"
          >
            Try Again
          </button>
          
          <Link href="/" className="home-button">
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="details-button"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        {showDetails && (
          <div className="error-details">
            <div className="error-section">
              <h3>Error Details</h3>
              <div className="error-info">
                <strong>Error ID:</strong> {errorId}
              </div>
              <div className="error-info">
                <strong>Type:</strong> {error?.name || 'Unknown'}
              </div>
              <div className="error-info">
                <strong>Time:</strong> {new Date().toLocaleString()}
              </div>
            </div>
            
            {error?.stack && (
              <div className="error-section">
                <h3>Stack Trace</h3>
                <pre className="error-stack">
                  {error.stack}
                </pre>
              </div>
            )}
            
            {errorInfo?.componentStack && (
              <div className="error-section">
                <h3>Component Stack</h3>
                <pre className="error-stack">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .error-fallback {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        }
        
        .error-content {
          max-width: 600px;
          width: 100%;
          background: white;
          border-radius: 16px;
          padding: 3rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #fecaca;
          text-align: center;
        }
        
        .error-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .error-title {
          font-size: 2rem;
          font-weight: 700;
          color: #dc2626;
          margin-bottom: 1rem;
        }
        
        .error-message {
          font-size: 1.125rem;
          color: #7f1d1d;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        
        .retry-button, .home-button, .details-button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .retry-button {
          background: #dc2626;
          color: white;
        }
        
        .retry-button:hover {
          background: #b91c1c;
        }
        
        .home-button {
          background: #3b82f6;
          color: white;
          display: inline-block;
        }
        
        .home-button:hover {
          background: #2563eb;
        }
        
        .details-button {
          background: #6b7280;
          color: white;
        }
        
        .details-button:hover {
          background: #4b5563;
        }
        
        .error-details {
          text-align: left;
          border-top: 1px solid #e5e7eb;
          padding-top: 2rem;
          margin-top: 2rem;
        }
        
        .error-section {
          margin-bottom: 1.5rem;
        }
        
        .error-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        
        .error-info {
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .error-stack {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 1rem;
          font-size: 0.75rem;
          overflow-x: auto;
          color: #374151;
          white-space: pre-wrap;
          max-height: 200px;
          overflow-y: auto;
        }
        
        @media (max-width: 768px) {
          .error-content {
            padding: 2rem;
          }
          
          .error-title {
            font-size: 1.5rem;
          }
          
          .error-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .retry-button, .home-button, .details-button {
            width: 100%;
            max-width: 200px;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Specific error boundary for page components
 */
interface PageErrorBoundaryProps extends ErrorBoundaryProps {
  pageId: string;
}

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  pageId,
  children,
  ...props
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Enhance error with page context
    const pageError = new PageError(
      `Error in page '${pageId}': ${error.message}`,
      pageId,
      undefined,
      error
    );
    
    props.onError?.(pageError, errorInfo);
  };

  return (
    <ErrorBoundary {...props} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

/**
 * HOC for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for error reporting
 */
export const useErrorHandler = () => {
  const reportError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    // This would integrate with error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };
    
    console.error('Error Report:', errorReport);
    // TODO: Send to error tracking service
  }, []);

  return { reportError };
};