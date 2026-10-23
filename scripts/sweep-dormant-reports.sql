-- Dormancy sweep: delete UNPAID birthday_reports not viewed in 12 months.
-- Paid reports have permanent access (founder decision, Oct 2026) and are NEVER
-- swept — they are removed only with the account or on request.
-- Run manually (no scheduler). Review the SELECT before running the DELETE.
--
-- DRY RUN — inspect before deleting:
SELECT id, slug, recipient_name, last_viewed_at
FROM birthday_reports
WHERE last_viewed_at < now() - interval '12 months'
  AND coalesce(is_paid, false) = false;

-- EXECUTE — run only after reviewing the dry-run output above:
DELETE FROM birthday_reports
WHERE last_viewed_at < now() - interval '12 months'
  AND coalesce(is_paid, false) = false;
