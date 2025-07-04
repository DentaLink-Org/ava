import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Minus, 
  Move, 
  Copy, 
  Edit3, 
  Trash2, 
  Save, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw,
  Link,
  Unlink,
  ArrowRight,
  ArrowDown,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  Grid,
  List,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import type { 
  Milestone, 
  MilestoneStatus, 
  MilestoneDependency,
  TaskPriority,
  Project,
  TeamMember
} from '../../milestones/types';

export interface TimelineItem {
  id: string;
  type: 'milestone' | 'task' | 'dependency' | 'constraint';
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  priority: TaskPriority;
  status: MilestoneStatus;
  assignees: TeamMember[];
  dependencies: string[];
  color: string;
  locked: boolean;
  visible: boolean;
  metadata: TimelineItemMetadata;
}

export interface TimelineItemMetadata {
  estimatedHours?: number;
  actualHours?: number;
  budget?: number;
  actualCost?: number;
  resources?: string[];
  tags?: string[];
  notes?: string[];
  risks?: TimelineRisk[];
}

export interface TimelineRisk {
  id: string;
  type: 'schedule' | 'resource' | 'budget' | 'quality' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation?: string;
  impact: string;
  probability: number;
}

export interface TimelineConstraint {
  id: string;
  type: 'start-no-earlier' | 'start-no-later' | 'finish-no-earlier' | 'finish-no-later' | 'must-start' | 'must-finish';
  itemId: string;
  date: string;
  reason: string;
  flexible: boolean;
}

export interface TimelineView {
  id: string;
  name: string;
  scale: TimelineScale;
  startDate: string;
  endDate: string;
  showWeekends: boolean;
  showDependencies: boolean;
  showCriticalPath: boolean;
  showProgress: boolean;
  showResources: boolean;
  filters: TimelineFilter;
  zoom: number;
  scrollPosition: number;
}

