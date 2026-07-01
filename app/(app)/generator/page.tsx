'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Sparkles, Loader2, Check } from 'lucide-react'
import type { FutureArtifact } from '@/lib/prompts'

const VALUES = [
  'Autonomy & Freedom', 'Deep Impact', 'Creative Expression',
  'Financial Stability', 'Community & Connection', 'Intellectual Challenge',
  'Calm & Well-being', 'Other',
]
const FOCUS_AREAS = [
  'Career & Business', 'Creative Life', 'Health & Well-being',
  'Relationships', 'Financial Freedom', 'Personal Growth',
]
const TIMEFRAMES = [
  { label: '1 year', value: 1 }, { label: '2 years', value: 2 },
  { label: '3 years', value: 3 }, { label: '5 years', value: 5 },
]

const ARTIFACT_COLORS: Record<string, string> = {
  'Social Media Post': 'border-pink-200 bg-pink-50',
  'News Article': 'border-blue-200 bg-blue-50',
  'Podcast Episode': 'border-orange-200 bg-orange-50',
  'Book excerpt or chapter title they\'ve written': 'border-green-200 bg-green-50',
  'Email or message they sent or received': 'border-border bg-slate-50',
  'Award or recognition announcement': 'border-yellow-200 bg-yellow-50',
  'Course or workshop they launched': 'border-purple-200 bg-purple-50',
  'Review of their work/product/service': 'border-teal-200 bg-teal-50',
}

interface Answers {
  values: string[]
  personalDetails: { age: string; gender: string; location: string; relationship: string; children: string }
  currentSituation: string
  futureVision: string
  focusArea: string
  timeframeYears: number
}

const initialAnswers: Answers = {
  values: [],
  personalDetails: { age: '', gender: '', location: '', relationship: '', children: '' },
  currentSituation: '',
  futureVision: '',
  focusArea: '',
  timeframeYears: 3,
}

type Phase = 'wizard' | 'pick-artifacts' | 'generating'
const WIZARD_STEPS = 5

