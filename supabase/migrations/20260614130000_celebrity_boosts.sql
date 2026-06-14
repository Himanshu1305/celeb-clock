CREATE TABLE IF NOT EXISTS public.celebrity_boosts (
  id SERIAL PRIMARY KEY,
  celebrity_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  boosted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_celebrity_boosts_name
  ON public.celebrity_boosts(celebrity_name);

ALTER TABLE public.celebrity_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read boosts"
  ON public.celebrity_boosts FOR SELECT TO public
  USING (true);

CREATE POLICY "Authenticated users can boost"
  ON public.celebrity_boosts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anonymous can boost with session"
  ON public.celebrity_boosts FOR INSERT TO anon
  WITH CHECK (session_id IS NOT NULL);
