export const revalidate = 60
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getEvents } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  
  // Get featured events (upcoming with images)
  const featuredEvents = await getEvents({ 
    status: 'scheduled',
    upcoming: true 
  })
  
  // Get live events
  const { data: liveEvents } = await supabase
    .from('events')
    .select('*')
    .eq('is_publicly_live', true)
    .limit(6)
  
  // Get recent completed events for replays
  const { data: recentEvents } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'completed')
    .not('replay_video_id', 'is', null)
    .order('end_time', { ascending: false })
    .limit(6)
  
  const mainFeatured = featuredEvents?.[0]
  const secondaryFeatured = featuredEvents?.slice(1, 3) || []
  const hasLiveEvents = liveEvents && liveEvents.length > 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Live Banner */}
      {hasLiveEvents && (
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                  <span className="text-lg font-black">LIVE EVENTS</span>
                </div>
                <p className="text-primary-foreground/80 text-sm">{liveEvents.length} events streaming right now</p>
              </div>
              <Link href="/live">
                <Button className="bg-white text-primary hover:bg-white/90 font-black">
                  WATCH LIVE 
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section - Featured Events */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-secondary to-background py-20 md:py-40">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/50 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Main Featured */}
            {mainFeatured && (
              <div className="lg:col-span-2 h-full">
                <Link href={`/events/${mainFeatured.id}`}>
                  <Card className="overflow-hidden hover:border-primary transition-all cursor-pointer h-full">
                    <div className="relative h-96 lg:h-full min-h-[384px] overflow-hidden">
                      <img
                        src={mainFeatured.featured_image || '/placeholder.jpg'}
                        alt={mainFeatured.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="inline-block mb-3">
                          <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                            {mainFeatured.event_type}
                          </span>
                        </div>
                        <h2 className="text-4xl font-black mb-2 line-clamp-2 text-white">{mainFeatured.title}</h2>
                        <p className="text-white/80 line-clamp-2">{mainFeatured.description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            )}

            {/* Secondary Featured Items */}
            <div className="grid grid-rows-2 gap-4 h-full">
              {secondaryFeatured?.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer group h-full">
                    <div className="relative h-full min-h-[128px] overflow-hidden">
                      <img
                        src={event.featured_image || '/placeholder.jpg'}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <span className="inline-block bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-bold mb-1">
                          {event.event_type}
                        </span>
                        <h3 className="text-white font-bold line-clamp-1 text-sm">{event.title}</h3>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Streams Section */}
      {hasLiveEvents && (
        <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-y border-primary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                  <h2 className="text-4xl font-black">LIVE NOW</h2>
                </div>
                <p className="text-muted-foreground">Watch premium events streaming live right now</p>
              </div>
              <Link href="/live">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                  View All Live Events
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveEvents.slice(0, 3).map((event) => (
                <Link key={event.id} href={`/watch/${event.id}`}>
                  <Card className="overflow-hidden hover:border-primary transition-all cursor-pointer group relative">
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      <span className="text-sm font-bold">LIVE</span>
                    </div>
                    <div className="relative h-64 overflow-hidden bg-secondary">
                      <img
                        src={event.featured_image || '/placeholder.jpg'}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <span className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold mb-3">
                        {event.event_type}
                      </span>
                      <h3 className="text-xl font-black mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Events / Replays */}
      {recentEvents && recentEvents.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-black mb-2">RECENT REPLAYS</h2>
                <p className="text-muted-foreground">Watch the best moments again</p>
              </div>
              <Link href="/replays">
                <Button variant="outline" className="border-border hover:bg-secondary">
                  View All Replays
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentEvents.slice(0, 6).map((event) => (
                <Link key={event.id} href={`/watch/${event.id}`}>
                  <Card className="overflow-hidden hover:border-primary transition-all cursor-pointer group">
                    <div className="relative h-48 overflow-hidden bg-secondary">
                      <img
                        src={event.featured_image || '/placeholder.jpg'}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm text-foreground px-3 py-1.5 rounded-lg text-sm font-bold">
                        REPLAY
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-muted-foreground">{event.event_type}</span>
                      <h3 className="font-bold line-clamp-2 group-hover:text-primary transition-colors">{event.title}</h3>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black mb-2">UPCOMING EVENTS</h2>
              <p className="text-muted-foreground">Don't miss these exciting events</p>
            </div>
            <Link href="/events">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Browse All Events
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEvents?.slice(3, 7).map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="overflow-hidden hover:border-primary transition-all cursor-pointer group">
                  <div className="relative h-48 overflow-hidden bg-secondary">
                    <img
                      src={event.featured_image || '/placeholder.jpg'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.start_time).toLocaleDateString()}
                    </span>
                    <h3 className="font-bold line-clamp-2 group-hover:text-primary transition-colors">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.ticket_price_cents 
                        ? `$${(event.ticket_price_cents / 100).toFixed(2)}`
                        : 'Subscription Required'
                      }
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-black mb-4">Never Miss a Moment</h2>
          <p className="text-xl mb-8 text-primary-foreground/80 max-w-2xl mx-auto">
            Subscribe today and get access to all live events plus exclusive replays
          </p>
          <Link href="/subscriptions">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6">
              VIEW SUBSCRIPTION PLANS
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
