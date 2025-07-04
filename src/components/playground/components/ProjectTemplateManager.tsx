import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  Save, 
  Copy, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Users, 
  Calendar, 
  CheckCircle,
  AlertCircle,
  Building
} from 'lucide-react';
import type { 
  Project, 
  Milestone, 
  Task, 
  TaskPriority,
  MilestoneStatus,
  TeamMember,
  CreateMilestoneData,
  ProjectWithMilestones
} from '../../milestones/types';

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  icon: string;
  color: string;
  isPublic: boolean;
  isStarred: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  tags: string[];
  milestones: TemplateMilestone[];
  tasks: TemplateTask[];
  settings: TemplateSettings;
  metadata: TemplateMetadata;
}

export interface TemplateMilestone {
  id: string;
  title: string;
  description?: string;
  daysFromStart: number;
  priority: TaskPriority;
  color: string;
  dependencies: string[];
  tags: string[];
  deliverables: string[];
  estimatedHours?: number;
  position: number;
}

export interface TemplateTask {
  id: string;
  title: string;
  description?: string;
  milestoneId: string;
  priority: TaskPriority;
  estimatedHours?: number;
  dependencies: string[];
  tags: string[];
  position: number;
  assigneeRole?: string;
}

export interface TemplateSettings {
  allowCustomization: boolean;
  requiresApproval: boolean;
  defaultProjectSettings: Record<string, any>;
  notificationSettings: NotificationSettings;
}

export interface TemplateMetadata {
  industry?: string;
  projectType?: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedDuration: number;
  teamSizeRecommendation: string;
  skillsRequired: string[];
  successMetrics: string[];
}

export interface NotificationSettings {
  onTemplateUsed: boolean;
  onTemplateShared: boolean;
  onTemplateUpdated: boolean;
}

export type TemplateCategory = 'software' | 'marketing' | 'design' | 'operations' | 'research' | 'custom';
export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'created' | 'updated' | 'usage' | 'rating';

