import React, { useState } from 'react';
import "./components/layout/ImprovedDashboardLayout';
import "./components/ui/Typography';
import "./components/ui/card';
import { 
  Shield, Lock, Key, AlertTriangle, Activity, 
  Check, Clock, Eye, Trash, ChevronDown, ChevronUp 
} from 'react-feather';

// Sample security events data
const securityEvents = [
  {
    id: 1,
    type: 'login',
    user: 'Admin User',
    timestamp: '2023-05-08T09:23:15Z',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
    details: 'Successful login via Nostr authentication'
  },
  {
    id: 2,
    type: 'api_key_created',
    user: 'System',
    timestamp: '2023-05-07T14:12:33Z',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
    details: 'New API key created for advertiser integration'
  },
  {
    id: 3,
    type: 'failed_login',
    user: 'Unknown',
    timestamp: '2023-05-07T11:45:02Z',
    ipAddress: '203.0.113.42',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: false,
    details: 'Failed login attempt with invalid credentials'
  },
  {
    id: 4,
    type: 'role_change',
    user: 'Admin User',
    timestamp: '2023-05-06T16:30:45Z',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
    details: 'User role changed from "publisher" to "advertiser, publisher"'
  },
  {
    id: 5,
    type: 'system_setting',
    user: 'Admin User',
    timestamp: '2023-05-05T10:15:20Z',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
    details: 'Modified payment processing settings'
  },
];

// Sample API keys data
const apiKeys = [
  {
    id: 'key_1abc123',
    name: 'Analytics Integration',
    created: '2023-04-15T09:45:12Z',
    lastUsed: '2023-05-07T14:22:10Z',
    status: 'active',
    scopes: ['read:stats', 'read:users'],
    createdBy: 'Admin User'
  },
  {
    id: 'key_2def456',
    name: 'Payment Processor',
    created: '2023-03-20T11:32:45Z',
    lastUsed: '2023-05-08T08:15:33Z',
    status: 'active',
    scopes: ['write:transactions', 'read:transactions'],
    createdBy: 'System'
  },
  {
    id: 'key_3ghi789',
    name: 'Legacy Integration',
    created: '2022-12-10T15:20:30Z',
    lastUsed: '2023-04-22T13:45:22Z',
    status: 'expired',
    scopes: ['read:ads', 'read:publishers'],
    createdBy: 'Previous Admin'
  }
];

// Get appropriate icon for security event
const getEventIcon = (event: any) => {
  switch(event.type) {
    case 'login':
      return event.success ? <Check className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'failed_login':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'api_key_created':
      return <Key className="h-5 w-5 text-blue-500" />;
    case 'role_change':
      return <Shield className="h-5 w-5 text-purple-500" />;
    case 'system_setting':
      return <Lock className="h-5 w-5 text-indigo-500" />;
    default:
      return <Activity className="h-5 w-5 text-gray-500" />;
  }
};

// Format event type for display
const formatEventType = (type: string) => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const SecurityPage = () => {
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  
  const toggleEventDetails = (eventId: number) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(eventId);
    }
  };

  return (
    <ImprovedDashboardLayout title="Security Dashboard">
      <div className="space-y-6">
        <div>
          <Title level={1}>Security Dashboard</Title>
          <Paragraph className="text-gray-500 dark:text-gray-400">
            Monitor security events and manage API keys.
          </Paragraph>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-start">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Security Status</h3>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">No active threats</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="flex items-start">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <Key className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">API Keys</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">2 active, 1 expired</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="flex items-start">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-700 dark:text-red-300" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Failed Logins</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">1 in last 24 hours</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <Activity className="h-6 w-6 text-green-700 dark:text-green-300" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">System Health</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">All systems operational</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Security Events</h2>
                <div className="overflow-y-auto max-h-[500px]">
                  <div className="space-y-4">
                    {securityEvents.map((event) => (
                      <div key={event.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <div 
                          className="p-4 flex justify-between items-center cursor-pointer"
                          onClick={() => toggleEventDetails(event.id)}
                        >
                          <div className="flex items-center">
                            <div className="mr-3">
                              {getEventIcon(event)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatEventType(event.type)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(event.timestamp).toLocaleString()} • {event.user}
                              </p>
                            </div>
                          </div>
                          {expandedEvent === event.id ? 
                            <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          }
                        </div>
                        
                        {expandedEvent === event.id && (
                          <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div>
                                <dt className="text-gray-500 dark:text-gray-400">IP Address</dt>
                                <dd className="text-gray-900 dark:text-white">{event.ipAddress}</dd>
                              </div>
                              <div>
                                <dt className="text-gray-500 dark:text-gray-400">Status</dt>
                                <dd className="text-gray-900 dark:text-white">
                                  {event.success ? 
                                    <span className="text-green-600 dark:text-green-400">Success</span> : 
                                    <span className="text-red-600 dark:text-red-400">Failed</span>
                                  }
                                </dd>
                              </div>
                              <div className="sm:col-span-2">
                                <dt className="text-gray-500 dark:text-gray-400">User Agent</dt>
                                <dd className="text-gray-900 dark:text-white break-all">{event.userAgent}</dd>
                              </div>
                              <div className="sm:col-span-2">
                                <dt className="text-gray-500 dark:text-gray-400">Details</dt>
                                <dd className="text-gray-900 dark:text-white">{event.details}</dd>
                              </div>
                            </dl>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <button className="px-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    View All Events
                  </button>
                </div>
              </div>
            </Card>
          </div>
          
          <div>
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">API Keys</h2>
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div 
                      key={key.id}
                      className={`p-4 border rounded-lg ${
                        key.status === 'active' 
                          ? 'border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10' 
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{key.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {key.id}</p>
                        </div>
                        <div>
                          {key.status === 'active' ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-medium">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                              Expired
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Created</p>
                          <p className="text-gray-900 dark:text-white">{new Date(key.created).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Last Used</p>
                          <p className="text-gray-900 dark:text-white">{new Date(key.lastUsed).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-1">
                        {key.scopes.map((scope, index) => (
                          <span key={index} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-xs">
                            {scope}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-3 flex justify-end space-x-2">
                        <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                          <Eye className="h-4 w-4" />
                        </button>
                        {key.status === 'active' && (
                          <button className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                            <Trash className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <button className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-700 dark:hover:bg-indigo-600 rounded text-sm font-medium">
                    Create New API Key
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ImprovedDashboardLayout>
  );
};

export default SecurityPage;