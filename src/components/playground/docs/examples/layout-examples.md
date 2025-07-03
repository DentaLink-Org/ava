# Layout Modification Examples

This document provides comprehensive examples of modifying the Dashboard page layout system, enabling AI agents to create responsive, flexible, and visually appealing dashboard arrangements.

## 📋 Overview

The Dashboard uses a CSS Grid-based layout system that provides maximum flexibility for component positioning and responsive design. This guide covers practical layout modifications from simple grid adjustments to complex responsive patterns.

### Layout System Features
- **12-column Grid System** - Flexible column-based positioning
- **Responsive Breakpoints** - Mobile, tablet, and desktop layouts
- **Dynamic Spacing** - Configurable gaps and padding
- **Component Positioning** - Row/column placement with spans
- **Layout Presets** - Common patterns for quick implementation

### Configuration Structure
```yaml
layout:
  type: "grid"        # Layout type (grid, flex, masonry)
  columns: 12         # Number of grid columns
  gap: 4              # Gap between components (rem units)
  padding: 6          # Container padding (rem units)
```

## 🎨 Grid Layout Modifications

### Example 1: Three-Column Dashboard Layout

**Use Case**: Create a three-column layout for better content organization
**Difficulty**: Easy (10 minutes)

#### Configuration Update
```yaml
# config.yaml - Three-column layout
layout:
  type: "grid"
  columns: 12
  gap: 2
  padding: 4

components:
  # Header spans full width
  - id: "welcome-header"
    type: "WelcomeHeader"
    position:
      col: 1
      row: 1
      span: 12
      
  # Three equal columns
  - id: "database-link-card"
    type: "DatabaseLinkCard"
    position:
      col: 1
      row: 2
      span: 4
      
  - id: "tasks-link-card"
    type: "TasksLinkCard"
    position:
      col: 5
      row: 2
      span: 4
      
  - id: "quick-start-card"
    type: "QuickStartCard"
    position:
      col: 9
      row: 2
      span: 4
      
  # KPI cards below
  - id: "kpi-cards"
    type: "KPICards"
    position:
      col: 1
      row: 3
      span: 12
```

#### CSS Implementation
```css
/* styles.css - Three-column layout */
.dashboard-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
  padding: 4rem;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .dashboard-container {
    padding: 2rem;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }
  
  /* Override spans for mobile */
  .dashboard-container > * {
    grid-column: 1 / -1 !important;
  }
}
```

### Example 2: Masonry Layout

**Use Case**: Pinterest-style layout with variable height components
**Difficulty**: Medium (20 minutes)

#### Configuration
```yaml
# config.yaml - Masonry layout
layout:
  type: "masonry"
  columns: 3
  gap: 2
  padding: 3
```

#### CSS Implementation
```css
/* styles.css - Masonry layout */
.dashboard-container[data-layout="masonry"] {
  column-count: 3;
  column-gap: 2rem;
  padding: 3rem;
}

.dashboard-container[data-layout="masonry"] > * {
  break-inside: avoid;
  margin-bottom: 2rem;
}

/* Responsive columns */
@media (max-width: 1200px) {
  .dashboard-container[data-layout="masonry"] {
    column-count: 2;
  }
}

@media (max-width: 768px) {
  .dashboard-container[data-layout="masonry"] {
    column-count: 1;
  }
}
```

#### Component Wrapper Update
```typescript
// components/DashboardContainer.tsx
export const DashboardContainer: React.FC<Props> = ({ children, theme }) => {
  const layout = config.layout.type || 'grid';
  
  return (
    <div 
      className="dashboard-container"
      data-layout={layout}
      style={{
        '--columns': config.layout.columns,
        '--gap': `${config.layout.gap}rem`,
        '--padding': `${config.layout.padding}rem`
      }}
    >
      {children}
    </div>
  );
};
```

### Example 3: Asymmetric Grid Layout

**Use Case**: Emphasize important components with larger sizes
**Difficulty**: Easy (15 minutes)

#### Configuration
```yaml
# config.yaml - Asymmetric layout
layout:
  type: "grid"
  columns: 12
  gap: 3
  padding: 4

components:
  # Large header
  - id: "welcome-header"
    type: "WelcomeHeader"
    position:
      col: 1
      row: 1
      span: 12
      
  # Main content area (8 columns)
  - id: "kpi-cards"
    type: "KPICards"
    position:
      col: 1
      row: 2
      span: 8
      rowSpan: 2
      
  # Sidebar (4 columns)
  - id: "database-link-card"
    type: "DatabaseLinkCard"
    position:
      col: 9
      row: 2
      span: 4
      
  - id: "tasks-link-card"
    type: "TasksLinkCard"
    position:
      col: 9
      row: 3
      span: 4
      
  # Full width footer
  - id: "quick-start-card"
    type: "QuickStartCard"
    position:
      col: 1
      row: 4
      span: 12
```

