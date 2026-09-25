'use client'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import EditableLine from '@/components/EditableLine'

interface ActionItem {
  id: string
  title: string
  description: string
  timeline: string
  priority: string
  sub_tasks: string[]
  completed: boolean
  cue: string | null
}

export default function ActionPlan({ items }: { items: ActionItem[]; scenarioId: string }) {
  const [localItems, setLocalItems] = useState(items)

  const completed = localItems.filter(i => i.completed).length
  const pct = Math.round((completed / localItems.length) * 100)

  async function saveCue(itemId: string, cue: string) {
    const res = await fetch(`/api/action-items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cue }),
    })
    if (!res.ok) throw new Error('Save failed')
    setLocalItems(prev => prev.map(i => (i.id === itemId ? { ...i, cue: cue || null } : i)))
  }

  async function toggle(itemId: string, current: boolean) {
    setLocalItems(prev => prev.map(i => i.id === itemId ? { ...i, completed: !current } : i))
    await fetch(`/api/action-items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !current }),
    })
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sage-deep font-semibold">
          <Target size={18} /> Action Plan
        </div>
        <div className="flex items-center gap-3">
          <Progress value={pct} className="w-32 h-2" />
          <span className="text-xs text-ink-soft">{pct}% completed</span>
        </div>
      </div>

      <div className="space-y-5">
        {localItems.map(item => (
          <div key={item.id} className="flex gap-3">
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => toggle(item.id, item.completed)}
              className="mt-0.5 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className={cn('font-semibold text-ink mb-1', item.completed && 'line-through text-ink-soft')}>
                {item.title}
              </h3>
              <p className="text-sm text-ink-muted mb-2">{item.description}</p>

              <div className="mb-2 rounded-lg bg-sage-light/30 px-3 py-2">
                <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-sage-deep">
                  The moment
                </p>
                <EditableLine
                  value={item.cue}
                  emptyLabel="Add the moment this actually happens"
                  placeholder="When you sit down with coffee on Tuesday morning…"
                  onSave={next => saveCue(item.id, next)}
                  className="text-sm text-ink-muted"
                />
              </div>
              <div className="flex flex-wrap items-start gap-2 mb-2">
                {/* Generated timelines are full sentences, so this badge has to
                    wrap and grow instead of staying a fixed-height pill. */}
                <Badge
                  variant="outline"
                  className="text-xs h-auto min-w-0 shrink whitespace-normal text-left rounded-lg py-1 leading-snug"
                >
                  ⏱ {item.timeline}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn('text-xs', item.priority === 'high' ? 'border-red-200 text-red-600 bg-red-50' : 'border-yellow-200 text-yellow-700 bg-yellow-50')}
                >
                  Priority: {item.priority}
                </Badge>
              </div>
              {item.sub_tasks?.length > 0 && (
                <ul className="text-sm text-ink-muted space-y-0.5 ml-1">
                  {item.sub_tasks.map((t, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-sage-mid mt-1">•</span> {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
