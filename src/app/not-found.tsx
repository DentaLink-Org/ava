/**
 * 404 Not Found Page
 * Handles invalid routes and missing pages in the page-centric architecture
 */

'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-description">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="available-pages">
          <h2>Available Pages:</h2>
          <div className="page-links">
            <Link href="/" className="page-link">
              <div className="page-card">
                <h3>Dashboard</h3>
                <p>Admin overview with KPIs and navigation</p>
              </div>
            </Link>
            
            <Link href="/databases" className="page-link">
              <div className="page-card">
                <h3>Databases</h3>
                <p>Database management and schema editor</p>
              </div>
            </Link>
            
            <Link href="/tasks" className="page-link">
              <div className="page-card">
                <h3>Tasks</h3>
                <p>Task management with kanban board</p>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="actions">
          <Link href="/" className="home-button">
            Go to Dashboard
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .not-found-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        }
        
        .not-found-content {
          max-width: 800px;
          width: 100%;
          text-align: center;
          background: white;
          border-radius: 16px;
          padding: 3rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .error-code {
          font-size: 8rem;
          font-weight: 900;
          color: #ef4444;
          line-height: 1;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .error-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1rem;
        }
        
        .error-description {
          font-size: 1.125rem;
          color: #6b7280;
          margin-bottom: 3rem;
          line-height: 1.6;
        }
        
        .available-pages h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1.5rem;
        }
        
        .page-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .page-card {
          padding: 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
          transition: all 0.2s ease;
        }
        
        .page-link:hover .page-card {
          border-color: #3b82f6;
          background: #eff6ff;
          transform: translateY(-2px);
        }
        
        .page-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        
        .page-card p {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.4;
        }
        
        .page-link {
          text-decoration: none;
        }
        
        .actions {
          margin-top: 2rem;
        }
        
        .home-button {
          display: inline-block;
          padding: 0.75rem 2rem;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }
        
        .home-button:hover {
          background: #2563eb;
        }
        
        @media (max-width: 768px) {
          .not-found-content {
            padding: 2rem;
          }
          
          .error-code {
            font-size: 6rem;
          }
          
          .error-title {
            font-size: 2rem;
          }
          
          .page-links {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}