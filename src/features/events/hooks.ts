// ============================================================
// src/features/events/hooks.ts
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEvents, getEventById, getMyEvents, createEvent, updateEvent,
  deleteEvent, uploadEventCover, upsertRsvp, removeRsvp,
  getEventAttendees, approveRsvp,
} from './service'
import type { Event, RsvpStatus } from '@/types/database'

export const eventKeys = {
  all:       (filter: string) => ['events', filter] as const,
  mine:      (uid: string)    => ['events', 'mine', uid] as const,
  detail:    (id: string)     => ['events', 'detail', id] as const,
  attendees: (id: string)     => ['events', 'attendees', id] as const,
}

export function useEvents(filter: 'upcoming' | 'past' | 'all' = 'upcoming') {
  return useQuery({
    queryKey: eventKeys.all(filter),
    queryFn: () => getEvents(filter),
  })
}

export function useEventById(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => getEventById(id),
    enabled: !!id,
  })
}

export function useMyEvents(userId: string) {
  return useQuery({
    queryKey: eventKeys.mine(userId),
    queryFn: () => getMyEvents(userId),
    enabled: !!userId,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Event>) => createEvent(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Event> }) => updateEvent(id, updates),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['events'] })
      qc.invalidateQueries({ queryKey: eventKeys.detail(id) })
    },
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useUploadEventCover() {
  return useMutation({
    mutationFn: ({ userId, eventId, file }: { userId: string; eventId: string; file: File }) =>
      uploadEventCover(userId, eventId, file),
  })
}

export function useRsvp(eventId: string) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
    qc.invalidateQueries({ queryKey: ['events'] })
    qc.invalidateQueries({ queryKey: eventKeys.attendees(eventId) })
  }
  const upsert = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: RsvpStatus }) =>
      upsertRsvp(eventId, userId, status),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (userId: string) => removeRsvp(eventId, userId),
    onSuccess: invalidate,
  })
  return { upsert, remove }
}

export function useEventAttendees(eventId: string) {
  return useQuery({
    queryKey: eventKeys.attendees(eventId),
    queryFn: () => getEventAttendees(eventId),
    enabled: !!eventId,
  })
}

export function useApproveRsvp(eventId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => approveRsvp(eventId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.attendees(eventId) }),
  })
}