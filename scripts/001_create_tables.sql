-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  is_streamer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  featured_image TEXT,
  event_type VARCHAR(50) NOT NULL DEFAULT 'boxing', -- 'boxing', 'mma', 'k1'
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed', 'cancelled'
  ticket_price_cents INTEGER,
  subscription_required BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bunny_stream_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  plan_type VARCHAR(50) NOT NULL DEFAULT 'monthly', -- 'monthly', 'annual'
  price_cents INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'paused', 'cancelled'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create purchases table (for PPV events)
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  stripe_charge_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'completed', -- 'completed', 'failed', 'refunded'
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create streams table (for live streaming)
CREATE TABLE IF NOT EXISTS public.streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  bunny_rtmp_url TEXT,
  bunny_stream_key TEXT,
  status VARCHAR(50) DEFAULT 'offline', -- 'offline', 'live', 'ended'
  viewer_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create stream_access table (for tracking who can access what)
CREATE TABLE IF NOT EXISTS public.stream_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  access_type VARCHAR(50) NOT NULL DEFAULT 'purchased', -- 'purchased', 'subscription', 'admin'
  access_token TEXT UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  UNIQUE(user_id, event_id)
);

-- Create video_replays table
CREATE TABLE IF NOT EXISTS public.video_replays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  bunny_video_id TEXT UNIQUE,
  duration_seconds INTEGER,
  status VARCHAR(50) DEFAULT 'processing', -- 'processing', 'available', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  total_viewers INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  subscription_count INTEGER DEFAULT 0,
  ppv_purchases INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_replays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (TRUE);

-- Events policies
CREATE POLICY "events_select_all" ON public.events FOR SELECT USING (TRUE);
CREATE POLICY "events_insert_admin" ON public.events FOR INSERT WITH CHECK (auth.uid() = created_by AND (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = TRUE);
CREATE POLICY "events_update_admin" ON public.events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "events_delete_admin" ON public.events FOR DELETE USING (auth.uid() = created_by);

-- Subscriptions policies
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update_own" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Purchases policies
CREATE POLICY "purchases_select_own" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "purchases_insert_own" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Streams policies
CREATE POLICY "streams_select_all" ON public.streams FOR SELECT USING (TRUE);

-- Stream_access policies
CREATE POLICY "stream_access_select_own" ON public.stream_access FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "stream_access_insert_own" ON public.stream_access FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Video_replays policies
CREATE POLICY "video_replays_select_all" ON public.video_replays FOR SELECT USING (TRUE);

-- Analytics policies
CREATE POLICY "analytics_select_own" ON public.analytics FOR SELECT USING (
  (SELECT created_by FROM public.events WHERE id = analytics.event_id) = auth.uid()
);

-- Create indexes for performance
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_event_id ON public.purchases(event_id);
CREATE INDEX idx_purchases_stripe_charge_id ON public.purchases(stripe_charge_id);
CREATE INDEX idx_stream_access_user_id ON public.stream_access(user_id);
CREATE INDEX idx_stream_access_event_id ON public.stream_access(event_id);
CREATE INDEX idx_stream_access_token ON public.stream_access(access_token);
CREATE INDEX idx_video_replays_event_id ON public.video_replays(event_id);
CREATE INDEX idx_analytics_event_id ON public.analytics(event_id);
