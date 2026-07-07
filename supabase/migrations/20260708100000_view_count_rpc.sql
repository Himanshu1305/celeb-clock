-- RPC to safely increment birthday_reports.view_count.
-- SECURITY DEFINER runs as the function owner (postgres), bypassing RLS.
-- The function is intentionally narrow: it only increments view_count on the
-- matching row — no other columns are touched and no data is returned.
-- Callers cannot escalate privilege through this function.

CREATE OR REPLACE FUNCTION increment_report_view_count(report_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE birthday_reports
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = report_id;
END;
$$;

-- Restrict direct EXECUTE to authenticated and anon roles only
-- (service_role already has full access via bypass RLS)
REVOKE EXECUTE ON FUNCTION increment_report_view_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_report_view_count(uuid) TO authenticated, anon;
