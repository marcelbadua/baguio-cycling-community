'use client'

// ============================================================
// src/features/auth/hooks.ts
// Thin re-export over the shared AuthProvider context, so every
// component reads/writes the SAME user/profile state instead of
// each call to useAuth() fetching its own independent copy.
// ============================================================

export { useAuthContext as useAuth } from './auth-provider'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient() as any

  useEffect(() => {
    console.log('[useAuth] mounting, calling getUser()')

    supabase.auth
      .getUser()
      .then(({ data, error }: any) => {
        console.log('[useAuth] getUser resolved:', {
          user: data?.user?.id,
          error,
        })

        setUser(data?.user ?? null)

        if (data?.user) {
          fetchProfile(data.user.id)
        } else {
          console.log('[useAuth] no user, setting loading=false')
          setLoading(false)
        }
      })
      .catch((err: any) => {
        console.error('[useAuth] getUser THREW:', err)
        setLoading(false)
      })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: any, session: any) => {
        console.log(
          '[useAuth] onAuthStateChange fired:',
          event,
          session?.user?.id
        )

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
  }, [])

  async function fetchProfile(userId: string) {
    console.log('[useAuth] fetchProfile called for', userId)

    const { data, error }: any = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('[useAuth] fetchProfile resolved:', {
      data: data?.username,
      error,
    })

    setProfile(data ?? null)
    setLoading(false)

    console.log('[useAuth] loading set to false')
  }

  return {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    refetchProfile: () => (user ? fetchProfile(user.id) : Promise.resolve()),
  }
}