// ============================================================
// src/components/pwa/offline-banner.tsx
// Shows when the user loses internet connection
// ============================================================
'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline  = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online',  goOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fixed top-14 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-destructive text-destructive-foreground py-2 text-sm font-medium">
      <WifiOff className="h-4 w-4" />
      You're offline — some content may not be up to date
    </div>
  )
}