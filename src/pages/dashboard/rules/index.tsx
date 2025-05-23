import React, { useState } from 'react';
import "./pages/_app';
import "./utils/layoutHelpers';
import "./context/RoleContext';
import { Shield, Plus, XCircle, CheckCircle, Edit, Save, X } from 'react-feather';
import "./hooks/useAuth';

// Rule types
type RuleType = 'domain_blacklist' | 'keyword_blacklist' | 'pubkey_blacklist' | 'pubkey_whitelist';

interface Rule {
  id: string;
  type: RuleType;
  value: string;
  createdAt: string;
  enabled: boolean;
}

const RulesPage: NextPageWithLayout = () => {
  const { role } = useRole();
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState<RuleType>('domain_blacklist');
  const [rules, setRules] = useState<Record<RuleType, Rule[]>>({
    domain_blacklist: [
      { id: 'rule-1', type: 'domain_blacklist', value: 'scam-crypto.com', createdAt: '2023-04-01T00:00:00Z', enabled: true },
      { id: 'rule-2', type: 'domain_blacklist', value: 'fake-bitcoin.org', createdAt: '2023-04-05T00:00:00Z', enabled: true },
      { id: 'rule-3', type: 'domain_blacklist', value: 'not-real-wallet.io', createdAt: '2023-04-10T00:00:00Z', enabled: false },
    ],
    keyword_blacklist: [
      { id: 'rule-4', type: 'keyword_blacklist', value: 'scam', createdAt: '2023-04-02T00:00:00Z', enabled: true },
      { id: 'rule-5', type: 'keyword_blacklist', value: 'ponzi', createdAt: '2023-04-06T00:00:00Z', enabled: true },
      { id: 'rule-6', type: 'keyword_blacklist', value: 'free crypto', createdAt: '2023-04-11T00:00:00Z', enabled: true },
    ],
    pubkey_blacklist: [
      { id: 'rule-7', type: 'pubkey_blacklist', value: 'npub1badactor111...', createdAt: '2023-04-03T00:00:00Z', enabled: true },
    ],
    pubkey_whitelist: [
      { id: 'rule-8', type: 'pubkey_whitelist', value: 'npub1trustedsource...', createdAt: '2023-04-04T00:00:00Z', enabled: true },
      { id: 'rule-9', type: 'pubkey_whitelist', value: 'npub1partneraccount...', createdAt: '2023-04-08T00:00:00Z', enabled: false },
    ],
  });
  
  const [newRuleValue, setNewRuleValue] = useState('');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // This page is only for publisher roles
  if (role !== 'publisher' && role !== 'admin') {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300">Access Restricted</h3>
        <p className="mt-2 text-yellow-700 dark:text-yellow-400">
          Publisher Rules are only available to publishers. Please switch to a publisher role to access this page.
        </p>
      </div>
    );
  }

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRuleTypeName = (type: RuleType): string => {
    switch (type) {
      case 'domain_blacklist':
        return 'Domain Blacklist';
      case 'keyword_blacklist':
        return 'Keyword Blacklist';
      case 'pubkey_blacklist':
        return 'Pubkey Blacklist';
      case 'pubkey_whitelist':
        return 'Pubkey Whitelist';
      default:
        return type;
    }
  };

  const handleAddRule = () => {
    if (!newRuleValue.trim()) return;
    
    const newRule: Rule = {
      id: `rule-${Math.random().toString(36).substr(2, 9)}`,
      type: activeTab,
      value: newRuleValue.trim(),
      createdAt: new Date().toISOString(),
      enabled: true,
    };
    
    setRules({
      ...rules,
      [activeTab]: [...rules[activeTab], newRule],
    });
    
    setNewRuleValue('');
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules({
      ...rules,
      [activeTab]: rules[activeTab].filter(rule => rule.id !== ruleId),
    });
  };

  const handleToggleRule = (ruleId: string) => {
    setRules({
      ...rules,
      [activeTab]: rules[activeTab].map(rule => 
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      ),
    });
  };

  const handleEditRule = (ruleId: string) => {
    const rule = rules[activeTab].find(r => r.id === ruleId);
    if (rule) {
      setEditingRuleId(ruleId);
      setEditValue(rule.value);
    }
  };

  const handleSaveEdit = (ruleId: string) => {
    if (!editValue.trim()) return;
    
    setRules({
      ...rules,
      [activeTab]: rules[activeTab].map(rule => 
        rule.id === ruleId ? { ...rule, value: editValue.trim() } : rule
      ),
    });
    
    setEditingRuleId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setEditValue('');
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'domain_blacklist':
        return 'example.com, another-site.org';
      case 'keyword_blacklist':
        return 'gambling, scam, inappropriate term';
      case 'pubkey_blacklist':
      case 'pubkey_whitelist':
        return 'npub1...';
      default:
        return 'Enter value';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-8 w-8 text-green-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rules</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400">
        Set up rules to automatically approve or reject ads based on domains, keywords, or specific npubs.
      </p>
      
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'domain_blacklist' 
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('domain_blacklist')}
        >
          Domain Blacklist
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'keyword_blacklist' 
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('keyword_blacklist')}
        >
          Keyword Blacklist
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'pubkey_blacklist' 
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('pubkey_blacklist')}
        >
          Pubkey Blacklist
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'pubkey_whitelist' 
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('pubkey_whitelist')}
        >
          Pubkey Whitelist
        </button>
      </div>

      {/* Rule explanation */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">About {getRuleTypeName(activeTab)}</h3>
        {activeTab === 'domain_blacklist' && (
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Ads containing blacklisted domains in their target URLs will be automatically rejected.
          </p>
        )}
        {activeTab === 'keyword_blacklist' && (
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Ads containing blacklisted keywords in their title or description will be automatically rejected.
          </p>
        )}
        {activeTab === 'pubkey_blacklist' && (
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Ads from blacklisted advertisers (by their Nostr pubkey) will be automatically rejected.
          </p>
        )}
        {activeTab === 'pubkey_whitelist' && (
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Only ads from whitelisted advertisers (by their Nostr pubkey) will be automatically approved. Others will require manual review.
          </p>
        )}
      </div>

      {/* Add new rule */}
      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-400 dark:focus:border-green-400"
          placeholder={getPlaceholder()}
          value={newRuleValue}
          onChange={(e) => setNewRuleValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddRule();
          }}
        />
        <button
          onClick={handleAddRule}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!newRuleValue.trim()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </button>
      </div>

      {/* Rules table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Value
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Added
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {rules[activeTab].length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No rules added yet.
                </td>
              </tr>
            ) : (
              rules[activeTab].map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingRuleId === rule.id ? (
                      <input
                        type="text"
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(rule.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                      />
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {rule.value}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(rule.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {rule.enabled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {editingRuleId === rule.id ? (
                        <>
                          <button 
                            onClick={() => handleSaveEdit(rule.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEditRule(rule.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleRule(rule.id)}
                            className={rule.enabled ? 
                              "text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300" : 
                              "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            }
                          >
                            {rule.enabled ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button 
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Set the layout for this page
RulesPage.getLayout = function getLayout(page: React.ReactElement) {
  return getDashboardLayout(page, 'Publisher Rules');
};

export default RulesPage;