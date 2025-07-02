/**
 * Style injection system for page-specific CSS
 * Enables dynamic style loading and page isolation
 */

import { StyleInjector } from '../runtime/types';

/**
 * DOM-based style injector implementation
 */
export class DOMStyleInjector implements StyleInjector {
  private injectedStyles: Map<string, HTMLStyleElement>;

  constructor() {
    this.injectedStyles = new Map();
  }

  /**
   * Inject CSS styles for a specific page
   * @param pageId - Unique page identifier
   * @param css - CSS string to inject
   */
  inject(pageId: string, css: string): void {
    try {
      // Remove existing styles for this page
      this.remove(pageId);

      // Create style element
      const styleElement = document.createElement('style');
      styleElement.id = `page-styles-${pageId}`;
      styleElement.setAttribute('data-page-id', pageId);
      
      // Scope CSS to page
      const scopedCSS = this.scopeCSS(pageId, css);
      styleElement.textContent = scopedCSS;

      // Inject into document head
      document.head.appendChild(styleElement);
      
      // Track injected style
      this.injectedStyles.set(pageId, styleElement);

      console.log(`✅ Injected styles for page '${pageId}'`);
    } catch (error) {
      console.error(`Failed to inject styles for page '${pageId}':`, error);
    }
  }

  /**
   * Remove injected styles for a specific page
   * @param pageId - Unique page identifier
   */
  remove(pageId: string): void {
    try {
      const existingStyle = this.injectedStyles.get(pageId);
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle);
        this.injectedStyles.delete(pageId);
        console.log(`✅ Removed styles for page '${pageId}'`);
      }
    } catch (error) {
      console.error(`Failed to remove styles for page '${pageId}':`, error);
    }
  }

  /**
   * Update injected styles for a specific page
   * @param pageId - Unique page identifier
   * @param css - New CSS string
   */
  update(pageId: string, css: string): void {
    try {
      const existingStyle = this.injectedStyles.get(pageId);
      if (existingStyle) {
        const scopedCSS = this.scopeCSS(pageId, css);
        existingStyle.textContent = scopedCSS;
        console.log(`✅ Updated styles for page '${pageId}'`);
      } else {
        this.inject(pageId, css);
      }
    } catch (error) {
      console.error(`Failed to update styles for page '${pageId}':`, error);
    }
  }

  /**
   * Check if styles are injected for a page
   * @param pageId - Unique page identifier
   * @returns Boolean indicating if styles are injected
   */
  hasStyles(pageId: string): boolean {
    return this.injectedStyles.has(pageId);
  }

  /**
   * Get all pages with injected styles
   * @returns Array of page IDs
   */
  getInjectedPages(): string[] {
    return Array.from(this.injectedStyles.keys());
  }

  /**
   * Clear all injected styles
   */
  clearAll(): void {
    const pageIds = this.getInjectedPages();
    pageIds.forEach(pageId => this.remove(pageId));
    console.log(`✅ Cleared all injected styles`);
  }

  /**
   * Load CSS file and inject for a page
   * @param pageId - Unique page identifier
   * @param cssPath - Path to CSS file
   */
  async loadAndInject(pageId: string, cssPath: string): Promise<void> {
    try {
      const response = await fetch(cssPath);
      if (!response.ok) {
        throw new Error(`Failed to load CSS file: ${response.statusText}`);
      }
      
      const css = await response.text();
      this.inject(pageId, css);
    } catch (error) {
      console.error(`Failed to load and inject CSS for page '${pageId}':`, error);
      throw error;
    }
  }

  /**
   * Get current CSS content for a page
   * @param pageId - Unique page identifier
   * @returns CSS content or null if not found
   */
  getCSS(pageId: string): string | null {
    const styleElement = this.injectedStyles.get(pageId);
    return styleElement?.textContent || null;
  }

  // Private helper methods
  private scopeCSS(pageId: string, css: string): string {
    // Simple CSS scoping - prepend page selector to all rules
    const pageSelector = `.page-${pageId}`;
    
    // Split CSS into rules and scope each one
    const scopedRules = css
      .split('}')
      .map(rule => {
        if (!rule.trim()) return '';
        
        const [selectors, declarations] = rule.split('{');
        if (!selectors || !declarations) return rule + '}';
        
        // Scope each selector
        const scopedSelectors = selectors
          .split(',')
          .map(selector => {
            const trimmed = selector.trim();
            if (!trimmed) return '';
            
            // Don't scope :root, @media, @keyframes, etc.
            if (trimmed.startsWith(':root') || 
                trimmed.startsWith('@') || 
                trimmed.includes('*')) {
              return trimmed;
            }
            
            // Scope regular selectors
            return `${pageSelector} ${trimmed}`;
          })
          .filter(Boolean)
          .join(', ');
        
        return `${scopedSelectors} {${declarations}}`;
      })
      .filter(Boolean)
      .join('\n');
    
    return scopedRules;
  }
}

