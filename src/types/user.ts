import type { User } from './auth';
import type { NicheCategory } from './enums';

// Influencer profile
export interface Influencer {
  id: string;
  user_id: string;
  bio: string | null;
  niche: NicheCategory | null;
  platforms: string[];
  instagram_handle: string | null;
  instagram_followers: number;
  tiktok_handle: string | null;
  tiktok_followers: number;
  youtube_handle: string | null;
  youtube_subscribers: number;
  twitter_handle: string | null;
  twitter_followers: number;
  rate_per_post: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Influencer with user profile (joined)
export interface InfluencerWithProfile extends Influencer {
  user: User;
}

// Influencer profile form data
export interface InfluencerFormData {
  niche: NicheCategory | null;
  bio?: string;
  instagram_handle?: string;
  instagram_followers?: number;
  tiktok_handle?: string;
  tiktok_followers?: number;
  youtube_handle?: string;
  youtube_subscribers?: number;
  twitter_handle?: string;
  twitter_followers?: number;
  rate_per_post?: number;
  is_available: boolean;
}

// Influencer search/filter params
export interface InfluencerSearchParams {
  query?: string;
  niche?: NicheCategory;
  minFollowers?: number;
  maxFollowers?: number;
  platform?: 'instagram' | 'tiktok' | 'youtube' | 'twitter';
  availability?: boolean;
  minEngagement?: number;
  maxRatePerPost?: number;
  page?: number;
  limit?: number;
  sortBy?: 'followers' | 'engagement' | 'rate' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

// Brand profile
export interface Brand {
  id: string;
  company_name: string;
  company_logo_url: string | null;
  company_description: string | null;
  website: string | null;
  industry: string | null;
  created_at: string;
  updated_at: string;
}

// Brand with user profile (joined)
export interface BrandWithProfile extends Brand {
  user: User;
}

// Brand profile form data
export interface BrandFormData {
  company_name: string;
  company_description?: string;
  website?: string;
  industry?: string;
}
