import React, { useState } from 'react';
import ImprovedDashboardLayout from '@/components/layout/ImprovedDashboardLayout';
import {
  Shield,
  User,
  AlertTriangle,
  Info,
  Check,
  BarChart2,
  TrendingUp,
  Users,
  Eye,
  Star
} from 'react-feather';

const ProofOfReachSimple = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data for demonstration
  const reachData = {
    uniqueNostrUsers: 4823,
    verifiedHumans: 1200,
    verifiedViews: 5840,
    wotLevel: 3,
    wotMaxLevel: 5,
    humanVerificationRate: 24.9,
    avgConfidenceScore: 87.3
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'verification', label: 'Verification', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Nostr Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{reachData.uniqueNostrUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Users size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified Humans</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{reachData.verifiedHumans.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Shield size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified Views</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{reachData.verifiedViews.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Eye size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confidence Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{reachData.avgConfidenceScore}%</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                  <Star size={24} className="text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Human Verification Process</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Check size={20} className="text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Nostr Identity Verification</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Users verified through Nostr public key signatures and web of trust.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check size={20} className="text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Lightning Network Proof</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Micro-payments prove user engagement and prevent bot activity.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check size={20} className="text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Privacy Protection</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Zero-knowledge proofs maintain user privacy while ensuring authenticity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Analytics Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">Human Verification Rate</span>
                <span className="text-sm font-bold">{reachData.humanVerificationRate}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">Web of Trust Level</span>
                <span className="text-sm font-bold">{reachData.wotLevel}/{reachData.wotMaxLevel}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">Average Confidence</span>
                <span className="text-sm font-bold">{reachData.avgConfidenceScore}%</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Proof of Reach Report</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Human-verified ad performance metrics powered by Nostr and Lightning Network
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {renderTabContent()}
    </div>
  );
};

const ProofOfReachWithLayout = () => {
  return (
    <ImprovedDashboardLayout title="Proof of Reach Report">
      <ProofOfReachSimple />
    </ImprovedDashboardLayout>
  );
};

export default ProofOfReachWithLayout;