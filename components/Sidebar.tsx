'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart2, BookOpen, FolderOpen, LogOut, User, Menu, X } from 'lucide-react'
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
  const [open, setOpen] = useState(false)

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = (onNavigate?: () => void) => (
    <nav className="flex-1 p-4 space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
            pathname.startsWith(href)
              ? 'bg-white/15 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          )}
        >
          <Icon size={18} />
          {label}
        </Link>
      ))}
    </nav>
  )

  const footer = (
    <div className="p-4 border-t border-white/15 flex gap-2">
      <button
        onClick={() => { setOpen(false); router.push('/account') }}
        className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'flex-1 bg-transparent border-white/25 text-white hover:bg-white/10')}
      >
        <User size={14} className="mr-1" /> Account
      </button>
      <button
        onClick={signOut}
        className={cn(buttonVariants({ size: 'sm' }), 'flex-1 bg-white/10 hover:bg-white/20 text-white border-0')}
      >
        <LogOut size={14} className="mr-1" /> Sign out
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-sage-deep text-white/90 flex-col shrink-0">
        <div className="p-6 border-b border-white/15">
          <h1 className="text-xl font-serif font-semibold tracking-wide text-white">FutureVision</h1>
        </div>
        {navLinks()}
        {footer}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-sage-deep text-white px-4 py-3">
        <h1 className="text-lg font-serif font-semibold tracking-wide">FutureVision</h1>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-1">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-sage-deep text-white/90 flex flex-col shadow-xl">
            <div className="p-6 border-b border-white/15 flex items-center justify-between">
              <h1 className="text-xl font-serif font-semibold tracking-wide text-white">FutureVision</h1>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1">
                <X size={22} />
              </button>
            </div>
            {navLinks(() => setOpen(false))}
            {footer}
          </aside>
        </div>
      )}
    </>
  )
}
