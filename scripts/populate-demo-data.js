#!/usr/bin/env node

/**
 * Demo Data Population Script
 * 
 * This script populates the Supabase database with sample events for testing.
 * 
 * Usage: 
 * 1. Set up your environment variables in .env.local
 * 2. Run: node scripts/populate-demo-data.js
 */

const fetch = require('node-fetch')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const DEMO_EVENTS = [
  {
    title: 'Canelo vs GGG III - Championship Rematch',
    description: 'The trilogy fight between two boxing legends for the undisputed title',
    event_type: 'BOXING',
    featured_image: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=800&h=500&fit=crop',
    start_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price_cents: 7999,
    subscription_required: false,
    location: 'Madison Square Garden, NYC',
    status: 'upcoming',
  },
  {
    title: 'Adesanya vs Dricus II - UFC Middleweight Title',
    description: 'Epic rematch at the apex of UFC competition',
    event_type: 'MMA',
    featured_image: 'https://images.unsplash.com/photo-1518611505868-d2b4f0ff69d5?w=800&h=500&fit=crop',
    start_time: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price_cents: 6999,
    subscription_required: false,
    location: 'Las Vegas, NV',
    status: 'upcoming',
  },
  {
    title: 'Tenshin Nasukawa vs Top Bantamweight',
    description: 'High-flying K-1 action with technical mastery',
    event_type: 'K-1',
    featured_image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=500&fit=crop',
    start_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price_cents: 4999,
    subscription_required: false,
    location: 'Tokyo, Japan',
    status: 'upcoming',
  },
  {
    title: 'Terence Crawford - Welterweight Champion',
    description: 'The pound-for-pound best defends his crown',
    event_type: 'BOXING',
    featured_image: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=800&h=500&fit=crop',
    start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price_cents: 5499,
    subscription_required: false,
    location: 'Omaha, Nebraska',
    status: 'upcoming',
  },
  {
    title: 'Ryan Garcia Comeback Fight',
    description: 'The young superstar returns to the ring',
    event_type: 'BOXING',
    featured_image: 'https://images.unsplash.com/photo-1549719386-74dfaf00b721?w=800&h=500&fit=crop',
    start_time: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price_cents: 4999,
    subscription_required: false,
    location: 'Los Angeles, CA',
    status: 'upcoming',
  },
  {
    title: 'Volkanovski - Featherweight Thriller',
    description: 'Champion defends against a hungry challenger',
    event_type: 'MMA',
    featured_image: 'https://images.unsplash.com/photo-1518611505868-d2b4f0ff69d5?w=800&h=500&fit=crop',
    start_time: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price_cents: 6999,
    subscription_required: false,
    location: 'Sydney, Australia',
    status: 'upcoming',
  },
  {
    title: 'Oliveira vs Topuria - Lightweight Title',
    description: 'Brazilian legend battles the rising star',
    event_type: 'MMA',
    featured_image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=500&fit=crop',
    start_time: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price_cents: 6499,
    subscription_required: false,
    location: 'Rio de Janeiro, Brazil',
    status: 'upcoming',
  },
  {
    title: 'Aspinall vs Blaydes - Heavyweight Title',
    description: 'Two titans collide in the heavyweight division',
    event_type: 'MMA',
    featured_image: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=800&h=500&fit=crop',
    start_time: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price_cents: 6999,
    subscription_required: false,
    location: 'Manchester, UK',
    status: 'upcoming',
  },
  {
    title: 'Superbon vs Top Contender',
    description: 'Explosive striking action at its finest',
    event_type: 'K-1',
    featured_image: 'https://images.unsplash.com/photo-1549719386-74dfaf00b721?w=800&h=500&fit=crop',
    start_time: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price_cents: 4499,
    subscription_required: false,
    location: 'Bangkok, Thailand',
    status: 'upcoming',
  },
  {
    title: 'Rodtang - Flyweight Legend',
    description: 'The King of the Ring returns',
    event_type: 'K-1',
    featured_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop',
    start_time: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price_cents: 4999,
    subscription_required: false,
    location: 'Bangkok, Thailand',
    status: 'upcoming',
  },
  // Past event for replays
  {
    title: 'Historic Championship Replay',
    description: 'One of the greatest fights of all time',
    event_type: 'BOXING',
    featured_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop',
    start_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    ticket_price_cents: 0,
    subscription_required: true,
    location: 'New York, NY',
    status: 'completed',
  },
]

async function insertEvents() {
  console.log('🚀 Starting demo data population...\n')

  for (const event of DEMO_EVENTS) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify(event),
      })

      if (response.ok) {
        console.log(`✅ Created: ${event.title}`)
      } else {
        const error = await response.json()
        console.error(`❌ Failed: ${event.title}`)
        console.error(`   Error: ${error.message || JSON.stringify(error)}`)
      }
    } catch (err) {
      console.error(`❌ Error creating ${event.title}: ${err.message}`)
    }
  }

  console.log('\n✨ Demo data population complete!')
  console.log('🎬 Visit http://localhost:3000 to see the events')
}

insertEvents()
