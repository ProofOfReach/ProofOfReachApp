import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Activity, Calendar, Download } from 'react-feather';
import { defaultUseRole } from '@/context/RoleContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

const ReportsPage = () => {
  const { role } = defaultUseRole();
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

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      // Simulate loading
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
          Platform Reports
        </h1>
        <div className="flex space-x-3">
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
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">47,500 sats</div>
              <div className="text-sm text-green-600">+12.3% vs last period</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Active Users</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1,247</div>
              <div className="text-sm text-green-600">+8.1% vs last period</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Active Campaigns</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">89</div>
              <div className="text-sm text-red-600">-3.2% vs last period</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Platform Fee</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">2,375 sats</div>
              <div className="text-sm text-green-600">+12.3% vs last period</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links to Detailed Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/reports/overview" className="block">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Overview</h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive overview of platform performance, user engagement, and revenue metrics.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/reports/performance" className="block">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Analytics</h3>
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed performance metrics including campaign effectiveness and user behavior analysis.
            </p>
          </div>
        </Link>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow opacity-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Reports</h3>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Revenue breakdown, fee analysis, and financial projections.
          </p>
          <div className="mt-2 text-sm text-yellow-600">Coming Soon</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Platform Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-white">New campaign "Bitcoin Education" approved</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-white">Platform reached 1,200 active users milestone</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-white">High-volume advertiser signup detected</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">6 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-white">Weekly revenue target exceeded by 15%</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;