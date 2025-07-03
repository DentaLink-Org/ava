/**
 * Welcome Header Component
 * Dashboard page header with title and subtitle
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
    <div className="welcome-header" data-component-id={componentId}>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
};