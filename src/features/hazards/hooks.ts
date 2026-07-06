// ============================================================
// src/features/hazards/hooks.ts
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getActiveHazards, getAllHazards, getHazardById, getMyHazardReports,
  createHazardReport, updateHazardStatus, deleteHazardReport,
  uploadHazardPhoto, confirmHazard, removeConfirmation, updateHazardReport,
} from './service'
import type { HazardStatus, HazardType } from '@/types/models'

export const hazardKeys = {
  root:   ['hazards'] as const,
  active: ['hazards', 'active'] as const,
  all:    (s?: string) => ['hazards', 'all', s ?? ''] as const,
  mine:   (uid: string) => ['hazards', 'mine', uid] as const,
  detail: (id: string) => ['hazards', 'detail', id] as const,
}

export function useActiveHazards() {
  return useQuery({ queryKey: hazardKeys.active, queryFn: getActiveHazards })
}

export function useAllHazards(filter?: HazardStatus) {
  return useQuery({
    queryKey: hazardKeys.all(filter),
    queryFn: () => getAllHazards(filter),
  })
}

export function useHazardById(id: string) {
  return useQuery({
    queryKey: hazardKeys.detail(id),
    queryFn:  () => getHazardById(id),
    enabled:  !!id,
  })
}

export function useMyHazardReports(reporterId: string) {
  return useQuery({
    queryKey: hazardKeys.mine(reporterId),
    queryFn:  () => getMyHazardReports(reporterId),
    enabled:  !!reporterId,
  })
}

export function useCreateHazardReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Parameters<typeof createHazardReport>[0]) => createHazardReport(p),
    onSuccess:  () => qc.invalidateQueries({ queryKey: hazardKeys.root }),
  })
}

export function useUpdateHazardStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: HazardStatus }) =>
      updateHazardStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: hazardKeys.root }),
  })
}

export function useDeleteHazardReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteHazardReport(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: hazardKeys.root }),
  })
}

export function useUploadHazardPhoto() {
  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      uploadHazardPhoto(userId, file),
  })
}

export function useConfirmHazard(hazardId: string) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: hazardKeys.detail(hazardId) })
    qc.invalidateQueries({ queryKey: hazardKeys.root })
  }
  const confirm = useMutation({
    mutationFn: ({ userId, fixed }: { userId: string; fixed: boolean }) =>
      confirmHazard(hazardId, userId, fixed),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (userId: string) => removeConfirmation(hazardId, userId),
    onSuccess: invalidate,
  })
  return { confirm, remove }
}

export function useUpdateHazardReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
  id,
  updates,
}: {
  id: string
  updates: {
    hazard_type?: HazardType
    barangay?: string
    landmark?: string
    description?: string
    latitude?: number
    longitude?: number
    photo_url?: string
  }
}) =>
      updateHazardReport(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: hazardKeys.root }),
  })
}