// ============================================================
// src/lib/supabase/upload.ts
// Shared file-upload helper — consolidates the ~8 near-identical
// upload functions that were duplicated across bikes/events/
// profile/hazards/missing-bikes/feed services.
// ============================================================
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

interface UploadOptions {
  /** Pass true for buckets where re-uploading to the same logical
   *  slot should overwrite (e.g. avatar, cover, event cover). */
  upsert?: boolean
  /** Optional prefix for the filename segment (e.g. an entity id),
   *  so paths stay recognizable instead of pure timestamp+random. */
  fileNamePrefix?: string
}

export async function uploadToBucket(
  supabase: SupabaseClient<Database>,
  bucket: string,
  userId: string,
  file: File,
  options: UploadOptions = {}
): Promise<{ url?: string; error?: string }> {
  const ext = file.name.split('.').pop()
  const namePart = options.fileNamePrefix
    ? `${options.fileNamePrefix}-${Date.now()}`
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const path = `${userId}/${namePart}.${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: options.upsert ?? false })

  if (error) return { error: error.message }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: data.publicUrl }
}