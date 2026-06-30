// ============================================================
// src/features/bikes/service.ts
// ============================================================
import { createClient } from '@/lib/supabase/client'
import type { Bike } from '@/types/database'

const supabase = createClient()

export async function getMyBikes(ownerId: string): Promise<Bike[]> {
  const { data } = await supabase
    .from('bikes')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getBikeById(id: string): Promise<Bike | null> {
  const { data } = await supabase
    .from('bikes')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function createBike(
  ownerId: string,
  bike: Omit<Partial<Bike>, 'id' | 'owner_id' | 'bike_id' | 'created_at' | 'updated_at'>
): Promise<{ data?: Bike; error?: string }> {
  const { data, error } = await supabase
    .from('bikes')
    .insert({ ...bike, owner_id: ownerId })
    .select()
    .single()
  return error ? { error: error.message } : { data }
}

export async function updateBike(
  id: string,
  updates: Partial<Bike>
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('bikes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  return error ? { error: error.message } : {}
}

export async function deleteBike(id: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('bikes').delete().eq('id', id)
  return error ? { error: error.message } : {}
}

export async function uploadBikePhoto(
  userId: string,
  bikeId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${bikeId}-${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('bikes')
    .upload(path, file, { upsert: true })
  if (error) return { error: error.message }
  const { data } = supabase.storage.from('bikes').getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function markBikeAsMissing(bikeId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('bikes')
    .update({ is_missing: true, updated_at: new Date().toISOString() })
    .eq('id', bikeId)
  return error ? { error: error.message } : {}
}
