import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, UserPlus } from 'react-feather';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../../_app';
import type { UserRole } from '@/types/auth';

/**
 * Admin User Management Page
 * 
 * This page provides administrators with tools to manage users across the platform,
 * including filtering by roles, searching, and managing permissions.
 */
const UserManagementPage: NextPageWithLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // In a real implementation, this would be an API call
        // Simulating API delay
        setTimeout(() => {
          // Sample data for demonstration
          const mockUsers = [
            { 
              id: '1', 
              npub: 'npub1abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456', 
              name: 'Alice Smith', 
              role: 'admin', 
              status: 'active', 
              lastActive: '2025-05-13T14:23:45Z',
              joinDate: '2025-02-01T00:00:00Z'
            },
            { 
              id: '2', 
              npub: 'npub2abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456', 
              name: 'Bob Johnson', 
              role: 'advertiser', 
              status: 'active', 
              lastActive: '2025-05-14T09:12:33Z',
              joinDate: '2025-02-15T00:00:00Z'
            },
            { 
              id: '3', 
              npub: 'npub3abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456', 
              name: 'Carol Williams', 
              role: 'publisher', 
              status: 'active', 
              lastActive: '2025-05-12T16:45:22Z',
              joinDate: '2025-03-05T00:00:00Z'
            },
            { 
              id: '4', 
              npub: 'npub4abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456', 
              name: 'David Brown', 
              role: 'viewer', 
              status: 'inactive', 
              lastActive: '2025-04-30T11:33:12Z',
              joinDate: '2025-03-22T00:00:00Z'
            },
            { 
              id: '5', 
              npub: 'npub5abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456', 
              name: 'Emma Davis', 
              role: 'stakeholder', 
              status: 'active', 
              lastActive: '2025-05-14T08:15:51Z',
              joinDate: '2025-04-10T00:00:00Z'
            },
          ];
          
          setUsers(mockUsers);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.log('Error fetching users:', error);
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Apply filters and search
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.npub.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Format npub for display
  const formatNpub = (npub: string) => {
    if (npub.length < 10) return npub;
    return `${npub.substring(0, 6)}...${npub.substring(npub.length - 4)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="h-6 w-6 mr-2" />
            User Management
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="relative">
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none w-full sm:w-auto"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="advertiser">Advertiser</option>
                <option value="publisher">Publisher</option>
                <option value="viewer">Viewer</option>
                <option value="stakeholder">Stakeholder</option>
              </select>
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
              <UserPlus className="h-5 w-5 mr-2" />
              Add User
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nostr ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{formatNpub(user.npub)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : ''}
                          ${user.role === 'advertiser' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                          ${user.role === 'publisher' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}
                          ${user.role === 'viewer' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
                          ${user.role === 'stakeholder' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
                        `}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.joinDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.lastActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4">
                          Edit
                        </button>
                        <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                          Disable
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                      No users found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple layout without enhanced dashboard
UserManagementPage.getLayout = (page: ReactElement) => page;

export default UserManagementPage;