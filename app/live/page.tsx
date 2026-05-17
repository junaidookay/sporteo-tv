import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { LiveStreamCard } from '@/components/live-stream-card'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ForceLogoutProvider from '@/components/force-logout-provider'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function LivePage() {
  let liveEvents: any[] = []
  let error: string | null = null

  try {
    const supabase = await createClient()

    const { data, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'live')
      .eq('is_publicly_live', true)
      .order('start_time', { ascending: false })

    if (fetchError) {
      console.error('[live page] Error fetching live events:', fetchError)
      error = 'Failed to load live events'
    } else {
      liveEvents = data || []
    }
  } catch (err) {
    console.error('[live page] Unexpected error:', err)
    error = 'Failed to load live events'
  }

  return (
    <ForceLogoutProvider>
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-4">🔴 LIVE NOW</h1>
          <p className="text-xl text-muted-foreground">
            Watch live sports streaming events
          </p>
        </div>

        {error ? (
          <Card className="p-12 border-border text-center">
            <p className="text-2xl font-black mb-4 text-destructive">Error Loading Events</p>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Link href="/events">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Browse Upcoming Events
              </Button>
            </Link>
          </Card>
        ) : liveEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveEvents.map((event) => (
              <LiveStreamCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <Card className="p-12 border-border text-center">
            <p className="text-2xl font-black mb-4">No Live Events</p>
            <p className="text-muted-foreground mb-8">
              There are no live events right now. Check back soon!
            </p>
            <Link href="/events">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Browse Upcoming Events
              </Button>
            </Link>
          </Card>
        )}
      </main>
    </div>
    </ForceLogoutProvider>
  )
}