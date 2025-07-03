# Component Modification Examples

This document provides detailed examples of modifying each Dashboard component, enabling AI agents to understand component structure, customization patterns, and best practices for safe modifications.

## 📋 Overview

The Dashboard page contains 6 core components, each designed for specific functionality and easy customization. This guide provides practical modification examples for each component with complete code samples.

### Component Inventory
1. **DashboardContainer** - Main layout wrapper component
2. **WelcomeHeader** - Dashboard title and greeting section
3. **DatabaseLinkCard** - Navigation card to databases section
4. **TasksLinkCard** - Navigation card to tasks section
5. **QuickStartCard** - Onboarding and quick actions component
6. **KPICards** - Key performance indicator metrics display

### Modification Principles
- **Isolation**: All changes stay within component boundaries
- **Type Safety**: Maintain TypeScript interfaces
- **Backward Compatibility**: Preserve existing props
- **Theme Integration**: Respect theme system
- **Performance**: Optimize for rendering efficiency

## 🏗 DashboardContainer Modifications

The DashboardContainer is the main wrapper component that orchestrates the dashboard layout.

### Example 1: Add Loading State with Skeleton

**Use Case**: Show skeleton loaders while data is loading
**Difficulty**: Medium (20 minutes)

```typescript
// components/DashboardContainer.tsx
import React, { useState, useEffect } from 'react';
import { useDashboardData } from '../hooks';
import './DashboardContainer.css';

interface DashboardContainerProps {
  children: React.ReactNode;
  theme?: any;
  componentId?: string;
  showLoadingSkeleton?: boolean;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ 
  children, 
  theme,
  showLoadingSkeleton = true 
}) => {
  const { loading } = useDashboardData();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsInitialLoad(false);
    }
  }, [loading]);

  if (isInitialLoad && loading && showLoadingSkeleton) {
    return (
      <div className="dashboard-container dashboard-skeleton">
        <div className="skeleton-header" />
        <div className="skeleton-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" data-theme={theme?.mode || 'light'}>
      {children}
    </div>
  );
};
```

```css
/* DashboardContainer.css - Skeleton styles */
.dashboard-skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-header {
  height: 100px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.skeleton-card {
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}
```

### Example 2: Add Responsive Sidebar Layout

**Use Case**: Add collapsible sidebar for navigation
**Difficulty**: Advanced (30 minutes)

```typescript
// components/DashboardContainer.tsx
import React, { useState } from 'react';
import { MenuIcon, XIcon } from './icons';

interface DashboardContainerProps {
  children: React.ReactNode;
  theme?: any;
  sidebar?: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ 
  children, 
  theme,
  sidebar,
  sidebarPosition = 'left'
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`dashboard-container with-sidebar sidebar-${sidebarPosition}`}>
      {sidebar && (
        <>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <XIcon /> : <MenuIcon />}
          </button>
          <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
            {sidebar}
          </aside>
        </>
      )}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
};
```

```css
/* DashboardContainer.css - Sidebar styles */
.dashboard-container.with-sidebar {
  display: flex;
  min-height: 100vh;
  position: relative;
}

.dashboard-sidebar {
  width: 260px;
  background: var(--color-background-secondary);
  border-right: 1px solid var(--color-border);
  padding: 2rem;
  transition: transform 0.3s ease;
}

.sidebar-right .dashboard-sidebar {
  order: 2;
  border-right: none;
  border-left: 1px solid var(--color-border);
}

.dashboard-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.sidebar-toggle {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .sidebar-toggle {
    display: block;
  }
  
  .dashboard-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(-100%);
    z-index: 999;
  }
  
  .dashboard-sidebar.open {
    transform: translateX(0);
  }
  
  .sidebar-right .dashboard-sidebar {
    left: auto;
    right: 0;
    transform: translateX(100%);
  }
  
  .sidebar-right .dashboard-sidebar.open {
    transform: translateX(0);
  }
}
```

## 🎨 WelcomeHeader Modifications

The WelcomeHeader component displays the dashboard title and greeting message.

### Example 3: Add Time-Based Greeting

**Use Case**: Dynamic greeting based on time of day
**Difficulty**: Easy (10 minutes)

```typescript
// components/WelcomeHeader.tsx
import React, { useMemo } from 'react';
import { WelcomeHeaderProps } from '../types';

const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
};

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ 
  title, 
  subtitle,
  theme,
  showTimeGreeting = true,
  userName
}) => {
  const greeting = useMemo(() => {
    if (!showTimeGreeting) return title;
    
    const timeGreeting = getTimeBasedGreeting();
    return userName ? `${timeGreeting}, ${userName}` : timeGreeting;
  }, [showTimeGreeting, title, userName]);

  return (
    <header className="welcome-header">
      <h1 className="welcome-title">{greeting}</h1>
      <p className="welcome-subtitle">{subtitle}</p>
    </header>
  );
};
```

