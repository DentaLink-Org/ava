/**
 * Theme Gallery Page Types
 * Type definitions for theme gallery components and functionality
 */

import { RuntimeTheme } from '../_shared/types/theme';

// Page theme selector types
export interface PageInfo {
  id: string;
  name: string;
  description: string;
  currentThemeId?: string;
  isActive?: boolean;
}

export interface PageThemeSelectorProps {
  pages: PageInfo[];
  selectedPageId?: string;
  onPageSelect?: (pageId: string) => void;
  onThemeChange?: (pageId: string, themeId: string) => void;
  className?: string;
}

// Theme grid types
export interface ThemeGridProps {
  themes?: RuntimeTheme[];
  selectedThemeId?: string;
  selectedPageId?: string;
  columns?: number;
  showPreview?: boolean;
  enableQuickApply?: boolean;
  onThemeSelect?: (themeId: string) => void;
  onThemeApply?: (themeId: string, pageId: string) => void;
  onThemePreview?: (themeId: string) => void;
  className?: string;
}

// Theme preview card types
export interface ThemePreviewCardProps {
  theme: RuntimeTheme;
  isSelected?: boolean;
  isApplied?: boolean;
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
  showInfo?: boolean;
  showActions?: boolean;
  onSelect?: () => void;
  onApply?: () => void;
  onPreview?: () => void;
  onEdit?: () => void;
  className?: string;
}

// Theme gallery header types
export interface ThemeGalleryHeaderProps {
  title: string;
  subtitle?: string;
  showStats?: boolean;
  onRefresh?: () => void;
  onCreateTheme?: () => void;
  className?: string;
}

// Theme customizer types
export interface ThemeCustomizerProps {
  theme?: RuntimeTheme;
  isOpen?: boolean;
  allowCustomThemes?: boolean;
  showAdvancedOptions?: boolean;
  onSave?: (theme: any) => void;
  onCancel?: () => void;
  onClose?: () => void;
  className?: string;
}

export interface ThemeCustomizerState {
  name: string;
  displayName: string;
  description: string;
  category: string;
  colors: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
  };
  spacing: Record<string, string>;
  shadows: Record<string, string>;
  borders: {
    radius: Record<string, string>;
  };
}

// Theme preview modal types
export interface ThemePreviewModalProps {
  theme: RuntimeTheme;
  isOpen: boolean;
  onClose: () => void;
  onApply?: (pageId: string) => void;
  pages?: PageInfo[];
  className?: string;
}

// Theme gallery state
export interface ThemeGalleryState {
  selectedPageId: string | null;
  selectedThemeId: string | null;
  previewThemeId: string | null;
  isCustomizerOpen: boolean;
  isPreviewModalOpen: boolean;
  editingTheme: RuntimeTheme | null;
  filter: ThemeFilter;
  searchQuery: string;
}

export interface ThemeFilter {
  category?: string;
  isSystem?: boolean;
  isCustom?: boolean;
}

// Theme gallery actions
export interface ThemeGalleryActions {
  selectPage: (pageId: string) => void;
  selectTheme: (themeId: string) => void;
  previewTheme: (themeId: string) => void;
  applyTheme: (themeId: string, pageId: string) => Promise<void>;
  openCustomizer: (theme?: RuntimeTheme) => void;
  closeCustomizer: () => void;
  openPreviewModal: (themeId: string) => void;
  closePreviewModal: () => void;
  createTheme: (themeData: any) => Promise<string>;
  updateTheme: (themeId: string, updates: any) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
  resetToDefault: (pageId: string) => Promise<void>;
  setFilter: (filter: Partial<ThemeFilter>) => void;
  setSearchQuery: (query: string) => void;
}

// Component base props
export interface ThemeComponentBaseProps {
  theme?: RuntimeTheme;
  className?: string;
  style?: React.CSSProperties;
}

// Theme stats
export interface ThemeStats {
  totalThemes: number;
  systemThemes: number;
  customThemes: number;
  themesInUse: number;
  lastUpdated: Date;
}