export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { count } = await supabase
    .from('scenarios')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Account</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Email</p>
          <p className="text-slate-700">{user.email}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Scenarios created</p>
          <p className="text-slate-700">{count ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Member since</p>
          <p className="text-slate-700">
            {new Date(user.created_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}
