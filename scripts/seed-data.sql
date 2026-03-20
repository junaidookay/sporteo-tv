-- PrimeFight PPV Platform - Seed Data
-- This adds demo events and data for testing

-- Note: Replace these UUIDs with actual user IDs from your Supabase auth.users table
-- You can get your user ID from: SELECT id FROM auth.users LIMIT 1

-- Insert demo events (you may need to adjust the created_by UUID)
-- First, get a demo user or create one, then use that ID below

-- For now, we'll use a placeholder UUID that you should replace with a real user ID
INSERT INTO public.events (
  id,
  title,
  description,
  featured_image,
  event_type,
  start_time,
  end_time,
  location,
  status,
  ticket_price_cents,
  subscription_required,
  created_by
) VALUES
  (
    gen_random_uuid(),
    'Tyson Fury vs Anthony Joshua Championship',
    'The heavyweight championship bout of the century. Two of the greatest heavyweight fighters face off in this epic clash.',
    'https://images.unsplash.com/photo-1566232236a42e9fb8f4d5bfb1d8f4e5?w=800',
    'boxing',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days 2 hours',
    'Madison Square Garden, New York',
    'scheduled',
    9999,
    FALSE,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    gen_random_uuid(),
    'UFC Championship Fight Night',
    'The ultimate fighting championship. Watch the best mixed martial artists compete for glory.',
    'https://images.unsplash.com/photo-1566232236a42e9fb8f4d5bfb1d8f4e5?w=800',
    'mma',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days 3 hours',
    'T-Mobile Arena, Las Vegas',
    'scheduled',
    7999,
    FALSE,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    gen_random_uuid(),
    'K-1 World Grand Prix',
    'The prestigious kickboxing tournament featuring the world''s top heavyweight fighters.',
    'https://images.unsplash.com/photo-1566232236a42e9fb8f4d5bfb1d8f4e5?w=800',
    'k1',
    NOW() + INTERVAL '21 days',
    NOW() + INTERVAL '21 days 4 hours',
    'Tokyo Dome, Japan',
    'scheduled',
    5999,
    TRUE,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    gen_random_uuid(),
    'Canelo Alvarez vs Gennady Golovkin Trilogy',
    'The trilogy fight between two of boxing''s greatest pound-for-pound fighters.',
    'https://images.unsplash.com/photo-1566232236a42e9fb8f4d5bfb1d8f4e5?w=800',
    'boxing',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days 2 hours',
    'Crypto.com Arena, Los Angeles',
    'scheduled',
    8999,
    FALSE,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    gen_random_uuid(),
    'Women''s Boxing Championship Bout',
    'Two incredible female fighters compete for the world championship title.',
    'https://images.unsplash.com/photo-1566232236a42e9fb8f4d5bfb1d8f4e5?w=800',
    'boxing',
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '10 days 2 hours',
    'Barclays Center, Brooklyn',
    'scheduled',
    4999,
    TRUE,
    (SELECT id FROM auth.users LIMIT 1)
  );

-- Insert demo replays
INSERT INTO public.replays (
  id,
  event_id,
  bunny_video_id,
  title,
  description,
  duration_seconds,
  thumbnail_url,
  hls_url,
  status
) VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM events WHERE title = 'Tyson Fury vs Anthony Joshua Championship' LIMIT 1),
    'demo-video-1',
    'Tyson Fury vs Anthony Joshua Championship - Full Fight Replay',
    'Watch the complete championship bout between Tyson Fury and Anthony Joshua.',
    7200,
    'https://images.unsplash.com/photo-1566232236a42e9fb8f4d5bfb1d8f4e5?w=400',
    'https://media-us.bunnycdn.com/videos/demo.m3u8',
    'completed'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM events WHERE title = 'UFC Championship Fight Night' LIMIT 1),
    'demo-video-2',
    'UFC Championship Fight Night - Full Event Replay',
    'Watch the complete UFC championship event with all the action.',
    10800,
    'https://images.unsplash.com/photo-1566232236a42e9fb8f4d5bfb1d8f4e5?w=400',
    'https://media-us.bunnycdn.com/videos/demo.m3u8',
    'completed'
  );
