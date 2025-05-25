import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Play, Pause, Edit, Trash2, TrendingUp, Users, MousePointer, DollarSign } from 'react-feather';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { formatNumber } from '@/lib/utils';

interface CampaignDetails {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget: number;
  spent: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  targetAudience: string[];
  createdAt: string;
  updatedAt: string;
}

interface CampaignMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  averageCPC: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
  reachUsers: number;
}

interface DailyPerformance {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}

export default function CampaignDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [dailyData, setDailyData] = useState<DailyPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Simulate loading campaign data
    const loadCampaignData = async () => {
      try {
        setLoading(true);
        
        // Mock data - in a real app this would come from your API
        const mockCampaign: CampaignDetails = {
          id: id as string,
          name: `Campaign ${id}`,
          description: 'High-performance advertising campaign targeting crypto enthusiasts and tech professionals.',
          status: 'active',
          budget: 50000,
          spent: 12750,
          dailyBudget: 2000,
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          targetAudience: ['crypto', 'technology', 'finance', 'developers'],
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-20T12:00:00Z'
        };

        const mockMetrics: CampaignMetrics = {
          totalImpressions: 125000,
          totalClicks: 3750,
          totalSpend: 12750,
          averageCPC: 3.4,
          ctr: 3.0,
          conversions: 187,
          conversionRate: 4.99,
          reachUsers: 89500
        };

        const mockDailyData: DailyPerformance[] = [
          { date: '2024-01-15', impressions: 8500, clicks: 255, spend: 867, conversions: 12 },
          { date: '2024-01-16', impressions: 9200, clicks: 276, spend: 938, conversions: 14 },
          { date: '2024-01-17', impressions: 7800, clicks: 234, spend: 796, conversions: 11 },
          { date: '2024-01-18', impressions: 10500, clicks: 315, spend: 1071, conversions: 16 },
          { date: '2024-01-19', impressions: 9800, clicks: 294, spend: 999, conversions: 15 },
          { date: '2024-01-20', impressions: 11200, clicks: 336, spend: 1142, conversions: 18 },
          { date: '2024-01-21', impressions: 8900, clicks: 267, spend: 908, conversions: 13 }
        ];

        setCampaign(mockCampaign);
        setMetrics(mockMetrics);
        setDailyData(mockDailyData);
      } catch (err) {
        setError('Failed to load campaign details');
        console.error('Error loading campaign:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCampaignData();
  }, [id]);

  const handleStatusToggle = () => {
    if (!campaign) return;
    
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    setCampaign({ ...campaign, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign || !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error || 'Campaign not found'}
            </h1>
            <button
              onClick={() => router.push('/dashboard/analytics')}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← Back to Analytics
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/analytics')}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{campaign.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
            <button
              onClick={handleStatusToggle}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {campaign.status === 'active' ? 'Pause' : 'Resume'}
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Edit className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Impressions</div>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(metrics.totalImpressions)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              +12.5% vs last period
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clicks</div>
              <MousePointer className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(metrics.totalClicks)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              CTR: {metrics.ctr.toFixed(2)}%
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spend</div>
              <DollarSign className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(metrics.totalSpend)} sats
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Avg CPC: {metrics.averageCPC} sats
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversions</div>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(metrics.conversions)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              Rate: {metrics.conversionRate.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="mb-8">
          <LineChart
            title="Daily Performance"
            data={dailyData}
            dataKeys={[
              { key: 'impressions', name: 'Impressions', color: '#0088FE' },
              { key: 'clicks', name: 'Clicks', color: '#00C49F' },
              { key: 'spend', name: 'Spend (sats)', color: '#FFBB28' }
            ]}
            xAxisDataKey="date"
            loading={false}
            error={null}
            height={400}
            tooltipFormatter={(value: number, name: string) => [formatNumber(value), name]}
          />
        </div>

        {/* Campaign Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Info */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Campaign Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Total Budget
                  </label>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(campaign.budget)} sats
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Daily Budget
                  </label>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(campaign.dailyBudget)} sats
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Start Date
                  </label>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(campaign.startDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    End Date
                  </label>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(campaign.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Target Audience
                </label>
                <div className="flex flex-wrap gap-2">
                  {campaign.targetAudience.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Budget Progress */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Budget Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Spent</span>
                    <span>{formatNumber(campaign.spent)} sats</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {((campaign.spent / campaign.budget) * 100).toFixed(1)}% of total budget
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Remaining Budget</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(campaign.budget - campaign.spent)} sats
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}