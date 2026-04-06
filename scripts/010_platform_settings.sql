-- Create platform_settings table for storing admin configuration
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  value_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all authenticated users to read settings
CREATE POLICY "Read platform settings" ON platform_settings
  FOR SELECT USING (true);

-- Allow only admins to update settings
CREATE POLICY "Update platform settings" ON platform_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Allow only admins to insert settings
CREATE POLICY "Insert platform settings" ON platform_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create indexes for performance
CREATE INDEX idx_platform_settings_key ON platform_settings(key);

-- Insert default settings
INSERT INTO platform_settings (key, value, value_type, description) VALUES
('platform_name', 'Sporteo.tv', 'string', 'Platform name displayed throughout the app'),
('platform_email', 'support@sporteo.tv', 'string', 'Support email address'),
('default_ppv_price', '4999', 'number', 'Default PPV price in cents'),
('monthly_sub_price', '999', 'number', 'Monthly subscription price in cents'),
('yearly_sub_price', '9999', 'number', 'Yearly subscription price in cents'),
('max_concurrent_streams', '4', 'number', 'Maximum concurrent streams per user'),
('allow_ppv', 'true', 'boolean', 'Enable PPV purchases'),
('allow_subscriptions', 'true', 'boolean', 'Enable subscription plans'),
('maintenance_mode', 'false', 'boolean', 'Put platform in maintenance mode'),
('stripe_mode', 'test', 'string', 'Stripe mode: test or live'),
('stripe_test_publishable_key', '', 'string', 'Stripe test mode publishable key'),
('stripe_test_secret_key', '', 'string', 'Stripe test mode secret key'),
('stripe_test_webhook_secret', '', 'string', 'Stripe test mode webhook secret'),
('stripe_live_publishable_key', '', 'string', 'Stripe live mode publishable key'),
('stripe_live_secret_key', '', 'string', 'Stripe live mode secret key'),
('stripe_live_webhook_secret', '', 'string', 'Stripe live mode webhook secret'),
('bunny_api_key', '', 'string', 'Bunny.net API key'),
('bunny_cdn_hostname', '', 'string', 'Bunny.net CDN hostname')
ON CONFLICT (key) DO NOTHING;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_platform_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER platform_settings_updated_at
BEFORE UPDATE ON platform_settings
FOR EACH ROW
EXECUTE FUNCTION update_platform_settings_timestamp();
