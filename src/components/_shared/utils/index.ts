/**
 * Utility exports for the page-centric dashboard architecture
 * Supporting utilities for configuration, styling, and component management
 */

// Configuration management
export { 
  configManager, 
  FileConfigManager 
} from './config-manager';

// Style injection
export { 
  styleInjector, 
  fileStyleLoader, 
  DOMStyleInjector, 
  FileStyleLoader, 
  styleUtils 
} from './style-injector';

// Component loading
export { 
  componentLoader, 
  webpackComponentLoader, 
  componentFactory, 
  DynamicComponentLoader, 
  WebpackComponentLoader, 
  ComponentFactory, 
  componentUtils 
} from './component-loader';

// Import the actual instances
import { configManager } from './config-manager';
import { styleInjector, fileStyleLoader, styleUtils } from './style-injector';
import { componentLoader, componentFactory, componentUtils } from './component-loader';

// Utility bundle for easy access
export const utils = {
  config: {
    manager: configManager
  },
  styles: {
    injector: styleInjector,
    loader: fileStyleLoader,
    utils: styleUtils
  },
  components: {
    loader: componentLoader,
    factory: componentFactory,
    utils: componentUtils
  }
};