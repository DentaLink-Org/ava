import React, { useState, useMemo } from 'react';
import { 
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Star,
  Clock,
  Calendar,
  Target,
  Users,
  MoreHorizontal,
  Plus,
  FolderOpen,
  Folder,
  CheckCircle,
  CircleDot,
  Pause,
  AlertCircle,
  X,
  Pin,
  Archive,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  Hash,
  Zap
} from 'lucide-react';
import { useMilestoneData } from '../../milestones';
import type { Milestone, MilestoneStatus } from '../../milestones/types';

interface MilestoneNavigationSidebarProps {
  projectId?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showFavorites?: boolean;
  showRecentActivity?: boolean;
  enableDragDrop?: boolean;
  enableQuickActions?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  groupBy?: 'status' | 'priority' | 'assignee' | 'dueDate' | 'project';
  sortBy?: 'dueDate' | 'priority' | 'status' | 'progress' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
  maxHeight?: string;
  onMilestoneSelect?: (milestone: Milestone) => void;
  onMilestoneEdit?: (milestone: Milestone) => void;
  onMilestoneCreate?: () => void;
  onGroupChange?: (groupBy: string) => void;
  className?: string;
}

interface NavigationGroup {
  id: string;
  title: string;
  count: number;
  milestones: Milestone[];
  expanded: boolean;
  color?: string;
  icon?: React.ComponentType<any>;
}

interface NavigationState {
  searchQuery: string;
  selectedMilestone: string | null;
  expandedGroups: Set<string>;
  pinnedMilestones: Set<string>;
  filterStatus: MilestoneStatus[];
  showArchived: boolean;
  viewMode: 'list' | 'compact' | 'minimal';
}

