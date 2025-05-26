import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Play, Pause, BarChart3 } from 'react-feather';
import { useRole } from '@/context/RoleContext';
import { useRouter } from 'next/router';

interface Campaign {
  id: string;
  title: string;
  advertiser: string;
  status: 'active' | 'paused' | 'pending' | 'rejected';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  createdAt: string;
}

const AdminCampaignsPage = () => {
  const { role } = useRole();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [role, router]);

  // Load campaigns data
  useEffect(() => {
    const loadCampaigns = () => {
      // Sample campaigns data for admin view
      const sampleCampaigns: Campaign[] = [
        {
          id: '1',
          title: 'Bitcoin Education Campaign',
          advertiser: 'CryptoEducator',
          status: 'active',
          budget: 5000,
          spent: 2350,
          impressions: 125000,
          clicks: 1875,
          ctr: 1.5,
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          title: 'Lightning Network Promotion',
          advertiser: 'LightningLabs',
          status: 'pending',
          budget: 3000,
          spent: 0,
          impressions: 0,
          clicks: 0,
          ctr: 0,
          createdAt: '2024-01-20'
        },
        {
          id: '3',
          title: 'DeFi Platform Launch',
          advertiser: 'DeFiProtocol',
          status: 'paused',
          budget: 8000,
          spent: 4200,
          impressions: 87500,
          clicks: 1312,
          ctr: 1.5,
          createdAt: '2024-01-10'
        }
      ];
      setCampaigns(sampleCampaigns);
      setLoading(false);
    };

    loadCampaigns();
  }, []);

  const handleStatusChange = (id: string, newStatus: Campaign['status']) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === id ? { ...campaign, status: newStatus } : campaign
    ));
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Campaign Management
        </h1>
        <div className="text-sm text-gray-500">
          Total Campaigns: {campaigns.length}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Campaigns</div>
          <div className="text-2xl font-bold text-green-600">
            {campaigns.filter(c => c.status === 'active').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400">Pending Review</div>
          <div className="text-2xl font-bold text-blue-600">
            {campaigns.filter(c => c.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Spend</div>
          <div className="text-2xl font-bold text-purple-600">
            {campaigns.reduce((sum, c) => sum + c.spent, 0).toLocaleString()} sats
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Impressions</div>
          <div className="text-2xl font-bold text-orange-600">
            {campaigns.reduce((sum, c) => sum + c.impressions, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Advertiser
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Budget / Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {campaign.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Created: {campaign.createdAt}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {campaign.advertiser}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {campaign.spent.toLocaleString()} / {campaign.budget.toLocaleString()} sats
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {campaign.impressions.toLocaleString()} impressions
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {campaign.clicks} clicks ({campaign.ctr}% CTR)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        {campaign.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(campaign.id, 'active')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(campaign.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {campaign.status === 'active' && (
                          <button 
                            onClick={() => handleStatusChange(campaign.id, 'paused')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Pause"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {campaign.status === 'paused' && (
                          <button 
                            onClick={() => handleStatusChange(campaign.id, 'active')}
                            className="text-green-600 hover:text-green-900"
                            title="Resume"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-purple-600 hover:text-purple-900">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCampaignsPage;