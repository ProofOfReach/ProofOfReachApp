import React, { useState } from 'react';
import '@/components/layout/ImprovedDashboardLayout';
import '@/components/ui/Typography';
import '@/components/ui/card';
import { Search, Filter, User as UserIcon, Check, X, Shield } from 'react-feather';

// Sample data for demonstration
const users = [
  { 
    id: 1, 
    name: 'Alex Thompson', 
    npub: 'npub1abc123...', 
    email: 'alex@example.com',
    roles: ['advertiser', 'publisher'],
    status: 'active',
    lastActive: '2023-05-07T14:23:41Z',
    verifiedEmail: true,
    spendAmount: 4250,
    earnedAmount: 1820
  },
  { 
    id: 2, 
    name: 'Maria Sanchez', 
    npub: 'npub1xyz789...', 
    email: 'maria@example.com',
    roles: ['advertiser'],
    status: 'active',
    lastActive: '2023-05-06T09:15:22Z',
    verifiedEmail: true,
    spendAmount: 3120,
    earnedAmount: 0
  },
  { 
    id: 3, 
    name: 'James Wilson', 
    npub: 'npub1def456...', 
    email: 'james@example.com',
    roles: ['publisher'],
    status: 'active',
    lastActive: '2023-05-05T16:45:10Z',
    verifiedEmail: true,
    spendAmount: 0,
    earnedAmount: 2450
  },
  { 
    id: 4, 
    name: 'Sarah Miller', 
    npub: 'npub1ghi789...', 
    email: 'sarah@example.com',
    roles: ['publisher', 'advertiser'],
    status: 'inactive',
    lastActive: '2023-04-20T11:32:05Z',
    verifiedEmail: false,
    spendAmount: 1250,
    earnedAmount: 780
  },
  { 
    id: 5, 
    name: 'David Johnson', 
    npub: 'npub1jkl101...', 
    email: 'david@example.com',
    roles: ['advertiser'],
    status: 'suspended',
    lastActive: '2023-05-01T13:12:45Z',
    verifiedEmail: true,
    spendAmount: 560,
    earnedAmount: 0
  },
];

// Define user status badge styles
const getUserStatusBadge = (status: string) => {
  switch(status) {
    case 'active':
      return <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-medium">Active</span>;
    case 'inactive':
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded text-xs font-medium">Inactive</span>;
    case 'suspended':
      return <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded text-xs font-medium">Suspended</span>;
    default:
      return null;
  }
};

// Define role chips
const getRoleChips = (roles: string[]) => {
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role, index) => {
        let bgColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        
        if (role === 'advertiser') {
          bgColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        } else if (role === 'publisher') {
          bgColor = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        } else if (role === 'admin') {
          bgColor = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        }
        
        return (
          <span key={index} className={`px-2 py-0.5 ${bgColor} rounded-full text-xs`}>
            {role}
          </span>
        );
      })}
    </div>
  );
};

const StakeholderUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Filter users based on search term and selected filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.npub.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'advertisers') return matchesSearch && user.roles.includes('advertiser');
    if (filter === 'publishers') return matchesSearch && user.roles.includes('publisher');
    if (filter === 'active') return matchesSearch && user.status === 'active';
    if (filter === 'inactive') return matchesSearch && user.status !== 'active';
    
    return matchesSearch;
  });

  return (
    <ImprovedDashboardLayout title="User Management">
      <div className="space-y-6">
        <div>
          <Title level={1}>User Management</Title>
          <Paragraph className="text-gray-500 dark:text-gray-400">
            View and manage all users on the platform.
          </Paragraph>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              className="block w-full p-2.5 pl-10 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Search by name, email, or Nostr pubkey"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative">
              <select
                className="block w-full p-2.5 pr-8 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white appearance-none"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="advertisers">Advertisers</option>
                <option value="publishers">Publishers</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Roles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Spent/Earned</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                          <UserIcon className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{user.npub}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleChips(user.roles)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getUserStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {new Date(user.lastActive).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.verifiedEmail ? 
                        <Check className="h-5 w-5 text-green-500" /> : 
                        <X className="h-5 w-5 text-red-500" />
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.spendAmount > 0 && (
                        <div className="text-blue-600 dark:text-blue-400">Spent: ${user.spendAmount}</div>
                      )}
                      {user.earnedAmount > 0 && (
                        <div className="text-green-600 dark:text-green-400">Earned: ${user.earnedAmount}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                        Edit
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                        <Shield className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      No users found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
        
        <div className="flex justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> users
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded">
              Previous
            </button>
            <button className="px-3 py-1 bg-indigo-600 text-white dark:bg-indigo-700 rounded">
              Next
            </button>
          </div>
        </div>
      </div>
    </ImprovedDashboardLayout>
  );
};

export default StakeholderUsersPage;