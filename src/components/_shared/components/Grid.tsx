/**
 * Grid Component
 * A responsive grid layout component for organizing content
 */

'use client';

import React from 'react';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number | 'auto' | 'fit';
  gap?: number;
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  minWidth?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 'auto',
  gap = 4,
  responsive,
  minWidth = '250px',
  className = '',
  ...props
}) => {
  let gridClasses = '';
  
  if (typeof cols === 'number') {
    gridClasses = `grid-cols-${cols}`;
  } else if (cols === 'auto') {
    gridClasses = `grid-cols-[repeat(auto-fit,minmax(${minWidth},1fr))]`;
  } else if (cols === 'fit') {
    gridClasses = `grid-cols-[repeat(auto-fill,minmax(${minWidth},1fr))]`;
  }
  
  // Add responsive classes if provided
  if (responsive) {
    if (responsive.sm) gridClasses += ` sm:grid-cols-${responsive.sm}`;
    if (responsive.md) gridClasses += ` md:grid-cols-${responsive.md}`;
    if (responsive.lg) gridClasses += ` lg:grid-cols-${responsive.lg}`;
    if (responsive.xl) gridClasses += ` xl:grid-cols-${responsive.xl}`;
  }
  
  const gapClass = `gap-${gap}`;
  const classes = `grid ${gridClasses} ${gapClass} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};