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
    platformName: 'Sporteo.tv',
    platformEmail: 'support@sporteo.tv',
    defaultPPVPrice: '4999',
    monthlySubPrice: '999',
    yearlySubPrice: '9999',
    maxConcurrentStreams: '4',
    allowPPV: true,
    allowSubscriptions: true,
    maintenanceMode: false,
  })

  const [stripeMode, setStripeMode] = useState<'test' | 'live'>('test')

  const [apiSettings, setApiSettings] = useState({
    // Test mode keys
    stripeTestPublishableKey: '',
    stripeTestSecretKey: '',
    stripeTestWebhookSecret: '',
    // Live mode keys
    stripeLivePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    stripeLiveSecretKey: '',
    stripeLiveWebhookSecret: '',
    // Bunny settings
    bunnyApiKey: '',
    bunnyCdnHostname: process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME || '',
  })

  const [expandedSection, setExpandedSection] = useState<'stripe' | 'bunny' | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          router.push('/auth/login')
          return
        }

        // Check if user is admin from profiles table
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
        
        // Load saved settings from localStorage
        const savedApiSettings = localStorage.getItem('apiSettings')
        if (savedApiSettings) {
          try {
            setApiSettings(JSON.parse(savedApiSettings))
          } catch (e) {
            console.error('Failed to parse saved API settings:', e)
          }
        }
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

  const handleApiSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setApiSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validate that we have Stripe keys if in a mode
      const modeKeys = stripeMode === 'test' 
        ? { pub: apiSettings.stripeTestPublishableKey, sec: apiSettings.stripeTestSecretKey }
        : { pub: apiSettings.stripeLivePublishableKey, sec: apiSettings.stripeLiveSecretKey }
      
      if (!modeKeys.pub || !modeKeys.sec) {
        setSuccess('Please fill in both Publishable and Secret keys for the selected mode')
        setSaving(false)
        setTimeout(() => setSuccess(''), 4000)
        return
      }

      // Save both platform and API settings to localStorage
      localStorage.setItem('platformSettings', JSON.stringify(settings))
      localStorage.setItem('apiSettings', JSON.stringify(apiSettings))
      localStorage.setItem('stripeMode', stripeMode)
      
      setSuccess(`Settings saved successfully! Using ${stripeMode.toUpperCase()} mode.`)
      setTimeout(() => setSuccess(''), 4000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSuccess('Error saving settings. Please try again.')
      setTimeout(() => setSuccess(''), 4000)
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
                {/* Stripe Settings */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedSection(expandedSection === 'stripe' ? null : 'stripe')}
                    className="w-full p-4 bg-secondary/50 hover:bg-secondary/70 transition-colors flex items-center justify-between"
                  >
                    <div className="text-left">
                      <p className="font-bold">Stripe Integration</p>
                      <p className="text-sm text-muted-foreground">Payment processing for PPV and subscriptions</p>
                    </div>
                    <span className="text-2xl font-bold text-muted-foreground">{expandedSection === 'stripe' ? '−' : '+'}</span>
                  </button>

                  {expandedSection === 'stripe' && (
                    <div className="p-6 space-y-6 bg-background border-t border-border">
                      {/* Mode Toggle */}
                      <div className="flex gap-4 items-center">
                        <label className="text-sm font-bold">Mode:</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setStripeMode('test')}
                            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                              stripeMode === 'test'
                                ? 'bg-orange-600/20 text-orange-600 border border-orange-600/50'
                                : 'bg-secondary border border-border hover:border-orange-600/50'
                            }`}
                          >
                            TEST MODE
                          </button>
                          <button
                            type="button"
                            onClick={() => setStripeMode('live')}
                            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                              stripeMode === 'live'
                                ? 'bg-green-600/20 text-green-600 border border-green-600/50'
                                : 'bg-secondary border border-border hover:border-green-600/50'
                            }`}
                          >
                            LIVE MODE
                          </button>
                        </div>
                      </div>

                      {/* Warning for Live Mode */}
                      {stripeMode === 'live' && (
                        <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
                          <p className="text-xs text-red-600 font-bold">⚠️ LIVE MODE WARNING</p>
                          <p className="text-xs text-red-600/80 mt-1">You are configuring LIVE Stripe keys. Real payments will be processed. Use test keys for development.</p>
                        </div>
                      )}

                      {/* Test Mode Fields */}
                      {stripeMode === 'test' && (
                        <div className="space-y-4 p-4 bg-secondary/30 border border-orange-600/20 rounded-lg">
                          <p className="text-sm font-bold text-orange-600">Test Mode Keys (Use pk_test_... and sk_test_...)</p>
                          
                          <div>
                            <label className="block text-sm font-bold mb-2">Test Publishable Key</label>
                            <input
                              type="text"
                              name="stripeTestPublishableKey"
                              value={apiSettings.stripeTestPublishableKey}
                              onChange={handleApiSettingsChange}
                              placeholder="pk_test_..."
                              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-600 font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Found in Stripe Dashboard → Developers → API Keys (with "View test data" enabled)</p>
                          </div>

                          <div>
                            <label className="block text-sm font-bold mb-2">Test Secret Key</label>
                            <input
                              type="password"
                              name="stripeTestSecretKey"
                              value={apiSettings.stripeTestSecretKey}
                              onChange={handleApiSettingsChange}
                              placeholder="sk_test_..."
                              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-600 font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Keep this secret. Used for server-side operations only.</p>
                          </div>

                          <div>
                            <label className="block text-sm font-bold mb-2">Test Webhook Secret</label>
                            <input
                              type="password"
                              name="stripeTestWebhookSecret"
                              value={apiSettings.stripeTestWebhookSecret}
                              onChange={handleApiSettingsChange}
                              placeholder="whsec_test_..."
                              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-600 font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Found in Stripe Dashboard → Webhooks after adding test endpoint</p>
                          </div>
                        </div>
                      )}

                      {/* Live Mode Fields */}
                      {stripeMode === 'live' && (
                        <div className="space-y-4 p-4 bg-secondary/30 border border-green-600/20 rounded-lg">
                          <p className="text-sm font-bold text-green-600">Live Mode Keys (Use pk_live_... and sk_live_...)</p>
                          
                          <div>
                            <label className="block text-sm font-bold mb-2">Live Publishable Key</label>
                            <input
                              type="text"
                              name="stripeLivePublishableKey"
                              value={apiSettings.stripeLivePublishableKey}
                              onChange={handleApiSettingsChange}
                              placeholder="pk_live_..."
                              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600 font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Found in Stripe Dashboard → Developers → API Keys (with "View live data" enabled)</p>
                          </div>

                          <div>
                            <label className="block text-sm font-bold mb-2">Live Secret Key</label>
                            <input
                              type="password"
                              name="stripeLiveSecretKey"
                              value={apiSettings.stripeLiveSecretKey}
                              onChange={handleApiSettingsChange}
                              placeholder="sk_live_..."
                              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600 font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Keep this secret. Used for server-side operations only.</p>
                          </div>

                          <div>
                            <label className="block text-sm font-bold mb-2">Live Webhook Secret</label>
                            <input
                              type="password"
                              name="stripeLiveWebhookSecret"
                              value={apiSettings.stripeLiveWebhookSecret}
                              onChange={handleApiSettingsChange}
                              placeholder="whsec_live_..."
                              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600 font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Found in Stripe Dashboard → Webhooks after adding live endpoint</p>
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                        <p className="text-xs text-blue-600 font-bold">Webhook Endpoint URL:</p>
                        <p className="text-xs font-mono text-blue-600/80 break-all">{typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/stripe` : 'https://yourdomain.com/api/webhooks/stripe'}</p>
                        <p className="text-xs text-blue-600/80 mt-2">Use this URL when creating webhooks in Stripe Dashboard. Add it separately for both test and live modes.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bunny.net Settings */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedSection(expandedSection === 'bunny' ? null : 'bunny')}
                    className="w-full p-4 bg-secondary/50 hover:bg-secondary/70 transition-colors flex items-center justify-between"
                  >
                    <div className="text-left">
                      <p className="font-bold">Bunny.net Integration</p>
                      <p className="text-sm text-muted-foreground">Video streaming and CDN delivery</p>
                    </div>
                    <span className="text-2xl font-bold text-muted-foreground">{expandedSection === 'bunny' ? '−' : '+'}</span>
                  </button>

                  {expandedSection === 'bunny' && (
                    <div className="p-6 space-y-4 bg-background border-t border-border">
                      <div>
                        <label className="block text-sm font-bold mb-2">Bunny.net API Key</label>
                        <input
                          type="password"
                          name="bunnyApiKey"
                          value={apiSettings.bunnyApiKey}
                          onChange={handleApiSettingsChange}
                          placeholder="Your Bunny.net API key"
                          className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Found in Bunny.net Dashboard → Account Settings → API Key</p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2">Bunny.net CDN Hostname</label>
                        <input
                          type="text"
                          name="bunnyCdnHostname"
                          value={apiSettings.bunnyCdnHostname}
                          onChange={handleApiSettingsChange}
                          placeholder="yourdomain.b-cdn.net"
                          className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Your Bunny CDN pull zone hostname for video delivery</p>
                      </div>

                      <div className="p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                        <p className="text-xs text-blue-600 font-bold">Setup Guide:</p>
                        <ol className="text-xs text-blue-600/80 list-decimal list-inside mt-2 space-y-1">
                          <li>Create a Bunny.net account and verify email</li>
                          <li>Go to Bunny Streams and create a new stream</li>
                          <li>Copy your Stream ID and RTMP key for event creation</li>
                          <li>Add your CDN pull zone in Bunny Dashboard</li>
                          <li>Save credentials here</li>
                        </ol>
                      </div>
                    </div>
                  )}
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
