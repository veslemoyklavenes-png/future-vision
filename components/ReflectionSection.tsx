'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RefreshCw, Sparkles } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Props {
  scenarioId: string
  existingReflection: { summary: string; answers: Record<string, string> } | null
  scenarioTitle: string
  createdAt: string
}

export default function ReflectionSection({ scenarioId, existingReflection, createdAt }: Props) {
  const [open, setOpen] = useState(false)
  const [answers, setAnswers] = useState({ whatHappened: '', surprises: '', nextSteps: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(existingReflection?.summary ?? '')

  async function submit() {
    setLoading(true)
    const res = await fetch(`/api/scenarios/${scenarioId}/reflect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    })
    const data = await res.json()
    setResult(data.summary)
    setLoading(false)
    setOpen(false)
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-4">
      <div className="flex items-center gap-2 text-amber-700 font-semibold mb-2">
        <RefreshCw size={18} /> Reflection Time
      </div>
      <p className="text-sm text-amber-700/80 mb-4">
        This scenario was created on {formatDate(createdAt)}. How did it go?
        Looking back at your scenario is one of the most powerful things you can do.
      </p>

      {result ? (
        <div>
          <div className="bg-white rounded-xl p-4 text-sm text-slate-700 leading-relaxed mb-3">
            {result}
          </div>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="border-amber-300 text-amber-700">
            Update reflection
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
        >
          <Sparkles size={14} /> Add your reflection
        </Button>
      )}

      {open && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-amber-700 block mb-1">What actually happened?</label>
            <Textarea
              value={answers.whatHappened}
              onChange={e => setAnswers(p => ({ ...p, whatHappened: e.target.value }))}
              placeholder="What did you do, achieve, or change since writing this scenario?"
              className="min-h-[80px] bg-white resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-amber-700 block mb-1">Any surprises?</label>
            <Textarea
              value={answers.surprises}
              onChange={e => setAnswers(p => ({ ...p, surprises: e.target.value }))}
              placeholder="What came true unexpectedly? What went differently than imagined?"
              className="min-h-[80px] bg-white resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-amber-700 block mb-1">What&apos;s next?</label>
            <Textarea
              value={answers.nextSteps}
              onChange={e => setAnswers(p => ({ ...p, nextSteps: e.target.value }))}
              placeholder="What do you see as your next steps or focus?"
              className="min-h-[80px] bg-white resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={submit}
              disabled={loading || !answers.whatHappened}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading ? 'Generating…' : 'Save reflection'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-amber-300">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
