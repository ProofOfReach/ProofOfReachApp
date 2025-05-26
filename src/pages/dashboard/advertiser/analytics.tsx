import { UserRole } from "@/types/role";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';
import { BarChart2, Calendar, Download, ArrowUp, ArrowDown, Eye, Zap, Target } from 'react-feather';
import '@/components/charts';
import { 
  fetchAdvertiserSummary, 
  fetchAdvertiserDailyMetrics,
  fetchCampaignPerformance,
  DailyMetrics
} from '@/services/analyticsService';
import '@/utils/chartHelpers';

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

const AdvertiserAnalyticsPage = () => {
  const role = "viewer"; // Simplified for build
  const router = useRouter();
  const { auth } = useAuth();
  const [dateRange, setDateRange] = useState<string>('last-7-days');
  const [loading, setLoading] = useState<boolean>(true);
  
  // State for API data
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [dailyMetricsData, setDailyMetricsData] = useState<DailyMetrics[]>([]);
  const [campaignData, setCampaignData] = useState<any[]>([]);
  const [chartError, setChartError] = useState<string | null>(null);
  
  // Date range calculation
  const getDateRange = () => {
    const today = new Date();
    
    if (dateRange === 'last-7-days') {
      const start = new Date(today);
      start.setDate(today.getDate() - 6); // Last 7 days (including today)
      return {
        start: start.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      };
    }
    
    // Default to last 30 days if unknown range
    const start = new Date(today);
    start.setDate(today.getDate() - 29); // Last 30 days (including today)
    return {
      start: start.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  };
  
  // Redirect if not in advertiser role
  useEffect(() => {
    if (role !== 'advertiser') {
      router.push(`/dashboard${role !== 'viewer' ? `/${role}` : ''}`);
    }
  }, [role, router]);

  // Fetch data from API
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setChartError(null);
      
      try {
        const range = getDateRange();
        
        // Fetch summary data
        const summary = await fetchAdvertiserSummary(undefined, range);
        setSummaryData(summary);
        
        // Fetch daily metrics
        const metrics = await fetchAdvertiserDailyMetrics(undefined, range);
        setDailyMetricsData(metrics);
        
        // Fetch campaign performance
        const campaigns = await fetchCampaignPerformance(undefined, range);
        setCampaignData(campaigns);
        
        setLoading(false);
      } catch (error) {
        console.log("Error fetching analytics data:", error);
        setChartError("Failed to load analytics data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [dateRange]);

  // Mock analytics data
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

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Format sats with correct units
  const formatSats = (sats: number) => {
    return `${formatNumber(sats)} sats`;
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ad Analytics</h1>
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
                {formatNumber(summaryData?.impressions || summary.impressions)}
              </div>
              {renderChangeIndicator(summaryData?.trends?.impressions || 5.2)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Clicks</div>
                <Eye className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(summaryData?.clicks || summary.clicks)}
              </div>
              {renderChangeIndicator(summaryData?.trends?.clicks || 8.7)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">CTR</div>
                <Target className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(summaryData?.ctr || summary.ctr).toFixed(2)}%
              </div>
              {renderChangeIndicator(summaryData?.trends?.ctr || 3.4)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spend</div>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatSats(summaryData?.spend || summary.spend)}
              </div>
              {renderChangeIndicator(summaryData?.trends?.spend || 11.2)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. CPC</div>
                <Zap className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryData?.averageCPC || summary.averageCPC} sats
              </div>
              {renderChangeIndicator(summaryData?.trends?.averageCPC || -2.5)}
            </div>
          </div>

          {/* Daily Performance Chart */}
          <LineChart
            title="Daily Performance"
            subtitle={`Data for ${dateRange === 'last-7-days' ? 'last 7 days' : 'selected period'}`}
            data={dailyMetricsData.length > 0 ? dailyMetricsData : dailyData}
            dataKeys={[
              { key: 'impressions', name: 'Impressions', color: '#0088FE' },
              { key: 'clicks', name: 'Clicks', color: '#00C49F' }
            ]}
            xAxisDataKey="date"
            loading={loading}
            error={chartError}
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
                    {(campaignData.length > 0 ? campaignData : campaignPerformance).map((campaign) => (
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
              data={(campaignData.length > 0 ? campaignData : campaignPerformance).slice(0, 4)}
              dataKeys={[
                { key: 'impressions', name: 'Impressions', color: '#0088FE' },
                { key: 'clicks', name: 'Clicks', color: '#00C49F' }
              ]}
              xAxisDataKey="name"
              loading={loading}
              error={chartError}
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
              data={(campaignData.length > 0 ? campaignData : campaignPerformance).map(campaign => ({
                name: campaign.name,
                value: campaign.spend,
                color: campaign.id === 'camp-1' ? '#FF8042' : 
                       campaign.id === 'camp-2' ? '#0088FE' : 
                       campaign.id === 'camp-3' ? '#00C49F' : '#FFBB28'
              }))}
              loading={loading}
              error={chartError}
              tooltipFormatter={(value, name) => [formatSats(value), name || ""]}
              labelLine={true}
              height={300}
            />
            
            {/* Budget Usage */}
            <BarChart
              title="Daily Spend"
              subtitle={`Last ${dateRange === 'last-7-days' ? '7' : '30'} days`}
              data={dailyMetricsData.length > 0 ? dailyMetricsData : dailyData}
              dataKeys={[
                { key: 'spend', name: 'Spend (sats)', color: '#FF8042' }
              ]}
              xAxisDataKey="date"
              loading={loading}
              error={chartError}
              height={300}
              tooltipFormatter={(value, name) => [formatSats(value), name || ""]}
            />
          </div>
        </>
      )}
    </div>
  );
};

// Wrap the page with our layout
AdvertiserAnalyticsPage.getLayout = (page: React.ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default AdvertiserAnalyticsPage;