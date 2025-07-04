import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  Mail, 
  MessageSquare, 
  Phone, 
  Smartphone, 
  Slack, 
  Settings, 
  Users, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Filter, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Send, 
  Save, 
  RefreshCw, 
  Download, 
  Upload, 
  Star, 
  StarOff, 
  Bookmark, 
  Archive, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink, 
  Copy, 
  Share, 
  Flag, 
  Zap, 
  Target, 
  Activity, 
  TrendingUp as Trending, 
  BarChart3, 
  PieChart, 
  Monitor, 
  Headphones, 
  Wifi, 
  WifiOff
} from 'lucide-react';
import type { 
  Milestone, 
  MilestoneStatus, 
  TaskPriority,
  Project,
  TeamMember
} from '../../milestones/types';

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: NotificationPriority;
  category: NotificationCategory;
  triggers: NotificationTrigger[];
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  schedule: NotificationSchedule;
  recipients: NotificationRecipient[];
  template: NotificationTemplate;
  metadata: NotificationMetadata;
  createdBy: TeamMember;
  createdDate: string;
  lastModified: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface NotificationTrigger {
  id: string;
  type: TriggerType;
  event: string;
  source: TriggerSource;
  entityId?: string;
  entityType?: string;
  delay?: number;
  repeat?: boolean;
  conditions: Record<string, any>;
}

export interface NotificationCondition {
  id: string;
  type: ConditionType;
  field: string;
  operator: ConditionOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface NotificationAction {
  id: string;
  type: ActionType;
  channel: NotificationChannel;
  template: string;
  priority: NotificationPriority;
  delay?: number;
  retry?: NotificationRetry;
  escalation?: NotificationEscalation;
  metadata: Record<string, any>;
}

export interface NotificationSchedule {
  type: ScheduleType;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
    days: number[];
  };
  blackoutPeriods: BlackoutPeriod[];
  frequency?: ScheduleFrequency;
  customSchedule?: CustomSchedule;
}

export interface BlackoutPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  recurring: boolean;
  description?: string;
}

export interface CustomSchedule {
  cron: string;
  description: string;
  nextRun?: string;
}

export interface NotificationRecipient {
  id: string;
  type: RecipientType;
  entityId: string;
  role?: string;
  preferences: RecipientPreferences;
  overrides: RecipientOverrides;
}

export interface RecipientPreferences {
  channels: NotificationChannel[];
  frequency: NotificationFrequency;
  quietHours: {
    start: string;
    end: string;
    timezone: string;
  };
  categories: NotificationCategory[];
  minimumPriority: NotificationPriority;
}

export interface RecipientOverrides {
  enabled: boolean;
  channels?: NotificationChannel[];
  frequency?: NotificationFrequency;
  priority?: NotificationPriority;
  template?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: TemplateType;
  subject: string;
  body: string;
  format: TemplateFormat;
  variables: TemplateVariable[];
  personalization: TemplatePersonalization;
  attachments: TemplateAttachment[];
}

export interface TemplateVariable {
  name: string;
  type: VariableType;
  description: string;
  required: boolean;
  defaultValue?: any;
  source?: string;
}

export interface TemplatePersonalization {
  greeting: boolean;
  signature: boolean;
  locale: boolean;
  timezone: boolean;
  customFields: Record<string, any>;
}

export interface TemplateAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  description?: string;
}

export interface NotificationRetry {
  enabled: boolean;
  maxAttempts: number;
  interval: number;
  backoff: 'linear' | 'exponential';
  conditions: string[];
}

export interface NotificationEscalation {
  enabled: boolean;
  delay: number;
  recipients: NotificationRecipient[];
  template?: string;
  conditions: string[];
}

export interface NotificationMetadata {
  tags: string[];
  category: string;
  businessImpact: BusinessImpact;
  compliance: ComplianceInfo;
  analytics: AnalyticsConfig;
  integration: IntegrationConfig;
}

export interface BusinessImpact {
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  stakeholders: string[];
  sla: {
    responseTime: number;
    resolutionTime: number;
  };
}

