import { UserRole } from "@/types/role";
// Analytics service for fetching data for charts and dashboards

// Type definitions
export interface DateRange {
  start: string;
  end: string;
}

export interface DailyMetrics {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  earnings: number; // For publishers, spend for advertisers
}

export interface CampaignPerformance {
  id: string;
  name: string;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  remaining: number;
  status: 'active' | 'paused' | 'completed' | 'draft';
}

export interface AdSpacePerformance {
  id: string;
  name: string;
  impressions: number;
  clicks: number;
  ctr: number;
  earnings: number;
  status: 'active' | 'paused';
}

/**
 * Fetch advertiser performance summary
 * @param advertiserId Optional advertiser ID, uses current user if not provided
 * @param dateRange Optional date range, defaults to last 7 days
 * @returns Summary data
 */
export const fetchAdvertiserSummary = async (
  advertiserId?: string,
  dateRange?: DateRange
): Promise<any> => {
  const query = new URLSearchParams();
  
  if (dateRange) {
    query.append('start', dateRange.start);
    query.append('end', dateRange.end);
  }
  
  if (advertiserId) {
    query.append('advertiserId', advertiserId);
  }
  
  const response = await fetch(`/api/analytics/advertiser/summary?${query.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch advertiser summary');
  }
  
  return response.json();
};

/**
 * Fetch advertiser daily metrics
 * @param advertiserId Optional advertiser ID, uses current user if not provided
 * @param dateRange Optional date range, defaults to last 7 days
 * @returns Array of daily metrics
 */
export const fetchAdvertiserDailyMetrics = async (
  advertiserId?: UserRole,
  dateRange?: DateRange
): Promise<DailyMetrics[]> => {
  const query = new URLSearchParams();
  
  if (dateRange) {
    query.append('start', dateRange.start);
    query.append('end', dateRange.end);
  }
  
  if (advertiserId) {
    query.append('advertiserId', advertiserId);
  }
  
  const response = await fetch(`/api/analytics/advertiser/daily?${query.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch advertiser daily metrics');
  }
  
  return response.json();
};

/**
 * Fetch campaign performance metrics
 * @param advertiserId Optional advertiser ID, uses current user if not provided
 * @param dateRange Optional date range, defaults to last 7 days
 * @returns Array of campaign performance data
 */
export const fetchCampaignPerformance = async (
  advertiserId?: UserRole,
  dateRange?: DateRange
): Promise<CampaignPerformance[]> => {
  const query = new URLSearchParams();
  
  if (dateRange) {
    query.append('start', dateRange.start);
    query.append('end', dateRange.end);
  }
  
  if (advertiserId) {
    query.append('advertiserId', advertiserId);
  }
  
  const response = await fetch(`/api/analytics/advertiser/campaigns?${query.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch campaign performance');
  }
  
  return response.json();
};

/**
 * Fetch publisher earnings data
 * @param publisherId Optional publisher ID, uses current user if not provided
 * @param dateRange Optional date range, defaults to last 7 days
 * @returns Array of daily earnings metrics
 */
export const fetchPublisherEarnings = async (
  publisherId?: UserRole,
  dateRange?: DateRange
): Promise<DailyMetrics[]> => {
  const query = new URLSearchParams();
  
  if (dateRange) {
    query.append('start', dateRange.start);
    query.append('end', dateRange.end);
  }
  
  if (publisherId) {
    query.append('publisherId', publisherId);
  }
  
  const response = await fetch(`/api/analytics/publisher/earnings?${query.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch publisher earnings');
  }
  
  return response.json();
};

/**
 * Fetch ad space performance data
 * @param publisherId Optional publisher ID, uses current user if not provided
 * @param dateRange Optional date range, defaults to last 7 days
 * @returns Array of ad space performance data
 */
export const fetchAdSpacePerformance = async (
  dateRange?: DateRange
): Promise<AdSpacePerformance[]> => {
  const query = new URLSearchParams();
  
  if (dateRange) {
    query.append('start', dateRange.start);
    query.append('end', dateRange.end);
  }
  
  const response = await fetch(`/api/analytics/publisher/adspaces?${query.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch ad space performance');
  }
  
  return response.json();
};