import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import.*./context/TestModeContext';
import.*./hooks/useTestWallet';
import.*./lib/logger';
import.*./utils/toast';
// Simple date formatter function to avoid ESM import issues with date-fns
function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHour / 24);
  
  if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  if (diffHour > 0) {
    return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffMin > 0) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  }
  return 'just now';
}
import { MessageCircle, Heart, Repeat, ExternalLink, ChevronDown, Zap } from 'react-feather';

// Sample posts for our demo feed
const SAMPLE_POSTS = [
  {
    id: 'demo-post-1',
    pubkey: '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245',
    displayName: 'jb55',
    about: 'Bitcoin developer and Nostr early adopter',
    content: "Bitcoin is our peaceful protest against inflation and the surveillance state. Nostr is a parallel platform where censorship is technically impossible.",
    created_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    zaps: 42,
    zapAmount: 21_000
  },
  {
    id: 'demo-post-2',
    pubkey: '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d',
    displayName: 'fiatjaf',
    about: 'Creator of Nostr protocol',
    content: "Nostr is about giving people a platform that nobody can take away. It's a protocol, not a product. Every client and relay is free to implement it differently.",
    created_at: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
    zaps: 97,
    zapAmount: 230_500
  },
  {
    id: 'demo-post-3',
    pubkey: '04c915daefee38317fa734444acee390a8269fe5810b2241e5e6dd343dfbecc9',
    displayName: 'HODL Tarantula',
    about: 'Bitcoin advocate and educator',
    content: "The most important feature of #Bitcoin is that no one can stop you from using it. No one can freeze or seize your funds. That's worth paying for. #nostr",
    created_at: Math.floor(Date.now() / 1000) - 10800, // 3 hours ago
    zaps: 28,
    zapAmount: 56_000
  },
  {
    id: 'demo-post-4',
    pubkey: 'e33fe65f1fde44c6dc17eeb38fdad0fceaf1cae8722084332ed2e3f284dbe76c',
    displayName: 'Michael Saylor',
    about: 'Bitcoin maximalist, MicroStrategy founder',
    content: "When you choose to save in #Bitcoin, you're choosing a savings technology that empowers you to preserve your wealth into the distant future. It's digital gold but better in every way.",
    created_at: Math.floor(Date.now() / 1000) - 14400, // 4 hours ago
    zaps: 201,
    zapAmount: 1_250_000
  },
  {
    id: 'demo-post-5',
    pubkey: '7fa56f5d6962ab1e3cd424e758c3002b8665f7b0d8dcee9fe9e288d7751ac194',
    displayName: 'Alex Gladstein',
    about: 'Human rights advocate, Bitcoin educator',
    content: "In a world of censorship, a censorship-resistant social network is revolutionary. Nostr gives people a way to communicate that cannot be stopped.",
    created_at: Math.floor(Date.now() / 1000) - 18000, // 5 hours ago
    zaps: 52,
    zapAmount: 104_000
  },
  {
    id: 'demo-post-6',
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    displayName: 'dergigi',
    about: 'Bitcoin philosopher and writer',
    content: "21 million. That's it. Bitcoin's scarcity is its most valuable property in a world of infinite money printing. The 21 million cap is written in stone, not in sand.",
    created_at: Math.floor(Date.now() / 1000) - 21600, // 6 hours ago
    zaps: 88,
    zapAmount: 210_000
  },
  {
    id: 'demo-post-7',
    pubkey: '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d',
    displayName: 'fiatjaf',
    about: 'Creator of Nostr protocol',
    content: "Nostr's simplicity is its strength. It's just a protocol with a few event types and ways to link between them. This is how open protocols should be.",
    created_at: Math.floor(Date.now() / 1000) - 25200, // 7 hours ago
    zaps: 120,
    zapAmount: 240_000
  },
  {
    id: 'demo-post-8',
    pubkey: '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245',
    displayName: 'jb55',
    about: 'Bitcoin developer and Nostr early adopter',
    content: "What makes Nostr powerful is that it's decentralized. No single entity controls it. Censorship becomes technically difficult or impossible.",
    created_at: Math.floor(Date.now() / 1000) - 28800, // 8 hours ago
    zaps: 75,
    zapAmount: 100_000
  },
  {
    id: 'demo-post-9',
    pubkey: 'e33fe65f1fde44c6dc17eeb38fdad0fceaf1cae8722084332ed2e3f284dbe76c',
    displayName: 'Michael Saylor',
    about: 'Bitcoin maximalist, MicroStrategy founder',
    content: "Bitcoin is the apex property of the human race. It's the first engineered monetary system in history designed to not debase over time.",
    created_at: Math.floor(Date.now() / 1000) - 32400, // 9 hours ago
    zaps: 250,
    zapAmount: 1_500_000
  },
  {
    id: 'demo-post-10',
    pubkey: '7fa56f5d6962ab1e3cd424e758c3002b8665f7b0d8dcee9fe9e288d7751ac194',
    displayName: 'Alex Gladstein',
    about: 'Human rights advocate, Bitcoin educator',
    content: "In countries where governments control the media, tools like Nostr are vital for sharing uncensored information and organizing peaceful resistance.",
    created_at: Math.floor(Date.now() / 1000) - 36000, // 10 hours ago
    zaps: 89,
    zapAmount: 178_000
  }
];

