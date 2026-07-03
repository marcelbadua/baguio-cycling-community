// ============================================================
// src/proxy.ts
// (Next.js 16 renamed the "middleware" file convention to "proxy" —
// same mechanism, new filename + export name.)
//
// Entry point Next.js actually invokes on every request.
// Delegates to the existing updateSession() helper in
// lib/supabase/middleware.ts, which refreshes the auth session
// cookie and handles route protection.
// ============================================================
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Run on every request except static assets and images.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}