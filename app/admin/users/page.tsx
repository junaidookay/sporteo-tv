'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function UsersPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

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
        await loadUsers()
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const loadUsers = async () => {
    try {
      const { data: profiles, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })

      if (!error && profiles) {
        // Enrich with purchase and subscription data
        const enrichedUsers = await Promise.all(
          profiles.map(async (profile) => {
            const { data: purchases } = await supabase
              .from('purchases')
              .select('*')
              .eq('user_id', profile.id)

            const { data: subscription } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', profile.id)
              .eq('status', 'active')
              .maybeSingle()

            return {
              ...profile,
              purchaseCount: purchases?.length || 0,
              totalSpent: (purchases || []).reduce((sum, p) => sum + p.amount_cents, 0),
              subscription: subscription,
            }
          })
        )

        setUsers(enrichedUsers)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const filteredUsers =
    filter === 'all'
      ? users
      : filter === 'subscribers'
      ? users.filter((u) => u.subscription)
      : filter === 'buyers'
      ? users.filter((u) => u.purchaseCount > 0)
      : users

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
            <h1 className="text-3xl sm:text-4xl font-black mb-2">USER MANAGEMENT</h1>
            <p className="text-muted-foreground">View and manage platform users</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 border-border">
              <p className="text-muted-foreground text-sm mb-1">Total Users</p>
              <p className="text-3xl font-black">{users.length}</p>
            </Card>
            <Card className="p-4 border-border">
              <p className="text-muted-foreground text-sm mb-1">Active Subscribers</p>
              <p className="text-3xl font-black">{users.filter((u) => u.subscription).length}</p>
            </Card>
            <Card className="p-4 border-border">
              <p className="text-muted-foreground text-sm mb-1">Paid Buyers</p>
              <p className="text-3xl font-black">{users.filter((u) => u.purchaseCount > 0).length}</p>
            </Card>
            <Card className="p-4 border-border">
              <p className="text-muted-foreground text-sm mb-1">Revenue</p>
              <p className="text-3xl font-black">${(users.reduce((sum, u) => sum + u.totalSpent, 0) / 100).toFixed(0)}</p>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'subscribers', 'buyers'].map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                variant={filter === f ? 'default' : 'outline'}
                className={`capitalize ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                {f === 'all' ? 'All Users' : f === 'subscribers' ? 'Subscribers' : 'Paid Buyers'}
              </Button>
            ))}
          </div>

          {/* Users Table */}
          {filteredUsers.length > 0 ? (
            <Card className="border-border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-4 sm:px-6 py-4 text-left font-black text-sm">User</th>
                    <th className="hidden sm:table-cell px-4 sm:px-6 py-4 text-left font-black text-sm">Email</th>
                    <th className="px-4 sm:px-6 py-4 text-left font-black text-sm">Status</th>
                    <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-left font-black text-sm">Purchases</th>
                    <th className="hidden lg:table-cell px-4 sm:px-6 py-4 text-left font-black text-sm">Spent</th>
                    <th className="px-4 sm:px-6 py-4 text-left font-black text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-bold">{u.display_name || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{u.email}</p>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                        <p className="text-sm break-all">{u.email}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {u.subscription && (
                            <span className="inline-block w-fit px-2 py-1 text-xs font-bold uppercase bg-blue-600/20 text-blue-600 rounded">
                              Subscriber
                            </span>
                          )}
                          {u.purchaseCount > 0 && (
                            <span className="inline-block w-fit px-2 py-1 text-xs font-bold uppercase bg-green-600/20 text-green-600 rounded">
                              Buyer
                            </span>
                          )}
                          {!u.subscription && u.purchaseCount === 0 && (
                            <span className="inline-block w-fit px-2 py-1 text-xs font-bold uppercase bg-muted text-muted-foreground rounded">
                              Free
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                        <p className="font-bold">{u.purchaseCount}</p>
                      </td>
                      <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                        <p className="font-bold">€{(u.totalSpent / 100).toFixed(2)}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <Button size="sm" variant="outline" className="border-border text-xs hover:bg-secondary">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : (
            <Card className="p-12 border-border text-center">
              <p className="text-muted-foreground">No users found</p>
            </Card>
          )}

          {/* Pagination Info */}
          <div className="mt-6 text-sm text-muted-foreground text-center">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </main>
    </div>
  )
}