// Sample ads that would come from the marketplace
const DEMO_ADS = [
  {
    id: 'ad-001',
    title: 'Bitcoin: Digital Gold for the Digital Age',
    description: 'Learn how Bitcoin is transforming global finance and why it\'s becoming the preferred store of value for individuals and institutions worldwide.',
    imageUrl: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    advertiserName: 'Bitcoin Magazine',
    cta: 'Learn More',
    link: 'https://example.com/bitcoin-magazine',
    highlightColor: 'purple',
    costPerView: 200 // 200 sats per view
  },
  {
    id: 'ad-002',
    title: 'Secure Your Digital Future with Cold Storage',
    description: 'Our military-grade hardware wallets provide the ultimate protection for your Bitcoin and digital assets against both physical and virtual threats.',
    imageUrl: 'https://images.pexels.com/photos/6771900/pexels-photo-6771900.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    advertiserName: 'Secure Sats',
    cta: 'Shop Now',
    link: 'https://example.com/cold-storage',
    highlightColor: 'blue',
    costPerView: 150 // 150 sats per view
  },
  {
    id: 'ad-003',
    title: 'Lightning Network: The Future of Bitcoin Payments',
    description: 'Instant, nearly fee-free Bitcoin transactions are here. Our Lightning wallet makes sending sats as easy as sending a text message.',
    imageUrl: 'https://images.pexels.com/photos/7788009/pexels-photo-7788009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    advertiserName: 'Lightning Labs',
    cta: 'Download Now',
    link: 'https://example.com/lightning-wallet',
    highlightColor: 'green',
    costPerView: 250 // 250 sats per view
  }
];

interface SimpleNostrFeedProps {
  showAds?: boolean;
  adFrequency?: number; // Show an ad every N posts
}

