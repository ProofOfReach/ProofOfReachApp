import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Activity, ArrowUp, ArrowDown } from 'react-feather';
import { useRole } from '@/context/RoleContext';
import { useRouter } from 'next/router';

const ReportsOverviewPage = () => {
  const { role } = useRole();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  // Redirect if not stakeholder
  useEffect(() => {
    if (role !== 'stakeholder') {
      router.push('/dashboard');
      return;
    }
  }, [role, router]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    };
    loadData();
  }, [timeRange]);

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
          Platform Overview Report
        </h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Executive Summary */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Executive Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">$47.5K</div>
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="flex items-center justify-center mt-1">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">12.3%</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">1,247</div>
            <div className="text-sm text-gray-500">Active Users</div>
            <div className="flex items-center justify-center mt-1">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">8.1%</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">89</div>
            <div className="text-sm text-gray-500">Active Campaigns</div>
            <div className="flex items-center justify-center mt-1">
              <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-sm text-red-500">3.2%</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">95.2%</div>
            <div className="text-sm text-gray-500">Platform Uptime</div>
            <div className="flex items-center justify-center mt-1">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">0.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Growth */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth Trends</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">New Advertisers</div>
              <div className="text-2xl font-bold text-blue-600">47</div>
            </div>
            <div className="text-green-600">+23% vs last period</div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">New Publishers</div>
              <div className="text-2xl font-bold text-green-600">31</div>
            </div>
            <div className="text-green-600">+15% vs last period</div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Registered Users</div>
              <div className="text-2xl font-bold text-purple-600">2,834</div>
            </div>
            <div className="text-green-600">+18% vs last period</div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Breakdown</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Platform Fees (5%)</span>
            <span className="font-semibold">2,375 sats</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Premium Features</span>
            <span className="font-semibold">1,250 sats</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Subscription Revenue</span>
            <span className="font-semibold">875 sats</span>
          </div>
          <div className="border-t pt-2 flex items-center justify-between font-bold">
            <span>Total Revenue</span>
            <span>4,500 sats</span>
          </div>
        </div>
      </div>

      {/* Top Performing Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Campaigns</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Bitcoin Education</span>
              <span className="text-sm font-semibold">12.5K impressions</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Lightning Network</span>
              <span className="text-sm font-semibold">8.7K impressions</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">DeFi Platform</span>
              <span className="text-sm font-semibold">6.2K impressions</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Publishers</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">CryptoNews Daily</span>
              <span className="text-sm font-semibold">875 sats earned</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Bitcoin Blog</span>
              <span className="text-sm font-semibold">642 sats earned</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tech Review Site</span>
              <span className="text-sm font-semibold">521 sats earned</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsOverviewPage;