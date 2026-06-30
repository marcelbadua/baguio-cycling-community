// ============================================================
// src/features/profile/service.ts
// ============================================================
import { createClient } from '@/lib/supabase/client'
import type { Profile, CyclistType } from '@/types/database'

const supabase = createClient()

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  return data
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  return error ? { error: error.message } : {}
}

export async function uploadAvatar(userId: string, file: File): Promise<{ url?: string; error?: string }> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) return { error: error.message }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function uploadCover(userId: string, file: File): Promise<{ url?: string; error?: string }> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/cover-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('covers').upload(path, file, { upsert: true })
  if (error) return { error: error.message }
  const { data } = supabase.storage.from('covers').getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function searchCyclists(query: string): Promise<Profile[]> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .or(`display_name.ilike.%${query}%,username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .eq('is_active', true)
    .limit(20)
  return data ?? []
}
