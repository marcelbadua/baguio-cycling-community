'use client'

import { useEffect, useRef } from 'react'

import { useFeedPosts } from '@/features/feed/hooks'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'

import { Loader2, RefreshCw } from 'lucide-react'

import { PostCard } from './feed-post-card'

interface FeedListProps {
  publicView?: boolean
}

export function FeedList({
  publicView = false,
}: FeedListProps) {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useFeedPosts()

  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.1,
      }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage])

  const posts = data?.pages.flatMap(page => page) ?? []

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-2.5">
                <Skeleton className="h-10 w-10 rounded-full" />

                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!posts.length) {
    return (
      <EmptyState
        emoji="🚴"
        title="The feed is quiet"
        description="Be the first to post something!"
      />
    )
  }

  return (
    <div className="space-y-4">
      {!publicView && (
        <div className="flex justify-center">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh feed
          </button>
        </div>
      )}

      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
        />
      ))}

      <div
        ref={sentinelRef}
        className="h-4"
      />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!hasNextPage && (
        <p className="text-center text-xs text-muted-foreground py-6">
          You've reached the end 🏁
        </p>
      )}
    </div>
  )
}