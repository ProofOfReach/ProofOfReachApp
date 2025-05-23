import React, { useState } from 'react';
import.*./pages/_app';
import.*./utils/layoutHelpers';
import.*./context/RoleContext';
import { BarChart2, Calendar, Download, ArrowUp, ArrowDown, Eye, Zap, Target } from 'react-feather';
import.*./components/charts';
import { 
  fetchAdvertiserSummary, 
  fetchAdvertiserDailyMetrics,
  fetchCampaignPerformance,
  DailyMetrics
} from '@/services/analyticsService';
import.*./utils/chartHelpers';

// Mock analytics data types
interface AnalyticsSummary {
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate as a percentage
  spend: number; // in sats
  averageCPC: number; // Cost per click in sats
}

interface DailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
}

interface CampaignPerformance {
  id: string;
  name: string;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  status: 'active' | 'paused' | 'completed';
}

// Platform-wide analytics data
interface PlatformMetrics {
  advertisers: number;
  publishers: number;
  impressions: number;
  clicks: number;
  revenue: number;
  month: string;
}

const AnalyticsPage: NextPageWithLayout = () => {
  const { role } = useRole();
  const [dateRange, setDateRange] = useState<string>('last-7-days');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Render different analytics dashboards based on role
  const renderRoleDashboard = () => {
    switch (role) {
      case 'advertiser':
        return <AdvertiserAnalyticsDashboard dateRange={dateRange} loading={loading} />;
      case 'publisher':
        return <PublisherAnalyticsDashboard dateRange={dateRange} loading={loading} />;
      case 'stakeholder':
      case 'admin':
        return <StakeholderAnalyticsDashboard dateRange={dateRange} loading={loading} />;
      default:
        return <AccessRestricted />;
    }
  };

  // Generate percentage change indicator
  const renderChangeIndicator = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
        {Math.abs(change)}%
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart2 className="h-8 w-8 text-purple-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        </div>
        <div className="flex space-x-2">
          <div className="relative inline-block">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Calendar className="w-4 h-4 mr-2" />
              {dateRange === 'last-7-days' ? 'Last 7 Days' : 'Custom Range'}
            </button>
            {/* Date range dropdown would go here */}
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {renderRoleDashboard()}
    </div>
  );
};

// Fallback component for users without proper access
const AccessRestricted = () => {
  return (
    <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300">Access Restricted</h3>
      <p className="mt-2 text-yellow-700 dark:text-yellow-400">
        Analytics are only available to publishers, advertisers, or administrators.
      </p>
    </div>
  );
};

