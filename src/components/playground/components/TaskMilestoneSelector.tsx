import React, { useState, useRef, useEffect } from 'react';
import { 
  Target, 
  ChevronDown, 
  Search, 
  Plus, 
  X,
  Calendar,
  TrendingUp,
  Clock
} from 'lucide-react';
import type { 
  Milestone, 
  CreateMilestoneData,
  MilestoneStatus
} from '../../milestones/types';

interface TaskMilestoneSelectorProps {
  currentMilestoneId?: string;
  projectId: string;
  milestones: Milestone[];
  onMilestoneSelect: (milestoneId: string | null) => void;
  enableCreate?: boolean;
  onMilestoneCreate?: (milestone: CreateMilestoneData) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const TaskMilestoneSelector: React.FC<TaskMilestoneSelectorProps> = ({
  currentMilestoneId,
  projectId,
  milestones,
  onMilestoneSelect,
  enableCreate = false,
  onMilestoneCreate,
  placeholder = "Select milestone",
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCreateForm(false);
        setSearchTerm('');
        setNewMilestoneTitle('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter milestones by project and search term
  const filteredMilestones = milestones
    .filter(milestone => 
      milestone.projectId === projectId && 
      !milestone.isArchived
    )
    .filter(milestone => 
      milestone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      milestone.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      milestone.metadata.tags?.some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      // Sort by: status (active first), then due date, then title
      const statusOrder = { 'in_progress': 0, 'pending': 1, 'completed': 2, 'on_hold': 3, 'cancelled': 4 };
      const aOrder = statusOrder[a.status] ?? 5;
      const bOrder = statusOrder[b.status] ?? 5;
      
      if (aOrder !== bOrder) return aOrder - bOrder;
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      return a.title.localeCompare(b.title);
    });

  const currentMilestone = currentMilestoneId 
    ? milestones.find(m => m.id === currentMilestoneId)
    : null;

  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'on_hold': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleMilestoneSelect = (milestoneId: string | null) => {
    onMilestoneSelect(milestoneId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateMilestone = async () => {
    if (!newMilestoneTitle.trim() || !onMilestoneCreate) return;

    setIsCreating(true);
    try {
      const milestoneData: CreateMilestoneData = {
        projectId,
        title: newMilestoneTitle.trim(),
        priority: 'medium',
        color: '#3b82f6',
        assignedTo: []
      };

      await onMilestoneCreate(milestoneData);
      setShowCreateForm(false);
      setNewMilestoneTitle('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create milestone:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          hover:border-gray-400 transition-colors
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Target className="h-4 w-4 text-gray-400 flex-shrink-0" />
            {currentMilestone ? (
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <span 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: currentMilestone.color }}
                />
                <span className="font-medium text-gray-900 truncate">
                  {currentMilestone.title}
                </span>
                <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(currentMilestone.status)}`}>
                  {currentMilestone.status.replace('_', ' ')}
                </span>
              </div>
            ) : (
              <span className="text-gray-500 truncate">{placeholder}</span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search milestones..."
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {/* None option */}
            <button
              type="button"
              onClick={() => handleMilestoneSelect(null)}
              className={`
                w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                ${!currentMilestoneId ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
              `}
            >
              <div className="flex items-center space-x-2">
                <X className="h-4 w-4 text-gray-400" />
                <span className="text-sm">No milestone</span>
              </div>
            </button>

            {/* Milestone options */}
            {filteredMilestones.map((milestone) => {
              const isSelected = milestone.id === currentMilestoneId;
              const isOverdue = milestone.dueDate && 
                new Date(milestone.dueDate) < new Date() && 
                milestone.status !== 'completed' && 
                milestone.status !== 'cancelled';

              return (
                <button
                  key={milestone.id}
                  type="button"
                  onClick={() => handleMilestoneSelect(milestone.id)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                    ${isSelected ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 min-w-0 flex-1">
                      <span 
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: milestone.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                            {milestone.title}
                          </span>
                          <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(milestone.status)}`}>
                            {milestone.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        {milestone.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {milestone.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-3 mt-1">
                          {milestone.dueDate && (
                            <div className={`flex items-center text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(milestone.dueDate)}
                              {isOverdue && <Clock className="h-3 w-3 ml-1" />}
                            </div>
                          )}
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {milestone.progress}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* No results */}
            {searchTerm && filteredMilestones.length === 0 && (
              <div className="px-3 py-4 text-center text-gray-500">
                <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No milestones found</p>
                <p className="text-xs">Try a different search term</p>
              </div>
            )}

            {/* Create New Milestone */}
            {enableCreate && onMilestoneCreate && (
              <div className="border-t border-gray-200">
                {!showCreateForm ? (
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-blue-600"
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span className="text-sm font-medium">Create new milestone</span>
                    </div>
                  </button>
                ) : (
                  <div className="p-3 bg-gray-50">
                    <div className="flex items-center space-x-2 mb-2">
                      <Plus className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Create new milestone</span>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCreateMilestone();
                          } else if (e.key === 'Escape') {
                            setShowCreateForm(false);
                            setNewMilestoneTitle('');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter milestone title"
                        autoFocus
                      />
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateForm(false);
                            setNewMilestoneTitle('');
                          }}
                          className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                          disabled={isCreating}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateMilestone}
                          disabled={!newMilestoneTitle.trim() || isCreating}
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCreating ? 'Creating...' : 'Create'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};