
// ============================================================
// src/app/(app)/admin/announce/page.tsx
// ============================================================
'use client'

import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks'
import { usePostAnnouncement, useAdminPinPost, useAdminDeletePost, useAdminPosts } from '@/features/admin/hooks'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Pin, Trash2, Megaphone } from 'lucide-react'
import { formatRelative } from '@/lib/utils'

export default function AnnouncePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [content, setContent] = useState('')
  const [pinned, setPinned]   = useState(false)

  const postAnnouncement = usePostAnnouncement()
  const { data: posts }  = useAdminPosts(0)
  const pinPost          = useAdminPinPost()
  const deletePost       = useAdminDeletePost()

  const announcements = (posts ?? []).filter(
    p => p.post_type === 'announcement' && !p.is_deleted
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user) return
    const result = await postAnnouncement.mutateAsync({
      authorId: user.id,
      content:  content.trim(),
      pinned,
    })
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: '📣 Announcement posted!' })
      setContent('')
      setPinned(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="h-6 w-6" /> Post Announcement
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Announcements appear in the community feed. Pinned ones stay at the top.
        </p>
      </div>

      {/* Compose */}
      <Card>
        <CardHeader><CardTitle className="text-base">New Announcement</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Message</Label>
              <Textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your community announcement here..."
                rows={5}
                className="resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="pin"
                checked={pinned}
                onCheckedChange={v => setPinned(!!v)}
              />
              <Label htmlFor="pin" className="cursor-pointer font-normal">
                Pin this announcement to the top of the feed
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={!content.trim() || postAnnouncement.isPending}
            >
              {postAnnouncement.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Megaphone className="h-4 w-4" />}
              Post Announcement
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous announcements */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Previous Announcements</h2>
          {announcements.slice(0, 10).map(post => (
            <Card key={post.id}>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm whitespace-pre-line flex-1">{post.content}</p>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="icon"
                      variant={post.is_pinned ? 'secondary' : 'ghost'}
                      className="h-7 w-7"
                      title={post.is_pinned ? 'Unpin' : 'Pin'}
                      onClick={() => pinPost.mutate({ id: post.id, pinned: !post.is_pinned })}
                    >
                      <Pin className={`h-3.5 w-3.5 ${post.is_pinned ? 'text-primary' : ''}`} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={() => deletePost.mutate(post.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.is_pinned && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Pin className="h-3 w-3" /> Pinned
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(post.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}