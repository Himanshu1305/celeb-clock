-- Add subscription tracking fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT
  DEFAULT 'none',
ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ
  DEFAULT NOW();

COMMENT ON COLUMN public.profiles.subscription_id
  IS 'Razorpay subscription ID';
COMMENT ON COLUMN public.profiles.subscription_plan
  IS 'Razorpay plan ID';
COMMENT ON COLUMN public.profiles.subscription_status
  IS 'none|active|cancelled|completed|expired';
COMMENT ON COLUMN public.profiles.premium_until
  IS 'When current premium period ends';
