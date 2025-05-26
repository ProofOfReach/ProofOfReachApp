import React, { useState, useEffect } from 'react';
import { Save, Settings, Shield, Globe, Bell } from 'react-feather';
import { defaultUseRole } from '@/context/RoleContext';
import { useRouter } from 'next/router';

const AdminSettingsPage = () => {
  const { role } = defaultUseRole();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Platform settings state
  const [settings, setSettings] = useState({
    platform: {
      maintenanceMode: false,
      allowNewRegistrations: true,
      requireApproval: true,
      maxCampaignBudget: 100000,
      minCampaignBudget: 1000,
    },
    content: {
      autoModeration: true,
      requireContentReview: true,
      allowedCategories: ['technology', 'education', 'finance', 'lifestyle'],
      blockedKeywords: ['scam', 'guaranteed', 'get rich quick'],
    },
    notifications: {
      emailNotifications: true,
      slackIntegration: false,
      webhookUrl: '',
    },
    security: {
      twoFactorRequired: false,
      sessionTimeout: 24,
      ipWhitelist: [],
    }
  });

  // Redirect if not admin
  useEffect(() => {
    if (role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [role, router]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Platform Settings
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save All Settings
        </button>
      </div>

      {saveMessage && (
        <div className={`p-4 rounded-md ${saveMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {saveMessage}
        </div>
      )}

      {/* Platform Settings */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Platform Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Maintenance Mode</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Temporarily disable the platform for maintenance</p>
              </div>
              <input
                type="checkbox"
                checked={settings.platform.maintenanceMode}
                onChange={(e) => updateSetting('platform', 'maintenanceMode', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow New Registrations</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Allow new users to register for the platform</p>
              </div>
              <input
                type="checkbox"
                checked={settings.platform.allowNewRegistrations}
                onChange={(e) => updateSetting('platform', 'allowNewRegistrations', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Campaign Approval</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">All campaigns must be approved before going live</p>
              </div>
              <input
                type="checkbox"
                checked={settings.platform.requireApproval}
                onChange={(e) => updateSetting('platform', 'requireApproval', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Campaign Budget (sats)
                </label>
                <input
                  type="number"
                  value={settings.platform.maxCampaignBudget}
                  onChange={(e) => updateSetting('platform', 'maxCampaignBudget', parseInt(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Campaign Budget (sats)
                </label>
                <input
                  type="number"
                  value={settings.platform.minCampaignBudget}
                  onChange={(e) => updateSetting('platform', 'minCampaignBudget', parseInt(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Two-Factor Authentication Required</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Require 2FA for all admin accounts</p>
              </div>
              <input
                type="checkbox"
                checked={settings.security.twoFactorRequired}
                onChange={(e) => updateSetting('security', 'twoFactorRequired', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Session Timeout (hours)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full max-w-xs border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notification Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Send email alerts for important events</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.emailNotifications}
                onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Slack Integration</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Send notifications to Slack channel</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.slackIntegration}
                onChange={(e) => updateSetting('notifications', 'slackIntegration', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                value={settings.notifications.webhookUrl}
                onChange={(e) => updateSetting('notifications', 'webhookUrl', e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;