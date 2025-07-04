import React, { useState, useMemo, useCallback } from 'react';
import { 
  GitBranch, 
  ArrowRight, 
  ArrowLeft, 
  Link2, 
  Unlink, 
  Plus,
  Minus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Shuffle,
  RotateCcw,
  Eye,
  Edit3,
  Trash2,
  Share2,
  Download,
  Settings,
  Info,
  X,
  ChevronRight,
  ChevronDown,
  Circle,
  Square
} from 'lucide-react';
import type { 
  Task, 
  Project, 
  TeamMember, 
  TaskDependency, 
  TaskDependencyType,
  TaskPriority,
  TaskComplexity,
  UpdateTaskData
} from '../../tasks/types';

interface TaskDependencyManagerProps {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
  dependencies?: TaskDependency[];
  projectId?: string;
  enableVisualization?: boolean;
  enableCircularDetection?: boolean;
  enableBulkOperations?: boolean;
  enableCriticalPath?: boolean;
  enableAutoSuggestions?: boolean;
  showDependencyTypes?: boolean;
  onDependencyCreate?: (dependency: Omit<TaskDependency, 'id'>) => Promise<void>;
  onDependencyUpdate?: (dependencyId: string, updates: Partial<TaskDependency>) => Promise<void>;
  onDependencyDelete?: (dependencyId: string) => Promise<void>;
  onBulkUpdate?: (taskIds: string[], updates: UpdateTaskData) => Promise<void>;
  onCriticalPathAnalysis?: (projectId: string) => Promise<Task[]>;
}

interface DependencyGraph {
  nodes: TaskNode[];
  edges: DependencyEdge[];
}

interface TaskNode {
  id: string;
  task: Task;
  level: number;
  criticalPath?: boolean;
  blocked?: boolean;
  dependencies: string[];
  dependents: string[];
}

interface DependencyEdge {
  id: string;
  source: string;
  target: string;
  type: TaskDependencyType;
  critical?: boolean;
}

interface DependencyFilters {
  type?: TaskDependencyType;
  priority?: TaskPriority;
  project?: string;
  showBlocked?: boolean;
  showCritical?: boolean;
  showCircular?: boolean;
}

export const TaskDependencyManager: React.FC<TaskDependencyManagerProps> = ({
  tasks,
  projects,
  teamMembers,
  dependencies = [],
  projectId,
  enableVisualization = true,
  enableCircularDetection = true,
  enableBulkOperations = true,
  enableCriticalPath = true,
  enableAutoSuggestions = true,
  showDependencyTypes = true,
  onDependencyCreate,
  onDependencyUpdate,
  onDependencyDelete,
  onBulkUpdate,
  onCriticalPathAnalysis
}) => {
  // State management
  const [selectedView, setSelectedView] = useState<'graph' | 'list' | 'matrix' | 'timeline'>('graph');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DependencyFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Filter tasks based on current filters and project
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (projectId) {
      filtered = filtered.filter(task => task.projectId === projectId);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.project) {
      filtered = filtered.filter(task => task.projectId === filters.project);
    }

    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [tasks, projectId, filters, searchTerm]);

  // Build dependency graph
  const dependencyGraph = useMemo((): DependencyGraph => {
    const nodes: TaskNode[] = [];
    const edges: DependencyEdge[] = [];
    const taskMap = new Map<string, Task>();

    // Create task map
    filteredTasks.forEach(task => {
      taskMap.set(task.id, task);
    });

    // Build nodes
    filteredTasks.forEach(task => {
      const taskDependencies = dependencies.filter(dep => dep.dependentTaskId === task.id);
      const taskDependents = dependencies.filter(dep => dep.prerequisiteTaskId === task.id);

      nodes.push({
        id: task.id,
        task,
        level: 0, // Will be calculated later
        dependencies: taskDependencies.map(dep => dep.prerequisiteTaskId),
        dependents: taskDependents.map(dep => dep.dependentTaskId)
      });
    });

    // Build edges
    dependencies.forEach(dep => {
      if (taskMap.has(dep.prerequisiteTaskId) && taskMap.has(dep.dependentTaskId)) {
        edges.push({
          id: dep.id,
          source: dep.prerequisiteTaskId,
          target: dep.dependentTaskId,
          type: dep.type
        });
      }
    });

    // Calculate levels for graph layout
    const calculateLevels = () => {
      const visited = new Set<string>();
      const levels = new Map<string, number>();

      const dfs = (nodeId: string, currentLevel: number) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        levels.set(nodeId, Math.max(levels.get(nodeId) || 0, currentLevel));

        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          node.dependents.forEach(dependentId => {
            dfs(dependentId, currentLevel + 1);
          });
        }
      };

      // Start with nodes that have no dependencies
      nodes.filter(node => node.dependencies.length === 0).forEach(node => {
        dfs(node.id, 0);
      });

      // Update node levels
      nodes.forEach(node => {
        node.level = levels.get(node.id) || 0;
      });
    };

    calculateLevels();

    return { nodes, edges };
  }, [filteredTasks, dependencies]);

  // Detect circular dependencies
  const circularDependencies = useMemo(() => {
    if (!enableCircularDetection) return [];

    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (nodeId: string, path: string[]): boolean => {
      if (recursionStack.has(nodeId)) {
        // Found a cycle
        const cycleStart = path.indexOf(nodeId);
        cycles.push(path.slice(cycleStart));
        return true;
      }

      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const node = dependencyGraph.nodes.find(n => n.id === nodeId);
      if (node) {
        for (const dependentId of node.dependents) {
          if (dfs(dependentId, [...path, nodeId])) {
            return true;
          }
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    dependencyGraph.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id, []);
      }
    });

    return cycles;
  }, [dependencyGraph, enableCircularDetection]);

  // Calculate critical path
  const criticalPath = useMemo(() => {
    if (!enableCriticalPath) return [];

    // This is a simplified critical path calculation
    // In a real implementation, you'd use more sophisticated algorithms
    const criticalTasks: string[] = [];
    
    // Find the longest path through the dependency graph
    const calculatePath = (nodeId: string, visited: Set<string>): number => {
      if (visited.has(nodeId)) return 0;
      visited.add(nodeId);

      const node = dependencyGraph.nodes.find(n => n.id === nodeId);
      if (!node) return 0;

      let maxPath = node.task.estimatedHours || 1;
      
      node.dependents.forEach(dependentId => {
        const pathLength = calculatePath(dependentId, new Set(visited));
        maxPath = Math.max(maxPath, (node.task.estimatedHours || 1) + pathLength);
      });

      return maxPath;
    };

    // Find critical path starting from nodes with no dependencies
    const rootNodes = dependencyGraph.nodes.filter(node => node.dependencies.length === 0);
    rootNodes.forEach(node => {
      const pathLength = calculatePath(node.id, new Set());
      // Add to critical path if it's the longest
      criticalTasks.push(node.id);
    });

    return criticalTasks;
  }, [dependencyGraph, enableCriticalPath]);

  // Handle dependency creation
  const handleCreateDependency = useCallback(async (prerequisiteId: string, dependentId: string, type: TaskDependencyType = 'finish_to_start') => {
    if (!onDependencyCreate) return;

    // Check for circular dependency
    if (enableCircularDetection) {
      const wouldCreateCycle = (source: string, target: string): boolean => {
        const visited = new Set<string>();
        const stack = [target];

        while (stack.length > 0) {
          const current = stack.pop()!;
          if (current === source) return true;
          if (visited.has(current)) continue;
          visited.add(current);

          const node = dependencyGraph.nodes.find(n => n.id === current);
          if (node) {
            stack.push(...node.dependents);
          }
        }

        return false;
      };

      if (wouldCreateCycle(prerequisiteId, dependentId)) {
        alert('This dependency would create a circular dependency and cannot be created.');
        return;
      }
    }

    try {
      await onDependencyCreate({
        prerequisiteTaskId: prerequisiteId,
        dependentTaskId: dependentId,
        type,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to create dependency:', error);
    }
  }, [onDependencyCreate, enableCircularDetection, dependencyGraph]);

  // Handle dependency deletion
  const handleDeleteDependency = useCallback(async (dependencyId: string) => {
    if (!onDependencyDelete) return;

    try {
      await onDependencyDelete(dependencyId);
    } catch (error) {
      console.error('Failed to delete dependency:', error);
    }
  }, [onDependencyDelete]);

  // Render task node
  const renderTaskNode = (node: TaskNode, compact: boolean = false) => {
    const isSelected = selectedTask === node.id;
    const isBlocked = node.dependencies.some(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask && (typeof depTask.status === 'string' ? depTask.status !== 'completed' : !depTask.status.isCompleted);
    });
    const isCritical = criticalPath.includes(node.id);

    return (
      <div
        key={node.id}
        className={`
          border rounded-lg p-3 cursor-pointer transition-all
          ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
          ${isBlocked ? 'border-red-300 bg-red-50' : ''}
          ${isCritical ? 'border-yellow-400 bg-yellow-50' : ''}
          hover:shadow-md
          ${compact ? 'p-2' : ''}
        `}
        onClick={() => setSelectedTask(isSelected ? null : node.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              typeof node.task.status === 'string' ? 
                node.task.status === 'completed' ? 'bg-green-500' : 
                node.task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
              : node.task.status.isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`} />
            <span className={`font-medium ${compact ? 'text-sm' : ''}`}>
              {node.task.title}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            {isBlocked && <AlertTriangle className="w-4 h-4 text-red-500" />}
            {isCritical && <Target className="w-4 h-4 text-yellow-500" />}
            {node.dependencies.length > 0 && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {node.dependencies.length} deps
              </span>
            )}
          </div>
        </div>

        {!compact && (
          <div className="mt-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Project: {projects.find(p => p.id === node.task.projectId)?.name || 'Unknown'}</span>
              <span>Priority: {node.task.priority}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render dependency creation modal
  const renderCreateModal = () => {
    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Create Dependency</h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prerequisite Task
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-lg">
                <option value="">Select task...</option>
                {filteredTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dependent Task
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-lg">
                <option value="">Select task...</option>
                {filteredTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            {showDependencyTypes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dependency Type
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-lg">
                  <option value="finish_to_start">Finish to Start</option>
                  <option value="start_to_start">Start to Start</option>
                  <option value="finish_to_finish">Finish to Finish</option>
                  <option value="start_to_finish">Start to Finish</option>
                </select>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle creation logic here
                  setShowCreateModal(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Dependencies</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage task dependencies and analyze project flow
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Dependency
          </button>
        </div>
      </div>

      {/* Alerts */}
      {circularDependencies.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">Circular Dependencies Detected</span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            {circularDependencies.length} circular dependency chain(s) found. This may cause blocking issues.
          </p>
        </div>
      )}

      {/* View Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 text-sm font-medium ${
            selectedView === 'graph'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedView('graph')}
        >
          Graph View
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${
            selectedView === 'list'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedView('list')}
        >
          List View
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${
            selectedView === 'matrix'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedView('matrix')}
        >
          Matrix View
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${
            selectedView === 'timeline'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedView('timeline')}
        >
          Timeline View
        </button>
      </div>

      {/* Graph View */}
      {selectedView === 'graph' && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Dependency Graph</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <span>Critical Path</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <span>Blocked</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Group nodes by level */}
            {Array.from(new Set(dependencyGraph.nodes.map(n => n.level))).sort().map(level => (
              <div key={level} className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Level {level}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dependencyGraph.nodes
                    .filter(node => node.level === level)
                    .map(node => renderTaskNode(node))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {selectedView === 'list' && (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Dependencies List</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prerequisite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dependent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dependencies.map(dep => {
                  const prerequisiteTask = tasks.find(t => t.id === dep.prerequisiteTaskId);
                  const dependentTask = tasks.find(t => t.id === dep.dependentTaskId);
                  
                  if (!prerequisiteTask || !dependentTask) return null;

                  return (
                    <tr key={dep.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {prerequisiteTask.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {dependentTask.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {dep.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {typeof prerequisiteTask.status === 'string' ? 
                            prerequisiteTask.status === 'completed' ? 
                              <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> : 
                              <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                            : prerequisiteTask.status.isCompleted ? 
                              <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> : 
                              <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                          }
                          <span className="text-sm text-gray-600">
                            {typeof prerequisiteTask.status === 'string' ? 
                              prerequisiteTask.status : 
                              prerequisiteTask.status.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDeleteDependency(dep.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Matrix View */}
      {selectedView === 'matrix' && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Dependency Matrix</h3>
          <div className="text-center text-gray-500 py-8">
            <GitBranch className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Dependency matrix visualization would be implemented here</p>
            <p className="text-sm mt-2">Shows task relationships in a matrix format</p>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {selectedView === 'timeline' && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Timeline View</h3>
          <div className="text-center text-gray-500 py-8">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Timeline visualization would be implemented here</p>
            <p className="text-sm mt-2">Shows task dependencies over time</p>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {renderCreateModal()}
    </div>
  );
};