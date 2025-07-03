/**
 * Playground Container Component
 * Loads playground-specific styles and provides layout structure
 */

import '../styles.css';
import React from 'react';

interface PlaygroundContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PlaygroundContainer: React.FC<PlaygroundContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`playground-page-container ${className}`}>
      <div className="playground-content-grid">
        {children}
      </div>
    </div>
  );
};

export default PlaygroundContainer;