export interface ProjectTemplateManagerProps {
  templates: ProjectTemplate[];
  projects: ProjectWithMilestones[];
  teamMembers: TeamMember[];
  onTemplateCreate: (template: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onTemplateUpdate: (templateId: string, updates: Partial<ProjectTemplate>) => Promise<void>;
  onTemplateDelete: (templateId: string) => Promise<void>;
  onTemplateApply: (templateId: string, projectId: string, customizations?: TemplateCustomizations) => Promise<void>;
  onTemplateExport: (templateId: string) => Promise<void>;
  onTemplateImport: (templateData: string) => Promise<void>;
  onTemplateShare: (templateId: string, shareSettings: ShareSettings) => Promise<void>;
  enableMarketplace?: boolean;
  enableSharing?: boolean;
  enableCustomization?: boolean;
  className?: string;
}

export interface TemplateCustomizations {
  projectStartDate?: string;
  selectedMilestones?: string[];
  roleAssignments?: Record<string, string>;
  customSettings?: Record<string, any>;
}

export interface ShareSettings {
  isPublic: boolean;
  allowedUsers: string[];
  allowedOrganizations: string[];
  expiresAt?: string;
}

export interface TemplateFilter {
  category?: TemplateCategory;
  tags?: string[];
  createdBy?: string;
  complexity?: string;
  isStarred?: boolean;
  isPublic?: boolean;
  search?: string;
}

export const ProjectTemplateManager: React.FC<ProjectTemplateManagerProps> = ({
  templates,
  projects,
  teamMembers,
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete,
  onTemplateApply,
  onTemplateExport,
  onTemplateImport,
  onTemplateShare,
  enableMarketplace = true,
  enableSharing = true,
  enableCustomization = true,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [filter, setFilter] = useState<TemplateFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredTemplates = templates.filter(template => {
    if (filter.category && template.category !== filter.category) return false;
    if (filter.isStarred && !template.isStarred) return false;
    if (filter.isPublic !== undefined && template.isPublic !== filter.isPublic) return false;
    if (filter.complexity && template.metadata.complexity !== filter.complexity) return false;
    if (filter.createdBy && template.createdBy !== filter.createdBy) return false;
    if (filter.tags && !filter.tags.some(tag => template.tags.includes(tag))) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        template.name.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'updated':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'usage':
        return b.usageCount - a.usageCount;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleTemplateSelect = useCallback((template: ProjectTemplate) => {
    setSelectedTemplate(template);
  }, []);

  const handleStarToggle = useCallback(async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      await onTemplateUpdate(templateId, { isStarred: !template.isStarred });
    }
  }, [templates, onTemplateUpdate]);

  const handleCreateFromProject = useCallback(async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const templateData: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      name: `${project.name} Template`,
      description: `Template created from ${project.name}`,
      category: 'custom',
      icon: project.icon || 'Building',
      color: project.color,
      isPublic: false,
      isStarred: false,
      usageCount: 0,
      createdBy: 'current-user',
      version: '1.0.0',
      tags: [],
      milestones: project.milestones.map((milestone: Milestone, index: number) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        daysFromStart: Math.floor(Math.random() * 30) + (index * 15),
        priority: milestone.priority,
        color: milestone.color,
        dependencies: milestone.dependencies.map((dep: any) => dep.dependsOnId),
        tags: milestone.metadata.tags || [],
        deliverables: milestone.metadata.deliverables || [],
        estimatedHours: milestone.metadata.estimatedHours,
        position: index
      })),
      tasks: project.milestones.flatMap((milestone: Milestone) => 
        milestone.tasks.map((task: Task, taskIndex: number) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          milestoneId: milestone.id,
          priority: task.priority,
          estimatedHours: task.estimatedHours,
          dependencies: [],
          tags: task.tags || [],
          position: taskIndex,
          assigneeRole: 'team-member'
        }))
      ),
      settings: {
        allowCustomization: true,
        requiresApproval: false,
        defaultProjectSettings: project.settings,
        notificationSettings: {
          onTemplateUsed: true,
          onTemplateShared: true,
          onTemplateUpdated: true
        }
      },
      metadata: {
        projectType: 'custom',
        complexity: 'medium',
        estimatedDuration: 60,
        teamSizeRecommendation: '3-5 members',
        skillsRequired: [],
        successMetrics: []
      }
    };

    await onTemplateCreate(templateData);
  }, [projects, onTemplateCreate]);

  const renderTemplateCard = (template: ProjectTemplate) => (
    <div 
      key={template.id}
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
      onClick={() => handleTemplateSelect(template)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-semibold"
              style={{ backgroundColor: template.color }}
            >
              {template.icon === 'Building' ? <Building size={20} /> : template.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{template.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStarToggle(template.id);
              }}
              className={`p-1 rounded-full hover:bg-gray-100 ${
                template.isStarred ? 'text-yellow-500' : 'text-gray-400'
              }`}
            >
              <Star size={16} fill={template.isStarred ? 'currentColor' : 'none'} />
            </button>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Users size={14} />
              <span>{template.usageCount}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {template.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{template.metadata.estimatedDuration} days</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle size={14} />
              <span>{template.milestones.length} milestones</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertCircle size={14} />
              <span className="capitalize">{template.metadata.complexity}</span>
            </div>
          </div>
          <div className="flex space-x-1">
            {template.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 2 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                +{template.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplateList = (template: ProjectTemplate) => (
    <div 
      key={template.id}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
      onClick={() => handleTemplateSelect(template)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: template.color }}
          >
            {template.icon === 'Building' ? <Building size={16} /> : template.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-500">{template.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <span className="text-sm text-gray-500 capitalize">{template.category}</span>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Users size={14} />
            <span>{template.usageCount}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Calendar size={14} />
            <span>{template.metadata.estimatedDuration} days</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStarToggle(template.id);
            }}
            className={`p-1 rounded-full hover:bg-gray-100 ${
              template.isStarred ? 'text-yellow-500' : 'text-gray-400'
            }`}
          >
            <Star size={16} fill={template.isStarred ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Templates</h2>
          <p className="text-gray-600">Create and manage reusable project templates</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Create Template</span>
          </button>
          <button
            onClick={() => document.getElementById('template-import')?.click()}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload size={20} />
            <span>Import</span>
          </button>
          <input
            id="template-import"
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const templateData = event.target?.result as string;
                  onTemplateImport(templateData);
                };
                reader.readAsText(file);
              }
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="created">Sort by Created</option>
            <option value="updated">Sort by Updated</option>
            <option value="usage">Sort by Usage</option>
          </select>
          <select
            value={filter.category || ''}
            onChange={(e) => setFilter({ ...filter, category: e.target.value as TemplateCategory || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="software">Software</option>
            <option value="marketing">Marketing</option>
            <option value="design">Design</option>
            <option value="operations">Operations</option>
            <option value="research">Research</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Grid size={20} />
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
      </div>

      {/* Templates */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
        {sortedTemplates.map(template => 
          viewMode === 'grid' ? renderTemplateCard(template) : renderTemplateList(template)
        )}
      </div>

      {/* Empty State */}
      {sortedTemplates.length === 0 && (
        <div className="text-center py-12">
          <Building size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filter.category ? 
              'Try adjusting your search or filter criteria' : 
              'Create your first project template to get started'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Template
          </button>
        </div>
      )}

      {/* Quick Actions for Existing Projects */}
      {projects.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Templates from Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map(project => (
              <div
                key={project.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.icon ? <Building size={16} /> : project.name[0]}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-500">{project.milestones.length} milestones</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCreateFromProject(project.id)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Copy size={14} />
                    <span>Create</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTemplateManager;