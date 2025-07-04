import React, { useState, useCallback } from 'react';
import { Shield, CheckCircle2, AlertCircle, XCircle, Settings, Code, Calendar, Users, FileText, Lock, RefreshCw, Play, Pause, Eye, Edit3 } from 'lucide-react';

interface ValidationRule {
  id: string;
  name: string;
  type: 'required' | 'format' | 'range' | 'dependency' | 'custom';
  field: string;
  description: string;
  isActive: boolean;
  severity: 'error' | 'warning' | 'info';
  config: Record<string, any>;
  lastRun?: string;
  violationCount: number;
}

interface ValidationResult {
  ruleId: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  field?: string;
  value?: any;
  suggestion?: string;
}

interface MilestoneValidation {
  id: string;
  milestoneId: string;
  milestoneName: string;
  timestamp: string;
  status: 'valid' | 'invalid' | 'warning';
  results: ValidationResult[];
  score: number;
}

interface BusinessRule {
  id: string;
  name: string;
  description: string;
  type: 'timeline' | 'resource' | 'budget' | 'approval' | 'custom';
  isActive: boolean;
  complexity: 'simple' | 'medium' | 'complex';
  expression: string;
  errorMessage: string;
  warningMessage?: string;
}

export default function MilestoneValidationService() {
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([
    {
      id: '1',
      name: 'Title Required',
      type: 'required',
      field: 'title',
      description: 'Milestone must have a non-empty title',
      isActive: true,
      severity: 'error',
      config: { minLength: 3 },
      lastRun: '2024-02-10T14:30:00',
      violationCount: 2
    },
    {
      id: '2',
      name: 'Due Date Format',
      type: 'format',
      field: 'dueDate',
      description: 'Due date must be in valid ISO format',
      isActive: true,
      severity: 'error',
      config: { format: 'iso8601' },
      lastRun: '2024-02-10T14:30:00',
      violationCount: 0
    },
    {
      id: '3',
      name: 'Progress Range',
      type: 'range',
      field: 'progress',
      description: 'Progress must be between 0 and 100',
      isActive: true,
      severity: 'error',
      config: { min: 0, max: 100 },
      lastRun: '2024-02-10T14:30:00',
      violationCount: 1
    },
    {
      id: '4',
      name: 'Assignee Count',
      type: 'custom',
      field: 'assignees',
      description: 'High priority milestones should have at least 2 assignees',
      isActive: true,
      severity: 'warning',
      config: { 
        condition: 'priority === "high" || priority === "critical"',
        minCount: 2
      },
      lastRun: '2024-02-10T14:30:00',
      violationCount: 3
    },
    {
      id: '5',
      name: 'Dependency Chain',
      type: 'dependency',
      field: 'dependencies',
      description: 'Check for circular dependencies',
      isActive: true,
      severity: 'error',
      config: { maxDepth: 10 },
      lastRun: '2024-02-10T14:30:00',
      violationCount: 0
    }
  ]);

  const [businessRules, setBusinessRules] = useState<BusinessRule[]>([
    {
      id: '1',
      name: 'No Weekend Deadlines',
      description: 'Milestones should not have due dates on weekends',
      type: 'timeline',
      isActive: true,
      complexity: 'simple',
      expression: 'moment(dueDate).isoWeekday() >= 6',
      errorMessage: 'Due date cannot be on weekend',
      warningMessage: 'Consider moving deadline to next Monday'
    },
    {
      id: '2',
      name: 'Budget Threshold',
      description: 'High-cost milestones require additional approvals',
      type: 'budget',
      isActive: true,
      complexity: 'medium',
      expression: 'estimatedCost > 10000 && approvals.length < 2',
      errorMessage: 'High-cost milestones require at least 2 approvals',
      warningMessage: 'Consider getting additional approval'
    },
    {
      id: '3',
      name: 'Resource Allocation',
      description: 'Team members should not be over-allocated',
      type: 'resource',
      isActive: true,
      complexity: 'complex',
      expression: 'assignees.some(a => a.allocation > 80)',
      errorMessage: 'Team member over-allocated',
      warningMessage: 'Consider redistributing workload'
    }
  ]);

  const [recentValidations, setRecentValidations] = useState<MilestoneValidation[]>([
    {
      id: '1',
      milestoneId: 'MS-001',
      milestoneName: 'API Integration Phase 1',
      timestamp: '2024-02-10T14:30:00',
      status: 'valid',
      score: 95,
      results: [
        { ruleId: '1', status: 'passed', message: 'Title is valid' },
        { ruleId: '2', status: 'passed', message: 'Due date format is correct' },
        { ruleId: '3', status: 'passed', message: 'Progress is within valid range' }
      ]
    },
    {
      id: '2',
      milestoneId: 'MS-002',
      milestoneName: 'UI Component Library',
      timestamp: '2024-02-10T13:45:00',
      status: 'warning',
      score: 78,
      results: [
        { ruleId: '1', status: 'passed', message: 'Title is valid' },
        { ruleId: '4', status: 'warning', message: 'High priority milestone has only 1 assignee', suggestion: 'Add another team member' }
      ]
    },
    {
      id: '3',
      milestoneId: 'MS-003',
      milestoneName: 'Database Migration',
      timestamp: '2024-02-10T12:15:00',
      status: 'invalid',
      score: 45,
      results: [
        { ruleId: '1', status: 'failed', message: 'Title is too short', field: 'title', value: 'DB' },
        { ruleId: '3', status: 'failed', message: 'Progress value is invalid', field: 'progress', value: 150 }
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState<'rules' | 'business' | 'results' | 'config'>('rules');
  const [isRunning, setIsRunning] = useState(false);

  const handleToggleRule = useCallback((id: string) => {
    setValidationRules(prev => prev.map(rule =>
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  }, []);

  const handleRunValidation = useCallback(async () => {
    setIsRunning(true);
    
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newValidation: MilestoneValidation = {
      id: Date.now().toString(),
      milestoneId: 'MS-TEST',
      milestoneName: 'Test Milestone',
      timestamp: new Date().toISOString(),
      status: 'valid',
      score: Math.floor(Math.random() * 40) + 60,
      results: validationRules
        .filter(rule => rule.isActive)
        .map(rule => ({
          ruleId: rule.id,
          status: Math.random() > 0.8 ? 'failed' : 'passed',
          message: `${rule.name} validation ${Math.random() > 0.8 ? 'failed' : 'passed'}`
        }))
    };

    setRecentValidations(prev => [newValidation, ...prev.slice(0, 4)]);
    setIsRunning(false);
  }, [validationRules]);

  const getSeverityIcon = (severity: ValidationRule['severity']) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: ValidationRule['severity']) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getValidationStatusColor = (status: MilestoneValidation['status']) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'invalid':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  const getTypeIcon = (type: ValidationRule['type']) => {
    switch (type) {
      case 'required':
        return <Lock className="w-4 h-4" />;
      case 'format':
        return <FileText className="w-4 h-4" />;
      case 'range':
        return <Calendar className="w-4 h-4" />;
      case 'dependency':
        return <Users className="w-4 h-4" />;
      case 'custom':
        return <Code className="w-4 h-4" />;
    }
  };

  const getComplexityColor = (complexity: BusinessRule['complexity']) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'complex':
        return 'bg-red-100 text-red-700 border-red-300';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Validation Service
            </h2>
            <p className="text-gray-600 mt-1">Data validation and business rule enforcement</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRunValidation}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Validation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'rules'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Validation Rules
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'business'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Business Rules
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'results'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Results
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'config'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Configuration
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {validationRules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-white rounded-lg shadow-sm border p-6 ${getSeverityColor(rule.severity)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getTypeIcon(rule.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                      {getSeverityIcon(rule.severity)}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        rule.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Field: <code className="bg-gray-100 px-1 py-0.5 rounded">{rule.field}</code></span>
                      <span>Type: {rule.type}</span>
                      <span>Violations: {rule.violationCount}</span>
                      {rule.lastRun && (
                        <span>Last run: {new Date(rule.lastRun).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title={rule.isActive ? 'Disable' : 'Enable'}
                  >
                    {rule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Rule Configuration */}
              <div className="border-t pt-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Configuration:</span>
                  <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(rule.config, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'business' && (
        <div className="space-y-4">
          {businessRules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getComplexityColor(rule.complexity)}`}>
                      {rule.complexity}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      rule.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                  <div className="text-xs text-gray-500 mb-3">
                    Type: {rule.type}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Rule Expression */}
              <div className="border-t pt-4 space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Expression:</span>
                  <code className="block mt-1 text-xs bg-gray-50 p-2 rounded font-mono">
                    {rule.expression}
                  </code>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Error Message:</span>
                  <div className="mt-1 text-sm text-red-600">{rule.errorMessage}</div>
                </div>
                {rule.warningMessage && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Warning Message:</span>
                    <div className="mt-1 text-sm text-yellow-600">{rule.warningMessage}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-4">
          {recentValidations.map((validation) => (
            <div
              key={validation.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{validation.milestoneName}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-500">ID: {validation.milestoneId}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(validation.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{validation.score}</div>
                      <div className="text-sm text-gray-500">Score</div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getValidationStatusColor(validation.status)}`}>
                      {validation.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {validation.results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{result.message}</div>
                        {result.field && (
                          <div className="text-xs text-gray-500 mt-1">
                            Field: <code className="bg-gray-100 px-1 py-0.5 rounded">{result.field}</code>
                            {result.value && (
                              <> Value: <code className="bg-gray-100 px-1 py-0.5 rounded">{JSON.stringify(result.value)}</code></>
                            )}
                          </div>
                        )}
                        {result.suggestion && (
                          <div className="text-xs text-blue-600 mt-1">
                            💡 {result.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Configuration</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validation Mode
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="strict">Strict - Stop on first error</option>
                <option value="permissive">Permissive - Continue on errors</option>
                <option value="warning">Warning Only - No blocking</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-validation Trigger
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-gray-600">On milestone creation</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-gray-600">On milestone update</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">On status change</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">Daily scheduled check</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Settings
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-gray-600">Email notifications for errors</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">Slack notifications for warnings</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">Dashboard alerts</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}