#### CSS for Row Spanning
```css
/* styles.css - Row spanning support */
.dashboard-container > *[data-row-span="2"] {
  grid-row: span 2;
}

.dashboard-container > *[data-row-span="3"] {
  grid-row: span 3;
}

/* Height adjustments for spanning elements */
.kpi-cards[data-row-span] {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.kpi-cards[data-row-span] .kpi-cards-grid {
  flex: 1;
  align-content: space-between;
}
```

## 📱 Responsive Layout Patterns

### Example 4: Mobile-First Responsive Layout

**Use Case**: Optimize for mobile devices with progressive enhancement
**Difficulty**: Medium (25 minutes)

#### Configuration
```yaml
# config.yaml - Responsive layout
layout:
  type: "responsive-grid"
  breakpoints:
    mobile:
      columns: 4
      gap: 2
      padding: 2
    tablet:
      columns: 8
      gap: 3
      padding: 3
    desktop:
      columns: 12
      gap: 4
      padding: 4
```

#### CSS Implementation
```css
/* styles.css - Mobile-first responsive */
/* Base mobile styles */
.dashboard-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  padding: 2rem;
}

/* Component mobile positioning */
.component-wrapper {
  grid-column: span 4;
}

/* Tablet breakpoint (768px) */
@media (min-width: 768px) {
  .dashboard-container {
    grid-template-columns: repeat(8, 1fr);
    gap: 3rem;
    padding: 3rem;
  }
  
  .component-wrapper[data-tablet-span="4"] {
    grid-column: span 4;
  }
  
  .component-wrapper[data-tablet-span="8"] {
    grid-column: span 8;
  }
}

/* Desktop breakpoint (1024px) */
@media (min-width: 1024px) {
  .dashboard-container {
    grid-template-columns: repeat(12, 1fr);
    gap: 4rem;
    padding: 4rem;
  }
  
  .component-wrapper[data-desktop-span="4"] {
    grid-column: span 4;
  }
  
  .component-wrapper[data-desktop-span="6"] {
    grid-column: span 6;
  }
  
  .component-wrapper[data-desktop-span="12"] {
    grid-column: span 12;
  }
}
```

#### Component Wrapper with Responsive Props
```typescript
// components/ComponentWrapper.tsx
interface ComponentWrapperProps {
  mobileSpan?: number;
  tabletSpan?: number;
  desktopSpan?: number;
  children: React.ReactNode;
}

export const ComponentWrapper: React.FC<ComponentWrapperProps> = ({
  mobileSpan = 4,
  tabletSpan = 4,
  desktopSpan = 6,
  children
}) => {
  return (
    <div
      className="component-wrapper"
      data-mobile-span={mobileSpan}
      data-tablet-span={tabletSpan}
      data-desktop-span={desktopSpan}
    >
      {children}
    </div>
  );
};
```

### Example 5: Collapsible Sections

**Use Case**: Allow users to collapse/expand dashboard sections
**Difficulty**: Advanced (30 minutes)

#### Component Implementation
```typescript
// components/CollapsibleSection.tsx
import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = true,
  children
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`collapsible-section ${isOpen ? 'open' : 'closed'}`}>
      <button
        className="section-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3>{title}</h3>
        <span className="toggle-icon">{isOpen ? '−' : '+'}</span>
      </button>
      <div className="section-content">
        {children}
      </div>
    </div>
  );
};
```

#### Configuration with Sections
```yaml
# config.yaml - Collapsible sections
layout:
  type: "sections"
  sections:
    - id: "overview"
      title: "Overview"
      defaultOpen: true
      components: ["welcome-header", "kpi-cards"]
      
    - id: "navigation"
      title: "Quick Navigation"
      defaultOpen: true
      components: ["database-link-card", "tasks-link-card"]
      
    - id: "getting-started"
      title: "Getting Started"
      defaultOpen: false
      components: ["quick-start-card"]
```

