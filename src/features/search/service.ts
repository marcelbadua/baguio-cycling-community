import { createClient } from '@/lib/supabase/client'
import type { Profile, Event, MissingBike } from '@/types/database'

const supabase = createClient()

export interface SearchResults {
  cyclists: Profile[]
  events: Event[]
  missingBikes: MissingBike[]
}

export async function globalSearch(query: string): Promise<SearchResults> {
  if (!query.trim()) return { cyclists: [], events: [], missingBikes: [] }
  const q = query.trim()

  const [cyclists, events, missing] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${q}%,display_name.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
      .eq('is_active', true)
      .limit(8),

    supabase
      .from('events')
      .select('*, organizer:profiles(id,username,display_name,first_name,last_name,avatar_url)')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .eq('is_deleted', false)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(6),

    supabase
      .from('missing_bikes')
      .select('*, bike:bikes(id,bike_id,nickname,brand,model,year,photo_url), owner:profiles(id,username,display_name,first_name,last_name,avatar_url)')
      .eq('status', 'missing')
      .or(`last_seen_location.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(6),
  ])

  return {
    cyclists:     cyclists.data ?? [],
    events:       (events.data ?? []) as Event[],
    missingBikes: (missing.data ?? []) as MissingBike[],
  }
}