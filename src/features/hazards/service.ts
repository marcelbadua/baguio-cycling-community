// ============================================================
// src/features/hazards/service.ts
// ============================================================
import { createClient } from '@/lib/supabase/client'
import type { HazardReport, HazardType, HazardStatus, HazardReportWithReporter } from '@/types/models'

const supabase = createClient() as any

const HAZARD_SELECT = `
  *,
  reporter:profiles!reporter_id(id, username, display_name, first_name, last_name, avatar_url),
  confirmed_by_me:hazard_confirmations(user_id)
`

export async function getActiveHazards(): Promise<HazardReportWithReporter[]> {
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
): Promise<HazardReportWithReporter[]> {
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
): Promise<HazardReportWithReporter | null> {
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
): Promise<HazardReportWithReporter[]> {
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
  latitude?: number
  longitude?: number
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
// confirm_count and status auto-sync via a database trigger on
// hazard_confirmations (see hazard-confirmation-migration.sql) —
// the client only ever writes to its own confirmation row, never
// directly to hazard_reports. This is what lets ANY community
// member confirm a hazard, not just the reporter or an admin.

export async function confirmHazard(
  hazardId: string,
  userId: string,
  fixed: boolean
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("hazard_confirmations")
    .upsert(
      {
        hazard_id: hazardId,
        user_id: userId,
        fixed,
      },
      {
        onConflict: "hazard_id,user_id",
      }
    )
    .select()

  return error ? { error: error.message } : {}
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

  return error ? { error: error.message } : {}
}

export async function updateHazardReport(
  id: string,
  updates: {
    hazard_type?: HazardType
    barangay?: string
    landmark?: string
    description?: string
    latitude?: number
    longitude?: number
    photo_url?: string
  }
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('hazard_reports')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  return error ? { error: error.message } : {}
}