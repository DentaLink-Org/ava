import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Users, 
  Tag, 
  Flag, 
  Target, 
  Activity, 
  Bookmark, 
  Archive, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff, 
  Plus, 
  Minus, 
  Check, 
  AlertTriangle, 
  Info, 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Share, 
  Copy, 
  ExternalLink, 
  Sliders, 
  SortAsc, 
  SortDesc, 
  Grid, 
  List, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Globe, 
  MapPin, 
  Building, 
  Briefcase, 
  Code, 
  Palette, 
  Database, 
  Server, 
  Shield, 
  Lock, 
  Unlock, 
  Key, 
  Hash, 
  AtSign, 
  Percent, 
  DollarSign, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  Bell, 
  Mail, 
  Phone,
  Pause,
  CheckCircle,
  User
} from 'lucide-react';
import type { 
  Milestone, 
  MilestoneFilter, 
  MilestoneSort, 
  MilestoneStatus, 
  TaskPriority, 
  TeamMember, 
  Project, 
  RiskLevel 
} from '../../milestones/types';

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  filters: MilestoneFilter;
  sort: MilestoneSort[];
  isDefault: boolean;
  isPublic: boolean;
  createdBy: string;
  createdDate: string;
  lastUsed: string;
  useCount: number;
  tags: string[];
  category: SearchCategory;
}

export interface SearchSuggestion {
  id: string;
  type: SuggestionType;
  text: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  category: string;
  popularity: number;
  recentlyUsed: boolean;
  filter?: Partial<MilestoneFilter>;
}

export interface FilterGroup {
  id: string;
  label: string;
  icon: any; // Allow any icon type
  filters: FilterField[];
  expanded: boolean;
  priority: number;
  helpText?: string;
  advanced?: boolean; // Add missing advanced property
}

export interface FilterField {
  id: string;
  label: string;
  type: FilterFieldType;
  options?: FilterOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  multiSelect?: boolean;
  searchable?: boolean;
  validation?: (value: any) => string | null;
  dependencies?: string[];
  conditional?: boolean;
  advanced?: boolean;
}

export interface FilterOption {
  value: string | number | boolean;
  label: string;
  description?: string;
  icon?: any; // Allow any icon type
  color?: string;
  count?: number;
  disabled?: boolean;
  group?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  filters: MilestoneFilter;
  category: PresetCategory;
  popularity: number;
  isBuiltIn: boolean;
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueQueries: number;
  averageResultCount: number;
  popularFilters: Array<{
    field: string;
    value: string;
    count: number;
  }>;
  searchTrends: Array<{
    date: string;
    searches: number;
    uniqueUsers: number;
  }>;
  filterUsage: Record<string, number>;
  zeroResultQueries: string[];
  slowQueries: Array<{
    query: string;
    executionTime: number;
    resultCount: number;
  }>;
}

export interface QuickFilter {
  id: string;
  label: string;
  icon: any; // Allow any icon type
  description: string;
  filter: Partial<MilestoneFilter>;
  color: string;
  shortcut?: string;
}

export interface SearchContext {
  projectId?: string;
  userId?: string;
  teamId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  workspaceId?: string;
  viewMode?: string;
}

export interface FilterValidation {
  isValid: boolean;
  errors: FilterError[];
  warnings: FilterWarning[];
  suggestions: FilterSuggestion[];
}

export interface FilterError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface FilterWarning {
  field: string;
  message: string;
  code: string;
  autoFixable: boolean;
}

export interface FilterSuggestion {
  field: string;
  suggestion: string;
  reason: string;
  confidence: number;
}

export type SearchCategory = 'personal' | 'team' | 'project' | 'system' | 'template';
export type SuggestionType = 'query' | 'filter' | 'operator' | 'value' | 'field';
export type FilterFieldType = 'text' | 'select' | 'multiselect' | 'date' | 'dateRange' | 'number' | 'boolean' | 'slider' | 'tags' | 'user' | 'project';
export type PresetCategory = 'status' | 'priority' | 'assignment' | 'timeline' | 'progress' | 'custom';
export type SearchMode = 'simple' | 'advanced' | 'builder' | 'natural';
export type SortDirection = 'asc' | 'desc';

export interface MilestoneSearchFilterProps {
  milestones: Milestone[];
  teamMembers: TeamMember[];
  projects: Project[];
  savedSearches: SavedSearch[];
  suggestions: SearchSuggestion[];
  analytics: SearchAnalytics;
  context: SearchContext;
  initialFilters?: MilestoneFilter;
  initialSort?: MilestoneSort[];
  onFiltersChange: (filters: MilestoneFilter) => void;
  onSortChange: (sort: MilestoneSort[]) => void;
  onSaveSearch: (search: Omit<SavedSearch, 'id' | 'createdDate' | 'lastUsed' | 'useCount'>) => Promise<void>;
  onDeleteSearch: (searchId: string) => Promise<void>;
  onSearchAnalytics: () => Promise<SearchAnalytics>;
  enableSuggestions?: boolean;
  enableSavedSearches?: boolean;
  enableAnalytics?: boolean;
  enableAdvancedMode?: boolean;
  enableNaturalLanguage?: boolean;
  showResultCount?: boolean;
  showPerformanceMetrics?: boolean;
  maxSuggestions?: number;
  className?: string;
}

