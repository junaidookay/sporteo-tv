'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { UserMenu } from '@/components/user-menu'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { href: '/', label: 'HOME' },
    { href: '/live', label: 'LIVE', isLive: true },
    { href: '/events', label: 'EVENTS' },
    { href: '/replays', label: 'REPLAYS' },
    { href: '/subscriptions', label: 'SUBSCRIBE' },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="Sporteo.tv" className="h-8 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                link.isLive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 animate-pulse'
                  : isActive(link.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary text-foreground'
              }`}
            >
              {link.isLive && <span className="w-2 h-2 bg-white rounded-full"></span>}
              {link.label}
            </Link>
          ))}
        </div>

        {/* Theme & User Menu */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <UserMenu />
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-md"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  link.isLive
                    ? 'bg-primary text-primary-foreground flex items-center gap-2 w-fit'
                    : isActive(link.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary text-foreground'
                }`}
              >
                {link.isLive && <span className="w-2 h-2 bg-white rounded-full"></span>}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}