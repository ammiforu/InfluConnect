import type { User } from './auth';

// Review
export interface Review {
  id: string;
  campaign_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

// Review with user info
export interface ReviewWithUser extends Review {
  reviewer: User;
  reviewee: User;
}

// Create review form data
export interface CreateReviewFormData {
  rating: number;
  comment?: string;
}

// User stats (for dashboard)
export interface UserStats {
  totalCampaigns: number;
  activeCampaigns: number;
  pendingRequests: number;
  completedCampaigns: number;
  totalEarnings?: number; // For influencers
  totalSpent?: number; // For brands
  averageRating?: number;
}