// Function to simplify getting a random number between min and max (inclusive)
const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Ad Component - Separated to avoid hook issues
const AdItem = memo(({ 
  adId, 
  ad, 
  onAdViewed 
}: { 
  adId: string, 
  ad: typeof DEMO_ADS[0], 
  onAdViewed: (adId: string, advertiserName: string) => void 
}) => {
  const [isViewed, setIsViewed] = useState(false);
  const [isAllowed, setIsAllowed] = useState(true); // Whether the ad is allowed by frequency cap
  const adRef = useRef<HTMLDivElement>(null);
  
  // Generate a consistent advertiser pubkey based on the ad ID
  const adPubkey = `ad-${ad.id}-${ad.advertiserName.replace(/\s+/g, '').toLowerCase()}`;
  
  // Different colors for different types of ads
  const badgeClass = ad.highlightColor === 'blue' 
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300' 
    : ad.highlightColor === 'green'
      ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300';
      
  const buttonClass = ad.highlightColor === 'blue'
    ? 'bg-blue-600 hover:bg-blue-700 text-white'
    : ad.highlightColor === 'green'
      ? 'bg-green-600 hover:bg-green-700 text-white'
      : 'bg-purple-600 hover:bg-purple-700 text-white';
  
  // Check frequency cap with the API
  useEffect(() => {
    // Make API request to check if this ad is allowed to be shown to this user
    const checkFrequencyCap = async () => {
      try {
        const response = await fetch(`/api/ads/${adId}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          console.logger.error('Failed to check frequency cap:', response.statusText);
          return;
        }
        
        const data = await response.json();
        setIsAllowed(data.allowed);
      } catch (error) {
        console.logger.error('Error checking frequency cap:', error);
      }
    };
    
    // Only run once when the component mounts
    checkFrequencyCap();
  }, [adId]);
  
  // Set up intersection observer for this ad
  useEffect(() => {
    // Skip if already viewed or not allowed by frequency cap
    if (isViewed || !isAllowed) return;
    
    let timer: NodeJS.Timeout | null = null;
    
    // Create an intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Start the 5-second timer
          timer = setTimeout(() => {
            // Mark as viewed and notify parent
            setIsViewed(true);
            onAdViewed(adId, ad.advertiserName);
            timer = null;
          }, 5000);
        } else if (timer) {
          // Cancel the timer if ad goes out of view
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.7 }
    );
    
    // Start observing
    if (adRef.current) {
      observer.observe(adRef.current);
    }
    
    // Cleanup
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [adId, ad.advertiserName, isViewed, isAllowed, onAdViewed]);
  
  // If ad is not allowed by frequency cap, return null
  if (!isAllowed) {
    return null;
  }
  
  return (
    <div 
      ref={adRef}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start">
        {/* Profile image */}
        <img 
          src={`https://robohash.org/${adPubkey}?set=set3`}
          alt="Advertiser"
          className="h-10 w-10 rounded-full mr-3 object-cover"
        />
        
        <div className="flex-1 min-w-0">
          {/* Ad header with advertiser name and ad badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-medium text-gray-900 dark:text-white">
                {ad.advertiserName}
              </span>
              <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                Demo Ad
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Sponsored
            </span>
          </div>
          
          {/* Ad title */}
          <div className="mt-2 text-gray-700 dark:text-gray-300">
            <h3 className="font-medium text-base">{ad.title}</h3>
          </div>
            
          {/* Full width image with larger format - similar to social media post */}
          {ad.imageUrl && (
            <div className="mt-2 -mx-4">
              <div className="bg-black w-full flex justify-center overflow-hidden" style={{ height: '260px' }}>
                <img 
                  src={ad.imageUrl} 
                  alt={ad.title}
                  className="h-full w-auto object-cover"
                  loading="eager"
                  onError={(e) => {
                    // Fallback in case image fails to load
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `https://via.placeholder.com/800x400/000000/FFFFFF?text=${encodeURIComponent(ad.title)}`;
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Ad description below image */}
          <div className="mt-3 text-gray-700 dark:text-gray-300">
            <p className="text-sm">{ad.description}</p>
            
            {/* Action button - right justified */}
            <div className="mt-2 flex justify-end">
              <a 
                href={ad.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-block py-1.5 px-4 text-sm font-medium rounded ${buttonClass}`}
              >
                {ad.cta}
              </a>
            </div>
          </div>
          
          {/* Engagement metrics - simulating post actions */}
          <div className="mt-3 flex items-center space-x-4 text-gray-500 dark:text-gray-400">
            <button className="flex items-center hover:text-purple-500 dark:hover:text-purple-400">
              <MessageCircle size={18} className="mr-1" />
              <span className="text-xs">Contact</span>
            </button>
            <button className="flex items-center hover:text-green-500 dark:hover:text-green-400">
              <Repeat size={18} className="mr-1" />
              <span className="text-xs">Share</span>
            </button>
            <button className="flex items-center hover:text-yellow-500 dark:hover:text-yellow-400">
              <Zap size={18} className="mr-1" />
              <span className="text-xs">Support</span>
            </button>
          </div>
          
          {/* Small cost info at bottom */}
          <div className="mt-2 text-xs text-gray-400 text-right">
            Cost per view: {ad.costPerView} sats
          </div>
        </div>
      </div>
    </div>
  );
});

// Set display name for memo component
AdItem.displayName = 'AdItem';

// React component for the SimpleNostrFeed
const SimpleNostrFeed: React.FC<SimpleNostrFeedProps> = ({
  showAds = true,
  adFrequency = 4
}) => {
  // State variables
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());
  const [displayedPosts, setDisplayedPosts] = useState<number>(8); 
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [latestEarning, setLatestEarning] = useState<{amount: number, advertiser: string} | null>(null);
  const [viewedAds, setViewedAds] = useState<Set<string>>(new Set());
  
  // Refs
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  
  // Get test mode information
  const { isTestMode } = useTestMode();
  
  // Get test wallet state and update function
  const { balance: testWalletBalance, updateBalance: updateTestWalletBalance } = useTestWallet();
  
  // Handle ad viewed event - called by child components
  const handleAdViewed = useCallback((adId: string, advertiserName: string) => {
    // Skip if already viewed
    if (viewedAds.has(adId)) return;
    
    // Mark as viewed locally
    setViewedAds(prev => {
      const newSet = new Set(prev);
      newSet.add(adId);
      return newSet;
    });
    
    // Generate random sats (1-10)
    const amount = getRandomInt(1, 10);
    
    // Update total earnings
    setTotalEarnings(prev => prev + amount);
    
    // Show notification
    setLatestEarning({
      amount,
      advertiser: advertiserName
    });
    
    // In test mode, add the satoshis to the viewer's wallet balance
    if (isTestMode && typeof window !== 'undefined') {
      try {
        // Calculate new balance using the current balance from our hook
        const newBalance = testWalletBalance + amount;
        
        // Update the wallet balance using the function from our hook
        // This updates localStorage AND the state in our component
        updateTestWalletBalance(newBalance);
        
        // Show a toast notification for earning satoshis with our improved shadcn-style component
        const message = `Earned ${amount} sats for viewing ad from ${advertiserName}!`;
        
        // Use the toast system with improved styling in the bottom right
        toast.success(message, { duration: 4000 }); // Slightly longer duration for better visibility
        
        logger.debug(`Added ${amount} sats to test wallet balance. New balance: ${newBalance}`);
      } catch (error) {
        logger.logger.error('Error updating test wallet balance:', error);
      }
    }
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setLatestEarning(null);
    }, 3000);
  }, [viewedAds, testWalletBalance, updateTestWalletBalance, isTestMode]);
  
  // Toggle expanded state for a profile
  const toggleProfileExpanded = useCallback((pubkey: string) => {
    setExpandedProfiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pubkey)) {
        newSet.delete(pubkey);
      } else {
        newSet.add(pubkey);
      }
      return newSet;
    });
  }, []);
  
  // Format timestamp to relative time
  const formatTimestamp = useCallback((timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return formatDistanceToNow(date);
  }, []);
  
  // Render Nostr content with formatting
  const renderContent = useCallback((content: string) => {
    // Replace URLs with links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const contentWithLinks = content.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
    });
    
    // Replace #hashtags
    const hashtagRegex = /#(\w+)/g;
    const contentWithHashtags = contentWithLinks.replace(hashtagRegex, (match, tag) => {
      return `<span class="text-purple-500">#${tag}</span>`;
    });
    
    // Replace @mentions
    const mentionRegex = /@(\w+)/g;
    const formattedContent = contentWithHashtags.replace(mentionRegex, (match, name) => {
      return `<span class="text-blue-500">@${name}</span>`;
    });
    
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  }, []);
  
  // Generate avatar for a pubkey
  const getPostAvatar = useCallback((pubkey: string) => {
    return `https://robohash.org/${pubkey}?set=set4`;
  }, []);
  
  // Generate posts for infinite scrolling
  const generateInfinitePosts = useCallback(() => {
    const posts = [];
    for (let i = 0; i < displayedPosts; i++) {
      // Cycle through the sample posts - using modulo to avoid out of bounds
      const sourcePost = SAMPLE_POSTS[i % SAMPLE_POSTS.length];
      
      // Make a deep copy with slight modifications to make each post unique
      const post = {
        ...sourcePost,
        id: `generated-post-${i}`,
        content: i % 12 === 0 ? 
          sourcePost.content.replace('Bitcoin', 'BTC').replace('Nostr', 'Nostr Protocol') :
          sourcePost.content,
        created_at: Math.floor(Date.now() / 1000) - (3600 * (i + 1)), // Each post is an hour older
        zaps: Math.max(1, sourcePost.zaps + (i % 5 - 2) * 10), // Slightly randomize zaps
        zapAmount: Math.max(1000, sourcePost.zapAmount + (i % 7 - 3) * 5000), // Slightly randomize zap amounts
      };
      
      posts.push(post);
    }
    return posts;
  }, [displayedPosts]);
  
  // Add more posts when scrolling to the bottom
  const generateMorePosts = useCallback(() => {
    // Each batch should add 3-5 more posts
    const batchSize = Math.floor(Math.random() * 3) + 3;
    setDisplayedPosts(prev => prev + batchSize);
  }, []);
  
  // Set up infinite scrolling observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          generateMorePosts();
        }
      },
      { threshold: 0.5 }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [generateMorePosts]);
  
  // Render the Satoshi symbol with wallet icon
  const SatoshiSymbol = () => (
    <div className="flex items-center justify-center mr-3">
      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner">
        <div className="text-xl font-bold">⚡</div>
      </div>
    </div>
  );
  
  // Main JSX rendering
  return (
    <div className="max-w-2xl mx-auto p-4 relative">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Nostr Feed Demo
      </h2>
      
      {/* Earnings notification - only shown when earned */}
      {latestEarning && (
        <div 
          onClick={() => window.location.href = '/wallet'}
          className="fixed bottom-4 right-4 bg-gradient-to-br from-[#F7931A] to-[#E78214] text-white px-4 py-3 rounded-md shadow-lg flex items-center z-30 cursor-pointer hover:from-[#E78214] hover:to-[#D57007] transition-all duration-200 transform hover:scale-105"
        >
          <SatoshiSymbol />
          <div>
            <div className="font-bold text-lg flex items-center">
              <span className="animate-pulse-once text-yellow-200">+{latestEarning.amount}</span>
              <span className="ml-1">sats</span>
            </div>
            <div className="text-xs flex justify-between">
              <span>from {latestEarning.advertiser}</span>
            </div>
            <div className="text-xs mt-1 border-t border-[#F8A43A] pt-1">
              <span className="font-medium">Total: {totalEarnings} sats</span>
              <span className="inline-block ml-1 text-yellow-200">💰</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Feed of posts and ads */}
      <div className="space-y-4" ref={feedRef}>
        {generateInfinitePosts().map((post, index) => {
          // Should we show an ad before this post?
          const shouldShowAd = showAds && index > 0 && index % adFrequency === 0;
          
          return (
            <React.Fragment key={post.id}>
              {shouldShowAd && (
                <AdItem 
                  adId={`ad-${index}`} 
                  ad={DEMO_ADS[index % DEMO_ADS.length]} 
                  onAdViewed={handleAdViewed}
                />
              )}
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start">
                  <img 
                    src={getPostAvatar(post.pubkey)}
                    alt="Profile"
                    className="h-10 w-10 rounded-full mr-3 object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {post.displayName}
                        </span>
                        <button 
                          onClick={() => toggleProfileExpanded(post.pubkey)}
                          className="ml-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <ChevronDown size={14} className={`transform transition-transform ${expandedProfiles.has(post.pubkey) ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatTimestamp(post.created_at)}
                      </span>
                    </div>
                    
                    {/* Expanded profile info */}
                    {expandedProfiles.has(post.pubkey) && (
                      <div className="mt-1 mb-2 text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="font-mono truncate">
                          {post.pubkey}
                        </div>
                        {post.about && (
                          <div className="mt-1">
                            {post.about}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-2 text-gray-700 dark:text-gray-300 break-words">
                      {renderContent(post.content)}
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                      <button className="flex items-center hover:text-purple-500 dark:hover:text-purple-400">
                        <MessageCircle size={18} className="mr-1" />
                        <span className="text-xs">Reply</span>
                      </button>
                      <button className="flex items-center hover:text-green-500 dark:hover:text-green-400">
                        <Repeat size={18} className="mr-1" />
                        <span className="text-xs">Repost</span>
                      </button>
                      <button className="flex items-center hover:text-red-500 dark:hover:text-red-400">
                        <Heart size={18} className="mr-1" />
                        <span className="text-xs">Like</span>
                      </button>
                      <button className="flex items-center hover:text-yellow-500 dark:hover:text-yellow-400">
                        <Zap size={18} className="mr-1" />
                        <span className="text-xs">Zap</span>
                      </button>
                      <a 
                        href={`https://njump.me/${post.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-blue-500 dark:hover:text-blue-400 ml-auto"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                    
                    {/* Zap stats */}
                    {post.zaps > 0 && (
                      <div className="mt-2 pt-2 flex items-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                        <Zap size={14} className="text-yellow-500 mr-1" />
                        <span className="font-medium">{post.zaps} zap{post.zaps !== 1 ? 's' : ''}</span>
                        <span className="mx-1">•</span>
                        <span>{(post.zapAmount / 1000).toLocaleString()} sats</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Infinite scrolling loading indicator */}
      <div 
        ref={loadMoreRef} 
        className="py-8 flex items-center justify-center text-gray-500 dark:text-gray-400"
      >
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full mx-1"></div>
          <div className="mt-2 text-sm">Loading more posts...</div>
        </div>
      </div>
      
      <div className="my-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>This is a demo feed showing how ads will appear in Nostr content</p>
        <p className="mt-1">Integration with live Nostr relays will be available in a future update</p>
      </div>
    </div>
  );
};

export default SimpleNostrFeed;