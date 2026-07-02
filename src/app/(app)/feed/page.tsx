// ============================================================
// src/app/(app)/feed/page.tsx
// ============================================================
'use client'

import { useEffect, useRef } from 'react'
import { useFeedPosts } from '@/features/feed/hooks'
import { PostComposer } from '@/features/feed/components/post-composer'
import { PostCard } from '@/features/feed/components/post-card'
import { PostSkeleton } from '@/features/feed/components/post-skeleton'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'
import { AdCard } from '@/components/adcard'

function shouldShowAd(index: number) {
  // Show an ad after every 2 posts (testing only)
  //return index > 0 && (index + 1) % 2 === 0

  if (index < 2) return false;

  return (
    (index + 3) % 7 === 0 ||
    (index + 5) % 8 === 0
  );
  
}

export default function FeedPage() {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useFeedPosts()

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

  const posts = data?.pages.flatMap((p) => p) ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Composer */}
      <PostComposer />

      {/* Refresh */}
      {!isLoading && posts.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground text-xs"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3 w-3" />
            Refresh feed
          </Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Feed */}
      {!isLoading && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <div key={post.id}>
              <PostCard post={post} />

              {shouldShowAd(index) && <AdCard />}
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && posts.length === 0 && (
        <div className="text-center py-24 space-y-3">
          <p className="text-4xl">🚴</p>

          <h3 className="font-semibold text-lg">
            The feed is quiet
          </h3>

          <p className="text-muted-foreground text-sm">
            Be the first to post something to the Baguio Cycling Community!
          </p>
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {/* Loading More */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* End */}
      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-6">
          You've reached the end of the feed 🏁
        </p>
      )}
    </div>
  )
}