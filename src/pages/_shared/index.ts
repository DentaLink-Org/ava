/**
 * Main export file for the shared page architecture system
 * Provides convenient access to all runtime and utility functionality
 */

// Runtime system (main exports) - minimal for build stability
export {
  ConfigurationError,
  ComponentError,
  ThemeError,
  ComponentRegistry,
  componentRegistry,
  ThemeProvider,
  useTheme,
  useThemeValues,
  PageRenderer,
  usePageRenderer,
  runtime,
  VERSION,
  BUILD_DATE
} from './runtime';

// Utilities - reduced for build stability
export {
  utils
} from './utils';

// Re-export key items for convenience - avoid duplicates by just importing for the API object
import { 
  PageRenderer, 
  ThemeProvider, 
  useTheme, 
  useThemeValues,
  usePageRenderer,
  configParser, 
  componentRegistry,
  runtime,
  VERSION,
  BUILD_DATE
} from './runtime';

import { 
  configManager, 
  styleInjector, 
  componentLoader,
  utils
} from './utils';

// Main API object for easy destructuring
export const PageArchitecture = {
  // Core components
  PageRenderer,
  ThemeProvider,
  
  // Hooks
  useTheme,
  useThemeValues,
  usePageRenderer,
  
  // Managers
  configParser,
  configManager,
  componentRegistry,
  styleInjector,
  componentLoader,
  
  // Utilities
  runtime,
  utils,
  
  // Constants
  VERSION,
  BUILD_DATE
} as const;

// Default export for convenience
export default PageArchitecture;