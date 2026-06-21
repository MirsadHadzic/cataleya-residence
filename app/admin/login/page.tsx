// app/admin/login/page.tsx
import type { Metadata } from 'next'
import { LoginForm } from '@/components/admin/LoginForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Sign In | Cataleya Residence',
  description: 'Authorized administrative sign-in portal for Cataleya Residence.',
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Decorative gold background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Return to website link */}
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-gold transition-colors duration-300"
        >
          <ArrowLeft size={14} />
          Back to website
        </Link>
      </div>

      {/* Content wrapper */}
      <div className="w-full max-w-md bg-charcoal border border-white/5 shadow-[0_8px_60px_rgba(0,0,0,0.4)] p-8 md:p-10 relative z-10 animate-fade-up">
        {/* Accent top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/50 via-gold to-gold/50" />

        {/* Brand/Header */}
        <div className="text-center mb-8">
          <div className="text-gold text-[11px] tracking-[0.25em] uppercase font-sans mb-2">
            Cataleya Residence
          </div>
          <h1 className="font-serif text-3xl text-white font-light">
            Portal Access
          </h1>
          <div className="w-12 h-px bg-gold/30 mx-auto mt-4" />
        </div>

        {/* Login form */}
        <LoginForm />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-[10px] text-white/20 tracking-wider uppercase z-10">
        &copy; {new Date().getFullYear()} Cataleya Residence. All Rights Reserved.
      </div>
    </div>
  )
}
