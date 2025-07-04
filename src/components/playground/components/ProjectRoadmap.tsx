import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  TrendingUp, 
  ZoomIn, 
  ZoomOut,
  Download,
  Filter,
  Settings,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useMilestoneData } from '../../milestones';
import type { Milestone, MilestoneStatus, Project } from '../../milestones/types';

interface ProjectRoadmapProps {
  projectId?: string;
  projects?: Project[];
  showMultipleProjects?: boolean;
  timeRange?: 'month' | 'quarter' | 'year';
  viewMode?: 'timeline' | 'gantt' | 'dependencies';
  enableExport?: boolean;
  enableZoom?: boolean;
  enableFiltering?: boolean;
  minDate?: string;
  maxDate?: string;
  onMilestoneClick?: (milestone: Milestone) => void;
  onMilestoneEdit?: (milestone: Milestone) => void;
  onMilestoneMove?: (milestoneId: string, newDate: string) => void;
  className?: string;
}

interface TimelinePosition {
  x: number;
  width: number;
  milestone: Milestone;
}

interface RoadmapViewState {
  zoom: number;
  offsetX: number;
  selectedMilestone: string | null;
  showDetails: boolean;
  filterStatus: MilestoneStatus[];
  showDependencies: boolean;
  fullscreen: boolean;
}

