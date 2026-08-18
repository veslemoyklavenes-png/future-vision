'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DeleteScenarioButton({
  scenarioId,
  redirectTo,
  variant = 'overlay',
}: {
  scenarioId: string
  /** Where to go after a successful delete. Omit to stay put and refresh the list. */
  redirectTo?: string
  /** 'overlay' covers the nearest positioned ancestor (a card); 'inline' sits in flow. */
  variant?: 'overlay' | 'inline'
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function remove() {
    setDeleting(true)
    setError(null)
    const res = await fetch(`/api/scenarios/${scenarioId}`, { method: 'DELETE' })
    if (!res.ok) {
      setDeleting(false)
      setError('Could not delete. Please try again.')
      return
    }
    if (redirectTo) router.push(redirectTo)
    router.refresh()
  }

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Delete scenario"
        onClick={() => setConfirming(true)}
        className="text-ink-soft hover:text-destructive"
      >
        <Trash2 size={14} />
      </Button>
    )
  }

  return (
    <div
      className={
        variant === 'overlay'
          ? 'absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-card/95 p-5 text-center backdrop-blur-sm'
          : 'flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center'
      }
    >
      <div>
        <p className="font-serif text-ink">Delete this scenario?</p>
        <p className="mt-1 text-xs text-ink-soft">
          This also removes its action plan, and cannot be undone. Export it first if you want a copy.
        </p>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>
          Cancel
        </Button>
        <Button variant="destructive" size="sm" onClick={remove} disabled={deleting} className="gap-1">
          {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
    </div>
  )
}
