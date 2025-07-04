import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  CircleDot,
  Pause,
  X,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useMilestoneData } from '../../milestones';
import type { Milestone, MilestoneStatus } from '../../milestones/types';

interface MilestoneCalendarProps {
  projectId?: string;
  viewMode?: 'month' | 'week' | 'day';
  showWeekends?: boolean;
  enableDragDrop?: boolean;
  enableMilestoneCreate?: boolean;
  enableMilestoneEdit?: boolean;
  enableExport?: boolean;
  enableFiltering?: boolean;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  onMilestoneClick?: (milestone: Milestone) => void;
  onMilestoneEdit?: (milestone: Milestone) => void;
  onMilestoneCreate?: (date: Date) => void;
  onMilestoneMove?: (milestoneId: string, newDate: Date) => void;
  onMilestoneDelete?: (milestoneId: string) => void;
  className?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  milestones: Milestone[];
  hasConflicts: boolean;
}

interface CalendarViewState {
  currentDate: Date;
  selectedDate: Date | null;
  selectedMilestone: Milestone | null;
  showMilestoneModal: boolean;
  filterStatus: MilestoneStatus[];
  draggedMilestone: Milestone | null;
  hoveredDate: Date | null;
  showDetails: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MilestoneCalendar: React.FC<MilestoneCalendarProps> = ({
  projectId = 'project-1',
  viewMode = 'month',
  showWeekends = true,
  enableDragDrop = true,
  enableMilestoneCreate = true,
  enableMilestoneEdit = true,
  enableExport = true,
  enableFiltering = true,
  defaultDate = new Date(),
  onDateChange,
  onMilestoneClick,
  onMilestoneEdit,
  onMilestoneCreate,
  onMilestoneMove,
  onMilestoneDelete,
  className = ''
}) => {
  const { milestones, loading, error, updateMilestone, deleteMilestone } = useMilestoneData({ 
    projectId,
    enableRealtime: true 
  });

  const [viewState, setViewState] = useState<CalendarViewState>({
    currentDate: defaultDate,
    selectedDate: null,
    selectedMilestone: null,
    showMilestoneModal: false,
    filterStatus: ['pending', 'in_progress', 'completed', 'on_hold'],
    draggedMilestone: null,
    hoveredDate: null,
    showDetails: false
  });

  // Filter milestones based on current filters
  const filteredMilestones = useMemo(() => 
    milestones.filter(milestone => 
      viewState.filterStatus.includes(milestone.status) &&
      !milestone.isArchived &&
      milestone.dueDate
    ),
    [milestones, viewState.filterStatus]
  );

  // Generate calendar days for current view
  const calendarDays = useMemo(() => {
    const year = viewState.currentDate.getFullYear();
    const month = viewState.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      // Find milestones for this date
      const dayMilestones = filteredMilestones.filter(milestone => {
        if (!milestone.dueDate) return false;
        const milestoneDate = new Date(milestone.dueDate);
        milestoneDate.setHours(0, 0, 0, 0);
        return milestoneDate.getTime() === date.getTime();
      });
      
      // Check for conflicts (multiple milestones on same date)
      const hasConflicts = dayMilestones.length > 1;
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        isWeekend,
        milestones: dayMilestones,
        hasConflicts
      });
    }
    