export const MilestoneSearchFilter: React.FC<MilestoneSearchFilterProps> = ({
  milestones,
  teamMembers,
  projects,
  savedSearches,
  suggestions,
  analytics,
  context,
  initialFilters = {},
  initialSort = [],
  onFiltersChange,
  onSortChange,
  onSaveSearch,
  onDeleteSearch,
  onSearchAnalytics,
  enableSuggestions = true,
  enableSavedSearches = true,
  enableAnalytics = false,
  enableAdvancedMode = true,
  enableNaturalLanguage = false,
  showResultCount = true,
  showPerformanceMetrics = false,
  maxSuggestions = 10,
  className = ''
}) => {
  const [searchMode, setSearchMode] = useState<SearchMode>('simple');
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [filters, setFilters] = useState<MilestoneFilter>(initialFilters);
  const [sort, setSort] = useState<MilestoneSort[]>(initialSort);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['basic']));
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SearchSuggestion | null>(null);
  const [validation, setValidation] = useState<FilterValidation>({ isValid: true, errors: [], warnings: [], suggestions: [] });
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickFilters: QuickFilter[] = useMemo(() => [
    {
      id: 'my-milestones',
      label: 'My Milestones',
      icon: User,
      description: 'Milestones assigned to me',
      filter: { assigneeId: context.userId },
      color: 'bg-blue-100 text-blue-800',
      shortcut: 'Ctrl+M'
    },
    {
      id: 'overdue',
      label: 'Overdue',
      icon: AlertTriangle,
      description: 'Milestones past their due date',
      filter: { overdue: true },
      color: 'bg-red-100 text-red-800',
      shortcut: 'Ctrl+O'
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      icon: Activity,
      description: 'Currently active milestones',
      filter: { status: 'in_progress' },
      color: 'bg-green-100 text-green-800',
      shortcut: 'Ctrl+P'
    },
    {
      id: 'high-priority',
      label: 'High Priority',
      icon: Flag,
      description: 'High and urgent priority milestones',
      filter: { priority: 'high' },
      color: 'bg-yellow-100 text-yellow-800',
      shortcut: 'Ctrl+H'
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      description: 'Successfully completed milestones',
      filter: { status: 'completed' },
      color: 'bg-gray-100 text-gray-800',
      shortcut: 'Ctrl+C'
    }
  ], [context.userId]);

  const filterGroups: FilterGroup[] = useMemo(() => [
    {
      id: 'basic',
      label: 'Basic Filters',
      icon: Filter,
      expanded: true,
      priority: 1,
      filters: [
        {
          id: 'status',
          label: 'Status',
          type: 'multiselect',
          multiSelect: true,
          options: [
            { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-gray-100' },
            { value: 'in_progress', label: 'In Progress', icon: Activity, color: 'bg-blue-100' },
            { value: 'on_hold', label: 'On Hold', icon: Pause, color: 'bg-yellow-100' },
            { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-green-100' },
            { value: 'cancelled', label: 'Cancelled', icon: X, color: 'bg-red-100' }
          ]
        },
        {
          id: 'priority',
          label: 'Priority',
          type: 'multiselect',
          multiSelect: true,
          options: [
            { value: 'low', label: 'Low', color: 'bg-gray-100' },
            { value: 'medium', label: 'Medium', color: 'bg-blue-100' },
            { value: 'high', label: 'High', color: 'bg-yellow-100' },
            { value: 'urgent', label: 'Urgent', color: 'bg-red-100' }
          ]
        },
        {
          id: 'projectId',
          label: 'Project',
          type: 'select',
          searchable: true,
          options: projects.map(project => ({
            value: project.id,
            label: project.name,
            icon: Briefcase
          }))
        },
        {
          id: 'assigneeId',
          label: 'Assigned To',
          type: 'multiselect',
          multiSelect: true,
          searchable: true,
          options: teamMembers.map(member => ({
            value: member.id,
            label: member.name,
            icon: User
          }))
        }
      ]
    },
    {
      id: 'timeline',
      label: 'Timeline & Dates',
      icon: Calendar,
      expanded: false,
      priority: 2,
      filters: [
        {
          id: 'dateRange',
          label: 'Due Date Range',
          type: 'dateRange',
          placeholder: 'Select date range'
        },
        {
          id: 'overdue',
          label: 'Overdue Only',
          type: 'boolean'
        },
        {
          id: 'completedOnly',
          label: 'Completed Only',
          type: 'boolean'
        }
      ]
    },
    {
      id: 'progress',
      label: 'Progress & Performance',
      icon: TrendingUp,
      expanded: false,
      priority: 3,
      advanced: true,
      filters: [
        {
          id: 'progressMin',
          label: 'Minimum Progress',
          type: 'slider',
          min: 0,
          max: 100,
          step: 5
        },
        {
          id: 'progressMax',
          label: 'Maximum Progress',
          type: 'slider',
          min: 0,
          max: 100,
          step: 5
        }
      ]
    },
    {
      id: 'metadata',
      label: 'Additional Criteria',
      icon: Tag,
      expanded: false,
      priority: 4,
      advanced: true,
      filters: [
        {
          id: 'tags',
          label: 'Tags',
          type: 'tags',
          multiSelect: true,
          placeholder: 'Enter tags...'
        },
        {
          id: 'includeArchived',
          label: 'Include Archived',
          type: 'boolean'
        }
      ]
    }
  ], [projects, teamMembers]);

  const filteredSuggestions = useMemo(() => {
    if (!enableSuggestions || !searchQuery) return [];
    
    const query = searchQuery.toLowerCase();
    return suggestions
      .filter(suggestion => 
        suggestion.text.toLowerCase().includes(query) ||
        suggestion.description.toLowerCase().includes(query)
      )
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, maxSuggestions);
  }, [suggestions, searchQuery, enableSuggestions, maxSuggestions]);

  const filteredMilestones = useMemo(() => {
    const startTime = performance.now();
    setSearchStartTime(startTime);
    
    let filtered = milestones;

    // Text search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(milestone =>
        milestone.title.toLowerCase().includes(query) ||
        milestone.description?.toLowerCase().includes(query) ||
        milestone.metadata.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(milestone => milestone.status === filters.status);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(milestone => milestone.priority === filters.priority);
    }

    // Project filter
    if (filters.projectId) {
      filtered = filtered.filter(milestone => milestone.projectId === filters.projectId);
    }

    // Assignee filter
    if (filters.assigneeId) {
      filtered = filtered.filter(milestone => milestone.assignedTo.includes(filters.assigneeId!));
    }

    // Date range filter
    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filtered = filtered.filter(milestone => {
        if (!milestone.dueDate) return false;
        const dueDate = new Date(milestone.dueDate);
        return dueDate >= start && dueDate <= end;
      });
    }

    // Overdue filter
    if (filters.overdue) {
      const now = new Date();
      filtered = filtered.filter(milestone => 
        milestone.dueDate && 
        new Date(milestone.dueDate) < now && 
        milestone.status !== 'completed'
      );
    }

    // Completed only filter
    if (filters.completedOnly) {
      filtered = filtered.filter(milestone => milestone.status === 'completed');
    }

    // Include archived filter
    if (!filters.includeArchived) {
      filtered = filtered.filter(milestone => !milestone.isArchived);
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(milestone =>
        filters.tags!.some(tag =>
          milestone.metadata.tags?.includes(tag)
        )
      );
    }

    // Apply sorting
    if (sort.length > 0) {
      filtered.sort((a, b) => {
        for (const sortOption of sort) {
          const aValue = a[sortOption.field];
          const bValue = b[sortOption.field];
          
          if (aValue === bValue) continue;
          
          // Handle undefined values
          if (aValue === undefined && bValue === undefined) continue;
          if (aValue === undefined) return sortOption.direction === 'asc' ? 1 : -1;
          if (bValue === undefined) return sortOption.direction === 'asc' ? -1 : 1;
          
          const comparison = aValue < bValue ? -1 : 1;
          return sortOption.direction === 'asc' ? comparison : -comparison;
        }
        return 0;
      });
    }

    const endTime = performance.now();
    if (showPerformanceMetrics) {
      console.log(`Search completed in ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`Filtered ${milestones.length} to ${filtered.length} milestones`);
    }

    return filtered;
  }, [milestones, filters, sort, showPerformanceMetrics]);

  const handleFilterChange = useCallback((field: string, value: any) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const handleQuickFilter = useCallback((quickFilter: QuickFilter) => {
    const newFilters = { ...filters, ...quickFilter.filter };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters: MilestoneFilter = { search: searchQuery };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [searchQuery, onFiltersChange]);

  const handleSortChange = useCallback((field: keyof Milestone, direction: SortDirection) => {
    const newSort: MilestoneSort[] = [{ field, direction }];
    setSort(newSort);
    onSortChange(newSort);
  }, [onSortChange]);

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    handleFilterChange('search', query);
    setShowSuggestions(query.length > 0 && enableSuggestions);
  }, [handleFilterChange, enableSuggestions]);

  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.filter) {
      const newFilters = { ...filters, ...suggestion.filter };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    } else {
      setSearchQuery(suggestion.text);
      handleFilterChange('search', suggestion.text);
    }
    setShowSuggestions(false);
    setSelectedSuggestion(null);
  }, [filters, onFiltersChange, handleFilterChange]);

  const renderQuickFilters = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {quickFilters.map(quickFilter => {
        const Icon = quickFilter.icon;
        const isActive = Object.entries(quickFilter.filter).every(([key, value]) => 
          filters[key as keyof MilestoneFilter] === value
        );
        
        return (
          <button
            key={quickFilter.id}
            onClick={() => handleQuickFilter(quickFilter)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
              isActive 
                ? `${quickFilter.color} border-current` 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            title={quickFilter.description}
          >
            <Icon size={16} />
            <span className="text-sm">{quickFilter.label}</span>
            {quickFilter.shortcut && (
              <span className="text-xs opacity-60">({quickFilter.shortcut})</span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderSearchSuggestions = () => {
    if (!showSuggestions || filteredSuggestions.length === 0) return null;

    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
        <div className="p-2">
          <div className="text-xs text-gray-500 mb-2">Suggestions</div>
          {filteredSuggestions.map(suggestion => {
            const Icon = suggestion.icon;
            return (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded text-left"
              >
                <Icon size={16} className="text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm text-gray-900">{suggestion.text}</div>
                  <div className="text-xs text-gray-500">{suggestion.description}</div>
                </div>
                {suggestion.recentlyUsed && (
                  <Clock size={12} className="text-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFilterGroup = (group: FilterGroup) => {
    const Icon = group.icon;
    const isExpanded = expandedGroups.has(group.id);
    
    if (group.advanced && !showAdvanced) return null;

    return (
      <div key={group.id} className="border border-gray-200 rounded-lg">
        <button
          onClick={() => {
            const newExpanded = new Set(expandedGroups);
            if (isExpanded) {
              newExpanded.delete(group.id);
            } else {
              newExpanded.add(group.id);
            }
            setExpandedGroups(newExpanded);
          }}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
        >
          <div className="flex items-center space-x-2">
            <Icon size={16} className="text-gray-500" />
            <span className="font-medium text-gray-900">{group.label}</span>
          </div>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {isExpanded && (
          <div className="p-3 border-t border-gray-200 space-y-4">
            {group.filters.map(filter => (
              <div key={filter.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                {filter.type === 'select' && (
                  <select
                    value={filters[filter.id as keyof MilestoneFilter] as string || ''}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    {filter.options?.map(option => (
                      <option key={String(option.value)} value={String(option.value)}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {filter.type === 'boolean' && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={Boolean(filters[filter.id as keyof MilestoneFilter])}
                      onChange={(e) => handleFilterChange(filter.id, e.target.checked || undefined)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">{filter.label}</span>
                  </label>
                )}
                {filter.type === 'tags' && (
                  <input
                    type="text"
                    placeholder={filter.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Search & Filter</h2>
          <p className="text-gray-600">Find milestones with advanced search and filtering</p>
        </div>
        <div className="flex items-center space-x-3">
          {enableAdvancedMode && (
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                showAdvanced 
                  ? 'bg-blue-100 text-blue-700 border-blue-200' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Sliders size={16} />
              <span>Advanced</span>
            </button>
          )}
          {enableSavedSearches && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              <span>Save Search</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Filters */}
      {renderQuickFilters()}

      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search milestones by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => handleSearchQueryChange(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchQueryChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
        {renderSearchSuggestions()}
      </div>

      {/* Filter Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filterGroups
          .sort((a, b) => a.priority - b.priority)
          .map(group => renderFilterGroup(group))}
      </div>

      {/* Results Summary */}
      {showResultCount && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Found <span className="font-medium text-gray-900">{filteredMilestones.length}</span> of {milestones.length} milestones
            </span>
            {searchStartTime && showPerformanceMetrics && (
              <span className="text-xs text-gray-500">
                in {((performance.now() - searchStartTime)).toFixed(1)}ms
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearFilters}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <RotateCcw size={14} />
              <span>Clear</span>
            </button>
            <select
              onChange={(e) => {
                const [field, direction] = e.target.value.split(':');
                if (field && direction) {
                  handleSortChange(field as keyof Milestone, direction as SortDirection);
                }
              }}
              className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sort by...</option>
              <option value="title:asc">Title A-Z</option>
              <option value="title:desc">Title Z-A</option>
              <option value="dueDate:asc">Due Date (Earliest)</option>
              <option value="dueDate:desc">Due Date (Latest)</option>
              <option value="createdAt:desc">Recently Created</option>
              <option value="progress:desc">Progress (High to Low)</option>
            </select>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneSearchFilter;