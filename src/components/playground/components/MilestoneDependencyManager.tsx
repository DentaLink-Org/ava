import React, { useState } from 'react';
import { GitBranch, AlertTriangle, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import { useMilestoneDependencies } from '../../milestones';

interface MilestoneDependencyManagerProps {
  projectId?: string;
}

export const MilestoneDependencyManager: React.FC<MilestoneDependencyManagerProps> = ({ 
  projectId = 'project-1' 
}) => {
  const { 
    dependencies, 
    loading, 
    error,
    validationResult,
    createDependency,
    deleteDependency,
    validateCurrentDependencies,
    checkForCycle
  } = useMilestoneDependencies({ projectId });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDependency, setNewDependency] = useState({
    milestoneId: '',
    dependsOnId: '',
    dependencyType: 'finish_to_start' as const,
    lagDays: 0
  });

  const handleCreateDependency = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDependency.milestoneId || !newDependency.dependsOnId) return;
    
    try {
      // Check for cycle first
      const wouldCreateCycle = await checkForCycle(
        newDependency.milestoneId, 
        newDependency.dependsOnId
      );
      
      if (wouldCreateCycle) {
        alert('This dependency would create a circular reference!');
        return;
      }

      await createDependency(newDependency);
      setNewDependency({
        milestoneId: '',
        dependsOnId: '',
        dependencyType: 'finish_to_start',
        lagDays: 0
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create dependency:', error);
    }
  };

  const handleDeleteDependency = async (dependencyId: string) => {
    if (!confirm('Are you sure you want to delete this dependency?')) return;
    
    try {
      await deleteDependency(dependencyId);
    } catch (error) {
      console.error('Failed to delete dependency:', error);
    }
  };

  const getDependencyTypeLabel = (type: string) => {
    switch (type) {
      case 'finish_to_start': return 'Finish → Start';
      case 'start_to_start': return 'Start → Start';
      case 'finish_to_finish': return 'Finish → Finish';
      case 'start_to_finish': return 'Start → Finish';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600">
          <h3 className="font-semibold mb-2">Error Loading Dependencies</h3>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <GitBranch className="h-6 w-6 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Milestone Dependencies</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => validateCurrentDependencies()}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Validate
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1 inline" />
              Add Dependency
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{dependencies.length}</p>
            <p className="text-sm text-blue-600">Total Dependencies</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {validationResult?.errors.length === 0 ? dependencies.length : 0}
            </p>
            <p className="text-sm text-green-600">Valid</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {validationResult?.errors.length || 0}
            </p>
            <p className="text-sm text-red-600">Errors</p>
          </div>
        </div>
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Results</h3>
          
          {validationResult.isValid ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>All dependencies are valid</span>
            </div>
          ) : (
            <div className="space-y-3">
              {validationResult.errors.map((error, index) => (
                <div key={index} className="flex items-start text-red-600">
                  <XCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{error.code}</p>
                    <p className="text-sm">{error.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {validationResult.warnings.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-yellow-600">Warnings:</h4>
              {validationResult.warnings.map((warning, index) => (
                <div key={index} className="flex items-start text-yellow-600">
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{warning.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Dependency Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Dependency</h3>
          
          <form onSubmit={handleCreateDependency} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Milestone (depends on)
                </label>
                <input
                  type="text"
                  value={newDependency.milestoneId}
                  onChange={(e) => setNewDependency({ ...newDependency, milestoneId: e.target.value })}
                  placeholder="milestone-2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Depends On Milestone
                </label>
                <input
                  type="text"
                  value={newDependency.dependsOnId}
                  onChange={(e) => setNewDependency({ ...newDependency, dependsOnId: e.target.value })}
                  placeholder="milestone-1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dependency Type
                </label>
                <select
                  value={newDependency.dependencyType}
                  onChange={(e) => setNewDependency({ 
                    ...newDependency, 
                    dependencyType: e.target.value as any 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="finish_to_start">Finish → Start</option>
                  <option value="start_to_start">Start → Start</option>
                  <option value="finish_to_finish">Finish → Finish</option>
                  <option value="start_to_finish">Start → Finish</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lag Days
                </label>
                <input
                  type="number"
                  value={newDependency.lagDays}
                  onChange={(e) => setNewDependency({ 
                    ...newDependency, 
                    lagDays: parseInt(e.target.value) || 0 
                  })}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Dependency
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dependencies List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Current Dependencies</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {dependencies.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <GitBranch className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No dependencies</h3>
              <p className="text-sm">Create dependencies to manage milestone relationships.</p>
            </div>
          ) : (
            dependencies.map((dependency) => (
              <div key={dependency.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {dependency.milestoneId}
                        </span>
                        <span className="text-gray-500">depends on</span>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          {dependency.dependsOnId}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <GitBranch className="h-4 w-4 mr-1" />
                        {getDependencyTypeLabel(dependency.dependencyType)}
                      </span>
                      
                      {dependency.lagDays > 0 && (
                        <span>{dependency.lagDays} day lag</span>
                      )}
                      
                      <span>
                        Created {new Date(dependency.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteDependency(dependency.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete dependency"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};