// ============================================================
// src/features/admin/service.ts
// ============================================================
import { createClient } from '@/lib/supabase/client'
import type {
  Profile, Post, Event, HazardReport, MissingBike, UserRole,
  PostWithAuthor, EventWithOrganizer, HazardReportWithReporter, MissingBikeWithRelations,
} from '@/types/models'

const supabase = createClient() as any

// ── Stats ─────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers:         number
  totalPosts:         number
  totalEvents:        number
  totalMissingBikes:  number
  activeMissingBikes: number
  activeHazards:      number
  newUsersThisWeek:   number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [users, posts, events, missing, activeMissing, hazards, newUsers] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('missing_bikes').select('id', { count: 'exact', head: true }),
    supabase.from('missing_bikes').select('id', { count: 'exact', head: true }).eq('status', 'missing'),
    supabase.from('hazard_reports').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('is_deleted', false),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
  ])

  return {
    totalUsers:         users.count         ?? 0,
    totalPosts:         posts.count         ?? 0,
    totalEvents:        events.count        ?? 0,
    totalMissingBikes:  missing.count       ?? 0,
    activeMissingBikes: activeMissing.count ?? 0,
    activeHazards:      hazards.count       ?? 0,
    newUsersThisWeek:   newUsers.count      ?? 0,
  }
}

// ── Users ─────────────────────────────────────────────────────

export async function getAllUsers(page = 0, pageSize = 20): Promise<Profile[]> {
  const from = page * pageSize
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)
  return data ?? []
}

export async function searchUsers(query: string): Promise<Profile[]> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(30)
  return data ?? []
}

export async function setUserRole(
  userId: string, role: UserRole
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
  return error ? { error: error.message } : {}
}

export async function setUserActive(
  userId: string, isActive: boolean
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', userId)
  return error ? { error: error.message } : {}
}

// ── Posts ─────────────────────────────────────────────────────

export async function getAdminPosts(page = 0, pageSize = 20): Promise<PostWithAuthor[]> {
  const from = page * pageSize
  const { data } = await supabase
    .from('posts')
    .select('*, author:profiles!author_id(id, username, display_name, first_name, last_name, avatar_url)')
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)
  return (data ?? []) as PostWithAuthor[]
}

export async function adminDeletePost(id: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('posts')
    .update({ is_deleted: true })
    .eq('id', id)
  return error ? { error: error.message } : {}
}

export async function adminPinPost(
  id: string, pinned: boolean
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('posts')
    .update({ is_pinned: pinned, updated_at: new Date().toISOString() })
    .eq('id', id)
  return error ? { error: error.message } : {}
}

// ── Events ─────────────────────────────────────────────────────

export async function getAdminEvents(page = 0, pageSize = 20): Promise<EventWithOrganizer[]> {
  const from = page * pageSize
  const { data } = await supabase
    .from('events')
    .select('*, organizer:profiles!organizer_id(id, username, display_name, first_name, last_name, avatar_url)')
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)
  return (data ?? []) as EventWithOrganizer[]
}

export async function adminDeleteEvent(id: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('events')
    .update({ is_deleted: true })
    .eq('id', id)
  return error ? { error: error.message } : {}
}

// ── Hazards ───────────────────────────────────────────────────

export async function getAdminHazards(page = 0, pageSize = 20): Promise<HazardReportWithReporter[]> {
  const from = page * pageSize
  const { data } = await supabase
    .from('hazard_reports')
    .select('*, reporter:profiles!reporter_id(id, username, display_name, first_name, last_name, avatar_url)')
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)
  return (data ?? []) as HazardReportWithReporter[]
}

export async function adminDeleteHazard(id: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('hazard_reports')
    .update({ is_deleted: true })
    .eq('id', id)
  return error ? { error: error.message } : {}
}

export async function adminSetHazardStatus(
  id: string, status: 'active' | 'fixed'
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('hazard_reports')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  return error ? { error: error.message } : {}
}

// ── Missing Bikes ──────────────────────────────────────────────

export async function getAdminMissingBikes(page = 0, pageSize = 20): Promise<MissingBikeWithRelations[]> {
  const from = page * pageSize
  const { data } = await supabase
    .from('missing_bikes')
    .select('*, bike:bikes(*), owner:profiles!owner_id(id, username, display_name, first_name, last_name, avatar_url)')
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)
  return (data ?? []) as MissingBikeWithRelations[]
}

export async function adminUpdateMissingStatus(
  id: string, bikeId: string, status: 'missing' | 'recovered'
): Promise<{ error?: string }> {
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('missing_bikes')
    .update({
      status,
      recovered_at: status === 'recovered' ? now : null,
      updated_at: now,
    })
    .eq('id', id)
  if (!error) {
    await supabase
      .from('bikes')
      .update({ is_missing: status === 'missing', updated_at: now })
      .eq('id', bikeId)
  }
  return error ? { error: error.message } : {}
}

// ── Announcements ─────────────────────────────────────────────

export async function postAnnouncement(payload: {
  authorId: string
  content: string
  pinned: boolean
}): Promise<{ error?: string }> {
  const { error } = await supabase.from('posts').insert({
    author_id: payload.authorId,
    post_type:  'announcement',
    content:    payload.content,
    is_pinned:  payload.pinned,
  })
  return error ? { error: error.message } : {}
}
