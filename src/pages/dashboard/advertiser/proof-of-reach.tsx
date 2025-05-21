import React, { useState } from 'react';
import { getDashboardLayout } from '@/utils/layoutHelpers';
import type { NextPageWithLayout } from '../../_app';
import DashboardCard from '@/components/ui/DashboardCard';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowUpRight, Shield, User, AlertTriangle, ChevronDown, ChevronUp, Info } from 'react-feather';
import Link from 'next/link';
import { BarChart, PieChart } from '@/components/charts';
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proof of Reach™ Report</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Human-verified ad performance metrics using Lightning Network
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select 
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            <option value="all">All Campaigns</option>
            <option value="lightning-wallet">Lightning Wallet Promo</option>
            <option value="hardware-wallet">Hardware Wallet Sale</option>
            <option value="bitcoin-conf">Bitcoin Conference</option>
          </select>
          
          <select
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="ytd">Year to date</option>
          </select>
        </div>
      </div>
      
      {/* Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Nostr Pubkeys Reached
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reachData.uniqueNostrUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Unique identifiable users who viewed your ad
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Humans via Lightning
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reachData.verifiedHumans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Users who performed Lightning-verified actions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Cost Per Verified Human
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[220px] text-xs">
                    CPVH: Total spend divided by number of verified human interactions via Lightning.
                    A more reliable metric than traditional CPM/CPC.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reachData.cpvh.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground">
              ${reachData.totalSpend.toFixed(2)} spent on {reachData.verifiedHumans.toLocaleString()} humans
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Bot Protection
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reachData.suspiciousFiltered.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Suspicious interactions filtered out
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Comparison Toggle */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => setComparisonView(!comparisonView)}
        >
          {comparisonView ? 'Hide Comparison' : 'Compare with Traditional Metrics'}
          {comparisonView ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Traditional vs ProofOfReach Comparison */}
      {comparisonView && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Traditional Metrics vs. ProofOfReach Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg border-orange-300 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Traditional Ad Platform</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Impressions</p>
                    <p className="text-xl font-bold">{reachData.traditionalMetrics.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clicks</p>
                    <p className="text-xl font-bold">{reachData.traditionalMetrics.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Click-through Rate</p>
                    <p className="text-xl font-bold">{reachData.traditionalMetrics.ctr.toFixed(1)}%</p>
                  </div>
                  <div className="pt-3">
                    <Badge variant="outline" className="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 border-orange-300 dark:border-orange-700">
                      Includes bot traffic
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg border-purple-300 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
                <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">ProofOfReach Verification</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Nostr Users</p>
                    <p className="text-xl font-bold">{reachData.uniqueNostrUsers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verified Human Actions</p>
                    <p className="text-xl font-bold">{reachData.verifiedHumans.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verification Rate</p>
                    <p className="text-xl font-bold">{((reachData.verifiedHumans / reachData.uniqueNostrUsers) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="pt-3">
                    <Badge variant="outline" className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 border-purple-300 dark:border-purple-700">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Lightning-verified humans
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Detailed Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <PieChart 
                data={reachData.geographyData}
                dataKey="value"
                nameKey="name"
                colors={['#9333ea', '#a855f7', '#c084fc', '#d8b4fe']}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <PieChart 
                data={reachData.deviceData}
                dataKey="value"
                nameKey="name"
                colors={['#6366f1', '#818cf8', '#a5b4fc']}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Time-based Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Time-based Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <BarChart 
              data={reachData.timeData}
              xAxisDataKey="name"
              bars={[
                { dataKey: 'traditional', name: 'Traditional Measurement', color: '#f97316' },
                { dataKey: 'verified', name: 'Lightning-verified', color: '#9333ea' }
              ]}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-2">
                Want to reach more verified humans?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Create a new campaign with Lightning verification to increase your reach to real humans and filter out bots.
              </p>
            </div>
            <div className="flex justify-start md:justify-end">
              <Link href="/dashboard/advertiser/campaigns/create">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Create New Campaign
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Apply dashboard layout
ProofOfReachPage.getLayout = getDashboardLayout;

export default ProofOfReachPage;