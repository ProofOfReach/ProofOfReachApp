import { UserRole } from "@/types/role";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { BarChart2, Calendar, Download, ArrowUp, ArrowDown, Eye, Zap, Target, DollarSign } from 'react-feather';

// Mock earnings data
interface EarningsSummary {
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate as a percentage
  earnings: number; // in sats
  adspaces: number; // number of active ad spaces
}

const PublisherEarningsPage = () => {
  const role = "viewer"; // Simplified for build
  const router = useRouter();
  const [dateRange, setDateRange] = useState<string>('last-7-days');
  const [loading, setLoading] = useState<boolean>(true);
  
  // State for API data
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [adSpaceData, setAdSpaceData] = useState<any[]>([]);
  const [chartError, setChartError] = useState<string | null>(null);

  // Mock data for build compatibility
  const summary: EarningsSummary = {
    impressions: 15420,
    clicks: 287,
    ctr: 1.86,
    earnings: 4523,
    adspaces: 3
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Access control check
  if (role === "viewer") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Publisher Access Required</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need publisher access to view earnings analytics.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-8 w-8 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings Analytics</h1>
        </div>
        <div className="flex space-x-2">
          <div className="relative inline-block">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="last-7-days">Last 7 Days</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="last-90-days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <button className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
              <div className="flex items-center space-x-1 mt-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.earnings} sats
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Impressions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {summary.impressions.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clicks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {summary.clicks.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CTR</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {summary.ctr}%
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <BarChart2 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ad Spaces</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {summary.adspaces}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
              <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Earnings Over Time</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
            Chart component will be displayed here
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
            Chart component will be displayed here
          </div>
        </div>
      </div>

      {/* Ad Space Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ad Space Performance</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
                  <th className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Impressions</th>
                  <th className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Clicks</th>
                  <th className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">CTR</th>
                  <th className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Homepage Banner</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">8,420</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">156</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">1.85%</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">2,341 sats</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Sidebar Ad</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">4,200</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">78</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">1.86%</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">1,456 sats</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Footer Banner</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">2,800</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">53</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">1.89%</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">726 sats</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the page with our layout
PublisherEarningsPage.getLayout = (page: React.ReactElement) => {
  return page;
};

export default PublisherEarningsPage;