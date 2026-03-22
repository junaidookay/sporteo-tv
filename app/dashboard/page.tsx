'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getProfile, getUserSubscription, getEvents, getPurchase } from '@/lib/db'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [purchases, setPurchases] = useState<any[]>([])
  const [purchasedEvents, setPurchasedEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'history' | 'subscription' | 'settings'>('overview')

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push('/auth/login')
          return
        }

        setUser(user)

        // Load profile
        const profileData = await getProfile(user.id)
        setProfile(profileData)

        // Load subscription
        const subData = await getUserSubscription(user.id)
        setSubscription(subData)

        // Load purchases
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', user.id)
          .order('purchase_date', { ascending: false })

        if (!purchaseError && purchaseData) {
          setPurchases(purchaseData)

          // Load purchased event details
          if (purchaseData.length > 0) {
            const eventIds = purchaseData.map((p) => p.event_id)
            const { data: eventData, error: eventError } = await supabase
              .from('events')
              .select('*')
              .in('id', eventIds)

            if (!eventError && eventData) {
              const eventsMap = new Map(eventData.map((e) => [e.id, e]))
              const combined = purchaseData.map((p) => ({
                ...p,
                event: eventsMap.get(p.event_id),
              }))
              setPurchasedEvents(combined)
            }
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleCancelSubscription = async () => {
    if (!subscription || !confirm('Are you sure you want to cancel your subscription?')) return

    try {
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscription.id)

      setSubscription({ ...subscription, status: 'cancelled' })
    } catch (err) {
      console.error('Failed to cancel subscription:', err)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-black mb-2">MY DASHBOARD</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.display_name || user.email}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-0">
          {(['overview', 'events', 'history', 'subscription', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-bold uppercase text-sm transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Subscription Status */}
            <Card className="p-6 border-border lg:col-span-1">
              <h3 className="text-lg font-black mb-4">SUBSCRIPTION STATUS</h3>
              {subscription && subscription.status === 'active' ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-bold capitalize">{subscription.plan_type} Plan</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Renews On</p>
                    <p className="font-bold">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-bold">${(subscription.price_cents / 100).toFixed(2)}/month</p>
                  </div>
                  <Button
                    onClick={handleCancelSubscription}
                    variant="outline"
                    className="w-full border-destructive text-destructive hover:bg-destructive/10 mt-4"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground">No active subscription</p>
                  <Link href="/subscriptions">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Subscribe Now
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 border-border">
              <h3 className="text-lg font-black mb-4">QUICK STATS</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Purchased Events</p>
                  <p className="text-3xl font-black">{purchases.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-3xl font-black">
                    ${(purchases.reduce((sum, p) => sum + p.amount_cents, 0) / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Account Info */}
            <Card className="p-6 border-border">
              <h3 className="text-lg font-black mb-4">ACCOUNT INFO</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Email</p>
                  <p className="font-medium break-all">{user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Joined</p>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* MY EVENTS TAB */}
        {activeTab === 'events' && (
          <div>
            {purchasedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedEvents.map((purchase) => (
                  <Card key={purchase.id} className="border-border overflow-hidden hover:shadow-lg transition-shadow">
                    {purchase.event?.featured_image && (
                      <div className="aspect-video bg-secondary overflow-hidden">
                        <img
                          src={purchase.event.featured_image}
                          alt={purchase.event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 text-xs font-bold uppercase bg-primary/20 text-primary rounded">
                          {purchase.event?.event_type}
                        </span>
                      </div>
                      <h3 className="font-black mb-2">{purchase.event?.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {new Date(purchase.event?.start_time).toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/watch/${purchase.event_id}`} className="flex-1">
                          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            Watch Now
                          </Button>
                        </Link>
                        <Link href={`/events/${purchase.event_id}`} className="flex-1">
                          <Button variant="outline" className="w-full border-border hover:bg-secondary">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 border-border text-center">
                <p className="text-muted-foreground mb-4">You haven't purchased any events yet</p>
                <Link href="/events">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Browse Events
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        )}

        {/* PURCHASE HISTORY TAB */}
        {activeTab === 'history' && (
          <div>
            {purchases.length > 0 ? (
              <Card className="border-border overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-4 text-left font-black">Event</th>
                      <th className="px-6 py-4 text-left font-black">Date</th>
                      <th className="px-6 py-4 text-left font-black">Amount</th>
                      <th className="px-6 py-4 text-left font-black">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => {
                      const event = purchasedEvents.find((pe) => pe.id === purchase.id)?.event
                      return (
                        <tr key={purchase.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                          <td className="px-6 py-4 font-medium">{event?.title || 'Unknown Event'}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(purchase.purchase_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-bold">
                            ${(purchase.amount_cents / 100).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                purchase.status === 'completed'
                                  ? 'bg-green-600/20 text-green-600'
                                  : purchase.status === 'failed'
                                  ? 'bg-red-600/20 text-red-600'
                                  : 'bg-yellow-600/20 text-yellow-600'
                              }`}
                            >
                              {purchase.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </Card>
            ) : (
              <Card className="p-12 border-border text-center">
                <p className="text-muted-foreground">No purchase history</p>
              </Card>
            )}
          </div>
        )}

        {/* SUBSCRIPTION TAB */}
        {activeTab === 'subscription' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Plan */}
            <Card className="p-6 border-border lg:col-span-2">
              <h3 className="text-xl font-black mb-6">SUBSCRIPTION MANAGEMENT</h3>
              {subscription && subscription.status === 'active' ? (
                <div className="space-y-6">
                  <div className="p-4 bg-primary/10 border border-primary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                    <p className="text-2xl font-black capitalize">{subscription.plan_type} Plan</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Price</p>
                      <p className="text-xl font-bold">${(subscription.price_cents / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Billing Cycle</p>
                      <p className="text-xl font-bold capitalize">{subscription.plan_type}ly</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Next Renewal Date</p>
                    <p className="font-bold">
                      {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-4">
                      Your subscription gives you access to all live and replay events
                    </p>
                    <Button
                      onClick={handleCancelSubscription}
                      className="w-full border-destructive text-destructive bg-destructive/10 hover:bg-destructive/20"
                      variant="outline"
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">You don't have an active subscription</p>
                  <p className="text-sm">
                    Subscribe to get unlimited access to all events, live streaming, and replays.
                  </p>
                  <Link href="/subscriptions">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      View Subscription Plans
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Benefits */}
            <Card className="p-6 border-border">
              <h3 className="text-lg font-black mb-4">BENEFITS</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Access to all live events</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Watch event replays anytime</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>HD & 4K streaming</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Multi-device support</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
            </Card>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 border-border lg:col-span-2">
              <h3 className="text-xl font-black mb-6">PROFILE SETTINGS</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  // Handle profile update
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold mb-2">Display Name</label>
                  <input
                    type="text"
                    defaultValue={profile?.display_name || ''}
                    placeholder="Your display name"
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Bio</label>
                  <textarea
                    defaultValue={profile?.bio || ''}
                    placeholder="Tell us about yourself"
                    rows={4}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Avatar URL</label>
                  <input
                    type="url"
                    defaultValue={profile?.avatar_url || ''}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Save Changes
                </Button>
              </form>
            </Card>

            <Card className="p-6 border-border">
              <h3 className="text-lg font-black mb-4">ACCOUNT</h3>
              <div className="space-y-3 text-sm mb-6">
                <div>
                  <p className="text-muted-foreground mb-1">Email</p>
                  <p className="font-medium break-all">{user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">User ID</p>
                  <p className="font-mono text-xs text-muted-foreground break-all">{user.id}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                className="w-full border-destructive text-destructive bg-destructive/10 hover:bg-destructive/20"
                variant="outline"
              >
                Logout
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
