import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/**
 * The answers from the person's most recent scenario. Writing them is the
 * slowest part of the whole app, so a new scenario starts from the last set
 * rather than from an empty form.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('scenarios')
    .select('title, wizard_answers, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data?.wizard_answers || Object.keys(data.wizard_answers).length === 0) {
    return NextResponse.json({ answers: null })
  }

  return NextResponse.json({ answers: data.wizard_answers, from: data.title ?? null })
}
