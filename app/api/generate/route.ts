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

// Hobby allows 300s; the old 60s ceiling was self-imposed and is what the
// retry loop ran into. The budget below is what actually bounds the wait —
// maxDuration is only the outer safety net.
export const maxDuration = 300

/** Stop starting new attempts after this; the person is watching a spinner. */
const RETRY_BUDGET_MS = 120_000
/** No single model call may eat the whole budget. */
const CALL_TIMEOUT_MS = 70_000
export const dynamic = 'force-dynamic'

// The SDK retries internally too; keeping that low stops the two retry
// layers from multiplying into minutes of waiting.
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 1 })

interface ParsedScenario {
  title: string
  category: string
  scenario_text: string
  obstacle_reflection?: string
  coping_plan?: string
  action_plan?: { title: string; description: string; cue?: string; timeline?: string; priority?: string; sub_tasks?: string[] }[]
}

/**
 * Retry the model call + parse so a transient hiccup or a non-JSON reply
 * doesn't reach the user — but within a time budget, because a 504 is a worse
 * outcome than a scenario with one date slightly off.
 */
async function generateScenarioWithRetry(prompt: string, timeline: Timeline, attempts = 3): Promise<ParsedScenario> {
  const deadline = Date.now() + RETRY_BUDGET_MS
  let lastError: unknown
  // A parsed scenario that only failed the date check. Good enough to return
  // if we run out of time or attempts — never thrown away.
  let driftedFallback: ParsedScenario | undefined

  for (let i = 0; i < attempts; i++) {
    const remaining = deadline - Date.now()
    // Don't start an attempt there isn't time to finish.
    if (i > 0 && remaining < 35_000) break

    try {
      const message = await anthropic.messages.create(
        {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2800,
          system: foundationsSystem(),
          messages: [{ role: 'user', content: prompt }],
        },
        { timeout: Math.min(CALL_TIMEOUT_MS, Math.max(remaining, 20_000)) }
      )
      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON object in response')
      const parsed = JSON.parse(jsonMatch[0]) as ParsedScenario
      if (!parsed.scenario_text) throw new Error('No scenario text in response')

      if (hasDateDrift(parsed.scenario_text, timeline)) {
        driftedFallback ??= parsed
        throw new Error('Scenario drifted past the chosen horizon')
      }
      return parsed
    } catch (err) {
      lastError = err
    }
  }

  if (driftedFallback) return driftedFallback
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
    // Cleared rather than left stale when a regeneration drops the obstacle.
    obstacle_reflection: parsed.obstacle_reflection ?? null,
    coping_plan: parsed.coping_plan ?? null,
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
        cue: item.cue ?? null,
        timeline: item.timeline,
        priority: item.priority,
        sub_tasks: item.sub_tasks,
        sort_order: i,
      }))
    )
  }

  return NextResponse.json({ id })
}
