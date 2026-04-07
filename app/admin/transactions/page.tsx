'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function TransactionsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'failed' | 'refunded'>('all')
  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'subscription'>('all')

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
        await loadTransactions()
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const loadTransactions = async () => {
    try {
      // Load purchases (PPV transactions)
      const { data: purchases, error: purchaseError } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false })

      // Load subscriptions
      const { data: subscriptions, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })

      if (!purchaseError && purchases) {
        const purchaseTransactions = (purchases || []).map((p) => ({
          ...p,
          type: 'purchase',
          date: p.created_at,
          amount: p.amount_cents,
          reference: p.stripe_payment_intent_id,
        }))

        const subscriptionTransactions = (subscriptions || []).map((s) => ({
          ...s,
          type: 'subscription',
          date: s.created_at,
          amount: s.subscription_type === 'annual' ? 9999 : 999, // $99.99 or $9.99
          reference: s.stripe_subscription_id,
        }))

        const allTransactions = [...purchaseTransactions, ...subscriptionTransactions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        setTransactions(allTransactions)
      }
    } catch (error) {
      console.error('Failed to load transactions:', error)
    }
  }

  const filteredTransactions = transactions.filter((t) => {
    const statusMatch = filterStatus === 'all' || t.status === filterStatus
    const typeMatch = filterType === 'all' || t.type === filterType
    return statusMatch && typeMatch
  })

  const stats = {
    totalRevenue: filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    completedCount: filteredTransactions.filter((t) => t.status === 'completed').length,
    failedCount: filteredTransactions.filter((t) => t.status === 'failed').length,
    refundedCount: filteredTransactions.filter((t) => t.status === 'refunded').length,
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

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-black mb-2">PAYMENT TRANSACTIONS</h1>
            <p className="text-muted-foreground">View and manage all payment transactions</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 border-border">
              <p className="text-muted-foreground text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-black">${(stats.totalRevenue / 100).toFixed(2)}</p>
            </Card>
            <Card className="p-4 border-border">
              <p className="text-muted-foreground text-sm mb-1">Completed</p>
              <p className="text-3xl font-black text-green-600">{stats.completedCount}</p>
            </Card>
            <Card className="p-4 border-border">
              <p className="text-muted-foreground text-sm mb-1">Failed</p>
              <p className="text-3xl font-black text-red-600">{stats.failedCount}</p>
            </Card>
            <Card className="p-4 border-border">
              <p className="text-muted-foreground text-sm mb-1">Refunded</p>
              <p className="text-3xl font-black text-yellow-600">{stats.refundedCount}</p>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            <div>
              <p className="text-sm font-bold mb-2">Status:</p>
              <div className="flex flex-wrap gap-2">
                {['all', 'completed', 'failed', 'refunded'].map((status) => (
                  <Button
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    className={`text-xs capitalize ${
                      filterStatus === status
                        ? 'bg-primary text-primary-foreground'
                        : 'border-border hover:bg-secondary'
                    }`}
                  >
                    {status === 'all' ? 'All' : status}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold mb-2">Type:</p>
              <div className="flex flex-wrap gap-2">
                {['all', 'purchase', 'subscription'].map((type) => (
                  <Button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    variant={filterType === type ? 'default' : 'outline'}
                    className={`text-xs capitalize ${
                      filterType === type
                        ? 'bg-primary text-primary-foreground'
                        : 'border-border hover:bg-secondary'
                    }`}
                  >
                    {type === 'all' ? 'All' : type}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          {filteredTransactions.length > 0 ? (
            <Card className="border-border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">Date</th>
                    <th className="hidden sm:table-cell px-4 sm:px-6 py-4 text-left font-bold text-sm">User ID</th>
                    <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">Type</th>
                    <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-left font-bold text-sm">Reference</th>
                    <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">Amount</th>
                    <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.map((transaction, idx) => (
                    <tr key={idx} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium">
                        {new Date(transaction.date).toLocaleDateString()}
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                        <p className="text-xs font-mono text-muted-foreground break-all">{transaction.user_id?.slice(0, 8)}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            transaction.type === 'subscription'
                              ? 'bg-blue-600/20 text-blue-600'
                              : 'bg-primary/20 text-primary'
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                        <p className="text-xs font-mono text-muted-foreground break-all">
                          {transaction.reference || 'N/A'}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 font-bold">${(transaction.amount / 100).toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            transaction.status === 'completed'
                              ? 'bg-green-600/20 text-green-600'
                              : transaction.status === 'failed'
                              ? 'bg-red-600/20 text-red-600'
                              : transaction.status === 'refunded'
                              ? 'bg-yellow-600/20 text-yellow-600'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : (
            <Card className="p-12 border-border text-center">
              <p className="text-muted-foreground">No transactions found</p>
            </Card>
          )}

          {/* Pagination Info */}
          <div className="mt-6 text-sm text-muted-foreground text-center">
            Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </main>
    </div>
  )
}
