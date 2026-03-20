-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  plan_type VARCHAR(50) NOT NULL DEFAULT 'monthly',
  price_cents INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update_own" ON public.subscriptions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
