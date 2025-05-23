import React, { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { fetcher } from '../../../utils/fetcher';
import useSWR, { mutate } from 'swr';
// Use our own date utilities instead of date-fns directly
import { formatRelativeTime, formatISODate } from '../../../utils/dateUtils';
import { 
  Plus, 
  RefreshCw, 
  Copy, 
  Trash2, 
  Edit,
  Key,
  AlertTriangle,
  Check,
  Clock,
  X
} from 'react-feather';
import { Title, Text, Paragraph, MessageBar } from '../../../components/ui/Typography';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import toast from '../../../utils/toast';

type ApiKey = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  isActive: boolean;
  scopes: string;
  usageCount: number;
};

const ApiKeysPage: React.FC = () => {
  const router = useRouter();
  const { data: apiKeys, error } = useSWR<ApiKey[]>('/api/auth/api-keys', fetcher);
  
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scopes, setScopes] = useState('read');
  const [isActive, setIsActive] = useState(true);
  
  // Handle create API key
  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          scopes: scopes || 'read',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create API key');
      }
      
      const data = await response.json();
      setNewApiKey(data.key);
      mutate('/api/auth/api-keys'); // Refresh the list
      
      // Reset form
      setName('');
      setDescription('');
      setScopes('read');
    } catch (error) {
      toast.logger.error('Failed to create API key');
      console.logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle edit API key
  const handleEditApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/api-keys/${selectedKey.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          isActive,
          scopes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update API key');
      }
      
      toast.success('API key updated successfully');
      mutate('/api/auth/api-keys'); // Refresh the list
      setIsEditModalVisible(false);
    } catch (error) {
      toast.logger.error('Failed to update API key');
      console.logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete API key
  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? Applications using this key will no longer have access.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/auth/api-keys/${keyId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }
      
      toast.success('API key deleted successfully');
      mutate('/api/auth/api-keys'); // Refresh the list
    } catch (error) {
      toast.logger.error('Failed to delete API key');
      console.logger.error(error);
    }
  };
  
  // Copy API key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('API key copied to clipboard');
  };
  
  // Edit API key
  const showEditModal = (key: ApiKey) => {
    setSelectedKey(key);
    setName(key.name);
    setDescription(key.description || '');
    setIsActive(key.isActive);
    setScopes(key.scopes);
    setIsEditModalVisible(true);
  };
  
  // Format the scopes into badges
  const renderScopes = (scopes: string) => {
    return scopes.split(',').map(scope => {
      const type = scope === 'read' 
        ? 'info' 
        : scope === 'write' 
          ? 'warning' 
          : 'success';
      
      return (
        <Badge key={scope} type={type}>{scope.trim()}</Badge>
      );
    });
  };
  
  return (
    <DashboardLayout>
      <Title level={2}>API Keys</Title>
      <Paragraph>
        API keys allow external applications to access the Nostr Ad Marketplace API on your behalf.
        You can use these keys to integrate your own applications with our platform.
      </Paragraph>
      
      <MessageBar 
        type="warning"
        title="Security Warning"
      >
        API keys grant access to your account. Never share your API keys in client-side code or public repositories. Revoke keys immediately if compromised.
      </MessageBar>
      
      <div className="mb-6 flex justify-between">
        <button 
          onClick={() => setIsCreateModalVisible(true)}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </button>
        
        <button 
          onClick={() => mutate('/api/auth/api-keys')}
          disabled={!apiKeys}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>
      
      {error && (
        <MessageBar type="error" title="Error loading API keys">
          There was a problem loading your API keys. Please try again.
        </MessageBar>
      )}
      
      {apiKeys && apiKeys.length === 0 ? (
        <MessageBar type="info" title="No API Keys">
          You don't have any API keys yet. Create one to get started with API integration.
        </MessageBar>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {apiKeys?.map(key => (
            <div key={key.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center text-lg font-medium overflow-hidden">
                  <Key className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <div className="truncate">{key.name}</div>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => showEditModal(key)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteApiKey(key.id)}
                    className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-300 focus:outline-none"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Body */}
              <div className="p-4">
                <div className="mb-3">
                  {key.description ? (
                    <Paragraph ellipsis={{ rows: 2 }}>{key.description}</Paragraph>
                  ) : (
                    <Text type="secondary">No description</Text>
                  )}
                </div>
                
                <div className="mb-3">
                  <Text strong>Scopes: </Text>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {renderScopes(key.scopes)}
                  </div>
                </div>
                
                {key.lastUsed && (
                  <div className="mb-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    Last used {formatRelativeTime(new Date(key.lastUsed), { addSuffix: true })}
                  </div>
                )}
                
                {key.expiresAt && (
                  <div className="mb-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                    Expires {formatRelativeTime(new Date(key.expiresAt), { addSuffix: true })}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 text-sm border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <div>
                  {key.isActive ? (
                    <Badge type="success" dot>Active</Badge>
                  ) : (
                    <Badge type="danger" dot>Inactive</Badge>
                  )}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {key.usageCount} {key.usageCount === 1 ? 'request' : 'requests'}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Created {formatRelativeTime(new Date(key.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create API Key Modal */}
      <Modal
        isOpen={isCreateModalVisible}
        onClose={() => {
          setIsCreateModalVisible(false);
          setNewApiKey(null);
          setName('');
          setDescription('');
          setScopes('read');
        }}
        title="Create API Key"
      >
        {newApiKey ? (
          <div>
            <MessageBar type="success" title="API Key Created Successfully">
              Save your API key now. For security reasons, it will not be displayed again.
            </MessageBar>
            
            <div className="relative mt-4 mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-sm overflow-auto max-h-48 break-all">
              {newApiKey}
              <button 
                onClick={() => copyToClipboard(newApiKey)}
                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setIsCreateModalVisible(false);
                  setNewApiKey(null);
                  setName('');
                  setDescription('');
                  setScopes('read');
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateApiKey}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name*
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                placeholder="My API Key"
                required
              />
              <p className="mt-1 text-sm text-gray-500">A descriptive name to identify this API key</p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                placeholder="Used for..."
                rows={3}
              />
              <p className="mt-1 text-sm text-gray-500">Optional description of what this API key is used for</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Scopes*
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="scope-read"
                    checked={scopes.includes('read')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setScopes(prev => prev.includes('read') ? prev : `${prev ? prev + ',' : ''}read`);
                      } else {
                        setScopes(prev => prev.split(',').filter(s => s !== 'read').join(','));
                      }
                    }}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="scope-read" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Read (View data)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="scope-write"
                    checked={scopes.includes('write')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setScopes(prev => prev.includes('write') ? prev : `${prev ? prev + ',' : ''}write`);
                      } else {
                        setScopes(prev => prev.split(',').filter(s => s !== 'write').join(','));
                      }
                    }}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="scope-write" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Write (Create/Update data)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="scope-admin"
                    checked={scopes.includes('admin')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setScopes(prev => prev.includes('admin') ? prev : `${prev ? prev + ',' : ''}admin`);
                      } else {
                        setScopes(prev => prev.split(',').filter(s => s !== 'admin').join(','));
                      }
                    }}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="scope-admin" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Admin (Full control)
                  </label>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">Select the permissions this API key will have</p>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalVisible(false);
                  setName('');
                  setDescription('');
                  setScopes('read');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name || !scopes}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create API Key'}
              </button>
            </div>
          </form>
        )}
      </Modal>
      
      {/* Edit API Key Modal */}
      <Modal
        isOpen={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        title="Edit API Key"
      >
        <form onSubmit={handleEditApiKey}>
          <div className="mb-4">
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name*
            </label>
            <input
              type="text"
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
              placeholder="My API Key"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
              placeholder="Used for..."
              rows={3}
            />
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Active
              </span>
            </label>
            <p className="mt-1 text-sm text-gray-500">Inactive API keys cannot be used to access the API</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Scopes*
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-scope-read"
                  checked={scopes.includes('read')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setScopes(prev => prev.includes('read') ? prev : `${prev ? prev + ',' : ''}read`);
                    } else {
                      setScopes(prev => prev.split(',').filter(s => s !== 'read').join(','));
                    }
                  }}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="edit-scope-read" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Read (View data)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-scope-write"
                  checked={scopes.includes('write')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setScopes(prev => prev.includes('write') ? prev : `${prev ? prev + ',' : ''}write`);
                    } else {
                      setScopes(prev => prev.split(',').filter(s => s !== 'write').join(','));
                    }
                  }}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="edit-scope-write" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Write (Create/Update data)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-scope-admin"
                  checked={scopes.includes('admin')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setScopes(prev => prev.includes('admin') ? prev : `${prev ? prev + ',' : ''}admin`);
                    } else {
                      setScopes(prev => prev.split(',').filter(s => s !== 'admin').join(','));
                    }
                  }}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="edit-scope-admin" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Admin (Full control)
                </label>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalVisible(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name || !scopes}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update API Key'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ApiKeysPage;