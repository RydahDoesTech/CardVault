import * as FileSystem from 'expo-file-system';

import { supabase } from '@/lib/supabase';

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = globalThis.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Upload a local image file to private Storage under `{userId}/{fileName}`.
 * Stores object path suitable for `user_cards.front_image_url`.
 *
 * Bucket `user-card-images` must exist (see supabase/schema.sql).
 */
export async function uploadUserCardImage(params: {
  userId: string;
  localUri: string;
  fileName: string;
}): Promise<{ path: string }> {
  const base64 = await FileSystem.readAsStringAsync(params.localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const bytes = base64ToUint8Array(base64);
  const path = `${params.userId}/${params.fileName}`;

  const ext = params.fileName.split('.').pop()?.toLowerCase();
  const contentType =
    ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const { error } = await supabase.storage.from('user-card-images').upload(path, bytes, {
    contentType,
    upsert: true,
  });

  if (error) throw error;
  return { path };
}
