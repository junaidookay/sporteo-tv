'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getAllPurchases, getAllSubscriptions } from '@/lib/db-client'

export default function AdminTransactionsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'purchases' | 'subscriptions'>('all')
  const [totalRevenue, setTotalRevenue] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          router.push('/auth/login')
          return
        }

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
        await loadData()
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const loadData = async () => {
    try {
      const [purchasesData, subscriptionsData] = await Promise.all([
        getAllPurchases(supabase),
        getAllSubscriptions(supabase)
      ])

      setPurchases(purchasesData || [])
      setSubscriptions(subscriptionsData || [])

      const purchaseRevenue = (purchasesData || []).reduce((sum, p) => sum + (p.amount_cents || 0), 0)
      const subscriptionRevenue = (subscriptionsData || [])
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + (s.price_cents || 0), 0)

      setTotalRevenue(purchaseRevenue + subscriptionRevenue)
    } catch (error) {
      console.error('Failed to load transactions:', error)
    }
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

  const filteredPurchases = filter === 'all' || filter === 'purchases' ? purchases : []
  const filteredSubscriptions = filter === 'all' || filter === 'subscriptions' ? subscriptions : []

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-black mb-2">TRANSACTIONS</h1>
            <p className="text-muted-foreground">Track all platform transactions</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 border-border">
              <p className="text-muted-foreground text-sm mb-2">Total Revenue</p>
              <p className="text-3xl font-black">{formatCurrency(totalRevenue)}</p>
            </Card>
            <Card className="p-6 border-border">
              <p className="text-muted-foreground text-sm mb-2">Total Purchases</p>
              <p className="text-3xl font-black">{purchases.length}</p>
            </Card>
            <Card className="p-6 border-border">
              <p className="text-muted-foreground text-sm mb-2">Active Subscriptions</p>
              <p className="text-3xl font-black">
                {subscriptions.filter(s => s.status === 'active').length}
              </p>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {['all', 'purchases', 'subscriptions'].map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f as any)}
                variant={filter === f ? 'default' : 'outline'}
                className={`capitalize ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                {f}
              </Button>
            ))}
          </div>

          {/* Purchases Table */}
          {(filter === 'all' || filter === 'purchases') && filteredPurchases.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-black mb-4">PURCHASES</h2>
              <Card className="border-border overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">Date</th>
                      <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">User</th>
                      <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">Event</th>
                      <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">Amount</th>
                      <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPurchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-secondary/50">
                        <td className="px-4 sm:px-6 py-4 text-sm">
                          {formatDate(purchase.purchase_date)}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <p className="font-medium text-sm">{purchase.profiles?.display_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{purchase.profiles?.email}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <p className="font-medium text-sm">{purchase.events?.title || 'Unknown Event'}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4 font-bold">
                          {formatCurrency(purchase.amount_cents)}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                            purchase.status === 'completed'
                              ? 'bg-green-600/20 text-green-600'
                              : purchase.status === 'refunded'
                              ? 'bg-red-600/20 text-red-600'
                              : 'bg-yellow-600/20 text-yellow-600'
                          }`}>
                            {purchase.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* Subscriptions Table */}
          {(filter === 'all' || filter === 'subscriptions') && filteredSubscriptions.length > 0 && (
            <div>
              <h2 className="text-2xl font-black mb-4">SUBSCRIPTIONS</h2>
              <Card className="border-border overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">User</th>
                      <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">Plan</th>
                      <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">Price</th>
                      <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">Status</th>
                      <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">Start Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSubscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-secondary/50">
                        <td className="px-4 sm:px-6 py-4">
                          <p className="font-medium text-sm">{sub.profiles?.display_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{sub.profiles?.email}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className="font-bold capitalize">{sub.plan_type}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 font-bold">
                          {formatCurrency(sub.price_cents)}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                            sub.status === 'active'
                              ? 'bg-green-600/20 text-green-600'
                              : sub.status === 'cancelled'
                              ? 'bg-red-600/20 text-red-600'
                              : 'bg-yellow-600/20 text-yellow-600'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm">
                          {formatDate(sub.current_period_start)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {filteredPurchases.length === 0 && filteredSubscriptions.length === 0 && (
            <Card className="p-12 border-border text-center">
              <p className="text-muted-foreground">No transactions found</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