export interface ComplianceInfo {
  required: boolean;
  regulations: string[];
  retentionPeriod: number;
  auditRequired: boolean;
  sensitivityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface AnalyticsConfig {
  trackDelivery: boolean;
  trackEngagement: boolean;
  trackConversion: boolean;
  customMetrics: string[];
}

export interface IntegrationConfig {
  webhooks: WebhookConfig[];
  apiCallbacks: ApiCallback[];
  thirdPartyServices: ThirdPartyService[];
}

export interface WebhookConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  payload: string;
  authentication: AuthConfig;
}

export interface ApiCallback {
  endpoint: string;
  method: string;
  timeout: number;
  retries: number;
}

export interface ThirdPartyService {
  name: string;
  type: string;
  config: Record<string, any>;
  enabled: boolean;
}

export interface AuthConfig {
  type: 'bearer' | 'basic' | 'apikey' | 'oauth';
  credentials: Record<string, string>;
}

export interface NotificationHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  triggeredBy: string;
  triggeredDate: string;
  status: NotificationHistoryStatus;
  deliveryStatus: DeliveryStatus[];
  recipients: string[];
  channels: NotificationChannel[];
  metadata: Record<string, any>;
  errorMessage?: string;
  retryCount: number;
  deliveredAt?: string;
  readAt?: string;
  clickedAt?: string;
  convertedAt?: string;
}

export interface DeliveryStatus {
  channel: NotificationChannel;
  recipient: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  timestamp: string;
  errorMessage?: string;
  metadata: Record<string, any>;
}

export interface NotificationAnalytics {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  bounceRate: number;
  byChannel: Record<NotificationChannel, ChannelAnalytics>;
  byRecipient: Record<string, RecipientAnalytics>;
  byRule: Record<string, RuleAnalytics>;
  trends: AnalyticsTrend[];
}

export interface ChannelAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  bounced: number;
  averageDeliveryTime: number;
  averageResponseTime: number;
}

export interface RecipientAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  preferences: RecipientPreferences;
  engagementScore: number;
}

export interface RuleAnalytics {
  triggered: number;
  sent: number;
  delivered: number;
  effectiveness: number;
  avgResponseTime: number;
  errors: number;
}

export interface AnalyticsTrend {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
}

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';
export type NotificationCategory = 'milestone' | 'task' | 'deadline' | 'approval' | 'update' | 'alert' | 'reminder' | 'system';
export type TriggerType = 'event' | 'schedule' | 'threshold' | 'manual' | 'webhook' | 'api';
export type TriggerSource = 'milestone' | 'task' | 'project' | 'user' | 'system' | 'external';
export type ConditionType = 'field' | 'date' | 'time' | 'status' | 'count' | 'calculation' | 'custom';
export type ConditionOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'regex';
export type ActionType = 'send' | 'escalate' | 'log' | 'webhook' | 'api' | 'custom';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'slack' | 'teams' | 'webhook' | 'in-app' | 'voice';
export type ScheduleType = 'immediate' | 'delayed' | 'scheduled' | 'recurring' | 'custom';
export type ScheduleFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type RecipientType = 'user' | 'role' | 'group' | 'external' | 'webhook';
export type NotificationFrequency = 'immediate' | 'batched' | 'digest' | 'summary';
export type TemplateType = 'text' | 'html' | 'markdown' | 'json' | 'custom';
export type TemplateFormat = 'plain' | 'rich' | 'interactive' | 'multimedia';
export type VariableType = 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
export type NotificationHistoryStatus = 'pending' | 'processing' | 'sent' | 'delivered' | 'failed' | 'cancelled';
export type ViewMode = 'rules' | 'history' | 'analytics' | 'templates' | 'integrations' | 'settings';

export interface MilestoneNotificationsProps {
  project: Project;
  milestones: Milestone[];
  teamMembers: TeamMember[];
  rules: NotificationRule[];
  history: NotificationHistory[];
  analytics: NotificationAnalytics;
  onRuleCreate: (rule: Partial<NotificationRule>) => Promise<void>;
  onRuleUpdate: (ruleId: string, updates: Partial<NotificationRule>) => Promise<void>;
  onRuleDelete: (ruleId: string) => Promise<void>;
  onRuleTest: (ruleId: string, recipients: string[]) => Promise<void>;
  onTemplateCreate: (template: Partial<NotificationTemplate>) => Promise<void>;
  onTemplateUpdate: (templateId: string, updates: Partial<NotificationTemplate>) => Promise<void>;
  onExport: (format: 'json' | 'csv') => Promise<void>;
  onImport: (data: string) => Promise<void>;
  onHistoryCleanup: (olderThan: string) => Promise<void>;
  enableRealTimePreview?: boolean;
  enableAdvancedAnalytics?: boolean;
  enableWebhooks?: boolean;
  className?: string;
}

