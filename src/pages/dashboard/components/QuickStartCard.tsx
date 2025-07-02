/**
 * Quick Start Card Component
 * Informational card with primary action
 */

import React from 'react';
import Link from 'next/link';
import { Database } from 'lucide-react';
import { QuickStartCardProps } from '../types';

export const QuickStartCard: React.FC<QuickStartCardProps> = ({
  title,
  description,
  primaryAction,
  theme,
  componentId,
  pageId
}) => {
  return (
    <div className="quick-start-card" data-component-id={componentId}>
      <div className="quick-start-header">
        <Database className="quick-start-icon" />
        <h3 className="quick-start-title">{title}</h3>
      </div>
      <p className="quick-start-description">
        {description}{' '}
        <Link href={primaryAction.href} className="quick-start-link">
          {primaryAction.text}
        </Link>
      </p>
    </div>
  );
};