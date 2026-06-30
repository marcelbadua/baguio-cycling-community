// ============================================================
// src/app/loading.tsx — Global loading fallback
// ============================================================
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <p className="text-3xl">🚵</p>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading BCC...</p>
      </div>
    </div>
  )
}