'use client'

import { useState, type ReactNode, type FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/features/auth/hooks'

import {
  useToggleLike,
  useDeletePost,
  useComments,
  useAddComment,
} from '@/features/feed/hooks'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { useRouter } from 'next/navigation'

import { ImageLightbox } from '@/components/media/image-lightbox'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Heart, MessageCircle, Share2, Loader2, Pin,
  MoreHorizontal, Bike, Calendar, ThumbsUp,
} from 'lucide-react'
import { formatRelative, getInitials, getDisplayName, cn } from '@/lib/utils'
import type { PostWithAuthor } from '@/types/models'

// ── Post Type Badge ───────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; icon: ReactNode; badge: string }> = {
  missing_bike: { label: 'Missing Bike Alert', icon: <Bike className="h-4 w-4" />, badge: 'bg-purple-600 text-white' },
  event: { label: 'New Event', icon: <Calendar className="h-4 w-4" />, badge: 'bg-blue-600 text-white' },
  announcement: { label: 'Announcement', icon: <Pin className="h-4 w-4" />, badge: 'bg-primary text-primary-foreground' },
}

// ── Post Card ─────────────────────────────────────────────────
export function PostCard({ post }: { post: PostWithAuthor }) {

  const router = useRouter()

  const { user, profile, isAdmin } = useAuth()
  const toggleLike = useToggleLike()
  const deletePost = useDeletePost()
  const [showComments, setShowComments] = useState(false)
  const { data: comments = [] } = useComments(showComments ? post.id : '')
  const addComment = useAddComment(post.id)
  const [commentText, setCommentText] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  // Normalized once here instead of null-checking every usage below —
  // the real generated types correctly mark these nullable even though
  // the DB always defaults them to 0/[].
  const photos = post.photos ?? []
  const likeCount = post.like_count ?? 0
  const commentCount = post.comment_count ?? 0

  const author = post.author
  const authorName = author ? getDisplayName(author) : 'Unknown'
  const authorInitials = author ? getInitials(author.first_name, author.last_name) : '?'
  const isOwner = user?.id === post.author_id

  const requireLogin = () => {
    router.push('/login')
  }

  const typeCfg = TYPE_CONFIG[post.post_type ?? '']

  const handleComment = async (e: FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !user) return
    await addComment.mutateAsync({ post_id: post.id, author_id: user.id, content: commentText.trim() })
    setCommentText('')
  }

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const [showAllComments, setShowAllComments] = useState(false)

  const commentsPreview = post.comments ?? []

  const visibleComments = showAllComments
    ? commentsPreview
    : commentsPreview.slice(0, 2)

  return (
    <Card className={cn('overflow-hidden', post.is_pinned && 'ring-1 ring-primary/40')}>
      <CardContent className="p-0">
        {/* Pinned / type banner */}
        {typeCfg && (
          <div className="flex items-center gap-2 px-4 pt-3 pb-0">
            <div className={cn('flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full', typeCfg.badge)}>
              {typeCfg.icon} {typeCfg.label}
            </div>
          </div>
        )}

        {/* Author row */}
        <div className="flex items-start justify-between px-4 pt-3 pb-2">
          <Link href={`/profile/${author?.username}`} className="flex items-center gap-2.5 group">
            <Avatar className="h-10 w-10">
              <AvatarImage src={author?.avatar_url ?? ''} />
              <AvatarFallback>{authorInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold group-hover:underline leading-tight">{authorName}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{formatRelative(post.created_at)}</span>
                {author?.barangay && <><span>·</span><span>{author.barangay}</span></>}
              </div>
            </div>
          </Link>
          {(isOwner || isAdmin) && (
            <div className="relative">
              <button onClick={() => setShowMenu(v => !v)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </button>
              {showMenu && (isOwner || isAdmin) && (
                <div className="absolute right-0 top-8 bg-card border rounded-lg shadow-lg z-10 py-1 min-w-32">
                  <button onClick={() => { deletePost.mutate(post.id); setShowMenu(false) }}
                    className="w-full px-3 py-1.5 text-sm text-destructive hover:bg-muted text-left">
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {post.content && (
          <Link
            href={`/posts/${post.id}`}
            className="block hover:bg-muted/30 transition-colors"
          >
            <p className="px-4 pb-3 text-sm leading-relaxed whitespace-pre-line cursor-pointer">
              {post.content}
            </p>
          </Link>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <div className={`grid gap-0.5 ${photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {photos.slice(0, 4).map((src, i) => (
              <div key={i} className={`relative overflow-hidden bg-muted ${photos.length === 1 ? 'aspect-video' : 'aspect-square'}`}>

                <div
                  onClick={() => setLightboxIndex(i)}
                  className="cursor-pointer w-full h-full"
                >
                  <img
                    src={src}
                    className="w-full h-full object-cover hover:opacity-95 transition"
                    alt=""
                  />
                </div>

                {i === 3 && photos.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">+{photos.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ref links */}
        {post.post_type === 'missing_bike' && post.ref_id && (
          <div className="px-4 py-2">
            <Link href={`/missing-bikes/${post.ref_id}`}>
              <Button variant="outline" size="sm" className="w-full text-xs">View Full Missing Bike Report →</Button>
            </Link>
          </div>
        )}
        {post.post_type === 'event' && post.ref_id && (
          <div className="px-4 py-2">
            <Link href={`/events/${post.ref_id}`}>
              <Button variant="outline" size="sm" className="w-full text-xs">View Event & RSVP →</Button>
            </Link>
          </div>
        )}

        {/* Stats row */}
        {(likeCount > 0 || commentCount > 0) && (
          <div className="flex items-center justify-between px-4 py-1.5 border-t border-b mx-0">
            {likeCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="flex -space-x-0.5">
                  <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <ThumbsUp className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                    <Heart className="h-2.5 w-2.5 text-white fill-white" />
                  </div>
                </div>
                <span>{likeCount}</span>
              </div>
            )}
            {commentCount > 0 && (
              <button onClick={() => setShowComments(v => !v)} className="text-xs text-muted-foreground hover:underline ml-auto">
                {commentCount} comment{commentCount !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center border-b mx-4">
          <button

            onClick={() => {
              if (!user) {
                requireLogin()
                return
              }

              toggleLike.mutate({
                postId: post.id,
                userId: user.id,
                liked: !!post.liked_by_me,
              })
            }}

            className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-muted text-sm font-medium transition-colors', post.liked_by_me ? 'text-primary' : 'text-muted-foreground')}
          >
            <ThumbsUp className={cn('h-4 w-4', post.liked_by_me && 'fill-primary')} />
            Like
          </button>
          <button

            onClick={() => {
              if (!user) {
                requireLogin()
                return
              }

              setShowComments(v => !v)
            }}

            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-muted text-sm font-medium text-muted-foreground transition-colors">
            <MessageCircle className="h-4 w-4" /> Comment
          </button>
          <button
            onClick={() => {
              const url = `${window.location.origin}/posts/${post.id}`

              if (navigator.share) {
                navigator.share({
                  title: 'Baguio Cycling Community Post',
                  text: post.content?.slice(0, 100) || 'Check out this post',
                  url,
                })
              } else {
                navigator.clipboard.writeText(url)
                alert('Post link copied to clipboard')
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-muted text-sm font-medium text-muted-foreground transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
        {/* Preview Comments */}
        {!showComments && commentsPreview.length > 0 && (
          <div className="px-4 py-3 space-y-3">
            {commentsPreview.slice(0, 2).map((comment: any) => {
              const a = comment.author

              return (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={a?.avatar_url ?? ''} />
                    <AvatarFallback className="text-xs">
                      {getInitials(a?.first_name, a?.last_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="bg-muted rounded-2xl px-3 py-2">
                      <p className="text-xs font-semibold">
                        {a ? getDisplayName(a) : 'Unknown'}
                      </p>
                      <p className="text-sm">{comment.content}</p>
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-0.5 ml-2">
                      {formatRelative(comment.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}

            {commentsPreview.length > 1 && (
              <button
                onClick={() => setShowComments(true)}
                className="text-xs text-muted-foreground hover:text-primary ml-10"
              >
                View all {commentsPreview.length + 1} comments
              </button>
            )}
          </div>
        )}
        {/* Comments */}
        {showComments && (
          <div className="px-4 py-3 space-y-3">
            {(comments as any[]).map((comment: any) => {
              const a = comment.author
              return (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={a?.avatar_url ?? ''} />
                    <AvatarFallback className="text-xs">{getInitials(a?.first_name, a?.last_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted rounded-2xl px-3 py-2">
                      <p className="text-xs font-semibold">{a ? getDisplayName(a) : 'Unknown'}</p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 ml-2">{formatRelative(comment.created_at)}</p>
                  </div>
                </div>
              )
            })}
            {user ? (
              <form onSubmit={handleComment} className="flex gap-2">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={profile?.avatar_url ?? ""} />
                  <AvatarFallback className="text-xs">
                    {getInitials(profile?.first_name, profile?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                    placeholder="Write a comment…" rows={1}
                    className="w-full rounded-2xl border bg-muted px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring pr-9"
                    style={{ minHeight: '36px' }} />
                  <button type="submit" disabled={!commentText.trim() || addComment.isPending}
                    className="absolute right-2.5 bottom-2 text-primary disabled:text-muted-foreground">
                    {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-xs font-semibold">Post</span>}
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-xl border bg-muted/40 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Sign in to join the conversation.
                </p>

                <Button asChild size="sm">
                  <Link href="/login">
                    Log in
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {lightboxIndex !== null && photos.length > 0 && (
          <ImageLightbox
            images={photos}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNext={() =>
              setLightboxIndex((i) =>
                i === null ? 0 : (i + 1) % photos.length
              )
            }
            onPrev={() =>
              setLightboxIndex((i) =>
                i === null
                  ? 0
                  : (i - 1 + photos.length) % photos.length
              )
            }
          />
        )}

      </CardContent>
    </Card>
  )
}