#### CSS for Collapsible Sections
```css
/* styles.css - Collapsible sections */
.collapsible-section {
  margin-bottom: 2rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.section-header {
  width: 100%;
  padding: 1.5rem;
  background: var(--color-background-secondary);
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.section-header:hover {
  background: var(--color-background-hover);
}

.section-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.toggle-icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.section-content {
  padding: 1.5rem;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.collapsible-section.open .section-content {
  max-height: 2000px; /* Large enough for content */
}

.collapsible-section.closed .toggle-icon {
  transform: rotate(0deg);
}
```

## 🎯 Layout Presets

### Example 6: Dashboard Layout Presets

**Use Case**: Quick layout templates for common dashboard patterns
**Difficulty**: Easy (10 minutes)

#### Preset Configurations
```yaml
# config.yaml - Using layout presets
layout:
  preset: "analytics" # Options: analytics, overview, detailed, minimal

# Preset definitions
presets:
  analytics:
    type: "grid"
    columns: 12
    gap: 3
    structure:
      - { component: "header", span: 12 }
      - { component: "metrics", span: 12 }
      - { component: "charts", span: 8 }
      - { component: "sidebar", span: 4 }
      
  overview:
    type: "grid"
    columns: 12
    gap: 4
    structure:
      - { component: "header", span: 12 }
      - { component: "nav-cards", span: 6, count: 2 }
      - { component: "kpis", span: 12 }
      - { component: "actions", span: 12 }
      
  minimal:
    type: "flex"
    direction: "column"
    gap: 2
    structure:
      - { component: "header" }
      - { component: "content" }
      - { component: "footer" }
```

#### Preset Implementation
```typescript
// utils/layoutPresets.ts
export const layoutPresets = {
  analytics: {
    grid: 'repeat(12, 1fr)',
    areas: `
      "header header header header header header header header header header header header"
      "metrics metrics metrics metrics metrics metrics metrics metrics metrics metrics metrics metrics"
      "charts charts charts charts charts charts charts charts sidebar sidebar sidebar sidebar"
    `
  },
  overview: {
    grid: 'repeat(12, 1fr)',
    areas: `
      "header header header header header header header header header header header header"
      "nav1 nav1 nav1 nav1 nav1 nav1 nav2 nav2 nav2 nav2 nav2 nav2"
      "kpis kpis kpis kpis kpis kpis kpis kpis kpis kpis kpis kpis"
      "actions actions actions actions actions actions actions actions actions actions actions actions"
    `
  },
  minimal: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  }
};
```

### Example 7: Split Screen Layout

**Use Case**: Side-by-side comparison or dual-purpose dashboard
**Difficulty**: Medium (20 minutes)

#### Configuration
```yaml
# config.yaml - Split screen layout
layout:
  type: "split"
  split:
    type: "vertical" # or "horizontal"
    ratio: "60/40"   # Left/Right or Top/Bottom
    resizable: true
    minSize: 300
```

#### Implementation
```typescript
// components/SplitLayout.tsx
import React, { useState } from 'react';

interface SplitLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  initialRatio?: number;
  minSize?: number;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
  leftContent,
  rightContent,
  initialRatio = 0.6,
  minSize = 300
}) => {
  const [splitRatio, setSplitRatio] = useState(initialRatio);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const container = document.querySelector('.split-layout');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const newRatio = (e.clientX - rect.left) / rect.width;
    
    setSplitRatio(Math.max(0.2, Math.min(0.8, newRatio)));
  };

  return (
    <div className="split-layout">
      <div 
        className="split-left" 
        style={{ width: `${splitRatio * 100}%` }}
      >
        {leftContent}
      </div>
      
      <div
        className="split-divider"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div className="divider-handle" />
      </div>
      
      <div 
        className="split-right"
        style={{ width: `${(1 - splitRatio) * 100}%` }}
      >
        {rightContent}
      </div>
    </div>
  );
};
```

#### CSS for Split Layout
```css
/* styles.css - Split layout */
.split-layout {
  display: flex;
  height: 100%;
  position: relative;
}

.split-left,
.split-right {
  overflow: auto;
  padding: 2rem;
}

.split-divider {
  width: 4px;
  background: var(--color-border);
  cursor: col-resize;
  position: relative;
  transition: background 0.2s ease;
}

.split-divider:hover {
  background: var(--color-primary);
}

.divider-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 40px;
  background: var(--color-text-secondary);
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.split-divider:hover .divider-handle {
  opacity: 0.5;
}

/* Horizontal split variant */
.split-layout.horizontal {
  flex-direction: column;
}

.split-layout.horizontal .split-divider {
  width: 100%;
  height: 4px;
  cursor: row-resize;
}
```

