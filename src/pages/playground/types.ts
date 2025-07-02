/**
 * Playground page type definitions
 * Isolated types for the playground page components and data
 */

// Playground-specific component props
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

// Playground data types
export interface OrderData {
  count: number;
  revenue: number;
}

export interface CustomerData {
  count: number;
}

export interface PlaygroundMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  activeUsers: number;
  ordersProcessed: number;
}

// Playground hooks data types
export interface UsePlaygroundDataResult {
  data: PlaygroundMetrics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Playground API types
export interface PlaygroundApiResponse {
  success: boolean;
  data?: PlaygroundMetrics;
  error?: string;
}

// Playground configuration types (extends base types)
export interface PlaygroundConfig {
  refreshInterval: number;
  enableRealtime: boolean;
  defaultMetrics: string[];
}

// Playground theme customizations
export interface PlaygroundTheme {
  kpiCardBackground: string;
  kpiCardTextColor: string;
  linkCardHoverColor: string;
  headerGradient?: string;
}

// Component state types
export interface PlaygroundComponentState {
  isLoading: boolean;
  hasError: boolean;
  lastUpdated: Date | null;
}

// Event types for playground interactions
export interface PlaygroundEvent {
  type: 'metric_clicked' | 'card_clicked' | 'refresh_triggered';
  payload: any;
  timestamp: Date;
}

// Playground utilities
export type PlaygroundComponent = 
  | 'WelcomeHeader'
  | 'DatabaseLinkCard'
  | 'TasksLinkCard'
  | 'QuickStartCard' 
  | 'KPICards';

export type PlaygroundLayout = 'grid' | 'flex' | 'custom';

// Validation types
export interface PlaygroundValidation {
  isValidConfig: boolean;
  missingComponents: PlaygroundComponent[];
  errors: string[];
}