-- Stream Sessions Table - Track active streams per user (one device limit)
CREATE TABLE IF NOT EXISTS stream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS stream_sessions_user_id_idx ON stream_sessions(user_id);
CREATE INDEX IF NOT EXISTS stream_sessions_event_id_idx ON stream_sessions(event_id);
CREATE INDEX IF NOT EXISTS stream_sessions_token_idx ON stream_sessions(session_token);
CREATE INDEX IF NOT EXISTS stream_sessions_active_idx ON stream_sessions(user_id, is_active);

-- Enable RLS
ALTER TABLE stream_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own stream sessions" ON stream_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own stream sessions" ON stream_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stream sessions" ON stream_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stream sessions" ON stream_sessions FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_stream_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stream_sessions_updated_at_trigger ON stream_sessions;
CREATE TRIGGER stream_sessions_updated_at_trigger
BEFORE UPDATE ON stream_sessions
FOR EACH ROW
EXECUTE FUNCTION update_stream_sessions_updated_at();
