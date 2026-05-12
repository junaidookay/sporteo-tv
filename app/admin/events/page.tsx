'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getEvents, createEvent, updateEvent } from '@/lib/db-client'

export default function AdminEventsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'boxing' as 'boxing' | 'mma' | 'k1',
    start_time: '',
    location: '',
    ticket_price_cents: '',
    subscription_required: false,
    featured_image: '',
  })

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
        await loadEvents()
      } catch (error) {
        console.error('Failed to load events:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const loadEvents = async () => {
    try {
        const eventsData = await getEvents(supabase)
      setEvents(eventsData.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()))
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? !prev[name as keyof typeof formData] : value,
    }))
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('File must be an image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setSaving(true)
    try {
      const fileName = `thumbnails/${Date.now()}-${file.name}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('Failed to upload image')
        return
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      
      setFormData((prev) => ({
        ...prev,
        featured_image: data.publicUrl,
      }))
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!user) throw new Error('User not authenticated')

      const eventData = {
        ...formData,
        ticket_price_cents: formData.ticket_price_cents ? parseInt(formData.ticket_price_cents) : null,
        created_by: user.id,
        status: editingEvent?.status || 'scheduled',
      }

      if (editingEvent) {
        await updateEvent(supabase, editingEvent.id, eventData)
      } else {
        await createEvent(supabase, eventData as any)
      }

      await loadEvents()
      setShowCreateForm(false)
      setEditingEvent(null)
      setFormData({
        title: '',
        description: '',
        event_type: 'boxing',
        start_time: '',
        location: '',
        ticket_price_cents: '',
        subscription_required: false,
        featured_image: '',
      })
    } catch (error) {
      console.error('Failed to save event:', error)
      alert('Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await supabase.from('events').delete().eq('id', eventId)
      await loadEvents()
    } catch (error) {
      console.error('Failed to delete event:', error)
      alert('Failed to delete event')
    }
  }

  const handleEdit = (event: any) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_time: event.start_time ? event.start_time.slice(0, 16) : '',
      location: event.location || '',
      ticket_price_cents: event.ticket_price_cents ? (event.ticket_price_cents / 100).toString() : '',
      subscription_required: event.subscription_required,
      featured_image: event.featured_image || '',
    })
    setShowCreateForm(true)
  }

  const filteredEvents = filter === 'all' ? events : events.filter((e) => e.status === filter)

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black mb-2">EVENTS</h1>
              <p className="text-muted-foreground">Manage all streaming events</p>
            </div>
            {!showCreateForm && (
              <Button
                onClick={() => {
                  setEditingEvent(null)
                  setFormData({
                    title: '',
                    description: '',
                    event_type: 'boxing',
                    start_time: '',
                    location: '',
                    ticket_price_cents: '',
                    subscription_required: false,
                    featured_image: '',
                  })
                  setShowCreateForm(true)
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
              >
                + Create Event
              </Button>
            )}
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <Card className="p-6 border-border mb-8">
              <h2 className="text-2xl font-black mb-6">{editingEvent ? 'EDIT EVENT' : 'CREATE NEW EVENT'}</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2">Event Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Anthony Joshua vs Fury"
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Event Type *</label>
                    <select
                      name="event_type"
                      value={formData.event_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="boxing">Boxing</option>
                      <option value="mma">MMA</option>
                      <option value="k1">K-1 Kickboxing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Madison Square Garden, New York"
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">PPV Price (€)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">€</span>
                      <input
                        type="number"
                        step="0.01"
                        name="ticket_price_cents"
                        value={formData.ticket_price_cents}
                        onChange={handleInputChange}
                        placeholder="49.99"
                        className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Featured Image</label>
                    <div className="space-y-3">
                      {formData.featured_image && (
                        <div className="w-full aspect-video rounded-lg overflow-hidden border border-border bg-secondary flex items-center justify-center">
                          <img
                            src={formData.featured_image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center px-4 py-2 bg-secondary border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors text-center">
                          <span className="font-bold text-sm">{saving ? 'Uploading...' : 'Upload Image'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailUpload}
                            disabled={saving}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        JPG, PNG, WebP up to 5MB. Or paste URL below.
                      </div>
                      <input
                        type="url"
                        name="featured_image"
                        value={formData.featured_image}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Event details and description..."
                      rows={4}
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="subscription_required"
                        checked={formData.subscription_required}
                        onChange={handleInputChange}
                        className="w-5 h-5 accent-primary cursor-pointer"
                      />
                      <span className="font-bold">Subscription Required (instead of PPV)</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingEvent(null)
                    }}
                    variant="outline"
                    className="flex-1 border-border hover:bg-secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'scheduled', 'live', 'completed'].map((status) => (
              <Button
                key={status}
                onClick={() => setFilter(status)}
                variant={filter === status ? 'default' : 'outline'}
                className={`capitalize text-sm ${
                  filter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                {status === 'all' ? 'All Events' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          {/* Events Table */}
          {filteredEvents.length > 0 ? (
            <Card className="border-border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">Event</th>
                    <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-left font-bold text-sm">Date</th>
                    <th className="hidden sm:table-cell px-4 sm:px-6 py-4 text-left font-bold text-sm">Type</th>
                    <th className="px-4 sm:px-6 py-4 text-left font-bold text-sm">Status</th>
                    <th className="hidden lg:table-cell px-4 sm:px-6 py-4 text-left font-bold text-sm">Price</th>
                    <th className="px-4 sm:px-6 py-4 text-right font-bold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-bold text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">{event.description}</p>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-sm">
                        {new Date(event.start_time).toLocaleDateString()}
                      </td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                        <span className="text-xs font-bold uppercase text-muted-foreground">{event.event_type}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            event.status === 'live'
                              ? 'bg-red-600/20 text-red-600'
                              : event.status === 'scheduled'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 sm:px-6 py-4 text-sm">
                        {event.ticket_price_cents ? `$${(event.ticket_price_cents / 100).toFixed(2)}` : 'Subscription'}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(event)}
                            variant="outline"
                            className="border-border hover:bg-secondary text-xs sm:text-sm"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete(event.id)}
                            className="border-destructive text-destructive bg-destructive/10 hover:bg-destructive/20 text-xs sm:text-sm"
                            variant="outline"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : (
            <Card className="p-12 border-border text-center">
              <p className="text-muted-foreground">
                {filter === 'all' ? 'No events yet' : `No ${filter} events`}
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
