import { createClient } from '@/lib/supabase/client';
import type { User, Influencer, InfluencerWithProfile, InfluencerSearchParams, PaginatedResponse } from '@/types';

const supabase = createClient();

export async function getInfluencers(
  params: InfluencerSearchParams = {}
): Promise<PaginatedResponse<InfluencerWithProfile>> {
  const {
    query,
    niche,
    minFollowers,
    maxFollowers,
    platform = 'instagram',
    availability,
    minEngagement,
    maxRatePerPost,
    page = 1,
    limit = 10,
    sortBy = 'followers',
    sortOrder = 'desc',
  } = params;

  let queryBuilder = supabase
    .from('influencers')
    .select(`
      *,
      user:users(*)
    `, { count: 'exact' });

  // Apply filters
  if (niche) {
    queryBuilder = queryBuilder.eq('niche', niche);
  }

  if (availability !== undefined) {
    queryBuilder = queryBuilder.eq('is_available', availability);
  }

  if (minEngagement) {
    queryBuilder = queryBuilder.gte('engagement_rate', minEngagement);
  }

  if (maxRatePerPost) {
    queryBuilder = queryBuilder.lte('rate_per_post', maxRatePerPost);
  }

  // Platform-specific follower filters
  const followerColumn = `${platform}_followers`;
  if (minFollowers) {
    queryBuilder = queryBuilder.gte(followerColumn, minFollowers);
  }
  if (maxFollowers) {
    queryBuilder = queryBuilder.lte(followerColumn, maxFollowers);
  }

  // Sorting
  const sortColumn = sortBy === 'followers' ? followerColumn :
                     sortBy === 'engagement' ? 'engagement_rate' :
                     sortBy === 'rate' ? 'rate_per_post' : 'created_at';
  queryBuilder = queryBuilder.order(sortColumn, { ascending: sortOrder === 'asc' });

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  queryBuilder = queryBuilder.range(from, to);

  const { data, error, count } = await queryBuilder;

  if (error) {
    throw new Error(error.message);
  }

  // Filter by name search query if provided (done client-side for now)
  let filteredData = data || [];
  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredData = filteredData.filter((influencer) => {
      const fullName = `${influencer.user?.first_name} ${influencer.user?.last_name}`.toLowerCase();
      return fullName.includes(lowerQuery);
    });
  }

  return {
    data: filteredData as InfluencerWithProfile[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getInfluencerById(id: string): Promise<InfluencerWithProfile | null> {
  const { data, error } = await supabase
    .from('influencers')
    .select(`
      *,
      user:users(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as InfluencerWithProfile;
}

export async function getInfluencerByUserId(userId: string): Promise<InfluencerWithProfile | null> {
  const { data, error } = await supabase
    .from('influencers')
    .select(`
      *,
      user:users(*)
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching influencer by user_id:', error);
    return null;
  }

  return data as InfluencerWithProfile;
}

export async function updateInfluencerProfile(
  id: string,
  updates: Partial<Influencer>
): Promise<Influencer> {
  const { data, error } = await supabase
    .from('influencers')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Influencer;
}

export async function updateUserProfile(
  id: string,
  updates: Partial<User>
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as User;
}

export async function uploadProfilePicture(
  userId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/profile.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  // Update user profile with new picture URL
  await updateUserProfile(userId, { profile_picture_url: data.publicUrl });

  return data.publicUrl;
}
