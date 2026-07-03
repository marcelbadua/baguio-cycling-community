'use client'

import { LeftSidebar } from '@/features/feed/components/left-sidebar'
import { RightSidebar } from '@/features/feed/components/right-sidebar'
import { PostComposer } from '@/features/feed/components/feed-composer'
import { FeedList } from '@/features/feed/components/feed-list'

export default function FeedPage() {
  return (
    <div className="flex gap-6 items-start max-w-6xl mx-auto">
      <LeftSidebar />

      <div className="flex-1 min-w-0 space-y-4">
        <PostComposer />
        <FeedList />
      </div>

      <RightSidebar />
    </div>
  )
}