'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Sparkles, Loader2 } from 'lucide-react'

const VALUES = [
  'Autonomy & Freedom',
  'Deep Impact',
  'Creative Expression',
  'Financial Stability',
  'Community & Connection',
  'Intellectual Challenge',
  'Calm & Well-being',
  'Other',
]

const FOCUS_AREAS = [
  'Career & Business',
  'Creative Life',
  'Health & Well-being',
  'Relationships',
  'Financial Freedom',
  'Personal Growth',
]

const TIMEFRAMES = [
  { label: '1 year', value: 1 },
  { label: '2 years', value: 2 },
  { label: '3 years', value: 3 },
  { label: '5 years', value: 5 },
]

interface Answers {
  values: string[]
  currentSituation: string
  futureVision: string
  focusArea: string
  timeframeYears: number
}

const initialAnswers: Answers = {
  values: [],
  currentSituation: '',
  futureVision: '',
  focusArea: '',
  timeframeYears: 3,
}

export default function GeneratorPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleValue(v: string) {
    setAnswers(prev => ({
      ...prev,
      values: prev.values.includes(v)
        ? prev.values.filter(x => x !== v)
        : prev.values.length < 3
        ? [...prev.values, v]
        : prev.values,
    }))
  }

  function canAdvance() {
    if (step === 1) return answers.values.length > 0
    if (step === 2) return answers.currentSituation.trim().length > 20
    if (step === 3) return answers.futureVision.trim().length > 20
    if (step === 4) return answers.focusArea !== '' && answers.timeframeYears > 0
    return false
  }

  async function generate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      router.push(`/scenarios/${data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4 bg-gradient-to-br from-slate-100 to-indigo-50">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Future Scenario Generator</h1>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        {step === 1 && (
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
              <span>🧭</span> Inner Compass
            </div>
            <p className="text-slate-500 mb-6 text-sm leading-relaxed">
              Before we look to the future, let&apos;s ground ourselves in the now. A truly sustainable
              future is built on self-awareness. These next few questions will help us create a
              scenario that&apos;s not just ambitious, but deeply aligned with who you are.
            </p>
            <div className="border rounded-xl p-5">
              <p className="text-sm font-medium text-slate-700 mb-4">
                What are the core values that guide your work? Choose up to three.
              </p>
              <div className="flex flex-wrap gap-2">
                {VALUES.map(v => (
                  <button
                    key={v}
                    onClick={() => toggleValue(v)}
                    className={cn(
                      'px-4 py-2 rounded-full border text-sm transition-colors',
                      answers.values.includes(v)
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-200 text-slate-700 hover:border-indigo-300'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
              <span>📍</span> Your Current Situation
            </div>
            <p className="text-slate-500 mb-6 text-sm leading-relaxed">
              Describe where you are right now. What&apos;s going well? What challenges are you
              navigating? What projects or roles are you in?
            </p>
            <Textarea
              value={answers.currentSituation}
              onChange={e => setAnswers(prev => ({ ...prev, currentSituation: e.target.value }))}
              placeholder="I'm currently working on... The challenges I face are... What's working well is..."
              className="min-h-[160px] resize-none"
            />
            <p className="text-xs text-slate-400 mt-2">
              {answers.currentSituation.length} characters (min 20)
            </p>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
              <span>✨</span> Your Future Vision
            </div>
            <p className="text-slate-500 mb-6 text-sm leading-relaxed">
              Dream a little. What does your ideal life look like in a few years? What have you
              created, achieved, or become? How does it feel to live this life?
            </p>
            <Textarea
              value={answers.futureVision}
              onChange={e => setAnswers(prev => ({ ...prev, futureVision: e.target.value }))}
              placeholder="I see myself... I've created... I feel... My days look like..."
              className="min-h-[160px] resize-none"
            />
            <p className="text-xs text-slate-400 mt-2">
              {answers.futureVision.length} characters (min 20)
            </p>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
              <span>🎯</span> Focus & Timeframe
            </div>
            <p className="text-slate-500 mb-6 text-sm leading-relaxed">
              Let&apos;s calibrate the scenario. What&apos;s your main focus area, and how far into the
              future should we look?
            </p>

            <div className="mb-6">
              <p className="text-sm font-medium text-slate-700 mb-3">Main focus area</p>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map(f => (
                  <button
                    key={f}
                    onClick={() => setAnswers(prev => ({ ...prev, focusArea: f }))}
                    className={cn(
                      'px-4 py-2 rounded-full border text-sm transition-colors',
                      answers.focusArea === f
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-200 text-slate-700 hover:border-indigo-300'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Timeframe</p>
              <div className="flex gap-2">
                {TIMEFRAMES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setAnswers(prev => ({ ...prev, timeframeYears: t.value }))}
                    className={cn(
                      'px-4 py-2 rounded-full border text-sm transition-colors',
                      answers.timeframeYears === t.value
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-200 text-slate-700 hover:border-indigo-300'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-8 flex flex-col items-center gap-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p className="text-sm">Generating your scenario… this takes about 20 seconds</p>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>
        )}

        {!loading && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-slate-400 hover:text-slate-600 text-sm"
              disabled={step === 1}
            >
              Back
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">{step} / 4</span>
              {step < 4 ? (
                <Button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canAdvance()}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={generate}
                  disabled={!canAdvance()}
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                >
                  <Sparkles size={16} /> Generate scenario
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
