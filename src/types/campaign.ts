export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'COMPLETED' | 'REJECTED';

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