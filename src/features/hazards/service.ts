// ============================================================
// src/features/hazards/service.ts
// ============================================================
import { createClient } from '@/lib/supabase/client'
import type { HazardReport, HazardType, HazardStatus } from '@/types/database'

const supabase = createClient() as any

const HAZARD_SELECT = `
  *,
  reporter:profiles!reporter_id(id, username, display_name, first_name, last_name, avatar_url),
  confirmed_by_me:hazard_confirmations(user_id)
`

export async function getActiveHazards(): Promise<HazardReport[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('hazard_reports')
    .select(HAZARD_SELECT)
    .eq('status', 'active')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (!data) return []

  return data.map((h: any) => ({
    ...h,
    confirmed_by_me: Array.isArray(h.confirmed_by_me)
      ? h.confirmed_by_me.some((c: any) => c.user_id === user?.id)
      : false,
  }))
}

export async function getAllHazards(
  filter?: HazardStatus
): Promise<HazardReport[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
    .from('hazard_reports')
    .select(HAZARD_SELECT)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (filter) {
    query = query.eq('status', filter)
  }

  const { data } = await query

  if (!data) return []

  return data.map((h: any) => ({
    ...h,
    confirmed_by_me: Array.isArray(h.confirmed_by_me)
      ? h.confirmed_by_me.some((c: any) => c.user_id === user?.id)
      : false,
  }))
}

export async function getHazardById(
  id: string
): Promise<HazardReport | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('hazard_reports')
    .select(HAZARD_SELECT)
    .eq('id', id)
    .single()

  if (!data) return null

  return {
    ...data,
    confirmed_by_me: Array.isArray(data.confirmed_by_me)
      ? data.confirmed_by_me.some((c: any) => c.user_id === user?.id)
      : false,
  }
}

export async function getMyHazardReports(
  reporterId: string
): Promise<HazardReport[]> {
  const { data } = await supabase
    .from('hazard_reports')
    .select(HAZARD_SELECT)
    .eq('reporter_id', reporterId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  return (data ?? []).map((h: any) => ({
    ...h,
    confirmed_by_me: false,
  }))
}

export async function createHazardReport(payload: {
  reporter_id: string
  hazard_type: HazardType
  barangay: string
  landmark?: string
  description?: string
  photo_url?: string
}): Promise<{ data?: HazardReport; error?: string }> {
  const { data, error } = await supabase
    .from('hazard_reports')
    .insert({
      ...payload,
      status: 'active',
    })
    .select(HAZARD_SELECT)
    .single()

  return error ? { error: error.message } : { data: data as HazardReport }
}

export async function updateHazardStatus(
  id: string,
  status: HazardStatus
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('hazard_reports')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  return error ? { error: error.message } : {}
}

export async function deleteHazardReport(
  id: string
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('hazard_reports')
    .update({
      is_deleted: true,
    })
    .eq('id', id)

  return error ? { error: error.message } : {}
}

export async function uploadHazardPhoto(
  userId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('hazards')
    .upload(path, file)

  if (error) return { error: error.message }

  const { data } = supabase.storage
    .from('hazards')
    .getPublicUrl(path)

  return {
    url: data.publicUrl,
  }
}

// ── Confirmations ─────────────────────────────────────────────

export async function confirmHazard(
  hazardId: string,
  userId: string,
  fixed: boolean
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('hazard_confirmations')
    .upsert({
      hazard_id: hazardId,
      user_id: userId,
      fixed,
    })

  if (error) return { error: error.message }

  const { data: confs } = await supabase
    .from('hazard_confirmations')
    .select('id')
    .eq('hazard_id', hazardId)

  await supabase
    .from('hazard_reports')
    .update({
      confirm_count: confs?.length ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', hazardId)

  const { data: fixedConfs } = await supabase
    .from('hazard_confirmations')
    .select('id')
    .eq('hazard_id', hazardId)
    .eq('fixed', true)

  if ((fixedConfs?.length ?? 0) >= 3) {
    await supabase
      .from('hazard_reports')
      .update({
        status: 'fixed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', hazardId)
  }

  return {}
}

export async function removeConfirmation(
  hazardId: string,
  userId: string
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('hazard_confirmations')
    .delete()
    .match({
      hazard_id: hazardId,
      user_id: userId,
    })

  if (!error) {
    const { data: confs } = await supabase
      .from('hazard_confirmations')
      .select('id')
      .eq('hazard_id', hazardId)

    await supabase
      .from('hazard_reports')
      .update({
        confirm_count: confs?.length ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', hazardId)
  }

  return error ? { error: error.message } : {}
}

export async function updateHazardReport(
  id: string,
  updates: { description?: string; landmark?: string; barangay?: string }
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('hazard_reports')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  return error ? { error: error.message } : {}
}