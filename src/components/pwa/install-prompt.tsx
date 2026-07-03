
// ============================================================
// src/components/pwa/install-prompt.tsx
// Shows a native-feel install banner on Android/Chrome
// ============================================================
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [prompt, setPrompt]       = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible]     = useState(false)
  const [dismissed, setDismissed] = useLocalStorage('bcc-install-dismissed', false)

  useEffect(() => {
    if (dismissed) return
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [dismissed])

  const handleInstall = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setPrompt(null)
  }

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50">
      <div className="bg-card border rounded-xl shadow-lg p-4 flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-xl">
          🚵
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install Baguio Cycling Community App</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add to your home screen for the best experience — works offline too.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleInstall} className="gap-1.5 h-8">
              <Download className="h-3.5 w-3.5" /> Install
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8">
              Not now
            </Button>
          </div>
        </div>
        <button onClick={handleDismiss} className="shrink-0 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}