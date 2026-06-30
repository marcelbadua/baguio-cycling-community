// ============================================================
// src/features/feed/components/post-card.tsx
// ============================================================
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/features/auth/hooks'
import { useToggleLike, useDeletePost } from '@/features/feed/hooks'
import { CommentSection } from './comment-section'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Heart, MessageCircle, MoreHorizontal,
  Trash2, AlertTriangle, Pin, ExternalLink,
} from 'lucide-react'
import { formatRelative, getInitials, getDisplayName } from '@/lib/utils'
import type { Post } from '@/types/database'
import { cn } from '@/lib/utils'

const POST_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  missing_bike:      { label: 'Missing Bike',      color: 'destructive' },
  event:             { label: 'New Event',          color: 'secondary'  },
  announcement:      { label: 'Announcement',       color: 'default'    },
  community_update:  { label: 'Community Update',   color: 'secondary'  },
}

interface Props {
  post: Post
}

export function PostCard({ post }: Props) {
  const { user, profile, isAdmin } = useAuth()
  const toggleLike = useToggleLike()
  const deletePost = useDeletePost()
  const [showComments, setShowComments] = useState(false)

  const isOwner = user?.id === post.author_id
  const author = post.author as any
  const authorName = author ? getDisplayName(author) : 'Unknown'
  const authorInitials = author ? getInitials(author.first_name, author.last_name) : '?'
  const typeInfo = POST_TYPE_LABELS[post.post_type]

  const handleLike = () => {
    if (!user) return
    toggleLike.mutate({ postId: post.id, userId: user.id, liked: !!post.liked_by_me })
  }

  const handleDelete = () => {
    deletePost.mutate(post.id)
  }

  return (
    <Card className={cn('overflow-hidden', post.is_pinned && 'ring-1 ring-primary/30')}>
      <CardContent className="pt-4 space-y-3">
        {/* Post type badge + pinned */}
        {(typeInfo || post.is_pinned) && (
          <div className="flex items-center gap-2">
            {post.is_pinned && (
              <div className="flex items-center gap-1 text-xs text-primary font-medium">
                <Pin className="h-3 w-3" /> Pinned
              </div>
            )}
            {typeInfo && (
              <Badge variant={typeInfo.color as any} className="text-xs">
                {typeInfo.label}
              </Badge>
            )}
          </div>
        )}

        {/* Author row */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/profile/${author?.username}`} className="flex items-center gap-2.5 group">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={author?.avatar_url ?? ''} />
              <AvatarFallback>{authorInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold leading-tight group-hover:underline">{authorName}</p>
              <p className="text-xs text-muted-foreground">{formatRelative(post.created_at)}</p>
            </div>
          </Link>

          {(isOwner || isAdmin) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                  disabled={deletePost.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
        )}

        {/* Photos */}
        {post.photos && post.photos.length > 0 && (
          <PhotoGrid photos={post.photos} />
        )}

        {/* Missing bike ref link */}
        {post.post_type === 'missing_bike' && post.ref_id && (
          <Link href={`/missing-bikes/${post.ref_id}`}>
            <Button variant="outline" size="sm" className="gap-1.5 w-full">
              <ExternalLink className="h-3.5 w-3.5" /> View Missing Bike Report
            </Button>
          </Link>
        )}

        {/* Event ref link */}
        {post.post_type === 'event' && post.ref_id && (
          <Link href={`/events/${post.ref_id}`}>
            <Button variant="outline" size="sm" className="gap-1.5 w-full">
              <ExternalLink className="h-3.5 w-3.5" /> View Event
            </Button>
          </Link>
        )}

        {/* Actions bar */}
        <div className="flex items-center gap-1 pt-1 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'gap-1.5 text-muted-foreground hover:text-red-500',
              post.liked_by_me && 'text-red-500'
            )}
            onClick={handleLike}
            disabled={toggleLike.isPending}
          >
            <Heart className={cn('h-4 w-4', post.liked_by_me && 'fill-red-500')} />
            <span className="text-xs">{post.like_count > 0 ? post.like_count : ''}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => setShowComments(v => !v)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{post.comment_count > 0 ? post.comment_count : ''}</span>
          </Button>
        </div>

        {/* Comments */}
        {showComments && <CommentSection postId={post.id} />}
      </CardContent>
    </Card>
  )
}

// ── Photo Grid ───────────────────────────────────────────────
function PhotoGrid({ photos }: { photos: string[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  const count = photos.length

  const gridClass =
    count === 1 ? 'grid-cols-1' :
    count === 2 ? 'grid-cols-2' :
    count === 3 ? 'grid-cols-2' :
    'grid-cols-2'

  return (
    <>
      <div className={`grid gap-1 rounded-lg overflow-hidden ${gridClass}`}>
        {photos.slice(0, 4).map((src, i) => (
          <div
            key={i}
            className={cn(
              'relative overflow-hidden cursor-pointer bg-muted',
              count === 1 ? 'aspect-video' : 'aspect-square',
              count === 3 && i === 0 ? 'row-span-2' : ''
            )}
            onClick={() => setLightbox(src)}
          >
            <img src={src} alt="" className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
            {i === 3 && photos.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xl font-bold">+{photos.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}