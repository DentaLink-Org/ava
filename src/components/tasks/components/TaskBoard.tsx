import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, MoreVertical } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { Task, TaskStatus, Project, TeamMember, StatusColumn } from '../types';
import type { PageTheme } from '../../_shared/runtime/types';

interface TaskBoardProps {
  tasks: Task[];
  statuses: TaskStatus[];
  projects: Project[];
  teamMembers: TeamMember[];
  onTaskMove: (taskId: string, newStatus: string, newPosition: number) => void;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  enableDragDrop?: boolean;
  showPriority?: boolean;
  showAssignee?: boolean;
  showDueDate?: boolean;
  enableQuickActions?: boolean;
  statusColumns?: StatusColumn[];
  theme: PageTheme;
}

export function TaskBoard({
  tasks,
  statuses,
  projects,
  teamMembers,
  onTaskMove,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  enableDragDrop = true,
  showPriority = true,
  showAssignee = true,
  showDueDate = true,
  enableQuickActions = true,
  statusColumns = [],
  theme
}: TaskBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Create status columns from props or statuses
  const columns = statusColumns.length > 0 ? statusColumns : statuses.map(status => ({
    id: status.id,
    label: status.name,
    color: status.color,
    tasks: []
  }));

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status.id]) {
      acc[task.status.id] = [];
    }
    acc[task.status.id].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Sort tasks by position within each status
  Object.keys(tasksByStatus).forEach(statusId => {
    tasksByStatus[statusId].sort((a, b) => (a.position || 0) - (b.position || 0));
  });

  const handleDragStart = useCallback((start: any) => {
    setDraggedTaskId(start.draggableId);
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    setDraggedTaskId(null);
    
    if (!result.destination) {
      return;
    }

    const { draggableId, source, destination } = result;
    
    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Move the task
    onTaskMove(draggableId, destination.droppableId, destination.index);
  }, [onTaskMove]);

  const getProject = useCallback((projectId: string) => {
    return projects.find(p => p.id === projectId);
  }, [projects]);

  const getAssignee = useCallback((assigneeId?: string) => {
    if (!assigneeId) return undefined;
    return teamMembers.find(m => m.id === assigneeId);
  }, [teamMembers]);

  const handleQuickAdd = (statusId: string) => {
    // This would typically open a quick add modal or inline form
    console.log('Quick add task to status:', statusId);
  };

  const renderColumn = (column: StatusColumn) => {
    const columnTasks = tasksByStatus[column.id] || [];
    const isDefaultStatus = statuses.find(s => s.id === column.id)?.isDefault;

    return (
      <div key={column.id} className="board-column">
        <div className={`column-header ${column.id}`}>
          <div className="column-info">
            <h3 
              className="column-title" 
              style={{ color: theme.colors.text }}
            >
              {column.label}
            </h3>
            <span 
              className="column-count"
              style={{ 
                backgroundColor: '#e5e7eb',
                color: theme.colors.textSecondary 
              }}
            >
              {columnTasks.length}
            </span>
          </div>
          
          {enableQuickActions && (
            <div className="column-actions">
              <button
                className="btn ghost sm"
                onClick={() => handleQuickAdd(column.id)}
                title="Add task"
              >
                <Plus size={14} />
              </button>
              <button
                className="btn ghost sm"
                title="Column options"
              >
                <MoreVertical size={14} />
              </button>
            </div>
          )}
        </div>

        <Droppable droppableId={column.id} isDropDisabled={!enableDragDrop}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`column-tasks ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
              style={{
                backgroundColor: snapshot.isDraggingOver ? `${theme.colors.primary}10` : 'transparent',
                borderRadius: '8px',
                transition: 'background-color 200ms ease'
              }}
            >
              {columnTasks.map((task, index) => (
                <Draggable
                  key={task.id}
                  draggableId={task.id}
                  index={index}
                  isDragDisabled={!enableDragDrop}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging 
                          ? `${provided.draggableProps.style?.transform} rotate(2deg)`
                          : provided.draggableProps.style?.transform
                      }}
                    >
                      <TaskCard
                        task={task}
                        project={getProject(task.projectId)}
                        assignee={getAssignee(task.assigneeId)}
                        onEdit={() => onTaskUpdate(task.id, {})}
                        onDelete={onTaskDelete}
                        onStatusChange={(taskId, status) => {
                          const newStatus = statuses.find(s => s.id === status);
                          if (newStatus) {
                            onTaskUpdate(taskId, { status: newStatus });
                          }
                        }}
                        onPriorityChange={(taskId, priority) => {
                          onTaskUpdate(taskId, { priority });
                        }}
                        showPriority={showPriority}
                        showAssignee={showAssignee}
                        showDueDate={showDueDate}
                        isDragging={snapshot.isDragging || draggedTaskId === task.id}
                        theme={theme}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {/* Empty state for column */}
              {columnTasks.length === 0 && (
                <div 
                  className="column-empty-state"
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: theme.colors.textSecondary,
                    fontSize: '0.875rem'
                  }}
                >
                  {snapshot.isDraggingOver ? (
                    <div className="drag-placeholder">
                      Drop task here
                    </div>
                  ) : (
                    <>
                      <p>No tasks in {column.label.toLowerCase()}</p>
                      {enableQuickActions && (
                        <button
                          className="btn ghost sm"
                          onClick={() => handleQuickAdd(column.id)}
                          style={{ marginTop: '0.5rem' }}
                        >
                          <Plus size={14} />
                          Add task
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  if (!enableDragDrop) {
    // Render without drag and drop
    return (
      <div className="task-board" style={{ backgroundColor: theme.colors.surface }}>
        <div className="board-header">
          <h2 style={{ color: theme.colors.text }}>Task Board</h2>
        </div>
        
        <div className="board-columns">
          {columns.map(renderColumn)}
        </div>
      </div>
    );
  }

  return (
    <div className="task-board" style={{ backgroundColor: theme.colors.surface }}>
      <div className="board-header">
        <h2 style={{ color: theme.colors.text }}>Task Board</h2>
        
        <div className="board-view-switcher">
          <button className="view-switch-btn active">Board</button>
          <button className="view-switch-btn">List</button>
          <button className="view-switch-btn" disabled>Calendar</button>
        </div>
      </div>

      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {columns.map(renderColumn)}
        </div>
      </DragDropContext>
    </div>
  );
}