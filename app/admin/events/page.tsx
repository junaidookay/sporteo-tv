'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getEvents } from '@/lib/db'

export default function AdminEventsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [filter, setFilter] = useState<string>('all')

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
        setEvents(eventsData.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()))
      } catch (error) {
        console.error('Failed to load events:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const filteredEvents = filter === 'all' ? events : events.filter((e) => e.status === filter)

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black mb-2">EVENTS</h1>
              <p className="text-muted-foreground">Manage all streaming events</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Create Event
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-8">
            {['all', 'scheduled', 'live', 'completed'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                onClick={() => setFilter(status)}
                className={filter === status ? 'bg-primary text-primary-foreground' : 'border-border'}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          {/* Events Table */}
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-6 py-4 text-left font-bold">Event</th>
                    <th className="px-6 py-4 text-left font-bold">Date</th>
                    <th className="px-6 py-4 text-left font-bold">Type</th>
                    <th className="px-6 py-4 text-left font-bold">Status</th>
                    <th className="px-6 py-4 text-left font-bold">Price</th>
                    <th className="px-6 py-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold">{event.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(event.start_time).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold uppercase">{event.event_type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          event.status === 'live'
                            ? 'bg-red-600/20 text-red-500'
                            : event.status === 'scheduled'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {event.ticket_price_cents ? `$${(event.ticket_price_cents / 100).toFixed(2)}` : 'Free'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" className="border-border hover:bg-secondary">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="border-border hover:bg-secondary">
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEvents.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <p>No events found with status: {filter}</p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
