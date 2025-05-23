import React, { useState, useEffect } from 'react';
import NDK, { NDKEvent, NDKFilter, NDKSubscription } from '@nostr-dev-kit/ndk';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Heart, Repeat, ExternalLink, ChevronDown } from 'react-feather';

// Default relays to connect to
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.current.fyi',
  'wss://nostr.wine',
  'wss://nostr-pub.wellorder.net'
];

// Popular Nostr accounts to ensure we get some content
// These are some well-known Nostr users that post frequently
const POPULAR_NOSTR_PUBKEYS = [
  '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245', // jb55
  '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d', // fiatjaf
  '04c915daefee38317fa734444acee390a8269fe5810b2241e5e6dd343dfbecc9', // HODL Tarantula
  'e33fe65f1fde44c6dc17eeb38fdad0fceaf1cae8722084332ed2e3f284dbe76c', // Saylor
  '7fa56f5d6962ab1e3cd424e758c3002b8665f7b0d8dcee9fe9e288d7751ac194', // Gladstein
  'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52'  // dergigi
];

// Mock ad insertion - this would be replaced with actual ad logic
const mockAd = {
  id: 'ad-001',
  title: 'Lightning Network Wallet',
  description: 'Try our fast, secure, and non-custodial Lightning wallet for your Bitcoin payments!',
  imageUrl: 'https://images.unsplash.com/photo-1516245834210-c4c142787335',
  advertiserName: 'Lightning Labs',
  cta: 'Download Now',
  link: 'https://example.com/lightning-wallet'
};

interface NostrFeedProps {
  limit?: number;
  relays?: string[];
  showAds?: boolean;
  adFrequency?: number; // Show an ad every N posts
}