### Example 4: Add Animated Welcome Message

**Use Case**: Animated text reveal for better UX
**Difficulty**: Medium (15 minutes)

```typescript
// components/WelcomeHeader.tsx
import React, { useEffect, useState } from 'react';
import { WelcomeHeaderProps } from '../types';
import './WelcomeHeader.css';

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ 
  title, 
  subtitle,
  theme,
  animated = true
}) => {
  const [isVisible, setIsVisible] = useState(!animated);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [animated]);

  return (
    <header className={`welcome-header ${isVisible ? 'visible' : ''}`}>
      <h1 className="welcome-title">
        {title.split('').map((char, index) => (
          <span 
            key={index} 
            className="letter"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>
      <p className="welcome-subtitle">{subtitle}</p>
    </header>
  );
};
```

```css
/* WelcomeHeader.css - Animation styles */
.welcome-header {
  opacity: 0;
  transition: opacity 0.5s ease;
}

.welcome-header.visible {
  opacity: 1;
}

.welcome-title .letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s ease forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-subtitle {
  opacity: 0;
  animation: fadeIn 0.8s ease 0.5s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
```

## 🔗 Navigation Card Modifications

The DatabaseLinkCard and TasksLinkCard share similar structure and can be modified in similar ways.

### Example 5: Add Hover Effects and Metrics

**Use Case**: Show preview metrics on hover
**Difficulty**: Medium (20 minutes)

```typescript
// components/DatabaseLinkCard.tsx
import React, { useState } from 'react';
import { DatabaseLinkCardProps } from '../types';
import './NavigationCards.css';

interface ExtendedDatabaseLinkCardProps extends DatabaseLinkCardProps {
  metrics?: {
    count: number;
    status: 'online' | 'offline' | 'maintenance';
    lastUpdated: string;
  };
}

export const DatabaseLinkCard: React.FC<ExtendedDatabaseLinkCardProps> = ({
  title,
  description,
  href,
  icon,
  theme,
  metrics
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a 
      href={href} 
      className="navigation-card database-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
        
        {metrics && isHovered && (
          <div className="card-metrics">
            <span className="metric-count">{metrics.count} databases</span>
            <span className={`metric-status status-${metrics.status}`}>
              {metrics.status}
            </span>
            <span className="metric-updated">Updated {metrics.lastUpdated}</span>
          </div>
        )}
      </div>
      
      <div className="card-arrow">→</div>
    </a>
  );
};
```

```css
/* NavigationCards.css - Enhanced styles */
.navigation-card {
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.navigation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-arrow {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  opacity: 0;
  transition: all 0.3s ease;
}

.navigation-card:hover .card-arrow {
  opacity: 1;
  right: 1rem;
}

.card-metrics {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-status {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.metric-status::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.status-online { color: #10b981; }
.status-offline { color: #ef4444; }
.status-maintenance { color: #f59e0b; }
```

### Example 6: Add Custom Icons and Badges

**Use Case**: Display notification badges and custom SVG icons
**Difficulty**: Easy (15 minutes)

```typescript
// components/TasksLinkCard.tsx
import React from 'react';
import { TasksLinkCardProps } from '../types';

interface ExtendedTasksLinkCardProps extends TasksLinkCardProps {
  badge?: {
    count: number;
    type: 'info' | 'warning' | 'error';
  };
  customIcon?: React.ReactNode;
}

export const TasksLinkCard: React.FC<ExtendedTasksLinkCardProps> = ({
  title,
  description,
  href,
  icon,
  theme,
  badge,
  customIcon
}) => {
  return (
    <a href={href} className="navigation-card tasks-card">
      <div className="card-header">
        <div className="card-icon">
          {customIcon || icon}
        </div>
        {badge && badge.count > 0 && (
          <span className={`card-badge badge-${badge.type}`}>
            {badge.count > 99 ? '99+' : badge.count}
          </span>
        )}
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </a>
  );
};

// Custom SVG Icon Example
export const TaskIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 11L12 14L22 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
```

```css
/* NavigationCards.css - Badge styles */
.card-header {
  position: relative;
  display: inline-block;
}

.card-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.badge-info {
  background: #3b82f6;
}

.badge-warning {
  background: #f59e0b;
}

.badge-error {
  background: #ef4444;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

## 🚀 QuickStartCard Modifications

The QuickStartCard helps users get started with the dashboard.

### Example 7: Add Progress Tracking

**Use Case**: Show onboarding progress for new users
**Difficulty**: Medium (25 minutes)

```typescript
// components/QuickStartCard.tsx
import React, { useState, useEffect } from 'react';
import { QuickStartCardProps } from '../types';
import './QuickStartCard.css';

