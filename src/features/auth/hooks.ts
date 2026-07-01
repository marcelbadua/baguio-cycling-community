
'use client'
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
    supabase.auth.getUser().then(({ data, error }) => {
      console.log('[useAuth] getUser resolved:', { user: data.user?.id, error })
      setUser(data.user)
      if (data.user) fetchProfile(data.user.id)
      else {
        console.log('[useAuth] no user, setting loading=false')
        setLoading(false)
      }
    }).catch(err => {
      console.error('[useAuth] getUser THREW:', err)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[useAuth] onAuthStateChange fired:', event, session?.user?.id)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    console.log('[useAuth] fetchProfile called for', userId)
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    console.log('[useAuth] fetchProfile resolved:', { data: data?.username, error })
    setProfile(data)
    setLoading(false)
    console.log('[useAuth] loading set to false')
  }

  return { user, profile, loading, isAdmin: profile?.role === 'admin' }
}