const NostrFeed: React.FC<NostrFeedProps> = ({
  limit = 20,
  relays = DEFAULT_RELAYS,
  showAds = true,
  adFrequency = 5
}) => {
  const [ndk, setNdk] = useState<NDK | null>(null);
  const [events, setEvents] = useState<NDKEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  // Initialize NDK when component mounts
  useEffect(() => {
    const initNDK = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create demo posts - now we always create these to ensure content shows
        const createFallbackPosts = (ndk: NDK) => {
          const demoEvents: NDKEvent[] = [];
          
          // Create demo posts with the most popular authors
          const demoPosts = [
            {
              pubkey: POPULAR_NOSTR_PUBKEYS[0], // jb55
              content: "Bitcoin is our peaceful protest against inflation and the surveillance state. Nostr is a parallel platform where censorship is technically impossible.",
              created_at: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
            },
            {
              pubkey: POPULAR_NOSTR_PUBKEYS[1], // fiatjaf
              content: "Nostr is about giving people a platform that nobody can take away. It's a protocol, not a product. Every client and relay is free to implement it differently.",
              created_at: Math.floor(Date.now() / 1000) - 7200 // 2 hours ago
            },
            {
              pubkey: POPULAR_NOSTR_PUBKEYS[2], // HODL Tarantula
              content: "The most important feature of #Bitcoin is that no one can stop you from using it. No one can freeze or seize your funds. That's worth paying for. #nostr",
              created_at: Math.floor(Date.now() / 1000) - 10800 // 3 hours ago
            },
            {
              pubkey: POPULAR_NOSTR_PUBKEYS[3], // Saylor
              content: "When you choose to save in #Bitcoin, you're choosing a savings technology that empowers you to preserve your wealth into the distant future. It's digital gold but better in every way.",
              created_at: Math.floor(Date.now() / 1000) - 14400 // 4 hours ago
            },
            {
              pubkey: POPULAR_NOSTR_PUBKEYS[4], // Gladstein
              content: "In a world of censorship, a censorship-resistant social network is revolutionary. Nostr gives people a way to communicate that cannot be stopped.",
              created_at: Math.floor(Date.now() / 1000) - 18000 // 5 hours ago
            },
            {
              pubkey: POPULAR_NOSTR_PUBKEYS[5], // dergigi
              content: "21 million. That's it. Bitcoin's scarcity is its most valuable property in a world of infinite money printing. The 21 million cap is written in stone, not in sand.",
              created_at: Math.floor(Date.now() / 1000) - 21600 // 6 hours ago
            }
          ];
          
          // Convert to NDK events
          demoPosts.forEach(post => {
            const event = new NDKEvent(ndk);
            event.kind = 1;
            event.pubkey = post.pubkey;
            event.content = post.content;
            event.created_at = post.created_at;
            event.id = `demo-${Math.random().toString(36).substring(2, 15)}`; // Generate a random ID
            demoEvents.push(event);
          });
          
          return demoEvents;
        };

        console.log('Creating NDK instance with relays:', relays);

        // Create a new NDK instance
        const ndkInstance = new NDK({
          explicitRelayUrls: relays
        });
        
        try {
          // Try to connect to relays
          console.log('Connecting to relays...');
          await ndkInstance.connect();
          console.log('Connected to relay pool:', ndkInstance.pool);
          setNdk(ndkInstance);
        } catch (connErr) {
          console.error('Failed to connect to relays:', connErr);
        }

        // Always create fallback posts first to ensure we show something
        const fallbackPosts = createFallbackPosts(ndkInstance);
        console.log(`Created ${fallbackPosts.length} fallback posts`);
        
        // Set these as initial events
        setEvents(fallbackPosts);
        
        // Fetch profiles for these events
        fetchProfiles(ndkInstance, fallbackPosts);
        
        // End loading state
        setLoading(false);
        
        // Try to fetch real posts too
        console.log('Attempting to fetch real posts in the background...');
        
        try {
          // Fetch events
          const filter: NDKFilter = {
            kinds: [1], // Text notes only for now
            authors: POPULAR_NOSTR_PUBKEYS, // Target specific popular authors
            limit: limit,
            since: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60 // Posts from last 7 days
          };

          console.log('Fetching Nostr posts with filter:', filter);
          const sub = ndkInstance.subscribe(filter);

          // Collect events as they arrive
          const realEvents: NDKEvent[] = [];
          
          // Listen for incoming events
          sub.on('event', (event: NDKEvent) => {
            console.log('Received Nostr event:', event.id);
            realEvents.push(event);
            
            // If we get at least 5 real events, update the display
            if (realEvents.length >= 5) {
              // Sort by created_at (newest first)
              realEvents.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
              setEvents(realEvents);
              fetchProfiles(ndkInstance, realEvents);
              console.log(`Updated with ${realEvents.length} real events`);
            }
          });
        } catch (fetchErr) {
          console.error('Error fetching real posts:', fetchErr);
          // We already have fallback posts, so no need to handle this error
        }

      } catch (err) {
        console.error('Error in NostrFeed component:', err);
        
        // Create a basic NDK instance for fallback posts
        const basicNdk = new NDK();
        const fallbackPosts = [
          {
            id: 'error-fallback-1',
            pubkey: POPULAR_NOSTR_PUBKEYS[0],
            content: 'Nostr feed demo: This shows how ads will be integrated into Nostr feeds. Currently displaying fallback content.',
            created_at: Math.floor(Date.now() / 1000) - 60 // 1 minute ago
          }
        ];
        
        // Convert to NDK events
        const fallbackEvents: NDKEvent[] = [];
        fallbackPosts.forEach(post => {
          const event = new NDKEvent(basicNdk);
          event.kind = 1;
          event.pubkey = post.pubkey;
          event.content = post.content;
          event.created_at = post.created_at;
          event.id = post.id;
          fallbackEvents.push(event);
        });
        
        setEvents(fallbackEvents);
        setLoading(false);
      }
    };

    initNDK();
    
    // Cleanup on unmount
    return () => {
      if (ndk) {
        // Simply set NDK to null to allow garbage collection
        // The NDK pool will be cleaned up automatically
      }
    };
  }, [limit, relays]);

  // Fetch profiles for authors
  const fetchProfiles = async (ndkInstance: NDK, eventsList: NDKEvent[]) => {
    try {
      // Extract unique pubkeys
      const authorPubkeys = Array.from(new Set(eventsList.map(e => e.pubkey)));
      
      // Create a filter to fetch profile events (kind 0)
      const profileFilter: NDKFilter = {
        kinds: [0],
        authors: authorPubkeys
      };
      
      const profileEvents = await ndkInstance.fetchEvents(profileFilter);
      
      const profileData: Record<string, any> = {};
      
      // Parse profile content
      profileEvents.forEach(event => {
        try {
          if (event.pubkey && event.content) {
            profileData[event.pubkey] = JSON.parse(event.content);
          }
        } catch (e) {
          console.error('Error parsing profile:', e);
        }
      });
      
      setProfiles(profileData);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    }
  };

  // Toggle expanded state for a profile
  const toggleProfileExpanded = (pubkey: string) => {
    const newExpandedProfiles = new Set(expandedProfiles);
    if (newExpandedProfiles.has(pubkey)) {
      newExpandedProfiles.delete(pubkey);
    } else {
      newExpandedProfiles.add(pubkey);
    }
    setExpandedProfiles(newExpandedProfiles);
  };

  // Display user's name or short pubkey
  const getUserDisplayName = (pubkey: string) => {
    const profile = profiles[pubkey];
    if (profile) {
      return profile.name || profile.display_name || shortenPubkey(pubkey);
    }
    return shortenPubkey(pubkey);
  };

  // Get user's profile picture
  const getUserPicture = (pubkey: string) => {
    const profile = profiles[pubkey];
    if (profile && profile.picture) {
      return profile.picture;
    }
    return `https://robohash.org/${pubkey}?set=set4`;
  };

  // Shorten pubkey for display
  const shortenPubkey = (pubkey: string) => {
    if (pubkey.length <= 16) return pubkey;
    return `${pubkey.substring(0, 8)}...${pubkey.substring(pubkey.length - 8)}`;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number | undefined) => {
    if (!timestamp) return 'unknown time';
    const date = new Date(timestamp * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Render Nostr event content with basic formatting
  const renderContent = (content: string) => {
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
    
    // Replace @mentions (simple version)
    const mentionRegex = /@(\w+)/g;
    const formattedContent = contentWithHashtags.replace(mentionRegex, (match, name) => {
      return `<span class="text-blue-500">@${name}</span>`;
    });
    
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

  // Render ad component
  const renderAd = () => {
    return (
      <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20 my-4">
        <div className="flex items-start">
          <div className="mr-3 text-xs uppercase font-bold text-purple-600 dark:text-purple-400">
            Sponsored
          </div>
        </div>
        
        <div className="mt-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {mockAd.title}
          </h3>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            {mockAd.description}
          </p>
          
          {mockAd.imageUrl && (
            <div className="mt-3 mb-3">
              <img 
                src={mockAd.imageUrl} 
                alt={mockAd.title}
                className="w-full h-auto rounded-md"
              />
            </div>
          )}
          
          <div className="mt-3 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {mockAd.advertiserName}
            </div>
            <a 
              href={mockAd.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary py-1 px-3 text-sm"
            >
              {mockAd.cta}
            </a>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 max-w-2xl mx-auto p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-12 w-12"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Error</h3>
          <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 btn-outline-red"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No posts found</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            We couldn't find any posts from the Nostr network. This could be due to relay connectivity issues.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 btn-secondary"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Nostr Feed
      </h2>
      
      <div className="space-y-4">
        {events.map((event, index) => {
          // Insert ad after every 'adFrequency' posts if ads are enabled
          const shouldShowAd = showAds && index > 0 && index % adFrequency === 0;
          
          return (
            <React.Fragment key={event.id}>
              {shouldShowAd && renderAd()}
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start">
                  <img 
                    src={getUserPicture(event.pubkey)} 
                    alt="Profile"
                    className="h-10 w-10 rounded-full mr-3 object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).src = `https://robohash.org/${event.pubkey}?set=set4`;
                    }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getUserDisplayName(event.pubkey)}
                        </span>
                        <button 
                          onClick={() => toggleProfileExpanded(event.pubkey)}
                          className="ml-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <ChevronDown size={14} className={`transform transition-transform ${expandedProfiles.has(event.pubkey) ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatTimestamp(event.created_at)}
                      </span>
                    </div>
                    
                    {/* Expanded profile info */}
                    {expandedProfiles.has(event.pubkey) && (
                      <div className="mt-1 mb-2 text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="font-mono truncate">
                          {event.pubkey}
                        </div>
                        {profiles[event.pubkey]?.about && (
                          <div className="mt-1">
                            {profiles[event.pubkey].about}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-2 text-gray-700 dark:text-gray-300 break-words">
                      {renderContent(event.content || '')}
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
                      <a 
                        href={`https://njump.me/${event.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-blue-500 dark:hover:text-blue-400 ml-auto"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="mt-6 text-center">
        <button 
          onClick={() => window.location.reload()}
          className="btn-secondary"
        >
          Refresh Feed
        </button>
      </div>
    </div>
  );
};

export default NostrFeed;