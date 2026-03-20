-- Create streams table
CREATE TABLE IF NOT EXISTS public.streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  bunny_rtmp_url TEXT,
  bunny_stream_key TEXT,
  status VARCHAR(50) DEFAULT 'offline',
  viewer_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "streams_select_all" ON public.streams FOR SELECT USING (TRUE);

-- Create stream_access table
CREATE TABLE IF NOT EXISTS public.stream_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  access_type VARCHAR(50) NOT NULL DEFAULT 'purchased',
  access_token TEXT UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  UNIQUE(user_id, event_id)
);

ALTER TABLE public.stream_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stream_access_select_own" ON public.stream_access FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "stream_access_insert_own" ON public.stream_access FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_stream_access_user_id ON public.stream_access(user_id);
CREATE INDEX idx_stream_access_event_id ON public.stream_access(event_id);
CREATE INDEX idx_stream_access_token ON public.stream_access(access_token);
