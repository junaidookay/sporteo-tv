'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getEvents } from '@/lib/db-client'

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalEvents: 0,
    liveEvents: 0,
    completedEvents: 0,
    upcomingEvents: 0,
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          router.push('/auth/login')
          return
        }

        // Check if user is admin from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (profileError || !profile?.is_admin) {
          router.push('/')
          return
        }

        setUser(user)

        // Load events
        const eventsData = await getEvents(supabase)
        setEvents(eventsData)

        // Calculate stats
        setStats({
          totalEvents: eventsData.length,
          liveEvents: eventsData.filter((e) => e.status === 'live').length,
          completedEvents: eventsData.filter((e) => e.status === 'completed').length,
          upcomingEvents: eventsData.filter((e) => e.status === 'scheduled').length,
        })
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

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
            <h1 className="text-4xl font-black mb-2">DASHBOARD</h1>
            <p className="text-muted-foreground">Welcome back, {user?.email}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Events"
              value={stats.totalEvents}
              icon="🎬"
              color="primary"
            />
            <StatCard
              title="Live Events"
              value={stats.liveEvents}
              icon="🔴"
              color="red"
            />
            <StatCard
              title="Upcoming"
              value={stats.upcomingEvents}
              icon="⏰"
              color="blue"
            />
            <StatCard
              title="Completed"
              value={stats.completedEvents}
              icon="✓"
              color="green"
            />
          </div>

          {/* Quick Actions */}
          <Card className="p-8 border-border mb-8">
            <h2 className="text-2xl font-black mb-6">QUICK ACTIONS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Create Event
              </Button>
              <Button variant="outline" className="border-border hover:bg-secondary">
                Create Stream
              </Button>
              <Button variant="outline" className="border-border hover:bg-secondary">
                View Analytics
              </Button>
              <Button variant="outline" className="border-border hover:bg-secondary">
                Manage Users
              </Button>
            </div>
          </Card>

          {/* Recent Events */}
          <Card className="border-border">
            <div className="p-8 border-b border-border flex items-center justify-between">
              <h2 className="text-2xl font-black">RECENT EVENTS</h2>
              <a href="/admin/events" className="text-primary hover:text-primary/80">
                View All →
              </a>
            </div>
            <div className="divide-y divide-border">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="p-6 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                  <div>
                    <h3 className="font-bold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.start_time).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      event.status === 'live'
                        ? 'bg-red-600/20 text-red-500'
                        : event.status === 'scheduled'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {event.status}
                    </span>
                    <Button size="sm" variant="outline" className="border-border hover:bg-secondary">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: string
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card className="p-6 border-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <p className="text-3xl font-black">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </Card>
  )
}
