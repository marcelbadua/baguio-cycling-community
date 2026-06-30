
// ============================================================
// src/app/not-found.tsx — Global 404
// ============================================================
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center p-6">
      <p className="text-7xl">🚵</p>
      <div>
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-xl font-semibold mt-2">Page Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Looks like you took a wrong turn on the trail. This page doesn't exist.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/feed">Back to Feed</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/events">Browse Events</Link>
        </Button>
      </div>
    </div>
  )
}