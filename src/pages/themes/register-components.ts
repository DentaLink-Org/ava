/**
 * Theme Gallery Component Registration
 * Registers all theme gallery components with the global component registry
 */

import { componentRegistry } from '../_shared/runtime/ComponentRegistry';
import {
  ThemeGalleryHeader,
  PageThemeSelector,
  ThemeGrid,
  ThemeCustomizer
} from './components';

const THEMES_PAGE_ID = 'themes';

/**
 * Register all theme gallery components
 */
export const registerThemeComponents = () => {
  // Register all theme gallery components (using any to bypass type checking temporarily)
  componentRegistry.register(THEMES_PAGE_ID, 'ThemeGalleryHeader', ThemeGalleryHeader as any);
  componentRegistry.register(THEMES_PAGE_ID, 'PageThemeSelector', PageThemeSelector as any);
  componentRegistry.register(THEMES_PAGE_ID, 'ThemeGrid', ThemeGrid as any);
  componentRegistry.register(THEMES_PAGE_ID, 'ThemeCustomizer', ThemeCustomizer as any);
  
  console.log('Theme gallery components registered successfully');
};

/**
 * Unregister theme gallery components (for cleanup)
 */
export const unregisterThemeComponents = () => {
  componentRegistry.clear(THEMES_PAGE_ID);
  console.log('Theme gallery components unregistered');
};

// Auto-register components when this module is imported
registerThemeComponents();