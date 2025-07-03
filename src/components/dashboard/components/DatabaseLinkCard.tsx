/**
 * Database Link Card Component
 * Navigation card for databases page
 */

import React from 'react';
import Link from 'next/link';
import { Database } from 'lucide-react';
import { DatabaseLinkCardProps } from '../types';

export const DatabaseLinkCard: React.FC<DatabaseLinkCardProps> = ({
  title,
  description,
  href,
  icon,
  theme,
  componentId,
  pageId
}) => {
  const IconComponent = icon === 'Database' ? Database : Database; // Default to Database

  return (
    <Link href={href} className="link-card" data-component-id={componentId}>
      <div className="link-card-content">
        <IconComponent className="link-card-icon" />
        <div>
          <h3 className="link-card-title">{title}</h3>
          <p className="link-card-description">{description}</p>
        </div>
      </div>
    </Link>
  );
};