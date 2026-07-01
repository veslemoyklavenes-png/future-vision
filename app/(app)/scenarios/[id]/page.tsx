export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Newspaper, Share2, Mic } from 'lucide-react'
import { formatDate, daysSince } from '@/lib/utils'
import ActionPlan from '@/components/ActionPlan'
import ExportButtons from '@/components/ExportButtons'
import ReflectionSection from '@/components/ReflectionSection'
import Markdown from '@/components/Markdown'

const artifactIcons: Record<string, React.ReactNode> = {
  'News Article': <Newspaper size={14} />,
  'Social Media Post': <Share2 size={14} />,
  'Podcast Episode': <Mic size={14} />,
}

const artifactColors: Record<string, string> = {
  'News Article': 'bg-blue-50 text-blue-700',
  'Social Media Post': 'bg-pink-50 text-pink-700',
  'Podcast Episode': 'bg-orange-50 text-orange-700',
  'Book Review': 'bg-green-50 text-green-700',
  'Project Summary': 'bg-purple-50 text-purple-700',
}

export default async function ScenarioDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: scenario } = await supabase
    .from('scenarios')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!scenario) notFound()

  const { data: actionItems } = await supabase
    .from('action_items')
    .select('*')
    .eq('scenario_id', scenario.id)
    .order('sort_order')

  const age = daysSince(scenario.created_at)
  const showReflection = age >= 30

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-serif text-ink mb-2">{scenario.title}</h1>
        <div className="flex justify-center gap-2 mb-4">
          <Badge variant="outline">{scenario.category}</Badge>
          <Badge variant="secondary">lifestyle</Badge>
        </div>
        <ExportButtons scenarioId={scenario.id} userEmail={user.email ?? ''} />
      </div>

      {/* Future Scenario */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-2 text-sage-deep font-semibold mb-4">
          <Sparkles size={18} /> Future Scenario
        </div>
        <Markdown content={scenario.scenario_text} />
      </div>

      {/* Action Plan */}
      {actionItems && actionItems.length > 0 && (
        <ActionPlan items={actionItems} scenarioId={scenario.id} />
      )}

      {/* Future Artifacts */}
      {scenario.future_artifacts && scenario.future_artifacts.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6 mb-4 shadow-sm">
          <div className="flex items-center gap-2 text-sage-deep font-semibold mb-4">
            <Sparkles size={18} /> Future Artifacts
          </div>
          <div className="space-y-5">
            {scenario.future_artifacts.map((artifact: { type: string; title: string; content: string; relevance: string }, i: number) => (
              <div key={i} className="border border-border rounded-xl p-4 bg-cream/40">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1 mb-2 ${artifactColors[artifact.type] ?? 'bg-sage-light text-sage-deep'}`}>
                  {artifactIcons[artifact.type]} {artifact.type}
                </span>
                <h3 className="font-serif text-lg text-ink mb-1">{artifact.title}</h3>
                <p className="text-sm text-ink-muted mb-2 leading-relaxed">{artifact.content}</p>
                {artifact.relevance && <p className="text-xs text-ink-soft italic border-t border-border pt-2">{artifact.relevance}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reflection */}
      {showReflection && (
        <ReflectionSection
          scenarioId={scenario.id}
          existingReflection={scenario.reflection}
          scenarioTitle={scenario.title}
          createdAt={scenario.created_at}
        />
      )}

      <p className="text-center text-xs text-slate-400 mt-6">Created {formatDate(scenario.created_at)}</p>
    </div>
  )
}
