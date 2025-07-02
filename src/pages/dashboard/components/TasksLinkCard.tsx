/**
 * Tasks Link Card Component
 * Navigation card for tasks page
 */

import React from 'react';
import Link from 'next/link';
import { CheckSquare } from 'lucide-react';
import { TasksLinkCardProps } from '../types';

export const TasksLinkCard: React.FC<TasksLinkCardProps> = ({
  title,
  description,
  href,
  icon,
  theme,
  componentId,
  pageId
}) => {
  const IconComponent = icon === 'CheckSquare' ? CheckSquare : CheckSquare; // Default to CheckSquare

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