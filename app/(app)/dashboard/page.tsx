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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sage-light/50 to-cream">
      <div className="text-center max-w-lg px-6">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-sage-light flex items-center justify-center">
          <Sparkles size={36} className="text-sage-deep" />
        </div>
        <h1 className="text-5xl font-serif text-ink mb-3">
          See your future. Then build it.
        </h1>
        <p className="text-ink-muted mb-8 text-lg">
          Create your personalized future scenario and a clear plan to get there.
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link href="/generator" className={cn(buttonVariants({ size: 'lg' }), 'bg-sage-deep hover:bg-sage-deeper text-white px-8')}>
            Start <ArrowRight size={16} className="ml-2" />
          </Link>
          <p className="text-ink-soft text-sm mt-1">Takes about 2–3 minutes</p>
        </div>
      </div>
    </div>
  )
}
