/**
 * Dashboard Container Component
 * Loads dashboard-specific styles and provides layout structure
 */

import '../styles.css';
import React from 'react';

interface DashboardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`dashboard-page-container ${className}`}>
      <div className="dashboard-content-grid">
        {children}
      </div>
    </div>
  );
};

export default DashboardContainer;