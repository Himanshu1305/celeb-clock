CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  forecast DECIMAL(5,1) NOT NULL,
  country TEXT,
  age_group TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  opted_in_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_country
  ON public.leaderboard_entries(country);
CREATE INDEX IF NOT EXISTS idx_leaderboard_forecast
  ON public.leaderboard_entries(forecast DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_age_group
  ON public.leaderboard_entries(age_group);

ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboard"
  ON public.leaderboard_entries FOR SELECT TO public
  USING (true);

CREATE POLICY "Users can insert own entry"
  ON public.leaderboard_entries FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own entry"
  ON public.leaderboard_entries FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own entry"
  ON public.leaderboard_entries FOR DELETE TO authenticated
  USING (user_id = auth.uid());