export default function GeneratorPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('wizard')
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [artifacts, setArtifacts] = useState<FutureArtifact[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customValue, setCustomValue] = useState('')

  function toggleValue(v: string) {
    setAnswers(prev => ({
      ...prev,
      values: prev.values.includes(v)
        ? prev.values.filter(x => x !== v)
        : prev.values.length < 3 ? [...prev.values, v] : prev.values,
    }))
  }

  function toggleArtifact(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id)
      : prev.length < 3 ? [...prev, id] : prev
    )
  }

  // Replace the "Other" marker with the typed custom value before sending.
  function resolvedValues() {
    return answers.values
      .map(v => (v === 'Other' ? customValue.trim() : v))
      .filter(Boolean)
  }

  function canAdvance() {
    if (step === 1) {
      if (answers.values.length === 0) return false
      // If "Other" is chosen, require some text in the field.
      if (answers.values.includes('Other') && customValue.trim() === '') return false
      return true
    }
    if (step === 2) return true
    if (step === 3) return answers.currentSituation.trim().length > 20
    if (step === 4) return answers.futureVision.trim().length > 20
    if (step === 5) return answers.focusArea !== '' && answers.timeframeYears > 0
    return false
  }

  async function generateArtifacts() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate-artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, values: resolvedValues() }),
      })
      const raw = await res.text()
      let data: { error?: string; artifacts?: FutureArtifact[] } = {}
      try { data = JSON.parse(raw) } catch { /* non-JSON (e.g. platform timeout page) */ }
      if (!res.ok || !data.artifacts) {
        const snippet = raw ? ` — ${raw.slice(0, 140)}` : ''
        throw new Error(data.error ?? `Request failed (HTTP ${res.status})${snippet}`)
      }
      setArtifacts(data.artifacts)
      setPhase('pick-artifacts')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function generateScenario() {
    setPhase('generating')
    setError('')
    try {
      const selectedArtifacts = artifacts.filter(a => selected.includes(a.id))
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: { ...answers, values: resolvedValues() }, selectedArtifacts }),
      })
      const raw = await res.text()
      let data: { error?: string; id?: string } = {}
      try { data = JSON.parse(raw) } catch { /* non-JSON (e.g. platform timeout page) */ }
      if (!res.ok || !data.id) {
        const snippet = raw ? ` — ${raw.slice(0, 140)}` : ''
        throw new Error(data.error ?? `Request failed (HTTP ${res.status})${snippet}`)
      }
      router.push(`/scenarios/${data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setPhase('pick-artifacts')
    }
  }

  // ── Artifact picker phase ──────────────────────────────────────────
  if (phase === 'pick-artifacts') {
    const targetYear = new Date().getFullYear() + answers.timeframeYears
    return (
      <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-gradient-to-b from-sage-light/50 to-cream">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ink">Choose Your Future Artifacts</h1>
            <p className="text-ink-muted mt-2">
              These are glimpses of your life in <strong>{targetYear}</strong>.
              Pick <strong>3</strong> that resonate most — they will shape your scenario.
            </p>
            <p className="text-sm text-sage-deep mt-1 font-medium">
              {selected.length} / 3 selected
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {artifacts.map(artifact => {
              const isSelected = selected.includes(artifact.id)
              const colorClass = ARTIFACT_COLORS[artifact.type] ?? 'border-border bg-white'
              return (
                <button
                  key={artifact.id}
                  onClick={() => toggleArtifact(artifact.id)}
                  disabled={!isSelected && selected.length >= 3}
                  className={cn(
                    'text-left p-4 rounded-xl border-2 transition-all relative',
                    isSelected ? 'border-sage-deep bg-sage-light shadow-md' : colorClass,
                    !isSelected && selected.length >= 3 && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-sage-deep flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1">
                    {artifact.type}
                  </span>
                  <h3 className="font-semibold text-ink text-sm mb-1">{artifact.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{artifact.content}</p>
                </button>
              )
            })}
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2 mb-4">{error}</p>}

          <div className="flex justify-between">
            <button onClick={() => setPhase('wizard')} className="text-ink-soft hover:text-ink-muted text-sm">
              ← Back to wizard
            </button>
            <Button
              onClick={generateScenario}
              disabled={selected.length < 3}
              className="bg-sage-deep hover:bg-sage-deeper text-white gap-2 px-8"
            >
              <Sparkles size={16} /> Generate my scenario
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Generating phase ───────────────────────────────────────────────
  if (phase === 'generating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sage-light/50 to-cream">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-sage-deep mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-ink mb-2">Building your future scenario…</h2>
          <p className="text-ink-soft text-sm">Weaving your chosen artifacts into a personal narrative. About 20 seconds.</p>
        </div>
      </div>
    )
  }

  // ── Wizard phase ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4 bg-gradient-to-b from-sage-light/50 to-cream">
      <h1 className="text-2xl font-bold text-ink mb-8">Future Scenario Generator</h1>

      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-sm border border-border p-5 sm:p-8">

        {step === 1 && (
          <div>
            <div className="flex items-center gap-2 text-sage-deep font-semibold mb-2">
              <span>🧭</span> Inner Compass
            </div>
            <p className="text-ink-muted mb-6 text-sm leading-relaxed">
              Before we look to the future, let&apos;s ground ourselves in the now. Choose the values that guide your work and life.
            </p>
            <div className="border rounded-xl p-5">
              <p className="text-sm font-medium text-ink mb-4">
                What are the core values that guide your work? Choose up to three.
              </p>
              <div className="flex flex-wrap gap-2">
                {VALUES.map(v => (
                  <button key={v} onClick={() => toggleValue(v)}
                    className={cn('px-4 py-2 rounded-full border text-sm transition-colors',
                      answers.values.includes(v)
                        ? 'bg-sage-deep border-sage-deep text-white'
                        : 'border-border text-ink hover:border-sage-mid'
                    )}>
                    {v}
                  </button>
                ))}
              </div>
              {answers.values.includes('Other') && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-ink-muted block mb-1">
                    Your own value
                  </label>
                  <Input
                    autoFocus
                    placeholder="e.g. Adventure, Legacy, Connection to nature…"
                    value={customValue}
                    onChange={e => setCustomValue(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 text-sage-deep font-semibold mb-2">
              <span>👤</span> About You <span className="text-ink-soft font-normal text-sm ml-1">(optional)</span>
            </div>
            <p className="text-ink-muted mb-6 text-sm leading-relaxed">
              Personal context helps the AI create a more tailored scenario. All fields are optional.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Age', key: 'age', placeholder: 'e.g. 38' },
                { label: 'Gender', key: 'gender', placeholder: 'e.g. Woman' },
                { label: 'Location', key: 'location', placeholder: 'e.g. Oslo, Norway' },
                { label: 'Relationship status', key: 'relationship', placeholder: 'e.g. Married' },
                { label: 'Children', key: 'children', placeholder: 'e.g. 2 kids, ages 8 and 11' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-ink-muted block mb-1">{label}</label>
                  <Input
                    placeholder={placeholder}
                    value={answers.personalDetails[key as keyof typeof answers.personalDetails]}
                    onChange={e => setAnswers(p => ({ ...p, personalDetails: { ...p.personalDetails, [key]: e.target.value } }))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center gap-2 text-sage-deep font-semibold mb-2">
              <span>📍</span> Your Current Situation
            </div>
            <p className="text-ink-muted mb-6 text-sm leading-relaxed">
              Describe where you are right now. What&apos;s going well? What challenges are you navigating?
            </p>
            <Textarea
              value={answers.currentSituation}
              onChange={e => setAnswers(prev => ({ ...prev, currentSituation: e.target.value }))}
              placeholder="I'm currently working on... The challenges I face are... What's working well is..."
              className="min-h-[160px] resize-none"
            />
            <p className="text-xs text-ink-soft mt-2">{answers.currentSituation.length} characters (min 20)</p>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="flex items-center gap-2 text-sage-deep font-semibold mb-2">
              <span>✨</span> Your Future Vision
            </div>
            <p className="text-ink-muted mb-6 text-sm leading-relaxed">
              Dream a little. What does your ideal life look like? What have you created, achieved, or become?
            </p>
            <Textarea
              value={answers.futureVision}
              onChange={e => setAnswers(prev => ({ ...prev, futureVision: e.target.value }))}
              placeholder="I see myself... I've created... I feel... My days look like..."
              className="min-h-[160px] resize-none"
            />
            <p className="text-xs text-ink-soft mt-2">{answers.futureVision.length} characters (min 20)</p>
          </div>
        )}

        {step === 5 && (
          <div>
            <div className="flex items-center gap-2 text-sage-deep font-semibold mb-2">
              <span>🎯</span> Focus & Timeframe
            </div>
            <p className="text-ink-muted mb-6 text-sm leading-relaxed">
              What&apos;s your main focus, and how far into the future should we look?
              {answers.timeframeYears > 0 && (
                <span className="text-sage-deep font-medium">
                  {' '}Target: {new Date().getFullYear() + answers.timeframeYears}
                </span>
              )}
            </p>
            <div className="mb-6">
              <p className="text-sm font-medium text-ink mb-3">Main focus area</p>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map(f => (
                  <button key={f} onClick={() => setAnswers(prev => ({ ...prev, focusArea: f }))}
                    className={cn('px-4 py-2 rounded-full border text-sm transition-colors',
                      answers.focusArea === f ? 'bg-sage-deep border-sage-deep text-white' : 'border-border text-ink hover:border-sage-mid'
                    )}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-ink mb-3">Timeframe</p>
              <div className="flex gap-2">
                {TIMEFRAMES.map(t => (
                  <button key={t.value} onClick={() => setAnswers(prev => ({ ...prev, timeframeYears: t.value }))}
                    className={cn('px-4 py-2 rounded-full border text-sm transition-colors',
                      answers.timeframeYears === t.value ? 'bg-sage-deep border-sage-deep text-white' : 'border-border text-ink hover:border-sage-mid'
                    )}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-8 flex flex-col items-center gap-3 text-ink-muted">
            <Loader2 size={32} className="animate-spin text-sage-deep" />
            <p className="text-sm">Generating your future artifacts… this takes about 15 seconds</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-semibold text-red-700 mb-1">Something went wrong</p>
            <p className="text-sm text-red-600">{error}</p>
            <p className="text-xs text-red-400 mt-2">If this keeps happening, try refreshing and starting again.</p>
          </div>
        )}

        {!loading && (
          <div className="flex items-center justify-between mt-8">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1}
              className="text-ink-soft hover:text-ink-muted text-sm disabled:opacity-30">
              Back
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-ink-soft">{step} / {WIZARD_STEPS}</span>
              {step < WIZARD_STEPS ? (
                <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()} className="bg-sage-deep hover:bg-sage-deeper text-white">
                  Next
                </Button>
              ) : (
                <Button onClick={generateArtifacts} disabled={!canAdvance()} className="bg-sage-deep hover:bg-sage-deeper text-white gap-2">
                  <Sparkles size={16} /> Generate artifacts
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
