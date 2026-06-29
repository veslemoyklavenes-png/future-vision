export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50">
      <div className="text-center max-w-lg px-6">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
          <Sparkles size={36} className="text-indigo-500" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-3">
          Future Scenario Generator
        </h1>
        <p className="text-slate-500 mb-8 text-lg">
          Create your personalized future scenario and action plan.
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link href="/generator" className={cn(buttonVariants({ size: 'lg' }), 'bg-indigo-600 hover:bg-indigo-700 px-8')}>
            Start <ArrowRight size={16} className="ml-2" />
          </Link>
          <Link href="/generator" className="text-indigo-500 hover:text-indigo-700 text-sm underline-offset-4 hover:underline">
            Prefer guided questions?
          </Link>
          <p className="text-slate-400 text-sm mt-1">Takes about 2–3 minutes</p>
        </div>
      </div>
    </div>
  )
}
