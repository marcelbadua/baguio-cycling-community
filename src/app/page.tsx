// ============================================================
// src/app/page.tsx — Root redirect
// Redirects / to /feed if logged in, else /login
// ============================================================
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  //const supabase = await createServerSupabaseClient()
  const supabase = (await createServerSupabaseClient()) as any
  const { data: { user } } = await supabase.auth.getUser()
  redirect(user ? '/feed' : '/login')
}