export const MilestoneNavigationSidebar: React.FC<MilestoneNavigationSidebarProps> = ({
  projectId = 'project-1',
  showSearch = true,
  showFilters = true,
  showFavorites = true,
  showRecentActivity = true,
  enableDragDrop = true,
  enableQuickActions = true,
  collapsible = true,
  defaultExpanded = true,
  groupBy = 'status',
  sortBy = 'dueDate',
  sortOrder = 'asc',
  maxHeight = '600px',
  onMilestoneSelect,
  onMilestoneEdit,
  onMilestoneCreate,
  onGroupChange,
  className = ''
}) => {
  const { milestones, loading, error, updateMilestone } = useMilestoneData({ 
    projectId,
    enableRealtime: true 
  });

  const [navState, setNavState] = useState<NavigationState>({
    searchQuery: '',
    selectedMilestone: null,
    expandedGroups: new Set(['pending', 'in_progress', 'completed']),
    pinnedMilestones: new Set(),
    filterStatus: ['pending', 'in_progress', 'completed', 'on_hold'],
    showArchived: false,
    viewMode: 'list'
  });

  const [isCollapsed, setIsCollapsed] = useState(!defaultExpanded);
  const [draggedMilestone, setDraggedMilestone] = useState<string | null>(null);

  // Filter and search milestones
  const filteredMilestones = useMemo(() => {
    return milestones.filter(milestone => {
      // Filter by status
      if (!navState.filterStatus.includes(milestone.status)) return false;
      
      // Filter by archived status
      if (!navState.showArchived && milestone.isArchived) return false;
      
      // Filter by search query
      if (navState.searchQuery) {
        const query = navState.searchQuery.toLowerCase();
        return (
          milestone.title.toLowerCase().includes(query) ||
          milestone.description?.toLowerCase().includes(query) ||
          milestone.description?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [milestones, navState.filterStatus, navState.showArchived, navState.searchQuery]);

  // Sort milestones
  const sortedMilestones = useMemo(() => {
    const sorted = [...filteredMilestones].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'dueDate':
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case 'priority':
          const priorityOrder: Record<string, number> = { low: 1, medium: 2, high: 3, urgent: 4 };
          comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          break;
        case 'status':
          const statusOrder = { pending: 1, in_progress: 2, completed: 3, cancelled: 4, on_hold: 5 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'progress':
          comparison = b.progress - a.progress;
          break;
        case 'alphabetical':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }, [filteredMilestones, sortBy, sortOrder]);

  // Group milestones
  const groupedMilestones = useMemo((): NavigationGroup[] => {
    const groups = new Map<string, NavigationGroup>();
    
    sortedMilestones.forEach(milestone => {
      let groupKey = '';
      let groupTitle = '';
      let groupColor = '';
      let groupIcon = Target;
      
      switch (groupBy) {
        case 'status':
          groupKey = milestone.status;
          groupTitle = milestone.status.replace('_', ' ').toUpperCase();
          switch (milestone.status) {
            case 'pending': groupColor = 'text-gray-600'; groupIcon = Clock; break;
            case 'in_progress': groupColor = 'text-blue-600'; groupIcon = CircleDot; break;
            case 'completed': groupColor = 'text-green-600'; groupIcon = CheckCircle; break;
            case 'cancelled': groupColor = 'text-red-600'; groupIcon = X; break;
            case 'on_hold': groupColor = 'text-yellow-600'; groupIcon = Pause; break;
          }
          break;
        case 'priority':
          groupKey = milestone.priority;
          groupTitle = milestone.priority.toUpperCase();
          switch (milestone.priority) {
            case 'low': groupColor = 'text-gray-600'; break;
            case 'medium': groupColor = 'text-blue-600'; break;
            case 'high': groupColor = 'text-orange-600'; break;
            case 'urgent': groupColor = 'text-red-600'; break;
            default: groupColor = 'text-gray-600'; break;
          }
          groupIcon = AlertCircle;
          break;
        case 'dueDate':
          const now = new Date();
          const dueDate = milestone.dueDate ? new Date(milestone.dueDate) : null;
          if (!dueDate) {
            groupKey = 'no_date';
            groupTitle = 'NO DUE DATE';
            groupColor = 'text-gray-600';
          } else if (dueDate < now) {
            groupKey = 'overdue';
            groupTitle = 'OVERDUE';
            groupColor = 'text-red-600';
          } else if (dueDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) {
            groupKey = 'this_week';
            groupTitle = 'THIS WEEK';
            groupColor = 'text-orange-600';
          } else if (dueDate.getTime() - now.getTime() <= 30 * 24 * 60 * 60 * 1000) {
            groupKey = 'this_month';
            groupTitle = 'THIS MONTH';
            groupColor = 'text-blue-600';
          } else {
            groupKey = 'later';
            groupTitle = 'LATER';
            groupColor = 'text-gray-600';
          }
          groupIcon = Calendar;
          break;
        default:
          groupKey = 'all';
          groupTitle = 'ALL MILESTONES';
          groupColor = 'text-gray-600';
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          id: groupKey,
          title: groupTitle,
          count: 0,
          milestones: [],
          expanded: navState.expandedGroups.has(groupKey),
          color: groupColor,
          icon: groupIcon
        });
      }
      
      const group = groups.get(groupKey)!;
      group.milestones.push(milestone);
      group.count++;
    });
    
    return Array.from(groups.values());
  }, [sortedMilestones, groupBy, navState.expandedGroups]);

  // Get status icon
  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'in_progress': return <CircleDot className="w-3 h-3 text-blue-500" />;
      case 'pending': return <Clock className="w-3 h-3 text-gray-500" />;
      case 'cancelled': return <X className="w-3 h-3 text-red-500" />;
      case 'on_hold': return <Pause className="w-3 h-3 text-yellow-500" />;
      default: return <CircleDot className="w-3 h-3 text-gray-500" />;
    }
  };

  // Get priority indicator
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  // Handle group toggle
  const toggleGroup = (groupId: string) => {
    setNavState(prev => {
      const newExpanded = new Set(prev.expandedGroups);
      if (newExpanded.has(groupId)) {
        newExpanded.delete(groupId);
      } else {
        newExpanded.add(groupId);
      }
      return { ...prev, expandedGroups: newExpanded };
    });
  };

  // Handle milestone selection
  const selectMilestone = (milestone: Milestone) => {
    setNavState(prev => ({ ...prev, selectedMilestone: milestone.id }));
    onMilestoneSelect?.(milestone);
  };

  // Handle pinning
  const togglePin = (milestoneId: string) => {
    setNavState(prev => {
      const newPinned = new Set(prev.pinnedMilestones);
      if (newPinned.has(milestoneId)) {
        newPinned.delete(milestoneId);
      } else {
        newPinned.add(milestoneId);
      }
      return { ...prev, pinnedMilestones: newPinned };
    });
  };

  // Drag and drop handlers
  const handleDragStart = (milestone: Milestone, e: React.DragEvent) => {
    if (!enableDragDrop) return;
    setDraggedMilestone(milestone.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetGroup: string, e: React.DragEvent) => {
    if (!enableDragDrop || !draggedMilestone) return;
    e.preventDefault();
    
    const milestone = milestones.find(m => m.id === draggedMilestone);
    if (milestone && groupBy === 'status') {
      updateMilestone(milestone.id, { status: targetGroup as MilestoneStatus });
    }
    
    setDraggedMilestone(null);
  };

  if (loading) {
    return (
      <div className={`bg-white border-r border-gray-200 ${className}`} style={{ maxHeight }}>
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white border-r border-gray-200 p-4 ${className}`} style={{ maxHeight }}>
        <div className="text-red-600 text-sm">
          <p>Error loading milestones</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col ${className}`} style={{ maxHeight }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Milestones</h3>
          <div className="flex items-center space-x-1">
            {onMilestoneCreate && (
              <button
                onClick={onMilestoneCreate}
                className="p-1 hover:bg-gray-100 rounded"
                title="Create Milestone"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 hover:bg-gray-100 rounded"
                title={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Search */}
            {showSearch && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search milestones..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={navState.searchQuery}
                  onChange={(e) => setNavState(prev => ({ ...prev, searchQuery: e.target.value }))}
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                {/* Group By */}
                <select
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                  value={groupBy}
                  onChange={(e) => onGroupChange?.(e.target.value)}
                >
                  <option value="status">Status</option>
                  <option value="priority">Priority</option>
                  <option value="dueDate">Due Date</option>
                  <option value="assignee">Assignee</option>
                </select>
                
                {/* Sort By */}
                <select
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    // Would trigger re-render with new sort
                  }}
                >
                  <option value="dueDate-asc">Due Date ↑</option>
                  <option value="dueDate-desc">Due Date ↓</option>
                  <option value="priority-desc">Priority ↓</option>
                  <option value="progress-desc">Progress ↓</option>
                  <option value="alphabetical-asc">A-Z</option>
                </select>
              </div>
              
              {/* View Mode */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setNavState(prev => ({ ...prev, viewMode: 'list' }))}
                  className={`p-1 rounded ${navState.viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                >
                  <Hash className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setNavState(prev => ({ ...prev, viewMode: 'compact' }))}
                  className={`p-1 rounded ${navState.viewMode === 'compact' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                >
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* Pinned Milestones */}
          {showFavorites && navState.pinnedMilestones.size > 0 && (
            <div className="p-3 border-b border-gray-200">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center">
                <Star className="w-3 h-3 mr-1" />
                Pinned
              </h4>
              <div className="space-y-1">
                {milestones
                  .filter(m => navState.pinnedMilestones.has(m.id))
                  .slice(0, 3)
                  .map(milestone => (
                    <div
                      key={milestone.id}
                      className={`p-2 rounded cursor-pointer hover:bg-gray-50 ${
                        navState.selectedMilestone === milestone.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                      }`}
                      onClick={() => selectMilestone(milestone)}
                    >
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(milestone.status)}
                        <span className="text-sm font-medium truncate flex-1">{milestone.title}</span>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(milestone.priority)}`} />
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* Milestone Groups */}
          <div className="flex-1 overflow-y-auto">
            {groupedMilestones.map(group => (
              <div key={group.id} className="border-b border-gray-100 last:border-b-0">
                {/* Group Header */}
                <div
                  className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
                  onClick={() => toggleGroup(group.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(group.id, e)}
                >
                  <div className="flex items-center space-x-2">
                    {group.expanded ? 
                      <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    }
                    {group.icon && <group.icon className={`w-4 h-4 ${group.color}`} />}
                    <span className={`text-sm font-medium ${group.color}`}>{group.title}</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {group.count}
                  </span>
                </div>

                {/* Group Content */}
                {group.expanded && (
                  <div className="divide-y divide-gray-100">
                    {group.milestones.map(milestone => (
                      <div
                        key={milestone.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 ${
                          navState.selectedMilestone === milestone.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                        }`}
                        onClick={() => selectMilestone(milestone)}
                        draggable={enableDragDrop}
                        onDragStart={(e) => handleDragStart(milestone, e)}
                      >
                        {navState.viewMode === 'list' ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(milestone.status)}
                              <span className="text-sm font-medium truncate flex-1">{milestone.title}</span>
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(milestone.priority)}`} />
                                {enableQuickActions && (
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        togglePin(milestone.id);
                                      }}
                                      className="p-1 hover:bg-gray-200 rounded"
                                    >
                                      <Pin className={`w-3 h-3 ${navState.pinnedMilestones.has(milestone.id) ? 'text-yellow-500' : 'text-gray-400'}`} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{milestone.progress}% complete</span>
                              {milestone.dueDate && (
                                <span>{new Date(milestone.dueDate).toLocaleDateString()}</span>
                              )}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-blue-500 h-1 rounded-full transition-all"
                                style={{ width: `${milestone.progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(milestone.status)}
                            <span className="text-sm truncate flex-1">{milestone.title}</span>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(milestone.priority)}`} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              {filteredMilestones.length} of {milestones.length} milestones
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MilestoneNavigationSidebar;