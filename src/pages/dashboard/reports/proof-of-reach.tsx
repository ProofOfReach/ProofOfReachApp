import React, { useState } from 'react';
import { getSimplifiedDashboardLayout } from '@/components/layout/SimplifiedDashboardLayout';
import type { NextPageWithLayout } from '../../_app';
import { DashboardCard } from '@/components/ui';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import {
  ArrowUpRight,
  Shield,
  User,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
} from 'react-feather';
import Link from 'next/link';
import { BarChart } from '@/components/charts';
import { PieChart } from '@/components/charts';
import Tooltip from '@/components/ui/Tooltip';

/**
 * Proof of Reach Report Page
 * 
 * A human-verified ad performance dashboard that shows verified real users,
 * not bots or clickfarms, using Lightning Network and Nostr protocol.
 */
const ProofOfReachPage: NextPageWithLayout = () => {
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [comparisonView, setComparisonView] = useState(false);
  
  // Mock data for demonstration
  const reachData = {
    uniqueNostrUsers: 4823,
    verifiedHumans: 1200,
    verifiedViews: 5840,
    cpvh: 0.024,
    totalSpend: 28.40,
    suspiciousFiltered: 1900,
    verifiedHumansChange: 15,
    verifiedViewsChange: 12,
    cpvhChange: -8,
    totalSpendChange: 5,
    geographyData: [
      { name: 'United States', value: 45, color: '#9333ea' },
      { name: 'Europe', value: 28, color: '#a855f7' },
      { name: 'Asia', value: 15, color: '#c084fc' },
      { name: 'Other', value: 12, color: '#d8b4fe' },
    ],
    deviceData: [
      { name: 'Mobile', value: 62, color: '#6366f1' },
      { name: 'Desktop', value: 32, color: '#818cf8' },
      { name: 'Tablet', value: 6, color: '#a5b4fc' },
    ],
    timeData: [
      { name: '12am', traditional: 240, verified: 120 },
      { name: '4am', traditional: 300, verified: 150 },
      { name: '8am', traditional: 620, verified: 410 },
      { name: '12pm', traditional: 940, verified: 680 },
      { name: '4pm', traditional: 1200, verified: 850 },
      { name: '8pm', traditional: 860, verified: 620 },
    ],
    traditionalMetrics: {
      impressions: 10000,
      clicks: 2000,
      ctr: 20.0,
    }
  };
  
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Proof of Reach Report</h1>
        
        <div className="flex items-center space-x-2">
          <select 
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            <option value="all">All Campaigns</option>
            <option value="summer_promo">Summer Promotion</option>
            <option value="product_launch">Product Launch</option>
          </select>
          
          <select 
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <Button
            onClick={() => setComparisonView(!comparisonView)}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            {comparisonView ? 'Hide' : 'Show'} Comparison 
            {comparisonView ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Verified Humans"
          value={reachData.verifiedHumans.toLocaleString()}
          trend={`${reachData.verifiedHumansChange > 0 ? '+' : ''}${reachData.verifiedHumansChange}%`}
          trendDirection={reachData.verifiedHumansChange > 0 ? 'up' : 'down'}
          icon={<User className="text-indigo-600 dark:text-indigo-400" size={20} />}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Unique humans verified by Lightning Network micropayments.
          </p>
        </DashboardCard>
        
        <DashboardCard
          title="Verified Views"
          value={reachData.verifiedViews.toLocaleString()}
          trend={`${reachData.verifiedViewsChange > 0 ? '+' : ''}${reachData.verifiedViewsChange}%`}
          trendDirection={reachData.verifiedViewsChange > 0 ? 'up' : 'down'}
          icon={<Shield className="text-green-600 dark:text-green-400" size={20} />}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Ad impressions from verified human viewers.
          </p>
        </DashboardCard>
        
        <DashboardCard
          title="Cost Per Verified Human"
          value={`$${reachData.cpvh.toFixed(3)}`}
          trend={`${reachData.cpvhChange > 0 ? '+' : ''}${reachData.cpvhChange}%`}
          trendDirection={reachData.cpvhChange > 0 ? 'down' : 'up'}
          icon={<Info className="text-blue-600 dark:text-blue-400" size={20} />}
        >
          <div className="flex items-center mt-2">
            <Tooltip text="Cost per verified human is our key performance metric, showing how much you pay to reach one real human being.">
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <span className="mr-1">CPVH</span>
                <Info size={14} />
              </div>
            </Tooltip>
          </div>
        </DashboardCard>
        
        <DashboardCard
          title="Total Spend"
          value={`$${reachData.totalSpend.toFixed(2)}`}
          trend={`${reachData.totalSpendChange > 0 ? '+' : ''}${reachData.totalSpendChange}%`}
          trendDirection={reachData.totalSpendChange > 0 ? 'neutral' : 'neutral'}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Total campaign spending.
          </p>
        </DashboardCard>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardCard title="Human Verification Stats">
          <div className="flex items-center justify-between px-2 py-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Unique Nostr Users</p>
              <p className="text-2xl font-semibold mt-1">{reachData.uniqueNostrUsers.toLocaleString()}</p>
              <Badge type="default" className="mt-2">100% Real People</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lightning Verified</p>
              <p className="text-2xl font-semibold mt-1">{reachData.verifiedHumans.toLocaleString()}</p>
              <Badge type="primary" className="mt-2">
                <Check size={12} className="mr-1" /> 
                Proof of Humanity
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspicious Filtered</p>
              <p className="text-2xl font-semibold mt-1">{reachData.suspiciousFiltered.toLocaleString()}</p>
              <Badge type="warning" className="mt-2">
                <AlertTriangle size={12} className="mr-1" />
                Prevented
              </Badge>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard title="Performance Comparison">
          <div className="flex items-center justify-around py-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Traditional</p>
              <p className="text-3xl font-semibold mt-1">{reachData.traditionalMetrics.impressions.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Claimed impressions</p>
            </div>
            
            <div className="h-16 border-r border-gray-300 dark:border-gray-700"></div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Proof of Reach</p>
              <p className="text-3xl font-semibold mt-1">{reachData.verifiedViews.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Verified impressions</p>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-2 pt-4 px-2">
            <div className="text-sm">
              <span className="font-medium">Difference: </span>
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                {((reachData.verifiedViews / reachData.traditionalMetrics.impressions) * 100).toFixed(1)}% verification rate
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              This shows how many traditional ad impressions were actually verified as real humans.
            </p>
          </div>
        </DashboardCard>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard title="Geography Distribution">
          <div className="h-64">
            <PieChart
              data={reachData.geographyData}
              title="Geography Distribution"
              loading={false}
            />
          </div>
        </DashboardCard>
        
        <DashboardCard title="Device Distribution">
          <div className="h-64">
            <PieChart
              data={reachData.deviceData}
              title="Device Distribution"
              loading={false}
            />
          </div>
        </DashboardCard>
        
        <DashboardCard title="Time Distribution">
          <div className="h-64">
            <BarChart
              data={reachData.timeData}
              title="Time Distribution"
              xAxisDataKey="name"
              dataKeys={[
                { key: 'verified', name: 'Verified', color: '#8b5cf6' },
                { key: 'traditional', name: 'Traditional', color: '#d8b4fe' }
              ]}
              loading={false}
            />
          </div>
        </DashboardCard>
      </div>
      
      <DashboardCard title="Verification Process">
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">How Human Verification Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-4">
                <User size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium mb-2">Nostr Identity</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Users authenticate with their Nostr keys, establishing base identity.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full mb-4">
                <Shield size={24} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <h4 className="font-medium mb-2">Lightning Verification</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Micropayments via Lightning Network verify human control of wallets.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-4">
                <Check size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium mb-2">Proof of Reach</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Combined verification creates tamper-proof evidence of human engagement.
              </p>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

ProofOfReachPage.getLayout = getSimplifiedDashboardLayout;

export default ProofOfReachPage;