import { createClient } from '@/lib/supabase/client';
import type { Brand, BrandWithProfile } from '@/types';

const supabase = createClient();

export async function getBrandById(id: string): Promise<BrandWithProfile | null> {
  const { data, error } = await supabase
    .from('brands')
    .select(`
      *,
      user:users(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as BrandWithProfile;
}

export async function updateBrandProfile(
  id: string,
  updates: Partial<Brand>
): Promise<Brand> {
  const { data, error } = await supabase
    .from('brands')
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

  return data as Brand;
}

export async function uploadCompanyLogo(
  brandId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${brandId}/logo.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from('logos')
    .getPublicUrl(fileName);

  // Update brand profile with new logo URL
  await updateBrandProfile(brandId, { company_logo_url: data.publicUrl });

  return data.publicUrl;
}
