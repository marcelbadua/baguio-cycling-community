// src/app/(app)/admin/posts/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminPosts, adminDeletePost, adminPinPost } from '@/features/admin/service'
import { AdminTable } from '@/components/admin/admin-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { MoreHorizontal, Pin, PinOff, Trash2, ImageIcon } from 'lucide-react'
import { formatDate, getInitials, getDisplayName } from '@/lib/utils'
import type { PostWithAuthor } from '@/types/models'

const POST_TYPE_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  text:             'outline',
  missing_bike:     'destructive',
  event:            'secondary',
  announcement:     'default',
  community_update: 'secondary',
}

export default function AdminPostsPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState<PostWithAuthor | null>(null)

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin', 'posts', page],
    queryFn: () => getAdminPosts(page),
  })

  const deletePost = useMutation({
    mutationFn: (id: string) => adminDeletePost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] })
      qc.invalidateQueries({ queryKey: ['feed'] })
      toast({ title: 'Post deleted.' })
      setConfirmDelete(null)
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete post.', variant: 'destructive' }),
  })

  const pinPost = useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) => adminPinPost(id, pinned),
    onSuccess: (_, { pinned }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] })
      qc.invalidateQueries({ queryKey: ['feed'] })
      toast({ title: pinned ? 'Post pinned.' : 'Post unpinned.' })
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update pin.', variant: 'destructive' }),
  })

  const displayed = posts ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <p className="text-sm text-muted-foreground">{displayed.length} shown</p>
      </div>

      <AdminTable
        headers={['Author', 'Content', 'Type', 'Stats', 'Date', '']}
        isLoading={isLoading}
        rows={displayed.map(post => {
          const author = post.author
          return (
            <tr key={post.id} className="border-b hover:bg-muted/30">
              {/* Author */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={author?.avatar_url ?? ''} />
                    <AvatarFallback className="text-xs">
                      {getInitials(author?.first_name, author?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{getDisplayName(author)}</p>
                    <p className="text-xs text-muted-foreground">@{author?.username}</p>
                  </div>
                </div>
              </td>

              {/* Content */}
              <td className="px-4 py-3 max-w-xs">
                <div className="flex items-start gap-1.5">
                  {post.is_pinned && <Pin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />}
                  {post.photos && post.photos.length > 0 && (
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.content ?? <span className="italic">No text</span>}
                  </p>
                </div>
              </td>

              {/* Type */}
              <td className="px-4 py-3">
                <Badge
                  variant={POST_TYPE_COLORS[post.post_type ?? ''] ?? 'outline'}
                  className="text-xs capitalize whitespace-nowrap"
                >
                  {(post.post_type ?? '').replace(/_/g, ' ')}
                </Badge>
              </td>

              {/* Stats */}
              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                ♥ {post.like_count ?? 0} · 💬 {post.comment_count ?? 0}
              </td>

              {/* Date */}
              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(post.created_at)}
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors outline-none">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => pinPost.mutate({ id: post.id, pinned: !post.is_pinned })}
                      disabled={pinPost.isPending}
                    >
                      {post.is_pinned
                        ? <><PinOff className="mr-2 h-4 w-4" /> Unpin</>
                        : <><Pin className="mr-2 h-4 w-4" /> Pin to top</>}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setConfirmDelete(post)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          )
        })}
      />

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button
          variant="outline" size="sm"
          disabled={page === 0}
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline" size="sm"
          disabled={(posts?.length ?? 0) < 20}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </Button>
      </div>

      {/* Delete confirm dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={open => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post by{' '}
              <strong>{getDisplayName(confirmDelete?.author)}</strong>?
              {confirmDelete?.content && (
                <span className="block mt-2 text-sm italic line-clamp-3">
                  "{confirmDelete.content}"
                </span>
              )}
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deletePost.isPending}
              onClick={() => confirmDelete && deletePost.mutate(confirmDelete.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}