-- Add Cloudflare Stream fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS cloudflare_live_input_id TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cloudflare_stream_id TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_events_cloudflare_live_input_id ON events(cloudflare_live_input_id);
CREATE INDEX IF NOT EXISTS idx_events_is_live ON events(is_live);