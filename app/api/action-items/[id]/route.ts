import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const MAX_CUE_LENGTH = 300

/**
 * Ownership is enforced by the action_items RLS policy, which resolves the
 * row's scenario back to auth.uid().
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Built key by key: a cue edit must not clear the completed tick, and a
  // tick must not clear the cue.
  const update: Record<string, unknown> = {}

  if (typeof body.completed === 'boolean') {
    update.completed = body.completed
    update.completed_at = body.completed ? new Date().toISOString() : null
  }

  if (typeof body.cue === 'string') {
    const cue = body.cue.trim().slice(0, MAX_CUE_LENGTH)
    // An emptied field means "no cue", not an empty string.
    update.cue = cue.length > 0 ? cue : null
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { error } = await supabase.from('action_items').update(update).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // A cue the person wrote is a fact about their week, not about this one
  // action. Keep it on the account so a regenerated plan can reuse it.
  if (typeof update.cue === 'string' && update.cue.length > 0) {
    await supabase
      .from('user_cues')
      .upsert({ user_id: user.id, text: update.cue }, { onConflict: 'user_id,text', ignoreDuplicates: true })
  }

  return NextResponse.json({ ok: true })
}
