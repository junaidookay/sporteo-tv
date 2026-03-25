import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getEvents } from '@/lib/db'

export const revalidate = 3600

export default async function EventsPage() {
  let allEvents = []
  let error = null

  try {
    allEvents = await getEvents()
  } catch (err) {
    console.error('Failed to load events:', err)
    error = 'Failed to load events'
  }

  const upcomingEvents = allEvents.filter((e) => new Date(e.start_time) > new Date())
  const pastEvents = allEvents.filter((e) => new Date(e.start_time) <= new Date())

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-4">LIVE EVENTS</h1>
          <p className="text-xl text-muted-foreground">
            Watch live sports events from around the world streamed in HD
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
            {error}
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-3xl font-black">UPCOMING EVENTS</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-black">PAST EVENTS</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {allEvents.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground mb-6">No events available yet</p>
            <Link href="/">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Return to Home
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

interface EventCardProps {
  event: any
}

function EventCard({ event }: EventCardProps) {
  const isLive = event.status === 'live'
  const isUpcoming = new Date(event.start_time) > new Date()

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="overflow-hidden hover:border-primary transition-all hover:shadow-lg cursor-pointer h-full flex flex-col group">
        <div className="relative h-48 bg-secondary flex items-center justify-center overflow-hidden">
          {event.featured_image ? (
            <img
              src={event.featured_image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/5">
              <span className="text-muted-foreground">Event Image</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              isLive
                ? 'bg-red-600 text-white animate-pulse'
                : isUpcoming
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              {isLive ? '🔴 LIVE' : isUpcoming ? 'UPCOMING' : 'COMPLETED'}
            </span>
            <span className="bg-secondary/80 text-foreground px-3 py-1 rounded-full text-xs font-bold uppercase">
              {event.event_type}
            </span>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {new Date(event.start_time).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="font-medium">
                {new Date(event.start_time).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {event.location && (
              <div className="text-sm">
                <span className="text-muted-foreground">📍 </span>
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              {event.subscription_required ? (
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Members Only</span>
              ) : event.ticket_price_cents ? (
                <span className="text-primary font-bold">${(event.ticket_price_cents / 100).toFixed(2)} PPV</span>
              ) : (
                <span className="text-xs text-muted-foreground">Included</span>
              )}
              <span className="text-primary font-black group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
