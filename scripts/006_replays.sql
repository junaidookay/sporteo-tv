-- Create video_replays table
CREATE TABLE IF NOT EXISTS public.video_replays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  bunny_video_id TEXT UNIQUE,
  duration_seconds INTEGER,
  status VARCHAR(50) DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

ALTER TABLE public.video_replays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "video_replays_select_all" ON public.video_replays FOR SELECT USING (TRUE);

CREATE INDEX idx_video_replays_event_id ON public.video_replays(event_id);

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

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_select_own" ON public.analytics FOR SELECT 
  USING ((SELECT created_by FROM public.events WHERE id = analytics.event_id) = auth.uid());

CREATE INDEX idx_analytics_event_id ON public.analytics(event_id);
