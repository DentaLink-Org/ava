import React, { useState, useCallback, useEffect } from 'react';
import { Zap, Bell, Globe, Filter, Clock, CheckCircle2, AlertCircle, Info, Settings, RefreshCw, Trash2, PauseCircle, PlayCircle, ExternalLink } from 'lucide-react';

interface EventType {
  id: string;
  name: string;
  category: 'milestone' | 'task' | 'team' | 'system';
  icon: React.ElementType;
  color: string;
}

interface EventSubscription {
  id: string;
  eventType: string;
  name: string;
  endpoint: string;
  isActive: boolean;
  filters?: Record<string, any>;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
}

interface EventHistoryItem {
  id: string;
  eventType: string;
  timestamp: string;
  status: 'success' | 'failure' | 'pending';
  payload: Record<string, any>;
  subscriptions: string[];
  duration?: number;
  error?: string;
}

interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'email' | 'slack' | 'teams' | 'custom';
  icon: React.ElementType;
  isConnected: boolean;
}

export default function MilestoneEventManager() {
  const [eventTypes] = useState<EventType[]>([
    { id: 'milestone.created', name: 'Milestone Created', category: 'milestone', icon: CheckCircle2, color: 'text-green-500' },
    { id: 'milestone.updated', name: 'Milestone Updated', category: 'milestone', icon: RefreshCw, color: 'text-blue-500' },
    { id: 'milestone.completed', name: 'Milestone Completed', category: 'milestone', icon: CheckCircle2, color: 'text-green-600' },
    { id: 'milestone.delayed', name: 'Milestone Delayed', category: 'milestone', icon: AlertCircle, color: 'text-orange-500' },
    { id: 'milestone.blocked', name: 'Milestone Blocked', category: 'milestone', icon: AlertCircle, color: 'text-red-500' },
    { id: 'task.assigned', name: 'Task Assigned', category: 'task', icon: Info, color: 'text-blue-500' },
    { id: 'task.completed', name: 'Task Completed', category: 'task', icon: CheckCircle2, color: 'text-green-500' },
    { id: 'team.member_added', name: 'Team Member Added', category: 'team', icon: Info, color: 'text-purple-500' },
    { id: 'team.member_removed', name: 'Team Member Removed', category: 'team', icon: Info, color: 'text-gray-500' },
    { id: 'system.alert', name: 'System Alert', category: 'system', icon: Bell, color: 'text-yellow-500' }
  ]);

  const [subscriptions, setSubscriptions] = useState<EventSubscription[]>([
    {
      id: '1',
      eventType: 'milestone.completed',
      name: 'Slack Notification - Milestone Complete',
      endpoint: 'https://hooks.slack.com/services/xxx',
      isActive: true,
      lastTriggered: '2024-02-10T14:30:00',
      successCount: 45,
      failureCount: 2
    },
    {
      id: '2',
      eventType: 'milestone.delayed',
      name: 'Email Alert - Delays',
      endpoint: 'team-leads@company.com',
      isActive: true,
      filters: { priority: ['high', 'critical'] },
      lastTriggered: '2024-02-09T09:15:00',
      successCount: 12,
      failureCount: 0
    },
    {
      id: '3',
      eventType: 'task.assigned',
      name: 'Teams Webhook - Task Assignment',
      endpoint: 'https://outlook.office.com/webhook/xxx',
      isActive: false,
      lastTriggered: '2024-02-08T16:45:00',
      successCount: 128,
      failureCount: 5
    }
  ]);

  const [eventHistory, setEventHistory] = useState<EventHistoryItem[]>([
    {
      id: '1',
      eventType: 'milestone.completed',
      timestamp: '2024-02-10T14:30:00',
      status: 'success',
      payload: { milestoneId: 'MS-001', title: 'Phase 1 Complete', completedBy: 'John Doe' },
      subscriptions: ['1'],
      duration: 245
    },
    {
      id: '2',
      eventType: 'milestone.delayed',
      timestamp: '2024-02-09T09:15:00',
      status: 'success',
      payload: { milestoneId: 'MS-002', title: 'API Integration', delayDays: 3, reason: 'Dependencies' },
      subscriptions: ['2'],
      duration: 189
    },
    {
      id: '3',
      eventType: 'task.assigned',
      timestamp: '2024-02-08T16:45:00',
      status: 'failure',
      payload: { taskId: 'T-045', assignee: 'Jane Smith' },
      subscriptions: ['3'],
      duration: 1523,
      error: 'Connection timeout'
    }
  ]);

  const [integrations] = useState<Integration[]>([
    { id: '1', name: 'Slack', type: 'slack', icon: Bell, isConnected: true },
    { id: '2', name: 'Microsoft Teams', type: 'teams', icon: Bell, isConnected: true },
    { id: '3', name: 'Email', type: 'email', icon: Bell, isConnected: true },
    { id: '4', name: 'Webhook', type: 'webhook', icon: Globe, isConnected: false }
  ]);

  const [showNewSubscription, setShowNewSubscription] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState('');
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'history' | 'integrations'>('subscriptions');

  const handleToggleSubscription = useCallback((id: string) => {
    setSubscriptions(prev => prev.map(sub =>
      sub.id === id ? { ...sub, isActive: !sub.isActive } : sub
    ));
  }, []);

  const handleDeleteSubscription = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    }
  }, []);

  const handleTestEvent = useCallback((eventType: string) => {
    const newEvent: EventHistoryItem = {
      id: Date.now().toString(),
      eventType,
      timestamp: new Date().toISOString(),
      status: 'pending',
      payload: { test: true, message: 'Test event triggered manually' },
      subscriptions: subscriptions.filter(s => s.eventType === eventType && s.isActive).map(s => s.id)
    };

    setEventHistory(prev => [newEvent, ...prev]);

    // Simulate event processing
    setTimeout(() => {
      setEventHistory(prev => prev.map(event =>
        event.id === newEvent.id
          ? { ...event, status: 'success', duration: Math.floor(Math.random() * 500) + 100 }
          : event
      ));
    }, 1500);
  }, [subscriptions]);

  const getEventTypeDetails = (typeId: string) => {
    return eventTypes.find(et => et.id === typeId);
  };

  const getStatusIcon = (status: EventHistoryItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failure':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getCategoryColor = (category: EventType['category']) => {
    switch (category) {
      case 'milestone':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'task':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'team':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'system':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Event Manager
            </h2>
            <p className="text-gray-600 mt-1">Manage event subscriptions and integrations</p>
          </div>
          <button
            onClick={() => setShowNewSubscription(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            New Subscription
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'subscriptions'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Event History
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'integrations'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Integrations
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {/* Event Types */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Event Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {eventTypes.map((eventType) => {
                const EventIcon = eventType.icon;
                return (
                  <div
                    key={eventType.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <EventIcon className={`w-5 h-5 ${eventType.color}`} />
                      <div>
                        <div className="font-medium text-gray-900">{eventType.name}</div>
                        <div className="text-xs text-gray-500">{eventType.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(eventType.category)}`}>
                        {eventType.category}
                      </span>
                      <button
                        onClick={() => handleTestEvent(eventType.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Test Event"
                      >
                        <PlayCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Subscriptions</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {subscriptions.map((subscription) => {
                const eventType = getEventTypeDetails(subscription.eventType);
                const EventIcon = eventType?.icon || Info;

                return (
                  <div key={subscription.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${subscription.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <EventIcon className={`w-5 h-5 ${subscription.isActive ? eventType?.color : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-gray-900">{subscription.name}</h4>
                            {subscription.isActive ? (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{subscription.endpoint}</div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Event: {subscription.eventType}</span>
                            {subscription.lastTriggered && (
                              <span>Last triggered: {new Date(subscription.lastTriggered).toLocaleString()}</span>
                            )}
                            <span className="text-green-600">{subscription.successCount} successful</span>
                            {subscription.failureCount > 0 && (
                              <span className="text-red-600">{subscription.failureCount} failed</span>
                            )}
                          </div>
                          {subscription.filters && (
                            <div className="mt-2 flex items-center gap-2">
                              <Filter className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Filters: {JSON.stringify(subscription.filters)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSubscription(subscription.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title={subscription.isActive ? 'Pause' : 'Resume'}
                        >
                          {subscription.isActive ? (
                            <PauseCircle className="w-5 h-5" />
                          ) : (
                            <PlayCircle className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteSubscription(subscription.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Event History</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {eventHistory.map((event) => {
              const eventType = getEventTypeDetails(event.eventType);
              const EventIcon = eventType?.icon || Info;

              return (
                <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">{getStatusIcon(event.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <EventIcon className={`w-4 h-4 ${eventType?.color}`} />
                        <span className="font-medium text-gray-900">{eventType?.name || event.eventType}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                        {event.duration && (
                          <span className="text-sm text-gray-400">{event.duration}ms</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Payload: <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {JSON.stringify(event.payload)}
                        </code>
                      </div>
                      {event.error && (
                        <div className="text-sm text-red-600">
                          Error: {event.error}
                        </div>
                      )}
                      {event.subscriptions.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Sent to {event.subscriptions.length} subscription{event.subscriptions.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration) => {
            const IntegrationIcon = integration.icon;
            return (
              <div
                key={integration.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${integration.isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <IntegrationIcon className={`w-6 h-6 ${integration.isConnected ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      <span className={`text-sm ${integration.isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                        {integration.isConnected ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {integration.isConnected
                    ? `Send real-time event notifications to ${integration.name}`
                    : `Connect ${integration.name} to receive event notifications`}
                </p>
                <button
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    integration.isConnected
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {integration.isConnected ? (
                    <>
                      <Settings className="w-4 h-4" />
                      Configure
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* New Subscription Modal */}
      {showNewSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Subscription</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an event type</option>
                  {eventTypes.map((et) => (
                    <option key={et.id} value={et.id}>{et.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Slack Alert for Delays"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endpoint
                </label>
                <input
                  type="text"
                  placeholder="e.g., https://hooks.slack.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowNewSubscription(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Add subscription logic here
                  setShowNewSubscription(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}