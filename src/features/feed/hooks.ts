// ============================================================
// src/features/feed/hooks.ts
// ============================================================
import {
  useInfiniteQuery, useMutation, useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  getFeedPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLike,
  uploadPostPhotos,
  getComments,
  addComment,
  deleteComment,
  updatePost,
} from './service'
import type { PostWithAuthor } from '@/types/models'

export const feedKeys = {
  all:      ['feed'] as const,
  post:     (id: string) => ['feed', 'post', id] as const,
  comments: (postId: string) => ['feed', 'comments', postId] as const,
}

// Shared cache-patch helper: bumps comment_count on a post wherever it's
// cached (the infinite feed list AND the standalone post-detail query used
// by the /posts/[id] share-link page), instead of invalidating and
// refetching either of them from the server.
function patchCommentCount(
  qc: ReturnType<typeof useQueryClient>,
  postId: string,
  delta: 1 | -1
) {
  qc.setQueryData(feedKeys.all, (old: any) => {
    if (!old) return old
    return {
      ...old,
      pages: old.pages.map((page: PostWithAuthor[]) =>
        page.map(p =>
          p.id === postId ? { ...p, comment_count: Math.max(0, (p.comment_count ?? 0) + delta) } : p
        )
      ),
    }
  })
  qc.setQueryData(feedKeys.post(postId), (old: PostWithAuthor | undefined) =>
    old ? { ...old, comment_count: Math.max(0, (old.comment_count ?? 0) + delta) } : old
  )
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

    onSuccess: (result, id) => {
      if (result.error) {
        console.error(result.error)
        return
      }

      qc.invalidateQueries({ queryKey: feedKeys.all })
      // Previously missing: without this, a cached /posts/[id] share-link
      // page for this post would keep showing it as if still active.
      qc.invalidateQueries({ queryKey: feedKeys.post(id) })
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
          pages: old.pages.map((page: PostWithAuthor[]) =>
            page.map(p =>
              p.id === postId
                ? { ...p, liked_by_me: !liked, like_count: (p.like_count ?? 0) + (liked ? -1 : 1) }
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
      // Refetch the actual comment thread (genuinely new data)...
      qc.invalidateQueries({ queryKey: feedKeys.comments(postId) })
      // ...but just patch the count elsewhere instead of refetching every
      // page of the feed for a change that only affects one post's counter.
      patchCommentCount(qc, postId, 1)
    },
  })
}

export function useDeleteComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: feedKeys.comments(postId) })
      patchCommentCount(qc, postId, -1)
    },
  })
}

export function useUpdatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => updatePost(id, content),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: feedKeys.all })
      // Previously missing, same issue as useDeletePost above.
      qc.invalidateQueries({ queryKey: feedKeys.post(id) })
    },
  })
}