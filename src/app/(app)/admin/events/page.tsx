// ============================================================
// src/app/(app)/admin/events/page.tsx
// ============================================================
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAdminEvents, useAdminDeleteEvent } from '@/features/admin/hooks'
import { AdminTable } from '@/components/admin/admin-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { ExternalLink, Trash2 } from 'lucide-react'
import { formatDate, getDisplayName } from '@/lib/utils'

export default function AdminEventsPage() {
  const { toast } = useToast()
  const [page, setPage] = useState(0)
  const { data: events, isLoading } = useAdminEvents(page)
  const deleteEvent = useAdminDeleteEvent()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Events</h1>
      <AdminTable
        headers={['Title', 'Organizer', 'Date', 'Going', 'Status', '']}
        isLoading={isLoading}
        rows={(events ?? []).map(e => {
          const organizer = e.organizer as any
          const isPast    = new Date(e.event_date) < new Date()
          return (
            <tr key={e.id} className={`border-b hover:bg-muted/30 ${e.is_deleted ? 'opacity-40' : ''}`}>
              <td className="px-4 py-3 font-medium max-w-xs">
                <p className="truncate">{e.title}</p>
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {organizer ? getDisplayName(organizer) : '—'}
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {formatDate(e.event_date)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{e.rsvp_going_count}</td>
              <td className="px-4 py-3">
                <Badge variant={e.is_deleted ? 'destructive' : isPast ? 'secondary' : 'default'}>
                  {e.is_deleted ? 'Deleted' : isPast ? 'Past' : 'Upcoming'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link href={`/events/${e.id}`}><ExternalLink className="h-3.5 w-3.5" /></Link>
                  </Button>
                  {!e.is_deleted && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => {
                        deleteEvent.mutate(e.id)
                        toast({ title: 'Event deleted.' })
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          )
        })}
      />
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={(events?.length ?? 0) < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  )
}