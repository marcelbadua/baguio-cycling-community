// ============================================================
// src/lib/utils.ts  (ensure this exists from shadcn init,
// add helpers below if not already present)
// ============================================================
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy • h:mm a')
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getInitials(firstName?: string | null, lastName?: string | null, fallback = '?') {
  return [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || fallback
}

export function getDisplayName(profile: {
  display_name?: string | null
  first_name?: string | null
  last_name?: string | null
  username: string
}) {
  return (
    profile.display_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
    profile.username
  )
}

export function getPublicUrl(bucket: string, path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}