export const MilestoneNotifications: React.FC<MilestoneNotificationsProps> = ({
  project,
  milestones,
  teamMembers,
  rules,
  history,
  analytics,
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete,
  onRuleTest,
  onTemplateCreate,
  onTemplateUpdate,
  onExport,
  onImport,
  onHistoryCleanup,
  enableRealTimePreview = true,
  enableAdvancedAnalytics = true,
  enableWebhooks = true,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('rules');
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: [] as NotificationCategory[],
    priority: [] as NotificationPriority[],
    channel: [] as NotificationChannel[],
    status: [] as string[]
  });
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);

  // Sample notification templates
  const sampleTemplates: NotificationTemplate[] = [
    {
      id: 'milestone-created',
      name: 'Milestone Created',
      type: 'html',
      subject: 'New Milestone: {{milestone.name}}',
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Milestone Created</h2>
        <p>Hello {{recipient.name}},</p>
        <p>A new milestone <strong>{{milestone.name}}</strong> has been created for project {{project.name}}.</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0;">Milestone Details</h3>
          <p><strong>Due Date:</strong> {{milestone.dueDate}}</p>
          <p><strong>Priority:</strong> {{milestone.priority}}</p>
          <p><strong>Description:</strong> {{milestone.description}}</p>
        </div>
        <a href="{{milestone.url}}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">View Milestone</a>
      </div>`,
      format: 'rich',
      variables: [
        { name: 'milestone.name', type: 'string', description: 'Milestone name', required: true },
        { name: 'milestone.dueDate', type: 'date', description: 'Milestone due date', required: true },
        { name: 'milestone.priority', type: 'string', description: 'Milestone priority', required: true },
        { name: 'milestone.description', type: 'string', description: 'Milestone description', required: false },
        { name: 'milestone.url', type: 'string', description: 'Milestone URL', required: true },
        { name: 'project.name', type: 'string', description: 'Project name', required: true },
        { name: 'recipient.name', type: 'string', description: 'Recipient name', required: true }
      ],
      personalization: {
        greeting: true,
        signature: true,
        locale: true,
        timezone: true,
        customFields: {}
      },
      attachments: []
    },
    {
      id: 'milestone-deadline',
      name: 'Milestone Deadline Approaching',
      type: 'html',
      subject: 'Reminder: {{milestone.name}} due in {{daysLeft}} days',
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Milestone Deadline Approaching</h2>
        <p>Hello {{recipient.name}},</p>
        <p>The milestone <strong>{{milestone.name}}</strong> is due in <strong>{{daysLeft}} days</strong>.</p>
        <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin: 0 0 8px 0; color: #dc2626;">Urgent Action Required</h3>
          <p><strong>Due Date:</strong> {{milestone.dueDate}}</p>
          <p><strong>Progress:</strong> {{milestone.progress}}% complete</p>
          <p><strong>Tasks Remaining:</strong> {{milestone.remainingTasks}}</p>
        </div>
        <a href="{{milestone.url}}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px;">View Milestone</a>
      </div>`,
      format: 'rich',
      variables: [
        { name: 'milestone.name', type: 'string', description: 'Milestone name', required: true },
        { name: 'milestone.dueDate', type: 'date', description: 'Milestone due date', required: true },
        { name: 'milestone.progress', type: 'number', description: 'Milestone progress percentage', required: true },
        { name: 'milestone.remainingTasks', type: 'number', description: 'Number of remaining tasks', required: true },
        { name: 'milestone.url', type: 'string', description: 'Milestone URL', required: true },
        { name: 'daysLeft', type: 'number', description: 'Days until deadline', required: true },
        { name: 'recipient.name', type: 'string', description: 'Recipient name', required: true }
      ],
      personalization: {
        greeting: true,
        signature: true,
        locale: true,
        timezone: true,
        customFields: {}
      },
      attachments: []
    },
    {
      id: 'milestone-completed',
      name: 'Milestone Completed',
      type: 'html',
      subject: 'Congratulations! {{milestone.name}} completed',
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Milestone Completed! 🎉</h2>
        <p>Hello {{recipient.name}},</p>
        <p>Congratulations! The milestone <strong>{{milestone.name}}</strong> has been completed successfully.</p>
        <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #059669;">
          <h3 style="margin: 0 0 8px 0; color: #059669;">Achievement Summary</h3>
          <p><strong>Completed Date:</strong> {{milestone.completedDate}}</p>
          <p><strong>Tasks Completed:</strong> {{milestone.completedTasks}}</p>
          <p><strong>Team Members:</strong> {{milestone.teamMembers}}</p>
          {{#if milestone.onTime}}
          <p style="color: #059669;"><strong>✅ Completed on time!</strong></p>
          {{/if}}
        </div>
        <a href="{{milestone.url}}" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 6px;">View Milestone</a>
      </div>`,
      format: 'rich',
      variables: [
        { name: 'milestone.name', type: 'string', description: 'Milestone name', required: true },
        { name: 'milestone.completedDate', type: 'date', description: 'Completion date', required: true },
        { name: 'milestone.completedTasks', type: 'number', description: 'Number of completed tasks', required: true },
        { name: 'milestone.teamMembers', type: 'string', description: 'Team members involved', required: true },
        { name: 'milestone.onTime', type: 'boolean', description: 'Whether completed on time', required: false },
        { name: 'milestone.url', type: 'string', description: 'Milestone URL', required: true },
        { name: 'recipient.name', type: 'string', description: 'Recipient name', required: true }
      ],
      personalization: {
        greeting: true,
        signature: true,
        locale: true,
        timezone: true,
        customFields: {}
      },
      attachments: []
    },
    {
      id: 'milestone-status-update',
      name: 'Milestone Status Update',
      type: 'html',
      subject: 'Status Update: {{milestone.name}}',
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Milestone Status Update</h2>
        <p>Hello {{recipient.name}},</p>
        <p>Here's an update on the milestone <strong>{{milestone.name}}</strong>:</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0;">Current Status</h3>
          <p><strong>Progress:</strong> {{milestone.progress}}% complete</p>
          <p><strong>Status:</strong> {{milestone.status}}</p>
          <p><strong>Due Date:</strong> {{milestone.dueDate}}</p>
          <p><strong>Recent Activity:</strong> {{milestone.recentActivity}}</p>
        </div>
        <a href="{{milestone.url}}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">View Details</a>
      </div>`,
      format: 'rich',
      variables: [
        { name: 'milestone.name', type: 'string', description: 'Milestone name', required: true },
        { name: 'milestone.progress', type: 'number', description: 'Progress percentage', required: true },
        { name: 'milestone.status', type: 'string', description: 'Current status', required: true },
        { name: 'milestone.dueDate', type: 'date', description: 'Due date', required: true },
        { name: 'milestone.recentActivity', type: 'string', description: 'Recent activity summary', required: true },
        { name: 'milestone.url', type: 'string', description: 'Milestone URL', required: true },
        { name: 'recipient.name', type: 'string', description: 'Recipient name', required: true }
      ],
      personalization: {
        greeting: true,
        signature: true,
        locale: true,
        timezone: true,
        customFields: {}
      },
      attachments: []
    },
    {
      id: 'milestone-approval-request',
      name: 'Milestone Approval Request',
      type: 'html',
      subject: 'Approval Required: {{milestone.name}}',
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Approval Required</h2>
        <p>Hello {{recipient.name}},</p>
        <p>The milestone <strong>{{milestone.name}}</strong> is ready for your approval.</p>
        <div style="background-color: #faf5ff; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #7c3aed;">
          <h3 style="margin: 0 0 8px 0; color: #7c3aed;">Approval Details</h3>
          <p><strong>Requested by:</strong> {{approval.requestedBy}}</p>
          <p><strong>Submitted:</strong> {{approval.submittedDate}}</p>
          <p><strong>Stage:</strong> {{approval.stage}}</p>
          <p><strong>Comments:</strong> {{approval.comments}}</p>
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <a href="{{approval.approveUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 0 8px;">Approve</a>
          <a href="{{approval.rejectUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 0 8px;">Reject</a>
        </div>
      </div>`,
      format: 'rich',
      variables: [
        { name: 'milestone.name', type: 'string', description: 'Milestone name', required: true },
        { name: 'approval.requestedBy', type: 'string', description: 'Who requested approval', required: true },
        { name: 'approval.submittedDate', type: 'date', description: 'Submission date', required: true },
        { name: 'approval.stage', type: 'string', description: 'Approval stage', required: true },
        { name: 'approval.comments', type: 'string', description: 'Approval comments', required: false },
        { name: 'approval.approveUrl', type: 'string', description: 'Approval URL', required: true },
        { name: 'approval.rejectUrl', type: 'string', description: 'Rejection URL', required: true },
        { name: 'recipient.name', type: 'string', description: 'Recipient name', required: true }
      ],
      personalization: {
        greeting: true,
        signature: true,
        locale: true,
        timezone: true,
        customFields: {}
      },
      attachments: []
    }
  ];

  // Initialize templates
  useEffect(() => {
    setTemplates(sampleTemplates);
  }, []);

  // External integrations data and handlers
  const [integrations, setIntegrations] = useState<ThirdPartyService[]>([
    {
      name: 'Slack',
      type: 'messaging',
      config: {
        webhookUrl: '',
        channel: '#general',
        botToken: '',
        teamId: ''
      },
      enabled: false
    },
    {
      name: 'Microsoft Teams',
      type: 'messaging',
      config: {
        webhookUrl: '',
        teamId: '',
        channelId: ''
      },
      enabled: false
    },
    {
      name: 'Discord',
      type: 'messaging',
      config: {
        webhookUrl: '',
        guildId: '',
        channelId: ''
      },
      enabled: false
    },
    {
      name: 'Zapier',
      type: 'automation',
      config: {
        webhookUrl: '',
        zapId: '',
        apiKey: ''
      },
      enabled: false
    },
    {
      name: 'JIRA',
      type: 'project_management',
      config: {
        serverUrl: '',
        username: '',
        apiToken: '',
        projectKey: ''
      },
      enabled: false
    },
    {
      name: 'Trello',
      type: 'project_management',
      config: {
        apiKey: '',
        token: '',
        boardId: ''
      },
      enabled: false
    },
    {
      name: 'SMTP Email',
      type: 'email',
      config: {
        host: '',
        port: 587,
        username: '',
        password: '',
        fromEmail: '',
        security: 'tls'
      },
      enabled: false
    },
    {
      name: 'Twilio SMS',
      type: 'sms',
      config: {
        accountSid: '',
        authToken: '',
        fromNumber: ''
      },
      enabled: false
    },
    {
      name: 'PagerDuty',
      type: 'alerting',
      config: {
        integrationKey: '',
        serviceId: '',
        apiToken: ''
      },
      enabled: false
    },
    {
      name: 'Custom Webhook',
      type: 'webhook',
      config: {
        url: '',
        method: 'POST',
        headers: {},
        authentication: 'none'
      },
      enabled: false
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<ThirdPartyService | null>(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);

  const handleIntegrationToggle = async (integrationName: string, enabled: boolean) => {
    setLoading(true);
    try {
      setIntegrations(prev => prev.map(integration => 
        integration.name === integrationName 
          ? { ...integration, enabled }
          : integration
      ));
      // Here you would typically make an API call to save the integration status
    } catch (error) {
      console.error('Failed to toggle integration:', error);
      setError('Failed to toggle integration');
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrationTest = async (integration: ThirdPartyService) => {
    setLoading(true);
    try {
      // Here you would test the integration with the provided configuration
      alert(`Testing ${integration.name} integration... (This would make a real API call in production)`);
    } catch (error) {
      console.error('Failed to test integration:', error);
      setError('Failed to test integration');
    } finally {
      setLoading(false);
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'messaging': return MessageSquare;
      case 'email': return Mail;
      case 'sms': return Smartphone;
      case 'webhook': return Zap;
      case 'automation': return RefreshCw;
      case 'project_management': return Target;
      case 'alerting': return AlertTriangle;
      default: return ExternalLink;
    }
  };

  const filteredRules = useMemo(() => {
    let filtered = rules;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rule =>
        rule.name.toLowerCase().includes(query) ||
        rule.description.toLowerCase().includes(query) ||
        rule.metadata.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filters.category.length > 0) {
      filtered = filtered.filter(rule => filters.category.includes(rule.category));
    }

    if (filters.priority.length > 0) {
      filtered = filtered.filter(rule => filters.priority.includes(rule.priority));
    }

    return filtered;
  }, [rules, searchQuery, filters]);

  const notificationMetrics = useMemo(() => {
    const activeRules = rules.filter(rule => rule.enabled).length;
    const totalSent = analytics.totalSent;
    const deliveryRate = analytics.deliveryRate;
    const recentHistory = history.filter(h => 
      new Date(h.triggeredDate) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    return {
      activeRules,
      totalSent,
      deliveryRate,
      recentNotifications: recentHistory.length,
      failedNotifications: recentHistory.filter(h => h.status === 'failed').length
    };
  }, [rules, analytics, history]);

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'milestone': return Target;
      case 'task': return CheckCircle;
      case 'deadline': return Clock;
      case 'approval': return Users;
      case 'update': return Info;
      case 'alert': return AlertTriangle;
      case 'reminder': return Bell;
      case 'system': return Settings;
      default: return Bell;
    }
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'email': return Mail;
      case 'sms': return Smartphone;
      case 'push': return Bell;
      case 'slack': return MessageSquare;
      case 'teams': return Users;
      case 'webhook': return Zap;
      case 'in-app': return Monitor;
      case 'voice': return Phone;
      default: return Bell;
    }
  };

  const handleRuleToggle = async (ruleId: string, enabled: boolean) => {
    setLoading(true);
    try {
      await onRuleUpdate(ruleId, { enabled });
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      setError('Failed to toggle notification rule');
    } finally {
      setLoading(false);
    }
  };

  const handleRuleTest = async (ruleId: string) => {
    setLoading(true);
    try {
      await onRuleTest(ruleId, teamMembers.slice(0, 1).map(m => m.id));
    } catch (error) {
      console.error('Failed to test rule:', error);
      setError('Failed to test notification rule');
    } finally {
      setLoading(false);
    }
  };

  const renderRulesView = () => (
    <div className="space-y-4">
      {filteredRules.map(rule => {
        const CategoryIcon = getCategoryIcon(rule.category);
        const isExpanded = expandedRules.has(rule.id);
        
        return (
          <div key={rule.id} className="bg-white border rounded-lg">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <button
                    onClick={() => {
                      const newExpanded = new Set(expandedRules);
                      if (isExpanded) {
                        newExpanded.delete(rule.id);
                      } else {
                        newExpanded.add(rule.id);
                      }
                      setExpandedRules(newExpanded);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <CategoryIcon className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{rule.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(rule.priority)}`}>
                        {rule.priority}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{rule.category}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {rule.actions.map(action => {
                      const ChannelIcon = getChannelIcon(action.channel);
                      return (
                        <ChannelIcon key={action.id} className="h-4 w-4 text-gray-400" />
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handleRuleTest(rule.id)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  >
                    <Send size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedRule(rule)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  >
                    <Edit3 size={16} />
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => handleRuleToggle(rule.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              {isExpanded && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Triggers</h4>
                      <div className="space-y-2">
                        {rule.triggers.map(trigger => (
                          <div key={trigger.id} className="text-sm p-2 bg-gray-50 rounded">
                            <div className="font-medium capitalize">{trigger.type}: {trigger.event}</div>
                            <div className="text-gray-600">Source: {trigger.source}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recipients</h4>
                      <div className="space-y-2">
                        {rule.recipients.slice(0, 3).map(recipient => (
                          <div key={recipient.id} className="text-sm p-2 bg-gray-50 rounded">
                            <div className="font-medium capitalize">{recipient.type}</div>
                            <div className="text-gray-600">
                              Channels: {recipient.preferences.channels.join(', ')}
                            </div>
                          </div>
                        ))}
                        {rule.recipients.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{rule.recipients.length - 3} more recipients
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Triggered {rule.triggerCount} times</span>
                    <span>Last triggered: {rule.lastTriggered || 'Never'}</span>
                    <span>Created by {rule.createdBy.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderHistoryView = () => (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Notification History</h3>
      </div>
      <div className="divide-y">
        {history.slice(0, 50).map(entry => (
          <div key={entry.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  entry.status === 'delivered' ? 'bg-green-500' :
                  entry.status === 'failed' ? 'bg-red-500' :
                  entry.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
                <div>
                  <h4 className="font-medium text-gray-900">{entry.ruleName}</h4>
                  <p className="text-sm text-gray-600">
                    Sent to {entry.recipients.length} recipients via {entry.channels.join(', ')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-900">{entry.status}</div>
                <div className="text-xs text-gray-500">
                  {new Date(entry.triggeredDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            {entry.errorMessage && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                {entry.errorMessage}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalSent}</p>
            </div>
            <Send className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivery Rate</p>
              <p className="text-2xl font-bold text-green-600">{(analytics.deliveryRate * 100).toFixed(1)}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Rate</p>
              <p className="text-2xl font-bold text-blue-600">{(analytics.openRate * 100).toFixed(1)}%</p>
            </div>
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Click Rate</p>
              <p className="text-2xl font-bold text-purple-600">{(analytics.clickRate * 100).toFixed(1)}%</p>
            </div>
            <ExternalLink className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Performance</h3>
          <div className="space-y-4">
            {Object.entries(analytics.byChannel).map(([channel, stats]) => {
              const ChannelIcon = getChannelIcon(channel as NotificationChannel);
              return (
                <div key={channel} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ChannelIcon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium capitalize">{channel}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{stats.sent} sent</div>
                    <div className="text-xs text-gray-500">
                      {((stats.delivered / stats.sent) * 100).toFixed(1)}% delivered
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rule Performance</h3>
          <div className="space-y-4">
            {Object.entries(analytics.byRule).slice(0, 5).map(([ruleId, stats]) => {
              const rule = rules.find(r => r.id === ruleId);
              return (
                <div key={ruleId} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium truncate">{rule?.name || ruleId}</div>
                    <div className="text-xs text-gray-500">
                      {stats.triggered} triggers • {stats.effectiveness.toFixed(1)}% effective
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{stats.sent}</div>
                    <div className="text-xs text-gray-500">sent</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplatesView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Notification Templates</h3>
        <button
          onClick={() => setShowTemplateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>New Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map(template => (
          <div key={template.id} className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{template.type} • {template.format}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowTemplateModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this template?')) {
                        setTemplates(templates.filter(t => t.id !== template.id));
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Subject</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{template.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Variables ({template.variables.length})</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.variables.slice(0, 6).map(variable => (
                      <span
                        key={variable.name}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {variable.name}
                      </span>
                    ))}
                    {template.variables.length > 6 && (
                      <span className="text-xs text-gray-500">+{template.variables.length - 6} more</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Personalization: {template.personalization.greeting ? 'Enabled' : 'Disabled'}</span>
                  <span>Attachments: {template.attachments.length}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && !showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Template Preview: {selectedTemplate.name}</h3>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <div className="bg-gray-50 p-3 rounded border text-sm">{selectedTemplate.subject}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body Preview</label>
                  <div className="bg-gray-50 p-4 rounded border overflow-auto">
                    {selectedTemplate.format === 'rich' ? (
                      <div 
                        className="prose max-w-none text-sm"
                        dangerouslySetInnerHTML={{ __html: selectedTemplate.body }}
                      />
                    ) : (
                      <pre className="text-sm whitespace-pre-wrap">{selectedTemplate.body}</pre>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Variables</label>
                  <div className="space-y-2">
                    {selectedTemplate.variables.map(variable => (
                      <div key={variable.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-gray-200 px-2 py-1 rounded">{variable.name}</code>
                          <span className="text-sm text-gray-600">{variable.description}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 capitalize">{variable.type}</span>
                          {variable.required && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderIntegrationsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">External Integrations</h3>
          <p className="text-sm text-gray-600">Connect with external services to enhance notifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowIntegrationModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Integration</span>
          </button>
        </div>
      </div>

      {/* Integration Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {['messaging', 'email', 'sms', 'project_management', 'automation', 'alerting', 'webhook'].map(category => {
          const categoryIntegrations = integrations.filter(integration => integration.type === category);
          const CategoryIcon = getIntegrationIcon(category);
          
          return (
            <div key={category} className="bg-white rounded-lg border">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-3">
                  <CategoryIcon className="h-5 w-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900 capitalize">{category.replace('_', ' ')}</h4>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {categoryIntegrations.filter(i => i.enabled).length}/{categoryIntegrations.length}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {categoryIntegrations.map(integration => (
                  <div key={integration.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        integration.enabled ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <CategoryIcon className={`h-4 w-4 ${
                          integration.enabled ? 'text-green-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{integration.name}</h5>
                        <p className="text-xs text-gray-500 capitalize">{integration.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {integration.enabled && (
                        <button
                          onClick={() => handleIntegrationTest(integration)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="Test Integration"
                        >
                          <Zap size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedIntegration(integration);
                          setShowIntegrationModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="Configure"
                      >
                        <Settings size={14} />
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={integration.enabled}
                          onChange={(e) => handleIntegrationToggle(integration.name, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Status Summary */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="font-medium text-gray-900 mb-4">Integration Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{integrations.filter(i => i.enabled).length}</div>
            <div className="text-sm text-green-700">Active Integrations</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{integrations.filter(i => !i.enabled).length}</div>
            <div className="text-sm text-yellow-700">Available Integrations</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{new Set(integrations.map(i => i.type)).size}</div>
            <div className="text-sm text-blue-700">Categories</div>
          </div>
        </div>
      </div>

      {/* Integration Configuration Modal */}
      {showIntegrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedIntegration ? `Configure ${selectedIntegration.name}` : 'Add New Integration'}
                </h3>
                <button
                  onClick={() => {
                    setShowIntegrationModal(false);
                    setSelectedIntegration(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedIntegration && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {React.createElement(getIntegrationIcon(selectedIntegration.type), { 
                        className: "h-5 w-5 text-blue-600" 
                      })}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedIntegration.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{selectedIntegration.type} Integration</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Configuration</h5>
                    {Object.entries(selectedIntegration.config).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </label>
                        <input
                          type={key.includes('password') || key.includes('token') || key.includes('key') ? 'password' : 'text'}
                          value={value as string}
                          onChange={(e) => {
                            setSelectedIntegration({
                              ...selectedIntegration,
                              config: {
                                ...selectedIntegration.config,
                                [key]: e.target.value
                              }
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <button
                      onClick={() => handleIntegrationTest(selectedIntegration)}
                      className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Zap size={16} />
                      <span>Test Connection</span>
                    </button>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setShowIntegrationModal(false);
                          setSelectedIntegration(null);
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          // Update the integration in the list
                          setIntegrations(prev => prev.map(integration => 
                            integration.name === selectedIntegration.name 
                              ? selectedIntegration
                              : integration
                          ));
                          setShowIntegrationModal(false);
                          setSelectedIntegration(null);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderViewContent = () => {
    switch (viewMode) {
      case 'rules':
        return renderRulesView();
      case 'history':
        return renderHistoryView();
      case 'analytics':
        return renderAnalyticsView();
      case 'templates':
        return renderTemplatesView();
      case 'integrations':
        return renderIntegrationsView();
      default:
        return renderRulesView();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">Manage milestone and project notifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('rules')}
              className={`p-2 rounded-lg ${
                viewMode === 'rules' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bell size={20} />
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`p-2 rounded-lg ${
                viewMode === 'history' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock size={20} />
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`p-2 rounded-lg ${
                viewMode === 'analytics' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('templates')}
              className={`p-2 rounded-lg ${
                viewMode === 'templates' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Mail size={20} />
            </button>
            <button
              onClick={() => setViewMode('integrations')}
              className={`p-2 rounded-lg ${
                viewMode === 'integrations' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ExternalLink size={20} />
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>New Rule</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900">{notificationMetrics.activeRules}</p>
            </div>
            <Bell className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recent Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notificationMetrics.recentNotifications}</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivery Rate</p>
              <p className="text-2xl font-bold text-green-600">{(notificationMetrics.deliveryRate * 100).toFixed(1)}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed Today</p>
              <p className="text-2xl font-bold text-red-600">{notificationMetrics.failedNotifications}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search notification rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filters.category[0] || ''}
          onChange={(e) => setFilters({ ...filters, category: e.target.value ? [e.target.value as NotificationCategory] : [] })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          <option value="milestone">Milestone</option>
          <option value="task">Task</option>
          <option value="deadline">Deadline</option>
          <option value="approval">Approval</option>
        </select>
        <select
          value={filters.priority[0] || ''}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value ? [e.target.value as NotificationPriority] : [] })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* View Content */}
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

export default MilestoneNotifications;