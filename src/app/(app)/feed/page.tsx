'use client'

import { useEffect, useRef } from 'react'

import { useAuth } from '@/features/auth/hooks'

import { useFeedPosts } from '@/features/feed/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, RefreshCw } from 'lucide-react'

import { LeftSidebar } from '@/features/feed/components/left-sidebar'
import { RightSidebar } from '@/features/feed/components/right-sidebar'
import { PostComposer } from '@/features/feed/components/feed-composer'
import { PostCard } from '@/features/feed/components/feed-post-card'

import { AdCard } from '@/components/adcard'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

// ── Feed Page ─────────────────────────────────────────────────
export default function FeedPage() {

  const { user } = useAuth()

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
        
        {user ? (
            <PostComposer />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold">
                  Join the Baguio Cycling Community
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Sign up to share rides, report hazards, post missing bikes,
                  comment, and react to community posts.
                </p>

                <div className="mt-4 flex justify-center gap-3">
                  <Link href="/login">
                    <Button variant="outline">Log In</Button>
                  </Link>

                  <Link href="/signup">
                    <Button>Create Account</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

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
          <>
            {posts.map((post, index) => (
              <div key={post.id} className="space-y-4">
                <PostCard post={post} />

                {((index + 1) === 3 || ((index + 1) > 3 && (index - 2) % 5 === 0)) && (
                  <AdCard />
                )}
              </div>
            ))}
          </>
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