// ============================================================
// src/features/events/service.ts
// ============================================================
import { createClient } from '@/lib/supabase/client'
import type { Event, EventRsvp, RsvpStatus, EventWithOrganizer } from '@/types/models'

const supabase = createClient() as any

const EVENT_SELECT = `
  *,
  organizer:profiles!organizer_id(id, username, display_name, first_name, last_name, avatar_url),
  my_rsvp:event_rsvps(status)
`

export async function getEvents(filter: 'upcoming' | 'past' | 'all' = 'upcoming'): Promise<EventWithOrganizer[]> {
  const today = new Date().toISOString().split('T')[0]
  let query = supabase
    .from('events')
    .select(EVENT_SELECT)
    .eq('is_deleted', false)
    .order('event_date', { ascending: filter !== 'past' })

  if (filter === 'upcoming') query = query.gte('event_date', today)
  if (filter === 'past')     query = query.lt('event_date', today)

  const { data } = await query
  if (!data) return []

  const { data: { user } } = await supabase.auth.getUser()

return (data as any[]).map((e: any) => ({
    ...e,
    my_rsvp: Array.isArray(e.my_rsvp)
      ? (e.my_rsvp.find((r: any) => r.user_id === user?.id)?.status ?? null)
      : null,
  }))
}

export async function getEventById(id: string): Promise<EventWithOrganizer | null> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .eq('id', id)
    .single()
  if (!data) return null
  return {
    ...data,
    my_rsvp: Array.isArray(data.my_rsvp)
      ? (data.my_rsvp.find((r: any) => r.user_id === user?.id)?.status ?? null)
      : null,
  }
}

export async function getMyEvents(userId: string): Promise<EventWithOrganizer[]> {
  const { data } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .eq('organizer_id', userId)
    .eq('is_deleted', false)
    .order('event_date', { ascending: false })
  if (!data) return []
return (data as any[]).map((e: any) => ({
  ...e,
  my_rsvp: null,
}))
}

export async function createEvent(payload: Partial<Event>): Promise<{ data?: Event; error?: string }> {
  const { data, error } = await supabase
    .from('events')
    .insert(payload)
    .select(EVENT_SELECT)
    .single()
  return error ? { error: error.message } : { data: data as Event }
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  return error ? { error: error.message } : {}
}

export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from("events")
    .update({ is_deleted: true })
    .eq("id", id)

  return { error: error?.message }
}

export async function uploadEventCover(
  userId: string, eventId: string, file: File
): Promise<{ url?: string; error?: string }> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${eventId}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('events').upload(path, file, { upsert: true })
  if (error) return { error: error.message }
  const { data } = supabase.storage.from('events').getPublicUrl(path)
  return { url: data.publicUrl }
}

// ── RSVPs ─────────────────────────────────────────────────────

export async function upsertRsvp(
  eventId: string, userId: string, status: RsvpStatus
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('event_rsvps')
    .upsert({ event_id: eventId, user_id: userId, status, updated_at: new Date().toISOString() })

  return error ? { error: error.message } : {}
}

export async function removeRsvp(eventId: string, userId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('event_rsvps')
    .delete()
    .match({ event_id: eventId, user_id: userId })
  return error ? { error: error.message } : {}
}


export async function getEventAttendees(eventId: string): Promise<EventRsvp[]> {
  const { data } = await supabase
    .from('event_rsvps')
    .select('*, user:profiles!user_id(id, username, display_name, first_name, last_name, avatar_url)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function approveRsvp(eventId: string, userId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('event_rsvps')
    .update({ approved: true })
    .match({ event_id: eventId, user_id: userId })
  return error ? { error: error.message } : {}
}