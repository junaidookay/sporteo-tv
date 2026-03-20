-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  stripe_charge_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchases_select_own" ON public.purchases FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "purchases_insert_own" ON public.purchases FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_event_id ON public.purchases(event_id);
CREATE INDEX idx_purchases_stripe_charge_id ON public.purchases(stripe_charge_id);