export interface TimelineFilter {
  status?: MilestoneStatus[];
  priority?: TaskPriority[];
  assignees?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface TimelineAction {
  id: string;
  type: 'create' | 'update' | 'delete' | 'move' | 'link' | 'unlink';
  timestamp: string;
  user: string;
  itemId?: string;
  changes: Record<string, any>;
  description: string;
}

export interface TimelineSnapshot {
  id: string;
  name: string;
  timestamp: string;
  createdBy: string;
  items: TimelineItem[];
  constraints: TimelineConstraint[];
  metadata: Record<string, any>;
}

export type TimelineScale = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type ViewMode = 'gantt' | 'calendar' | 'list' | 'kanban';
export type EditMode = 'view' | 'edit' | 'planning';

export interface MilestoneTimelineEditorProps {
  project: Project;
  milestones: Milestone[];
  teamMembers: TeamMember[];
  onTimelineUpdate: (items: TimelineItem[]) => Promise<void>;
  onDependencyCreate: (fromId: string, toId: string, type: string) => Promise<void>;
  onDependencyDelete: (fromId: string, toId: string) => Promise<void>;
  onConstraintCreate: (constraint: TimelineConstraint) => Promise<void>;
  onConstraintUpdate: (constraintId: string, updates: Partial<TimelineConstraint>) => Promise<void>;
  onConstraintDelete: (constraintId: string) => Promise<void>;
  onSnapshotCreate: (name: string) => Promise<void>;
  onSnapshotRestore: (snapshotId: string) => Promise<void>;
  onExport: (format: 'json' | 'csv' | 'pdf' | 'png') => Promise<void>;
  onImport: (data: string) => Promise<void>;
  enableConstraints?: boolean;
  enableResourceLeveling?: boolean;
  enableCriticalPath?: boolean;
  enableUndo?: boolean;
  enableSnapshots?: boolean;
  maxUndoSteps?: number;
  className?: string;
}

export const MilestoneTimelineEditor: React.FC<MilestoneTimelineEditorProps> = ({
  project,
  milestones,
  teamMembers,
  onTimelineUpdate,
  onDependencyCreate,
  onDependencyDelete,
  onConstraintCreate,
  onConstraintUpdate,
  onConstraintDelete,
  onSnapshotCreate,
  onSnapshotRestore,
  onExport,
  onImport,
  enableConstraints = true,
  enableResourceLeveling = true,
  enableCriticalPath = true,
  enableUndo = true,
  enableSnapshots = true,
  maxUndoSteps = 50,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('gantt');
  const [editMode, setEditMode] = useState<EditMode>('view');
  const [timelineScale, setTimelineScale] = useState<TimelineScale>('week');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<TimelineItem | null>(null);
  const [showDependencies, setShowDependencies] = useState(true);
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [showResources, setShowResources] = useState(false);
  const [filter, setFilter] = useState<TimelineFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [undoStack, setUndoStack] = useState<TimelineAction[]>([]);
  const [redoStack, setRedoStack] = useState<TimelineAction[]>([]);
  const [snapshots, setSnapshots] = useState<TimelineSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [constraints, setConstraints] = useState<TimelineConstraint[]>([]);

  // Initialize timeline items from milestones
  useEffect(() => {
    const items: TimelineItem[] = milestones.map(milestone => {
      const startDate = milestone.createdAt;
      const endDate = milestone.dueDate || milestone.createdAt;
      const duration = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: milestone.id,
        type: 'milestone',
        title: milestone.title,
        description: milestone.description,
        startDate: startDate,
        endDate: endDate,
        duration: duration > 0 ? duration : 1, // Ensure positive duration
        progress: milestone.progress,
        priority: milestone.priority,
        status: milestone.status,
        assignees: milestone.assignedTo.map(userId => 
          teamMembers.find(member => member.id === userId) || { id: userId, name: 'Unknown User', email: '', role: 'member', isActive: true, joinedAt: '' }
        ), // Convert assignedTo string[] to TeamMember[]
        dependencies: milestone.dependencies.map(dep => dep.dependsOnId),
        color: milestone.color,
        locked: false,
        visible: true,
        metadata: {
          estimatedHours: milestone.metadata?.estimatedHours,
          tags: milestone.metadata?.tags,
          notes: milestone.metadata?.customFields?.notes || '', // Get notes from customFields
          risks: []
        }
      };
    });
    setTimelineItems(items);
  }, [milestones]);

  const handleItemMove = useCallback((itemId: string, newStartDate: string, newEndDate: string) => {
    setTimelineItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              startDate: newStartDate, 
              endDate: newEndDate,
              duration: Math.ceil((new Date(newEndDate).getTime() - new Date(newStartDate).getTime()) / (1000 * 60 * 60 * 24))
            }
          : item
      )
    );
  }, []);

  const handleItemResize = useCallback((itemId: string, newDuration: number) => {
    setTimelineItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const startDate = new Date(item.startDate);
          const endDate = new Date(startDate.getTime() + newDuration * 24 * 60 * 60 * 1000);
          return {
            ...item,
            duration: newDuration,
            endDate: endDate.toISOString().split('T')[0]
          };
        }
        return item;
      })
    );
  }, []);

  const handleDependencyCreate = useCallback(async (fromId: string, toId: string) => {
    try {
      await onDependencyCreate(fromId, toId, 'finish-to-start');
      setTimelineItems(prevItems => 
        prevItems.map(item => 
          item.id === toId 
            ? { ...item, dependencies: [...item.dependencies, fromId] }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to create dependency:', error);
      setError('Failed to create dependency');
    }
  }, [onDependencyCreate]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const lastAction = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, lastAction]);
    setUndoStack(prev => prev.slice(0, -1));
    
    // Apply reverse of last action
    // Implementation depends on action type
  }, [undoStack]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextAction = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, nextAction]);
    setRedoStack(prev => prev.slice(0, -1));
    
    // Apply next action
    // Implementation depends on action type
  }, [redoStack]);

  const handleZoom = useCallback((delta: number) => {
    setZoom(prevZoom => Math.max(0.5, Math.min(3, prevZoom + delta)));
  }, []);

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      await onTimelineUpdate(timelineItems);
    } catch (error) {
      console.error('Failed to save timeline:', error);
      setError('Failed to save timeline');
    } finally {
      setLoading(false);
    }
  }, [timelineItems, onTimelineUpdate]);

  const handleExport = useCallback(async (format: 'json' | 'csv' | 'pdf' | 'png') => {
    try {
      await onExport(format);
    } catch (error) {
      console.error('Failed to export timeline:', error);
      setError('Failed to export timeline');
    }
  }, [onExport]);

  const filteredItems = timelineItems.filter(item => {
    if (filter.status && !filter.status.includes(item.status)) return false;
    if (filter.priority && !filter.priority.includes(item.priority)) return false;
    if (filter.assignees && !item.assignees.some(a => filter.assignees?.includes(a.id))) return false;
    if (filter.tags && !item.metadata.tags?.some(t => filter.tags?.includes(t))) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(query) || 
             item.description?.toLowerCase().includes(query);
    }
    return item.visible;
  });

  const renderGanttChart = () => {
    const scaleWidth = zoom * 40; // pixels per day
    const itemHeight = 40;
    const headerHeight = 60;
    
    return (
      <div className="relative overflow-auto border rounded-lg bg-white" style={{ height: '600px' }}>
        {/* Timeline Header */}
        <div className="sticky top-0 z-10 bg-gray-50 border-b" style={{ height: `${headerHeight}px` }}>
          <div className="flex items-center px-4 py-3">
            <div className="w-64 font-semibold text-gray-900">Task Name</div>
            <div className="flex-1 text-center font-semibold text-gray-900">Timeline</div>
          </div>
        </div>

        {/* Timeline Items */}
        <div className="relative">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center border-b hover:bg-gray-50 ${
                selectedItems.has(item.id) ? 'bg-blue-50' : ''
              }`}
              style={{ height: `${itemHeight}px` }}
              onClick={() => {
                const newSelection = new Set(selectedItems);
                if (newSelection.has(item.id)) {
                  newSelection.delete(item.id);
                } else {
                  newSelection.add(item.id);
                }
                setSelectedItems(newSelection);
              }}
            >
              {/* Item Details */}
              <div className="w-64 px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <div className="font-medium text-gray-900 truncate">{item.title}</div>
                    <div className="text-sm text-gray-500">
                      {item.duration} days • {item.progress}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Bar */}
              <div className="flex-1 relative py-2">
                <div 
                  className="absolute rounded-lg flex items-center justify-center text-white text-sm font-medium"
                  style={{
                    backgroundColor: item.color,
                    left: `${(new Date(item.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) * scaleWidth}px`,
                    width: `${item.duration * scaleWidth}px`,
                    height: '24px',
                    opacity: item.locked ? 0.7 : 1
                  }}
                >
                  {showProgress && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-green-500 rounded-lg"
                      style={{ width: `${item.progress}%` }}
                    />
                  )}
                  <span className="relative z-10 truncate px-2">{item.title}</span>
                  {item.locked && (
                    <Lock size={14} className="absolute top-1 right-1 text-white" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dependencies */}
        {showDependencies && (
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
            {filteredItems.map(item => 
              item.dependencies.map(depId => {
                const depItem = timelineItems.find(i => i.id === depId);
                if (!depItem) return null;
                
                const fromIndex = filteredItems.findIndex(i => i.id === depId);
                const toIndex = filteredItems.findIndex(i => i.id === item.id);
                
                if (fromIndex === -1 || toIndex === -1) return null;
                
                const fromY = headerHeight + (fromIndex + 0.5) * itemHeight;
                const toY = headerHeight + (toIndex + 0.5) * itemHeight;
                const fromX = 264 + (new Date(depItem.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) * scaleWidth;
                const toX = 264 + (new Date(item.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) * scaleWidth;
                
                return (
                  <g key={`${depId}-${item.id}`}>
                    <line
                      x1={fromX}
                      y1={fromY}
                      x2={toX}
                      y2={toY}
                      stroke="#3B82F6"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })
            )}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
              </marker>
            </defs>
          </svg>
        )}
      </div>
    );
  };

  const renderCalendarView = () => (
    <div className="bg-white rounded-lg border p-6">
      <div className="text-center text-gray-500 py-12">
        <Calendar size={48} className="mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
        <p>Calendar view implementation coming soon</p>
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Timeline Items</h3>
      </div>
      <div className="divide-y">
        {filteredItems.map(item => (
          <div key={item.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{item.startDate} - {item.endDate}</span>
                <span>{item.duration} days</span>
                <span>{item.progress}% complete</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderViewContent = () => {
    switch (viewMode) {
      case 'gantt':
        return renderGanttChart();
      case 'calendar':
        return renderCalendarView();
      case 'list':
        return renderListView();
      default:
        return renderGanttChart();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Timeline Editor</h2>
          <p className="text-gray-600">Plan and edit project timeline with advanced constraints</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('gantt')}
              className={`p-2 rounded-lg ${
                viewMode === 'gantt' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg ${
                viewMode === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List size={20} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditMode(editMode === 'edit' ? 'view' : 'edit')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                editMode === 'edit' 
                  ? 'bg-blue-600 text-white' 
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Edit3 size={16} />
              <span>{editMode === 'edit' ? 'View' : 'Edit'}</span>
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-sm text-gray-700 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ZoomIn size={16} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timelineScale}
              onChange={(e) => setTimelineScale(e.target.value as TimelineScale)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDependencies(!showDependencies)}
              className={`p-2 rounded-lg ${
                showDependencies ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Link size={16} />
            </button>
            <button
              onClick={() => setShowCriticalPath(!showCriticalPath)}
              className={`p-2 rounded-lg ${
                showCriticalPath ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <AlertTriangle size={16} />
            </button>
            <button
              onClick={() => setShowProgress(!showProgress)}
              className={`p-2 rounded-lg ${
                showProgress ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CheckCircle size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {enableUndo && (
            <>
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <Undo size={16} />
              </button>
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <Redo size={16} />
              </button>
            </>
          )}
          <button
            onClick={() => handleExport('json')}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search timeline items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filter.status?.[0] || ''}
          onChange={(e) => setFilter({ ...filter, status: e.target.value ? [e.target.value as MilestoneStatus] : undefined })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Timeline View */}
      {renderViewContent()}

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

export default MilestoneTimelineEditor;