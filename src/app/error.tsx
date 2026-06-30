'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center p-6">
      <AlertCircle className="h-14 w-14 text-destructive" />
      <div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm mt-2 max-w-sm">{error.message ?? 'An unexpected error occurred.'}</p>
      </div>
      <Button onClick={reset}>Try Again</Button>
    </div>
  )
}
