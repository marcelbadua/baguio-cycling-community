// ─────────────────────────────────────────────────────────────
// src/lib/supabase/middleware.ts
// Middleware Supabase client
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error: any) {
    // Invalid/expired refresh token cookie (e.g. leftover from a previous
    // session, a revoked session, or switching Supabase projects/keys).
    // Without this catch, getUser() throws here and crashes the request
    // instead of just meaning "not logged in" — treat it as logged out
    // and clear the stale cookie so it doesn't keep failing on every
    // subsequent request.
    if (error?.code === 'refresh_token_not_found' || error?.name === 'AuthApiError') {
      await supabase.auth.signOut()
    } else {
      throw error
    }
  }

  const protectedPaths = [
  '/feed',  
  '/events',
  '/profile',
  '/bikes',
  '/hazards',
  '/missing-bikes'
]
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && ['/login', '/signup'].includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/feed'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}