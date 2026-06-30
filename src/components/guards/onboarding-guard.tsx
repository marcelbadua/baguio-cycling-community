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

    // Redirect to onboarding if profile is missing required fields
    const isIncomplete = !profile?.first_name || !profile?.last_name
    if (isIncomplete) router.replace('/onboarding')
  }, [user, profile, loading, pathname, router])

  return <>{children}</>
}