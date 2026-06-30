// ============================================================
// src/features/feed/components/post-skeleton.tsx
// ============================================================
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function PostSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="flex gap-2 pt-1 border-t">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}