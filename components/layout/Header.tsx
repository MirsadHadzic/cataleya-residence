// components/layout/Header.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Apartments', href: '/apartments' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Location', href: '/#location' },
  { label: 'Contact', href: '/#contact' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const isTransparent = isHome && !scrolled && !menuOpen

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isTransparent
          ? 'bg-transparent'
          : 'bg-ivory/95 backdrop-blur-sm border-b border-champagne'
      )}
    >
      <div className="container-content">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex flex-col leading-none">
              <span
                className={cn(
                  'text-xs font-sans font-500 tracking-[0.25em] uppercase transition-colors duration-300',
                  isTransparent ? 'text-gold' : 'text-gold'
                )}
              >
                Cataleya
              </span>
              <span
                className={cn(
                  'font-serif text-xl transition-colors duration-300',
                  isTransparent ? 'text-white' : 'text-charcoal'
                )}
              >
                Residence
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-xs font-sans font-500 tracking-[0.18em] uppercase transition-colors duration-300',
                  isTransparent
                    ? 'text-white/80 hover:text-white'
                    : 'text-charcoal-muted hover:text-gold'
                )}
              >
                {link.label}
              </Link>
            ))}
            {/* Dev-only admin link -- hidden in production */}
            {process.env.NODE_ENV === 'development' && (
              <Link
                href="/admin"
                className="text-xs font-sans font-500 tracking-[0.18em] uppercase text-gold/70 hover:text-gold transition-colors duration-300 border-b border-dashed border-gold/40"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* CTA + Mobile menu */}
          <div className="flex items-center gap-4">
            <Link
              href="/apartments"
              className={cn(
                'hidden md:inline-flex items-center px-6 py-2.5 text-xs font-sans font-500 tracking-widest uppercase border transition-all duration-300',
                isTransparent
                  ? 'border-white/60 text-white hover:bg-white hover:text-charcoal'
                  : 'border-gold text-gold hover:bg-gold hover:text-white'
              )}
            >
              Book Now
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                'md:hidden p-2 transition-colors duration-300',
                isTransparent ? 'text-white' : 'text-charcoal'
              )}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden fixed inset-0 bg-charcoal z-40 flex flex-col transition-all duration-500',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{ top: '80px' }}
      >
        <div className="flex flex-col items-center justify-center flex-1 gap-10 px-8">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-serif text-3xl text-white/90 hover:text-gold transition-colors duration-300"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {link.label}
            </Link>
          ))}
          {/* Dev-only admin link */}
          {process.env.NODE_ENV === 'development' && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="text-xs font-sans tracking-[0.2em] uppercase text-gold/60 hover:text-gold transition-colors duration-300"
            >
              Admin Panel
            </Link>
          )}
          <Link
            href="/apartments"
            onClick={() => setMenuOpen(false)}
            className="mt-4 btn-outline-white text-sm"
          >
            Book Your Stay
          </Link>
        </div>

        <div className="pb-12 text-center">
          <p className="text-white/30 text-xs tracking-[0.2em] uppercase font-sans">
            Sarajevo - Bosnia &amp; Herzegovina
          </p>
        </div>
      </div>
    </header>
  )
}
