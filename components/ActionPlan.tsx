'use client'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActionItem {
  id: string
  title: string
  description: string
  timeline: string
  priority: string
  sub_tasks: string[]
  completed: boolean
}

export default function ActionPlan({ items }: { items: ActionItem[]; scenarioId: string }) {
  const [localItems, setLocalItems] = useState(items)

  const completed = localItems.filter(i => i.completed).length
  const pct = Math.round((completed / localItems.length) * 100)

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
            <div className="flex-1">
              <h3 className={cn('font-semibold text-ink mb-1', item.completed && 'line-through text-ink-soft')}>
                {item.title}
              </h3>
              <p className="text-sm text-ink-muted mb-2">{item.description}</p>
              <div className="flex gap-2 mb-2">
                <Badge variant="outline" className="text-xs">⏱ {item.timeline}</Badge>
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
