'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { getEvents } from '@/lib/db'

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          router.push('/auth/login')
          return
        }

        setUser(user)

        // Load events
        const eventsData = await getEvents()
        setEvents(eventsData)
      } catch (error) {
        console.error('Failed to load events:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Calculate analytics
  const totalRevenue = events.reduce((sum, e) => sum + (e.ticket_price_cents || 0), 0)
  const avgEventPrice = events.length > 0 ? totalRevenue / events.length : 0
  const completedEvents = events.filter((e) => e.status === 'completed').length

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2">ANALYTICS</h1>
            <p className="text-muted-foreground">Platform performance and metrics</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Events"
              value={events.length}
              subtitle="All time"
            />
            <MetricCard
              title="Completed Events"
              value={completedEvents}
              subtitle="Successfully hosted"
            />
            <MetricCard
              title="Total Revenue"
              value={`$${(totalRevenue / 100).toFixed(2)}`}
              subtitle="From PPV events"
            />
            <MetricCard
              title="Avg Event Price"
              value={`$${(avgEventPrice / 100).toFixed(2)}`}
              subtitle="Average PPV price"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-8 border-border">
              <h2 className="text-xl font-black mb-6">EVENTS BY STATUS</h2>
              <div className="space-y-4">
                {[
                  { label: 'Scheduled', value: events.filter((e) => e.status === 'scheduled').length },
                  { label: 'Live', value: events.filter((e) => e.status === 'live').length },
                  { label: 'Completed', value: events.filter((e) => e.status === 'completed').length },
                  { label: 'Cancelled', value: events.filter((e) => e.status === 'cancelled').length },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 bg-primary rounded-full" style={{ width: `${Math.max(item.value * 30, 10)}px` }} />
                      <span className="font-bold w-8 text-right">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8 border-border">
              <h2 className="text-xl font-black mb-6">EVENTS BY TYPE</h2>
              <div className="space-y-4">
                {['boxing', 'mma', 'k1'].map((type) => {
                  const count = events.filter((e) => e.event_type === type).length
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-muted-foreground capitalize">{type}</span>
                      <div className="flex items-center gap-3">
                        <div className="h-2 bg-primary rounded-full" style={{ width: `${Math.max(count * 30, 10)}px` }} />
                        <span className="font-bold w-8 text-right">{count}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Top Events */}
          <Card className="border-border">
            <div className="p-8 border-b border-border">
              <h2 className="text-xl font-black">TOP EVENTS BY PRICE</h2>
            </div>
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {events
                .filter((e) => e.ticket_price_cents)
                .sort((a, b) => b.ticket_price_cents - a.ticket_price_cents)
                .slice(0, 10)
                .map((event) => (
                  <div key={event.id} className="p-6 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                    <div>
                      <p className="font-bold">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.event_type}</p>
                    </div>
                    <span className="text-primary font-black text-lg">
                      ${(event.ticket_price_cents / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: number | string
  subtitle: string
}

function MetricCard({ title, value, subtitle }: MetricCardProps) {
  return (
    <Card className="p-6 border-border">
      <p className="text-muted-foreground text-sm mb-2">{title}</p>
      <p className="text-3xl font-black mb-2">{value}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </Card>
  )
}