    return days;
  }, [viewState.currentDate, filteredMilestones]);

  // Navigation handlers
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewState.currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setViewState(prev => ({ ...prev, currentDate: newDate }));
    onDateChange?.(newDate);
  };

  const navigateToToday = () => {
    const today = new Date();
    setViewState(prev => ({ ...prev, currentDate: today }));
    onDateChange?.(today);
  };

  // Status color mapping
  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'pending': return 'bg-gray-400 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      case 'on_hold': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'in_progress': return <CircleDot className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'cancelled': return <X className="w-3 h-3" />;
      case 'on_hold': return <Pause className="w-3 h-3" />;
      default: return <CircleDot className="w-3 h-3" />;
    }
  };

  // Drag and drop handlers
  const handleMilestoneDragStart = (milestone: Milestone, e: React.DragEvent) => {
    if (!enableDragDrop) return;
    
    setViewState(prev => ({ ...prev, draggedMilestone: milestone }));
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', milestone.id);
  };

  const handleDateDragOver = (date: Date, e: React.DragEvent) => {
    if (!enableDragDrop || !viewState.draggedMilestone) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setViewState(prev => ({ ...prev, hoveredDate: date }));
  };

  const handleDateDragLeave = () => {
    setViewState(prev => ({ ...prev, hoveredDate: null }));
  };

  const handleDateDrop = (date: Date, e: React.DragEvent) => {
    if (!enableDragDrop || !viewState.draggedMilestone) return;
    
    e.preventDefault();
    const milestone = viewState.draggedMilestone;
    
    // Update milestone date
    const newMilestone = {
      ...milestone,
      dueDate: date.toISOString()
    };
    
    updateMilestone(milestone.id, newMilestone);
    onMilestoneMove?.(milestone.id, date);
    
    setViewState(prev => ({ 
      ...prev, 
      draggedMilestone: null, 
      hoveredDate: null 
    }));
  };

  // Export functionality
  const handleExport = () => {
    const exportData = {
      calendar: {
        month: viewState.currentDate.getMonth() + 1,
        year: viewState.currentDate.getFullYear(),
        viewMode
      },
      milestones: filteredMilestones.map(m => ({
        id: m.id,
        title: m.title,
        dueDate: m.dueDate,
        status: m.status,
        priority: m.priority,
        progress: m.progress
      })),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `milestone-calendar-${viewState.currentDate.getFullYear()}-${viewState.currentDate.getMonth() + 1}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-red-600">
          <h3 className="font-semibold mb-2">Error Loading Calendar</h3>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Milestone Calendar</h2>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredMilestones.length} milestones
              </span>
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
                  <option value="pending,in_progress,completed,on_hold">All</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            )}
            
            {/* Export Button */}
            {enableExport && (
              <button
                onClick={handleExport}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {MONTHS[viewState.currentDate.getMonth()]} {viewState.currentDate.getFullYear()}
            </h3>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={navigateToToday}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Today
            </button>
            
            {enableMilestoneCreate && (
              <button
                onClick={() => onMilestoneCreate?.(viewState.currentDate)}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add Milestone</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                min-h-20 p-1 border rounded-lg cursor-pointer transition-colors
                ${day.isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}
                ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                ${!showWeekends && day.isWeekend ? 'hidden' : ''}
                ${viewState.hoveredDate?.getTime() === day.date.getTime() ? 'bg-blue-50 border-blue-300' : ''}
                hover:bg-gray-50
              `}
              onClick={() => {
                setViewState(prev => ({ ...prev, selectedDate: day.date }));
                if (day.milestones.length === 0 && enableMilestoneCreate) {
                  onMilestoneCreate?.(day.date);
                }
              }}
              onDragOver={(e) => handleDateDragOver(day.date, e)}
              onDragLeave={handleDateDragLeave}
              onDrop={(e) => handleDateDrop(day.date, e)}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${day.isToday ? 'text-blue-600' : ''}`}>
                  {day.date.getDate()}
                </span>
                
                {day.hasConflicts && (
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                )}
              </div>
              
              {/* Milestones */}
              <div className="space-y-1">
                {day.milestones.slice(0, 3).map((milestone, mIndex) => (
                  <div
                    key={milestone.id}
                    className={`
                      text-xs px-2 py-1 rounded cursor-pointer transition-all
                      ${getStatusColor(milestone.status)}
                      hover:opacity-80
                    `}
                    draggable={enableDragDrop}
                    onDragStart={(e) => handleMilestoneDragStart(milestone, e)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewState(prev => ({ ...prev, selectedMilestone: milestone, showDetails: true }));
                      onMilestoneClick?.(milestone);
                    }}
                  >
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(milestone.status)}
                      <span className="truncate flex-1">{milestone.title}</span>
                    </div>
                  </div>
                ))}
                
                {day.milestones.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{day.milestones.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Milestone Details Modal */}
      {viewState.showDetails && viewState.selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Milestone Details</h3>
                <button
                  onClick={() => setViewState(prev => ({ ...prev, showDetails: false, selectedMilestone: null }))}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">{viewState.selectedMilestone.title}</h4>
                <p className="text-sm text-gray-600">{viewState.selectedMilestone.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(viewState.selectedMilestone.status)}`}>
                    {getStatusIcon(viewState.selectedMilestone.status)}
                    <span>{viewState.selectedMilestone.status.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Priority</span>
                  <div className="text-sm text-gray-600 capitalize">{viewState.selectedMilestone.priority}</div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <div className="text-sm text-gray-600">{viewState.selectedMilestone.progress}%</div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Tasks</span>
                  <div className="text-sm text-gray-600">{viewState.selectedMilestone.tasks.length}</div>
                </div>
              </div>
              
              {viewState.selectedMilestone.dueDate && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Due Date</span>
                  <div className="text-sm text-gray-600">
                    {new Date(viewState.selectedMilestone.dueDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex space-x-2">
              {enableMilestoneEdit && (
                <button
                  onClick={() => {
                    onMilestoneEdit?.(viewState.selectedMilestone!);
                    setViewState(prev => ({ ...prev, showDetails: false, selectedMilestone: null }));
                  }}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  onMilestoneDelete?.(viewState.selectedMilestone!.id);
                  setViewState(prev => ({ ...prev, showDetails: false, selectedMilestone: null }));
                }}
                className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
              
              <button
                onClick={() => setViewState(prev => ({ ...prev, showDetails: false, selectedMilestone: null }))}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneCalendar;