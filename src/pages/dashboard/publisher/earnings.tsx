import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '@/components/layout/DashboardLayout';
import '@/context/RoleContext';
import '@/hooks/useAuth';
import { BarChart2, Calendar, Download, ArrowUp, ArrowDown, Eye, Zap, Target, DollarSign } from 'react-feather';
import '@/components/charts';
import '@/components/icons/SatsIcon';
import '@/components/CurrencyAmount';
import { 
  fetchPublisherEarnings,
  fetchAdSpacePerformance,
  DailyMetrics,
  AdSpacePerformance
} from '@/services/analyticsService';
import '@/utils/chartHelpers';

// Mock earnings data
interface EarningsSummary {
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate as a percentage
  earnings: number; // in sats
  adspaces: number; // number of active ad spaces
}

const PublisherEarningsPage = () => {
  const { role } = useRole();
  const router = useRouter();
  const { auth } = useAuth();
  const [dateRange, setDateRange] = useState<string>('last-7-days');
  const [loading, setLoading] = useState<boolean>(true);
  
  // State for API data
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [adSpacesData, setAdSpacesData] = useState<AdSpacePerformance[]>([]);
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
  
  // Redirect if not in publisher role
  useEffect(() => {
    if (role !== 'publisher') {
      router.push(`/dashboard${role !== 'viewer' ? `/${role}` : ''}`);
    }
  }, [role, router]);

  // Fetch data from API
  useEffect(() => {
    const fetchPublisherData = async () => {
      setLoading(true);
      setChartError(null);
      
      try {
        const range = getDateRange();
        
        // Fetch earnings data
        const earnings = await fetchPublisherEarnings(undefined, range);
        setEarningsData(earnings);
        
        // Fetch ad space performance data
        const adSpaces = await fetchAdSpacePerformance(range);
        setAdSpacesData(adSpaces);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching publisher analytics data:", error);
        setChartError("Failed to load earnings data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchPublisherData();
  }, [dateRange]);

  // Mock earnings data
  const summary: EarningsSummary = {
    impressions: 15230,
    clicks: 512,
    ctr: 3.36,
    earnings: 32550,
    adspaces: 2
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
          <SatsIcon className="h-8 w-8 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings Analytics</h1>
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
          <p className="text-gray-500 dark:text-gray-400">Loading earnings data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Earnings</div>
                <SatsIcon className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                <CurrencyAmount sats={summary.earnings} showTooltip={false} />
              </div>
              {renderChangeIndicator(7.8)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Ad Spaces</div>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.adspaces}
              </div>
              {renderChangeIndicator(0)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Impressions</div>
                <Eye className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(summary.impressions)}
              </div>
              {renderChangeIndicator(4.3)}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">CTR</div>
                <Target className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.ctr.toFixed(2)}%
              </div>
              {renderChangeIndicator(1.5)}
            </div>
          </div>

          {/* Daily Earnings Chart */}
          <LineChart
            title="Daily Earnings"
            subtitle={`Data for ${dateRange === 'last-7-days' ? 'last 7 days' : 'selected period'}`}
            data={earningsData}
            dataKeys={[
              { key: 'earnings', name: 'Earnings (sats)', color: '#10B981' }
            ]}
            xAxisDataKey="date"
            loading={loading}
            error={chartError}
            height={320}
            tooltipFormatter={(value: number, name: string) => {
              // For tooltips, we'll show the formatted sats value
              // The CurrencyAmount component handles display according to user preferences
              return [formatSats(value), name.replace(' (sats)', '')];
            }}
          />

          {/* Performance Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Metrics Over Time */}
            <LineChart
              title="Traffic Metrics"
              subtitle="Impressions and clicks"
              data={earningsData}
              dataKeys={[
                { key: 'impressions', name: 'Impressions', color: '#0088FE' },
                { key: 'clicks', name: 'Clicks', color: '#00C49F' }
              ]}
              xAxisDataKey="date"
              loading={loading}
              error={chartError}
              height={300}
              tooltipFormatter={(value: number, name: string) => {
                return [formatNumber(value), name];
              }}
            />
            
            {/* Ad Space Distribution */}
            <PieChart
              title="Earnings by Ad Space"
              subtitle="Distribution across your spaces"
              data={adSpacesData.map(space => ({
                name: space.name,
                value: space.earnings,
                color: space.id === 'adspace-1' ? '#00C49F' : 
                       space.id === 'adspace-2' ? '#0088FE' : 
                       space.id === 'adspace-3' ? '#FFBB28' : '#FF8042'
              }))}
              loading={loading}
              error={chartError}
              tooltipFormatter={(value, name) => {
                // For tooltips, we'll show the formatted sats value
                return [formatSats(value), name || ""];
              }}
              labelLine={true}
              height={300}
            />
          </div>
          
          {/* Ad Space Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Ad Space Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ad Space
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
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Earnings
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {adSpacesData.map((space) => (
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
                        <div className="text-sm text-gray-500 dark:text-gray-400">{space.ctr.toFixed(2)}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                          <CurrencyAmount sats={space.earnings} showTooltip={false} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Wrap the page with our layout
PublisherEarningsPage.getLayout = (page: React.ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default PublisherEarningsPage;