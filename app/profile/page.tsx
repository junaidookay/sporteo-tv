'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getProfile, updateProfile } from '@/lib/db-client'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
  })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push('/auth/login')
          return
        }

        setUser(user)

        const profileData = await getProfile(supabase, user.id)
        if (profileData) {
          setProfile(profileData)
          setFormData({
            display_name: profileData.display_name || '',
            bio: profileData.bio || '',
            avatar_url: profileData.avatar_url || '',
          })
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (!user) throw new Error('User not found')

        await updateProfile(supabase, user.id, formData)
      setSuccess('Profile updated successfully')
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
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
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-black mb-8">MY PROFILE</h1>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary rounded-lg text-primary">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Info Card */}
          <Card className="lg:col-span-1 p-6 border-border h-fit">
            <h2 className="text-xl font-black mb-6">ACCOUNT INFO</h2>

            <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium break-all">{user.email}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">User ID</p>
                  <p className="font-mono text-sm break-all text-muted-foreground">{user.id}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Joined</p>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            </Card>

            {/* Edit Profile Card */}
            <Card className="lg:col-span-2 p-8 border-border">
              <h2 className="text-xl font-black mb-6">EDIT PROFILE</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="display_name" className="block text-sm font-bold mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="display_name"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="avatar_url" className="block text-sm font-bold mb-2">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    id="avatar_url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-bold mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </Card>
        </div>

        {/* Preferences Section */}
        <Card className="mt-8 p-8 border-border">
          <h2 className="text-xl font-black mb-6">PREFERENCES</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div>
                <p className="font-bold">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified about upcoming events</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div>
                <p className="font-bold">Marketing Emails</p>
                <p className="text-sm text-muted-foreground">Receive updates and promotions</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-primary" />
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
