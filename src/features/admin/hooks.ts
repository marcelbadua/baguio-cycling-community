
// ============================================================
// src/features/admin/hooks.ts
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDashboardStats, getAllUsers, searchUsers, setUserRole, setUserActive,
  getAdminPosts, adminDeletePost, adminPinPost,
  getAdminEvents, adminDeleteEvent,
  getAdminHazards, adminDeleteHazard, adminSetHazardStatus,
  getAdminMissingBikes, adminUpdateMissingStatus,
  postAnnouncement,
} from './service'

export const adminKeys = {
  stats:         ['admin', 'stats'] as const,
  users:         (p: number) => ['admin', 'users', p] as const,
  userSearch:    (q: string) => ['admin', 'users', 'search', q] as const,
  posts:         (p: number) => ['admin', 'posts', p] as const,
  events:        (p: number) => ['admin', 'events', p] as const,
  hazards:       (p: number) => ['admin', 'hazards', p] as const,
  missingBikes:  (p: number) => ['admin', 'missing', p] as const,
}

export function useDashboardStats() {
  return useQuery({ queryKey: adminKeys.stats, queryFn: getDashboardStats })
}

export function useAdminUsers(page = 0) {
  return useQuery({ queryKey: adminKeys.users(page), queryFn: () => getAllUsers(page) })
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: adminKeys.userSearch(query),
    queryFn:  () => searchUsers(query),
    enabled:  query.length > 1,
  })
}

export function useSetUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: import('@/types/database').UserRole }) =>
      setUserRole(userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useSetUserActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      setUserActive(userId, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useAdminPosts(page = 0) {
  return useQuery({ queryKey: adminKeys.posts(page), queryFn: () => getAdminPosts(page) })
}

export function useAdminDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminDeletePost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] })
      qc.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useAdminPinPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) => adminPinPost(id, pinned),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] })
      qc.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useAdminEvents(page = 0) {
  return useQuery({ queryKey: adminKeys.events(page), queryFn: () => getAdminEvents(page) })
}

export function useAdminDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminDeleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'events'] })
      qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useAdminHazards(page = 0) {
  return useQuery({ queryKey: adminKeys.hazards(page), queryFn: () => getAdminHazards(page) })
}

export function useAdminDeleteHazard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminDeleteHazard(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'hazards'] }),
  })
}

export function useAdminSetHazardStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'fixed' }) =>
      adminSetHazardStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'hazards'] }),
  })
}

export function useAdminMissingBikes(page = 0) {
  return useQuery({ queryKey: adminKeys.missingBikes(page), queryFn: () => getAdminMissingBikes(page) })
}

export function useAdminUpdateMissingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, bikeId, status }: { id: string; bikeId: string; status: 'missing' | 'recovered' }) =>
      adminUpdateMissingStatus(id, bikeId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}

export function usePostAnnouncement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Parameters<typeof postAnnouncement>[0]) => postAnnouncement(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  })
}