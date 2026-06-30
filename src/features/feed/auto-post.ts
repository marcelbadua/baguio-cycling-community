// auto-post.ts — runs client-side (called from Client Components like events page)
// Uses browser Supabase client, NOT the server client
import { createClient } from '@/lib/supabase/client'

export async function createMissingBikePost(p: {
  authorId: string
  missingBikeId: string
  bikeName: string
  lastSeen?: string
}) {
  const supabase = createClient()
  const content = [
    `🚨 MISSING BIKE ALERT`,
    ``,
    `${p.bikeName} has been reported missing.`,
    p.lastSeen ? `Last seen at: ${p.lastSeen}` : null,
    ``,
    `If you have information, view the full report and leave a comment.`,
  ].filter(Boolean).join('\n')

  await supabase.from('posts').insert({
    author_id: p.authorId,
    post_type: 'missing_bike',
    content,
    ref_id: p.missingBikeId,
  })
}

export async function createEventPost(p: {
  authorId: string
  eventId: string
  eventTitle: string
  eventDate: string
}) {
  const supabase = createClient()
  await supabase.from('posts').insert({
    author_id: p.authorId,
    post_type: 'event',
    content: `🗓️ NEW EVENT: ${p.eventTitle}\n\nA new cycling event has been posted for ${p.eventDate}.\nCheck it out and RSVP!`,
    ref_id: p.eventId,
  })
}

export async function createAnnouncementPost(p: {
  authorId: string
  content: string
  pinned?: boolean
}) {
  const supabase = createClient()
  await supabase.from('posts').insert({
    author_id: p.authorId,
    post_type: 'announcement',
    content: p.content,
    is_pinned: p.pinned ?? false,
  })
}