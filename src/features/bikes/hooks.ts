
// ============================================================
// src/features/bikes/hooks.ts
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Bike } from '@/types/models'
import {
  getMyBikes, getBikeById, createBike,
  updateBike, deleteBike, uploadBikePhoto,
} from './service'

export const bikeKeys = {
  root: ['bikes'] as const,
  mine: (uid: string) => ['bikes', 'mine', uid] as const,
  detail: (id: string) => ['bikes', 'detail', id] as const,
}

export function useMyBikes(ownerId: string) {
  return useQuery({
    queryKey: bikeKeys.mine(ownerId),
    queryFn: () => getMyBikes(ownerId),
    enabled: !!ownerId,
  })
}

export function useBikeById(id: string) {
  return useQuery({
    queryKey: bikeKeys.detail(id),
    queryFn: () => getBikeById(id),
    enabled: !!id,
  })
}

export function useCreateBike(ownerId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (bike: Parameters<typeof createBike>[1]) => createBike(ownerId, bike),
    onSuccess: () => qc.invalidateQueries({ queryKey: bikeKeys.mine(ownerId) }),
  })
}

export function useUpdateBike(ownerId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Bike> }) =>
      updateBike(id, updates),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: bikeKeys.mine(ownerId) })
      qc.invalidateQueries({ queryKey: bikeKeys.detail(vars.id) })
    },
  })
}

export function useDeleteBike(ownerId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBike(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: bikeKeys.mine(ownerId) }),
  })
}

export function useUploadBikePhoto(userId: string) {
  return useMutation({
    mutationFn: ({ bikeId, file }: { bikeId: string; file: File }) =>
      uploadBikePhoto(userId, bikeId, file),
  })
}