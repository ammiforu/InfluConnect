import { createClient } from '@/lib/supabase/client';
import type {
  CollaborationRequest,
  CollaborationRequestWithDetails,
  CreateRequestFormData,
  RequestFilterParams,
  PaginatedResponse,
  RequestStatus,
} from '@/types';

export async function createRequest(
  brandId: string,
  data: CreateRequestFormData
): Promise<CollaborationRequest> {
  const supabase = createClient();
  const { data: request, error } = await supabase
    .from('collaboration_requests')
    .insert({
      brand_id: brandId,
      influencer_id: data.influencer_id,
      campaign_title: data.campaign_title,
      campaign_description: data.campaign_description,
      requirements: data.requirements || null,
      budget: data.budget,
      start_date: data.start_date,
      end_date: data.end_date,
      status: 'requested',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return request as CollaborationRequest;
}

export async function getRequestById(id: string): Promise<CollaborationRequestWithDetails | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('collaboration_requests')
    .select(`
      *,
      brand:brands(*, user:users(*)),
      influencer:influencers(*, user:users(*))
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CollaborationRequestWithDetails;
}

export async function getRequestsForInfluencer(
  userId: string,
  params: RequestFilterParams = {}
): Promise<PaginatedResponse<CollaborationRequestWithDetails>> {
  const supabase = createClient();
  const { status, page = 1, limit = 10 } = params;

  // First get the influencer ID from user_id
  const { data: influencer } = await supabase
    .from('influencers')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!influencer) {
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  let query = supabase
    .from('collaboration_requests')
    .select(`
      *,
      brand:brands(*, user:users(*)),
      influencer:influencers(*, user:users(*))
    `, { count: 'exact' })
    .eq('influencer_id', influencer.id)
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
    data: (data || []) as CollaborationRequestWithDetails[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getRequestsForBrand(
  userId: string,
  params: RequestFilterParams = {}
): Promise<PaginatedResponse<CollaborationRequestWithDetails>> {
  const supabase = createClient();
  const { status, page = 1, limit = 10 } = params;

  // First get the brand ID from user_id
  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!brand) {
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  let query = supabase
    .from('collaboration_requests')
    .select(`
      *,
      brand:brands(*, user:users(*)),
      influencer:influencers(*, user:users(*))
    `, { count: 'exact' })
    .eq('brand_id', brand.id)
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
    data: (data || []) as CollaborationRequestWithDetails[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
): Promise<CollaborationRequest> {
  const supabase = createClient();
  const updateData = {
    status,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('collaboration_requests')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // If accepted, create a campaign
  if (status === 'accepted') {
    const request = data as CollaborationRequest;
    await createCampaignFromRequest(request);
  }

  return data as CollaborationRequest;
}

async function createCampaignFromRequest(request: CollaborationRequest): Promise<void> {
  const supabase = createClient();
  
  // Check if campaign already exists for this request
  const { data: existingCampaign } = await supabase
    .from('campaigns')
    .select('id')
    .eq('request_id', request.id)
    .single();

  if (existingCampaign) {
    console.log('Campaign already exists for request:', request.id);
    return; // Campaign already exists, don't create a duplicate
  }

  const { error: campaignError } = await supabase
    .from('campaigns')
    .insert({
      request_id: request.id,
      brand_id: request.brand_id,
      influencer_id: request.influencer_id,
      title: request.campaign_title,
      description: request.campaign_description,
      requirements: request.requirements || null,
      status: 'accepted',
      progress_percentage: 0,
      budget: request.budget,
      start_date: request.start_date,
      deadline: request.end_date, // Use end_date as deadline
    });

  if (campaignError) {
    console.error('Error creating campaign:', campaignError);
    throw new Error(campaignError.message);
  }
}

export async function deleteRequest(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('collaboration_requests')
    .delete()
    .eq('id', id)
    .eq('status', 'requested'); // Can only delete pending requests

  if (error) {
    throw new Error(error.message);
  }
}
