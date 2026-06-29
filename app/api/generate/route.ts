import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'
import { buildScenarioPrompt, WizardAnswers } from '@/lib/prompts'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const answers: WizardAnswers = await req.json()

  const prompt = buildScenarioPrompt(answers)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  const parsed = JSON.parse(jsonMatch[0])

  // Save scenario
  const { data: scenario, error: scenarioError } = await supabase
    .from('scenarios')
    .insert({
      user_id: user.id,
      title: parsed.title,
      category: parsed.category,
      scenario_text: parsed.scenario_text,
      future_artifacts: parsed.future_artifacts ?? [],
      wizard_answers: answers,
    })
    .select('id')
    .single()

  if (scenarioError || !scenario) {
    return NextResponse.json({ error: 'Failed to save scenario' }, { status: 500 })
  }

  // Save action items
  if (parsed.action_plan?.length) {
    await supabase.from('action_items').insert(
      parsed.action_plan.map((item: { title: string; description: string; timeline: string; priority: string; sub_tasks: string[] }, i: number) => ({
        scenario_id: scenario.id,
        title: item.title,
        description: item.description,
        timeline: item.timeline,
        priority: item.priority,
        sub_tasks: item.sub_tasks ?? [],
        sort_order: i,
      }))
    )
  }

  return NextResponse.json({ id: scenario.id })
}
