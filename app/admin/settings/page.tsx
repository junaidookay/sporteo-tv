'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  const [settings, setSettings] = useState({
    platformName: 'Prime Fight',
    platformEmail: 'support@primefight.com',
    defaultPPVPrice: '4999',
    monthlySubPrice: '999',
    yearlySubPrice: '9999',
    maxConcurrentStreams: '4',
    allowPPV: true,
    allowSubscriptions: true,
    maintenanceMode: false,
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          router.push('/auth/login')
          return
        }

        const isAdmin = user.user_metadata?.is_admin === true
        if (!isAdmin) {
          router.push('/')
          return
        }

        setUser(user)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? !prev[name as keyof typeof settings] : value,
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // In a real app, you'd save these settings to a database table
      localStorage.setItem('platformSettings', JSON.stringify(settings))
      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
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
            <h1 className="text-3xl sm:text-4xl font-black mb-2">PLATFORM SETTINGS</h1>
            <p className="text-muted-foreground">Configure your platform preferences and options</p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-600/10 border border-green-600 rounded-lg text-green-600 font-bold">
              {success}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            {/* General Settings */}
            <Card className="p-6 border-border">
              <h2 className="text-2xl font-black mb-6">GENERAL</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Platform Name</label>
                  <input
                    type="text"
                    name="platformName"
                    value={settings.platformName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Platform Email</label>
                  <input
                    type="email"
                    name="platformEmail"
                    value={settings.platformEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </Card>

            {/* Pricing Settings */}
            <Card className="p-6 border-border">
              <h2 className="text-2xl font-black mb-6">PRICING</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Default PPV Price (cents)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">$</span>
                    <input
                      type="number"
                      name="defaultPPVPrice"
                      value={settings.defaultPPVPrice}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-muted-foreground">.00</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: ${(parseInt(settings.defaultPPVPrice) / 100).toFixed(2)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Monthly Sub Price (cents)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">$</span>
                      <input
                        type="number"
                        name="monthlySubPrice"
                        value={settings.monthlySubPrice}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-muted-foreground">.00</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${(parseInt(settings.monthlySubPrice) / 100).toFixed(2)}/mo
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Annual Sub Price (cents)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">$</span>
                      <input
                        type="number"
                        name="yearlySubPrice"
                        value={settings.yearlySubPrice}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-muted-foreground">.00</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${(parseInt(settings.yearlySubPrice) / 100).toFixed(2)}/yr
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Streaming Settings */}
            <Card className="p-6 border-border">
              <h2 className="text-2xl font-black mb-6">STREAMING</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Max Concurrent Streams Per User</label>
                  <input
                    type="number"
                    name="maxConcurrentStreams"
                    value={settings.maxConcurrentStreams}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Number of devices a user can stream on simultaneously</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="allowPPV"
                      checked={settings.allowPPV}
                      onChange={handleChange}
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                    <span className="font-bold">Allow Pay-Per-View</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="allowSubscriptions"
                      checked={settings.allowSubscriptions}
                      onChange={handleChange}
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                    <span className="font-bold">Allow Subscriptions</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* System Settings */}
            <Card className="p-6 border-border">
              <h2 className="text-2xl font-black mb-6">SYSTEM</h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                  <div>
                    <p className="font-bold">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">When enabled, only admins can access the platform</p>
                  </div>
                </label>

                {settings.maintenanceMode && (
                  <div className="p-4 bg-yellow-600/10 border border-yellow-600/50 rounded-lg">
                    <p className="text-sm text-yellow-600 font-bold">Maintenance mode is currently active</p>
                  </div>
                )}
              </div>
            </Card>

            {/* API Settings */}
            <Card className="p-6 border-border">
              <h2 className="text-2xl font-black mb-6">INTEGRATIONS</h2>

              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 border border-border rounded-lg">
                  <p className="font-bold mb-2">Stripe Integration</p>
                  <p className="text-sm text-muted-foreground mb-3">Connected and active</p>
                  <Button variant="outline" className="border-border hover:bg-secondary" size="sm">
                    Manage Stripe Settings
                  </Button>
                </div>

                <div className="p-4 bg-secondary/50 border border-border rounded-lg">
                  <p className="font-bold mb-2">Bunny.net Integration</p>
                  <p className="text-sm text-muted-foreground mb-3">Stream and video hosting configured</p>
                  <Button variant="outline" className="border-border hover:bg-secondary" size="sm">
                    Manage Bunny.net Settings
                  </Button>
                </div>

                <div className="p-4 bg-secondary/50 border border-border rounded-lg">
                  <p className="font-bold mb-2">Supabase Integration</p>
                  <p className="text-sm text-muted-foreground mb-3">Database and authentication configured</p>
                  <Button variant="outline" className="border-border hover:bg-secondary" size="sm">
                    Manage Supabase Settings
                  </Button>
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button type="button" variant="outline" className="flex-1 border-border hover:bg-secondary">
                Reset to Defaults
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
