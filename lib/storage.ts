import { supabase } from '@/lib/supabase';

const BUCKET = 'user-card-images';

/**
 * For private buckets, create a time-limited URL for Image components.
 * If the path is already https, return as-is.
 */
export async function resolveStorageImageUrl(pathOrUrl: string | null): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith('http')) return pathOrUrl;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(pathOrUrl, 3600);
  if (error) {
    console.warn('[storage] signed url failed', error.message);
    return null;
  }
  return data.signedUrl;
}
