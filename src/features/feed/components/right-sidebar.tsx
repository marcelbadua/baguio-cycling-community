'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { useEvents } from '@/features/events/hooks'
import { useAllHazards } from '@/features/hazards/hooks'
import { HAZARD_TYPE_CONFIG } from '@/features/hazards/constants'
import { useActiveMissingBikes } from '@/features/missing-bikes/hooks'

import { MapPin, AlertTriangle, Calendar, ThumbsUp, Users } from 'lucide-react'
import { formatDate, formatRelative, getInitials, getDisplayName } from '@/lib/utils'

// ── Upcoming Events widget ──────────────────────────────────────
function UpcomingEventsCard() {
  const { data: events, isLoading } = useEvents('upcoming')

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Upcoming Events</h3>
          <Link href="/events" className="text-xs text-primary hover:underline">
            See all
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-3">
            {events.slice(0, 3).map(event => {
              const organizer = event.organizer
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block rounded-xl border overflow-hidden hover:bg-muted transition"
                >
                  {/* Cover */}
                  <div className="h-28 bg-muted overflow-hidden">
                    {event.cover_url ? (
                      <img
                        src={event.cover_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-muted-foreground opacity-40" />
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-2">
                    <p className="font-medium text-sm line-clamp-2">{event.title}</p>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(event.event_date)}
                    </div>

                    {event.meeting_point && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{event.meeting_point}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={organizer?.avatar_url ?? ''} />
                          <AvatarFallback className="text-[9px]">
                            {getInitials(organizer?.first_name, organizer?.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {getDisplayName(organizer)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {event.rsvp_going_count}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No upcoming events.</p>
        )}
      </CardContent>
    </Card>
  )
}

// ── Recent Hazards widget ────────────────────────────────────────
function RecentHazardsCard() {
  const { data: hazards, isLoading } = useAllHazards()

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Recent Hazards</h3>
          <Link href="/hazards" className="text-xs text-primary hover:underline">
            See all
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : hazards?.length ? (
          hazards.slice(0, 3).map(report => {
            const cfg = HAZARD_TYPE_CONFIG[report.hazard_type]
            return (
              <Link
                key={report.id}
                href={`/hazards/${report.id}`}
                className="flex gap-3 rounded-lg p-2 hover:bg-muted transition"
              >
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">
                  {report.photo_url ? (
                    <img
                      src={report.photo_url}
                      alt=""
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    cfg.emoji
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{cfg.label}</span>
                    {report.status === 'fixed' && (
                      <Badge className="bg-green-600 text-white text-[10px] px-1.5 py-0">
                        Fixed
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground truncate">
                    {report.barangay}
                    {report.landmark && ` • ${report.landmark}`}
                  </p>

                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{formatRelative(report.created_at)}</span>
                    {(report.confirm_count ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {report.confirm_count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <p className="text-xs text-muted-foreground">No active hazards.</p>
        )}
      </CardContent>
    </Card>
  )
}

// ── Missing Bikes widget ─────────────────────────────────────────
function MissingBikesCard() {
  const { data: missingBikes, isLoading } = useActiveMissingBikes()

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Missing Bikes</h3>
          <Link href="/missing-bikes" className="text-xs text-primary hover:underline">
            See all
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : missingBikes?.length ? (
          missingBikes.slice(0, 3).map(report => {
            const bike = report.bike
            const bikeName = bike?.nickname
              ? `${bike.nickname} (${bike.brand}${bike.model ? ` ${bike.model}` : ''})`
              : `${bike?.brand ?? ''}${bike?.model ? ` ${bike.model}` : ''}`
            const cover = report.photos?.[0] ?? bike?.photo_url ?? null

            return (
              <Link
                key={report.id}
                href={`/missing-bikes/${report.id}`}
                className="flex gap-3 rounded-lg p-2 hover:bg-muted transition"
              >
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                  {cover ? (
                    <img src={cover} alt={bikeName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{bikeName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {report.last_seen_location}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {report.date_missing
                      ? formatDate(report.date_missing)
                      : formatRelative(report.created_at)}
                  </p>
                </div>
              </Link>
            )
          })
        ) : (
          <p className="text-xs text-muted-foreground">No missing bike reports.</p>
        )}
      </CardContent>
    </Card>
  )
}

// ── Sidebar: Right ────────────────────────────────────────────
export function RightSidebar() {
  return (
    <aside className="hidden xl:flex flex-col gap-4 w-72 shrink-0">
      <UpcomingEventsCard />
      <RecentHazardsCard />
      <MissingBikesCard />
    </aside>
  )
}