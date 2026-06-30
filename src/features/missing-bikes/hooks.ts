
// ============================================================
// src/features/missing-bikes/hooks.ts
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getActiveMissingBikes, getAllMissingBikes, getMissingBikeById,
  getMyMissingReports, createMissingBikeReport, updateMissingBikeReport,
  markAsRecovered, uploadMissingBikePhotos, getMissingBikeComments,
  addMissingBikeComment,
} from './service'

export const missingKeys = {
  active:  ['missing-bikes', 'active'] as const,
  all:     ['missing-bikes', 'all'] as const,
  mine:    (uid: string) => ['missing-bikes', 'mine', uid] as const,
  detail:  (id: string)  => ['missing-bikes', 'detail', id] as const,
  comments:(id: string)  => ['missing-bikes', 'comments', id] as const,
}

export function useActiveMissingBikes() {
  return useQuery({
    queryKey: missingKeys.active,
    queryFn: getActiveMissingBikes,
  })
}

export function useAllMissingBikes() {
  return useQuery({
    queryKey: missingKeys.all,
    queryFn: getAllMissingBikes,
  })
}

export function useMissingBikeById(id: string) {
  return useQuery({
    queryKey: missingKeys.detail(id),
    queryFn: () => getMissingBikeById(id),
    enabled: !!id,
  })
}

export function useMyMissingReports(ownerId: string) {
  return useQuery({
    queryKey: missingKeys.mine(ownerId),
    queryFn: () => getMyMissingReports(ownerId),
    enabled: !!ownerId,
  })
}

export function useCreateMissingReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof createMissingBikeReport>[0]) =>
      createMissingBikeReport(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: missingKeys.active })
      qc.invalidateQueries({ queryKey: ['bikes'] })
      qc.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useUpdateMissingReport(reportId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: Parameters<typeof updateMissingBikeReport>[1]) =>
      updateMissingBikeReport(reportId, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: missingKeys.detail(reportId) })
      qc.invalidateQueries({ queryKey: missingKeys.active })
    },
  })
}

export function useMarkAsRecovered() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reportId, bikeId }: { reportId: string; bikeId: string }) =>
      markAsRecovered(reportId, bikeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['missing-bikes'] })
      qc.invalidateQueries({ queryKey: ['bikes'] })
      qc.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useUploadMissingPhotos() {
  return useMutation({
    mutationFn: ({ ownerId, reportId, files }: {
      ownerId: string; reportId: string; files: File[]
    }) => uploadMissingBikePhotos(ownerId, reportId, files),
  })
}

export function useMissingBikeComments(reportId: string) {
  return useQuery({
    queryKey: missingKeys.comments(reportId),
    queryFn: () => getMissingBikeComments(reportId),
    enabled: !!reportId,
  })
}

export function useAddMissingBikeComment(reportId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof addMissingBikeComment>[0]) =>
      addMissingBikeComment(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: missingKeys.comments(reportId) }),
  })
}