'use client'

import { useParams } from 'next/navigation'
import { usePostById } from '@/features/feed/hooks'
import { PostCard } from '@/features/feed/components/feed-post-card'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function PostPage() {
  const { id } = useParams<{ id: string }>()

  const { data: post, isLoading } = usePostById(id)

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <Card>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-72 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">
          Post not found
        </h1>

        <p className="text-muted-foreground mt-2">
          This post may have been deleted.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <PostCard post={post} />
    </div>
  )
}