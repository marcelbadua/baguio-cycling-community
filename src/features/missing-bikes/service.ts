// ============================================================
// src/features/missing-bikes/service.ts
// ============================================================
import { createClient } from '@/lib/supabase/client'
import type { MissingBike, MissingBikeStatus, MissingBikeWithRelations } from '@/types/models'

const supabase = createClient() as any

const MISSING_SELECT = `
  *,
  bike:bikes(id, bike_id, nickname, brand, model, year, wheel_size, frame_size, photo_url),
  owner:profiles!owner_id(id, username, display_name, first_name, last_name, avatar_url)
`

export async function getActiveMissingBikes(): Promise<MissingBikeWithRelations[]> {
  const { data } = await supabase
    .from('missing_bikes')
    .select(MISSING_SELECT)
    .eq('status', 'missing')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getAllMissingBikes(): Promise<MissingBikeWithRelations[]> {
  const { data } = await supabase
    .from('missing_bikes')
    .select(MISSING_SELECT)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getMissingBikeById(id: string): Promise<MissingBikeWithRelations | null> {
  const { data } = await supabase
    .from('missing_bikes')
    .select(MISSING_SELECT)
    .eq('id', id)
    .single()
  return data
}

export async function getMyMissingReports(ownerId: string): Promise<MissingBikeWithRelations[]> {
  const { data } = await supabase
    .from('missing_bikes')
    .select(MISSING_SELECT)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createMissingBikeReport(payload: {
  bike_id: string
  owner_id: string
  last_seen_location?: string
  date_missing?: string
  description?: string
  contact_info?: string
  photos?: string[]
}): Promise<{ data?: MissingBike; error?: string }> {
  const { data, error } = await supabase
    .from('missing_bikes')
    .insert({ ...payload, status: 'missing' })
    .select(MISSING_SELECT)
    .single()

  if (error) return { error: error.message }

  // Mark the bike as missing
  await supabase
    .from('bikes')
    .update({ is_missing: true, updated_at: new Date().toISOString() })
    .eq('id', payload.bike_id)

  return { data: data as MissingBike }
}

export async function updateMissingBikeReport(
  id: string,
  updates: Partial<MissingBike>
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('missing_bikes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  return error ? { error: error.message } : {}
}

export async function markAsRecovered(
  reportId: string,
  bikeId: string
): Promise<{ error?: string }> {
  const now = new Date().toISOString()

  const { error: reportError } = await supabase
    .from('missing_bikes')
    .update({ status: 'recovered', recovered_at: now, updated_at: now })
    .eq('id', reportId)

  if (reportError) return { error: reportError.message }

  // Un-flag the bike
  const { error: bikeError } = await supabase
    .from('bikes')
    .update({ is_missing: false, updated_at: now })
    .eq('id', bikeId)

  return bikeError ? { error: bikeError.message } : {}
}

export async function uploadMissingBikePhotos(
  ownerId: string,
  reportId: string,
  files: File[]
): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = []
  const errors: string[] = []

  for (const file of files) {
    const ext = file.name.split('.').pop()
    const path = `${ownerId}/${reportId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage
      .from('missing-bikes')
      .upload(path, file, { upsert: true })
    if (error) {
      errors.push(error.message)
    } else {
      const { data } = supabase.storage.from('missing-bikes').getPublicUrl(path)
      urls.push(data.publicUrl)
    }
  }
  return { urls, errors }
}

export async function getMissingBikeComments(reportId: string) {
  const { data } = await supabase
    .from('comments')
.select('*, author:profiles!author_id(id, username, display_name, first_name, last_name, avatar_url)')
    .eq('missing_bike_id', reportId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function addMissingBikeComment(payload: {
  missing_bike_id: string
  author_id: string
  content: string
}) {
  const { data, error } = await supabase
    .from('comments')
    .insert(payload)
    .select('*, author:profiles!author_id(id, username, display_name, first_name, last_name, avatar_url)')

    .single()
  return error ? { error: error.message } : { data }
}

export async function searchMissingBikes(query: string): Promise<MissingBikeWithRelations[]> {
  const { data } = await supabase
    .from('missing_bikes')
    .select(MISSING_SELECT)
    .eq('status', 'missing')
    .or(`last_seen_location.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
}
