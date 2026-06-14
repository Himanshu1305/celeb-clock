-- Promo codes system

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  grants_premium BOOLEAN DEFAULT true,
  max_uses INTEGER DEFAULT 100,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.promo_code_redemptions (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(code, user_id)
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read promo codes"
  ON public.promo_codes FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can redeem"
  ON public.promo_code_redemptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can see their redemptions"
  ON public.promo_code_redemptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
