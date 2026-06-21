// app/admin/layout.tsx
import Link from 'next/link'
import { Home, Building2, CalendarCheck, BookOpen, Tag, Settings, LogOut, Globe } from 'lucide-react'
import { logoutAction } from '@/actions/auth'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/admin' },
  { icon: Building2, label: 'Apartments', href: '/admin/apartments' },
  { icon: BookOpen, label: 'Bookings', href: '/admin/bookings' },
  { icon: CalendarCheck, label: 'Inquiries', href: '/admin/inquiries' },
  { icon: Tag, label: 'Pricing', href: '/admin/pricing' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-charcoal flex flex-col hidden md:flex">
        {/* Brand */}
        <div className="px-6 py-8 border-b border-white/10">
          <div className="text-gold text-xs tracking-[0.2em] uppercase font-sans mb-1">Cataleya</div>
          <div className="text-white font-serif text-xl">Admin</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/8 transition-all duration-200 text-sm font-sans"
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-6 border-t border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 text-white/40 hover:text-white/70 transition-colors text-xs font-sans"
          >
            <Globe size={14} />
            View Website
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 text-xs font-sans text-left cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="font-serif text-xl text-charcoal">Cataleya Residence</h1>
          <span className="text-xs text-gray-400 font-sans">Admin Dashboard</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
