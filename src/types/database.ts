// src/types/database.ts
// Auto-generated types matching the SQL schema

export type CyclistType =
  | 'bike_to_work' | 'bike_to_school' | 'leisure' | 'road'
  | 'gravel' | 'mtb' | 'downhill' | 'enduro' | 'bmx' | 'touring' | 'athlete'
  | 'errand'

export type PostType =
  | 'text' | 'photo' | 'community_update' | 'missing_bike' | 'event' | 'announcement'

export type EventDifficulty = 'easy' | 'moderate' | 'hard' | 'expert'
export type EventPace = 'casual' | 'moderate' | 'fast' | 'race'
export type RsvpStatus = 'going' | 'interested'
export type HazardType = 'pothole' | 'open_manhole' | 'broken_glass' | 'construction' | 'landslide' | 'flood' | 'other'
export type HazardStatus = 'active' | 'fixed'
export type MissingBikeStatus = 'missing' | 'recovered'
export type UserRole = 'member' | 'admin'

export interface Profile {
  id: string
  username: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  bio: string | null
  barangay: string | null
  avatar_url: string | null
  cover_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  strava_url: string | null
  cyclist_types: CyclistType[]
  daily_route: string | null
  role: UserRole
  is_active: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Bike {
  id: string
  owner_id: string
  bike_id: string
  nickname: string | null
  brand: string
  model: string | null
  year: number | null
  wheel_size: string | null
  frame_size: string | null
  photo_url: string | null
  notes: string | null
  is_missing: boolean
  created_at: string
  updated_at: string
}

export interface MissingBike {
  id: string
  bike_id: string
  owner_id: string
  photos: string[]
  last_seen_location: string | null
  date_missing: string | null
  description: string | null
  contact_info: string | null
  status: MissingBikeStatus
  recovered_at: string | null
  created_at: string
  updated_at: string
  // joined
  bike?: Bike
  owner?: Profile
}

export interface Post {
  id: string
  author_id: string
  post_type: PostType
  content: string | null
  photos: string[]
  ref_id: string | null
  is_pinned: boolean
  is_deleted: boolean
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
  // joined
  author?: Profile
  liked_by_me?: boolean

  comments?: Comment[]
  
}

export interface Comment {
  id: string
  post_id: string | null
  missing_bike_id: string | null
  author_id: string
  content: string
  is_deleted: boolean
  created_at: string
  // joined
  author?: Profile
}

export interface Event {
  id: string
  organizer_id: string
  cover_url: string | null
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  meeting_point: string | null
  distance_km: number | null
  elevation_m: number | null
  pace: EventPace | null
  difficulty: EventDifficulty | null
  max_participants: number | null
  rsvp_going_count: number
  rsvp_interested_count: number
  requires_approval: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  // joined
  organizer?: Profile
  my_rsvp?: RsvpStatus | null
}

export interface EventRsvp {
  event_id: string
  user_id: string
  status: RsvpStatus
  approved: boolean
  created_at: string
  updated_at: string
  user?: Profile
}

export interface HazardReport {
  id: string
  reporter_id: string
  hazard_type: HazardType
  photo_url: string | null
  barangay: string
  landmark: string | null
  description: string | null
  status: HazardStatus
  confirm_count: number
  is_deleted: boolean
  created_at: string
  updated_at: string
  // joined
  reporter?: Profile
  confirmed_by_me?: boolean
}

// ─────────────────────────────────────────────────────────────
// Supabase Database generic wrapper
// ─────────────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      bikes: { Row: Bike; Insert: Partial<Bike>; Update: Partial<Bike> }
      missing_bikes: { Row: MissingBike; Insert: Partial<MissingBike>; Update: Partial<MissingBike> }
      posts: { Row: Post; Insert: Partial<Post>; Update: Partial<Post> }
      comments: { Row: Comment; Insert: Partial<Comment>; Update: Partial<Comment> }
      events: { Row: Event; Insert: Partial<Event>; Update: Partial<Event> }
      event_rsvps: { Row: EventRsvp; Insert: Partial<EventRsvp>; Update: Partial<EventRsvp> }
      hazard_reports: { Row: HazardReport; Insert: Partial<HazardReport>; Update: Partial<HazardReport> }
    }
    Enums: {
      cyclist_type: CyclistType
      post_type: PostType
      event_difficulty: EventDifficulty
      event_pace: EventPace
      rsvp_status: RsvpStatus
      hazard_type: HazardType
      hazard_status: HazardStatus
      missing_bike_status: MissingBikeStatus
      user_role: UserRole
    }
  }
}