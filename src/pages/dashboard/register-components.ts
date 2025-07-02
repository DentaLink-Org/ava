/**
 * Dashboard Component Registration
 * Registers all dashboard components with the global component registry
 */

import { componentRegistry } from '../_shared/runtime/ComponentRegistry';
import {
  DashboardContainer,
  WelcomeHeader,
  DatabaseLinkCard,
  TasksLinkCard,
  QuickStartCard,
  KPICards
} from './components';

const DASHBOARD_PAGE_ID = 'dashboard';

/**
 * Register all dashboard components
 */
export const registerDashboardComponents = () => {
  // Register all dashboard-specific components (using any to bypass type checking temporarily)
  componentRegistry.register(DASHBOARD_PAGE_ID, 'DashboardContainer', DashboardContainer as any);
  componentRegistry.register(DASHBOARD_PAGE_ID, 'WelcomeHeader', WelcomeHeader as any);
  componentRegistry.register(DASHBOARD_PAGE_ID, 'DatabaseLinkCard', DatabaseLinkCard as any);
  componentRegistry.register(DASHBOARD_PAGE_ID, 'TasksLinkCard', TasksLinkCard as any);
  componentRegistry.register(DASHBOARD_PAGE_ID, 'QuickStartCard', QuickStartCard as any);
  componentRegistry.register(DASHBOARD_PAGE_ID, 'KPICards', KPICards as any);
  
  console.log('Dashboard components registered successfully');
};

/**
 * Unregister dashboard components (for cleanup)
 */
export const unregisterDashboardComponents = () => {
  componentRegistry.clear(DASHBOARD_PAGE_ID);
  console.log('Dashboard components unregistered');
};

// Auto-register components when this module is imported
registerDashboardComponents();