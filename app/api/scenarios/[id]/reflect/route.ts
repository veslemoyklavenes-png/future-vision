import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'
import { buildReflectionPrompt } from '@/lib/prompts'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const answers = await req.json()

  const { data: scenario } = await supabase
    .from('scenarios')
    .select('scenario_text')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!scenario) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const prompt = buildReflectionPrompt(scenario.scenario_text, answers)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  const summary = message.content[0].type === 'text' ? message.content[0].text : ''

  await supabase
    .from('scenarios')
    .update({ reflection: { summary, answers } })
    .eq('id', params.id)

  return NextResponse.json({ summary })
}
