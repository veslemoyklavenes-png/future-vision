export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function ScenariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: scenarios } = await supabase
    .from('scenarios')
    .select('id, title, category, scenario_text, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-ink">Your Scenarios</h1>
        <p className="text-ink-muted mt-1">View, compare, and track progress over time.</p>
      </div>

      {(!scenarios || scenarios.length === 0) ? (
        <div className="text-center py-20 text-ink-soft">
          <Sparkles size={40} className="mx-auto mb-4 text-sage-mid" />
          <p className="text-lg mb-4">No scenarios yet</p>
          <Link href="/generator" className={cn(buttonVariants(), 'bg-sage-deep hover:bg-sage-deeper text-white')}>
            Create your first scenario
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map(s => (
            <div key={s.id} className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-serif text-ink text-lg leading-tight">{s.title}</h2>
                <Badge variant="secondary" className="shrink-0">{s.category}</Badge>
              </div>
              <p className="text-sm text-ink-muted line-clamp-3">{s.scenario_text}</p>
              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-xs text-ink-soft">Updated {formatDate(s.created_at)}</span>
                <Link href={`/scenarios/${s.id}`} className={cn(buttonVariants({ size: 'sm' }), 'bg-sage-deep hover:bg-sage-deeper text-white gap-1')}>
                  <Sparkles size={12} /> Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
