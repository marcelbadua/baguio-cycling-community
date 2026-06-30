// ============================================================
// src/features/feed/components/comment-section.tsx
// ============================================================
'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/features/auth/hooks'
import { useComments, useAddComment, useDeleteComment } from '@/features/feed/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2, Send, Loader2 } from 'lucide-react'
import { formatRelative, getInitials, getDisplayName } from '@/lib/utils'
import type { Comment } from '@/types/database'

interface Props {
  postId: string
}

export function CommentSection({ postId }: Props) {
  const { user, profile, isAdmin } = useAuth()
  const { data: comments, isLoading } = useComments(postId)
  const addComment = useAddComment(postId)
  const deleteComment = useDeleteComment(postId)
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !user) return
    const result = await addComment.mutateAsync({
      post_id: postId,
      author_id: user.id,
      content: text.trim(),
    })
    if (!result.error) setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const initials = getInitials(profile?.first_name, profile?.last_name)

  return (
    <div className="space-y-3 pt-1">
      {/* Comment list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-7 w-7 rounded-full shrink-0" />
              <Skeleton className="h-12 flex-1 rounded-lg" />
            </div>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              onDelete={() => deleteComment.mutate(comment.id)}
              isDeleting={deleteComment.isPending}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</p>
      )}

      {/* Composer */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={profile?.avatar_url ?? ''} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment…"
            rows={1}
            className="w-full rounded-2xl border bg-muted/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring pr-8"
            style={{ minHeight: '36px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!text.trim() || addComment.isPending}
            className="absolute right-2 bottom-2 text-primary disabled:text-muted-foreground"
          >
            {addComment.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Single Comment ────────────────────────────────────────────
function CommentItem({
  comment, currentUserId, isAdmin, onDelete, isDeleting,
}: {
  comment: Comment
  currentUserId?: string
  isAdmin: boolean
  onDelete: () => void
  isDeleting: boolean
}) {
  const author = comment.author as any
  const authorName = author ? getDisplayName(author) : 'Unknown'
  const authorInitials = author ? getInitials(author.first_name, author.last_name) : '?'
  const isOwner = currentUserId === comment.author_id
  const canDelete = isOwner || isAdmin

  return (
    <div className="flex gap-2 group">
      <Link href={`/profile/${author?.username}`} className="shrink-0">
        <Avatar className="h-7 w-7">
          <AvatarImage src={author?.avatar_url ?? ''} />
          <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-2xl px-3 py-2 inline-block max-w-full">
          <Link href={`/profile/${author?.username}`}>
            <span className="text-xs font-semibold hover:underline">{authorName}</span>
          </Link>
          <p className="text-sm leading-snug whitespace-pre-line">{comment.content}</p>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 ml-2">
          {formatRelative(comment.created_at)}
        </p>
      </div>
      {canDelete && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost" size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-start mt-1"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive text-sm"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}