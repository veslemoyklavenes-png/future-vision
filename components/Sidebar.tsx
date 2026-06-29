'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart2, BookOpen, FolderOpen, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { buttonVariants } from '@/components/ui/button'

const navItems = [
  { href: '/generator', label: 'Future Scenario Generator', icon: BarChart2 },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/scenarios', label: 'Your scenarios', icon: FolderOpen },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-[#1a1f2e] text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold">Future Vision</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              pathname.startsWith(href)
                ? 'bg-white/10 text-white'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 flex gap-2">
        <button
          onClick={() => router.push('/account')}
          className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'flex-1 bg-transparent border-white/20 text-white hover:bg-white/10')}
        >
          <User size={14} className="mr-1" /> Account
        </button>
        <button
          onClick={signOut}
          className={cn(buttonVariants({ size: 'sm' }), 'flex-1 bg-red-500 hover:bg-red-600 text-white border-0')}
        >
          <LogOut size={14} className="mr-1" /> Sign out
        </button>
      </div>
    </aside>
  )
}
