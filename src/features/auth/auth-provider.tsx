'use client'

// ============================================================
// src/features/auth/auth-provider.tsx
// Single shared source of truth for auth/profile state.
// Previously useAuth() fetched its own independent copy of
// `profile` in every component that called it — so refetching
// profile in one place (e.g. after onboarding) never updated
// other components (e.g. OnboardingGuard), causing stale reads
// and redirect loops. This provider fixes that by holding the
// state once and letting every consumer read/refresh the same copy.
// ============================================================

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  refetchProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    setProfile(data ?? null)
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUser(data?.user ?? null)
        if (data?.user) {
          fetchProfile(data.user.id)
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    refetchProfile: () => (user ? fetchProfile(user.id) : Promise.resolve()),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within <AuthProvider>')
  }
  return ctx
}