import type { Database } from './database'

/* ------------------------------
 * Database Row Types
 * ------------------------------ */

export type Profile =
  Database['public']['Tables']['profiles']['Row']

export type Bike =
  Database['public']['Tables']['bikes']['Row']

export type MissingBike =
  Database['public']['Tables']['missing_bikes']['Row']

export type Post =
  Database['public']['Tables']['posts']['Row']

export type Comment =
  Database['public']['Tables']['comments']['Row']

export type Event =
  Database['public']['Tables']['events']['Row']

export type EventRsvp =
  Database['public']['Tables']['event_rsvps']['Row']

export type HazardReport =
  Database['public']['Tables']['hazard_reports']['Row']

export type HazardConfirmation =
  Database['public']['Tables']['hazard_confirmations']['Row']

export type PostLike =
  Database['public']['Tables']['post_likes']['Row']

/* ------------------------------
 * Enum Types
 * ------------------------------ */

export type CyclistType =
  Database['public']['Enums']['cyclist_type']

export type PostType =
  Database['public']['Enums']['post_type']

export type EventDifficulty =
  Database['public']['Enums']['event_difficulty']

export type EventPace =
  Database['public']['Enums']['event_pace']

export type RsvpStatus =
  Database['public']['Enums']['rsvp_status']

export type HazardType =
  Database['public']['Enums']['hazard_type']

export type HazardStatus =
  Database['public']['Enums']['hazard_status']

export type MissingBikeStatus =
  Database['public']['Enums']['missing_bike_status']

export type UserRole =
  Database['public']['Enums']['user_role']

/* ------------------------------
 * Joined/Embedded Query Shapes
 * ------------------------------
 * The base Row types above only reflect real table columns. Anywhere
 * a query embeds a related row via PostgREST (e.g. `author:profiles(...)`),
 * the result needs one of these instead of an `as any` cast.
 */

export type PostWithAuthor = Post & {
  author: Profile
  comments?: (Comment & { author?: Profile })[]
  liked_by_me?: boolean
}

export type CommentWithAuthor = Comment & {
  author: Profile
}

export type EventWithOrganizer = Event & {
  organizer: Profile
  my_rsvp?: RsvpStatus | null
}

export type HazardReportWithReporter = HazardReport & {
  reporter: Profile
  confirmed_by_me?: boolean
}

export type MissingBikeWithRelations = MissingBike & {
  bike: Bike
  owner: Profile
}