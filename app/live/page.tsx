import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { LiveStreamCard } from '@/components/live-stream-card'
import { getEvents, getUserSubscription, getPurchase } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function LivePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let hasSubscription = false
  let activePurchase = null
  
  if (user) {
    const subscription = await getUserSubscription(user.id)
    hasSubscription = !!subscription
  }

  const liveEvents = await getEvents({ status: 'live', upcoming: false })
  const publiclyLiveEvents = liveEvents.filter((e) => e.is_publicly_live === true)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-4">🔴 LIVE NOW</h1>
          <p className="text-xl text-muted-foreground">
            Watch live sports streaming events
          </p>
        </div>

        {publiclyLiveEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publiclyLiveEvents.map((event) => (
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
  )
}