-- PrimeFight PPV Platform - Complete Database Setup
-- Run this in Supabase SQL Editor

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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (TRUE);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  featured_image TEXT,
  event_type VARCHAR(50) NOT NULL DEFAULT 'boxing',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  ticket_price_cents INTEGER,
  subscription_required BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bunny_stream_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select_all" ON public.events;
DROP POLICY IF EXISTS "events_insert_admin" ON public.events;
DROP POLICY IF EXISTS "events_update_own" ON public.events;
DROP POLICY IF EXISTS "events_delete_own" ON public.events;

CREATE POLICY "events_select_all" ON public.events FOR SELECT USING (TRUE);
CREATE POLICY "events_insert_admin" ON public.events FOR INSERT 
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "events_update_own" ON public.events FOR UPDATE 
  USING (auth.uid() = created_by);
CREATE POLICY "events_delete_own" ON public.events FOR DELETE 
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_type VARCHAR(50) NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  status VARCHAR(50) DEFAULT 'completed',
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "purchases_select_own" ON public.purchases;
DROP POLICY IF EXISTS "purchases_insert_own" ON public.purchases;

CREATE POLICY "purchases_select_own" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "purchases_insert_own" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_event_id ON public.purchases(event_id);

-- Create streams table
CREATE TABLE IF NOT EXISTS public.streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
  bunny_rtmp_url TEXT,
  bunny_stream_key TEXT,
  status VARCHAR(50) DEFAULT 'idle',
  live_url TEXT,
  hls_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "streams_select_all" ON public.streams;

CREATE POLICY "streams_select_all" ON public.streams FOR SELECT USING (TRUE);

CREATE INDEX IF NOT EXISTS idx_streams_event_id ON public.streams(event_id);

-- Create replays table
CREATE TABLE IF NOT EXISTS public.replays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  bunny_video_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER,
  thumbnail_url TEXT,
  hls_url TEXT,
  status VARCHAR(50) DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

ALTER TABLE public.replays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "replays_select_all" ON public.replays;

CREATE POLICY "replays_select_all" ON public.replays FOR SELECT USING (TRUE);

CREATE INDEX IF NOT EXISTS idx_replays_event_id ON public.replays(event_id);

-- Create trigger function for handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at on all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchases_updated_at ON public.purchases;
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_streams_updated_at ON public.streams;
CREATE TRIGGER update_streams_updated_at
  BEFORE UPDATE ON public.streams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_replays_updated_at ON public.replays;
CREATE TRIGGER update_replays_updated_at
  BEFORE UPDATE ON public.replays
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
