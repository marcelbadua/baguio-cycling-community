// ============================================================
// src/features/profile/service.ts
// ============================================================
import { createClient } from '@/lib/supabase/client'
import type { Profile, CyclistType } from '@/types/models'

import { uploadToBucket } from '@/lib/supabase/upload'

const supabase = createClient() as any

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

export async function uploadAvatar(userId: string, file: File) {
  return uploadToBucket(supabase, 'avatars', userId, file, { upsert: true })
}

export async function uploadCover(userId: string, file: File) {
  return uploadToBucket(supabase, 'covers', userId, file, { upsert: true })
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
