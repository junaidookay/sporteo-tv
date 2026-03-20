'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    })()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-black text-2xl text-primary">
          PRIME FIGHT
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/') ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground'
            }`}
          >
            HOME
          </Link>
          <Link
            href="/events"
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/events') ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground'
            }`}
          >
            EVENTS
          </Link>
          <Link
            href="/replays"
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/replays') ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground'
            }`}
          >
            REPLAYS
          </Link>
          <Link
            href="/subscriptions"
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/subscriptions') ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground'
            }`}
          >
            SUBSCRIBE
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                    Profile
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
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
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
