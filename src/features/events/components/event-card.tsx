'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Calendar, Clock, MapPin, Users, Gauge,
  TrendingUp, CheckCircle2, Star,
} from 'lucide-react'
import { formatDate, getInitials, getDisplayName } from '@/lib/utils'
import type { Event } from '@/types/database'

const DIFFICULTY_COLORS = {
  easy:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard:     'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  expert:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const PACE_LABELS = {
  casual: 'Casual', moderate: 'Moderate', fast: 'Fast', race: 'Race',
}

interface Props {
  event: Event
  compact?: boolean
}

export function EventCard({ event, compact = false }: Props) {
  const router = useRouter()
  const organizer = event.organizer as any
  const organizerName = organizer ? getDisplayName(organizer) : 'Unknown'
  const organizerInitials = organizer ? getInitials(organizer.first_name, organizer.last_name) : '?'
  const isPast = new Date(event.event_date) < new Date(new Date().toDateString())
  const isFull = event.max_participants
    ? event.rsvp_going_count >= event.max_participants
    : false

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => router.push(`/events/${event.id}`)}
    >
      {/* Cover */}
      <div className="relative w-full h-40 bg-muted overflow-hidden">
        {event.cover_url ? (
          <img
            src={event.cover_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="h-12 w-12 text-muted-foreground opacity-30" />
          </div>
        )}

        {/* Overlays */}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {isPast && <Badge variant="secondary" className="text-xs">Past</Badge>}
          {isFull && !isPast && <Badge variant="destructive" className="text-xs">Full</Badge>}
          {event.difficulty && (
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[event.difficulty]}`}>
              {event.difficulty.charAt(0).toUpperCase() + event.difficulty.slice(1)}
            </span>
          )}
        </div>

        {/* RSVP status pill */}
        {event.my_rsvp && (
          <div className="absolute top-2 right-2">
            {event.my_rsvp === 'going' ? (
              <span className="flex items-center gap-1 bg-primary text-primary-foreground text-[11px] font-medium px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" /> Going
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-secondary text-secondary-foreground text-[11px] font-medium px-2 py-0.5 rounded-full">
                <Star className="h-3 w-3" /> Interested
              </span>
            )}
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Date & time */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(event.event_date)}
          </span>
          {event.event_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {event.event_time.slice(0, 5)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold leading-snug line-clamp-2">{event.title}</h3>

        {/* Meeting point */}
        {event.meeting_point && !compact && (
          <p className="text-xs text-muted-foreground flex items-start gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{event.meeting_point}</span>
          </p>
        )}

        {/* Stats row */}
        {!compact && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {event.distance_km && (
              <span className="flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5" /> {event.distance_km} km
              </span>
            )}
            {event.elevation_m && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> {event.elevation_m} m
              </span>
            )}
            {event.pace && (
              <span className="flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5" /> {PACE_LABELS[event.pace]}
              </span>
            )}
          </div>
        )}

        {/* Footer: organizer + rsvp counts */}
        <div className="flex items-center justify-between pt-1 border-t">
          <Link
            href={`/profile/${organizer?.username}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5"
          >
            <Avatar className="h-5 w-5">
              <AvatarImage src={organizer?.avatar_url ?? ''} />
              <AvatarFallback className="text-[9px]">{organizerInitials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground hover:underline line-clamp-1">
              {organizerName}
            </span>
          </Link>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{event.rsvp_going_count} going</span>
            {event.max_participants && (
              <span className="text-muted-foreground/60">/ {event.max_participants}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}