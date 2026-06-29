export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'
import { formatDate, daysSince } from '@/lib/utils'
import ActionPlan from '@/components/ActionPlan'
import ExportButtons from '@/components/ExportButtons'
import ReflectionSection from '@/components/ReflectionSection'

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
    <div className="p-8 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{scenario.title}</h1>
        <div className="flex justify-center gap-2 mb-4">
          <Badge variant="outline">{scenario.category}</Badge>
          <Badge variant="secondary">{scenario.category === 'Transformation' ? 'lifestyle' : 'lifestyle'}</Badge>
        </div>
        <ExportButtons scenarioId={scenario.id} userEmail={user.email ?? ''} />
      </div>

      {/* Future Scenario */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
        <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-4">
          <Sparkles size={18} /> Future Scenario
        </div>
        <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
          {scenario.scenario_text}
        </div>
      </div>

      {/* Action Plan */}
      {actionItems && actionItems.length > 0 && (
        <ActionPlan items={actionItems} scenarioId={scenario.id} />
      )}

      {/* Future Artifacts */}
      {scenario.future_artifacts && scenario.future_artifacts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-4">
            <Sparkles size={18} /> Future Artifacts
          </div>
          <div className="space-y-6">
            {scenario.future_artifacts.map((artifact: { type: string; title: string; content: string; relevance: string }, i: number) => (
              <div key={i}>
                <span className="inline-block text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 mb-2">
                  {artifact.type}
                </span>
                <h3 className="font-semibold text-slate-800 mb-1">{artifact.title}</h3>
                <p className="text-sm text-slate-600 mb-1">{artifact.content}</p>
                <p className="text-xs text-slate-400 italic">Relevance: {artifact.relevance}</p>
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
