// ============================================================
// src/components/guards/onboarding-guard.tsx
// Wraps app layout — redirects new users to onboarding
// ============================================================
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks'

const SKIP_PATHS = ['/onboarding', '/login', '/signup', '/forgot-password']

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user) return
    if (SKIP_PATHS.some(p => pathname.startsWith(p))) return

    // Redirect to onboarding until the wizard has been explicitly completed.
    // (Not inferred from first_name/last_name — email signup already collects
    // those, so that check alone let users skip the rest of the wizard.)
    const isIncomplete = !profile?.onboarding_completed
    if (isIncomplete) router.replace('/onboarding')
  }, [user, profile, loading, pathname, router])

  return <>{children}</>
}