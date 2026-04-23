-- Add Cloudflare Stream fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS cloudflare_live_input_id TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cloudflare_stream_id TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cloudflare_stream_key TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cloudflare_rtmps_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cloudflare_customer_subdomain TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cloudflare_rtmps_playback_key TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_publicly_live BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS live_started_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_events_cloudflare_live_input_id ON events(cloudflare_live_input_id);
CREATE INDEX IF NOT EXISTS idx_events_is_live ON events(is_live);