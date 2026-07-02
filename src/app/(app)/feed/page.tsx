'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useFeedPosts, useCreatePost, useToggleLike, useDeletePost, useUploadPostPhotos, useComments, useAddComment } from '@/features/feed/hooks'
import { useAuth } from '@/features/auth/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'

import { useEvents } from '@/features/events/hooks'

import { useActiveHazards, useAllHazards } from '@/features/hazards/hooks'
import { HAZARD_TYPE_CONFIG } from '@/features/hazards/constants'

import { useActiveMissingBikes } from '@/features/missing-bikes/hooks'

import {
  Heart, MessageCircle, Share2, ImagePlus, X,
  Loader2, RefreshCw, Pin, MoreHorizontal,
  MapPin, AlertTriangle, Bike, Calendar,
  Image, Smile, BarChart2, MoreHorizontal as More,
  ThumbsUp, Users
} from 'lucide-react'
import { formatDate, formatRelative, getInitials, getDisplayName, cn } from '@/lib/utils'
import type { Post } from '@/types/database'




// ── Sidebar: Left ─────────────────────────────────────────────
function LeftSidebar() {
  const { profile } = useAuth()
  const initials = getInitials(profile?.first_name, profile?.last_name)
  const name = profile ? getDisplayName(profile) : ''

  const trending = ['#RideBaguio', '#BaguioLoop', '#GravelAdventure', '#BikeToWork', '#RideSafeBaguio']

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-64 shrink-0">
      {/* Profile card */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col items-center text-center gap-2">
            <Avatar className="h-20 w-20 ring-4 ring-primary/20">
              <AvatarImage src={profile?.avatar_url ?? ''} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-base">{name}</p>
              <p className="text-sm text-muted-foreground">@{profile?.username}</p>
              {profile?.barangay && (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />{profile.barangay}
                </p>
              )}
            </div>
            <div className="flex gap-4 pt-1 border-t w-full justify-around">
              <div className="text-center">
                <p className="font-bold text-sm">—</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">—</p>
                <p className="text-xs text-muted-foreground">Rides</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">—</p>
                <p className="text-xs text-muted-foreground">KMs</p>
              </div>
            </div>
          </div>
          <Button className="w-full gap-2" size="sm">
            <ImagePlus className="h-4 w-4" /> Create Post
          </Button>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-sm">Trending Topics</h3>
          {trending.map(tag => (
            <button key={tag} className="block text-sm text-primary hover:underline text-left w-full">
              {tag}
            </button>
          ))}
          <button className="text-xs text-primary hover:underline">See all</button>
        </CardContent>
      </Card>
    </aside>
  )
}

