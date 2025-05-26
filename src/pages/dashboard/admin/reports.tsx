import { UserRole } from "@/types/role";
import React, { useState, useEffect } from 'react';
import { PieChart, Calendar, Download, RefreshCw, Filter } from 'react-feather';
import { getEnhancedDashboardLayout } from '@/components/layout/EnhancedDashboardLayout';
import { DashboardContainer } from '@/components/ui';
import { DashboardCard } from '@/components/ui/DashboardCard';
import CurrencyAmount from '@/components/CurrencyAmount';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../../_app';

// Import chart components
import { Line, Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';

// Register the chart components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

/**
 * Admin Reports Page
 * 
 * This page provides comprehensive reports and statistics about the platform's
 * performance, user growth, ad impressions, clicks, and revenue.
 */
const ReportsPage: NextPageWithLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [reportData, setReportData] = useState<any>(null);

  // Fetch reports data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        // In a real implementation, this would be an API call with the dateRange parameter
        // Simulating API delay
        setTimeout(() => {
          // Sample data for demonstration
          const mockData = {
            overview: {
              totalUsers: 1254,
              activePublishers: 382,
              activeAdvertisers: 175,
              totalSpaces: 512,
              totalAds: 843,
              revenueToday: 256000,
              revenueWeek: 1820000,
              revenueMonth: 7650000,
              impressions: 2450000,
              clicks: 76500,
              ctr: 3.12,
              conversionRate: 2.35
            },
            revenueData: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              datasets: [
                {
                  label: 'Platform Revenue',
                  data: [1200000, 1350000, 1800000, 2200000, 2600000, 3100000, 3400000, 4100000, 5300000, 6200000, 7000000, 7650000],
                  borderColor: 'rgb(99, 102, 241)',
                  backgroundColor: 'rgba(99, 102, 241, 0.5)',
                  tension: 0.3
                }
              ]
            },
            growthData: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              datasets: [
                {
                  label: 'New Users',
                  data: [45, 72, 86, 120, 142, 168, 190, 210, 245, 290, 320, 356],
                  backgroundColor: 'rgba(34, 197, 94, 0.6)',
                  borderColor: 'rgb(34, 197, 94)',
                  borderWidth: 1
                }
              ]
            },
            userDistribution: {
              labels: ['Publishers', 'Advertisers', 'Regular Users', 'Stakeholders', 'Admins'],
              datasets: [
                {
                  data: [382, 175, 685, 8, 4],
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.6)',
                    'rgba(99, 102, 241, 0.6)',
                    'rgba(234, 179, 8, 0.6)',
                    'rgba(249, 115, 22, 0.6)',
                    'rgba(239, 68, 68, 0.6)',
                  ],
                  borderWidth: 1
                }
              ]
            },
            topPerformers: {
              publishers: [
                { id: 'pub1', name: 'Bitcoin Magazine', earnings: 756000, impressions: 320000, clicks: 18500 },
                { id: 'pub2', name: 'Lightning News', earnings: 650000, impressions: 280000, clicks: 15800 },
                { id: 'pub3', name: 'Crypto Daily', earnings: 435000, impressions: 198000, clicks: 11200 },
                { id: 'pub4', name: 'Satoshi Review', earnings: 385000, impressions: 176000, clicks: 9800 },
                { id: 'pub5', name: 'Bitcoin Hub', earnings: 312000, impressions: 142000, clicks: 7900 },
              ],
              advertisers: [
                { id: 'adv1', name: 'Bitcoin Academy', spent: 820000, impressions: 360000, clicks: 21200 },
                { id: 'adv2', name: 'Lightning Labs', spent: 715000, impressions: 310000, clicks: 18500 },
                { id: 'adv3', name: 'SecureCoin', spent: 580000, impressions: 254000, clicks: 14800 },
                { id: 'adv4', name: 'CryptoTax Pro', spent: 480000, impressions: 225000, clicks: 12600 },
                { id: 'adv5', name: 'Crypto Insights', spent: 395000, impressions: 180000, clicks: 10200 },
              ],
              ads: [
                { id: 'ad1', title: 'Lightning Network Payments Solution', impressions: 165000, clicks: 11800, ctr: 7.15 },
                { id: 'ad2', title: 'Secure Bitcoin Hardware Wallet', impressions: 142000, clicks: 9600, ctr: 6.76 },
                { id: 'ad3', title: 'Bitcoin for Beginners Workshop', impressions: 118000, clicks: 7900, ctr: 6.69 },
                { id: 'ad4', title: 'Premium Bitcoin Market Analysis', impressions: 98000, clicks: 6200, ctr: 6.33 },
                { id: 'ad5', title: 'Bitcoin Tax Software - 50% Off', impressions: 82000, clicks: 4800, ctr: 5.85 },
              ],
            }
          };
          
          setReportData(mockData);
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.log('Error fetching report data:', error);
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [dateRange]);

  // Format number with abbreviations (K, M, B)
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Refresh reports
  const handleRefresh = () => {
    setIsLoading(true);
    // In a real implementation, this would trigger a new API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Export report data
  const handleExport = () => {
    // In a real implementation, this would generate and download a CSV/Excel file
    alert('Report exported logfully (demo functionality)');
  };

  return (
    <DashboardContainer>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <PieChart className="h-6 w-6 mr-2" />
            Platform Reports
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none w-full sm:w-auto"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="year">Last 12 months</option>
                <option value="all">All time</option>
              </select>
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <button 
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors"
              onClick={handleExport}
            >
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard title="Total Users" value={formatNumber(reportData.overview.totalUsers)} trend="+12.5%">
                <div className="h-10"></div>
              </DashboardCard>
              <DashboardCard title="Active Publishers" value={formatNumber(reportData.overview.activePublishers)} trend="+8.3%">
                <div className="h-10"></div>
              </DashboardCard>
              <DashboardCard title="Active Advertisers" value={formatNumber(reportData.overview.activeAdvertisers)} trend="+15.2%">
                <div className="h-10"></div>
              </DashboardCard>
              <DashboardCard title="Total Ad Spaces" value={formatNumber(reportData.overview.totalSpaces)} trend="+10.1%">
                <div className="h-10"></div>
              </DashboardCard>
            </div>
            
            {/* Revenue metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DashboardCard 
                title="Revenue Today" 
                value={<CurrencyAmount amount={reportData.overview.revenueToday} />} 
                trend="+5.2%"
              >
                <div className="h-10"></div>
              </DashboardCard>
              <DashboardCard 
                title="Revenue This Week" 
                value={<CurrencyAmount amount={reportData.overview.revenueWeek} />} 
                trend="+7.8%"
              >
                <div className="h-10"></div>
              </DashboardCard>
              <DashboardCard 
                title="Revenue This Month" 
                value={<CurrencyAmount amount={reportData.overview.revenueMonth} />} 
                trend="+18.3%"
              >
                <div className="h-10"></div>
              </DashboardCard>
            </div>
            
            {/* Performance metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DashboardCard 
                title="Total Impressions" 
                value={formatNumber(reportData.overview.impressions)} 
                trend="+22.5%"
              >
                <div className="h-10"></div>
              </DashboardCard>
              <DashboardCard 
                title="Total Clicks" 
                value={formatNumber(reportData.overview.clicks)} 
                trend="+19.2%"
              >
                <div className="h-10"></div>
              </DashboardCard>
              <DashboardCard 
                title="Average CTR" 
                value={`${reportData.overview.ctr}%`} 
                trend="-0.3%" 
                trendDirection="down"
              >
                <div className="h-10"></div>
              </DashboardCard>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Revenue chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Growth</h3>
                <div className="h-80">
                  <Line 
                    data={reportData.revenueData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              let value = context.raw as number;
                              return 'Revenue: ₿' + (value / 100000).toFixed(5);
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          ticks: {
                            callback: function(value) {
                              return '₿' + (Number(value) / 100000).toFixed(5);
                            }
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </div>
              
              {/* User growth chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth</h3>
                <div className="h-80">
                  <Bar 
                    data={reportData.growthData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User distribution chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Distribution</h3>
                <div className="h-64 flex items-center justify-center">
                  <Pie 
                    data={reportData.userDistribution} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        }
                      }
                    }} 
                  />
                </div>
              </div>
              
              {/* Top publishers */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Publishers</h3>
                <div className="overflow-auto max-h-64">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Publisher</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {reportData.topPerformers.publishers.map((publisher: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {publisher.name}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                            <CurrencyAmount amount={publisher.earnings} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Top advertisers */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Advertisers</h3>
                <div className="overflow-auto max-h-64">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Advertiser</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {reportData.topPerformers.advertisers.map((advertiser: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {advertiser.name}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                            <CurrencyAmount amount={advertiser.spent} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Top performing ads */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-700 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Ads</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ad Title</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Impressions</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clicks</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.topPerformers.ads.map((ad: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {ad.title}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                          {formatNumber(ad.impressions)}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                          {formatNumber(ad.clicks)}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                          {ad.ctr}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">No report data available</p>
          </div>
        )}
      </div>
    </DashboardContainer>
  );
};

ReportsPage.getLayout = getEnhancedDashboardLayout;

export default ReportsPage;