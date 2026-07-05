// ============================================================
// src/app/(app)/events/[id]/page.tsx
// ============================================================
'use client'

import { use, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  useEventById, useRsvp, useEventAttendees,
  useUpdateEvent, useDeleteEvent, useApproveRsvp,
} from '@/features/events/hooks'
import { EventForm, type EventFormData } from '@/features/events/components/event-form'
import { useAuth } from '@/features/auth/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import {
  Calendar, Clock, MapPin, Gauge, TrendingUp,
  Users, ArrowLeft, CheckCircle2, Star, StarOff,
  Pencil, Trash2, UserCheck, Loader2,
} from 'lucide-react'
import { formatDate, formatDateTime, getInitials, getDisplayName } from '@/lib/utils'
import type { RsvpStatus } from '@/types/database'

const DIFFICULTY_COLORS = {
  easy:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard:     'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  expert:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const { data: event, isLoading } = useEventById(id)
  const { data: attendees } = useEventAttendees(id)
  const { upsert: rsvpUpsert, remove: rsvpRemove } = useRsvp(id)
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()
  const approveRsvp = useApproveRsvp(id)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  if (isLoading) return <EventDetailSkeleton />
  if (!event) return notFound()

  const organizer = event.organizer as any
  const isOrganizer = user?.id === event.organizer_id
  const canManage = isOrganizer || isAdmin
  const isPast = new Date(event.event_date) < new Date(new Date().toDateString())
  const isFull = event.max_participants
    ? event.rsvp_going_count >= event.max_participants
    : false

  const goingAttendees = attendees?.filter(a => a.status === 'going') ?? []
  const interestedAttendees = attendees?.filter(a => a.status === 'interested') ?? []

  // ── RSVP handlers ──────────────────────────────────────────
  const handleRsvp = async (status: RsvpStatus) => {
    if (!user) return
    if (event.my_rsvp === status) {
      await rsvpRemove.mutateAsync(user.id)
      toast({ title: 'RSVP removed.' })
    } else {
      await rsvpUpsert.mutateAsync({ userId: user.id, status })
      toast({ title: status === 'going' ? "You're going! 🎉" : "Marked as Interested ⭐" })
    }
  }

  // ── Edit handler ────────────────────────────────────────────
  const handleEdit = async (data: EventFormData) => {
    const result = await updateEvent.mutateAsync({
      id,
      updates: {
        ...data,
        distance_km:      data.distance_km ? Number(data.distance_km) : null,
        elevation_m:      data.elevation_m ? Number(data.elevation_m) : null,
        max_participants: data.max_participants ? Number(data.max_participants) : null,
        event_time:       data.event_time || null,
        pace:             data.pace || null,
        difficulty:       data.difficulty || null,
      },
    })
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Event updated!' })
      setEditOpen(false)
    }
  }

  // ── Delete handler ──────────────────────────────────────────
  const handleDelete = async () => {
    await deleteEvent.mutateAsync(id)
    toast({ title: 'Event deleted.' })
    router.push('/events')
  }

  const rsvpPending = rsvpUpsert.isPending || rsvpRemove.isPending

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Events
      </Button>

      {/* Cover */}
      <div className="relative w-full h-52 md:h-72 rounded-xl overflow-hidden bg-muted">
        {event.cover_url ? (
          <Image
            src={event.cover_url}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="h-20 w-20 text-muted-foreground opacity-20" />
          </div>
        )}
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold leading-tight">{event.title}</h1>
          {canManage && (
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(true)} className="gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-2">
          {isPast && <Badge variant="secondary">Past Event</Badge>}
          {isFull && !isPast && <Badge variant="destructive">Full</Badge>}
          {event.difficulty && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${DIFFICULTY_COLORS[event.difficulty]}`}>
              {event.difficulty.charAt(0).toUpperCase() + event.difficulty.slice(1)}
            </span>
          )}
          {event.pace && (
            <Badge variant="outline" className="capitalize">{event.pace} pace</Badge>
          )}
          {event.requires_approval && (
            <Badge variant="outline" className="gap-1">
              <UserCheck className="h-3 w-3" /> Approval required
            </Badge>
          )}
        </div>

        {/* Organizer */}
        <Link href={`/profile/${organizer?.username}`} className="flex items-center gap-2 w-fit">
          <Avatar className="h-7 w-7">
            <AvatarImage src={organizer?.avatar_url ?? ''} />
            <AvatarFallback className="text-xs">{getInitials(organizer?.first_name, organizer?.last_name)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground hover:underline">
            Organized by <strong>{getDisplayName(organizer)}</strong>
          </span>
        </Link>
      </div>

      <Separator />

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <DetailItem icon={<Calendar className="h-4 w-4" />} label="Date" value={formatDate(event.event_date)} />
        {event.event_time && (
          <DetailItem icon={<Clock className="h-4 w-4" />} label="Time" value={event.event_time.slice(0, 5)} />
        )}
        {event.meeting_point && (
          <DetailItem icon={<MapPin className="h-4 w-4" />} label="Meeting Point" value={event.meeting_point} />
        )}
        {event.distance_km && (
          <DetailItem icon={<Gauge className="h-4 w-4" />} label="Distance" value={`${event.distance_km} km`} />
        )}
        {event.elevation_m && (
          <DetailItem icon={<TrendingUp className="h-4 w-4" />} label="Elevation" value={`${event.elevation_m} m`} />
        )}
        <DetailItem
          icon={<Users className="h-4 w-4" />}
          label="Going"
          value={`${event.rsvp_going_count}${event.max_participants ? ` / ${event.max_participants}` : ''}`}
        />
      </div>

      {/* Description */}
      {event.description && (
        <>
          <Separator />
          <div>
            <h2 className="font-semibold mb-2">About this Event</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {event.description}
            </p>
          </div>
        </>
      )}

      {/* RSVP Buttons */}
      {!isPast && (
        <>
          <Separator />
          <div className="space-y-3">
            <h2 className="font-semibold">Are you joining?</h2>
            <div className="flex gap-3">
              <Button
                className="flex-1 gap-2"
                variant={event.my_rsvp === 'going' ? 'default' : 'outline'}
                onClick={() => handleRsvp('going')}
                disabled={rsvpPending || (isFull && event.my_rsvp !== 'going')}
              >
                {rsvpPending && event.my_rsvp !== 'going'
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <CheckCircle2 className="h-4 w-4" />}
                {event.my_rsvp === 'going' ? "I'm Going ✓" : "Going"}
              </Button>
              <Button
                className="flex-1 gap-2"
                variant={event.my_rsvp === 'interested' ? 'secondary' : 'outline'}
                onClick={() => handleRsvp('interested')}
                disabled={rsvpPending}
              >
                {rsvpPending && event.my_rsvp !== 'interested'
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Star className="h-4 w-4" />}
                {event.my_rsvp === 'interested' ? 'Interested ✓' : 'Interested'}
              </Button>
            </div>
            {isFull && event.my_rsvp !== 'going' && (
              <p className="text-xs text-muted-foreground text-center">
                This event is full. You can mark yourself as Interested to stay updated.
              </p>
            )}
            {event.requires_approval && event.my_rsvp === 'going' && (
              <p className="text-xs text-muted-foreground text-center">
                ⏳ Your RSVP is pending organizer approval.
              </p>
            )}
          </div>
        </>
      )}

      <Separator />

      {/* Attendees Tabs */}
      <div>
        <h2 className="font-semibold mb-3">Participants</h2>
        <Tabs defaultValue="going">
          <TabsList className="mb-4">
            <TabsTrigger value="going">
              Going ({goingAttendees.length})
            </TabsTrigger>
            <TabsTrigger value="interested">
              Interested ({interestedAttendees.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="going">
            <AttendeeList
              attendees={goingAttendees}
              showApprove={isOrganizer && event.requires_approval}
              onApprove={uid => approveRsvp.mutate(uid)}
            />
          </TabsContent>
          <TabsContent value="interested">
            <AttendeeList attendees={interestedAttendees} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Edit Event</SheetTitle>
          </SheetHeader>
          <EventForm
            defaultValues={event}
            onSubmit={handleEdit}
            isPending={updateEvent.isPending}
            submitLabel="Save Changes"
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirm */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{event.title}</strong>?
              This cannot be undone and will remove all RSVPs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteEvent.isPending}>
              {deleteEvent.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function AttendeeList({
  attendees, showApprove, onApprove,
}: {
  attendees: any[]
  showApprove?: boolean
  onApprove?: (userId: string) => void
}) {
  if (attendees.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">No one yet.</p>
  }
  return (
    <div className="space-y-2">
      {attendees.map(rsvp => {
        const u = rsvp.user as any
        const name = u ? getDisplayName(u) : 'Unknown'
        const initials = u ? getInitials(u.first_name, u.last_name) : '?'
        return (
          <div key={rsvp.user_id} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-muted/50">
            <Link href={`/profile/${u?.username}`} className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8">
                <AvatarImage src={u?.avatar_url ?? ''} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium hover:underline">{name}</p>
                <p className="text-xs text-muted-foreground">@{u?.username}</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              {showApprove && !rsvp.approved && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onApprove?.(rsvp.user_id)}>
                  <UserCheck className="h-3.5 w-3.5" /> Approve
                </Button>
              )}
              {rsvp.approved && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Approved
                </Badge>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EventDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="w-full h-64 rounded-xl" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-40" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>
    </div>
  )
}