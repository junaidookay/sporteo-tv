'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AdminSidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/events', label: 'Events', icon: '🎬' },
    { href: '/admin/streams', label: 'Streams', icon: '📡' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/transactions', label: 'Transactions', icon: '💳' },
    { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-secondary border-r border-border min-h-screen sticky top-0">
      <div className="p-6">
        <Link href="/admin" className="text-xl font-black text-primary">
          SPORTEO.TV
        </Link>
        <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
      </div>

      <nav className="space-y-1 px-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(link.href)
                ? 'bg-primary text-primary-foreground font-bold'
                : 'text-foreground hover:bg-primary/10 hover:text-primary'
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
          ← Back to Site
        </Link>
      </div>
    </aside>
  )
}
