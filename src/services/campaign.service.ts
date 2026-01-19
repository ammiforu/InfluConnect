import { createClient } from '@/lib/supabase/client';
import type {
  Campaign,
  CampaignWithDetails,
  CampaignFilterParams,
  CampaignStatus,
  Deliverable,
  PaginatedResponse,
} from '@/types';

const supabase = createClient();

export async function getCampaignById(id: string): Promise<CampaignWithDetails | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      brand:brands(*, user:users(*)),
      influencer:influencers(*, user:users(*)),
      deliverables(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CampaignWithDetails;
}

export async function getCampaignsForUser(
  userId: string,
  role: 'influencer' | 'brand',
  params: CampaignFilterParams = {}
): Promise<PaginatedResponse<CampaignWithDetails>> {
  const { status, page = 1, limit = 10 } = params;

  const idColumn = role === 'influencer' ? 'influencer_id' : 'brand_id';

  let query = supabase
    .from('campaigns')
    .select(`
      *,
      brand:brands(*, user:users(*)),
      influencer:influencers(*, user:users(*)),
      deliverables(*)
    `, { count: 'exact' })
    .eq(idColumn, userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: (data || []) as CampaignWithDetails[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function updateCampaignStatus(
  id: string,
  status: CampaignStatus
): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Also update the collaboration request status
  await supabase
    .from('collaboration_requests')
    .update({
      status: status === 'in_progress' ? 'in_progress' : status === 'completed' ? 'completed' : status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  return data as Campaign;
}

export async function updateCampaignProgress(
  id: string,
  progressPercentage: number
): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .update({
      progress_percentage: progressPercentage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Campaign;
}

// Deliverable functions
export async function getDeliverables(campaignId: string): Promise<Deliverable[]> {
  const { data, error } = await supabase
    .from('deliverables')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at');

  if (error) {
    throw new Error(error.message);
  }

  return data as Deliverable[];
}

export async function submitDeliverable(
  id: string,
  submissionUrl: string,
  submissionNotes?: string
): Promise<Deliverable> {
  const { data, error } = await supabase
    .from('deliverables')
    .update({
      submission_url: submissionUrl,
      submission_notes: submissionNotes,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Update campaign progress
  await updateCampaignProgressFromDeliverables(data.campaign_id);

  return data as Deliverable;
}

export async function approveDeliverable(id: string): Promise<Deliverable> {
  const { data, error } = await supabase
    .from('deliverables')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Update campaign progress
  await updateCampaignProgressFromDeliverables(data.campaign_id);

  return data as Deliverable;
}

export async function rejectDeliverable(
  id: string,
  rejectionReason: string
): Promise<Deliverable> {
  const { data, error } = await supabase
    .from('deliverables')
    .update({
      status: 'rejected',
      rejection_reason: rejectionReason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Deliverable;
}

async function updateCampaignProgressFromDeliverables(campaignId: string): Promise<void> {
  const deliverables = await getDeliverables(campaignId);
  const approved = deliverables.filter((d) => d.status === 'approved').length;
  const progress = Math.round((approved / deliverables.length) * 100);

  await updateCampaignProgress(campaignId, progress);

  // If all deliverables approved, mark campaign as completed
  if (progress === 100) {
    await updateCampaignStatus(campaignId, 'completed');
  }
}
