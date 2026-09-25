'use client'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * A line of text the person can rewrite in place. Used for cues and the
 * coping plan: the model's version is a draft, and an implementation
 * intention only does its job when the person recognises the moment as theirs.
 */
export default function EditableLine({
  value,
  placeholder,
  emptyLabel,
  onSave,
  className,
}: {
  value: string | null
  placeholder: string
  emptyLabel: string
  onSave: (next: string) => Promise<void>
  className?: string
}) {
  const [current, setCurrent] = useState(value ?? '')
  const [draft, setDraft] = useState(value ?? '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)

  function cancel() {
    setDraft(current)
    setEditing(false)
    setFailed(false)
  }

  async function save() {
    const next = draft.trim()
    setSaving(true)
    setFailed(false)
    try {
      await onSave(next)
      setCurrent(next)
      setEditing(false)
    } catch {
      // Keep the draft on screen — losing someone's typing is worse than the
      // failed save itself.
      setFailed(true)
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => { setDraft(current); setEditing(true) }}
        className={cn(
          'group w-full text-left flex items-start gap-1.5 rounded-lg -mx-1 px-1 py-0.5 transition-colors hover:bg-sage-light/50',
          className
        )}
      >
        <span className={cn('flex-1', current ? '' : 'italic text-ink-soft')}>
          {current || emptyLabel}
        </span>
        <Pencil
          size={12}
          className="mt-1 shrink-0 text-ink-soft opacity-0 transition-opacity group-hover:opacity-100"
        />
      </button>
    )
  }

  return (
    <div className={className}>
      <Textarea
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder={placeholder}
        className="min-h-[72px] resize-none text-sm"
        onKeyDown={e => {
          if (e.key === 'Escape') cancel()
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save()
        }}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={save}
          disabled={saving}
          className="bg-sage-deep hover:bg-sage-deeper text-white"
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <button
          type="button"
          onClick={cancel}
          className="text-sm text-ink-soft hover:text-ink-muted"
        >
          Cancel
        </button>
        {failed && <span className="text-sm text-red-500">Could not save — try again.</span>}
      </div>
    </div>
  )
}
