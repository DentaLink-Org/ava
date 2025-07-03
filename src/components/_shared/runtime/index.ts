/**
 * Runtime system exports for the page-centric dashboard architecture
 * Main entry point for all runtime functionality
 */

// Core types - minimal for build stability
export { ConfigurationError, ComponentError, ThemeError } from './types';

// Configuration system
export { ConfigParser, configParser } from './ConfigParser';
export { pageConfigSchema, validateComponentPositioning, validateThemeColors, validateDataSources } from './schema';

// Component system
export { ComponentRegistry, componentRegistry } from './ComponentRegistry';

// Theme system
export { 
  ThemeProvider, 
  useTheme, 
  useThemeValues, 
  withTheme, 
  themeUtils, 
  defaultTheme 
} from './ThemeProvider';

// Page rendering
export { 
  PageRenderer, 
  usePageRenderer, 
  renderPage 
} from './PageRenderer';

// Route system
export { RouteRegistry, routeRegistry } from './RouteRegistry';

// Runtime utilities
export { configManager, FileConfigManager } from '../utils/config-manager';
export { 
  styleInjector, 
  fileStyleLoader, 
  DOMStyleInjector, 
  FileStyleLoader, 
  styleUtils 
} from '../utils/style-injector';
export { 
  componentLoader, 
  webpackComponentLoader, 
  componentFactory, 
  DynamicComponentLoader, 
  WebpackComponentLoader, 
  ComponentFactory, 
  componentUtils 
} from '../utils/component-loader';
export { routeUtils, navigationHelpers } from '../utils/route-utils';

// Import specific instances after exports
import { configParser } from './ConfigParser';
import { componentRegistry } from './ComponentRegistry';
import { routeRegistry } from './RouteRegistry';
import { configManager } from '../utils/config-manager';
import { styleInjector, componentLoader, componentFactory } from '../utils';
import { routeUtils } from '../utils/route-utils';

// Convenience exports for common patterns
export const runtime = {
  configParser,
  componentRegistry,
  routeRegistry,
  configManager,
  styleInjector,
  componentLoader,
  componentFactory,
  routeUtils
};

// Version info
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();