// ── Sidebar: Right ────────────────────────────────────────────
function RightSidebar() {

  const {
    data: events,
    isLoading: eventsLoading,
  } = useEvents('upcoming')

  const {
    data: hazards,
    isLoading: hazardsLoading,
  } = useAllHazards()

  const {
  data: missingBikes,
  isLoading: missingLoading,
} = useActiveMissingBikes()

  return (
    <aside className="hidden xl:flex flex-col gap-4 w-72 shrink-0">
      {/* Upcoming Events */}
<Card>
  <CardContent className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-sm">
        Upcoming Events
      </h3>

      <Link
        href="/events"
        className="text-xs text-primary hover:underline"
      >
        See all
      </Link>
    </div>

    {eventsLoading ? (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-24 rounded-xl"
          />
        ))}
      </div>
    ) : events && events.length > 0 ? (
      <div className="space-y-3">
        {events.slice(0, 3).map((event) => {
          const organizer = event.organizer as any

          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="block rounded-xl border overflow-hidden hover:bg-muted transition"
            >
              {/* Cover */}
              <div className="h-28 bg-muted overflow-hidden">
                {event.cover_url ? (
                  <img
                    src={event.cover_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-muted-foreground opacity-40" />
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2">
                <p className="font-medium text-sm line-clamp-2">
                  {event.title}
                </p>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(event.event_date)}
                </div>

                {event.meeting_point && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">
                      {event.meeting_point}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={organizer?.avatar_url ?? ''} />
                      <AvatarFallback className="text-[9px]">
                        {getInitials(
                          organizer?.first_name,
                          organizer?.last_name
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {getDisplayName(organizer)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {event.rsvp_going_count}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    ) : (
      <p className="text-xs text-muted-foreground">
        No upcoming events.
      </p>
    )}
  </CardContent>
</Card>

      <Card>
  <CardContent className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-sm">Recent Hazards</h3>

      <Link
        href="/hazards"
        className="text-xs text-primary hover:underline"
      >
        See all
      </Link>
    </div>

    {hazardsLoading ? (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    ) : hazards?.length ? (
      hazards.slice(0, 3).map(report => {
        const cfg = HAZARD_TYPE_CONFIG[report.hazard_type]

        return (
          <Link
            key={report.id}
            href={`/hazards/${report.id}`}
            className="flex gap-3 rounded-lg p-2 hover:bg-muted transition"
          >
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">
              {report.photo_url ? (
                <img
                  src={report.photo_url}
                  alt=""
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                cfg.emoji
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {cfg.label}
                </span>

                {report.status === 'fixed' && (
                  <Badge className="bg-green-600 text-white text-[10px] px-1.5 py-0">
                    Fixed
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground truncate">
                {report.barangay}
                {report.landmark && ` • ${report.landmark}`}
              </p>

              <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{formatRelative(report.created_at)}</span>

                {report.confirm_count > 0 && (
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {report.confirm_count}
                  </span>
                )}
              </div>
            </div>
          </Link>
        )
      })
    ) : (
      <p className="text-xs text-muted-foreground">
        No active hazards.
      </p>
    )}
  </CardContent>
</Card>

<Card>
  <CardContent className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-sm">
        Missing Bikes
      </h3>

      <Link
        href="/missing-bikes"
        className="text-xs text-primary hover:underline"
      >
        See all
      </Link>
    </div>

    {missingLoading ? (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    ) : missingBikes?.length ? (
      missingBikes.slice(0, 3).map(report => {
        const bike = report.bike as any

        const bikeName = bike?.nickname
          ? `${bike.nickname} (${bike.brand}${bike.model ? ` ${bike.model}` : ''})`
          : `${bike?.brand ?? ''}${bike?.model ? ` ${bike.model}` : ''}`

        const cover =
          report.photos?.[0] ??
          bike?.photo_url ??
          null

        return (
          <Link
            key={report.id}
            href={`/missing-bikes/${report.id}`}
            className="flex gap-3 rounded-lg p-2 hover:bg-muted transition"
          >
            <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
              {cover ? (
                <img
                  src={cover}
                  alt={bikeName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {bikeName}
              </p>

              <p className="text-xs text-muted-foreground truncate">
                {report.last_seen_location}
              </p>

              <p className="text-[11px] text-muted-foreground">
                {report.date_missing
                  ? formatDate(report.date_missing)
                  : formatRelative(report.created_at)}
              </p>
            </div>
          </Link>
        )
      })
    ) : (
      <p className="text-xs text-muted-foreground">
        No missing bike reports.
      </p>
    )}
  </CardContent>
</Card>

    </aside>
  )
}

// ── Post Composer ─────────────────────────────────────────────
function PostComposer() {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [content, setContent] = useState('')
  const [focused, setFocused] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const createPost = useCreatePost(user?.id ?? '')
  const uploadPhotos = useUploadPostPhotos()
  const isPending = createPost.isPending || uploadPhotos.isPending
  const initials = getInitials(profile?.first_name, profile?.last_name)

  const handleSubmit = async () => {
    if (!content.trim() && photos.length === 0 || !user) return
    let photoUrls: string[] = []
    if (photos.length > 0) photoUrls = await uploadPhotos.mutateAsync({ userId: user.id, files: photos })
    const result = await createPost.mutateAsync({
      author_id: user.id, content: content.trim() || undefined,
      photos: photoUrls, post_type: photoUrls.length > 0 ? 'photo' : 'text',
    })
    if (result.error) { toast({ title: 'Error', description: result.error, variant: 'destructive' }); return }
    setContent(''); setPhotos([]); setPreviews([]); setFocused(false)
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-3 items-center">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? ''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <button
            onClick={() => setFocused(true)}
            className="flex-1 text-left px-4 py-2.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground text-sm transition-colors"
          >
            What's on your mind?
          </button>
        </div>

        {focused && (
          <div className="space-y-3">
            <textarea
              autoFocus
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full resize-none border-0 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />
            {previews.length > 0 && (
              <div className={`grid gap-2 ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {previews.map((src, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden aspect-video bg-muted">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => { setPhotos(p => p.filter((_, j) => j !== i)); setPreviews(p => p.filter((_, j) => j !== i)) }}
                      className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-0.5">
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex gap-1">
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground text-xs font-medium transition-colors">
              <Image className="h-4 w-4 text-green-500" /> Photo
            </button>
            {/* <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground text-xs font-medium transition-colors">
              <Bike className="h-4 w-4 text-blue-500" /> Ride
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground text-xs font-medium transition-colors">
              <Smile className="h-4 w-4 text-yellow-500" /> Feeling
            </button>
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground text-xs font-medium transition-colors">
              <BarChart2 className="h-4 w-4 text-purple-500" /> Poll
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground text-xs font-medium transition-colors">
              <More className="h-4 w-4" /> More
            </button> */}
          </div>
          {focused && (
            <Button size="sm" onClick={handleSubmit} disabled={(!content.trim() && photos.length === 0) || isPending} className="rounded-full px-5">
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Post'}
            </Button>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => {
            const files = Array.from(e.target.files ?? []).slice(0, 4 - photos.length)
            setPhotos(p => [...p, ...files]); setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))])
            setFocused(true)
          }} />
      </CardContent>
    </Card>
  )
}

// ── Post Type Badge ───────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; badge: string }> = {
  missing_bike: { label: 'Missing Bike Alert', icon: <Bike className="h-4 w-4" />, badge: 'bg-purple-600 text-white' },
  event:        { label: 'New Event',          icon: <Calendar className="h-4 w-4" />, badge: 'bg-blue-600 text-white' },
  announcement: { label: 'Announcement',       icon: <Pin className="h-4 w-4" />, badge: 'bg-primary text-primary-foreground' },
}

// ── Post Card ─────────────────────────────────────────────────
function PostCard({ post }: { post: Post }) {
  const { user, isAdmin } = useAuth()
  const toggleLike = useToggleLike()
  const deletePost = useDeletePost()
  const [showComments, setShowComments] = useState(false)
  const { data: comments = [] } = useComments(showComments ? post.id : '')
  const addComment = useAddComment(post.id)
  const [commentText, setCommentText] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  const author = post.author as any
  const authorName = author ? getDisplayName(author) : 'Unknown'
  const authorInitials = author ? getInitials(author.first_name, author.last_name) : '?'
  const isOwner = user?.id === post.author_id
  const typeCfg = TYPE_CONFIG[post.post_type]

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !user) return
    await addComment.mutateAsync({ post_id: post.id, author_id: user.id, content: commentText.trim() })
    setCommentText('')
  }

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
        </div>

        {/* Content */}
        {post.content && (
          <p className="px-4 pb-3 text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
        )}

        {/* Photos */}
        {post.photos && post.photos.length > 0 && (
          <div className={`grid gap-0.5 ${post.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.photos.slice(0, 4).map((src, i) => (
              <div key={i} className={`relative overflow-hidden bg-muted ${post.photos.length === 1 ? 'aspect-video' : 'aspect-square'}`}>
                <img src={src} className="w-full h-full object-cover" alt="" />
                {i === 3 && post.photos.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">+{post.photos.length - 4}</span>
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
        {(post.like_count > 0 || post.comment_count > 0) && (
          <div className="flex items-center justify-between px-4 py-1.5 border-t border-b mx-0">
            {post.like_count > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="flex -space-x-0.5">
                  <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <ThumbsUp className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                    <Heart className="h-2.5 w-2.5 text-white fill-white" />
                  </div>
                </div>
                <span>{post.like_count}</span>
              </div>
            )}
            {post.comment_count > 0 && (
              <button onClick={() => setShowComments(v => !v)} className="text-xs text-muted-foreground hover:underline ml-auto">
                {post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center border-b mx-4">
          <button
            onClick={() => user && toggleLike.mutate({ postId: post.id, userId: user.id, liked: !!post.liked_by_me })}
            className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-muted text-sm font-medium transition-colors', post.liked_by_me ? 'text-primary' : 'text-muted-foreground')}
          >
            <ThumbsUp className={cn('h-4 w-4', post.liked_by_me && 'fill-primary')} />
            Like
          </button>
          <button onClick={() => setShowComments(v => !v)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-muted text-sm font-medium text-muted-foreground transition-colors">
            <MessageCircle className="h-4 w-4" /> Comment
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-muted text-sm font-medium text-muted-foreground transition-colors">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>

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
            <form onSubmit={handleComment} className="flex gap-2 items-end">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">?</AvatarFallback>
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Feed Page ─────────────────────────────────────────────────
export default function FeedPage() {
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useFeedPosts()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current; if (!el) return
    const obs = new IntersectionObserver(entries => { if (entries[0].isIntersecting && hasNextPage) fetchNextPage() }, { threshold: 0.1 })
    obs.observe(el); return () => obs.disconnect()
  }, [hasNextPage, fetchNextPage])

  const posts = data?.pages.flatMap(p => p) ?? []

  return (
    <div className="flex gap-6 items-start max-w-6xl mx-auto">
      <LeftSidebar />

      {/* Center feed */}
      <div className="flex-1 min-w-0 space-y-4">
        <PostComposer />

        {!isLoading && posts.length > 0 && (
          <div className="flex justify-center">
            <button onClick={() => refetch()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="h-3 w-3" /> Refresh feed
            </button>
          </div>
        )}

        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex gap-2.5"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-1.5"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-3 w-20" /></div></div>
                <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-48 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))
        ) : posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-24 space-y-3">
            <p className="text-4xl">🚴</p>
            <h3 className="font-semibold text-lg">The feed is quiet</h3>
            <p className="text-muted-foreground text-sm">Be the first to post something!</p>
          </div>
        )}

        <div ref={sentinelRef} className="h-4" />
        {isFetchingNextPage && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
        {!hasNextPage && posts.length > 0 && <p className="text-center text-xs text-muted-foreground py-6">You've reached the end 🏁</p>}
      </div>

      <RightSidebar />
    </div>
  )
}