import React, { useState } from 'react';
import { X, Plus, RefreshCw, AlertCircle, Info } from 'react-feather';

interface PublisherRulesProps {
  initialRules: {
    domainBlacklist: string[];
    keywordBlacklist: string[];
    advertiserBlacklist: string[];
    advertiserWhitelist: string[];
    autoApproveEnabled: boolean;
  };
  onSave: (rules: {
    domainBlacklist: string[];
    keywordBlacklist: string[];
    advertiserBlacklist: string[];
    advertiserWhitelist: string[];
    autoApproveEnabled: boolean;
  }) => void;
}

const PublisherRules: React.FC<PublisherRulesProps> = ({ initialRules, onSave }) => {
  const [domainBlacklist, setDomainBlacklist] = useState(initialRules.domainBlacklist);
  const [newDomain, setNewDomain] = useState('');
  const [domainError, setDomainError] = useState('');
  
  const [keywordBlacklist, setKeywordBlacklist] = useState(initialRules.keywordBlacklist);
  const [newKeyword, setNewKeyword] = useState('');
  
  const [advertiserBlacklist, setAdvertiserBlacklist] = useState(initialRules.advertiserBlacklist);
  const [newBlacklistedAdvertiser, setNewBlacklistedAdvertiser] = useState('');
  const [blacklistAdvertiserError, setBlacklistAdvertiserError] = useState('');
  
  const [advertiserWhitelist, setAdvertiserWhitelist] = useState(initialRules.advertiserWhitelist);
  const [newWhitelistedAdvertiser, setNewWhitelistedAdvertiser] = useState('');
  const [whitelistAdvertiserError, setWhitelistAdvertiserError] = useState('');
  
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(initialRules.autoApproveEnabled);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle domain blacklist
  const handleAddDomain = () => {
    if (!newDomain.trim()) {
      setDomainError('Please enter a domain');
      return;
    }
    
    // Simple domain validation
    const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newDomain)) {
      setDomainError('Please enter a valid domain (e.g., example.com)');
      return;
    }
    
    if (domainBlacklist.includes(newDomain)) {
      setDomainError('This domain is already blacklisted');
      return;
    }
    
    setDomainBlacklist([...domainBlacklist, newDomain]);
    setNewDomain('');
    setDomainError('');
  };
  
  const handleRemoveDomain = (domain: string) => {
    setDomainBlacklist(domainBlacklist.filter(d => d !== domain));
  };
  
  // Handle keyword blacklist
  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    
    if (keywordBlacklist.includes(newKeyword)) return;
    
    setKeywordBlacklist([...keywordBlacklist, newKeyword]);
    setNewKeyword('');
  };
  
  const handleRemoveKeyword = (keyword: string) => {
    setKeywordBlacklist(keywordBlacklist.filter(k => k !== keyword));
  };
  
  // Handle advertiser blacklist
  const handleAddBlacklistedAdvertiser = () => {
    if (!newBlacklistedAdvertiser.trim()) {
      setBlacklistAdvertiserError('Please enter an npub');
      return;
    }
    
    // Basic npub validation
    if (!newBlacklistedAdvertiser.startsWith('npub1')) {
      setBlacklistAdvertiserError('Npub must start with "npub1"');
      return;
    }
    
    if (advertiserBlacklist.includes(newBlacklistedAdvertiser)) {
      setBlacklistAdvertiserError('This advertiser is already blacklisted');
      return;
    }
    
    setAdvertiserBlacklist([...advertiserBlacklist, newBlacklistedAdvertiser]);
    setNewBlacklistedAdvertiser('');
    setBlacklistAdvertiserError('');
  };
  
  const handleRemoveBlacklistedAdvertiser = (npub: string) => {
    setAdvertiserBlacklist(advertiserBlacklist.filter(a => a !== npub));
  };
  
  // Handle advertiser whitelist
  const handleAddWhitelistedAdvertiser = () => {
    if (!newWhitelistedAdvertiser.trim()) {
      setWhitelistAdvertiserError('Please enter an npub');
      return;
    }
    
    // Basic npub validation
    if (!newWhitelistedAdvertiser.startsWith('npub1')) {
      setWhitelistAdvertiserError('Npub must start with "npub1"');
      return;
    }
    
    if (advertiserWhitelist.includes(newWhitelistedAdvertiser)) {
      setWhitelistAdvertiserError('This advertiser is already whitelisted');
      return;
    }
    
    setAdvertiserWhitelist([...advertiserWhitelist, newWhitelistedAdvertiser]);
    setNewWhitelistedAdvertiser('');
    setWhitelistAdvertiserError('');
  };
  
  const handleRemoveWhitelistedAdvertiser = (npub: string) => {
    setAdvertiserWhitelist(advertiserWhitelist.filter(a => a !== npub));
  };
  
  const handleToggleAutoApprove = () => {
    setAutoApproveEnabled(!autoApproveEnabled);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    const rules = {
      domainBlacklist,
      keywordBlacklist,
      advertiserBlacklist,
      advertiserWhitelist,
      autoApproveEnabled
    };
    
    try {
      await onSave(rules);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="space-y-6">
          {/* Blacklist/Whitelist explanation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  About Ad Filtering Rules
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                  <p>
                    <span className="font-medium">Whitelisted advertisers</span> bypass all other rules and their ads are always approved.
                  </p>
                  <p>
                    <span className="font-medium">Blacklisted advertisers</span> are always rejected regardless of content.
                  </p>
                  <p>
                    <span className="font-medium">Domain blacklist</span> blocks ads with destination URLs containing any blacklisted domain.
                  </p>
                  <p>
                    <span className="font-medium">Keyword blacklist</span> blocks ads whose title or description contain blacklisted words.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Auto-Approve Ads</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    When enabled, ads that pass all rules will be automatically approved
                  </p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="autoApprove"
                    id="autoApprove"
                    className="sr-only"
                    checked={autoApproveEnabled}
                    onChange={handleToggleAutoApprove}
                    aria-label="auto-approve"
                  />
                  <label
                    htmlFor="autoApprove"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                      autoApproveEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                        autoApproveEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Advertiser Lists</h3>
              
              {/* Whitelist Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Whitelisted Advertisers (Always Approve)
                </label>
                
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={newWhitelistedAdvertiser}
                    onChange={(e) => setNewWhitelistedAdvertiser(e.target.value)}
                    placeholder="npub1..."
                    className="input-field flex-1 mr-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddWhitelistedAdvertiser}
                    className="btn-secondary flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Add
                  </button>
                </div>
                
                {whitelistAdvertiserError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 mb-2">{whitelistAdvertiserError}</p>
                )}
                
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                  {advertiserWhitelist.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No whitelisted advertisers yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {advertiserWhitelist.map((npub, index) => (
                        <li key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600">
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">{npub}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveWhitelistedAdvertiser(npub)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              {/* Blacklist Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Blacklisted Advertisers (Always Reject)
                </label>
                
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={newBlacklistedAdvertiser}
                    onChange={(e) => setNewBlacklistedAdvertiser(e.target.value)}
                    placeholder="npub1..."
                    className="input-field flex-1 mr-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddBlacklistedAdvertiser}
                    className="btn-secondary flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Add
                  </button>
                </div>
                
                {blacklistAdvertiserError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 mb-2">{blacklistAdvertiserError}</p>
                )}
                
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                  {advertiserBlacklist.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No blacklisted advertisers yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {advertiserBlacklist.map((npub, index) => (
                        <li key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600">
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">{npub}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBlacklistedAdvertiser(npub)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Domain Blacklist</h3>
              
              <div className="flex mb-2">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  className="input-field flex-1 mr-2"
                />
                <button
                  type="button"
                  onClick={handleAddDomain}
                  className="btn-secondary flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add
                </button>
              </div>
              
              {domainError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 mb-2">{domainError}</p>
              )}
              
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                {domainBlacklist.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No domains blacklisted yet</p>
                ) : (
                  <ul className="space-y-2">
                    {domainBlacklist.map((domain, index) => (
                      <li key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{domain}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain(domain)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Keyword Blacklist</h3>
              
              <div className="flex mb-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Enter keyword"
                  className="input-field flex-1 mr-2"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="btn-secondary flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add
                </button>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                {keywordBlacklist.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No keywords blacklisted yet</p>
                ) : (
                  <ul className="space-y-2">
                    {keywordBlacklist.map((keyword, index) => (
                      <li key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{keyword}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
        <button
          type="submit"
          className="btn-primary w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
};

export default PublisherRules;