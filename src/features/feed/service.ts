// ============================================================
// src/features/feed/service.ts
// ============================================================
import { createClient } from '@/lib/supabase/client'
import type { Post, Comment, PostWithAuthor, CommentWithAuthor } from '@/types/models'

const supabase = createClient() as any

const POST_SELECT = `
  *,
  author:profiles!author_id(id, username, display_name, first_name, last_name, avatar_url),
  liked_by_me:post_likes(user_id)
`

export async function getFeedPosts(page = 0, pageSize = 15): Promise<PostWithAuthor[]> {
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(
        id,
        username,
        display_name,
        first_name,
        last_name,
        avatar_url
      ),
      comments(
        id,
        content,
        created_at,
        author:profiles!author_id(
          id,
          username,
          display_name,
          first_name,
          last_name,
          avatar_url
        )
      ),
      post_likes(user_id)
    `)
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (!data) return []

  return (data as any[]).map((p) => {
    const liked_by_me = Array.isArray(p.post_likes)
      ? p.post_likes.some((l: any) => l.user_id === user?.id)
      : false

    return {
      ...p,
      liked_by_me,

      // IMPORTANT: only take 2 comments (frontend-safe trimming)
      comments: (p.comments ?? [])
        .sort((a: any, b: any) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        )
        .slice(0, 2),
    }
  })
}

export async function getPostById(id: string): Promise<PostWithAuthor | null> {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return {
    ...data,
    liked_by_me: Array.isArray(data.liked_by_me)
      ? data.liked_by_me.some((l: { user_id: string }) => l.user_id === user?.id)
      : false,
  }
}

export async function createPost(payload: {
  author_id: string
  content?: string
  photos?: string[]
  post_type?: Post['post_type']
}): Promise<{ data?: PostWithAuthor; error?: string }> {
  const { data, error } = await supabase
    .from('posts')
    .insert({ ...payload, post_type: payload.post_type ?? 'text' })
    .select(POST_SELECT)
    .single()
  return error ? { error: error.message } : { data: data as PostWithAuthor }
}

export async function deletePost(id: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("posts")
    .update({ is_deleted: true })
    .eq("id", id)

  return error ? { error: error.message } : {}
}

export async function toggleLike(postId: string, userId: string, liked: boolean) {
  if (liked) {
    await supabase.from('post_likes').delete().match({ post_id: postId, user_id: userId })
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
  }
}

export async function uploadPostPhotos(userId: string, files: File[]): Promise<string[]> {
  const urls: string[] = []
  for (const file of files) {
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('posts').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('posts').getPublicUrl(path)
      urls.push(data.publicUrl)
    }
  }
  return urls
}

// ── Comments ─────────────────────────────────────────────────

export async function getComments(postId: string): Promise<CommentWithAuthor[]> {
  const { data } = await supabase
    .from('comments')
    .select('*, author:profiles!author_id(id, username, display_name, first_name, last_name, avatar_url)')
    .eq('post_id', postId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
  return (data ?? []) as any
}

export async function addComment(payload: {
  post_id: string
  author_id: string
  content: string
}): Promise<{ data?: Comment; error?: string }> {
  const { data, error } = await supabase
    .from('comments')
    .insert(payload)
    .select('*, author:profiles!author_id(id, username, display_name, first_name, last_name, avatar_url)')
    .single()
  return error ? { error: error.message } : { data: data as Comment }
}

export async function deleteComment(id: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('comments')
    .update({ is_deleted: true })
    .eq('id', id)
  return error ? { error: error.message } : {}
}

export async function updatePost(id: string, content: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('posts')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', id)
  return error ? { error: error.message } : {}
}

export async function getCommentPreview(postId: string): Promise<CommentWithAuthor[]> {
  const { data } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!author_id(
        id,
        username,
        display_name,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
    .limit(2)

  return (data ?? []) as any
}