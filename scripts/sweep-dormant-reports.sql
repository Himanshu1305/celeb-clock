-- Dormancy sweep: delete birthday_reports not viewed in 12 months.
-- Per privacy policy (Amendment 5): reports unviewed for 12 months are removed.
-- Run manually (no scheduler). Review the SELECT before running the DELETE.
--
-- DRY RUN — inspect before deleting:
SELECT id, slug, recipient_name, last_viewed_at
FROM birthday_reports
WHERE last_viewed_at < now() - interval '12 months';

-- EXECUTE — run only after reviewing the dry-run output above:
DELETE FROM birthday_reports
WHERE last_viewed_at < now() - interval '12 months';
