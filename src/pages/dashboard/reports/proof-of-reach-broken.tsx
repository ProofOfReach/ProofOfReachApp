import { UserRole } from "@/types/role";
import React, { useState } from 'react';
import ImprovedDashboardLayout from '@/components/layout/ImprovedDashboardLayout';
import {
  Shield,
  User,
  AlertTriangle,
  Info,
  Check,
  BarChart2, 
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Zap,
  Calendar,
  Download,
  HelpCircle
} from 'react-feather';
import '@/components/charts';
import '@/components/charts';

/**
 * Proof of Reach Report Page
 * 
 * A human-verified ad performance dashboard that shows verified real users,
 * not bots or clickfarms, using Lightning Network and Nostr protocol.
 */
const ProofOfReachPage = () => {
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data for demonstration
  const reachData = {
    uniqueNostrUsers: 4823,
    verifiedHumans: 1200,
    verifiedViews: 5840,
    wotLevel: 3,
    wotMaxLevel: 5,
    wotFollowers: 532,
    cpvh: 0.024,
    totalSpend: 28.40,
    suspiciousFiltered: 1900,
    verifiedHumansChange: 15,
    verifiedViewsChange: 12,
    cpvhChange: -8,
    totalSpendChange: 5,
    verificationRate: 58.4,
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
  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 mt-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard
                title="Verified Humans"
                value={reachData.verifiedHumans.toLocaleString()}
                trend={`${reachData.verifiedHumansChange > 0 ? '+' : ''}${reachData.verifiedHumansChange}%`}
                trendDirection={reachData.verifiedHumansChange > 0 ? 'up' : 'down'}
                icon={<User className="text-purple-600 dark:text-purple-400" size={20} />}
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
                trendDirection={reachData.cpvhChange < 0 ? 'down' : 'up'}
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
                icon={<BarChart2 className="text-orange-600 dark:text-orange-400" size={20} />}
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Total campaign spending for this period.
                </p>
              </DashboardCard>
            </div>
            
            {/* Verification Comparison */}
            <DashboardCard title="Traditional vs. Verified Comparison">
              <div className="p-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Traditional Impressions</p>
                        <p className="text-3xl font-semibold mt-1">{reachData.traditionalMetrics.impressions.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Verified Impressions</p>
                        <p className="text-3xl font-semibold mt-1 text-purple-600 dark:text-purple-400">{reachData.verifiedViews.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Verification Rate</span>
                        <span className="font-medium">{reachData.verificationRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full" 
                          style={{ width: `${reachData.verificationRate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <Tooltip text="Verification rate shows what percentage of traditional ad impressions were actually verified as real humans through our Lightning Network verification process. Higher is better.">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <HelpCircle size={14} className="mr-1" />
                          What does this mean?
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  
                  {/* Verification Time Chart */}
                  <div>
                    <div className="h-64">
                      <BarChart
                        data={reachData.timeData}
                        title=""
                        xAxisDataKey="name"
                        dataKeys={[
                          { key: 'verified', name: 'Verified', color: '#8b5cf6' },
                          { key: 'traditional', name: 'Traditional', color: '#d8b4fe' }
                        ]}
                        loading={false}
                      />
                    </div>
                    <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">
                      Hourly distribution of traditional vs. verified views
                    </p>
                  </div>
                </div>
              </div>
            </DashboardCard>
            
            {/* Anti-Fraud Protection */}
            <DashboardCard title="Anti-Fraud Protection">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-4">How Your Campaigns Are Protected</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="mb-2 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <User size={24} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm font-medium text-center">Total Unique Nostr Users</p>
                    <p className="text-2xl font-bold mt-1">{reachData.uniqueNostrUsers.toLocaleString()}</p>
                    <Badge type="default" className="mt-2">100% Real People</Badge>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="mb-2 p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Shield size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex items-center mb-1">
                      <p className="text-sm font-medium text-center">Lightning Verified</p>
                      <div className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded">
                        WOT Level {reachData.wotLevel}/{reachData.wotMaxLevel}
                      </div>
                    </div>
                    <p className="text-2xl font-bold mt-1">{reachData.verifiedHumans.toLocaleString()}</p>
                    <Badge type="primary" className="mt-2 flex items-center">
                      <Check size={12} className="mr-1" /> 
                      Proof of Humanity
                    </Badge>
                    <Tooltip text={`Web of Trust (WOT) Level ${reachData.wotLevel} indicates that these accounts are followed by at least ${reachData.wotFollowers} verified users, providing a strong trust signal within the Nostr network.`}>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <HelpCircle size={12} className="mr-1" />
                        What is WOT Level?
                      </div>
                    </Tooltip>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="mb-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                      <AlertTriangle size={24} className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <p className="text-sm font-medium text-center">Suspicious Filtered</p>
                    <p className="text-2xl font-bold mt-1">{reachData.suspiciousFiltered.toLocaleString()}</p>
                    <Badge type="warn" className="mt-2 flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      Prevented
                    </Badge>
                    <Tooltip text="Traffic filtered due to: unusual activity patterns, rapid IP changes, automated behavior signatures, missing cryptographic proof of identity, or failing Nostr verification checks.">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <HelpCircle size={12} className="mr-1" />
                        Why filtered?
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        );
        
      case 'audience':
        return (
          <div className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <DashboardCard title="Geographic Distribution">
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <Globe size={18} className="mr-2 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-lg font-medium">Where Your Audience Is Located</h3>
                  </div>
                  <div className="h-[300px]">
                    <PieChart
                      data={reachData.geographyData}
                      title=""
                      loading={false}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {reachData.geographyData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm">{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </DashboardCard>
              
              <DashboardCard title="Device Distribution">
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <Monitor size={18} className="mr-2 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-medium">Devices Used</h3>
                  </div>
                  <div className="h-[300px]">
                    <PieChart
                      data={reachData.deviceData}
                      title=""
                      loading={false}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Smartphone size={16} className="mb-1 text-blue-500" />
                      <p className="text-lg font-bold">{reachData.deviceData[0].value}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Mobile</p>
                    </div>
                    
                    <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Monitor size={16} className="mb-1 text-blue-500" />
                      <p className="text-lg font-bold">{reachData.deviceData[1].value}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Desktop</p>
                    </div>
                    
                    <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Smartphone size={16} className="mb-1 text-blue-500" />
                      <p className="text-lg font-bold">{reachData.deviceData[2].value}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tablet</p>
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </div>
            
            <DashboardCard title="Time Distribution">
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <Clock size={18} className="mr-2 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-medium">When Your Audience Is Most Active</h3>
                </div>
                <div className="h-[300px]">
                  <BarChart
                    data={reachData.timeData}
                    title=""
                    xAxisDataKey="name"
                    dataKeys={[
                      { key: 'verified', name: 'Verified Views', color: '#8b5cf6' },
                      { key: 'traditional', name: 'Traditional Views', color: '#d8b4fe' }
                    ]}
                    loading={false}
                  />
                </div>
                <div className="mt-4 flex justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
                    <span className="text-sm">Verified Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#d8b4fe]"></div>
                    <span className="text-sm">Traditional Views</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Peak activity occurs between 12PM and 4PM, with verified views closely tracking traditional view patterns.
                </p>
              </div>
            </DashboardCard>
          </div>
        );
        
      case 'verification':
        return (
          <div className="space-y-6 mt-6">
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
                      Users authenticate with their Nostr keys, establishing base identity verification. This ensures all users are real people with cryptographic identities.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full mb-4">
                      <Zap size={24} className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h4 className="font-medium mb-2">Lightning Verification</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Micropayments via Lightning Network verify human control of wallets. This is an economic proof that filters out bots and automated traffic.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-4">
                      <Check size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-medium mb-2">Proof of Reach</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Combined verification creates tamper-proof evidence of human engagement, providing cryptographic certainty that real people viewed your ads.
                    </p>
                  </div>
                </div>
              </div>
            </DashboardCard>
            
            <DashboardCard title="Verification Statistics">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Verification Rate</span>
                      <span>{reachData.verificationRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full" 
                        style={{ width: `${reachData.verificationRate}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Percentage of traditional impressions verified as real humans
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Bot Detection Rate</span>
                      <span>
                        {((reachData.suspiciousFiltered / (reachData.suspiciousFiltered + reachData.verifiedViews)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-500 dark:bg-yellow-400 h-2.5 rounded-full" 
                        style={{ width: `${((reachData.suspiciousFiltered / (reachData.suspiciousFiltered + reachData.verifiedViews)) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Suspicious traffic filtered out of total traffic
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Lightning Wallet Integration</span>
                      <span>
                        {((reachData.verifiedHumans / reachData.uniqueNostrUsers) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-500 dark:bg-blue-400 h-2.5 rounded-full" 
                        style={{ width: `${((reachData.verifiedHumans / reachData.uniqueNostrUsers) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Percentage of Nostr users with verified Lightning wallets
                    </p>
                  </div>
                </div>
              </div>
            </DashboardCard>
            
            <DashboardCard title="Benefits of Proof of Reach">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-4">Why Verification Matters</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <Check size={16} className="text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Eliminate Ad Fraud</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cryptographic proof ensures you only pay for real human views, not bots or click farms.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <Check size={16} className="text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Improve ROI</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Focus your budget on verified humans, dramatically increasing campaign effectiveness.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <Check size={16} className="text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Transparent Reporting</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          All metrics are backed by verifiable blockchain data that you can audit.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <Check size={16} className="text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Accurate Audience Insights</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Demographic data is based on real users, not fabricated profiles.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <Check size={16} className="text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Direct Publisher Support</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Micropayments directly support content creators without middlemen.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <Check size={16} className="text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Privacy-Preserving</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get detailed analytics without compromising user privacy.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Learn More About Proof of Reach
                  </button>
                </div>
              </div>
            </DashboardCard>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Report Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Proof of Reach Report</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Human-verified ad performance metrics powered by Nostr and Lightning Network
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
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
            
            <Button variant="outline" className="flex items-center gap-1">
              <Download size={16} />
              Export
            </Button>
          </div>
        </div>
        
        <DashboardCard>
          <div className="p-4">
            <div className="flex flex-wrap gap-4 md:gap-8 justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm">
                  {dateRange === '7d' ? 'May 14 - May 21, 2025' : 
                   dateRange === '30d' ? 'Apr 21 - May 21, 2025' : 
                   'Feb 20 - May 21, 2025'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                <span className="text-sm">
                  {selectedCampaign === 'all' ? 'All campaigns' : 
                   selectedCampaign === 'summer_promo' ? 'Summer Promotion' : 
                   'Product Launch'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-purple-500" />
                <span className="text-sm">Proof of Reach enabled</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-yellow-500" />
                <span className="text-sm">Lightning verified</span>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
      
      {/* Tab Navigation */}
      <Tabs className="mb-0">
        <Tab 
          isActive={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Tab>
        <Tab 
          isActive={activeTab === 'audience'}
          onClick={() => setActiveTab('audience')}
        >
          Audience
        </Tab>
        <Tab 
          isActive={activeTab === 'verification'}
          onClick={() => setActiveTab('verification')}
        >
          Verification
        </Tab>
      </Tabs>
      
      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

const ProofOfReachWithLayout = () => {
  return (
    <ImprovedDashboardLayout title="Proof of Reach Report">
      <ProofOfReachPage />
    </ImprovedDashboardLayout>
  );
};

export default ProofOfReachWithLayout;