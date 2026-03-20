import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getEvents } from '@/lib/db'

export const revalidate = 3600

export default async function ReplaysPage() {
  let completedEvents = []
  let error = null

  try {
    const allEvents = await getEvents({ status: 'completed' })
    completedEvents = allEvents.sort(
      (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    )
  } catch (err) {
    console.error('Failed to load replays:', err)
    error = 'Failed to load replays'
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-4">REPLAYS</h1>
          <p className="text-xl text-muted-foreground">
            Watch past events on demand, anytime
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
            {error}
          </div>
        )}

        {completedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
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

                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-secondary/80 text-foreground px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {event.event_type}
                      </span>
                      <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-bold uppercase">
                        REPLAY
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
                      </div>

                      {event.location && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">📍 </span>
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        {event.subscription_required ? (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                            Members Only
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Included</span>
                        )}
                        <span className="text-primary font-black group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground mb-6">No replays available yet</p>
            <Link href="/events">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Check Upcoming Events
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
