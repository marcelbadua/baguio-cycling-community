// ============================================================
// src/features/profile/hooks.ts
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Profile } from '@/types/database'
import {
  getProfileByUsername, getProfileById, updateProfile,
  uploadAvatar, uploadCover,
} from './service'

export const profileKeys = {
  root:       ['profile'] as const,
  byUsername: (u: string) => ['profile', 'username', u] as const,
  byId:       (id: string) => ['profile', 'id', id] as const,
}

export function useProfileByUsername(username: string) {
  return useQuery({
    queryKey: profileKeys.byUsername(username),
    queryFn: () => getProfileByUsername(username),
    enabled: !!username,
  })
}

export function useProfileById(id: string) {
  return useQuery({
    queryKey: profileKeys.byId(id),
    queryFn: () => getProfileById(id),
    enabled: !!id,
  })
}

export function useUpdateProfile(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<Profile>) => updateProfile(userId, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.root })
    },
  })
}

export function useUploadAvatar(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const result = await uploadAvatar(userId, file)
      // Previously fire-and-forget: updateProfile() was called without
      // awaiting, so invalidateQueries below could fire (and refetch)
      // before this write actually landed, and any error was swallowed.
      if (result.url) {
        const updateResult = await updateProfile(userId, { avatar_url: result.url })
        if (updateResult.error) return { error: updateResult.error }
      }
      return result
    },
    onSuccess: (result) => {
      if (result.url) qc.invalidateQueries({ queryKey: profileKeys.root })
    },
  })
}

export function useUploadCover(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const result = await uploadCover(userId, file)
      if (result.url) {
        const updateResult = await updateProfile(userId, { cover_url: result.url })
        if (updateResult.error) return { error: updateResult.error }
      }
      return result
    },
    onSuccess: (result) => {
      if (result.url) qc.invalidateQueries({ queryKey: profileKeys.root })
    },
  })
}