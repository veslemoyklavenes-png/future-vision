import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'
import { foundationsSystem } from '@/lib/foundations'
import {
  buildScenarioPrompt,
  buildTimeline,
  hasDateDrift,
  repairActionPlan,
  WizardAnswers,
  FutureArtifact,
  Timeline,
} from '@/lib/prompts'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface ParsedScenario {
  title: string
  category: string
  scenario_text: string
  action_plan?: { title: string; description: string; timeline?: string; priority?: string; sub_tasks?: string[] }[]
}

/**
 * Retry the model call + parse so a transient hiccup, a non-JSON reply, or a
 * narrative that wandered past the chosen horizon doesn't reach the user.
 */
async function generateScenarioWithRetry(prompt: string, timeline: Timeline, attempts = 3): Promise<ParsedScenario> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2800,
        system: foundationsSystem(),
        messages: [{ role: 'user', content: prompt }],
      })
      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON object in response')
      const parsed = JSON.parse(jsonMatch[0]) as ParsedScenario
      if (!parsed.scenario_text) throw new Error('No scenario text in response')
      // Only worth rejecting while we still have an attempt left; on the last
      // pass a slightly-off date beats no scenario at all.
      if (hasDateDrift(parsed.scenario_text, timeline) && i < attempts - 1) {
        throw new Error('Scenario drifted past the chosen horizon')
      }
      return parsed
    } catch (err) {
      lastError = err
    }
  }
  throw lastError
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { answers, selectedArtifacts, scenarioId }: {
    answers: WizardAnswers
    selectedArtifacts: FutureArtifact[]
    scenarioId?: string
  } = await req.json()

  // Regenerating an existing scenario: confirm it's this user's before we
  // spend a model call on it.
  if (scenarioId) {
    const { data: existing } = await supabase
      .from('scenarios')
      .select('id')
      .eq('id', scenarioId)
      .eq('user_id', user.id)
      .single()
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const timeline = buildTimeline(answers.timeframeYears)
  const prompt = buildScenarioPrompt(answers, selectedArtifacts)

  let parsed: ParsedScenario
  try {
    parsed = await generateScenarioWithRetry(prompt, timeline)
  } catch (err) {
    console.error('generate scenario failed:', err)
    return NextResponse.json(
      { error: 'The scenario could not be generated just now. Please try again.' },
      { status: 503 }
    )
  }

  const actionPlan = repairActionPlan(parsed.action_plan, timeline)

  const fields = {
    title: parsed.title,
    category: parsed.category,
    scenario_text: parsed.scenario_text,
    future_artifacts: selectedArtifacts,
    wizard_answers: answers,
  }

  let id = scenarioId

  if (id) {
    const { error: updateError } = await supabase
      .from('scenarios')
      .update(fields)
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save scenario' }, { status: 500 })
    }

    // The rewritten plan replaces the old one; completed ticks belonged to
    // action items that no longer exist.
    await supabase.from('action_items').delete().eq('scenario_id', id)
  } else {
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .insert({ user_id: user.id, ...fields })
      .select('id')
      .single()

    if (scenarioError || !scenario) {
      return NextResponse.json({ error: 'Failed to save scenario' }, { status: 500 })
    }
    id = scenario.id
  }

  if (actionPlan.length) {
    await supabase.from('action_items').insert(
      actionPlan.map((item, i) => ({
        scenario_id: id,
        title: item.title,
        description: item.description,
        timeline: item.timeline,
        priority: item.priority,
        sub_tasks: item.sub_tasks,
        sort_order: i,
      }))
    )
  }

  return NextResponse.json({ id })
}
