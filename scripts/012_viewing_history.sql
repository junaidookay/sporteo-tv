-- Create viewing_history table to track which events users have watched
CREATE TABLE IF NOT EXISTS public.viewing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_watched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  watch_count INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_viewing_history_user_id ON public.viewing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_viewing_history_event_id ON public.viewing_history(event_id);
CREATE INDEX IF NOT EXISTS idx_viewing_history_last_watched ON public.viewing_history(last_watched DESC);

-- Enable RLS
ALTER TABLE public.viewing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own viewing history
CREATE POLICY "Users can view their own history" ON public.viewing_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own history
CREATE POLICY "Users can create their own history" ON public.viewing_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own history
CREATE POLICY "Users can update their own history" ON public.viewing_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_viewing_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER viewing_history_updated_at BEFORE UPDATE ON public.viewing_history
FOR EACH ROW
EXECUTE FUNCTION update_viewing_history_updated_at();
