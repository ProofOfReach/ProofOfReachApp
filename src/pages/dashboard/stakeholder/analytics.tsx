import React from 'react';
import "./components/layout/ImprovedDashboardLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import "./components/ui/Typography';
import "./components/ui/card';

// Sample data for demonstration
const monthlySummary = [
  { month: 'Jan', advertisers: 28, publishers: 42, impressions: 12520, revenue: 2450 },
  { month: 'Feb', advertisers: 32, publishers: 48, impressions: 14250, revenue: 2780 },
  { month: 'Mar', advertisers: 37, publishers: 53, impressions: 16800, revenue: 3250 },
  { month: 'Apr', advertisers: 40, publishers: 59, impressions: 19400, revenue: 3720 },
  { month: 'May', advertisers: 45, publishers: 64, impressions: 22100, revenue: 4180 },
  { month: 'Jun', advertisers: 48, publishers: 68, impressions: 23800, revenue: 4510 },
];

const StakeholderAnalyticsPage = () => {
  return (
    <ImprovedDashboardLayout title="Stakeholder Analytics">
      <div className="space-y-6">
        <div>
          <Title level={1}>Platform Analytics</Title>
          <Paragraph className="text-gray-500 dark:text-gray-400">
            Overview of platform performance across all advertisers and publishers.
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Total Advertisers</h3>
              <p className="text-3xl font-bold mt-2">624</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">↑ 12% from last month</p>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Total Publishers</h3>
              <p className="text-3xl font-bold mt-2">842</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">↑ 8% from last month</p>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Monthly Revenue</h3>
              <p className="text-3xl font-bold mt-2">$42,180</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">↑ 15% from last month</p>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Total Impressions</h3>
              <p className="text-3xl font-bold mt-2">2.4M</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">↑ 18% from last month</p>
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Growth Overview</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySummary} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="advertisers" name="Advertisers" fill="#8884d8" />
                  <Bar yAxisId="left" dataKey="publishers" name="Publishers" fill="#82ca9d" />
                  <Bar yAxisId="right" dataKey="revenue" name="Revenue ($100s)" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Top Advertisers</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Spend</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Impressions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">Nostr Labs</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">$12,450</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">258,120</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">Alby Wallet</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">$8,720</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">176,340</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">Lightning Labs</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">$7,850</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">158,600</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">Sphinx Chat</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">$6,340</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">128,420</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Top Publishers</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Publisher</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Earnings</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Impressions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">Stacker News</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">$9,320</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">198,450</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">Nostr.Band</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">$8,110</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">172,640</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">DAMUS</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">$7,240</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">154,280</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">Amethyst</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">$5,890</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">125,670</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ImprovedDashboardLayout>
  );
};

export default StakeholderAnalyticsPage;