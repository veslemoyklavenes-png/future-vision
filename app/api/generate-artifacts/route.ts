import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'
import { foundationsSystem } from '@/lib/foundations'
import { buildArtifactsPrompt, WizardAnswers } from '@/lib/prompts'

export const maxDuration = 300

const RETRY_BUDGET_MS = 90_000
const CALL_TIMEOUT_MS = 60_000
export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 1 })

// Try the model call + parse a few times — transient API hiccups and the
// occasional non-JSON reply shouldn't surface as a hard failure to the user.
async function generateArtifactsWithRetry(prompt: string, attempts = 3) {
  const deadline = Date.now() + RETRY_BUDGET_MS
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    const remaining = deadline - Date.now()
    if (i > 0 && remaining < 25_000) break
    try {
      const message = await anthropic.messages.create(
        {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          system: foundationsSystem(),
          messages: [{ role: 'user', content: prompt }],
        },
        { timeout: Math.min(CALL_TIMEOUT_MS, Math.max(remaining, 20_000)) }
      )
      const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('No JSON array in response')
      const artifacts = JSON.parse(jsonMatch[0])
      if (!Array.isArray(artifacts) || artifacts.length === 0) throw new Error('Empty artifacts')
      return artifacts
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

  const answers: WizardAnswers = await req.json()
  const prompt = buildArtifactsPrompt(answers)

  try {
    const artifacts = await generateArtifactsWithRetry(prompt)
    return NextResponse.json({ artifacts })
  } catch (err) {
    console.error('generate-artifacts failed:', err)
    const detail = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: `The future artifacts could not be generated just now. Please try again. (${detail})` },
      { status: 503 }
    )
  }
}
