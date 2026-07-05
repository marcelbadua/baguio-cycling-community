import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: { eventId?: string; coverUrl?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid or empty request body' }, { status: 400 })
  }

  const { eventId, coverUrl } = body
  if (!eventId) {
    return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('events').update({
      cover_url: coverUrl ?? null,
    } as any)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}