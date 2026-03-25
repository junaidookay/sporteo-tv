'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { UserMenu } from '@/components/user-menu'

export function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="Sporteo.tv" className="h-8 w-auto" />
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
            href="/live"
            className="px-4 py-2 text-sm font-black rounded-md transition-all bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 animate-pulse"
          >
            <span className="w-2 h-2 bg-white rounded-full"></span>
            LIVE
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

        {/* Theme & User Menu */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <UserMenu />
        </div>
      </div>
    </nav>
  )
}
