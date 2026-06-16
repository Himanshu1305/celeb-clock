CREATE TABLE IF NOT EXISTS public.birthday_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  slug TEXT NOT NULL UNIQUE,
  recipient_name TEXT NOT NULL,
  recipient_dob DATE NOT NULL,
  gifter_name TEXT,
  personal_message TEXT,
  country TEXT DEFAULT 'India',
  gender TEXT DEFAULT '',
  report_data JSONB NOT NULL DEFAULT '{}',
  is_premium_report BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  view_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_birthday_reports_slug ON public.birthday_reports(slug);
CREATE INDEX IF NOT EXISTS idx_birthday_reports_user ON public.birthday_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_birthday_reports_expires ON public.birthday_reports(expires_at);

ALTER TABLE public.birthday_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reports by slug"
  ON public.birthday_reports FOR SELECT TO public
  USING (expires_at > NOW());

CREATE POLICY "Users can insert own reports"
  ON public.birthday_reports FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own reports"
  ON public.birthday_reports FOR SELECT TO authenticated
  USING (user_id = auth.uid());
