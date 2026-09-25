'use client'
import EditableLine from '@/components/EditableLine'

/**
 * Sits under the obstacle reflection, deliberately separate from it. The
 * reflection does not comfort; this is the prepared response, and it belongs
 * to the person rather than to the model.
 */
export default function CopingPlan({
  scenarioId,
  value,
}: {
  scenarioId: string
  value: string | null
}) {
  async function save(next: string) {
    const res = await fetch(`/api/scenarios/${scenarioId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coping_plan: next }),
    })
    if (!res.ok) throw new Error('Save failed')
  }

  return (
    <div className="mt-5 border-t border-border pt-4">
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
        If it shows up
      </p>
      <EditableLine
        value={value}
        emptyLabel="Write what you'll do when it does"
        placeholder="When I catch myself waiting until it feels ready, I open the file and write one sentence."
        onSave={save}
        className="text-sm text-ink"
      />
      <p className="mt-2 text-xs italic text-ink-soft">
        A draft. It holds better in your own words than in mine.
      </p>
    </div>
  )
}
