export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'COMPLETED' | 'REJECTED' | 'ENDED' | 'SCHEDULED' | 'REVIEW';

// Type-safe campaign status constants
export const ACTIVE_STATUS: CampaignStatus = 'ACTIVE';
export const PAUSED_STATUS: CampaignStatus = 'PAUSED';
export const DRAFT_STATUS: CampaignStatus = 'DRAFT';
export const COMPLETED_STATUS: CampaignStatus = 'COMPLETED';
export const REJECTED_STATUS: CampaignStatus = 'REJECTED';
export const ENDED_STATUS: CampaignStatus = 'ENDED';
export const SCHEDULED_STATUS: CampaignStatus = 'SCHEDULED';
export const REVIEW_STATUS: CampaignStatus = 'REVIEW';

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  campaignId: string;
  impressions?: number;
  clicks?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  targetAudience?: string;
  budget: number;
  status: CampaignStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignWithAds extends Campaign {
  ads: Ad[];
}

export interface CampaignCreateInput {
  name: string;
  description?: string;
  targetAudience?: string;
  budget: number;
  status: CampaignStatus;
}

export interface CampaignUpdateInput {
  name?: string;
  description?: string;
  targetAudience?: string;
  budget?: number;
  status?: CampaignStatus;
}