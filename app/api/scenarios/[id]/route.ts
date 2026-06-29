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