## 🔧 Advanced Layout Techniques

### Example 8: Dynamic Grid with Auto-Placement

**Use Case**: Automatically arrange components based on available space
**Difficulty**: Advanced (30 minutes)

#### Configuration
```yaml
# config.yaml - Auto-placement grid
layout:
  type: "auto-grid"
  minItemWidth: 300
  maxColumns: 4
  gap: 2
  autoFlow: "dense" # or "row", "column"
```

#### CSS Implementation
```css
/* styles.css - Auto-placement grid */
.dashboard-container[data-layout="auto-grid"] {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  grid-auto-flow: dense;
}

/* Size variants for components */
.component-small {
  grid-column: span 1;
  grid-row: span 1;
}

.component-medium {
  grid-column: span 2;
  grid-row: span 1;
}

.component-large {
  grid-column: span 2;
  grid-row: span 2;
}

.component-wide {
  grid-column: span 3;
  grid-row: span 1;
}

.component-tall {
  grid-column: span 1;
  grid-row: span 3;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .component-large,
  .component-wide {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .dashboard-container[data-layout="auto-grid"] {
    grid-template-columns: 1fr;
  }
  
  .component-small,
  .component-medium,
  .component-large,
  .component-wide,
  .component-tall {
    grid-column: span 1;
    grid-row: span 1;
  }
}
```

### Example 9: Tabbed Layout

**Use Case**: Organize dashboard into tabbed sections
**Difficulty**: Medium (25 minutes)

#### Component Implementation
```typescript
// components/TabbedLayout.tsx
import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabbedLayoutProps {
  tabs: Tab[];
  defaultTab?: string;
}

export const TabbedLayout: React.FC<TabbedLayoutProps> = ({
  tabs,
  defaultTab
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const activeTabContent = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="tabbed-layout">
      <div className="tab-header" role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className="tab-content" role="tabpanel" id={`tabpanel-${activeTab}`}>
        {activeTabContent?.content}
      </div>
    </div>
  );
};
```

#### Configuration
```yaml
# config.yaml - Tabbed layout
layout:
  type: "tabs"
  tabs:
    - id: "overview"
      label: "Overview"
      icon: "📊"
      components: ["welcome-header", "kpi-cards"]
      
    - id: "navigation"
      label: "Quick Links"
      icon: "🔗"
      components: ["database-link-card", "tasks-link-card"]
      
    - id: "help"
      label: "Help"
      icon: "❓"
      components: ["quick-start-card"]
```

#### CSS for Tabs
```css
/* styles.css - Tabbed layout */
.tabbed-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tab-header {
  display: flex;
  border-bottom: 2px solid var(--color-border);
  background: var(--color-background-secondary);
  padding: 0 1rem;
  overflow-x: auto;
}

.tab-button {
  padding: 1rem 2rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-button:hover {
  color: var(--color-text);
  background: var(--color-background-hover);
}

.tab-button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-icon {
  font-size: 1.25rem;
}

.tab-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .tab-header {
    padding: 0;
  }
  
  .tab-button {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
  
  .tab-label {
    display: none;
  }
  
  .tab-icon {
    font-size: 1.5rem;
  }
}
```

### Example 10: Floating Action Layout

**Use Case**: Add floating action buttons and panels
**Difficulty**: Advanced (30 minutes)

#### Component Implementation
```typescript
// components/FloatingLayout.tsx
import React, { useState } from 'react';

interface FloatingLayoutProps {
  children: React.ReactNode;
  floatingActions?: Array<{
    id: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }>;
}

export const FloatingLayout: React.FC<FloatingLayoutProps> = ({
  children,
  floatingActions = []
}) => {
  const [showActions, setShowActions] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  return (
    <div className="floating-layout">
      <div className="main-content">
        {children}
      </div>
      
      {floatingActions.length > 0 && (
        <div className={`floating-action-button ${showActions ? 'open' : ''}`}>
          <button
            className="fab-trigger"
            onClick={() => setShowActions(!showActions)}
            aria-label="Toggle actions"
          >
            {showActions ? '×' : '+'}
          </button>
          
          {showActions && (
            <div className="fab-actions">
              {floatingActions.map((action, index) => (
                <button
                  key={action.id}
                  className="fab-action"
                  onClick={action.onClick}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="fab-icon">{action.icon}</span>
                  <span className="fab-label">{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activePanel && (
        <div className="floating-panel">
          {/* Panel content based on activePanel */}
        </div>
      )}
    </div>
  );
};
```

