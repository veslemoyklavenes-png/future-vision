export const dynamic = 'force-dynamic'
import { BookOpen, Lightbulb, Heart, TrendingUp } from 'lucide-react'

const resources = [
  {
    icon: Lightbulb,
    title: 'How to use Future Vision',
    description: 'Learn how to get the most out of your scenario generator. Create multiple scenarios, track your action plan, and use the reflection feature after 30 days.',
  },
  {
    icon: Heart,
    title: 'The power of writing your future',
    description: 'Research shows that people who write down their goals and visualize their future are significantly more likely to achieve them. Future Vision builds on this insight.',
  },
  {
    icon: TrendingUp,
    title: 'Making your action plan work',
    description: 'Check off your action items regularly, and break big tasks into the specific sub-steps listed. Consistency over intensity.',
  },
  {
    icon: BookOpen,
    title: 'Reflection: the missing step',
    description: 'After 30 days, come back to your scenario and use the Reflection feature. Marking what came true – and what surprised you – deepens the learning and builds momentum.',
  },
]

export default function ResourcesPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Resources</h1>
      <p className="text-slate-500 mb-8">Guidance to help you get the most from Future Vision.</p>

      <div className="space-y-4">
        {resources.map(({ icon: Icon, title, description }) => (
          <div key={title} className="bg-white rounded-xl border border-slate-200 p-6 flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <Icon size={20} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 mb-1">{title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
