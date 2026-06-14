-- PDF reports quota tracking log
CREATE TABLE IF NOT EXISTS pdf_reports_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_type text NOT NULL DEFAULT 'birthday',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE pdf_reports_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own reports"
  ON pdf_reports_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own reports"
  ON pdf_reports_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
