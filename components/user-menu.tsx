'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function UserMenu() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Check if user is admin
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        
        setIsAdmin(data?.is_admin || false)
      }
      
      setLoading(false)
    })()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsOpen(false)
    router.push('/')
  }

  if (loading) {
    return null
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/sign-up">
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Get Started
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors flex items-center gap-2"
      >
        <span>{user.email?.split('@')[0] || 'Account'}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <p className="text-sm font-medium text-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-1">{user.id}</p>
          </div>

          <nav className="py-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Profile Settings
            </Link>

            {isAdmin && (
              <>
                <div className="border-t border-border my-2"></div>
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-sm text-primary hover:bg-primary/10 transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Panel
                </Link>
              </>
            )}
          </nav>

          <div className="border-t border-border p-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors text-left font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