export const ProjectRoadmap: React.FC<ProjectRoadmapProps> = ({
  projectId = 'project-1',
  projects = [],
  showMultipleProjects = false,
  timeRange = 'quarter',
  viewMode = 'timeline',
  enableExport = true,
  enableZoom = true,
  enableFiltering = true,
  minDate,
  maxDate,
  onMilestoneClick,
  onMilestoneEdit,
  onMilestoneMove,
  className = ''
}) => {
  const { milestones, loading, error, updateMilestone } = useMilestoneData({ 
    projectId,
    enableRealtime: true 
  });

  const [viewState, setViewState] = useState<RoadmapViewState>({
    zoom: 1,
    offsetX: 0,
    selectedMilestone: null,
    showDetails: false,
    filterStatus: ['pending', 'in_progress', 'completed'],
    showDependencies: true,
    fullscreen: false
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMilestone, setDragMilestone] = useState<string | null>(null);

  const roadmapRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate timeline bounds
  const getTimelineBounds = () => {
    const now = new Date();
    const start = minDate ? new Date(minDate) : new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = maxDate ? new Date(maxDate) : new Date(now.getFullYear(), now.getMonth() + 6, 0);
    return { start, end };
  };

  const { start: timelineStart, end: timelineEnd } = getTimelineBounds();
  const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));

  // Filter milestones based on current filters
  const filteredMilestones = milestones.filter(milestone => 
    viewState.filterStatus.includes(milestone.status) &&
    !milestone.isArchived
  );

  // Calculate milestone positions on timeline
  const calculateMilestonePosition = (milestone: Milestone): TimelinePosition => {
    const dueDate = milestone.dueDate ? new Date(milestone.dueDate) : new Date();
    const daysSinceStart = Math.ceil((dueDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const x = (daysSinceStart / totalDays) * 100;
    
    // Width based on milestone duration (estimated from tasks)
    const estimatedDuration = milestone.tasks.length * 2; // 2 days per task average
    const width = Math.max(2, (estimatedDuration / totalDays) * 100);
    
    return { x, width, milestone };
  };

  const milestonePositions = filteredMilestones.map(calculateMilestonePosition);

  // Handle zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    setViewState(prev => ({
      ...prev,
      zoom: direction === 'in' ? 
        Math.min(prev.zoom * 1.2, 3) : 
        Math.max(prev.zoom / 1.2, 0.5)
    }));
  };

  // Handle timeline scrolling
  const handleScroll = (direction: 'left' | 'right') => {
    setViewState(prev => ({
      ...prev,
      offsetX: direction === 'left' ? 
        Math.max(prev.offsetX - 10, -50) : 
        Math.min(prev.offsetX + 10, 50)
    }));
  };

  // Handle milestone drag and drop
  const handleMilestoneMouseDown = (milestone: Milestone, e: React.MouseEvent) => {
    if (onMilestoneMove) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragMilestone(milestone.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragMilestone && timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      const newDate = new Date(timelineStart.getTime() + (percentage / 100) * (timelineEnd.getTime() - timelineStart.getTime()));
      
      // Visual feedback could be added here
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging && dragMilestone && timelineRef.current && onMilestoneMove) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      const newDate = new Date(timelineStart.getTime() + (percentage / 100) * (timelineEnd.getTime() - timelineStart.getTime()));
      
      onMilestoneMove(dragMilestone, newDate.toISOString());
    }
    
    setIsDragging(false);
    setDragMilestone(null);
  };

  // Export functionality
  const handleExport = () => {
    const exportData = {
      project: projectId,
      timeRange: { start: timelineStart, end: timelineEnd },
      milestones: filteredMilestones,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-roadmap-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate time markers
  const generateTimeMarkers = () => {
    const markers = [];
    const current = new Date(timelineStart);
    
    while (current <= timelineEnd) {
      const daysSinceStart = Math.ceil((current.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
      const x = (daysSinceStart / totalDays) * 100;
      
      markers.push({
        date: new Date(current),
        x,
        isMonth: current.getDate() === 1,
        isWeek: current.getDay() === 1
      });
      
      current.setDate(current.getDate() + (timeRange === 'month' ? 1 : 7));
    }
    
    return markers;
  };

  const timeMarkers = generateTimeMarkers();

  // Status color mapping
  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-600';
      case 'in_progress': return 'bg-blue-500 border-blue-600';
      case 'pending': return 'bg-gray-400 border-gray-500';
      case 'cancelled': return 'bg-red-500 border-red-600';
      case 'on_hold': return 'bg-yellow-500 border-yellow-600';
      default: return 'bg-gray-400 border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-red-600">
          <h3 className="font-semibold mb-2">Error Loading Roadmap</h3>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${viewState.fullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Project Roadmap</h2>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{filteredMilestones.length} milestones</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Filter Controls */}
            {enableFiltering && (
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select 
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  value={viewState.filterStatus.join(',')}
                  onChange={(e) => setViewState(prev => ({
                    ...prev,
                    filterStatus: e.target.value.split(',') as MilestoneStatus[]
                  }))}
                >
                  <option value="pending,in_progress,completed">All Active</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
            
            {/* Zoom Controls */}
            {enableZoom && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleZoom('out')}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 px-2">
                  {Math.round(viewState.zoom * 100)}%
                </span>
                <button
                  onClick={() => handleZoom('in')}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* Navigation Controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleScroll('left')}
                className="p-1 hover:bg-gray-100 rounded"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-1 hover:bg-gray-100 rounded"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Export Button */}
            {enableExport && (
              <button
                onClick={handleExport}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                title="Export Roadmap"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </button>
            )}
            
            {/* Fullscreen Toggle */}
            <button
              onClick={() => setViewState(prev => ({ ...prev, fullscreen: !prev.fullscreen }))}
              className="p-1 hover:bg-gray-100 rounded"
              title={viewState.fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {viewState.fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div 
        ref={roadmapRef}
        className="relative overflow-hidden"
        style={{ height: viewState.fullscreen ? 'calc(100vh - 120px)' : '600px' }}
      >
        {/* Timeline Header */}
        <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 p-4">
          <div 
            ref={timelineRef}
            className="relative h-12"
            style={{ 
              transform: `translateX(${viewState.offsetX}px) scale(${viewState.zoom})`,
              transformOrigin: 'left center'
            }}
          >
            {/* Time Markers */}
            {timeMarkers.map((marker, index) => (
              <div
                key={index}
                className="absolute flex flex-col items-center"
                style={{ left: `${marker.x}%` }}
              >
                <div className={`w-px h-3 ${marker.isMonth ? 'bg-gray-600' : 'bg-gray-300'}`} />
                <span className={`text-xs mt-1 ${marker.isMonth ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
                  {marker.isMonth ? 
                    marker.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) :
                    marker.date.getDate().toString()
                  }
                </span>
              </div>
            ))}
            
            {/* Current Date Indicator */}
            <div
              className="absolute top-0 w-px h-full bg-red-500 opacity-70"
              style={{ left: `${((new Date().getTime() - timelineStart.getTime()) / (timelineEnd.getTime() - timelineStart.getTime())) * 100}%` }}
            >
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div 
          className="relative p-4 space-y-4"
          style={{ 
            transform: `translateX(${viewState.offsetX}px) scale(${viewState.zoom})`,
            transformOrigin: 'left top'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {milestonePositions.map((position, index) => (
            <div
              key={position.milestone.id}
              className="relative h-16 group"
              style={{ top: `${index * 20}px` }}
            >
              {/* Milestone Bar */}
              <div
                className={`absolute h-8 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  getStatusColor(position.milestone.status)
                } ${
                  viewState.selectedMilestone === position.milestone.id ? 'ring-2 ring-blue-400' : ''
                }`}
                style={{ 
                  left: `${position.x}%`, 
                  width: `${Math.max(position.width, 8)}%`,
                  zIndex: viewState.selectedMilestone === position.milestone.id ? 20 : 10
                }}
                onMouseDown={(e) => handleMilestoneMouseDown(position.milestone, e)}
                onClick={() => {
                  setViewState(prev => ({ 
                    ...prev, 
                    selectedMilestone: position.milestone.id,
                    showDetails: true
                  }));
                  onMilestoneClick?.(position.milestone);
                }}
              >
                {/* Milestone Content */}
                <div className="h-full flex items-center px-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">
                      {position.milestone.title}
                    </div>
                    <div className="text-xs text-white opacity-75">
                      {position.milestone.progress}% complete
                    </div>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="w-4 h-4 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                    <div 
                      className="w-2 h-2 bg-white rounded-full"
                      style={{ opacity: position.milestone.progress / 100 }}
                    />
                  </div>
                </div>
                
                {/* Milestone tooltip */}
                <div className="absolute top-full left-0 mt-1 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                  <div className="font-medium">{position.milestone.title}</div>
                  <div>Due: {position.milestone.dueDate ? new Date(position.milestone.dueDate).toLocaleDateString() : 'No date'}</div>
                  <div>Progress: {position.milestone.progress}%</div>
                  <div>Tasks: {position.milestone.tasks.length}</div>
                </div>
              </div>
              
              {/* Dependency arrows */}
              {viewState.showDependencies && position.milestone.dependencies.map(dep => {
                const depMilestone = milestonePositions.find(p => p.milestone.id === dep.dependsOnId);
                if (!depMilestone) return null;
                
                const startX = depMilestone.x + depMilestone.width;
                const endX = position.x;
                const deltaX = endX - startX;
                
                return (
                  <div
                    key={dep.id}
                    className="absolute top-4 h-px bg-gray-400 opacity-60"
                    style={{
                      left: `${startX}%`,
                      width: `${deltaX}%`,
                      zIndex: 5
                    }}
                  >
                    <div className="absolute right-0 top-0 transform translate-x-1 -translate-y-1 w-2 h-2 border-r border-t border-gray-400 rotate-45" />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Details Panel */}
      {viewState.showDetails && viewState.selectedMilestone && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 overflow-y-auto z-40">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Milestone Details</h3>
              <button
                onClick={() => setViewState(prev => ({ ...prev, showDetails: false, selectedMilestone: null }))}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
          
          {(() => {
            const milestone = filteredMilestones.find(m => m.id === viewState.selectedMilestone);
            if (!milestone) return null;
            
            return (
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{milestone.title}</h4>
                  <p className="text-sm text-gray-600">{milestone.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(milestone.status).replace('bg-', 'bg-').replace('border-', 'text-')}`}>
                      {milestone.status.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-700">Priority</span>
                    <div className="text-sm text-gray-600 capitalize">{milestone.priority}</div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <div className="text-sm text-gray-600">{milestone.progress}%</div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-700">Tasks</span>
                    <div className="text-sm text-gray-600">{milestone.tasks.length} tasks</div>
                  </div>
                </div>
                
                {milestone.dueDate && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Due Date</span>
                    <div className="text-sm text-gray-600">{new Date(milestone.dueDate).toLocaleDateString()}</div>
                  </div>
                )}
                
                {milestone.dependencies.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Dependencies</span>
                    <div className="space-y-1">
                      {milestone.dependencies.map(dep => {
                        const depMilestone = filteredMilestones.find(m => m.id === dep.dependsOnId);
                        return (
                          <div key={dep.id} className="text-sm text-gray-600">
                            {depMilestone?.title || 'Unknown milestone'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => onMilestoneEdit?.(milestone)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Edit Milestone
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ProjectRoadmap;