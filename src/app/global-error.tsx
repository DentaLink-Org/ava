/**
 * Global Error Page - Handles critical application errors
 * This is Next.js's global error boundary for unrecoverable errors
 */

'use client';

import React from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    // Log the error to console and error reporting service
    console.error('Global Error:', error);
    
    // Report to error tracking service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      type: 'global-error'
    };
    
    console.error('Global Error Report:', errorReport);
    // TODO: Send to error tracking service
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="global-error-container">
          <div className="global-error-content">
            <div className="error-icon">💥</div>
            
            <h1 className="error-title">
              Critical Application Error
            </h1>
            
            <p className="error-description">
              The application encountered a critical error and cannot continue. 
              This is usually a temporary issue.
            </p>
            
            <div className="error-details">
              <strong>Error:</strong> {error.message}
              {error.digest && (
                <div>
                  <strong>Error ID:</strong> {error.digest}
                </div>
              )}
            </div>
            
            <div className="error-actions">
              <button 
                onClick={reset}
                className="retry-button"
              >
                Try Again
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="home-button"
              >
                Go to Dashboard
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className="reload-button"
              >
                Reload Page
              </button>
            </div>
            
            <div className="support-info">
              <p>If this problem persists, please:</p>
              <ul>
                <li>Clear your browser cache and cookies</li>
                <li>Try accessing the site in an incognito/private window</li>
                <li>Contact support with the error ID above</li>
              </ul>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          .global-error-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            font-family: system-ui, -apple-system, sans-serif;
          }
          
          .global-error-content {
            max-width: 600px;
            width: 100%;
            background: white;
            border-radius: 16px;
            padding: 3rem;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            text-align: center;
          }
          
          .error-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          .error-title {
            font-size: 2.5rem;
            font-weight: 800;
            color: #dc2626;
            margin-bottom: 1rem;
            line-height: 1.2;
          }
          
          .error-description {
            font-size: 1.125rem;
            color: #4b5563;
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          
          .error-details {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 2rem;
            text-align: left;
            font-size: 0.875rem;
            color: #374151;
          }
          
          .error-details strong {
            color: #111827;
          }
          
          .error-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 2rem;
          }
          
          .retry-button, .home-button, .reload-button {
            padding: 0.875rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.875rem;
          }
          
          .retry-button {
            background: #dc2626;
            color: white;
          }
          
          .retry-button:hover {
            background: #b91c1c;
            transform: translateY(-1px);
          }
          
          .home-button {
            background: #3b82f6;
            color: white;
          }
          
          .home-button:hover {
            background: #2563eb;
            transform: translateY(-1px);
          }
          
          .reload-button {
            background: #6b7280;
            color: white;
          }
          
          .reload-button:hover {
            background: #4b5563;
            transform: translateY(-1px);
          }
          
          .support-info {
            border-top: 1px solid #e5e7eb;
            padding-top: 2rem;
            text-align: left;
            color: #6b7280;
            font-size: 0.875rem;
          }
          
          .support-info p {
            margin-bottom: 0.5rem;
            font-weight: 600;
          }
          
          .support-info ul {
            margin: 0;
            padding-left: 1.5rem;
          }
          
          .support-info li {
            margin-bottom: 0.5rem;
          }
          
          @media (max-width: 768px) {
            .global-error-container {
              padding: 1rem;
            }
            
            .global-error-content {
              padding: 2rem;
            }
            
            .error-title {
              font-size: 2rem;
            }
            
            .error-actions {
              flex-direction: column;
              align-items: center;
            }
            
            .retry-button, .home-button, .reload-button {
              width: 100%;
              max-width: 250px;
            }
          }
        `}</style>
      </body>
    </html>
  );
}