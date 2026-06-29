import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  await supabase
    .from('action_items')
    .update({
      completed: body.completed,
      completed_at: body.completed ? new Date().toISOString() : null,
    })
    .eq('id', params.id)

  return NextResponse.json({ ok: true })
}