#### CSS for Floating Elements
```css
/* styles.css - Floating elements */
.floating-layout {
  position: relative;
  min-height: 100vh;
}

.floating-action-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.fab-trigger {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.fab-trigger:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.fab-actions {
  position: absolute;
  bottom: 70px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fab-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.3s ease forwards;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.floating-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  background: var(--color-background);
  border-left: 1px solid var(--color-border);
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 999;
}

.floating-panel.active {
  transform: translateX(0);
}
```

## 🛠 Layout Utilities and Helpers

### Layout Automation Script

**update-layout.sh** - Script for automated layout changes:

```bash
#!/bin/bash
# scripts/update-layout.sh

# Function to update layout configuration
update_layout() {
  local layout_type=$1
  local columns=$2
  local gap=$3
  
  # Update config.yaml
  yq eval ".layout.type = \"$layout_type\"" -i config.yaml
  yq eval ".layout.columns = $columns" -i config.yaml
  yq eval ".layout.gap = $gap" -i config.yaml
}

# Function to apply layout preset
apply_preset() {
  local preset=$1
  
  case $preset in
    "analytics")
      update_layout "grid" 12 3
      echo "Applied analytics layout preset"
      ;;
    "minimal")
      update_layout "flex" 1 2
      echo "Applied minimal layout preset"
      ;;
    "dashboard")
      update_layout "grid" 12 4
      echo "Applied dashboard layout preset"
      ;;
    *)
      echo "Unknown preset: $preset"
      exit 1
      ;;
  esac
}

# Main script logic
if [ "$1" = "--preset" ]; then
  apply_preset "$2"
else
  update_layout "$1" "$2" "$3"
fi

echo "Layout updated successfully!"
```

### Layout Testing Utility

```typescript
// utils/layoutTester.ts
export const testLayout = (config: LayoutConfig) => {
  const tests = {
    mobileBreakpoint: window.innerWidth <= 768,
    tabletBreakpoint: window.innerWidth <= 1024,
    componentOverlap: checkComponentOverlap(config),
    responsiveGrid: checkResponsiveGrid(config)
  };
  
  console.log('Layout Test Results:', tests);
  return tests;
};

const checkComponentOverlap = (config: LayoutConfig) => {
  const positions = config.components.map(c => c.position);
  // Check for overlapping grid positions
  return positions.every((pos, index) => {
    return !positions.some((other, otherIndex) => {
      if (index === otherIndex) return false;
      return (
        pos.row === other.row &&
        pos.col < other.col + other.span &&
        pos.col + pos.span > other.col
      );
    });
  });
};
```

## 🎯 Best Practices for Layout Modifications

### 1. Mobile-First Design
Always start with mobile layout and enhance for larger screens:
```css
/* Start with mobile */
.component { grid-column: span 12; }

/* Enhance for larger screens */
@media (min-width: 768px) {
  .component { grid-column: span 6; }
}
```

### 2. Use CSS Variables
Make layouts easily customizable with CSS variables:
```css
:root {
  --grid-columns: 12;
  --grid-gap: 2rem;
  --container-padding: 3rem;
}

.dashboard-container {
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gap);
  padding: var(--container-padding);
}
```

### 3. Test Across Devices
Always verify layouts on different screen sizes:
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+
- Large screens: 1920px+

### 4. Accessibility Considerations
- Ensure logical tab order
- Provide skip links for complex layouts
- Test with screen readers
- Maintain proper heading hierarchy

### 5. Performance Optimization
- Use CSS Grid over nested flexbox when possible
- Minimize layout recalculations
- Use `will-change` for animated layouts
- Implement virtual scrolling for long lists

## 📚 Related Documentation

- **[Layout Configuration](../configuration/layout-config.md)** - Complete layout system reference
- **[Responsive Design](../styling/responsive-design.md)** - Responsive patterns and techniques
- **[Common Modifications](./common-modifications.md)** - General modification patterns
- **[Component Examples](./component-examples.md)** - Component-specific modifications
- **[Troubleshooting Guide](../troubleshooting/common-issues.md)** - Layout-related issues

---

*This comprehensive guide enables AI agents to create and modify sophisticated dashboard layouts while maintaining responsiveness, accessibility, and performance within the page-centric architecture.*

**Last Updated**: 2025-07-01  
**Next Review**: After layout system enhancements  
**Version**: 1.0.0