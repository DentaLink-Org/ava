/**
 * Welcome Header Component
 * Dashboard page header with enhanced title and subtitle presentation
 */

import React from 'react';
import { WelcomeHeaderProps } from '../types';

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  title,
  subtitle,
  theme,
  componentId,
  pageId
}) => {
  return (
    <div className="welcome-header enhanced" data-component-id={componentId}>
      <div className="welcome-header-content">
        <div className="title-container">
          <h1 className="welcome-title">
            <span className="title-highlight">{title}</span>
          </h1>
          <div className="title-decoration"></div>
        </div>
        <p className="welcome-subtitle">
          <span className="subtitle-icon">✨</span>
          {subtitle}
        </p>
      </div>
      <div className="welcome-background-effect"></div>
    </div>
  );
};