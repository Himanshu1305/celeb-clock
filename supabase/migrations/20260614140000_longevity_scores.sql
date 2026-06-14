CREATE TABLE IF NOT EXISTS public.longevity_scores (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  forecast DECIMAL(5,1),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  week_start DATE NOT NULL DEFAULT DATE_TRUNC('week', CURRENT_DATE)::DATE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_longevity_scores_user_week
  ON public.longevity_scores(user_id, week_start);

CREATE INDEX IF NOT EXISTS idx_longevity_scores_user
  ON public.longevity_scores(user_id);

ALTER TABLE public.longevity_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scores"
  ON public.longevity_scores FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own scores"
  ON public.longevity_scores FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own scores"
  ON public.longevity_scores FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
