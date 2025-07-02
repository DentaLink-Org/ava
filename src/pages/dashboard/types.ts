/**
 * Dashboard page type definitions
 * Isolated types for the dashboard page components and data
 */

// Dashboard-specific component props
export interface WelcomeHeaderProps {
  title: string;
  subtitle: string;
  theme?: any;
  componentId?: string;
  pageId?: string;
}

export interface DatabaseLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  theme?: any;
  componentId?: string;
  pageId?: string;
}

export interface TasksLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  theme?: any;
  componentId?: string;
  pageId?: string;
}

export interface QuickStartCardProps {
  title: string;
  description: string;
  primaryAction: {
    text: string;
    href: string;
  };
  theme?: any;
  componentId?: string;
  pageId?: string;
}

export interface KPIMetric {
  id: string;
  title: string;
  value: number | string;
  suffix?: string;
  description: string;
  delta?: string;
  deltaType?: 'increase' | 'decrease' | 'neutral';
}

export interface KPICardsProps {
  metrics: KPIMetric[];
  theme?: any;
  componentId?: string;
  pageId?: string;
}

// Dashboard data types
export interface OrderData {
  count: number;
  revenue: number;
}

export interface CustomerData {
  count: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  activeUsers: number;
  ordersProcessed: number;
}

// Dashboard hooks data types
export interface UseDashboardDataResult {
  data: DashboardMetrics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Dashboard API types
export interface DashboardApiResponse {
  success: boolean;
  data?: DashboardMetrics;
  error?: string;
}

// Dashboard configuration types (extends base types)
export interface DashboardConfig {
  refreshInterval: number;
  enableRealtime: boolean;
  defaultMetrics: string[];
}

// Dashboard theme customizations
export interface DashboardTheme {
  kpiCardBackground: string;
  kpiCardTextColor: string;
  linkCardHoverColor: string;
  headerGradient?: string;
}

// Component state types
export interface DashboardComponentState {
  isLoading: boolean;
  hasError: boolean;
  lastUpdated: Date | null;
}

// Event types for dashboard interactions
export interface DashboardEvent {
  type: 'metric_clicked' | 'card_clicked' | 'refresh_triggered';
  payload: any;
  timestamp: Date;
}

// Dashboard utilities
export type DashboardComponent = 
  | 'WelcomeHeader'
  | 'DatabaseLinkCard'
  | 'TasksLinkCard'
  | 'QuickStartCard' 
  | 'KPICards';

export type DashboardLayout = 'grid' | 'flex' | 'custom';

// Validation types
export interface DashboardValidation {
  isValidConfig: boolean;
  missingComponents: DashboardComponent[];
  errors: string[];
}