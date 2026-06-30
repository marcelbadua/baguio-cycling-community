
// ============================================================
// src/features/profile/hooks.ts
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProfileByUsername, getProfileById, updateProfile,
  uploadAvatar, uploadCover,
} from './service'

export const profileKeys = {
  byUsername: (u: string) => ['profile', 'username', u] as const,
  byId: (id: string) => ['profile', 'id', id] as const,
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
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useUploadAvatar(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadAvatar(userId, file),
    onSuccess: (result) => {
      if (result.url) {
        updateProfile(userId, { avatar_url: result.url })
        qc.invalidateQueries({ queryKey: ['profile'] })
      }
    },
  })
}

export function useUploadCover(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadCover(userId, file),
    onSuccess: (result) => {
      if (result.url) {
        updateProfile(userId, { cover_url: result.url })
        qc.invalidateQueries({ queryKey: ['profile'] })
      }
    },
  })
}