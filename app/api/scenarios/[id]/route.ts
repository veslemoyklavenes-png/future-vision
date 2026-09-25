import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: scenario } = await supabase
    .from('scenarios')
    .select('*, action_items(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!scenario) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(scenario)
}

const MAX_COPING_PLAN_LENGTH = 600

/** Only the person's own editable fields. Everything else is regenerated. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (typeof body.coping_plan !== 'string') {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const plan = body.coping_plan.trim().slice(0, MAX_COPING_PLAN_LENGTH)

  const { error } = await supabase
    .from('scenarios')
    .update({ coping_plan: plan.length > 0 ? plan : null })
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // action_items rows are removed by the ON DELETE CASCADE on scenario_id.
  // The user_id filter mirrors the RLS policy so a mismatched id fails here too.
  const { error } = await supabase
    .from('scenarios')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