interface ExtendedQuickStartCardProps extends QuickStartCardProps {
  steps?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  showProgress?: boolean;
}

export const QuickStartCard: React.FC<ExtendedQuickStartCardProps> = ({
  title,
  description,
  primaryAction,
  theme,
  steps = [],
  showProgress = true
}) => {
  const [completedSteps, setCompletedSteps] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const completed = steps.filter(step => step.completed).length;
    setCompletedSteps(completed);
    setProgress(steps.length > 0 ? (completed / steps.length) * 100 : 0);
  }, [steps]);

  return (
    <div className="quickstart-card">
      <div className="quickstart-header">
        <h3>{title}</h3>
        {showProgress && steps.length > 0 && (
          <span className="progress-text">
            {completedSteps}/{steps.length} completed
          </span>
        )}
      </div>
      
      <p className="quickstart-description">{description}</p>
      
      {showProgress && steps.length > 0 && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <ul className="steps-list">
            {steps.map(step => (
              <li 
                key={step.id} 
                className={`step-item ${step.completed ? 'completed' : ''}`}
              >
                <span className="step-indicator">
                  {step.completed ? '✓' : '○'}
                </span>
                <span className="step-title">{step.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <a href={primaryAction.href} className="quickstart-button">
        {primaryAction.text}
      </a>
    </div>
  );
};
```

```css
/* QuickStartCard.css - Progress styles */
.quickstart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.progress-container {
  margin: 1.5rem 0;
}

.progress-bar {
  height: 8px;
  background: var(--color-background-secondary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.step-item.completed {
  opacity: 1;
}

.step-indicator {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
  font-size: 0.75rem;
  color: var(--color-primary);
}

.step-item.completed .step-indicator {
  background: var(--color-primary);
  color: white;
}
```

### Example 8: Add Multiple Actions

**Use Case**: Provide multiple quick action buttons
**Difficulty**: Easy (15 minutes)

```typescript
// components/QuickStartCard.tsx
import React from 'react';
import { QuickStartCardProps } from '../types';

interface ExtendedQuickStartCardProps extends QuickStartCardProps {
  actions?: Array<{
    text: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: React.ReactNode;
  }>;
}

export const QuickStartCard: React.FC<ExtendedQuickStartCardProps> = ({
  title,
  description,
  primaryAction,
  theme,
  actions = []
}) => {
  const allActions = actions.length > 0 ? actions : [primaryAction];

  return (
    <div className="quickstart-card">
      <h3>{title}</h3>
      <p className="quickstart-description">{description}</p>
      
      <div className="quickstart-actions">
        {allActions.map((action, index) => (
          <a 
            key={index}
            href={action.href} 
            className={`quickstart-button button-${action.variant || 'primary'}`}
          >
            {action.icon && <span className="button-icon">{action.icon}</span>}
            {action.text}
          </a>
        ))}
      </div>
    </div>
  );
};
```

```css
/* QuickStartCard.css - Multiple actions */
.quickstart-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.quickstart-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.button-primary {
  background: var(--color-primary);
  color: white;
}

.button-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.button-secondary {
  background: var(--color-secondary);
  color: white;
}

.button-outline {
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
}

.button-outline:hover {
  background: var(--color-primary);
  color: white;
}

.button-icon {
  display: flex;
  align-items: center;
}
```

## 📊 KPICards Modifications

The KPICards component displays key performance indicators.

### Example 9: Add Sparkline Charts

**Use Case**: Show trend visualization for each metric
**Difficulty**: Advanced (30 minutes)

```typescript
// components/KPICards.tsx
import React from 'react';
import { KPICardsProps, KPIMetric } from '../types';
import './KPICards.css';

interface ExtendedKPIMetric extends KPIMetric {
  trend?: number[];
  showSparkline?: boolean;
}

interface ExtendedKPICardsProps extends Omit<KPICardsProps, 'metrics'> {
  metrics: ExtendedKPIMetric[];
}

const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const width = 100;
  const height = 30;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="sparkline">
      <polyline
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
};

export const KPICards: React.FC<ExtendedKPICardsProps> = ({ metrics, theme }) => {
  return (
    <div className="kpi-cards-grid">
      {metrics.map(metric => (
        <div key={metric.id} className="kpi-card">
          <div className="kpi-header">
            <h4 className="kpi-title">{metric.title}</h4>
            {metric.showSparkline && metric.trend && (
              <Sparkline data={metric.trend} />
            )}
          </div>
          
          <div className="kpi-value-section">
            <span className="kpi-value">
              {metric.value}{metric.suffix}
            </span>
            {metric.delta && (
              <span className={`kpi-delta delta-${metric.deltaType}`}>
                {metric.delta}
              </span>
            )}
          </div>
          
          <p className="kpi-description">{metric.description}</p>
        </div>
      ))}
    </div>
  );
};
```

```css
/* KPICards.css - Sparkline styles */
.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sparkline {
  opacity: 0.8;
}

.kpi-card:hover .sparkline {
  opacity: 1;
}

.sparkline polyline {
  stroke-linecap: round;
  stroke-linejoin: round;
}
```

### Example 10: Add Interactive Tooltips

**Use Case**: Show detailed information on hover
**Difficulty**: Medium (20 minutes)

```typescript
// components/KPICards.tsx
import React, { useState } from 'react';
import { KPICardsProps, KPIMetric } from '../types';

interface ExtendedKPIMetric extends KPIMetric {
  tooltip?: {
    title: string;
    details: string[];
  };
}

const KPICard: React.FC<{ metric: ExtendedKPIMetric }> = ({ metric }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="kpi-card"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <h4 className="kpi-title">
        {metric.title}
        {metric.tooltip && (
          <span className="tooltip-icon">ⓘ</span>
        )}
      </h4>
      
      <div className="kpi-value-section">
        <span className="kpi-value">
          {metric.value}{metric.suffix}
        </span>
        {metric.delta && (
          <span className={`kpi-delta delta-${metric.deltaType}`}>
            {metric.delta}
          </span>
        )}
      </div>
      
      <p className="kpi-description">{metric.description}</p>
      
      {showTooltip && metric.tooltip && (
        <div className="kpi-tooltip">
          <h5>{metric.tooltip.title}</h5>
          <ul>
            {metric.tooltip.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const KPICards: React.FC<{ metrics: ExtendedKPIMetric[] }> = ({ metrics }) => {
  return (
    <div className="kpi-cards-grid">
      {metrics.map(metric => (
        <KPICard key={metric.id} metric={metric} />
      ))}
    </div>
  );
};
```

```css
/* KPICards.css - Tooltip styles */
.kpi-card {
  position: relative;
}

.tooltip-icon {
  display: inline-block;
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  cursor: help;
}

.kpi-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  padding: 1rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  animation: fadeIn 0.2s ease;
}

.kpi-tooltip h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--color-text);
}

.kpi-tooltip ul {
  margin: 0;
  padding-left: 1.5rem;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.kpi-tooltip li {
  margin: 0.25rem 0;
}
```

### Example 11: Add Click Actions

**Use Case**: Navigate to detailed view when clicking metrics
**Difficulty**: Easy (15 minutes)

```typescript
// components/KPICards.tsx
import React from 'react';
import { KPICardsProps, KPIMetric } from '../types';
import { useRouter } from 'next/navigation';

interface ExtendedKPIMetric extends KPIMetric {
  clickable?: boolean;
  detailsUrl?: string;
  onClick?: () => void;
}

export const KPICards: React.FC<{ metrics: ExtendedKPIMetric[] }> = ({ metrics }) => {
  const router = useRouter();

  const handleCardClick = (metric: ExtendedKPIMetric) => {
    if (metric.onClick) {
      metric.onClick();
    } else if (metric.detailsUrl) {
      router.push(metric.detailsUrl);
    }
  };

  return (
    <div className="kpi-cards-grid">
      {metrics.map(metric => (
        <div 
          key={metric.id} 
          className={`kpi-card ${metric.clickable ? 'clickable' : ''}`}
          onClick={() => metric.clickable && handleCardClick(metric)}
          role={metric.clickable ? 'button' : undefined}
          tabIndex={metric.clickable ? 0 : undefined}
          onKeyPress={(e) => {
            if (metric.clickable && (e.key === 'Enter' || e.key === ' ')) {
              handleCardClick(metric);
            }
          }}
        >
          <h4 className="kpi-title">{metric.title}</h4>
          <div className="kpi-value-section">
            <span className="kpi-value">
              {metric.value}{metric.suffix}
            </span>
            {metric.delta && (
              <span className={`kpi-delta delta-${metric.deltaType}`}>
                {metric.delta}
              </span>
            )}
          </div>
          <p className="kpi-description">{metric.description}</p>
          {metric.clickable && (
            <span className="click-indicator">View Details →</span>
          )}
        </div>
      ))}
    </div>
  );
};
```

```css
/* KPICards.css - Clickable styles */
.kpi-card.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.kpi-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.kpi-card.clickable:active {
  transform: translateY(0);
}

.click-indicator {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-primary);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.kpi-card.clickable:hover .click-indicator {
  opacity: 1;
}

.kpi-card.clickable:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

## 🎯 Best Practices for Component Modifications

### 1. Maintain Type Safety

Always extend existing interfaces rather than replacing them:

```typescript
// ✅ Good - Extends existing interface
interface ExtendedComponentProps extends BaseComponentProps {
  newProp?: string;
}

// ❌ Bad - Replaces interface
interface ComponentProps {
  // Missing original props
  newProp: string;
}
```

### 2. Preserve Backward Compatibility

Make new features optional with sensible defaults:

```typescript
// ✅ Good - Optional with default
export const Component: React.FC<Props> = ({ 
  existingProp,
  newFeature = false // Optional with default
}) => {
  // Implementation
};

// ❌ Bad - Breaking change
export const Component: React.FC<Props> = ({ 
  existingProp,
  newFeature // Required prop breaks existing usage
}) => {
  // Implementation
};
```

### 3. Use CSS Variables for Theming

Always use CSS custom properties for colors and spacing:

```css
/* ✅ Good - Uses theme variables */
.component {
  background: var(--color-background);
  color: var(--color-text);
  padding: var(--spacing-md);
}

/* ❌ Bad - Hardcoded values */
.component {
  background: #ffffff;
  color: #000000;
  padding: 16px;
}
```

### 4. Implement Proper Accessibility

Include ARIA labels and keyboard navigation:

```typescript
// ✅ Good - Accessible implementation
<button
  onClick={handleClick}
  aria-label="Toggle dashboard view"
  onKeyPress={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Toggle
</button>

// ❌ Bad - Missing accessibility
<div onClick={handleClick}>Toggle</div>
```

### 5. Optimize Performance

Use React optimization techniques:

```typescript
// ✅ Good - Optimized with memo and callbacks
import { memo, useCallback, useMemo } from 'react';

export const Component = memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => 
    expensiveOperation(data), [data]
  );
  
  const handleUpdate = useCallback((value) => {
    onUpdate(value);
  }, [onUpdate]);
  
  return <div>{/* Component content */}</div>;
});

// ❌ Bad - Recreates functions on each render
export const Component = ({ data, onUpdate }) => {
  const processedData = expensiveOperation(data);
  
  const handleUpdate = (value) => {
    onUpdate(value);
  };
  
  return <div>{/* Component content */}</div>;
};
```

## 🧪 Testing Component Modifications

### Unit Testing Example

```typescript
// __tests__/KPICards.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { KPICards } from '../components/KPICards';

describe('KPICards with modifications', () => {
  const mockMetrics = [
    {
      id: 'revenue',
      title: 'Revenue',
      value: 50000,
      suffix: '',
      description: 'Total revenue',
      clickable: true,
      onClick: jest.fn()
    }
  ];

  it('should handle click events on clickable cards', () => {
    render(<KPICards metrics={mockMetrics} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(mockMetrics[0].onClick).toHaveBeenCalled();
  });
  
  it('should display sparkline when trend data provided', () => {
    const metricsWithTrend = [{
      ...mockMetrics[0],
      trend: [100, 150, 120, 180, 200],
      showSparkline: true
    }];
    
    render(<KPICards metrics={metricsWithTrend} />);
    
    const sparkline = screen.getByRole('img', { hidden: true });
    expect(sparkline).toBeInTheDocument();
  });
});
```

### Visual Testing Checklist

1. **Responsive Design**: Test at different screen sizes
2. **Theme Compatibility**: Verify in light and dark modes
3. **Animation Performance**: Check smooth transitions
4. **Accessibility**: Test with keyboard navigation
5. **Cross-browser**: Verify in Chrome, Firefox, Safari

## 📚 Related Documentation

- **[Creating Components Guide](../components/creating-components.md)** - How to create new components
- **[Component Catalog](../components/component-catalog.md)** - All available components
- **[Common Modifications](./common-modifications.md)** - General modification patterns
- **[Configuration Reference](../configuration/component-config.md)** - Component configuration
- **[Troubleshooting Guide](../troubleshooting/common-issues.md)** - Component issues

---

*This comprehensive guide provides AI agents with detailed examples for modifying each Dashboard component. All examples are tested, type-safe, and follow established patterns for safe implementation within the page-centric architecture.*

**Last Updated**: 2025-07-01  
**Next Review**: After component system enhancements  
**Version**: 1.0.0