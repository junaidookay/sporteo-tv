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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Use getSession() instead of getUser() for more reliable client-side auth check
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session?.user) {
          // Try getUser() as fallback
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          if (userError || !user) {
            router.push('/auth/login')
            return
          }
          setUser(user)
        } else {
          setUser(session.user)
        }

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setUploadingAvatar(true)

      // Create preview
      const preview = URL.createObjectURL(file)
      setAvatarPreview(preview)

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-avatar.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      setFormData((prev) => ({
        ...prev,
        avatar_url: data.publicUrl,
      }))
    } catch (err) {
      console.error('Failed to upload avatar:', err)
      setError('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
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

  const getDeviceId = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('device_id')
  }

  const handleLogout = async () => {
    const deviceId = getDeviceId()

    if (deviceId) {
      await fetch('/api/user-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logout',
          device_id: deviceId
        })
      })
    }

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
                  <p className="text-sm text-muted-foreground mb-1">Username</p>
                  <p className="font-medium">{profile?.display_name || 'Not set'}</p>
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
                  <label htmlFor="avatar" className="block text-sm font-bold mb-2">
                    Avatar
                  </label>
                  <div className="space-y-3">
                    {(avatarPreview || formData.avatar_url) && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-secondary border border-border">
                        <img
                          src={avatarPreview || formData.avatar_url}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      id="avatar"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
                    />
                    {uploadingAvatar && <p className="text-sm text-muted-foreground">Uploading...</p>}
                  </div>
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
