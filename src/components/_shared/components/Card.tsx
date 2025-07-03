/**
 * Card Components
 * Reusable card components for structured content layout
 */

'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg';
  
  const variantClasses = {
    default: 'border border-gray-200',
    outlined: 'border-2 border-gray-300',
    elevated: 'shadow-lg border border-gray-100'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-6 pb-4 ${className}`} {...props}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {actions && (
          <div className="ml-4 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  align = 'left',
  className = '',
  ...props
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };
  
  const classes = `px-6 py-4 pt-2 border-t border-gray-100 flex items-center ${alignClasses[align]} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};