// Advertiser-specific analytics
const AdvertiserAnalyticsDashboard = ({ dateRange, loading }: { dateRange: string, loading: boolean }) => {
  // Mock data for advertiser
  const summary: AnalyticsSummary = {
    impressions: 25430,
    clicks: 982,
    ctr: 3.86,
    spend: 49100,
    averageCPC: 50,
  };

  const dailyData: DailyMetric[] = [
    { date: '2023-04-25', impressions: 4210, clicks: 182, spend: 9100 },
    { date: '2023-04-24', impressions: 3980, clicks: 156, spend: 7800 },
    { date: '2023-04-23', impressions: 4350, clicks: 168, spend: 8400 },
    { date: '2023-04-22', impressions: 3850, clicks: 145, spend: 7250 },
    { date: '2023-04-21', impressions: 3190, clicks: 132, spend: 6600 },
    { date: '2023-04-20', impressions: 3120, clicks: 118, spend: 5900 },
    { date: '2023-04-19', impressions: 2730, clicks: 81, spend: 4050 },
  ];

  const campaignPerformance: CampaignPerformance[] = [
    {
      id: 'camp-1',
      name: 'Lightning Wallet Promotion',
      impressions: 12450,
      clicks: 520,
      ctr: 4.18,
      spend: 26000,
      status: 'active',
    },
    {
      id: 'camp-2',
      name: 'Hardware Wallet Sale',
      impressions: 8630,
      clicks: 342,
      ctr: 3.96,
      spend: 17100,
      status: 'active',
    },
    {
      id: 'camp-3',
      name: 'Bitcoin Conference Tickets',
      impressions: 4350,
      clicks: 120,
      ctr: 2.76,
      spend: 6000,
      status: 'completed',
    },
  ];

  // Generate percentage change indicator
  const renderChangeIndicator = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
        {Math.abs(change)}%
      </div>
    );
  };

  return (
    <>
      {loading ? (
        <div className="py-12 text-center">
          <Zap className="inline-block w-10 h-10 text-gray-400 animate-pulse mb-2" />
          <p className="text-gray-500 dark:text-gray-400">Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Impressions</div>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(summary.impressions)}
              </div>
              {renderChangeIndicator(5.2)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Clicks</div>
                <Eye className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(summary.clicks)}
              </div>
              {renderChangeIndicator(8.7)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">CTR</div>
                <Target className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.ctr.toFixed(2)}%
              </div>
              {renderChangeIndicator(3.4)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spend</div>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatSats(summary.spend)}
              </div>
              {renderChangeIndicator(11.2)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. CPC</div>
                <Zap className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.averageCPC} sats
              </div>
              {renderChangeIndicator(-2.5)}
            </div>
          </div>

          {/* Daily Performance Chart */}
          <LineChart
            title="Daily Performance"
            subtitle={`Data for ${dateRange === 'last-7-days' ? 'last 7 days' : 'selected period'}`}
            data={dailyData}
            dataKeys={[
              { key: 'impressions', name: 'Impressions', color: '#0088FE' },
              { key: 'clicks', name: 'Clicks', color: '#00C49F' }
            ]}
            xAxisDataKey="date"
            loading={loading}
            error={null}
            height={320}
            tooltipFormatter={(value: number, name: string) => [formatNumber(value), name || ""]}
          />

          {/* Campaign Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campaign Performance Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Campaign Performance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Impressions
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        CTR
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {campaignPerformance.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(campaign.impressions)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(campaign.clicks)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{campaign.ctr.toFixed(2)}%</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Campaign Performance Chart */}
            <BarChart
              title="Campaign Comparison"
              subtitle="Impressions and clicks by campaign"
              data={campaignPerformance.slice(0, 4)}
              dataKeys={[
                { key: 'impressions', name: 'Impressions', color: '#0088FE' },
                { key: 'clicks', name: 'Clicks', color: '#00C49F' }
              ]}
              xAxisDataKey="name"
              loading={loading}
              error={null}
              height={300}
              tooltipFormatter={(value, name) => [formatNumber(value), name || ""]}
            />
          </div>
          
          {/* Spend Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Spend by Campaign Chart */}
            <PieChart
              title="Spend Distribution"
              subtitle="By campaign"
              data={campaignPerformance.map(campaign => ({
                name: campaign.name,
                value: campaign.spend,
                color: campaign.id === 'camp-1' ? '#FF8042' : 
                       campaign.id === 'camp-2' ? '#0088FE' : 
                       campaign.id === 'camp-3' ? '#00C49F' : '#FFBB28'
              }))}
              loading={loading}
              error={null}
              tooltipFormatter={(value, name) => [formatSats(value), name || ""]}
              labelLine={true}
              height={300}
            />
            
            {/* Budget Usage */}
            <BarChart
              title="Daily Spend"
              subtitle={`Last ${dateRange === 'last-7-days' ? '7' : '30'} days`}
              data={dailyData}
              dataKeys={[
                { key: 'spend', name: 'Spend (sats)', color: '#FF8042' }
              ]}
              xAxisDataKey="date"
              loading={loading}
              error={null}
              height={300}
              tooltipFormatter={(value, name) => [formatSats(value), name || ""]}
            />
          </div>
        </>
      )}
    </>
  );
};

