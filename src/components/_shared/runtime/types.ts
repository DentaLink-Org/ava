/**
 * Core type definitions for the page-centric dashboard architecture
 * These types define the contracts for configuration, components, theming, data management, and routing
 */

// React imports for JSX
import * as React from 'react';

// Route system interfaces
export interface RouteMetadata {
  id: string;
  path: string;
  title: string;
  description?: string;
  icon?: string;
  order?: number;
  visible?: boolean;
  requiresAuth?: boolean;
  roles?: string[];
  category?: string;
}

export interface RouteRegistryEntry {
  id: string;
  metadata: RouteMetadata;
  configPath: string;
  componentPath: string;
  isValid: boolean;
  lastValidated?: Date;
  validationErrors?: string[];
}

// Base component interface
export interface ComponentProps {
  [key: string]: any;
}

export interface PageComponent {
  (props: ComponentProps & { theme: PageTheme }): React.ReactElement;
}

// Theme system interfaces
export interface PageTheme {
  colors: {
    primary: string;
    secondary?: string;
    background: string;
    surface?: string;
    text: string;
    textSecondary?: string;
  };
  spacing: {
    base: number;
    small?: number;
    large?: number;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: string;
    lineHeight?: number;
  };
}

// Layout system interfaces
export interface GridPosition {
  col: number;
  row: number;
  span: number;
  rowSpan?: number;
}

export interface PageLayout {
  type: "grid" | "flex" | "custom";
  columns?: number;
  rows?: number;
  gap: number;
  padding: number;
}

// Component configuration interfaces
export interface ComponentConfig {
  id: string;
  type: string;
  position: GridPosition;
  props: Record<string, any>;
  style?: Record<string, any>;
  className?: string;
}

// Data source interfaces
export interface DataSource {
  name: string;
  type: "supabase" | "api" | "static";
  query?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  refresh?: string;
  transform?: string;
}

export interface DataSourceConfig {
  sources: DataSource[];
}

// Navigation configuration
export interface NavigationConfig {
  showSidebar: boolean;
  customHeader: boolean;
  breadcrumbs: boolean;
}

// Script configuration
export interface ScriptConfig {
  onLoad?: string[];
  onUnload?: string[];
}

// Page metadata
export interface PageMeta {
  author?: string;
  version?: string;
  lastModified?: string;
  tags?: string[];
}

// Complete page configuration interface
export interface PageConfig {
  page: {
    title: string;
    route: string;
    description?: string;
  };
  layout: PageLayout;
  theme?: PageTheme;
  components: ComponentConfig[];
  data?: DataSourceConfig;
  navigation?: NavigationConfig;
  scripts?: ScriptConfig;
  meta?: PageMeta;
}

// Component registry interfaces
export interface ComponentRegistry {
  register(pageId: string, componentType: string, component: PageComponent): void;
  get(pageId: string, componentType: string): PageComponent | null;
  getPageComponents(pageId: string): Record<string, PageComponent>;
  unregister(pageId: string, componentType: string): void;
  clear(pageId: string): void;
}

// Data hook interface
export interface PageDataHook {
  <T = any>(sourceName: string): {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
  };
}

// Configuration validation interfaces
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ConfigValidator {
  validate(config: unknown): ValidationResult;
  validatePartial(config: Partial<PageConfig>): ValidationResult;
}

// Error handling interfaces
export class ConfigurationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class ComponentError extends Error {
  constructor(message: string, public componentId?: string, public componentType?: string) {
    super(message);
    this.name = 'ComponentError';
  }
}

export class ThemeError extends Error {
  constructor(message: string, public themeProperty?: string) {
    super(message);
    this.name = 'ThemeError';
  }
}

// Style injection interfaces
export interface StyleInjector {
  inject(pageId: string, css: string): void;
  remove(pageId: string): void;
  update(pageId: string, css: string): void;
  loadAndInject?(pageId: string, cssPath: string): Promise<void>;
}

// Page renderer interfaces
export interface PageRendererProps {
  pageId: string;
  config?: PageConfig;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

export interface PageRendererState {
  config: PageConfig | null;
  loading: boolean;
  error: Error | null;
  components: Record<string, PageComponent>;
}

// Component loading interfaces
export interface ComponentLoader {
  load(pageId: string, componentType: string): Promise<PageComponent>;
  loadBulk(pageId: string, componentTypes: string[]): Promise<Record<string, PageComponent>>;
  preload(pageId: string, componentTypes: string[]): Promise<void>;
}

// Configuration management interfaces
export interface ConfigManager {
  load(pageId: string): Promise<PageConfig>;
  save(pageId: string, config: PageConfig): Promise<void>;
  update(pageId: string, updates: Partial<PageConfig>): Promise<void>;
  backup(pageId: string): Promise<string>;
  restore(pageId: string, backupId: string): Promise<void>;
}

// Agent automation interfaces
export interface AgentScript {
  name: string;
  description: string;
  execute(pageId: string, params: Record<string, any>): Promise<void>;
  validate(params: Record<string, any>): ValidationResult;
}

export interface AgentScriptRegistry {
  register(pageId: string, script: AgentScript): void;
  get(pageId: string, scriptName: string): AgentScript | null;
  list(pageId: string): AgentScript[];
  execute(pageId: string, scriptName: string, params: Record<string, any>): Promise<void>;
}

// Performance monitoring interfaces
export interface PerformanceMetrics {
  pageLoadTime: number;
  componentLoadTime: Record<string, number>;
  configParseTime: number;
  memoryUsage: number;
  timestamp: Date;
}

export interface PerformanceMonitor {
  track(pageId: string, metrics: PerformanceMetrics): void;
  getMetrics(pageId: string): PerformanceMetrics[];
  getAverages(pageId: string): Partial<PerformanceMetrics>;
}

// Type guards for runtime validation
export const isPageConfig = (obj: unknown): obj is PageConfig => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'page' in obj &&
    'layout' in obj &&
    'theme' in obj &&
    'components' in obj
  );
};

export const isComponentConfig = (obj: unknown): obj is ComponentConfig => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'type' in obj &&
    'position' in obj &&
    'props' in obj
  );
};

export const isPageTheme = (obj: unknown): obj is PageTheme => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'colors' in obj &&
    'spacing' in obj
  );
};

// Utility types for advanced usage
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ComponentConfigUpdate = DeepPartial<ComponentConfig>;
export type PageConfigUpdate = DeepPartial<PageConfig>;
export type ThemeUpdate = DeepPartial<PageTheme>;

// React component types
export type ReactComponent = React.ComponentType<any>;
export type ReactNode = React.ReactNode;
export type ReactElement = React.ReactElement;