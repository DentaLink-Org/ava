/**
 * Theme CSS Injection Utilities
 * Handles dynamic injection and removal of theme CSS custom properties
 */

import { RuntimeTheme } from '../types/theme';

/**
 * Inject theme CSS custom properties into the DOM
 */
export const injectThemeCSS = (pageId: string, theme: RuntimeTheme): void => {
  const styleId = `theme-${pageId}`;
  
  // Remove existing theme styles for this page
  removeThemeCSS(pageId);
  
  // Create CSS rules for the theme
  const cssRules = Object.entries(theme.cssProperties)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n');
  
  const css = `
/* Theme: ${theme.displayName} for page: ${pageId} */
.page-${pageId},
.page-container[data-page-id="${pageId}"] {
${cssRules}
  --font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Global theme fallbacks */
:root {
${cssRules}
  --font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
}
`;

  // Create and inject style element
  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = css;
  
  // Add to document head
  document.head.appendChild(styleElement);
  
  console.log(`Injected theme CSS for page ${pageId}:`, theme.displayName);
};

/**
 * Remove theme CSS for a specific page
 */
export const removeThemeCSS = (pageId: string): void => {
  const styleId = `theme-${pageId}`;
  const existingStyle = document.getElementById(styleId);
  
  if (existingStyle) {
    existingStyle.remove();
    console.log(`Removed theme CSS for page ${pageId}`);
  }
};

/**
 * Get current theme CSS properties from DOM
 */
export const getCurrentThemeCSS = (pageId: string): Record<string, string> => {
  const pageElement = document.querySelector(`.page-${pageId}`) as HTMLElement;
  if (!pageElement) return {};
  
  const computedStyle = getComputedStyle(pageElement);
  const cssProperties: Record<string, string> = {};
  
  // Get all CSS custom properties
  for (let i = 0; i < computedStyle.length; i++) {
    const property = computedStyle.item(i);
    if (property.startsWith('--')) {
      cssProperties[property] = computedStyle.getPropertyValue(property).trim();
    }
  }
  
  return cssProperties;
};

/**
 * Apply inline theme styles to an element
 */
export const applyInlineThemeStyles = (
  element: HTMLElement, 
  theme: RuntimeTheme
): void => {
  Object.entries(theme.cssProperties).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
};

/**
 * Remove inline theme styles from an element
 */
export const removeInlineThemeStyles = (
  element: HTMLElement, 
  theme: RuntimeTheme
): void => {
  Object.keys(theme.cssProperties).forEach(property => {
    element.style.removeProperty(property);
  });
};

/**
 * Check if theme CSS is currently applied
 */
export const isThemeApplied = (pageId: string): boolean => {
  const styleId = `theme-${pageId}`;
  return document.getElementById(styleId) !== null;
};

/**
 * Get all currently applied theme style elements
 */
export const getAllAppliedThemes = (): Array<{ pageId: string; element: HTMLStyleElement }> => {
  const themeStyles = document.querySelectorAll('style[id^="theme-"]');
  const result: Array<{ pageId: string; element: HTMLStyleElement }> = [];
  
  themeStyles.forEach(styleElement => {
    const id = styleElement.id;
    const pageId = id.replace('theme-', '');
    result.push({ pageId, element: styleElement as HTMLStyleElement });
  });
  
  return result;
};

/**
 * Clear all theme styles from DOM
 */
export const clearAllThemeStyles = (): void => {
  const themeStyles = document.querySelectorAll('style[id^="theme-"]');
  themeStyles.forEach(styleElement => styleElement.remove());
  console.log('Cleared all theme styles');
};