// Publisher-specific analytics
const PublisherAnalyticsDashboard = ({ dateRange, loading }: { dateRange: string, loading: boolean }) => {
  // Mock data for publisher analytics
  const publisherSummary = {
    impressions: 38250,
    clicks: 1530,
    ctr: 4.0,
    earnings: 76500,
    spaces: 4,
    fillRate: 87.5,
  };

  const publisherDailyData = [
    { date: '2023-04-25', impressions: 5850, clicks: 234, earnings: 11700 },
    { date: '2023-04-24', impressions: 6240, clicks: 249, earnings: 12450 },
    { date: '2023-04-23', impressions: 5750, clicks: 230, earnings: 11500 },
    { date: '2023-04-22', impressions: 5430, clicks: 217, earnings: 10850 },
    { date: '2023-04-21', impressions: 5280, clicks: 211, earnings: 10550 },
    { date: '2023-04-20', impressions: 4950, clicks: 198, earnings: 9900 },
    { date: '2023-04-19', impressions: 4750, clicks: 190, earnings: 9500 },
  ];

  const spacePerformance = [
    { id: 'space-1', name: 'Nostr Client Blog', impressions: 15300, clicks: 612, ctr: 4.0, earnings: 30600 },
    { id: 'space-2', name: 'Bitcoin News', impressions: 12500, clicks: 500, ctr: 4.0, earnings: 25000 },
    { id: 'space-3', name: 'Lightning Network Tutorial', impressions: 7550, clicks: 302, ctr: 4.0, earnings: 15100 },
    { id: 'space-4', name: 'Digital Privacy Guide', impressions: 2900, clicks: 116, ctr: 4.0, earnings: 5800 },
  ];

  // Generate percentage change indicator
  const renderChangeIndicator = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
        {Math.abs(change)}%
      </div>
    );
  };

  return (
    <>
      {loading ? (
        <div className="py-12 text-center">
          <Zap className="inline-block w-10 h-10 text-gray-400 animate-pulse mb-2" />
          <p className="text-gray-500 dark:text-gray-400">Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Impressions</div>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(publisherSummary.impressions)}
              </div>
              {renderChangeIndicator(7.3)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Clicks</div>
                <Zap className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(publisherSummary.clicks)}
              </div>
              {renderChangeIndicator(9.4)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">CTR</div>
                <Target className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {publisherSummary.ctr.toFixed(2)}%
              </div>
              {renderChangeIndicator(2.1)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Earnings</div>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatSats(publisherSummary.earnings)}
              </div>
              {renderChangeIndicator(12.5)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Fill Rate</div>
                <Target className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {publisherSummary.fillRate}%
              </div>
              {renderChangeIndicator(3.2)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Spaces</div>
                <Target className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {publisherSummary.spaces}
              </div>
              {renderChangeIndicator(0)}
            </div>
          </div>

          {/* Daily Performance Chart */}
          <LineChart
            title="Daily Performance"
            subtitle={`Data for ${dateRange === 'last-7-days' ? 'last 7 days' : 'selected period'}`}
            data={publisherDailyData}
            dataKeys={[
              { key: 'impressions', name: 'Impressions', color: '#0088FE' },
              { key: 'clicks', name: 'Clicks', color: '#00C49F' }
            ]}
            xAxisDataKey="date"
            loading={loading}
            error={null}
            height={320}
            tooltipFormatter={(value: number, name: string) => [formatNumber(value), name || ""]}
          />

          {/* Space Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Space Performance Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Space Performance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Space
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Impressions
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Earnings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {spacePerformance.map((space) => (
                      <tr key={space.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{space.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(space.impressions)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(space.clicks)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatSats(space.earnings)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Space Distribution Chart */}
            <PieChart
              title="Earnings Distribution"
              subtitle="By space"
              data={spacePerformance.map((space, index) => ({
                name: space.name,
                value: space.earnings,
                color: index === 0 ? '#0088FE' : 
                      index === 1 ? '#00C49F' : 
                      index === 2 ? '#FFBB28' : '#FF8042'
              }))}
              loading={loading}
              error={null}
              tooltipFormatter={(value, name) => [formatSats(value), name || ""]}
              labelLine={true}
              height={300}
            />
          </div>
          
          {/* Earnings Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Daily Earnings</h2>
            </div>
            <div className="p-6">
              <BarChart
                title=""
                subtitle=""
                data={publisherDailyData}
                dataKeys={[
                  { key: 'earnings', name: 'Earnings (sats)', color: '#8884d8' }
                ]}
                xAxisDataKey="date"
                loading={loading}
                error={null}
                height={300}
                tooltipFormatter={(value, name) => [formatSats(value), name || ""]}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Admin/Stakeholder analytics dashboard
const StakeholderAnalyticsDashboard = ({ dateRange, loading }: { dateRange: string, loading: boolean }) => {
  // Mock platform analytics data
  const platformSummary = {
    totalUsers: 1250,
    activeAdvertisers: 168,
    activePublishers: 312,
    totalImpressions: 2450000,
    totalClicks: 98000,
    totalRevenue: 4900000,
    averageConversion: 4.0,
  };

  // Monthly growth data
  const monthlyGrowth: PlatformMetrics[] = [
    { month: 'Jan', advertisers: 32, publishers: 45, impressions: 14500, clicks: 870, revenue: 2755 },
    { month: 'Feb', advertisers: 34, publishers: 48, impressions: 15800, clicks: 948, revenue: 3002 },
    { month: 'Mar', advertisers: 37, publishers: 53, impressions: 17900, clicks: 1074, revenue: 3401 },
    { month: 'Apr', advertisers: 39, publishers: 56, impressions: 19200, clicks: 1152, revenue: 3648 },
    { month: 'May', advertisers: 42, publishers: 60, impressions: 21500, clicks: 1290, revenue: 4085 },
    { month: 'Jun', advertisers: 48, publishers: 68, impressions: 23800, clicks: 1428, revenue: 4522 },
  ];

  return (
    <>
      {loading ? (
        <div className="py-12 text-center">
          <Zap className="inline-block w-10 h-10 text-gray-400 animate-pulse mb-2" />
          <p className="text-gray-500 dark:text-gray-400">Loading platform analytics...</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Platform Overview</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Summary of all platform activity and performance metrics
            </p>
          </div>

          {/* Platform Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Users</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(platformSummary.totalUsers)}
              </div>
              <div className="mt-2 flex items-center text-sm text-green-500">
                <ArrowUp className="w-3 h-3 mr-1" />
                12.5% from last month
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Active Advertisers</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(platformSummary.activeAdvertisers)}
              </div>
              <div className="mt-2 flex items-center text-sm text-green-500">
                <ArrowUp className="w-3 h-3 mr-1" />
                14.3% from last month
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Active Publishers</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(platformSummary.activePublishers)}
              </div>
              <div className="mt-2 flex items-center text-sm text-green-500">
                <ArrowUp className="w-3 h-3 mr-1" />
                13.3% from last month
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Revenue</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatSats(platformSummary.totalRevenue)}
              </div>
              <div className="mt-2 flex items-center text-sm text-green-500">
                <ArrowUp className="w-3 h-3 mr-1" />
                10.7% from last month
              </div>
            </div>
          </div>

          {/* Platform Performance Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly User Growth</h3>
              <LineChart
                title=""
                subtitle=""
                data={monthlyGrowth}
                dataKeys={[
                  { key: 'advertisers', name: 'Advertisers', color: '#8884d8' },
                  { key: 'publishers', name: 'Publishers', color: '#82ca9d' }
                ]}
                xAxisDataKey="month"
                loading={loading}
                error={null}
                height={300}
                tooltipFormatter={(value: number) => [formatNumber(value), '']}
              />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
              <BarChart
                title=""
                subtitle=""
                data={monthlyGrowth}
                dataKeys={[
                  { key: 'revenue', name: 'Revenue (k sats)', color: '#ff7300' }
                ]}
                xAxisDataKey="month"
                loading={loading}
                error={null}
                height={300}
                tooltipFormatter={(value: number) => [formatSats(value), '']}
              />
            </div>
          </div>

          {/* Additional Platform Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Impression Growth</h3>
              <LineChart
                title=""
                subtitle=""
                data={monthlyGrowth}
                dataKeys={[
                  { key: 'impressions', name: 'Impressions', color: '#0088FE' }
                ]}
                xAxisDataKey="month"
                loading={loading}
                error={null}
                height={300}
                tooltipFormatter={(value: number) => [formatNumber(value), '']}
              />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Distribution</h3>
              <PieChart
                title=""
                subtitle=""
                data={[
                  { name: 'Platform Fees', value: 490000, color: '#0088FE' },
                  { name: 'Publisher Payouts', value: 4410000, color: '#00C49F' }
                ]}
                loading={loading}
                error={null}
                tooltipFormatter={(value: number, name: string) => [formatSats(value), name || ""]}
                labelLine={true}
                height={300}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Set the layout for this page
AnalyticsPage.getLayout = function getLayout(page: React.ReactElement) {
  return getDashboardLayout(page, 'Analytics');
};

export default AnalyticsPage;