/**
 * File-based style loader for development
 */
export class FileStyleLoader {
  private injector: StyleInjector;
  private watchedFiles: Map<string, string>;

  constructor(injector: StyleInjector) {
    this.injector = injector;
    this.watchedFiles = new Map();
  }

  /**
   * Load page styles from file system
   * @param pageId - Unique page identifier
   * @param stylesPath - Path to styles file (optional, defaults to page directory)
   */
  async loadPageStyles(pageId: string, stylesPath?: string): Promise<void> {
    const defaultPath = stylesPath || `src/pages/${pageId}/styles.css`;
    
    try {
      // In Node.js environment, read file directly
      if (typeof window === 'undefined') {
        const fs = await import('fs/promises');
        const css = await fs.readFile(defaultPath, 'utf-8');
        this.injector.inject(pageId, css);
        this.watchedFiles.set(pageId, defaultPath);
      } else {
        // In browser environment, fetch the file
        if (this.injector.loadAndInject) {
          await this.injector.loadAndInject(pageId, defaultPath);
        } else {
          throw new Error('loadAndInject method not available');
        }
        this.watchedFiles.set(pageId, defaultPath);
      }
    } catch (error) {
      console.warn(`Could not load styles for page '${pageId}' from '${defaultPath}':`, error);
      // Don't throw - styles are optional
    }
  }

  /**
   * Reload styles for a page
   * @param pageId - Unique page identifier
   */
  async reloadPageStyles(pageId: string): Promise<void> {
    const stylesPath = this.watchedFiles.get(pageId);
    if (stylesPath) {
      await this.loadPageStyles(pageId, stylesPath);
    }
  }

  /**
   * Watch for style file changes (development feature)
   * @param pageId - Unique page identifier
   * @param callback - Callback when styles change
   */
  watchPageStyles(pageId: string, callback?: () => void): void {
    const stylesPath = this.watchedFiles.get(pageId);
    if (!stylesPath || typeof window !== 'undefined') {
      return; // File watching only works in Node.js
    }

    // In a real implementation, you'd use fs.watchFile or chokidar
    console.log(`Watching styles for page '${pageId}' at '${stylesPath}'`);
    // This is a placeholder - actual implementation would watch the file
  }
}

// Utility functions for style management
export const styleUtils = {
  /**
   * Generate CSS custom properties for theme
   * @param pageId - Page identifier
   * @param theme - Theme object
   * @returns CSS string with custom properties
   */
  generateThemeCSS: (pageId: string, theme: any): string => {
    let css = `.page-${pageId} {\n`;
    
    // Generate color variables
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        css += `  --${pageId}-color-${key}: ${value};\n`;
      });
    }
    
    // Generate spacing variables
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        css += `  --${pageId}-spacing-${key}: ${value}px;\n`;
      });
    }
    
    // Generate typography variables
    if (theme.typography) {
      Object.entries(theme.typography).forEach(([key, value]) => {
        css += `  --${pageId}-typography-${key}: ${value};\n`;
      });
    }
    
    css += '}\n';
    return css;
  },

  /**
   * Minify CSS string
   * @param css - CSS to minify
   * @returns Minified CSS
   */
  minifyCSS: (css: string): string => {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/;\s*}/g, '}') // Remove last semicolon in blocks
      .replace(/{\s*/g, '{') // Remove space after opening braces
      .replace(/;\s*/g, ';') // Remove space after semicolons
      .trim();
  },

  /**
   * Validate CSS syntax (basic)
   * @param css - CSS to validate
   * @returns Validation result
   */
  validateCSS: (css: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Basic validation - check for unmatched braces
    const openBraces = (css.match(/{/g) || []).length;
    const closeBraces = (css.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push(`Unmatched braces: ${openBraces} opening, ${closeBraces} closing`);
    }
    
    // Check for invalid characters in selectors
    const selectorRegex = /[^a-zA-Z0-9\s\-_#.,:()[\]>+~*]/;
    const lines = css.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('{') && !line.includes('}')) {
        const selector = line.split('{')[0].trim();
        if (selectorRegex.test(selector)) {
          errors.push(`Invalid characters in selector on line ${index + 1}: ${selector}`);
        }
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// Export singleton instance
export const styleInjector = new DOMStyleInjector();
export const fileStyleLoader = new FileStyleLoader(styleInjector);