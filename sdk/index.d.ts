/**
 * Proof Of Reach JavaScript SDK TypeScript Definitions
 */

export interface SDKConfig {
  /** Your API key for authentication */
  apiKey: string;
  /** Optional base URL for the API (defaults to production) */
  baseUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
}

export interface ServeAdOptions {
  /** Placement type (feed, sidebar, banner, etc.) */
  placement?: 'feed' | 'sidebar' | 'banner' | 'sponsored' | 'native' | string;
  /** Publisher's Nostr public key */
  pubkey?: string;
  /** Content interests for targeting */
  interests?: string | string[];
  /** Ad format (text, image, text-image, rich) */
  format?: 'text' | 'image' | 'text-image' | 'rich';
}

export interface TrackClickOptions {
  /** The ID of the ad that was clicked */
  adId: string;
  /** Publisher's Nostr public key */
  pubkey?: string;
  /** Where the ad was displayed */
  placement?: string;
}

export interface StatsOptions {
  /** Start date for the stats period (YYYY-MM-DD) */
  startDate?: string;
  /** End date for the stats period (YYYY-MM-DD) */
  endDate?: string;
}

export interface Ad {
  /** The unique identifier for the ad */
  id: string;
  /** The headline of the ad */
  title: string;
  /** The body text of the ad */
  description: string;
  /** URL to the ad image (optional) */
  imageUrl?: string;
  /** The destination URL where users will be directed when clicking the ad */
  targetUrl: string;
  /** Additional URL parameters for tracking (optional) */
  urlParameters?: string;
  /** Amount to pay per impression in satoshis */
  bidPerImpression: number;
  /** Amount to pay per click in satoshis */
  bidPerClick: number;
  /** Current status of the ad */
  status: 'ACTIVE' | 'PAUSED' | 'PENDING' | 'REJECTED';
  /** Maximum views per user in frequency capping period */
  freqCapViews?: number;
  /** Frequency capping period in hours */
  freqCapHours?: number;
  /** Geographic locations to target (optional) */
  targetLocation?: string[];
  /** User interests to target (optional) */
  targetInterests?: string[];
  /** Age groups to target (optional) */
  targetAge?: string[];
  /** The ID of the campaign this ad belongs to */
  campaignId: string;
  /** When the ad was created */
  createdAt: string;
  /** When the ad was last updated */
  updatedAt: string;
}

export interface PublisherStats {
  /** Total impressions for the period */
  impressions: number;
  /** Total clicks for the period */
  clicks: number;
  /** Click-through rate (clicks / impressions) */
  ctr: number;
  /** Total earnings in satoshis */
  earnings: number;
  /** Daily breakdown of stats */
  daily: {
    /** The date (YYYY-MM-DD) */
    date: string;
    /** Impressions for this day */
    impressions: number;
    /** Clicks for this day */
    clicks: number;
    /** Earnings for this day in satoshis */
    earnings: number;
  }[];
}

export declare class ProofOfReachSDK {
  /**
   * Creates a new instance of the ProofOfReachSDK
   */
  constructor(config: SDKConfig);

  /**
   * Retrieve a targeted ad for display
   */
  serveAd(options?: ServeAdOptions): Promise<Ad | null>;

  /**
   * Track an ad click
   */
  trackClick(options: TrackClickOptions): Promise<any>;

  /**
   * Fetch publisher statistics
   */
  fetchPublisherStats(options?: StatsOptions): Promise<PublisherStats>;
}

export default ProofOfReachSDK;