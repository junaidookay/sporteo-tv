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

CREATE POLICY "events_select_all" ON public.events FOR SELECT USING (TRUE);
CREATE POLICY "events_insert_admin" ON public.events FOR INSERT 
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "events_update_own" ON public.events FOR UPDATE 
  USING (auth.uid() = created_by);
CREATE POLICY "events_delete_own" ON public.events FOR DELETE 
  USING (auth.uid() = created_by);

CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_time ON public.events(start_time);
