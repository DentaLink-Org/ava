/**
 * Theme System Types
 * Defines theme structure for database storage and runtime usage
 */

// Theme database schema
export interface ThemeRecord {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  category: ThemeCategory;
  colors: ThemeColors;
  typography?: ThemeTypography;
  spacing?: ThemeSpacing;
  shadows?: ThemeShadows;
  borders?: ThemeBorders;
  created_at: string;
  updated_at: string;
  is_default: boolean;
  is_system: boolean;
  preview_image?: string;
  author?: string;
  version: string;
}

export type ThemeCategory = 
  | 'light' 
  | 'dark' 
  | 'high-contrast' 
  | 'colorful' 
  | 'minimal' 
  | 'custom';

// Theme color definitions (compatible with Tailwind)
export interface ThemeColors {
  // Base colors
  primary: string;
  secondary: string;
  accent?: string;
  
  // Background colors
  background: string;
  surface: string;
  surfaceVariant?: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted?: string;
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Border and outline colors
  border: string;
  borderLight?: string;
  outline?: string;
  
  // Component-specific colors
  card?: string;
  modal?: string;
  dropdown?: string;
  
  // Interactive states
  hover?: string;
  active?: string;
  focus?: string;
  disabled?: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface ThemeShadows {
  sm: string;
  base: string;
  lg: string;
  xl: string;
  hover: string;
}

export interface ThemeBorders {
  radius: {
    sm: string;
    base: string;
    lg: string;
    xl: string;
    full: string;
  };
  width: {
    thin: string;
    base: string;
    thick: string;
  };
}

// Theme variation record
export interface ThemeVariationRecord {
  id: string;
  parent_theme_id: string;
  name: string;
  display_name: string;
  description?: string;
  page_id?: string; // Optional: specific page this variation was created for
  colors: ThemeColors;
  typography?: ThemeTypography;
  spacing?: ThemeSpacing;
  shadows?: ThemeShadows;
  borders?: ThemeBorders;
  created_at: string;
  updated_at: string;
  author?: string;
  version: string;
  variation_depth: number;
  lineage_path: string[];
}

// Page theme assignment
export interface PageThemeAssignment {
  id: string;
  page_id: string;
  theme_id: string;
  theme_variation_id?: string;
  is_variation: boolean;
  created_at: string;
  updated_at: string;
}

// Runtime theme (converted for CSS custom properties)
export interface RuntimeTheme {
  id: string;
  name: string;
  displayName: string;
  cssProperties: Record<string, string>;
  category: ThemeCategory;
  type?: 'theme' | 'variation';
  parentThemeId?: string;
  variations?: ThemeVariationSummary[];
}

// Summary of theme variations for display
export interface ThemeVariationSummary {
  id: string;
  name: string;
  displayName: string;
  pageId?: string;
  createdAt: string;
  variationDepth: number;
}

// Theme application context
export interface ThemeContext {
  currentTheme: RuntimeTheme;
  availableThemes: RuntimeTheme[];
  pageThemeAssignments: Record<string, string>; // pageId -> themeId
  isLoading: boolean;
  error?: string;
}

// Theme operations
export interface ThemeOperations {
  loadTheme: (themeId: string) => Promise<RuntimeTheme>;
  applyThemeToPage: (pageId: string, themeId: string, isVariation?: boolean) => Promise<void>;
  getAllThemes: () => Promise<RuntimeTheme[]>;
  createCustomTheme: (theme: Omit<ThemeRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateTheme: (themeId: string, updates: Partial<ThemeRecord>) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
  resetToDefault: (pageId: string) => Promise<void>;
  
  // Variation operations
  createThemeVariation: (parentThemeId: string, variation: Omit<ThemeVariationRecord, 'id' | 'parent_theme_id' | 'created_at' | 'updated_at' | 'lineage_path' | 'variation_depth'>) => Promise<string>;
  updateThemeVariation: (variationId: string, updates: Partial<ThemeVariationRecord>) => Promise<void>;
  deleteThemeVariation: (variationId: string) => Promise<void>;
  getThemeVariations: (themeId: string) => Promise<ThemeVariationRecord[]>;
}

// Theme utility functions
export interface ThemeUtils {
  themeToCSS: (theme: ThemeRecord) => Record<string, string>;
  validateTheme: (theme: Partial<ThemeRecord>) => { valid: boolean; errors: string[] };
  generatePreview: (theme: ThemeRecord) => string; // SVG or image data
  exportTheme: (theme: ThemeRecord) => string; // JSON export
  importTheme: (data: string) => ThemeRecord; // JSON import
}

// Component props for theme-aware components
export interface ThemeAwareProps {
  theme?: RuntimeTheme;
  className?: string;
}

// Theme gallery component types
export interface ThemeGalleryProps {
  currentPageId?: string;
  onThemeSelect?: (themeId: string) => void;
  showPreview?: boolean;
  allowCustomization?: boolean;
}

export interface ThemePreviewProps {
  theme: RuntimeTheme;
  isSelected?: boolean;
  isApplied?: boolean;
  onSelect?: () => void;
  onPreview?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export interface ThemeEditorProps {
  theme?: ThemeRecord;
  isEditing?: boolean;
  onSave?: (theme: ThemeRecord) => void;
  onCancel?: () => void;
}