import { createClient } from '@/lib/supabase/client';
import type { UserStats } from '@/types';

const supabase = createClient();

export async function getInfluencerStats(influencerId: string): Promise<UserStats> {
  // Get campaign counts
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, status, budget')
    .eq('influencer_id', influencerId);

  // Get pending requests count
  const { count: pendingRequests } = await supabase
    .from('collaboration_requests')
    .select('*', { count: 'exact', head: true })
    .eq('influencer_id', influencerId)
    .eq('status', 'requested');

  // Get average rating
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', influencerId);

  const activeCampaigns = campaigns?.filter(c => 
    c.status === 'accepted' || c.status === 'in_progress'
  ).length || 0;

  const completedCampaigns = campaigns?.filter(c => 
    c.status === 'completed'
  ).length || 0;

  const totalEarnings = campaigns?.filter(c => 
    c.status === 'completed'
  ).reduce((sum, c) => sum + (c.budget || 0), 0) || 0;

  const averageRating = reviews?.length 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : undefined;

  return {
    totalCampaigns: campaigns?.length || 0,
    activeCampaigns,
    pendingRequests: pendingRequests || 0,
    completedCampaigns,
    totalEarnings,
    averageRating,
  };
}

export async function getBrandStats(brandId: string): Promise<UserStats> {
  // Get campaign counts
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, status, budget')
    .eq('brand_id', brandId);

  // Get pending requests count (awaiting influencer response)
  const { count: pendingRequests } = await supabase
    .from('collaboration_requests')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brandId)
    .eq('status', 'requested');

  // Get average rating
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', brandId);

  const activeCampaigns = campaigns?.filter(c => 
    c.status === 'accepted' || c.status === 'in_progress'
  ).length || 0;

  const completedCampaigns = campaigns?.filter(c => 
    c.status === 'completed'
  ).length || 0;

  const totalSpent = campaigns?.filter(c => 
    c.status === 'completed'
  ).reduce((sum, c) => sum + (c.budget || 0), 0) || 0;

  const averageRating = reviews?.length 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : undefined;

  return {
    totalCampaigns: campaigns?.length || 0,
    activeCampaigns,
    pendingRequests: pendingRequests || 0,
    completedCampaigns,
    totalSpent,
    averageRating,
  };
}
