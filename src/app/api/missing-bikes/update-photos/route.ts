import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const { reportId, photos } = await req.json()
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('missing_bikes').update({ photos, updated_at: new Date().toISOString() }).eq('id', reportId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
