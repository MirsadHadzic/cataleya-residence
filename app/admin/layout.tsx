// app/admin/layout.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Building2, CalendarCheck, BookOpen, Tag, Settings, LogOut, Globe, Menu, X } from 'lucide-react'
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
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLinkClick = () => {
    setIsMobileOpen(false)
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-6 py-8 border-b border-white/10 flex justify-between items-center">
        <div>
          <div className="text-gold text-xs tracking-[0.2em] uppercase font-sans mb-1">Cataleya</div>
          <div className="text-white font-serif text-xl">Admin</div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden text-white/60 hover:text-white p-1"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            onClick={handleLinkClick}
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
          onClick={handleLinkClick}
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
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-charcoal flex flex-col hidden md:flex h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer Sidebar */}
          <aside className="relative w-64 bg-charcoal flex flex-col h-full shadow-2xl animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger trigger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-1.5 -ml-1 text-charcoal hover:bg-gray-100 rounded transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
            <h1 className="font-serif text-xl text-charcoal">Cataleya Residence</h1>
          </div>
          <span className="text-xs text-gray-400 font-sans hidden sm:inline">Admin Dashboard</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

