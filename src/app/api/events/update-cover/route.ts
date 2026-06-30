import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { eventId, coverUrl } = await req.json()
  const supabase = await createServerSupabaseClient()
  await supabase.from('events').update({ cover_url: coverUrl }).eq('id', eventId)
  return NextResponse.json({ ok: true })
}
