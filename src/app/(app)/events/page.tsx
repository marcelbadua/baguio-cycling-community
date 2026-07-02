// ============================================================
// src/app/(app)/events/page.tsx
// ============================================================
'use client'

import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks'
import { useEvents, useCreateEvent, useUploadEventCover } from '@/features/events/hooks'
import { EventCard } from '@/features/events/components/event-card'
import { EventForm, type EventFormData } from '@/features/events/components/event-form'
import { createEventPost } from '@/features/feed/auto-post'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type Filter = 'upcoming' | 'past' | 'all'

export default function EventsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [filter, setFilter] = useState<Filter>('upcoming')
  const [createOpen, setCreateOpen] = useState(false)

  const { data: events, isLoading } = useEvents(filter)
  const createEvent = useCreateEvent()
  const uploadCover = useUploadEventCover()

  const handleCreate = async (data: EventFormData, coverFile?: File) => {
    if (!user) return

    const result = await createEvent.mutateAsync({
      ...data,
      organizer_id: user.id,
      distance_km:  data.distance_km ? Number(data.distance_km) : null,
      elevation_m:  data.elevation_m ? Number(data.elevation_m) : null,
      max_participants: data.max_participants ? Number(data.max_participants) : null,
      event_time:   data.event_time || null,
      pace:         data.pace || null,
      difficulty:   data.difficulty || null,
    })

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }

    // Upload cover if provided
    let coverUrl: string | undefined
    if (coverFile && result.data) {
      const coverResult = await uploadCover.mutateAsync({
        userId: user.id,
        eventId: result.data.id,
        file: coverFile,
      })
      if (coverResult.url) {
        coverUrl = coverResult.url
        // update event with cover url (fire and forget)
        await fetch('/api/events/update-cover', {
          method: 'POST',
          body: JSON.stringify({ eventId: result.data.id, coverUrl: coverResult.url }),
        }).catch(() => {})
      }
    }

    // Auto-post to feed (carries the event's cover image along, if one was uploaded)
    if (result.data) {
      const postResult = await createEventPost({
        authorId: user.id,
        eventId: result.data.id,
        eventTitle: result.data.title,
        eventDate: formatDate(result.data.event_date),
        coverUrl,
      })
      if (postResult.error) {
        toast({
          title: 'Event created, but feed post failed',
          description: postResult.error,
          variant: 'destructive',
        })
      }
    }

    toast({ title: '🗓️ Event created!', description: 'It has been posted to the community feed.' })
    setCreateOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cycling Events</h1>
          <p className="text-muted-foreground text-sm">
            Discover rides, join events, and organize your own.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Create Event
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={v => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState filter={filter} onCreateClick={() => setCreateOpen(true)} />
      )}

      {/* Create Event Sheet */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Create a Cycling Event</SheetTitle>
            <SheetDescription>
              Organize a ride for the Baguio Cycling Community.
              It will automatically appear in the community feed.
            </SheetDescription>
          </SheetHeader>
          <EventForm
            onSubmit={handleCreate}
            isPending={createEvent.isPending || uploadCover.isPending}
            submitLabel="Create Event"
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}

function EmptyState({ filter, onCreateClick }: { filter: Filter; onCreateClick: () => void }) {
  const messages: Record<Filter, string> = {
    upcoming: 'No upcoming events yet. Be the first to organize a ride!',
    past:     'No past events found.',
    all:      'No events have been created yet.',
  }
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="rounded-full bg-muted p-6">
        <Calendar className="h-12 w-12 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">No events found</h3>
        <p className="text-muted-foreground text-sm max-w-xs mt-1">{messages[filter]}</p>
      </div>
      {filter !== 'past' && (
        <Button onClick={onCreateClick} className="gap-1.5">
          <Plus className="h-4 w-4" /> Create an Event
        </Button>
      )}
    </div>
  )
}