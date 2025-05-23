import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '@/utils/layoutHelpers';
import '@/components/ui/DashboardContainer';
import { Settings, Save, RefreshCw, UserCheck, Bell, Moon, Sun, Shield, Lock, Plus, X, AlertCircle, Info, Globe, Wifi } from 'react-feather';
import { 
  fetchNostrProfile, 
  createDefaultAvatar, 
  hexToNpub,
  formatNpubForDisplay,
  NostrProfileData,
  isValidRelayUrl,
  saveRelays,
  DEFAULT_RELAYS
} from '../../lib/nostrProfile';
import '@/components/ui/CopyToClipboard';

const UserSettingsPage = () => {
  const { auth } = useAuth();
  
  // Form state
  const [displayName, setDisplayName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Nostr profile state
  const [nostrProfile, setNostrProfile] = useState<NostrProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);
  const [npubDisplay, setNpubDisplay] = useState<string>('');
  const [pubkeyToUse, setPubkeyToUse] = useState<string>('');
  
  // Network / Relay state
  const [nostrRelays, setNostrRelays] = useState<string[]>([
    'wss://relay.damus.io/',
    'wss://relay.primal.net/',
    'wss://nos.lol/',
    'wss://relay.utxo.one/'
  ]);
  const [newRelay, setNewRelay] = useState<string>('');
  const [isAddingRelay, setIsAddingRelay] = useState<boolean>(false);
  const [relayError, setRelayError] = useState<string | null>(null);
  
  // Data sharing preferences
  const [shareLocation, setShareLocation] = useState<boolean>(false);
  const [shareInterests, setShareInterests] = useState<boolean>(false);
  const [shareBrowsing, setShareBrowsing] = useState<boolean>(false);
  const [shareAge, setShareAge] = useState<boolean>(false);
  
  // Interest whitelist and blacklist
  const [allowedInterests, setAllowedInterests] = useState<string[]>([
    'bitcoin', 'lightning', 'crypto', 'programming'
  ]);
  const [blockedInterests, setBlockedInterests] = useState<string[]>([
    'gambling', 'politics'
  ]);
  const [newAllowedInterest, setNewAllowedInterest] = useState<string>('');
  const [newBlockedInterest, setNewBlockedInterest] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [tooltipDismissed, setTooltipDismissed] = useState<boolean>(false);
  
  // Save relay changes to local storage and update state
  const handleAddRelay = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newRelay || newRelay.trim() === '') {
      setRelayError('Relay URL cannot be empty');
      return;
    }
    
    // Format the URL (ensure it ends with a slash)
    let relayUrl = newRelay.trim();
    if (!relayUrl.endsWith('/')) {
      relayUrl += '/';
    }
    
    // Validate URL format
    if (!isValidRelayUrl(relayUrl)) {
      setRelayError('Invalid relay URL. Must be a WebSocket URL (wss:// or ws://)');
      return;
    }
    
    // Check if relay already exists
    if (nostrRelays.includes(relayUrl)) {
      setRelayError('This relay is already in your list');
      return;
    }
    
    // Add relay to state
    const updatedRelays = [...nostrRelays, relayUrl];
    setNostrRelays(updatedRelays);
    
    // Save to localStorage
    saveRelays(updatedRelays);
    
    // Reset form
    setNewRelay('');
    setRelayError(null);
    setIsAddingRelay(false);
  };
  
  // Remove a relay
  const handleRemoveRelay = (relay: string) => {
    const updatedRelays = nostrRelays.filter(r => r !== relay);
    
    // Don't allow removing all relays
    if (updatedRelays.length === 0) {
      setRelayError('You must have at least one relay');
      return;
    }
    
    setNostrRelays(updatedRelays);
    
    // Save to localStorage
    saveRelays(updatedRelays);
  };
  
  // Reset relays to defaults
  const handleResetRelays = () => {
    setNostrRelays(DEFAULT_RELAYS);
    saveRelays(DEFAULT_RELAYS);
  };
  
  // Initialize form and preferences with user data
  useEffect(() => {
    // Check if dark mode is enabled
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    
    // Check if the tooltip has been dismissed before
    const isTooltipDismissed = localStorage.getItem('dataSharingTooltipDismissed') === 'true';
    setTooltipDismissed(isTooltipDismissed);
    
    // Load saved relays from localStorage if they exist
    const savedRelays = localStorage.getItem('nostrRelays');
    if (savedRelays) {
      try {
        const parsedRelays = JSON.parse(savedRelays);
        if (Array.isArray(parsedRelays) && parsedRelays.length > 0) {
          setNostrRelays(parsedRelays);
        }
      } catch (error) {
        console.error('Error parsing saved relays:', error);
      }
    }
    
    // Only use public key from auth context, not from localStorage
    const foundPubkey = auth?.pubkey || '';
    
    // If we find localStorage keys, clear them to prevent conflicts with Nostr extension
    if (typeof window !== 'undefined') {
      const localStoragePubkey = localStorage.getItem('nostr_real_pk');
      if (localStoragePubkey) {
        console.log('Found and removing localStorage pubkey fallback to prevent conflicts:', localStoragePubkey);
        localStorage.removeItem('nostr_real_pk');
        localStorage.removeItem('nostr_real_sk');
        localStorage.removeItem('nostr_test_pk');
        localStorage.removeItem('nostr_test_sk');
      }
    }
    
    // Try direct Nostr extension first for more reliability
    if (typeof window !== 'undefined' && window.nostr) {
      console.log('TRYING TO GET PUBKEY DIRECTLY FROM EXTENSION');
      try {
        // Immediate async function to get pubkey from extension
        (async () => {
          try {
            const extensionPubkey = await window.nostr.getPublicKey();
            console.log('GOT PUBKEY DIRECTLY FROM EXTENSION:', extensionPubkey);
            
            if (extensionPubkey) {
              setPubkeyToUse(extensionPubkey);
              return; // Exit early if we got the key
            }
          } catch (e) {
            console.error('Error getting pubkey directly from extension:', e);
          }
          
          // Fallback to auth context if extension fails
          console.log('FALLING BACK TO AUTH CONTEXT PUBKEY:', foundPubkey);
          setPubkeyToUse(foundPubkey);
        })();
      } catch (e) {
        console.error('Error accessing extension directly:', e);
        setPubkeyToUse(foundPubkey);
      }
    } else {
      // No window.nostr available, use auth context
      console.log('NO NOSTR EXTENSION DETECTED, USING AUTH CONTEXT:', foundPubkey);
      setPubkeyToUse(foundPubkey);
    }
  }, [auth]);
  
  // Handle profile data fetching when pubkey changes
  useEffect(() => {
    // Only proceed if we have a pubkey
    if (!pubkeyToUse) {
      return;
    }
    
    // Convert hex pubkey to npub for display
    if (pubkeyToUse.startsWith('pk_')) {
      // For test/demo keys, just display as is
      setNpubDisplay(pubkeyToUse);
    } else if (pubkeyToUse.startsWith('npub')) {
      // Already in npub format, use as is
      console.log('Pubkey already in npub format:', pubkeyToUse);
      setNpubDisplay(pubkeyToUse);
    } else {
      // For hex keys, convert to npub format
      console.log('Converting hex pubkey to npub:', pubkeyToUse);
      const npub = hexToNpub(pubkeyToUse);
      console.log('Converted npub:', npub);
      setNpubDisplay(npub || pubkeyToUse);
    }
    
    // Log authentication status for debugging
    console.log('Authentication status:', { 
      isLoggedIn: !!auth?.isLoggedIn, 
      pubkey: auth?.pubkey || 'Not authenticated',
      pubkeyToUse
    });
    
    // Fetch Nostr profile data
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        console.log('Fetching profile for pubkey:', pubkeyToUse);
        
        // First, try to get metadata directly from Nostr extension if it's the user's own key
        console.log('ATTEMPTING TO GET PROFILE DATA DIRECTLY FROM EXTENSION');
        
        // Direct extension access
        if (typeof window !== 'undefined' && window.nostr) {
          try {
            console.log('NOSTR EXTENSION DETECTED, GETTING PUBLIC KEY');
            const extensionPubkey = await window.nostr.getPublicKey();
            console.log('EXTENSION PUBKEY:', extensionPubkey);
            console.log('CURRENT PUBKEY TO USE:', pubkeyToUse);
            
            // Handle the case where extension methods exist but no getMetadata
            if (extensionPubkey === pubkeyToUse) {
              console.log('PUBKEYS MATCH - TRYING TO GET PROFILE');
              
              // Try different methods based on available extension APIs
              // Method 1: getMetadata (newer extensions)
              if (typeof window.nostr.getMetadata === 'function') {
                try {
                  console.log('USING getMetadata() METHOD');
                  const metadata = await window.nostr.getMetadata();
                  console.log('GOT METADATA FROM EXTENSION:', metadata);
                  
                  if (metadata && metadata.content) {
                    try {
                      const profileData = JSON.parse(metadata.content);
                      console.log('PARSED PROFILE FROM EXTENSION:', profileData);
                      setNostrProfile(profileData);
                      
                      // Update form fields
                      if (profileData.name) {
                        setDisplayName(profileData.name);
                      } else if (profileData.displayName) {
                        setDisplayName(profileData.displayName);
                      }
                      
                      if (profileData.about) {
                        setBio(profileData.about);
                      }
                      
                      setIsLoadingProfile(false);
                      return; // Exit early if we got data from extension
                    } catch (e) {
                      console.error('ERROR PARSING EXTENSION METADATA:', e);
                    }
                  } else {
                    console.log('NO CONTENT IN METADATA');
                  }
                } catch (e) {
                  console.error('ERROR GETTING METADATA:', e);
                }
              } else {
                console.log('EXTENSION DOES NOT HAVE getMetadata() METHOD');
              }
              
              // Method 2: getUserMetadata (some extensions)
              if (typeof window.nostr.getUserMetadata === 'function') {
                try {
                  console.log('TRYING getUserMetadata() METHOD');
                  const userData = await window.nostr.getUserMetadata();
                  console.log('GOT USER METADATA:', userData);
                  
                  if (userData) {
                    setNostrProfile(userData);
                    
                    if (userData.name) {
                      setDisplayName(userData.name);
                    } else if (userData.displayName) {
                      setDisplayName(userData.displayName);
                    }
                    
                    if (userData.about) {
                      setBio(userData.about);
                    }
                    
                    setIsLoadingProfile(false);
                    return;
                  }
                } catch (e) {
                  console.error('ERROR GETTING USER METADATA:', e);
                }
              }
              
              // If we get here, we failed to get profile data from extension directly
              console.log('COULD NOT GET PROFILE FROM EXTENSION DIRECTLY');
            } else {
              console.log('PUBKEYS DON\'T MATCH');
            }
          } catch (e) {
            console.error('Error getting metadata from extension:', e);
          }
        }
        
        // Fallback to API/relay fetch if extension method failed
        console.log('Falling back to fetchNostrProfile API');
        const profile = await fetchNostrProfile(pubkeyToUse);
        console.log('Profile response from API:', profile);
        
        if (profile) {
          setNostrProfile(profile);
          
          // Update form fields with profile data if available
          if (profile.name) {
            setDisplayName(profile.name);
          } else if (profile.displayName) {
            setDisplayName(profile.displayName);
          }
          
          if (profile.about) {
            setBio(profile.about);
          }
        } else {
          // Set defaults if no profile found
          setDisplayName('Satoshi Nakamoto');
          setBio('Bitcoin enthusiast. Lightning Network advocate. Privacy-focused.');
        }
      } catch (error) {
        console.error('Error fetching Nostr profile:', error);
        // Set defaults on error
        setDisplayName('Satoshi Nakamoto');
        setBio('Bitcoin enthusiast. Lightning Network advocate. Privacy-focused.');
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    // Fetch user preferences - this is a simulated API call
    const fetchUserPreferences = async () => {
      try {
        // In a real app, we would do something like:
        // const response = await fetch('/api/users/preferences');
        // const data = await response.json();
        
        // Simulate API response with a delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Simulated response data - using the same defaults as in onboarding
        const data = {
          shareLocation: true,     // Updated to match onboarding default
          shareInterests: true,    // Recommended option in onboarding
          shareBrowsing: false,    // Kept as opt-in for privacy
          shareAge: true           // Most users are OK with this
        };
        
        // Update state with fetched preferences
        setShareLocation(data.shareLocation);
        setShareInterests(data.shareInterests);
        setShareBrowsing(data.shareBrowsing);
        setShareAge(data.shareAge);
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };
    
    // Call both fetch functions
    fetchProfile();
    fetchUserPreferences();
  }, [pubkeyToUse, auth]);

  // Handler to add allowed interest
  const handleAddAllowedInterest = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (newAllowedInterest.trim() === '') return;
    
    const interestToAdd = newAllowedInterest.trim().toLowerCase();
    
    // Add to allowed interests if not already present
    if (!allowedInterests.includes(interestToAdd)) {
      const updatedAllowedInterests = [...allowedInterests, interestToAdd];
      setAllowedInterests(updatedAllowedInterests);
      
      // If this interest is in blocked list, remove it from there
      if (blockedInterests.includes(interestToAdd)) {
        const updatedBlockedInterests = blockedInterests.filter(
          interest => interest !== interestToAdd
        );
        setBlockedInterests(updatedBlockedInterests);
      }
    }
    
    setNewAllowedInterest('');
  };
  
  // Handler to add blocked interest
  const handleAddBlockedInterest = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (newBlockedInterest.trim() === '') return;
    
    const interestToBlock = newBlockedInterest.trim().toLowerCase();
    
    // Add to blocked interests if not already present
    if (!blockedInterests.includes(interestToBlock)) {
      const updatedBlockedInterests = [...blockedInterests, interestToBlock];
      setBlockedInterests(updatedBlockedInterests);
      
      // If this interest is in allowed list, remove it from there
      if (allowedInterests.includes(interestToBlock)) {
        const updatedAllowedInterests = allowedInterests.filter(
          interest => interest !== interestToBlock
        );
        setAllowedInterests(updatedAllowedInterests);
      }
    }
    
    setNewBlockedInterest('');
  };
  
  // Handler to remove allowed interest
  const handleRemoveAllowedInterest = (interest: string) => {
    setAllowedInterests(allowedInterests.filter(item => item !== interest));
  };
  
  // Handler to remove blocked interest
  const handleRemoveBlockedInterest = (interest: string) => {
    setBlockedInterests(blockedInterests.filter(item => item !== interest));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save dark mode preference to localStorage
      localStorage.setItem('darkMode', darkMode.toString());
      
      // In a real app, we would send all preferences to the server
      // This would include sending the data sharing preferences to update UserPreferences
      console.log('Saving user preferences:', {
        profile: { displayName, bio },
        notifications: { emailNotifications },
        appearance: { darkMode },
        privacy: { 
          shareLocation, 
          shareInterests, 
          shareBrowsing, 
          shareAge,
          allowedInterests,
          blockedInterests
        }
      });
      
      // Show success message
      setSuccessMessage('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardContainer>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-8 w-8 text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Settings */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            <UserCheck className="inline-block w-5 h-5 mr-2 text-blue-500" />
            Profile Information
          </h2>
          
          <div className="flex flex-col md:flex-row md:space-x-6 mb-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0 mb-4 md:mb-0">
              <div className="relative w-32 h-32 overflow-hidden rounded-full border-4 border-gray-200 dark:border-gray-700">
                {isLoadingProfile ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                ) : nostrProfile?.picture ? (
                  <img 
                    src={nostrProfile.picture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : pubkeyToUse ? (
                  <img 
                    src={createDefaultAvatar(pubkeyToUse)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <UserCheck className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                {isLoadingProfile ? 'Loading profile...' : 'Nostr profile picture'}
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="flex-grow space-y-4">
              {/* Nostr Public Key */}
              <div>
                <label htmlFor="pubkey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nostr Public Key (npub)
                </label>
                <div className="w-auto inline-flex px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 sm:text-sm items-center">
                  <CopyToClipboard 
                    value={npubDisplay || pubkeyToUse || ''} 
                    displayValue={formatNpubForDisplay(npubDisplay || pubkeyToUse || '')}
                    className="flex items-center justify-between cursor-pointer text-gray-700 dark:text-gray-300 font-mono"
                    successText="Copied!"
                    iconClassName="w-3.5 h-3.5 ml-2"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Your Nostr public key is used to identify you on the network. Click to copy.
                </p>
              </div>
              
              {/* Extra Nostr Information */}
              {nostrProfile && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
                  <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center">
                    <Info className="w-4 h-4 mr-1" />
                    Nostr Profile Data
                  </h3>
                  <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {nostrProfile.name && (
                      <p><span className="font-medium">Name:</span> {nostrProfile.name}</p>
                    )}
                    {nostrProfile.nip05 && (
                      <p><span className="font-medium">NIP-05:</span> {nostrProfile.nip05}</p>
                    )}
                    {nostrProfile.website && (
                      <p>
                        <span className="font-medium">Website:</span>{' '}
                        <a 
                          href={nostrProfile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {nostrProfile.website}
                        </a>
                      </p>
                    )}
                    {nostrProfile.lud16 && (
                      <p><span className="font-medium">Lightning Address:</span> {nostrProfile.lud16}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                name="displayName"
                id="displayName"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Tell us about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Brief description that will be visible on your public profile
              </p>
            </div>
          </div>
        </div>
        
        {/* Network Settings */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            <Globe className="inline-block w-5 h-5 mr-2 text-blue-500" />
            Network Settings
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Nostr Relays</h3>
                <button
                  type="button"
                  onClick={() => setIsAddingRelay(!isAddingRelay)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isAddingRelay ? (
                    <>
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Relay
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Connect to Nostr relays to fetch profiles and publish content. More relays means better connectivity.
              </p>
              
              {/* Add Relay Form */}
              {isAddingRelay && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <form onSubmit={handleAddRelay} className="space-y-3">
                    <div>
                      <label htmlFor="relay-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Relay URL
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="relay-url"
                          id="relay-url"
                          value={newRelay}
                          onChange={(e) => setNewRelay(e.target.value)}
                          className="focus:ring-indigo-500 focus:border-indigo-500 flex-grow block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          placeholder="wss://relay.example.com/"
                        />
                        <button
                          type="submit"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Add
                        </button>
                      </div>
                      {relayError && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">{relayError}</p>
                      )}
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Example: wss://relay.damus.io/
                      </p>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Relay List */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md overflow-hidden">
                {nostrRelays.length > 0 ? (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                    {nostrRelays.map((relay) => (
                      <li key={relay} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <Wifi className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{relay}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRelay(relay)}
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          title="Remove relay"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No relays configured. Add a relay to connect to the Nostr network.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleResetRelays}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            <Bell className="inline-block w-5 h-5 mr-2 text-purple-500" />
            Notification Preferences
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Notifications
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications about your account activity via email
                </p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input 
                  id="emailNotifications" 
                  type="checkbox" 
                  className="sr-only"
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                  aria-label="email notifications"
                />
                <label 
                  htmlFor="emailNotifications" 
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${emailNotifications ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span 
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${emailNotifications ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Privacy & Data Sharing Settings */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            <Shield className="inline-block w-5 h-5 mr-2 text-green-500" />
            Privacy & Data Sharing
          </h2>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You are in full control of the data shared with advertisers. The more you're willing to share, the more bitcoin you can potentially earn!
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="shareLocation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country & State Data
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Allow advertisers to target based on your country and state only (no precise location)
                </p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input 
                  id="shareLocation" 
                  type="checkbox" 
                  className="sr-only"
                  checked={shareLocation}
                  onChange={() => setShareLocation(!shareLocation)}
                  aria-label="share location"
                  data-testid="share-location-toggle"
                />
                <label 
                  htmlFor="shareLocation" 
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${shareLocation ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span 
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${shareLocation ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="shareInterests" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Interest-Based Ads
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Recommended)</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Allow ads based on your interests and preferences
                </p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input 
                  id="shareInterests" 
                  type="checkbox" 
                  className="sr-only"
                  checked={shareInterests}
                  onChange={() => setShareInterests(!shareInterests)}
                  aria-label="share interests"
                  data-testid="share-interests-toggle"
                />
                <label 
                  htmlFor="shareInterests" 
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${shareInterests ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span 
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${shareInterests ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="shareBrowsing" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Browsing Activity
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Allow limited tracking of content you view
                </p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input 
                  id="shareBrowsing" 
                  type="checkbox" 
                  className="sr-only"
                  checked={shareBrowsing}
                  onChange={() => setShareBrowsing(!shareBrowsing)}
                  aria-label="share browsing"
                  data-testid="share-browsing-toggle"
                />
                <label 
                  htmlFor="shareBrowsing" 
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${shareBrowsing ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span 
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${shareBrowsing ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="shareAge" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Age Information
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Allow age-appropriate content targeting
                </p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input 
                  id="shareAge" 
                  type="checkbox" 
                  className="sr-only"
                  checked={shareAge}
                  onChange={() => setShareAge(!shareAge)}
                  aria-label="share age"
                  data-testid="share-age-toggle"
                />
                <label 
                  htmlFor="shareAge" 
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${shareAge ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span 
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${shareAge ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </label>
              </div>
            </div>
            
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              These settings apply to apps that integrate with our platform. Individual apps may have additional privacy controls.
            </p>
            
            {/* Interests Whitelist/Blacklist Section */}
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
                Interests Management
              </h3>
              
              {/* Information Notice with Tooltip */}
              {!tooltipDismissed && (
                <div className="mb-4 relative">
                  <div 
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <div className="flex justify-between">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Info className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Not seeing many ads or earning enough sats? Consider enabling more data sharing options to improve your sats flow.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTooltipDismissed(true);
                          localStorage.setItem('dataSharingTooltipDismissed', 'true');
                        }}
                        className="text-blue-400 hover:text-blue-500 focus:outline-none"
                        aria-label="Dismiss"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Tooltip */}
                  {showTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 bg-gray-900 text-white text-sm rounded p-3 shadow-lg z-10">
                      <p className="text-xs">
                        Sharing more information helps advertisers show you more relevant ads. More relevant ads typically generate higher payments, increasing your sats flow when viewing content.
                      </p>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-gray-900"></div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Allowed Interests */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    Preferred Interests
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(ONLY show ads about these)</span>
                  </h4>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {allowedInterests.map(interest => (
                      <div 
                        key={interest}
                        className="inline-flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full px-3 py-1 text-sm"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => handleRemoveAllowedInterest(interest)}
                          className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 focus:outline-none"
                          aria-label={`Remove ${interest} from allowed interests`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex">
                    <input
                      type="text"
                      value={newAllowedInterest}
                      onChange={(e) => setNewAllowedInterest(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAllowedInterest(e);
                        }
                      }}
                      placeholder="Add interest..."
                      className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddAllowedInterest}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Blocked Interests */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    Blocked Interests
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(NEVER show ads about these)</span>
                  </h4>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {blockedInterests.map(interest => (
                      <div 
                        key={interest}
                        className="inline-flex items-center bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full px-3 py-1 text-sm"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => handleRemoveBlockedInterest(interest)}
                          className="ml-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 focus:outline-none"
                          aria-label={`Remove ${interest} from blocked interests`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex">
                    <input
                      type="text"
                      value={newBlockedInterest}
                      onChange={(e) => setNewBlockedInterest(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBlockedInterest(e);
                        }
                      }}
                      placeholder="Block interest..."
                      className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddBlockedInterest}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Privacy Notice */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your privacy is important to us. When disabled, these data types will not be shared with any advertisers. You can change these settings at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {darkMode ? 
              <Moon className="inline-block w-5 h-5 mr-2 text-indigo-500" /> :
              <Sun className="inline-block w-5 h-5 mr-2 text-yellow-500" />
            }
            Appearance
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="darkMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dark Mode
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark theme
                </p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input 
                  id="darkMode" 
                  type="checkbox" 
                  className="sr-only"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  aria-label="dark mode"
                />
                <label 
                  htmlFor="darkMode" 
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${darkMode ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span 
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Danger Zone</h3>
        <p className="text-red-700 dark:text-red-400 mb-4">
          Actions in this section are irreversible and should be used with caution.
        </p>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 shadow-sm text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete Account
        </button>
      </div>
    </DashboardContainer>
  );
};

// Wrap the page with our layout
UserSettingsPage.getLayout = (page: React.ReactElement) => {
  return getDashboardLayout(page, "Settings");
};

export default UserSettingsPage;