import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/feed'

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  console.log('[auth/callback] code:', code ? 'present' : 'missing')
  console.log('[auth/callback] siteUrl:', siteUrl)

  if (code) {
    const supabase = (await createServerSupabaseClient()) as any
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[auth/callback] exchange error:', error)
    console.log('[auth/callback] session:', data?.session?.user?.id)
    if (!error) return NextResponse.redirect(`${siteUrl}${next}`)
  }

  console.log('[auth/callback] no code or exchange failed, redirecting to login')
  return NextResponse.redirect(`${siteUrl}/login?error=auth_callback_failed`)
}