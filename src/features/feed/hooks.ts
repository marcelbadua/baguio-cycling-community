
// ============================================================
// src/features/feed/hooks.ts
// ============================================================
import {
  useInfiniteQuery, useMutation, useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  getFeedPosts, getPostById, createPost, deletePost,
  toggleLike, uploadPostPhotos, getComments, addComment, deleteComment,
} from './service'
import type { Post } from '@/types/database'

export const feedKeys = {
  all:      ['feed'] as const,
  post:     (id: string) => ['feed', 'post', id] as const,
  comments: (postId: string) => ['feed', 'comments', postId] as const,
}

export function useFeedPosts() {
  return useInfiniteQuery({
    queryKey: feedKeys.all,
    queryFn: ({ pageParam = 0 }) => getFeedPosts(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 15 ? allPages.length : undefined,
  })
}

export function usePostById(id: string) {
  return useQuery({
    queryKey: feedKeys.post(id),
    queryFn: () => getPostById(id),
    enabled: !!id,
  })
}

export function useCreatePost(authorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof createPost>[0]) => createPost(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: feedKeys.all }),
  })
}

export function useDeletePost() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: deletePost,

    onSuccess: (result) => {
      if (result.error) {
        console.error(result.error)
        return
      }

      qc.invalidateQueries({ queryKey: feedKeys.all })
    },
  })
}
export function useToggleLike() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, userId, liked }: { postId: string; userId: string; liked: boolean }) =>
      toggleLike(postId, userId, liked),
    // Optimistic update
    onMutate: async ({ postId, liked }) => {
      await qc.cancelQueries({ queryKey: feedKeys.all })
      const prev = qc.getQueryData(feedKeys.all)
      qc.setQueryData(feedKeys.all, (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: Post[]) =>
            page.map(p =>
              p.id === postId
                ? { ...p, liked_by_me: !liked, like_count: p.like_count + (liked ? -1 : 1) }
                : p
            )
          ),
        }
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(feedKeys.all, ctx.prev)
    },
  })
}

export function useUploadPostPhotos() {
  return useMutation({
    mutationFn: ({ userId, files }: { userId: string; files: File[] }) =>
      uploadPostPhotos(userId, files),
  })
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: feedKeys.comments(postId),
    queryFn: () => getComments(postId),
    enabled: !!postId,
  })
}

export function useAddComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof addComment>[0]) => addComment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: feedKeys.comments(postId) })
      qc.invalidateQueries({ queryKey: feedKeys.all })
    },
  })
}

export function useDeleteComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: feedKeys.comments(postId) })
      qc.invalidateQueries({ queryKey: feedKeys.all })
    },
  })
}

import { updatePost } from './service'

export function useUpdatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => updatePost(id, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: feedKeys.all }),
  })
}