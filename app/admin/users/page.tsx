'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'

interface UserDetails {
  id: string
  email: string
  display_name: string | null
  is_admin: boolean
  is_streamer: boolean
  created_at: string
  purchaseCount: number
  totalSpent: number
  subscription: any
  recentPurchases: any[]
}

export default function UsersPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
  const [userPurchases, setUserPurchases] = useState<any[]>([])

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

  const loadUserDetails = async (selectedUserData: any) => {
    try {
      const { data: purchases } = await supabase
        .from('purchases')
        .select('*, events:event_id(id, title)')
        .eq('user_id', selectedUserData.id)
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', selectedUserData.id)
        .order('last_active_at', { ascending: false })
        .limit(5)

      setUserPurchases(purchases || [])

      setSelectedUser({
        ...selectedUserData,
        recentPurchases: purchases || [],
        recentSessions: sessions || [],
      })
    } catch (error) {
      console.error('Failed to load user details:', error)
      setSelectedUser(selectedUserData)
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
    <div className="flex h-screen bg-background text-foreground">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2">USERS</h1>
            <p className="text-muted-foreground">Manage platform users</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {['all', 'subscribers', 'buyers'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>

          {/* Users Table */}
          {filteredUsers.length > 0 ? (
            <Card className="border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left px-4 sm:px-6 py-4 text-sm font-bold">User</th>
                      <th className="text-left px-4 sm:px-6 py-4 text-sm font-bold hidden md:table-cell">Role</th>
                      <th className="text-left px-4 sm:px-6 py-4 text-sm font-bold hidden md:table-cell">Status</th>
                      <th className="text-left px-4 sm:px-6 py-4 text-sm font-bold hidden md:table-cell">Purchases</th>
                      <th className="text-left px-4 sm:px-6 py-4 text-sm font-bold hidden lg:table-cell">Total Spent</th>
                      <th className="text-left px-4 sm:px-6 py-4 text-sm font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                        <td className="px-4 sm:px-6 py-4">
                          <div>
                            <p className="font-medium">{u.display_name || 'No name'}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                          <div className="flex gap-1">
                            {u.is_admin && (
                              <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded font-medium">Admin</span>
                            )}
                            {u.is_streamer && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded font-medium">Streamer</span>
                            )}
                            {!u.is_admin && !u.is_streamer && (
                              <span className="text-muted-foreground text-xs">User</span>
                            )}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                          {u.subscription ? (
                            <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded font-medium capitalize">
                              {u.subscription.plan_type || u.subscription.subscription_type || 'Active'}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Free</span>
                          )}
                        </td>
                        <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                          <p className="font-bold">{u.purchaseCount}</p>
                        </td>
                        <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                          <p className="font-bold">€{(u.totalSpent / 100).toFixed(2)}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border text-xs hover:bg-secondary"
                            onClick={() => loadUserDetails(u)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="p-12 border-border text-center">
              <p className="text-muted-foreground">No users found</p>
            </Card>
          )}

          <div className="mt-6 text-sm text-muted-foreground text-center">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </main>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Display Name</p>
                    <p className="font-medium">{selectedUser.display_name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-medium text-xs break-all">{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Roles</p>
                    <div className="flex gap-1 mt-1">
                      {selectedUser.is_admin && (
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">Admin</span>
                      )}
                      {selectedUser.is_streamer && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">Streamer</span>
                      )}
                      {!selectedUser.is_admin && !selectedUser.is_streamer && (
                        <span className="text-muted-foreground text-xs">User</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription</p>
                    <p className="font-medium">
                      {selectedUser.subscription ? (
                        <span className="text-green-500 capitalize">
                          {selectedUser.subscription.plan_type || 'Active'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              {selectedUser.subscription && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg">Subscription Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Plan</p>
                      <p className="font-medium capitalize">{selectedUser.subscription.plan_type || selectedUser.subscription.subscription_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{selectedUser.subscription.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stripe Customer ID</p>
                      <p className="font-medium text-xs break-all">{selectedUser.subscription.stripe_customer_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subscription ID</p>
                      <p className="font-medium text-xs break-all">{selectedUser.subscription.stripe_subscription_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase Summary */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg">Purchase Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Purchases</p>
                    <p className="text-2xl font-bold">{selectedUser.purchaseCount}</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">€{(selectedUser.totalSpent / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Recent Purchases */}
              {userPurchases.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg">Recent Purchases</h3>
                  <div className="space-y-2">
                    {userPurchases.map((purchase) => (
                      <div key={purchase.id} className="p-3 bg-secondary/30 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{purchase.events?.title || `Event #${purchase.event_id}`}</p>
                            <p className="text-sm text-muted-foreground">
                              {purchase.created_at ? new Date(purchase.created_at).toLocaleString() : 'Unknown date'}
                            </p>
                          </div>
                          <p className="font-bold">€{(purchase.amount_cents / 100).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Sessions */}
              {selectedUser.recentSessions && selectedUser.recentSessions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg">Recent Activity</h3>
                  <div className="space-y-2">
                    {selectedUser.recentSessions.map((session: any) => (
                      <div key={session.id} className="p-3 bg-secondary/30 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{session.device_name || 'Unknown device'}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.last_active_at ? new Date(session.last_active_at).toLocaleString() : 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">IP: {session.ip_address || 'N/A'}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded ${session.is_active ? 'bg-green-500/20 text-green-500' : 'bg-secondary text-muted-foreground'}`}>
                            {session.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
